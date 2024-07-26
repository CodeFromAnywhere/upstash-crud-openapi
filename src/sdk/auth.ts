export interface paths {
    "/permission": {
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
                        /** @enum {string} */
                        providerSlug: "actionschema-auth";
                        /** @description Can be a reference to the clientId of the client within actionschema that granted this permission. Can be a client of another user. */
                        clientId?: string;
                        description?: string;
                        /**
                         * @description A space-separated list of scopes that the access token is valid for. Only possible combination is 'admin' for now, which means access to everything.
                         * @enum {string}
                         */
                        scope: "admin";
                        /** @description Unix timestamp in MS */
                        createdAt: number;
                        /** @description The access token string as issued by us. */
                        access_token: string;
                        /**
                         * @description The type of token this is. Always gives Bearer now.
                         * @enum {string}
                         */
                        token_type: "Bearer";
                        /** @description The lifetime in seconds of the access token. */
                        expires_in?: number;
                        /** @description The refresh token, which can be used to obtain new access tokens using the same authorization grant. */
                        refresh_token?: string;
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
    "path": "/permission"
  }
}
export const operationKeys = Object.keys(operationUrlObject);