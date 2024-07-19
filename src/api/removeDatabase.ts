import { Endpoint } from "../client.js";
import { Redis } from "@upstash/redis";
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { embeddingsClient } from "../embeddings.js";
import { DatabaseDetails } from "../types.js";

export const removeDatabase: Endpoint<"removeDatabase"> = async (context) => {
  const { databaseSlug, Authorization } = context;
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

  const { databaseDetails: rootDetails } = await getDatabaseDetails(
    rootUpstashDatabaseId,
  );

  if (!rootDetails) {
    return {
      isSuccessful: false,
      message: "Couldn't find root database details",
    };
  }

  const root = new Redis({
    url: `https://${rootDetails.endpoint}`,
    token: rootDetails.rest_token,
  });

  const databaseDetails = (await root.get(databaseSlug)) as
    | DatabaseDetails
    | undefined;

  if (!databaseDetails || databaseDetails.adminAuthToken !== apiKey) {
    return {
      isSuccessful: false,
      message: "Unauthorized or database not found",
      status: 403,
    };
  }

  // Remove vector indexes if they exist
  if (databaseDetails.vectorIndexColumnDetails) {
    for (const indexDetail of databaseDetails.vectorIndexColumnDetails) {
      // TODO: implement this
      //   await embeddingsClient.deleteIndex({
      //     upstashApiKey: rootUpstashApiKey,
      //     upstashEmail: rootUpstashEmail,
      //     vectorIndexName: `${databaseSlug}-${indexDetail.propertyKey}`,
      //   });
    }
  }

  // Remove the database from Upstash
  await root.del(databaseSlug);
  await root.srem(`adminslugs_${apiKey}`, databaseSlug);

  return { isSuccessful: true, message: "Database removed successfully" };
};
