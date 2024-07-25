import { Redis } from "@upstash/redis";
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { getAdminAuthorized } from "../getAdminAuthorized.js";
import { notEmpty } from "from-anywhere";
export const listProjects = async (context) => {
    const { Authorization } = context;
    const apiKey = Authorization?.slice("Bearer ".length);
    if (!apiKey || !(await getAdminAuthorized(Authorization))) {
        return { isSuccessful: false, message: "Unauthorized", status: 403 };
    }
    const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
    const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
    const rootUpstashDatabaseId = process.env["X_UPSTASH_ROOT_DATABASE_ID"];
    if (!rootUpstashApiKey || !rootUpstashEmail || !rootUpstashDatabaseId) {
        return {
            isSuccessful: false,
            message: "Missing environment variables",
        };
    }
    const { databaseDetails } = await getDatabaseDetails(rootUpstashDatabaseId);
    if (!databaseDetails) {
        return {
            isSuccessful: false,
            message: "Couldn't find root database details",
        };
    }
    const root = new Redis({
        url: `https://${databaseDetails.endpoint}`,
        token: databaseDetails.rest_token,
    });
    const projectSlugs = await root.smembers(`projects_${apiKey}`);
    const projectKeys = projectSlugs.map((s) => `project_${s}`);
    const projects = (await root.mget(projectKeys))
        .map((item, index) => {
        const typed = item;
        if (!typed) {
            return;
        }
        return {
            description: typed?.description,
            databaseSlugs: typed?.databaseSlugs,
            projectSlug: projectSlugs[index],
        };
    })
        .filter(notEmpty);
    return {
        isSuccessful: true,
        message: "Projects retrieved successfully",
        projects,
    };
};
//# sourceMappingURL=listProjects.js.map