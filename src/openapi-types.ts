export interface paths {
    "/makeProxyOpenapi": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Makes an openapi from an OpenAPI Proxy specification. */
        post: operations["makeProxyOpenapi"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        StandardResponse: {
            isSuccessful: boolean;
            message?: string;
            priceCredit?: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    makeProxyOpenapi: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            /** @description Standard response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StandardResponse"];
                };
            };
        };
    };
}


export type StandardResponse = components["schemas"]["StandardResponse"]
  
export const operationUrlObject = {
  "makeProxyOpenapi": {
    "method": "post",
    "path": "/makeProxyOpenapi"
  }
}
export const operationKeys = Object.keys(operationUrlObject);