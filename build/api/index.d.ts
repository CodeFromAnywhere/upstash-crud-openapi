import { OpenapiDocument, OpenapiOperationObject } from "openapi-util";
import openapi from "../src/openapi.json";
import { JSONSchema7 } from "json-schema";
/** Retreives the right body from the request based on the openapi and operation */
export declare const getRequestOperationBody: (openapi: OpenapiDocument, operation: OpenapiOperationObject, documentLocation: string, request: Request) => Promise<{
    schema: JSONSchema7;
    data: any;
} | {
    schema: JSONSchema7 | undefined;
    data: undefined;
}>;
/** Retrieves an object of the query params belonging to an endpoint */
export declare const getUrlQueryParams: (url: string, permittedQueryKeys: string[]) => {
    [key: string]: string;
};
/**
 * Function that turns a regular function into an endpoint. If the function is available in the OpenAPI (with function name equalling the operationId), the input will be validated.
 *
 * NB: You can use this anywhere you want your openapi to be available. Usually it's in a catch-all route, but you can also use other next routing in case you need to have pages in some cases.
 */
export declare const resolveOpenapiAppRequest: (request: Request, method: string, config: {
    /** If given, must be a parameterName. If so, will also try to match against all paths with the prefix removed, giving the parameter to the body. Useful when you want to serve openapis that are subsets of the main server implementation
     */
    prefixParameterName?: string | undefined;
    openapi: OpenapiDocument;
    functions: {
        [functionName: string]: (jsonBody: any) => any | Promise<any>;
    };
}) => Promise<Response>;
export declare const GET: (request: Request) => Promise<Response>;
export declare const POST: (request: Request) => Promise<Response>;
export declare const PUT: (request: Request) => Promise<Response>;
export declare const PATCH: (request: Request) => Promise<Response>;
export declare const DELETE: (request: Request) => Promise<Response>;
export declare const HEAD: (request: Request) => Promise<Response>;
export declare const OPTIONS: (request: Request) => Promise<Response>;
//# sourceMappingURL=index.d.ts.map