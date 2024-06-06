import { Endpoint } from "@/client";
import { getDatabaseDetails } from "@/getDatabaseDetails";
import { upstashRedisSetItems } from "@/upstashRedis";
import { generateId, mergeObjectsArray } from "from-anywhere";
import { upsertIndexVectors } from "./embeddings";

export const create: Endpoint<"create"> = async (
  context,
): Promise<{
  isSuccessful: boolean;
  message: string;
  /** The rowIds created */
  result?: string[];
}> => {
  const { items, databaseSlug, Authorization } = context;

  const { databaseDetails } = await getDatabaseDetails(databaseSlug);

  if (!databaseDetails) {
    return { isSuccessful: false, message: "Couldn't find database details" };
  }

  if (
    databaseDetails.authToken !== undefined &&
    databaseDetails.authToken !== "" &&
    Authorization !== `Bearer ${databaseDetails.authToken}`
  ) {
    return { isSuccessful: false, message: "Unauthorized" };
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      isSuccessful: false,
      message: "No items",
    };
  }

  const mappedItems = mergeObjectsArray(
    items.map(({ __id, ...item }) => ({
      [__id || generateId()]: item,
    })),
  );

  await Promise.all(
    Object.keys(mappedItems).map(async (id) => {
      upsertIndexVectors(databaseDetails, id, mappedItems[id]);
    }),
  );

  await upstashRedisSetItems({
    redisRestToken: databaseDetails.rest_token,
    redisRestUrl: databaseDetails.endpoint,
    items: mappedItems,
  });

  return {
    isSuccessful: true,
    message: "Done",
    result: Object.keys(mappedItems),
  };
};
