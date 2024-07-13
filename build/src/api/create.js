import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { upstashRedisSetItems } from "../upstashRedis.js";
import { generateId, mergeObjectsArray } from "from-anywhere";
import { upsertIndexVectors } from "../embeddings.js";
export const create = async (context) => {
    const { items, databaseSlug, Authorization } = context;
    const { databaseDetails } = await getDatabaseDetails(databaseSlug);
    const apiKey = Authorization?.slice("Bearer ".length);
    if (!databaseDetails) {
        return { isSuccessful: false, message: "Couldn't find database details" };
    }
    if (databaseDetails.authToken !== undefined &&
        databaseDetails.authToken !== "" &&
        apiKey !== databaseDetails.authToken &&
        apiKey !== databaseDetails.adminAuthToken) {
        return { isSuccessful: false, message: "Unauthorized" };
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return {
            isSuccessful: false,
            message: "No items",
        };
    }
    const mappedItems = mergeObjectsArray(items.map(({ __id, ...item }) => ({
        [__id || generateId()]: item,
    })));
    await Promise.all(Object.keys(mappedItems).map(async (id) => {
        return upsertIndexVectors(databaseDetails, id, mappedItems[id]);
    }));
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
//# sourceMappingURL=create.js.map