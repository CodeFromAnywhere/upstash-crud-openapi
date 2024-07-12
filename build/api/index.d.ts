import { OpenapiDocument } from "openapi-util";
import openapi from "../src/openapi.json";
export declare const tryParseData: (request: Request, isJsonContentType: boolean) => Promise<any>;
/**
 * Function that turns a regular function into an endpoint. If the function is available in the OpenAPI (with function name equalling the operationId), the input will be validated.
 *
 * NB: You can use this anywhere you want your openapi to be available. Usually it's in a catch-all route, but you can also use other next routing in case you need to have pages in some cases.
 */
export declare const resolveOpenapiAppRequest: (request: Request, method: string, config: {
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