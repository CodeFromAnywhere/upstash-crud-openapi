import { Endpoint } from "../client.js";
import { O } from "from-anywhere";
import { OpenapiSchemaObject } from "from-anywhere";
import { SchemaObject } from "openapi-typescript";
export declare const replaceRefs: (schema: OpenapiSchemaObject, refs: O) => any;
/** Renames all refs to #/components/schemas/ instead of #/definitions */
export declare const renameRefs: (schema: SchemaObject | undefined) => any;
/**
Should make a CRUD openapi from the schema fetched from database id
*/
export declare const getCrudOpenapi: Endpoint<"getCrudOpenapi">;
//# sourceMappingURL=getCrudOpenapi.d.ts.map