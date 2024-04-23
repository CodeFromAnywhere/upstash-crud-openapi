import {
  OpenAPIDocument,
  OpenapiProxySchema,
  SecurityRequirement,
} from "actionschema/types";

const makeProxyOpenapi = async (request: Request) => {
  "use server";
  const context = request.body as OpenapiProxySchema | null;

  if (!context) {
    return;
  }

  const { id, info, apiKey, partialApis } = context;

  const idNotAvailable = false;

  if (idNotAvailable) {
    return { isSuccessful: false, message: "Id is not available" };
  }

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

const NewPage = () => {
  return <div>DONE</div>;
};

export default NewPage;
