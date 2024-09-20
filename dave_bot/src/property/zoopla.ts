
import { PropertySnapshot, UserQuery } from "@src/types/sql.js";
import { make_scrape_config, scrape, ScrapeResult } from "./scrapfly.js";
import { LogBatcher } from "../logging.js";
import { get_all_user_property_queries, get_properties_matching_query, get_user_property_queries_by_location, insert_property_snapshots, mark_properties_as_seen } from "../data/sql.js";
import moment from "moment-timezone";
import { ChatbotSettings } from "@src/types/settings.js";
import { sendLocation, sendMessage } from "../telegram.js";
import { PropertySource, PropertyData } from "./property_source.js";
import { parseDate } from "./utils.js"

export interface ZooplaQuery {
    location: string,
    beds_max?: number,
    beds_min?: number,
    price_frequency?: "per_month",
    price_max?: number,
    price_min?: number,
    q?: string,
    results_sort?: "newest_listings",
    search_source?: "to-rent",
    is_retirement_home?: boolean,
    is_shared_accommodation?: boolean,
    is_student_accommodation?: boolean
    pn?: number
}


export class Zoopla extends PropertySource {
    
    /**
     * Begins a session with Zoopla by visiting the Zoopla homepage and collecting cookies. returns scrapfly session id if successful or throws error
     */
    async begin_session(key: string, search_id: number, settings: ChatbotSettings): Promise<void> {
        const url = "https://www.zoopla.co.uk/";
        const session_id = search_id.toString();
        console.log("Starting session with id", session_id)
        const scrapeConfig = make_scrape_config(url, session_id, undefined, settings);
        scrapeConfig.wait_for_selector = undefined;
        console.log("Initiating scrape first scrape session", url)
        const response = await scrape({
            apiKey: key,
            payload: scrapeConfig
        })
    }
    
    private make_url(params: ZooplaQuery) {
        const zooplaUrlArgs = new URLSearchParams();
    
        if (params.beds_max) zooplaUrlArgs.set("beds_max", params.beds_max.toString());
        if (params.beds_min) zooplaUrlArgs.set("beds_min", params.beds_min.toString());
    
        zooplaUrlArgs.set("is_retirement_home", params.is_retirement_home?.toString() ?? "false");
        zooplaUrlArgs.set("is_shared_accommodation", params.is_shared_accommodation?.toString() ?? "false");
        zooplaUrlArgs.set("is_student_accommodation", params.is_student_accommodation?.toString() ?? "false");
    
        if (params.price_frequency) zooplaUrlArgs.set("price_frequency", params.price_frequency.toString());
        if (params.price_max) zooplaUrlArgs.set("price_max", params.price_max.toString());
        if (params.price_min) zooplaUrlArgs.set("price_min", params.price_min.toString());
        if (params.q) zooplaUrlArgs.set("q", params.q.toString());
        if (params.results_sort) zooplaUrlArgs.set("results_sort", params.results_sort.toString());
        if (params.search_source) zooplaUrlArgs.set("search_source", params.search_source.toString());
        if (params.pn) zooplaUrlArgs.set("pn", params.pn.toString());
    
        return `https://www.zoopla.co.uk/to-rent/property/${params.location}/?${zooplaUrlArgs.toString()}`;
    }
    
    async scrape(query: UserQuery, settings: ChatbotSettings): Promise<void> {
        // find searches from today
        // get session id from epoch time now
        // let session_id = moment().tz("Europe/London").unix()
    
        console.log("Starting scrape for query", query)
        // await begin_zoopla_session(settings.scrapfly_api_key, session_id, settings);
    
        let page_num = 1
        let zoopla_query: ZooplaQuery = {
            location: query.location,
            q: query.query,
            results_sort: "newest_listings",
            search_source: "to-rent",
            beds_min: query.min_bedrooms,
            beds_max: query.max_bedrooms,
            price_min: query.min_price,
            price_max: query.max_price,
            is_retirement_home: false,
            is_shared_accommodation: false,
            is_student_accommodation: false,
        }
        let last_url = "https://www.zoopla.co.uk"
        while (page_num <= 10) {
            zoopla_query.pn = page_num;
            let zoopla_url = this.make_url(zoopla_query);
            const config = make_scrape_config(zoopla_url, undefined, last_url, settings);
            last_url = zoopla_url;
            let retries = 3;
            while (retries > 0) {
                console.log("Initiating scraping of page:", page_num, "retries?:", retries)
                try {
                    await scrape({
                        apiKey: settings.scrapfly_api_key,
                        payload: config
                    });
                    break
                } catch (e) {
                    console.error("Failed to initiate scrape", e)
                    retries--;
                }
            }
            if (retries === 0) {
                console.error("Failed to scrape page", page_num)
                break
            }
        
            page_num++;
        }
    }
    
    
    convertPropertyData(propertyData: PropertyData, location: string): PropertySnapshot {
        const propertySnapshot: PropertySnapshot = {
            property_id: "zoopla:" + propertyData.listingId,
            location,
            url: `https://www.zoopla.co.uk/to-rent/details/${propertyData.listingId}`,
            address: propertyData.address,
            price_per_month: parseInt(propertyData.price.replace(/[^0-9]/g, "")),
            longitude: propertyData.pos?.lng ?? propertyData.location?.longitude ?? 0,
            latitude: propertyData.pos?.lat ?? propertyData.location?.latitude ?? 0,
            summary_description: propertyData.summaryDescription,
            num_bedrooms: propertyData.features?.filter(x => x).filter(x => x != null).find((feature) => feature.iconId === "bed")?.content ?? 1,
            comma_separated_images: propertyData.gallery?.join(",") ?? "",
            shown: false,
            published_on: parseDate(propertyData.publishedOn) ?? new Date(),
            available_from: parseDate(propertyData.availableFrom) ?? new Date()
        }
        return propertySnapshot
    }

}