import { PropertySnapshot, UserQuery } from "@src/types/sql.js";
import { make_scrape_config, scrape, ScrapeResult } from "./scrapfly.js";
import { LogBatcher } from "../logging.js";
import { get_all_user_property_queries, get_properties_matching_query, get_user_property_queries_by_location, insert_property_snapshots, mark_properties_as_seen } from "../data/sql.js";
import moment from "moment-timezone";
import { ChatbotSettings } from "@src/types/settings.js";
import { sendLocation, sendMessage } from "../telegram.js";
import { Zoopla } from "./zoopla.js";
import { PropertyData } from "./property_source.js";


const zoopla = new Zoopla()


export function merge_queries(acc: UserQuery, q: UserQuery): UserQuery {
    if (q.min_bedrooms < acc.min_bedrooms) acc.min_bedrooms = q.min_bedrooms
    if (q.max_bedrooms > acc.max_bedrooms) acc.max_bedrooms = q.max_bedrooms
    if (q.min_price < acc.min_price) acc.min_price = q.min_price
    if (q.max_price > acc.max_price) acc.max_price = q.max_price
    if (q.available_from < acc.available_from) acc.available_from = q.available_from
    if (q.query != acc.query) acc.query = acc.location
    return acc
}

export async function send_all_property_alerts(settings: ChatbotSettings) {
    let queries = await get_all_user_property_queries(settings.db)
    for (let query of queries) {
        let properties = await get_properties_matching_query(settings.db, query, false)
        const max_properties = 10
        if (properties.length) {
            await sendMessage({
                api_key: settings.telegram_api_key,
                open_ai_key: settings.openai_api_key,
                payload: {
                    chat_id: query.chat_id,
                    text: `Found ${properties.length} new properties matching your query. Showing the first ${max_properties}`
                },
                delay: 0,
                audio_chance: 0,
            })
        }

        if (properties.length > max_properties) {
            properties = properties.slice(0, max_properties)
        }

        for (let property of properties) {
            let msg = `${property.address} - ${property.price_per_month} - ${property.summary_description} - ${property.url}`
            await sendMessage({
                api_key: settings.telegram_api_key,
                open_ai_key: settings.openai_api_key,
                payload: {
                    chat_id: query.chat_id,
                    text: msg
                },
                delay: 0,
                audio_chance: 0,
            })
            await sendLocation(settings.telegram_api_key, query.chat_id, property.latitude, property.longitude)
            await mark_properties_as_seen(settings.db, [property.property_id])
        }
    }
}

export async function scrape_all_queries(settings: ChatbotSettings) {
    let queries = await get_all_user_property_queries(settings.db);
    let query_by_location = new Map<string, UserQuery>()
    for (let query of queries) {
        if (!query_by_location.has(query.location)) {
            query_by_location.set(query.location, query)
        } else {
            query_by_location.set(query.location, merge_queries(query_by_location.get(query.location)!, query))
        }
    }

    for (const [location, query] of query_by_location.entries()) {
        console.log("Scraping location", location)
        await zoopla.scrape(query, settings)
    }
}



export async function process_scrape_result(request: ScrapeResult, settings: ChatbotSettings) {
    if (!request.result.success) {
        console.error("Scrape failed", request.result.error, request.result.url)
        if (request.result.error?.retryable) {
            console.log("Retrying")

            let config = make_scrape_config(request.result.url, request.context.session?.name, undefined, settings);
            await scrape({
                apiKey: settings.scrapfly_api_key,
                payload: config
            })
        }
        return
    }
    let url = request.result.url;
    let params = new URLSearchParams(url.split("?")[1]);
    if (params.size === 0) {
        console.log("processed initial scrape for session:", request.context.session?.name)
        return
    }

    // find query by parameters
    // location is part of the url
    let location = url.split("property/")[1].split("/")[0];
    let content = request.result.content;
    let flightData = parseFlightData(content);
    let snapshots = flightData.map((propertyData) => {
        try {
            return convertPropertyData(propertyData, location)
        } catch (e) {
            console.error("Failed to convert property data", e, typeof e, "from", propertyData)
            return null
        }
    }).filter((snapshot) => snapshot !== null);

    console.log("Saving", snapshots.length, "properties to db under location", location)
    await insert_property_snapshots(settings.db, snapshots)

}



function unescape(line: string): string {
    return line.replace(/\\"/g, '"').replace(/\\n/g, "\n");
}

function extractKeyValue(line: string): [string, string] {
    const split = line.split(':');
    const key = split[0].trim();
    const values = split.slice(1).join(':').trim();
    return [key, values];
}

function parseFlightJsonValue(string: string): any {
    try {
        return JSON.parse(string);
    } catch {
        return null;
    }
}

function* iterateFlightData(html: string): Generator<[string, string]> {
    const flightData = html.matchAll(/self.__next_f.push\(\[1,.?"(.*?)"\]\)/g) || [];
    const fullFlightData = Array.from(flightData).map((m) => unescape(m[1])).join('\n');
    const lines = fullFlightData.split('\n');
    console.log("flight data lines count", lines.length)
    for (const data of lines) {
        const [key, val] = extractKeyValue(data);
        yield [key, val];
    }
}

interface State {
    replacements: number
}


function recursive_replace_lookup_string(full_data: any, current_data: any, lookup_key_prefix: string = '$', state: State): any {
    if (current_data === null || current_data === undefined) {
        return current_data
    }

    if (typeof current_data === 'string' && current_data.startsWith(lookup_key_prefix)) {
        state.replacements++;
        const lookup_key = current_data.slice(1);
        return full_data[lookup_key];
    }

    if (Array.isArray(current_data)) {
        return current_data.map((item) => recursive_replace_lookup_string(full_data, item, lookup_key_prefix, state));
    }
    if (typeof current_data === 'object') {
        const new_data: any = {};
        for (const [key, val] of Object.entries(current_data)) {
            new_data[key] = recursive_replace_lookup_string(full_data, val, lookup_key_prefix, state);
        }
        return new_data;
    }
    return current_data;
}

function inlineFlightDataReferences(flightData: any) {
    // recursively walk lists dictionaries and replace references like "$72" with the actual value from the flight data dict
    let state = {
        replacements: 999
    }
    let new_data = flightData;
    while (state.replacements > 0) {
        console.log(state.replacements)
        state.replacements = 0;
        new_data = recursive_replace_lookup_string(new_data, new_data, '$', state);
    }
    return new_data
}

function findPropertyData(flightData: any): PropertyData[] {
    const propertyData: PropertyData[] = [];
    for (const key in flightData) {
        if (typeof flightData[key] === "object" && flightData[key].listingId !== undefined && flightData[key].propertyType !== undefined) {
            propertyData.push(flightData[key]);
        }
    }
    return propertyData;
}

export function parseFlightData(html: string): PropertyData[] {
    const data: any = {};
    for (const [key, val] of iterateFlightData(html)) {
        const jsonValue = parseFlightJsonValue(val);
        if (jsonValue) {
            data[key] = jsonValue;
        }
    }
    const inlined = inlineFlightDataReferences(data);
    return findPropertyData(inlined);
}


