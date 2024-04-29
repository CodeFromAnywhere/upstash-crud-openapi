import { Redis } from "@upstash/redis";
import { O, StandardResponse } from "from-anywhere/types";
import { upstashRedisSetItems, getUpstashRedisDatabase } from "@/upstashRedis";
import { generateId, mergeObjectsArray } from "from-anywhere";
import { Endpoint } from "@/client";
import { DatabaseDetails } from "@/types";

/** In order to go from databaseSlug to databaseId, we need a simple global KV for that */
export const getDatabaseDetails = async (databaseSlug: string) => {
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

  const databaseDetails: DatabaseDetails | null = await root.get(databaseSlug);

  //respond with details
  return { databaseDetails, isSuccessful: true, message: "Got your details" };
};
