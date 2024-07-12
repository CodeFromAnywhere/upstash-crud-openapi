import { DatabaseDetails } from "./types.js";
/** In order to go from databaseSlug to databaseId, we need a simple global KV for that */
export declare const getDatabaseDetails: (databaseSlug: string) => Promise<{
    isSuccessful: boolean;
    message: string;
    databaseDetails?: undefined;
} | {
    databaseDetails: DatabaseDetails | null;
    isSuccessful: boolean;
    message: string;
}>;
//# sourceMappingURL=getDatabaseDetails.d.ts.map