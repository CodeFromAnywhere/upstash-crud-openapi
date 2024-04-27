import { Endpoint } from "@/client";

export const createOrUpdateDatabase: Endpoint<"createOrUpdateDatabase"> = (
  context,
) => {
  const { databaseId, schemaString } = context;
  const upstashEmail = context["X-UPSTASH-API-KEY"];
  const upstashApiKey = context["X-UPSTASH-EMAIL"];

  if (!upstashApiKey || !upstashEmail) {
    return {
      isSuccessful: false,
      message: "Please provide your upstash details environment variables",
    };
  }

  // lets make a db or set one if it already exists

  return { isSuccessful: false, message: "Not implemented yet" };
};
