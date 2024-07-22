import { Endpoint } from "../client.js";
import { Redis } from "@upstash/redis";
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { DbKey } from "../types.js";

export const listProjects: Endpoint<"listProjects"> = async (context) => {
  const { Authorization } = context;
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

  const projectSlugs: string[] = await root.smembers(
    `projects_${apiKey}` satisfies DbKey,
  );
  const projects = await Promise.all(
    projectSlugs.map(async (slug) => {
      const description = (await root.get(
        `project_${slug}` satisfies DbKey,
      )) as string;
      return { projectSlug: slug, description };
    }),
  );

  return {
    isSuccessful: true,
    message: "Projects retrieved successfully",
    projects,
  };
};
