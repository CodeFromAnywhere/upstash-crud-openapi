import { Endpoint } from "../client.js";
import { Redis } from "@upstash/redis";
import { getDatabaseDetails } from "../getDatabaseDetails.js";

export const removeProject: Endpoint<"removeProject"> = async (context) => {
  const { projectSlug, Authorization } = context;
  const apiKey = Authorization?.slice("Bearer ".length);

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

  await root.del(`project_${projectSlug}`);
  await root.srem(`projects_${apiKey}`, projectSlug);

  return { isSuccessful: true, message: "Project removed successfully" };
};
