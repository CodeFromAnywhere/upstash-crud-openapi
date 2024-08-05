import { Redis } from "@upstash/redis";
import { Endpoint } from "../client.js";
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { AdminDetails, DbKey, ProjectDetails } from "../types.js";
import { getProjectDetails } from "../getProjectDetails.js";
import { getUpstashRedisDatabase } from "../upstashRedis.js";
import { getAdminUserId } from "../getAdminUserId.js";

export const setCurrentProject: Endpoint<"setCurrentProject"> = async (
  context,
) => {
  const { projectSlug, Authorization, description } = context;
  const userId = await getAdminUserId(Authorization);

  if (!userId) {
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
  if (projectDetails && projectDetails.adminUserId !== userId) {
    return {
      isSuccessful: false,
      status: 400,
      message: "Project name already taken",
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
      message: "Couldn't find root database details",
    };
  }

  const root = new Redis({
    url: `https://${rootDatabaseDetails.endpoint}`,
    token: rootDatabaseDetails.rest_token,
  });

  await root.set(
    `admin_${userId}` satisfies DbKey,
    { currentProjectSlug: projectSlug } satisfies AdminDetails,
  );

  if (!projectDetails) {
    // insert new project if not already
    await root.set(
      `project_${projectSlug}` satisfies DbKey,
      {
        databaseSlugs: [],
        adminUserId: userId,
        description: description || `Project ${projectSlug}`,
      } satisfies ProjectDetails,
    );
  }

  // add to my projects
  await root.sadd(`projects_${userId}` satisfies DbKey, projectSlug);

  return { isSuccessful: true, message: "Project set successfully" };
};
