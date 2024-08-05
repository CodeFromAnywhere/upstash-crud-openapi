import { CreateContext } from "../sdk.js";
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { upstashRedisSetItems } from "../upstashRedis.js";
import { generateId, mergeObjectsArray } from "from-anywhere";
import { upsertIndexVectors } from "../embeddings.js";
import { getCrudOperationAuthorized } from "../getCrudOperationAuthorized.js";

export const create = async (
  context: CreateContext & { Authorization?: string },
): Promise<{
  isSuccessful: boolean;
  message: string;
  /** The rowIds created */
  result?: string[];
}> => {
  const { items, databaseSlug, Authorization } = context;

  if (!databaseSlug) {
    return { isSuccessful: false, message: "please provide a slug" };
  }

  const { databaseDetails } = await getDatabaseDetails(databaseSlug);

  if (!databaseDetails) {
    return { isSuccessful: false, message: "Couldn't find database details" };
  }

  if (
    !Authorization ||
    !(await getCrudOperationAuthorized(databaseDetails, Authorization))
  ) {
    return { isSuccessful: false, message: "Unauthorized" };
  }

  const apiKey = Authorization.slice("Bearer ".length);

  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      isSuccessful: false,
      message: "No items",
    };
  }

  const mappedItems = mergeObjectsArray(
    items.map(({ __id, ...item }) => ({
      [(__id as string | undefined) || generateId()]: item,
    })),
  );

  await Promise.all(
    Object.keys(mappedItems).map(async (id) => {
      return upsertIndexVectors(databaseDetails, id, mappedItems[id]);
    }),
  );

  const authSuffix = databaseDetails.isUserLevelSeparationEnabled
    ? `_${apiKey}`
    : "";

  const baseKey = `db_${databaseSlug}${authSuffix}_`;

  await upstashRedisSetItems({
    baseKey,
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
