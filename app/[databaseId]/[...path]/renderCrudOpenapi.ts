import { Redis } from "@upstash/redis";
import { O, removeOptionalKeysFromObjectStrings } from "from-anywhere";
import { OpenapiSchemaObject } from "from-anywhere/types";
import { JSONSchema7 } from "json-schema";
import { SchemaObject } from "openapi-typescript";
import { Endpoint } from "@/client";
import { DatabaseDetails } from "@/types";
import { getUpstashRedisDatabase } from "@/upstashRedis";
import openapi from "../../../public/openapi.json";
import { getDatabaseDetails } from "@/getDatabaseDetails";

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
    return { isSuccessful: false, message: "Couldn't find database details" };
  }

  // TODO: respond with a subset of belows openapi specific to 'databaseDetails.schema'
  console.log({ schema: databaseDetails.schema });
  return openapi;
};
