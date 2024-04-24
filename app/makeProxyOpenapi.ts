"use server";
import {
  Info,
  OpenAPIDocument,
  OpenapiProxySchema,
  SecurityRequirement,
} from "actionschema/types";

export const makeProxyOpenapi = async (context: {
  proxy: OpenapiProxySchema;
}) => {
  const {
    proxy: { id, info, apiKey, partialApis },
  } = context;

  // TODO: Connect with KV store, Check if ID is available
  const idNotAvailable = false;

  if (idNotAvailable) {
    return { isSuccessful: false, message: "Id is not available" };
  }

  // 1. load in all openapiUrls

  // 2. go over all operations. Incase path isn't unique, suffix them and fill `proxyPath`

  // 3. put them into this paths object.
  const paths = {};

  const security: SecurityRequirement[] = [apiKey ? { apiKey: [] } : {}];

  const openapi: OpenAPIDocument = {
    info,
    $schema:
      "https://raw.githubusercontent.com/CodeFromAnywhere/ActionSchema/main/schemas/openapi.schema.json",
    openapi: "3.0.0",
    "x-actionschema": "0.0.1",
    paths,
    security,
    servers: [{ url: "https://proxy.actionschema.com/" + id }],
  };

  // TODO: Store this

  return {
    isSuccessful: true,
    message: "Done",
  };
};
