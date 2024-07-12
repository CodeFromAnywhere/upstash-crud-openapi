import { Redis } from "@upstash/redis";
import { Endpoint } from "../client.js";
import { getUpstashRedisDatabase } from "../upstashRedis.js";
import { DatabaseDetails } from "../types.js";
import { notEmpty } from "from-anywhere";

export const listDatabases: Endpoint<"listDatabases"> = async (context) => {
  const { Authorization } = context;
  // auth admin
  const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
  const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
  const rootUpstashDatabaseId = process.env["X_UPSTASH_ROOT_DATABASE_ID"];

  // TODO: also make it work for external upstash? not really needed i guess. maybe just cancel this feature in favor of self hosting.
  // const upstashApiKey = X_UPSTASH_API_KEY || rootUpstashApiKey;
  // const upstashEmail = X_UPSTASH_EMAIL || rootUpstashEmail;

  if (
    // !upstashApiKey ||
    // !upstashEmail ||
    !rootUpstashApiKey ||
    !rootUpstashEmail ||
    !rootUpstashDatabaseId
  ) {
    return {
      isSuccessful: false,
      status: 400,
      message: "Please provide your upstash details environment variables",
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
      message: "Couldn't get root database details",
    };
  }

  // now we have root-db

  const root = new Redis({
    url: `https://${rootDatabaseDetails.endpoint}`,
    token: rootDatabaseDetails.rest_token,
  });

  const key = Authorization.slice("Bearer ".length);
  const slugs: string[] = await root.smembers(`adminslugs_${key}`);

  if (!slugs) {
    return { isSuccessful: false, message: "Unauthorized", status: 403 };
  }

  console.log({ slugs });

  if (slugs.length < 1) {
    return { isSuccessful: false, message: "Not enough slugs" };
  }
  const details: (DatabaseDetails | null)[] = await root.mget(...slugs);

  const databases = details
    .map((x, index) =>
      x
        ? {
            authToken: x.authToken,
            databaseSlug: slugs[index],
            //  schema: x.schema,
          }
        : null,
    )
    .filter(notEmpty);

  return { isSuccessful: true, message: "Found your dbs", databases };
};
