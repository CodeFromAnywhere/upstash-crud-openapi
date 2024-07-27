import { Endpoint, ResponseType } from "../client.js";
import { kebabCase, mapValuesSync } from "from-anywhere";
import { JSONSchema7 } from "json-schema";
import rawOpenapi from "../../src/crud-openapi.json" assert { type: "json" };
import { getProjectDetails } from "../getProjectDetails.js";
import { removePropertiesFromObjectSchema } from "../removePropertiesFromObjectSchema.js";
import { getModelDefinitions } from "../getModelDefinitions.js";
import {
  OpenapiDocument,
  OpenapiPathsObject,
  resolveSchemaRecursive,
} from "openapi-util";
const isDev = process.env.__VERCEL_DEV_RUNNING === "1";

const removeDatabaseSlugFromSchemasInPlace = (...schemas: JSONSchema7[]) => {
  schemas.forEach((schema) => {
    const newSchema = removePropertiesFromObjectSchema(schema as JSONSchema7, [
      "databaseSlug",
    ]);
    schema = newSchema;
  });
};

/**
Should make a project openapi from the schema fetched from projectSlug

The idea here is that we could have a oauth2 based database that can be used from the frontend directly.
*/

export const getProjectOpenapi: Endpoint<"getProjectOpenapi"> = async (
  context,
) => {
  const { projectSlug } = context;

  // comes from path parameter

  const { projectDetails, databases, isSuccessful, message } =
    await getProjectDetails(projectSlug);

  if (!projectDetails || !isSuccessful) {
    return {
      status: 404,
      isSuccessful: false,
      message: `Couldn't find project details: ${message}`,
    };
  }

  const origin = isDev
    ? "http://localhost:3000"
    : "https://data.actionschema.com";

  const modelDefinitions = getModelDefinitions(databases);

  const openapi = (await resolveSchemaRecursive({
    document: rawOpenapi,
    shouldDereference: true,
  })) as typeof rawOpenapi;

  const paths = databases.reduce((previous, database) => {
    const create = { ...openapi.paths["/create"] };
    const read = { ...openapi.paths["/read"] };
    const update = { ...openapi.paths["/update"] };
    const remove = { ...openapi.paths["/remove"] };

    create.post.operationId = kebabCase(`${database.databaseSlug}-create`);
    read.post.operationId = kebabCase(`${database.databaseSlug}-create`);
    update.post.operationId = kebabCase(`${database.databaseSlug}-create`);
    remove.post.operationId = kebabCase(`${database.databaseSlug}-create`);

    removeDatabaseSlugFromSchemasInPlace(
      create.post.requestBody.content["application/json"].schema,
      read.post.requestBody.content["application/json"].schema,
      update.post.requestBody.content["application/json"].schema,
      remove.post.requestBody.content["application/json"].schema,
    );

    return {
      ...previous,
      // TODO: replace references to `ModelItem` with `pascalCase(database.databaseSlug)`
      [`/${database.databaseSlug}/create`]: openapi.paths["/create"],
      [`/${database.databaseSlug}/read`]: openapi.paths["/read"],
      [`/${database.databaseSlug}/update`]: openapi.paths["/update"],
      [`/${database.databaseSlug}/remove`]: openapi.paths["/remove"],
    };
  }, {} as { [path: string]: OpenapiPathsObject });

  const improved = {
    ...openapi,
    servers: [{ url: origin }],
    info: { title: `${projectSlug} OpenAPI`, version: "1.0", description: "" },
    components: {
      ...openapi.components,
      schemas: modelDefinitions,
    },
    paths,
  };

  // bit ugly but couldn't find another way
  return improved as unknown as ResponseType<"getCrudOpenapi">;
};
