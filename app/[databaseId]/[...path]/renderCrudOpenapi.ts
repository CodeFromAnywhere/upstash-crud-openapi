import {
  O,
  mergeObjectsArray,
  notEmpty,
  removeOptionalKeysFromObjectStrings,
  pascalCase,
} from "from-anywhere";
import {
  OpenapiDocument,
  OpenapiMediaType,
  OpenapiSchemaObject,
} from "from-anywhere/types";
import { Redis } from "@upstash/redis";
import { JSONSchema7 } from "json-schema";
import { PathsObject, SchemaObject } from "openapi-typescript";

// import { getUpstashRedisDatabase } from "./upstashRedis";
// import { rootDatabaseName } from "./state";
// import { DatabaseDetails } from "./types";
import openapi from "../../../public/openapi.json";
import { getUpstashRedisDatabase } from "@/lib/upstashRedis";
import { rootDatabaseName } from "@/lib/state";
import { DatabaseDetails } from "@/lib/types";
import { Endpoint } from "@/client";

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
  const databaseId = context.databaseId;
  const upstashEmail = context["X-UPSTASH-API-KEY"];
  const upstashApiKey = context["X-UPSTASH-EMAIL"];

  if (!upstashEmail || !upstashApiKey) {
    return {
      isSuccessful: false,
      message: "Please pass upstash credentials",
    };
  }
  console.log(`makeActionSchemaOpenapi`, context);

  // step 2: validate authToken and find db name.
  const db = await getUpstashRedisDatabase({
    upstashEmail,
    upstashApiKey,
    databaseId: rootDatabaseName,
  });

  if (!db) {
    return {
      isSuccessful: false,
      message: "Could not find root",
    };
  }

  const root = new Redis({
    url: `https://${db.endpoint}`,
    token: db.rest_token,
  });

  const result: DatabaseDetails | null = await root.get(databaseId);

  if (!result) {
    return {
      isSuccessful: false,
      message: "Could not find db",
    };
  }

  // // crud
  // const actionSchemaCreateFunction = await getIndexedSwcStatement<SwcFunction>(
  //   "actionSchemaCreate",
  // );

  // const createSchema = actionSchemaCreateFunction?.parameters?.[0]
  //   ?.schema as OpenapiSchemaObject;
  // const createReturnType = (actionSchemaCreateFunction?.returnType?.schema || {
  //   $ref: "#/components/schemas/StandardResponse",
  // }) as OpenapiSchemaObject;

  // const actionSchemaReadFunction = await getIndexedSwcStatement<SwcFunction>(
  //   "actionSchemaRead",
  // );
  // const readSchema = actionSchemaReadFunction?.parameters?.[0]
  //   ?.schema as OpenapiSchemaObject;
  // const readReturnType = (actionSchemaReadFunction?.returnType?.schema || {
  //   $ref: "#/components/schemas/StandardResponse",
  // }) as OpenapiSchemaObject;

  // const actionSchemaUpdateFunction = await getIndexedSwcStatement<SwcFunction>(
  //   "actionSchemaUpdate",
  // );
  // const updateSchema = actionSchemaUpdateFunction?.parameters?.[0]
  //   ?.schema as OpenapiSchemaObject;
  // const updateReturnType = (actionSchemaUpdateFunction?.returnType?.schema || {
  //   $ref: "#/components/schemas/StandardResponse",
  // }) as OpenapiSchemaObject;

  // const actionSchemaDeleteFunction = await getIndexedSwcStatement<SwcFunction>(
  //   "actionSchemaDelete",
  // );
  // const deleteSchema = actionSchemaDeleteFunction?.parameters?.[0]
  //   ?.schema as OpenapiSchemaObject;
  // const deleteReturnType = (actionSchemaDeleteFunction?.returnType?.schema || {
  //   $ref: "#/components/schemas/StandardResponse",
  // }) as OpenapiSchemaObject;

  // const actionSchemaExecuteFunction = await getIndexedSwcStatement<SwcFunction>(
  //   "actionSchemaExecute",
  // );
  // const executeSchema = actionSchemaExecuteFunction?.parameters?.[0]
  //   ?.schema as OpenapiSchemaObject;
  // const executeReturnType = (actionSchemaExecuteFunction?.returnType
  //   ?.schema || {
  //   $ref: "#/components/schemas/StandardResponse",
  // }) as OpenapiSchemaObject;

  //   const kebabName = schema.name;

  //   //Create the enum for keys for the model
  //   const modelKeyEnum: CapableJsonSchema = {
  //     type: "string",
  //     enum: schema.propertyKeys,
  //   };
  //   //Create the ModelItemPartial
  //   const { required, ...modelItemPartial } = schema.objectSchema;

  //   const definitions = schema.schema?.definitions;

  //   const modelRefs = {
  //     "#/definitions/ModelKey": modelKeyEnum,
  //     "#/definitions/ModelItemPartial": modelItemPartial,
  //     "#/definitions/ModelItem": schema.objectSchema,
  //   };

  //   const pathsObjectPart = {
  //     [`/v1/${kebabName}/read`]: {
  //       post: {
  //         tags: [kebabName],
  //         summary: `Read ${kebabName}`,
  //         description: readSchema.description,
  //         operationId: `read${pascalCase(kebabName)}`,
  //         // Not sure how this below part works!!!
  //         requestBody: {
  //           required: true,
  //           content: {
  //             "application/json": {
  //               schema: renameRefs(
  //                 withoutProperties(replaceRefs(readSchema, modelRefs), [
  //                   "projectRelativePath",
  //                 ]),
  //               ),
  //             } satisfies OpenapiMediaType,
  //           },
  //         },

  //         responses: {
  //           "200": {
  //             description: "Standard response",
  //             content: {
  //               "application/json": {
  //                 schema: renameRefs(replaceRefs(readReturnType, modelRefs)),
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },

  //     [`/v1/${kebabName}/create`]: {
  //       post: {
  //         tags: [kebabName],
  //         // security:[]
  //         summary: `Create ${kebabName}`,
  //         description: createSchema.description,
  //         operationId: `create${pascalCase(kebabName)}`,
  //         // Not sure how this below part works!!!
  //         requestBody: {
  //           required: true,
  //           content: {
  //             "application/json": {
  //               schema: renameRefs(
  //                 withoutProperties(replaceRefs(createSchema, modelRefs), [
  //                   "projectRelativePath",
  //                 ]),
  //               ),
  //             } satisfies OpenapiMediaType,
  //           },
  //         },

  //         responses: {
  //           "200": {
  //             description: "Standard response",
  //             content: {
  //               "application/json": {
  //                 schema: renameRefs(replaceRefs(createReturnType, modelRefs)),
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },

  //     [`/v1/${kebabName}/update`]: {
  //       post: {
  //         tags: [kebabName],

  //         summary: `Update ${kebabName}`,
  //         description: updateSchema.description,
  //         operationId: `update${pascalCase(kebabName)}`,
  //         // Not sure how this below part works!!!
  //         requestBody: {
  //           required: true,
  //           content: {
  //             "application/json": {
  //               schema: renameRefs(
  //                 withoutProperties(replaceRefs(updateSchema, modelRefs), [
  //                   "projectRelativePath",
  //                 ]),
  //               ),
  //             } satisfies OpenapiMediaType,
  //           },
  //         },

  //         responses: {
  //           "200": {
  //             description: "Standard response",
  //             content: {
  //               "application/json": {
  //                 schema: renameRefs(replaceRefs(updateReturnType, modelRefs)),
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     [`/v1/${kebabName}/execute`]: {
  //       put: {
  //         tags: [kebabName],
  //         summary: `Execute ${kebabName}`,
  //         description: executeSchema.description,
  //         operationId: `generate${pascalCase(kebabName)}`,
  //         requestBody: {
  //           required: true,

  //           content: {
  //             "application/json": {
  //               schema: renameRefs(
  //                 withoutProperties(replaceRefs(executeSchema, modelRefs), [
  //                   "projectRelativePath",
  //                 ]),
  //               ),
  //             } satisfies OpenapiMediaType,
  //           },
  //         },

  //         responses: {
  //           "200": {
  //             description: "Standard response",
  //             content: {
  //               "application/json": {
  //                 schema: renameRefs(replaceRefs(executeReturnType, modelRefs)),
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     [`/v1/${kebabName}`]: {
  //       delete: {
  //         tags: [kebabName],

  //         summary: `Delete ${kebabName}`,
  //         description: deleteSchema.description,
  //         operationId: `delete${pascalCase(kebabName)}`,
  //         // Not sure how this below part works!!!
  //         requestBody: {
  //           required: true,
  //           content: {
  //             "application/json": {
  //               schema: renameRefs(
  //                 withoutProperties(replaceRefs(deleteSchema, modelRefs), [
  //                   "projectRelativePath",
  //                 ]),
  //               ),
  //             } satisfies OpenapiMediaType,
  //           },
  //         },

  //         responses: {
  //           "200": {
  //             description: "Standard response",
  //             content: {
  //               "application/json": {
  //                 schema: renameRefs(replaceRefs(deleteReturnType, modelRefs)),
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   } as PathsObject;

  //   return { pathsObjectPart, definitions };
  // });

  // const paths = mergeObjectsArray(
  //   modelPaths.map((x) => x.pathsObjectPart).filter(notEmpty),
  // );

  // const schemaDefinitions = mergeObjectsArray(
  //   modelPaths.map((x) => x.definitions).filter(notEmpty),
  // );

  return { isSuccessful: true, message: "Done", openapi };
};
