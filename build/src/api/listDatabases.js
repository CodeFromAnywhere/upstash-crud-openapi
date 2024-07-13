import { Redis } from "@upstash/redis";
import { getUpstashRedisDatabase } from "../upstashRedis.js";
import { notEmpty } from "from-anywhere";
export const listDatabases = async (context) => {
    const { Authorization } = context;
    const apiKey = Authorization?.slice("Bearer ".length);
    // auth admin
    const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
    const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
    const rootUpstashDatabaseId = process.env["X_UPSTASH_ROOT_DATABASE_ID"];
    if (!rootUpstashApiKey || !rootUpstashEmail || !rootUpstashDatabaseId) {
        return {
            isSuccessful: false,
            status: 400,
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
    const slugs = await root.smembers(`adminslugs_${apiKey}`);
    if (!slugs) {
        return { isSuccessful: false, message: "Unauthorized", status: 403 };
    }
    if (slugs.length < 1) {
        return { isSuccessful: true, message: "No dbs yet" };
    }
    const details = await root.mget(...slugs);
    const databases = details
        .map((x, index) => x
        ? {
            databaseSlug: slugs[index],
            openapiUrl: `https://data.actionschema.com/${slugs[index]}/openapi.json`,
            authToken: x.authToken,
            schema: JSON.stringify(x.schema),
        }
        : null)
        .filter(notEmpty);
    return { isSuccessful: true, message: "Found your dbs", databases };
};
//# sourceMappingURL=listDatabases.js.map