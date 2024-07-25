import { mapValuesSync } from "from-anywhere";
import crudOpenapi from "../../src/crud-openapi.json" assert { type: "json" };
import { getDatabaseDetails } from "../getDatabaseDetails.js";
import { removePropertiesFromObjectSchema } from "../removePropertiesFromObjectSchema.js";
const isDev = process.env.__VERCEL_DEV_RUNNING === "1";
/**
Should make a CRUD openapi from the schema fetched from database id
*/
export const getCrudOpenapi = async (context) => {
    const { databaseSlug } = context;
    // comes from path parameter
    const { databaseDetails } = await getDatabaseDetails(databaseSlug);
    if (!databaseDetails) {
        return {
            status: 404,
            isSuccessful: false,
            message: "Couldn't find database details for db " + databaseSlug,
        };
    }
    const origin = isDev
        ? "http://localhost:3000"
        : "https://data.actionschema.com";
    const schemasWithoutDatabaseSlug = mapValuesSync(crudOpenapi.components.schemas, (schema) => schema.type === "object"
        ? removePropertiesFromObjectSchema(schema, [
            "databaseSlug",
        ])
        : schema);
    const improved = {
        ...crudOpenapi,
        components: {
            ...crudOpenapi.components,
            schemas: {
                ...schemasWithoutDatabaseSlug,
                ModelItem: databaseDetails.schema,
            },
        },
        info: { title: `${databaseSlug} CRUD`, version: "1.0", description: "" },
        servers: [{ url: `${origin}/${databaseSlug}` }],
    };
    // bit ugly but couldn't find another way
    return improved;
};
//# sourceMappingURL=getCrudOpenapi.js.map