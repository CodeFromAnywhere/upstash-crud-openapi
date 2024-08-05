import { Endpoint } from "../client.js";
import { Redis } from "@upstash/redis";
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { AdminDetails, DatabaseDetails, DbKey } from "../types.js";
import { getProjectDetails } from "../getProjectDetails.js";
import { removeEntireDatabase } from "../removeEntireDatabase.js";
import { getUpstashRedisDatabase } from "../upstashRedis.js";
import { getAdminUserId } from "../getAdminUserId.js";

export const removeProject: Endpoint<"removeProject"> = async (context) => {
  const { projectSlug, Authorization } = context;
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
  if (!projectDetails || projectDetails.adminUserId !== userId) {
    return {
      isSuccessful: false,
      status: 403,
      message: "Unauthorized",
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

  const beforeProjectSlugs: string[] = await root.smembers(
    `projects_${userId}` satisfies DbKey,
  );

  if (beforeProjectSlugs.length <= 1) {
    return {
      isSuccessful: false,
      message: "Can't remove your only project",
    };
  }

  const keys = projectDetails.databaseSlugs.map(
    (databaseSlug) => `db_${databaseSlug}` satisfies DbKey,
  );

  const details: (DatabaseDetails | null)[] =
    keys.length === 0 ? [] : await root.mget(...keys);

  const databases = projectDetails.databaseSlugs.map((databaseSlug, index) => ({
    databaseSlug,
    details: details[index],
  }));

  // NB: When removing databases, also remove all database entries!
  // This does 4 API requests per database.
  await Promise.all(
    databases
      // NB: doublecheck for correct adminAuthToken
      .filter((item) => item.details?.adminUserId === userId)
      .map((item) =>
        removeEntireDatabase({
          databaseSlug: item.databaseSlug,
          databaseDetails: item.details,
          root,
        }),
      ),
  );

  await root.del(`project_${projectSlug}` satisfies DbKey);
  await root.srem(`projects_${userId}` satisfies DbKey, projectSlug);

  const adminDetails: AdminDetails | null = await root.get(
    `admin_${userId}` satisfies DbKey,
  );

  if (adminDetails?.currentProjectSlug === projectSlug) {
    // you removed your current one. let's set the project to the first one to not get corrupt.
    const projectSlugs: string[] = await root.smembers(
      `projects_${userId}` satisfies DbKey,
    );
    await root.set(
      `admin_${userId}` satisfies DbKey,
      { currentProjectSlug: projectSlugs[0] } satisfies AdminDetails,
    );
  }

  return { isSuccessful: true, message: "Project removed successfully" };
};
