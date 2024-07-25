import { Redis } from "@upstash/redis";
import { getUpstashRedisDatabase } from "../upstashRedis.js";
import { notEmpty } from "from-anywhere";
import { getProjectDetails } from "../getProjectDetails.js";
/** Lists databases for your current project */
export const listDatabases = async (context) => {
    const { Authorization } = context;
    const apiKey = Authorization?.slice("Bearer ".length);
    if (!apiKey || apiKey.length < 64) {
        return { isSuccessful: false, message: "Unauthorized", status: 403 };
    }
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
    const admin = await root.get(`admin_${apiKey}`);
    if (!admin) {
        return { isSuccessful: false, message: "Unauthorized", status: 403 };
    }
    const project = await getProjectDetails(admin.currentProjectSlug);
    if (!project.projectDetails) {
        return {
            isSuccessful: false,
            message: `Project not found: ${project.message}`,
            status: 404,
        };
    }
    const slugs = project.projectDetails.databaseSlugs;
    const details = await root.mget(...slugs.map((slug) => `db_${slug}`));
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
    return {
        isSuccessful: true,
        message: "Found your dbs",
        databases,
        currentProjectSlug: admin.currentProjectSlug,
    };
};
//# sourceMappingURL=listDatabases.js.map