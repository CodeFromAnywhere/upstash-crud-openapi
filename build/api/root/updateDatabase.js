import { Redis } from "@upstash/redis";
import { getUpstashRedisDatabase } from "../../src/upstashRedis";
import { tryParseJson } from "from-anywhere";
export const updateDatabase = async (context) => {
    const { databaseSlug, schemaString, authToken, X_ADMIN_AUTH_TOKEN } = context;
    // comes from headers or .env
    const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
    const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
    const rootUpstashDatabaseId = process.env["X_UPSTASH_ROOT_DATABASE_ID"];
    if (!rootUpstashApiKey || !rootUpstashEmail || !rootUpstashDatabaseId) {
        return {
            isSuccessful: false,
            message: "Please provide your upstash details environment variables",
        };
    }
    const rootDatabaseDetails = await getUpstashRedisDatabase({
        upstashEmail: rootUpstashEmail,
        databaseId: rootUpstashDatabaseId,
        upstashApiKey: rootUpstashApiKey,
    });
    if (!rootDatabaseDetails) {
        return {
            isSuccessful: false,
            message: "Couldn't get root database details",
        };
    }
    // now we have root-db
    const root = new Redis({
        url: `https://${rootDatabaseDetails.endpoint}`,
        token: rootDatabaseDetails.rest_token,
    });
    let databaseDetails = await root.get(databaseSlug);
    if (!databaseDetails ||
        !databaseDetails.adminAuthToken ||
        databaseDetails.adminAuthToken !== X_ADMIN_AUTH_TOKEN) {
        return {
            isSuccessful: false,
            message: "Unauthorized",
        };
    }
    const schema = tryParseJson(schemaString);
    if (!schema) {
        return { isSuccessful: false, message: "Invalid Schema" };
    }
    // re-set the database details
    await root.set(databaseSlug, { ...databaseDetails, authToken, schema });
    return {
        isSuccessful: true,
        message: "Database updated",
    };
};
//# sourceMappingURL=updateDatabase.js.map