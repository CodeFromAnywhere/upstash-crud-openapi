import { O, getSubsetFromObject, objectMapSync } from "from-anywhere";
import {
  getUpstashRedisDatabase,
  upstashRedisSetItems,
} from "@/lib/upstashRedis";
import { Redis } from "@upstash/redis";
import { DatabaseDetails } from "@/lib/types";
import { rootDatabaseName } from "@/lib/state";

/**
Update an item in a specified row in a table.

- applies authorization
- validates the partial item against the schema to ensure its correct

 */
export const update = async (context: {
  databaseId: string;
  /** The id (indexed key) of the item to update
   *
   * NB: Update that functions as upsert. If the id didn't exist, it will be created.
   */
  id: string;
  /** New (partial) value of the item. Will update all keys provided here. Please note that it cannot be set to 'undefined' as this doesn't transfer over JSON, but if you set it to "null", the value will be removed from the database.  */
  partialItem: O;
}): Promise<{ isSuccessful: boolean; message: string }> => {
  const { id, databaseId, partialItem } = context;

  const { upstashApiKey, upstashEmail } = process.env;

  if (!upstashApiKey || !upstashEmail) {
    return {
      isSuccessful: false,
      message: "Please provide your upstash details environment variables",
    };
  }

  if (id === undefined || !partialItem) {
    return { isSuccessful: false, message: "Invalid inputs" };
  }
  const db = await getUpstashRedisDatabase({
    upstashEmail,
    upstashApiKey,
    databaseId,
  });

  const rootDb = await getUpstashRedisDatabase({
    upstashEmail,
    upstashApiKey,
    databaseId: rootDatabaseName,
  });

  if (!db || !rootDb) {
    return {
      isSuccessful: false,
      message: "Could not find db",
    };
  }

  const root = new Redis({
    url: `https://${rootDb.endpoint}`,
    token: rootDb.rest_token,
  });

  const databaseDetails: DatabaseDetails | null = await root.get(databaseId);
  if (!databaseDetails) {
    return {
      isSuccessful: false,
      message: "Could not find that db",
    };
  }

  const partialItemPropertyKeys = Object.keys(partialItem);

  if (!databaseDetails.schema.properties) {
    return { isSuccessful: false, message: "Schema not found" };
  }

  const schemaPropertyKeys = Object.keys(databaseDetails.schema.properties);

  const validPartialItemPropertyKeys = partialItemPropertyKeys.filter((k) =>
    schemaPropertyKeys.includes(k),
  );

  const prunedPartialItem: O = getSubsetFromObject(
    partialItem,
    validPartialItemPropertyKeys,
  );

  // Ensure all values that are null become undefined
  const castedPartialItem = objectMapSync(
    prunedPartialItem as O,
    (key, value) => (value === null ? undefined : value),
  );

  await upstashRedisSetItems({
    redisRestToken: db.rest_token,
    redisRestUrl: db.endpoint,
    items: { [id]: castedPartialItem },
  });

  return { isSuccessful: true, message: "Updated" };
};
