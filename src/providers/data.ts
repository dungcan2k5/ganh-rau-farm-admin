import { dataProvider as supabaseDataProvider } from "@refinedev/supabase";
import { supabaseClient } from "./supabase-client";

const baseDataProvider = supabaseDataProvider(supabaseClient);

// Helper function to recursively traverse response and append "Z" to ISO datetime strings without timezone
function parseAndFixTimestamps(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) {
        return obj.map(parseAndFixTimestamps);
    }
    if (typeof obj === "object") {
        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = parseAndFixTimestamps(obj[key]);
            }
        }
        return newObj;
    }
    if (typeof obj === "string") {
        // Matches ISO date-time strings without timezone offsets (e.g., 2026-05-26T07:41:45 or 2026-05-26T07:41:45.123)
        const isoWithoutTimezoneRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
        if (isoWithoutTimezoneRegex.test(obj)) {
            return obj + "Z";
        }
    }
    return obj;
}

const tablesWithUpdatedAt = [
    "users",
    "categories",
    "products",
    "coupons",
    "orders",
    "order_items",
    "payments",
    "reviews",
    "cart_items"
];

export const dataProvider = {
    ...baseDataProvider,
    getList: async (params: any) => {
        const response = await baseDataProvider.getList(params);
        return parseAndFixTimestamps(response);
    },
    getMany: async (params: any) => {
        const response = await baseDataProvider.getMany(params);
        return parseAndFixTimestamps(response);
    },
    getOne: async (params: any) => {
        const response = await baseDataProvider.getOne(params);
        return parseAndFixTimestamps(response);
    },
    custom: async (params: any) => {
        const response = await baseDataProvider.custom?.(params);
        return parseAndFixTimestamps(response);
    },
    update: async ({ resource, id, variables, meta }: any) => {
        if (tablesWithUpdatedAt.includes(resource.toLowerCase())) {
            variables = {
                ...variables,
                updated_at: new Date().toISOString()
            };
        }
        const response = await baseDataProvider.update({ resource, id, variables, meta });
        return parseAndFixTimestamps(response);
    },
    updateMany: async ({ resource, ids, variables, meta }: any) => {
        if (tablesWithUpdatedAt.includes(resource.toLowerCase())) {
            variables = {
                ...variables,
                updated_at: new Date().toISOString()
            };
        }
        const response = await baseDataProvider.updateMany({ resource, ids, variables, meta });
        return parseAndFixTimestamps(response);
    },
    create: async (params: any) => {
        const response = await baseDataProvider.create(params);
        return parseAndFixTimestamps(response);
    },
    createMany: async (params: any) => {
        const response = await baseDataProvider.createMany?.(params);
        return parseAndFixTimestamps(response);
    }
};

