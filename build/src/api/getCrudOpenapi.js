import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { mapValuesSync, removeOptionalKeysFromObjectStrings, } from "from-anywhere";
import openapi from "../../src/openapi.json" assert { type: "json" };
const isDev = process.env.__VERCEL_DEV_RUNNING === "1";
export const replaceRefs = (schema, refs) => {
    const string = JSON.stringify(schema);
    const finalString = Object.keys(refs).reduce((newString, refKey) => {
        const json = JSON.stringify(refs[refKey]);
        const jsonWithoutBrackets = json.slice(1, json.length - 1);
        // NB: no spaces!
        return newString.replaceAll(`"$ref":"${refKey}"`, jsonWithoutBrackets);
    }, string);
    // console.log(finalString);
    return JSON.parse(finalString);
};
/** Renames all refs to #/components/schemas/ instead of #/definitions */
export const renameRefs = (schema) => {
    if (!schema) {
        return schema;
    }
    const string = JSON.stringify(schema);
    const newString = string.replaceAll(`"$ref":"#/definitions/`, `"$ref":"#/components/schemas/`);
    return JSON.parse(newString);
};
/** Removes one or more properties from an object json schema */
const removePropertiesFromObjectSchema = (schema, propertyKeys) => {
    return {
        ...schema,
        properties: schema.properties
            ? removeOptionalKeysFromObjectStrings(schema.properties, propertyKeys)
            : undefined,
        required: schema.required?.filter((key) => !propertyKeys.includes(key)),
    };
};
/**
Should make a CRUD openapi from the schema fetched from database id
*/
export const getCrudOpenapi = async (context) => {
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
    const origin = isDev
        ? "http://localhost:3000"
        : "https://data.actionschema.com";
    const schemasWithoutDatabaseSlug = mapValuesSync(openapi.components.schemas, (schema) => schema.type === "object"
        ? removePropertiesFromObjectSchema(schema, [
            "databaseSlug",
        ])
        : schema);
    const improved = {
        ...openapi,
        components: {
            ...openapi.components,
            schemas: {
                ...schemasWithoutDatabaseSlug,
                ModelItem: databaseDetails.schema,
            },
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "Bearer",
                    description: "Your authToken should be provided",
                },
            },
        },
        paths: {
            "/create": openapi.paths["/create"],
            "/read": openapi.paths["/read"],
            "/update": openapi.paths["/update"],
            "/remove": openapi.paths["/remove"],
        },
        info: { title: `${databaseSlug} CRUD`, version: "1.0", description: "" },
        servers: [{ url: `${origin}/${databaseSlug}` }],
        security: [{ bearerAuth: [] }],
    };
    // bit ugly but couldn't find another way
    return improved;
};
//# sourceMappingURL=getCrudOpenapi.js.map