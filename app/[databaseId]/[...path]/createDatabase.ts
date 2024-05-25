import { Redis } from "@upstash/redis";

import { Endpoint } from "@/client";
import { DatabaseDetails } from "@/types";
import {
  createUpstashRedisDatabase,
  getUpstashRedisDatabase,
} from "@/upstashRedis";
import { generateId, tryParseJson } from "from-anywhere";
import { JSONSchema7 } from "json-schema";

export const createDatabase: Endpoint<"createDatabase"> = async (context) => {
  const {
    databaseSlug,
    schemaString,
    authToken,
    region,
    X_UPSTASH_API_KEY,
    X_UPSTASH_EMAIL,
    X_ADMIN_AUTH_TOKEN,
  } = context;
  // comes from headers or .env
  const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
  const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
  const rootUpstashDatabaseId = process.env["X_UPSTASH_ROOT_DATABASE_ID"];

  const upstashApiKey = X_UPSTASH_API_KEY || rootUpstashApiKey;
  const upstashEmail = X_UPSTASH_EMAIL || rootUpstashEmail;

  if (
    !upstashApiKey ||
    !upstashEmail ||
    !rootUpstashApiKey ||
    !rootUpstashEmail ||
    !rootUpstashDatabaseId
  ) {
    return {
      isSuccessful: false,
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

  let previousDatabaseDetails: DatabaseDetails | null = await root.get(
    databaseSlug,
  );

  if (
    previousDatabaseDetails &&
    !!previousDatabaseDetails.adminAuthToken &&
    previousDatabaseDetails.adminAuthToken !== X_ADMIN_AUTH_TOKEN
  ) {
    return {
      isSuccessful: false,
      message:
        "A database with this name already exists, and you're not authorized to edit it.",
    };
  }

  const schema = tryParseJson<JSONSchema7>(schemaString);

  if (!schema) {
    return { isSuccessful: false, message: "Invalid Schema" };
  }

  let databaseDetails: DatabaseDetails | null = null;

  if (!previousDatabaseDetails) {
    const realAuthToken = authToken || generateId();
    //create if we couldn't find it before
    const created = await createUpstashRedisDatabase({
      upstashApiKey,
      upstashEmail,
      name: databaseSlug,
      region,
    });

    if (!created.result) {
      return { isSuccessful: false, message: "Couldn't create database." };
    }

    const adminAuthToken = X_ADMIN_AUTH_TOKEN || generateId();

    databaseDetails = {
      adminAuthToken,
      upstashApiKey,
      upstashEmail,
      authToken: realAuthToken,
      database_id: created.result.database_id,
      endpoint: created.result.endpoint,
      rest_token: created.result.rest_token,
      schema,
    };
  } else {
    databaseDetails = {
      ...previousDatabaseDetails,

      authToken: authToken || previousDatabaseDetails.authToken,

      upstashApiKey: upstashApiKey,
      upstashEmail: upstashEmail,
      schema,
    };
  }

  // re-set the database details
  await root.set(databaseSlug, databaseDetails);

  return {
    isSuccessful: false,
    message: "Database created",
    authToken: databaseDetails.authToken,
  };
};
