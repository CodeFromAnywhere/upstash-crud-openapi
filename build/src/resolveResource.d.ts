import { JSONSchemaType } from "ajv";
import { OpenapiDocument } from "openapi-util";
/**
 * Reads and parses JSON file
 *
 * make sure to specify what type the file contains as a generic!
 */
export declare const readJsonFile: <T extends unknown>(filePath: string | undefined) => Promise<T | null>;
/**
 * Simple low-level way of resolving a $ref either from a URL or the (absolute or relative) file system.
 *
 * This serves as a more simple alternative of `resolveSchemaRecursive`, and adds the functionality of finding it in the file system to it.
 *
 * Other libraries have similar solutions but they all have shown different problems so far.
 */
export declare const resolveResource: (uri: string, document: OpenapiDocument | JSONSchemaType<any>, documentLocation: string) => Promise<OpenapiDocument | JSONSchemaType<any> | undefined>;
//# sourceMappingURL=resolveResource.d.ts.map