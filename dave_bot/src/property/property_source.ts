import { ChatbotSettings } from "@src/types/settings.js";
import { PropertySnapshot, UserQuery } from "@src/types/sql.js";

interface Branch {
    branchDetailsUri: string;
    branchId: number;
    logoUrl: string;
    name: string;
    phone: string;
}

interface Feature {
    content: number;
    iconId: string;
}

interface Image {
    src: string;
    caption: string | null;
    responsiveImgList: Array<{
        src: string;
        width: number;
    }>;
}

interface ListingUris {
    contact: string;
    detail: string;
    success: string;
}

interface Position {
    lat: number;
    lng: number;
}

interface Coordinates {
    isApproximate: boolean;
    latitude: number;
    longitude: number;
}


export interface PropertyData {
    address: string;
    alternativeRentFrequencyLabel: string;
    availableFrom: string;
    availableFromLabel: string;
    branch: Branch;
    displayType: string;
    featuredType: string | null;
    features?: (Feature | null | undefined)[];
    flag: string;
    gallery?: string[];
    highlights: any[]; // Adjust the type if you have a specific structure for highlights
    image?: Image | null;
    isFavourite: boolean;
    isPremium: boolean;
    lastPublishedDate: string;
    listingId: string;
    listingType: string;
    listingUris?: ListingUris;
    numberOfFloorPlans: number;
    numberOfImages: number;
    numberOfVideos: number;
    pos?: Position;
    price: string;
    priceDrop: string | null;
    priceTitle: string;
    propertyType: string;
    publishedOn: string;
    publishedOnLabel: string;
    shortPriceTitle: string;
    summaryDescription: string;
    tags: Array<{
        content: string;
    }>;
    title: string;
    transports: any[]; // Adjust the type if you have a specific structure for transports
    underOffer: boolean;
    location?: Coordinates;
}


export class PropertySource {


    async begin_session(key: string, search_id: number, settings: ChatbotSettings): Promise<void> {
        throw new Error("Method begin_sessions must be implemented");
    }

    async scrape(query: UserQuery, settings: ChatbotSettings): Promise<void> {
        throw new Error("Method scrape must be implemented");
    }

    convertPropertyData(propertyData: PropertyData, location: string): PropertySnapshot {
        throw new Error("Method convertPropertyData must be implemented");
    }



}