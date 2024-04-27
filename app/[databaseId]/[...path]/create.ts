import { O, StandardResponse } from "from-anywhere/types";
import {
  upstashRedisSetItems,
  getUpstashRedisDatabase,
} from "@/lib/upstashRedis";
import { generateId, mergeObjectsArray } from "from-anywhere";
import { Endpoint } from "@/client";

export const create: Endpoint<"create"> = async (
  context,
): Promise<{
  isSuccessful: boolean;
  message: string;
  /** The rowIds created */
  result?: string[];
}> => {
  const { items, databaseId } = context;

  const { upstashApiKey, upstashEmail } = process.env;

  if (!upstashApiKey || !upstashEmail) {
    return {
      isSuccessful: false,
      message: "Please provide your upstash details environment variables",
    };
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      isSuccessful: false,
      message: "No items",
    };
  }

  // step 2: validate authToken and find db name.
  const db = await getUpstashRedisDatabase({
    upstashEmail,
    upstashApiKey,
    databaseId,
  });

  if (!db) {
    return {
      isSuccessful: false,
      message: "Could not find db",
    };
  }

  const mappedItems = mergeObjectsArray(
    items.map(({ __id, ...item }) => ({
      [__id || generateId()]: item,
    })),
  );

  await upstashRedisSetItems({
    redisRestToken: db.rest_token,
    redisRestUrl: db.endpoint,
    items: mappedItems,
  });

  return {
    isSuccessful: true,
    message: "Done",
    result: Object.keys(mappedItems),
  };
};
