import { Redis } from "@upstash/redis";
import { Endpoint } from "../client.js";
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { embeddingsClient } from "../embeddings.js";

export type ActionSchemaDeleteResponse = {
  isSuccessful: boolean;
  message: string;
  deleteCount?: number;
};

export const remove: Endpoint<"remove"> = async (context) => {
  const { rowIds, databaseSlug, Authorization } = context;
  const apiKey = Authorization?.slice("Bearer ".length);

  const { databaseDetails } = await getDatabaseDetails(databaseSlug);

  if (!databaseDetails) {
    return { isSuccessful: false, message: "Couldn't find database details" };
  }

  if (
    databaseDetails.authToken !== undefined &&
    databaseDetails.authToken !== "" &&
    apiKey !== databaseDetails.authToken &&
    apiKey !== databaseDetails.adminAuthToken
  ) {
    return { isSuccessful: false, message: "Unauthorized" };
  }

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

  const deleteCount = await redis.del(...rowIds);

  return { isSuccessful: true, message: "Row(s) deleted", deleteCount };
};
