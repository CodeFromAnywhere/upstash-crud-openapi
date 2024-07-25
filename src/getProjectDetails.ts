import { Redis } from "@upstash/redis";
import { DatabaseDetails, DbKey, ProjectDetails } from "./types.js";

/** In order to go from databaseSlug to databaseId, we need a simple global KV for that */
export const getProjectDetails = async (projectSlug: string) => {
  //connect to root
  const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
  const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
  const rootUpstashDatabaseId = process.env["X_UPSTASH_ROOT_DATABASE_ID"];
  const rootUpstashEndpoint = process.env["X_UPSTASH_ENDPOINT"];
  const rootUpstashRestToken = process.env["X_UPSTASH_REST_TOKEN"];

  if (
    !rootUpstashApiKey ||
    !rootUpstashEmail ||
    !rootUpstashDatabaseId ||
    !rootUpstashEndpoint ||
    !rootUpstashRestToken
  ) {
    return {
      isSuccessful: false,
      message: "Please provide your upstash details environment variables",
    };
  }

  const root = new Redis({
    url: `https://${rootUpstashEndpoint}`,
    token: rootUpstashRestToken,
  });

  const projectDetails: ProjectDetails | null = await root.get(
    `project_${projectSlug}` satisfies DbKey,
  );

  if (!projectDetails) {
    return { isSuccessful: false, message: "Not found" };
  }

  const keys = projectDetails.databaseSlugs.map(
    (databaseSlug) => `db_${databaseSlug}` satisfies DbKey,
  );
  // NB: just do a single query getting all details for all databases
  const details: (DatabaseDetails | null)[] =
    keys.length > 0 ? await root.mget(...keys) : [];
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
