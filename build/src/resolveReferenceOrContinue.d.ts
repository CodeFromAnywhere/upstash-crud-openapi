import { JSONSchemaType } from "ajv";
import { OpenapiDocument, ReferenceObject } from "openapi-util";
/**
 * Function that resolves $ref, continues if it's not a ref, or throws an error
 *
 * Where it can resolve:
 *
 * - in-file absolute locations
 * - relative file locations
 * - url locations
 */
export declare const resolveReferenceOrContinue: <T extends unknown>(maybeReference: import("openapi-types").OpenAPIV3.ReferenceObject | T | undefined, document: OpenapiDocument | JSONSchemaType<any>, documentLocation?: string) => Promise<T | undefined>;
//# sourceMappingURL=resolveReferenceOrContinue.d.ts.map