import { PropertySource } from "./property_source.js";



enum RecentlyAdded {
    ANY_TIME = "any-time",
    ONE_DAY = "24-hours",
    THREE_DAYS = "3-days",
    WEEK = "7-days"
}

enum Furnished {
    FURNISHED = "furnished",
    UNFURNISHED = "unfurnished",
    PART_FURNISHED = "part-furnished"
}

enum SortField {
    UPDATE_DATE = "update_date",
    PRICE = "price"
}

export interface OnTheMarketQuery {
    to_rent: string;
    area: string;
    beds_min?: number;
    beds_max?: number;
    price_min?: number;
    price_max?: number;
    radius?: number;
    recently_added: RecentlyAdded;
    shared?: boolean;
    student?: boolean;
    pet_friendly?: boolean;
    recently_reduced?: boolean;
    furnished?: Furnished;
    sort_field?: SortField;
    sort_direction?: string;
}

/*
https://www.onthemarket.com/to-rent/property/eh4-1dd/?max-bedrooms=6&max-price=2250&min-bedrooms=1&min-price=400&prop-types=detached&prop-types=semi-detached&radius=0.25&recently-added=24-hours&view=map-list


https://www.onthemarket.com
/to-rent
/property
/eh4-1dd
/?max-bedrooms=6
&max-price=2250
&min-bedrooms=1
&min-price=400
&radius=0.25
&recently-added=24-hours
&view=map-list


https://www.onthemarket.com/to-rent/property/city-of-edinburgh/?max-bedrooms=6&max-price=2250&min-bedrooms=1&min-price=400&polygons0=ehptItzpRfBpGjCxGhBdAjFbApE%3FhBs%40nKeI%60CqRjAoUB_JQeIo%40_FgAuE%7DBsDiBgBgJeEkAOkC%60%40%7BEfF%7BAlE%7D%40dIgAr%5EoCnQShG&prop-types=detached&prop-types=semi-detached&recently-added=24-hours&view=map-list
*/

class OnTheMarket extends PropertySource {


    private make_url(params: OnTheMarketQuery) {
        const otmUrlArgs = new URLSearchParams();

        const root_url = "https://www.onthemarket.com";

        if (params.beds_max) otmUrlArgs.set("max-bedrooms", params.beds_max.toString());
        if (params.beds_min) otmUrlArgs.set("min-bedrooms", params.beds_min.toString());
    
        otmUrlArgs.set("shared", params.shared?.toString() ?? "false");
        otmUrlArgs.set("student", params.student?.toString() ?? "false");
    
        if (params.price_max) otmUrlArgs.set("max_price", params.price_max.toString());
        if (params.price_min) otmUrlArgs.set("min_price", params.price_min.toString());
        if (params.radius) otmUrlArgs.set("radius", params.radius.toString());
        if (params.furnished) otmUrlArgs.set("furnished", params.furnished.toString());
        if (params.pet_friendly) otmUrlArgs.set("pet_friendly", params.pet_friendly.toString());
        if (params.recently_reduced) otmUrlArgs.set("recently_reduced", params.recently_reduced.toString());
        if (params.recently_added) otmUrlArgs.set("recently_added", params.recently_added.toString());
        if (params.sort_field) otmUrlArgs.set("sort_field", params.sort_field.toString());
        if (params.sort_field && params.sort_direction) otmUrlArgs.set("direction", params.sort_direction.toString());
    
        return  `${root_url}/${params.to_rent ?? 'to-rent'}/property/${params.area}/?${otmUrlArgs.toString()}`;
    }
    



}