import { Redis } from "@upstash/redis";
/** In order to go from databaseSlug to databaseId, we need a simple global KV for that */
export const getProjectDetails = async (projectSlug) => {
    //connect to root
    const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
    const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
    const rootUpstashDatabaseId = process.env["X_UPSTASH_ROOT_DATABASE_ID"];
    const rootUpstashEndpoint = process.env["X_UPSTASH_ENDPOINT"];
    const rootUpstashRestToken = process.env["X_UPSTASH_REST_TOKEN"];
    if (!rootUpstashApiKey ||
        !rootUpstashEmail ||
        !rootUpstashDatabaseId ||
        !rootUpstashEndpoint ||
        !rootUpstashRestToken) {
        return {
            isSuccessful: false,
            message: "Please provide your upstash details environment variables",
        };
    }
    const root = new Redis({
        url: `https://${rootUpstashEndpoint}`,
        token: rootUpstashRestToken,
    });
    const projectDetails = await root.get(`project_${projectSlug}`);
    if (!projectDetails) {
        return { isSuccessful: false, message: "Not found" };
    }
    // NB: just do a single query getting all details for all databases
    const details = await root.mget(...projectDetails.databaseSlugs.map((databaseSlug) => `db_${databaseSlug}`));
    const databases = projectDetails.databaseSlugs.map((databaseSlug, index) => ({
        databaseSlug,
        details: details[index],
    }));
    return {
        projectDetails,
        databases,
        isSuccessful: true,
        message: "Got your details",
    };
};
//# sourceMappingURL=getProjectDetails.js.map