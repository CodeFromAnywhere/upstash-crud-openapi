import { OpenapiPathsObject, resolveSchemaRecursive } from "openapi-util";
import { kebabCase, pascalCase } from "from-anywhere";
import { JSONSchema7 } from "json-schema";
import { Endpoint, ResponseType } from "../client.js";
import rawOpenapi from "../../src/crud-openapi.json" assert { type: "json" };
import { getProjectDetails } from "../getProjectDetails.js";
import { removePropertiesFromObjectSchema } from "../removePropertiesFromObjectSchema.js";
import { getModelDefinitions } from "../getModelDefinitions.js";

const isDev = process.env.__VERCEL_DEV_RUNNING === "1";

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
    const read: any = { ...openapi.paths["/read"] };
    const create: any = { ...openapi.paths["/create"] };
    const update: any = { ...openapi.paths["/update"] };
    const remove: any = { ...openapi.paths["/remove"] };

    const modelItemSchema =
      modelDefinitions[`${pascalCase(database.databaseSlug)}`];

    create.post.operationId = kebabCase(`${database.databaseSlug}-create`);
    read.post.operationId = kebabCase(`${database.databaseSlug}-read`);
    update.post.operationId = kebabCase(`${database.databaseSlug}-update`);
    remove.post.operationId = kebabCase(`${database.databaseSlug}-remove`);

    // remove databaseSlug
    read.post.requestBody.content["application/json"].schema =
      removePropertiesFromObjectSchema(
        read.post.requestBody.content["application/json"].schema as JSONSchema7,
        ["databaseSlug"],
      );

    // remove databaseSlug
    remove.post.requestBody.content["application/json"].schema =
      removePropertiesFromObjectSchema(
        remove.post.requestBody.content["application/json"]
          .schema as JSONSchema7,
        ["databaseSlug"],
      );
    // remove databaseSlug and replace schema.properties.items.items
    create.post.requestBody.content[
      "application/json"
    ].schema.properties.items.items = modelItemSchema;
    create.post.requestBody.content["application/json"].schema =
      removePropertiesFromObjectSchema(
        create.post.requestBody.content["application/json"]
          .schema as JSONSchema7,
        ["databaseSlug"],
      );
    //  replace schema.properties.partialItem
    update.post.requestBody.content[
      "application/json"
    ].schema.properties.partialItem = modelItemSchema;

    // remove required if object-schema has required
    if (
      update.post.requestBody.content["application/json"].schema.properties
        .partialItem.type === "object" &&
      update.post.requestBody.content["application/json"].schema.properties
        .partialItem.required
    ) {
      update.post.requestBody.content[
        "application/json"
      ].schema.properties.partialItem.required = undefined;
    }
    // remove databaseSlug
    update.post.requestBody.content["application/json"].schema =
      removePropertiesFromObjectSchema(
        update.post.requestBody.content["application/json"]
          .schema as JSONSchema7,
        ["databaseSlug"],
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
    components: { ...openapi.components, schemas: {} },
    paths,
  };

  // bit ugly but couldn't find another way
  return improved as unknown as ResponseType<"getCrudOpenapi">;
};
