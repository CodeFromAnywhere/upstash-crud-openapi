"use server";
import {
  Info,
  OpenAPIDocument,
  OpenapiProxySchema,
  SecurityRequirement,
} from "actionschema/types";

export const makeProxyOpenapi = async (formData: FormData) => {
  const id = formData.get("id");
  const info = formData.get("info");
  const apiKey = formData.get("apiKey");
  const partialApis = formData.get("partialApis");

  console.log("HEY HEY");
  const idNotAvailable = false;

  if (idNotAvailable) {
    return { isSuccessful: false, message: "Id is not available" };
  }

  const paths = {};

  const security: SecurityRequirement[] = [apiKey ? { apiKey: [] } : {}];

  const openapi: OpenAPIDocument = {
    info: info as unknown as Info,
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
