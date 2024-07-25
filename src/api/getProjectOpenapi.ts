import { Endpoint, ResponseType } from "../client.js";
import { mapValuesSync } from "from-anywhere";
import { JSONSchema7 } from "json-schema";
import openapi from "../../src/crud-openapi.json" assert { type: "json" };
import { getProjectDetails } from "../getProjectDetails.js";
import { removePropertiesFromObjectSchema } from "../removePropertiesFromObjectSchema.js";
import { getModelDefinitions } from "../getModelDefinitions.js";
import { OpenapiPathsObject } from "openapi-util";
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

  const schemasWithoutDatabaseSlug = mapValuesSync(
    openapi.components.schemas,
    (schema) =>
      schema.type === "object"
        ? // TODO: replace references to `ModelItem` with `pascalCase(database.databaseSlug)`
          removePropertiesFromObjectSchema(schema as JSONSchema7, [
            "databaseSlug",
          ])
        : schema,
  );

  const modelDefinitions = getModelDefinitions(databases);

  const paths = databases.reduce((previous, database) => {
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
      schemas: {
        ...schemasWithoutDatabaseSlug,
        ...modelDefinitions,
      },
    },
    paths,
  };

  // bit ugly but couldn't find another way
  return improved as unknown as ResponseType<"getCrudOpenapi">;
};
