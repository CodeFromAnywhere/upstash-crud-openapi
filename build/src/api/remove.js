import { Redis } from "@upstash/redis";
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { embeddingsClient } from "../embeddings.js";
import { getCrudOperationAuthorized } from "../getCrudOperationAuthorized.js";
export const remove = async (context) => {
    const { rowIds, databaseSlug, Authorization } = context;
    if (!databaseSlug) {
        return { isSuccessful: false, message: "please provide a slug" };
    }
    const { databaseDetails } = await getDatabaseDetails(databaseSlug);
    if (!databaseDetails) {
        return { isSuccessful: false, message: "Couldn't find database details" };
    }
    if (!Authorization ||
        !(await getCrudOperationAuthorized(databaseDetails, Authorization))) {
        return { isSuccessful: false, message: "Unauthorized" };
    }
    const apiKey = Authorization.slice("Bearer ".length);
    if (rowIds === undefined || rowIds.length === 0) {
        return { isSuccessful: false, message: "Invalid inputs" };
    }
    const redis = new Redis({
        url: `https://${databaseDetails.endpoint}`,
        token: databaseDetails.rest_token,
    });
    databaseDetails.vectorIndexColumnDetails?.map((item) => {
        const { vectorRestUrl, vectorRestToken } = item;
        return embeddingsClient.deleteVector({
            vectorRestUrl,
            vectorRestToken,
            ids: rowIds,
        });
    });
    const authSuffix = databaseDetails.isUserLevelSeparationEnabled
        ? `_${apiKey}`
        : "";
    const baseKey = `db_${databaseSlug}${authSuffix}_`;
    const realRowIds = rowIds.map((id) => `${baseKey}${id}`);
    const deleteCount = await redis.del(...realRowIds);
    return { isSuccessful: true, message: "Row(s) deleted", deleteCount };
};
//# sourceMappingURL=remove.js.map