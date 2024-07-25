export interface paths {
    "/oauth/permission": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** All your info */
        get: operations["permission"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    permission: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Given name or generated name */
                        slug: string;
                        createdAt: number;
                        service?: string;
                        scope?: string;
                        authToken: string;
                    };
                };
            };
            /** @description Unauthorized */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
        };
    };
}

  


export const operationUrlObject = {
  "permission": {
    "method": "get",
    "path": "/oauth/permission"
  }
}
export const operationKeys = Object.keys(operationUrlObject);