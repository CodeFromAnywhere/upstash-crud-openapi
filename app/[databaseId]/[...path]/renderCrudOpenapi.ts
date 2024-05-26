import { Endpoint } from "@/client";
import { getDatabaseDetails } from "@/getDatabaseDetails";
import {
  O,
  getSubsetFromObject,
  removeOptionalKeysFromObject,
  removeOptionalKeysFromObjectStrings,
} from "from-anywhere";
import { OpenapiSchemaObject } from "from-anywhere/types";
import { JSONSchema7 } from "json-schema";
import {
  OperationObject,
  ParameterObject,
  SchemaObject,
} from "openapi-typescript";
import openapi from "../../../public/openapi.json";
import { OpenapiDocument } from "openapi-util";

export const withoutProperties = (
  schema: OpenapiSchemaObject,
  properties: string[],
) => {
  if (!schema.properties) {
    return schema as SchemaObject;
  }

  const newProperties = removeOptionalKeysFromObjectStrings(
    schema.properties,
    properties,
  );

  return {
    ...schema,
    properties: newProperties as JSONSchema7["properties"],
  } as SchemaObject;
};

export const replaceRefs = (schema: OpenapiSchemaObject, refs: O) => {
  const string = JSON.stringify(schema);

  const finalString = Object.keys(refs).reduce((newString, refKey) => {
    const json = JSON.stringify(refs[refKey]);
    const jsonWithoutBrackets = json.slice(1, json.length - 1);

    // NB: no spaces!
    return newString.replaceAll(`"$ref":"${refKey}"`, jsonWithoutBrackets);
  }, string);

  // console.log(finalString);
  return JSON.parse(finalString) as any;
};

/** Renames all refs to #/components/schemas/ instead of #/definitions */
export const renameRefs = (schema: SchemaObject | undefined) => {
  if (!schema) {
    return schema;
  }
  const string = JSON.stringify(schema);

  const newString = string.replaceAll(
    `"$ref":"#/definitions/`,
    `"$ref":"#/components/schemas/`,
  );

  return JSON.parse(newString) as any;
};

/**
Should make a CRUD openapi from the schema fetched from database id
*/

export const renderCrudOpenapi: Endpoint<"renderCrudOpenapi"> = async (
  context,
) => {
  const { databaseSlug } = context;
  // comes from path parameter
  const { databaseDetails } = await getDatabaseDetails(databaseSlug);

  // NB: no auth needed for this endpoint.

  if (!databaseDetails) {
    return {
      isSuccessful: false,
      message: "Couldn't find database details for db " + databaseSlug,
    };
  }

  const crudPaths = {
    "/create": removeOptionalKeysFromObjectStrings(
      openapi.paths["/{databaseSlug}/create"],
      ["parameters"],
    ),

    "/read": removeOptionalKeysFromObjectStrings(
      openapi.paths["/{databaseSlug}/read"],
      ["parameters"],
    ),
    "/update": removeOptionalKeysFromObjectStrings(
      openapi.paths["/{databaseSlug}/update"],
      ["parameters"],
    ),
    "/remove": removeOptionalKeysFromObjectStrings(
      openapi.paths["/{databaseSlug}/remove"],
      ["parameters"],
    ),
  };

  return {
    ...openapi,
    components: {
      ...openapi.components,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "Bearer",
          description: "Your authToken should be provided",
        },
      },
    },
    paths: crudPaths,
    info: { title: `${databaseSlug} CRUD`, version: "1.0", description: "" },
    servers: [{ url: `/${databaseSlug}` }],
    security: [{ bearerAuth: [] }],
  };
};
