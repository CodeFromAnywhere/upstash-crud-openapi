import { Redis } from "@upstash/redis";
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { getProjectDetails } from "../getProjectDetails.js";
import { getAdminAuthorized } from "../getAdminAuthorized.js";
export const setCurrentProject = async (context) => {
    const { projectSlug, Authorization, description } = context;
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
    const { projectDetails } = await getProjectDetails(projectSlug);
    if (projectDetails && projectDetails.adminAuthToken !== apiKey) {
        return {
            isSuccessful: false,
            status: 403,
            message: "Unauthorized",
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
    await root.set(`admin_${apiKey}`, { currentProjectSlug: projectSlug });
    if (!projectDetails) {
        // insert new project if not already
        await root.set(`project_${projectSlug}`, {
            databaseSlugs: [],
            adminAuthToken: apiKey,
            description: description || `Project ${projectSlug}`,
        });
    }
    // add to my projects
    await root.sadd(`projects_${apiKey}`, projectSlug);
    return { isSuccessful: true, message: "Project set successfully" };
};
//# sourceMappingURL=setCurrentProject.js.map