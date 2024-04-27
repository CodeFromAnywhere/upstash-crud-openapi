import { Redis } from "@upstash/redis";
import { getUpstashRedisDatabase } from "@/lib/upstashRedis";
import { Endpoint, EndpointContext } from "@/client";

export type ActionSchemaDeleteResponse = {
  isSuccessful: boolean;
  message: string;
  deleteCount?: number;
};

export const remove: Endpoint<"remove"> = async (context) => {
  const { rowIds, databaseId } = context;
  const upstashEmail = context["X-UPSTASH-API-KEY"];
  const upstashApiKey = context["X-UPSTASH-EMAIL"];

  if (!upstashApiKey || !upstashEmail) {
    return {
      isSuccessful: false,
      message: "Please provide your upstash details environment variables",
    };
  }
  if (rowIds === undefined || rowIds.length === 0) {
    return { isSuccessful: false, message: "Invalid inputs" };
  }

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

  const redis = new Redis({
    url: `https://${db.endpoint}`,
    token: db.rest_token,
  });

  const deleteCount = await redis.del(...rowIds);

  return { isSuccessful: true, message: "Row(s) deleted", deleteCount };
};
