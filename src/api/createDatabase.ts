import { Redis } from "@upstash/redis";

import { Endpoint } from "../client.js";
import { DatabaseDetails } from "../types.js";
import {
  createUpstashRedisDatabase,
  getUpstashRedisDatabase,
} from "../upstashRedis.js";
import {
  generateId,
  generateRandomString,
  notEmpty,
  onlyUnique2,
  tryParseJson,
} from "from-anywhere";
import { JSONSchema7 } from "json-schema";
import { rootDatabaseName } from "../state.js";
import { embeddingsClient } from "../embeddings.js";

export const createDatabase: Endpoint<"createDatabase"> = async (context) => {
  const {
    databaseSlug,
    schemaString,
    authToken,
    region,
    openaiApiKey,
    vectorIndexColumns,
    Authorization,
  } = context;
  const apiKey = Authorization?.slice("Bearer ".length);

  // comes from .env
  const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
  const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
  const rootUpstashDatabaseId = process.env["X_UPSTASH_ROOT_DATABASE_ID"];

  if (!rootUpstashApiKey || !rootUpstashEmail || !rootUpstashDatabaseId) {
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

  const realDatabaseSlug = databaseSlug.toLowerCase();

  let previousDatabaseDetails: DatabaseDetails | null = await root.get(
    realDatabaseSlug,
  );

  const schema = tryParseJson<JSONSchema7>(schemaString);

  if (!schema) {
    return { isSuccessful: false, message: "Invalid Schema" };
  }

  if (
    ["root", rootDatabaseName].includes(realDatabaseSlug) ||
    (previousDatabaseDetails &&
      !!previousDatabaseDetails.adminAuthToken &&
      previousDatabaseDetails.adminAuthToken !== apiKey)
  ) {
    return {
      isSuccessful: false,
      status: 403,
      message:
        "A database with this name already exists, and you're not authorized to edit it.",
    };
  }

  let databaseDetails: DatabaseDetails | null = null;

  if (!previousDatabaseDetails) {
    // creates indexes
    const vectorIndexColumnDetails =
      vectorIndexColumns && rootUpstashApiKey && rootUpstashEmail
        ? (
            await Promise.all(
              vectorIndexColumns.map(async (item) => {
                const index = await embeddingsClient.createIndex({
                  upstashApiKey: rootUpstashApiKey,
                  upstashEmail: rootUpstashEmail,
                  dimension_count: item.dimension_count,
                  region: item.region,
                  similarity_function: item.similarity_function,
                  vectorIndexName: `${databaseSlug}-${item.propertyKey}`,
                });
                if (!index) {
                  return;
                }
                const { propertyKey } = item;
                const { endpoint, token, name } = index;
                return {
                  propertyKey,
                  vectorRestToken: token,
                  vectorRestUrl: `https://${endpoint}`,
                  dimensions: item.dimension_count,
                  model: item.model,
                };
              }),
            )
          ).filter(notEmpty)
        : undefined;

    const realAuthToken = authToken || generateId();
    //create if we couldn't find it before
    const created = await createUpstashRedisDatabase({
      upstashApiKey: rootUpstashApiKey,
      upstashEmail: rootUpstashEmail,
      name: realDatabaseSlug,
      region,
    });

    if (!created.result) {
      return { isSuccessful: false, message: created.message };
    }

    const adminAuthToken = apiKey || generateRandomString(64);

    databaseDetails = {
      openaiApiKey,
      vectorIndexColumnDetails,
      adminAuthToken,
      upstashApiKey: rootUpstashApiKey,
      upstashEmail: rootUpstashEmail,
      authToken: realAuthToken,
      database_id: created.result.database_id,
      endpoint: created.result.endpoint,
      rest_token: created.result.rest_token,
      schema,
    };

    console.log(`creating`, { databaseDetails });
  } else {
    databaseDetails = {
      ...previousDatabaseDetails,

      authToken: authToken || previousDatabaseDetails.authToken,

      upstashApiKey: rootUpstashApiKey,
      upstashEmail: rootUpstashEmail,
      schema,
    };
  }

  // re-set the database details
  await root.set(realDatabaseSlug, databaseDetails);

  const n = await root.sadd(`adminslugs_${apiKey}`, realDatabaseSlug);

  return {
    isSuccessful: true,
    message: "Database created",
    authToken: databaseDetails.authToken,
    adminAuthToken: databaseDetails.adminAuthToken,
    databaseSlug: realDatabaseSlug,
    openapiUrl:
      "https://data.actionschema.com/" + realDatabaseSlug + "/openapi.json",
  };
};
