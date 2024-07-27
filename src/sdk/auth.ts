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
    "/admin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** All your info */
        get: operations["authenticate"];
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
                        permission?: {
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
                        message?: string;
                        userAuthToken?: string;
                        isAuthorized?: boolean;
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
    authenticate: {
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
                        /** @description Model to connect third party oauth providers/servers so users can login with them and get access to information and actions there. You can create multiple 'provider clients' per provider because each client usually has a specific app-name and sometimes predetermined scope.
                         *
                         *     It's important to note, that, for now, this can only be defined by the auth admin, which is the person hosting the auth service. In the future, when allowing for subdomains, we could allow for more definitions of by others, but it's not secure now. */
                        providers?: {
                            /** @description Provider slug as defined in providers.json */
                            providerSlug: string;
                            /** @description Description for this provider */
                            description?: string;
                            /** @description Unique identifier as defined by the provider. Can be assumed to be unique inhere too. */
                            clientId: string;
                            /** @description Secret provided by the provider. */
                            clientSecret: string;
                            /** @description Will be the value that replaces {slug} in URLs. Usually represents the name of your app. Needed for some providers like Slack. */
                            urlSlug?: string;
                        }[];
                        /** @description List of access tokens the user is authorized for. Can be from oauth providers  but also direct secrets in several formats. */
                        providerPermissions?: {
                            /** @description slug representation for the API as defined in providers.json */
                            providerSlug?: string;
                            /** @description Needed in case it's of an unidentified provider */
                            name?: string;
                            /** @description Needed in case it's of an unidentified provider */
                            openapiUrl?: string;
                            /** @description Unique user id within the system of the provider. Can be a username, email, or phone number. Used for linking accounts with trusted providers. */
                            userId?: string;
                            /** @description The access token string as issued by the authorization server. */
                            access_token: string;
                            /** @description The type of token this is, typically just the string 'Bearer'. */
                            token_type: string;
                            /** @description The lifetime in seconds of the access token. */
                            expires_in?: number;
                            /** @description The refresh token, which can be used to obtain new access tokens using the same authorization grant. */
                            refresh_token?: string;
                            /** @description A space-separated list of scopes that the access token is valid for. */
                            scope?: string;
                        }[];
                        /** @description Model to use ActionSchema Auth as OAuth Server, so other systems (Such as OpenAI GPTs or your own websites, CLIs, or agents) can integrate with your providerPermissions. */
                        clients?: {
                            name?: string;
                            description?: string;
                            /** @description Must be a unique clientId across the entire domain, but can be named by the user. */
                            clientId: string;
                            /** @description 64-character string that is the secret of this client */
                            clientSecret: string;
                            /** @description If not given, uses ?redirect_url. If given, the callbackUrl cannot be overwritten anymore by ?redirect_url. */
                            callbackUrl?: string;
                            /** @description Space separated scope. Subset of the scope as defined in providers.json. If given, will use this as standard scope. Can be overrided by the ?scope parameter. */
                            scope?: string;
                            /** @description Can be multiple providers. ActionSchema Auth will ensure all access is granted before servicing a new access token to the user. */
                            requiredProviders?: {
                                providerSlug: string;
                                scope: string;
                                /** @description Reason shown to the user to why access is needed. */
                                reason?: string;
                            }[];
                            /** @description If true, this client will provide the direct access token of the service, rather than an access_token for ActionSchema Auth. */
                            retrieveDirectAccessToken?: boolean;
                        }[];
                        /** @description Applications, Agents, Code, CLIs, or anything that has access to your account. Can also be used to create API Keys for developers. */
                        clientPermissions?: {
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
                        }[];
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
  },
  "authenticate": {
    "method": "get",
    "path": "/admin"
  }
}
export const operationKeys = Object.keys(operationUrlObject);