import { O, getSubsetFromObject, objectMapSync } from "from-anywhere";
import { upstashRedisSetItems } from "@/upstashRedis";
import { Endpoint } from "@/client";
import { getDatabaseDetails } from "@/getDatabaseDetails";
import { upsertIndexVectors } from "./embeddings";

/**
Update an item in a specified row in a table.

- applies authorization
- validates the partial item against the schema to ensure its correct

 */
export const update: Endpoint<"update"> = async (context) => {
  const { id, databaseSlug, partialItem, Authorization } = context;

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

  if (id === undefined || !partialItem) {
    return { isSuccessful: false, message: "Invalid inputs" };
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
    redisRestToken: databaseDetails.rest_token,
    redisRestUrl: databaseDetails.endpoint,
    items: { [id]: castedPartialItem },
  });

  // also update vectors if they're there
  await upsertIndexVectors(databaseDetails, id, castedPartialItem);

  return { isSuccessful: true, message: "Updated" };
};
