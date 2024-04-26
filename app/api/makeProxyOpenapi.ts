import { Endpoint } from "./[[...path]]/route";
import {
  SecurityRequirement,
  Components,
  OpenAPIDocument,
} from "actionschema/types";

export const makeProxyOpenapi: Endpoint<"makeProxyOpenapi"> = async ({
  proxy: { info, apiKey, name, partialApis },
}) => {
  // TODO: Connect with KV store, Check if ID is available
  const idNotAvailable = name !== "api" && false;

  if (idNotAvailable) {
    return { isSuccessful: false, message: "Id is not available" };
  }

  // 1. load in all openapiUrls

  // 2. go over all operations. Incase path isn't unique, suffix them and fill `proxyPath`

  // 3. put them into this paths object.
  const paths = {};

  const security: SecurityRequirement[] = [apiKey ? { apiKey: [] } : {}];
  const components: Components = apiKey
    ? {
        securitySchemes: { apiKey: { type: "http", description: "API Key" } },
      }
    : {};

  const openapi: OpenAPIDocument = {
    $schema:
      "https://raw.githubusercontent.com/CodeFromAnywhere/ActionSchema/main/schemas/openapi.schema.json",
    openapi: "3.0.0",
    "x-actionschema": "0.0.1",
    servers: [{ url: "https://proxy.actionschema.com/" + name }],
    //@ts-ignore
    info,

    security,
    components,
    paths,
  };

  // TODO: Store it
  // 1. Store this openapi + the proxy + admin token into KV store under key [id]
  // 2. Store key [admin token] value [id]

  return {
    isSuccessful: true,
    message: "Done",
  };
};
