import { Redis } from "@upstash/redis";
import { DatabaseDetails } from "./types.js";
/**
Deletes an entire dbs and everything in it:

- root:db_{slug}
- root:project_{slug}.databaseSlugs:string[]
- database:db_{databaseSlug}_*

This does 4 API requests per database.
*/
export declare const removeEntireDatabase: (context: {
    root: Redis;
    databaseSlug: string;
    databaseDetails: DatabaseDetails | null;
}) => Promise<{
    isSuccessful: boolean;
    message: string;
} | undefined>;
//# sourceMappingURL=removeEntireDatabase.d.ts.map