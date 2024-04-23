import { OpenAPIDocument } from "actionschema/types";

/**
Serves openapi.json at proxy.actionschema.com/[id]/openapi.json
 */
const handleOpenapiRequest = async (request: Request) => {
  const url = request.url;
  const urlObject = new URL(url);
  const id = urlObject.pathname.split("/")[1];

  // TODO: Find the openapi and proxy in the kv-store by looking up the ID.
  const openapi: OpenAPIDocument | {} = {};
  const isNotFound = false;

  const defaultResponseInit = {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      // "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  };
  if (isNotFound) {
    return Response.json(
      { isSuccessful: false, message: `OpenAPI with id ${id} not found` },
      defaultResponseInit,
    );
  }

  return Response.json(openapi, defaultResponseInit);
};

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request: Request) {
  return handleOpenapiRequest(request);
}
