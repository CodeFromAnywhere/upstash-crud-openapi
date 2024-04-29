export interface paths {
    "/root/createOrUpdateDatabase": {
        parameters: {
            query?: never;
            header?: {
                X_UPSTASH_EMAIL?: string;
                X_UPSTASH_API_KEY?: string;
                X_ADMIN_AUTH_TOKEN?: string;
            };
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createOrUpdateDatabase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{databaseSlug}/openapi.json": {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                databaseSlug: string;
            };
            cookie?: never;
        };
        /** Get openapi for this database table alone */
        get: operations["renderCrudOpenapi"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{databaseSlug}/read": {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                databaseSlug: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["read"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{databaseSlug}/create": {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                databaseSlug: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{databaseSlug}/remove": {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                /** @description Upstash ID of the database */
                databaseSlug: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["remove"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{databaseSlug}/update": {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                databaseSlug: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["update"];
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
        CreateResponse: {
            isSuccessful: boolean;
            message: string;
            /** @description The rowIds created */
            result?: string[];
        };
        CreateContext: {
            databaseSlug: string;
            items: Record<string, never>[];
        };
        Sort: {
            /** @enum {string} */
            sortDirection: "ascending" | "descending";
            objectParameterKey: string;
        };
        Filter: {
            /** @enum {string} */
            operator: "equal" | "notEqual" | "endsWith" | "startsWith" | "includes" | "includesLetters" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual" | "isIncludedIn" | "isFalsy" | "isTruthy";
            value: string;
            objectParameterKey: string;
        };
        ReadResponse: {
            isSuccessful: boolean;
            message: string;
            $schema?: string;
            items?: {
                [key: string]: {
                    [key: string]: unknown;
                } | undefined;
            };
            schema?: {
                [key: string]: unknown;
            };
            canWrite?: boolean;
            hasMore?: boolean;
        };
        ReadContext: {
            databaseSlug: string;
            search?: string;
            rowIds?: string[];
            startFromIndex?: number;
            maxRows?: number;
            filter?: components["schemas"]["Filter"][];
            sort?: components["schemas"]["Sort"][];
            objectParameterKeys?: string[];
            ignoreObjectParameterKeys?: string[];
        };
        UpdateContext: {
            databaseSlug: string;
            /** @description The id (indexed key) of the item to update. Update that functions as upsert. If the id didn't exist, it will be created. */
            id: string;
            /** @description New (partial) value of the item. Will update all keys provided here. Please note that it cannot be set to 'undefined' as this doesn't transfer over JSON, but if you set it to 'null', the value will be removed from the database. */
            partialItem: Record<string, never>;
        };
        UpdateResponse: {
            isSuccessful: boolean;
            message: string;
        };
        RemoveContext: {
            /** @description Which IDs should be removed */
            rowIds: string[];
            databaseSlug: string;
        };
        RemoveResponse: {
            isSuccessful: boolean;
            message: string;
            /** @description The number of items deleted */
            deleteCount?: number;
        };
        StandardResponse: {
            isSuccessful: boolean;
            message?: string;
            priceCredit?: number;
        };
        Contact: {
            name?: string;
            /** Format: uri-reference */
            url?: string;
            /** Format: email */
            email?: string;
            /** Format: phone */
            "x-phoneNumber"?: string;
            "x-description"?: string;
        };
        License: {
            name: string;
            /** Format: uri-reference */
            url?: string;
        };
        /** @description Ratelimiting extension by ActionSchema. Can be applied globally, per plan, per tag, or per operation */
        RateLimit: {
            limit?: number;
            /** @enum {string} */
            interval?: "second" | "minute";
        };
        Info: {
            title: string;
            description?: string;
            /** Format: uri-reference */
            termsOfService?: string;
            /** @description Contact information for the exposed API. */
            contact?: components["schemas"]["Contact"];
            /** @description The license information for the exposed API. */
            license?: components["schemas"]["License"];
            /** @description The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version). */
            version: string;
            /** @description Different people in the company and their capabilities and communication channels */
            "x-people"?: components["schemas"]["Contact"][];
            /** @description Product info. */
            "x-product"?: unknown;
            /** @description Important links needed for agents to make using the API easier. */
            "x-links"?: {
                signupUrl?: string;
                loginUrl?: string;
                forgotPasswordUrl?: string;
                pricingUrl?: string;
                /** @description Page from where logged-in user can make purchases, cancel subscription, etc. */
                billingUrl?: string;
                /** @description URL of a page where the user can see their usage and its cost. */
                usageUrl?: string;
                docsUrl?: string;
                supportUrl?: string;
                /** @description Url of the page where the user can find the required information for authorizing on the API. Usually this is a page where the user can create and see their API tokens. */
                apiAuthorizationSettingsUrl?: string;
            };
            /** @description Pricing info including monthly fees. */
            "x-pricing"?: {
                /** @description General summary of all plans */
                description?: string;
                plans?: {
                    price: number;
                    currency: string;
                    title: string;
                    /** @description How much credit do you get for this. Credit matches the credit spent with 'priceCredit' extension for operations */
                    credit: number;
                    /**
                     * @description How long will you retain the credit you receive?
                     * @enum {string}
                     */
                    persistence?: "forever" | "interval" | "capped";
                    /** @description Required when filling in persistence 'capped' */
                    persistenceCappedDays?: number;
                    /**
                     * @description If the plan is a subscription based plan, fill in the interval on which every time the price is paid, and credit is given.
                     *
                     *     If there is a pay-as-you-go price, fill in the minimum purchase size for each step. It will be assumed the price to credit ratio is linear.
                     * @enum {string}
                     */
                    interval?: "week" | "month" | "quarter" | "year";
                    /** @description Plan-based RateLimit info that overwrites the general rateLimit. */
                    rateLimit?: components["schemas"]["RateLimit"];
                }[];
            };
            /** @description Global ratelimit info. Can be overwritten either by plans or by operations. */
            "x-rateLimit"?: components["schemas"]["RateLimit"];
            /** @description General product reviews, collected. */
            "x-reviews"?: unknown;
            /** @description General latency info. */
            "x-latency"?: unknown;
            /** @description Link to other openapis that could be good alternatives. */
            "x-alternatives"?: unknown[];
            /** @description Logo metadata. Standard taken from https://apis.guru */
            "x-logo"?: {
                /**
                 * Format: uri
                 * @description URL to a logo image
                 */
                url?: string;
                backgroundColor?: string;
                secondaryColor?: string;
            };
        };
        ExternalDocumentation: {
            description?: string;
            /** Format: uri-reference */
            url: string;
            /** @description Scraped markdown from the url */
            markdown?: unknown;
        };
        ServerVariable: {
            enum?: string[];
            default: string;
            description?: string;
        };
        Server: {
            url: string;
            description?: string;
            variables?: {
                [key: string]: components["schemas"]["ServerVariable"] | undefined;
            };
        };
        SecurityRequirement: {
            [key: string]: string[] | undefined;
        };
        Tag: {
            name: string;
            description?: string;
            externalDocs?: components["schemas"]["ExternalDocumentation"];
            /** @description Tag-based ratelimit info. */
            "x-rateLimit"?: components["schemas"]["RateLimit"];
        };
        Paths: Record<string, never>;
        Components: {
            schemas?: Record<string, never>;
            responses?: Record<string, never>;
            parameters?: Record<string, never>;
            examples?: Record<string, never>;
            requestBodies?: Record<string, never>;
            headers?: Record<string, never>;
            securitySchemes?: Record<string, never>;
            links?: Record<string, never>;
            callbacks?: Record<string, never>;
        };
        /**
         * OpenAPI Document
         * @description The description of OpenAPI v3.0.x documents, as defined by https://spec.openapis.org/oas/v3.0.3 and extended by ActionSchema.
         */
        "openapi.schema": {
            /** Format: uri-reference */
            $schema: string;
            /** Format: uri-reference */
            $id?: string;
            /**
             * Format: uri-reference
             * @description If given, should be a url linking to the original file, the starting point, if this is not already the one. Used to determine if anything has changed.
             */
            $source?: string;
            /** @description Version */
            openapi: string;
            /**
             * @description Version of actionschema.
             * @default 0.0.1
             */
            "x-actionschema": string;
            /** @description Provides metadata about the API. The metadata MAY be used by tooling as required. */
            info: components["schemas"]["Info"];
            /** @description Additional external documentation. */
            externalDocs?: components["schemas"]["ExternalDocumentation"];
            /** @description An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /. */
            servers?: components["schemas"]["Server"][];
            /** @description An array of Server Objects, indicating the original servers. Useful when defining a proxy. */
            "x-origin-servers"?: components["schemas"]["Server"][];
            /**
             * @description A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. To make security optional, an empty security requirement ({}) can be included in the array.
             *
             *     Please note: Every item in this array is an object with keys being the scheme names (can be anything). These names should then also be defined in components.securitySchemes.
             * @default [
             *       {
             *         "apiKey": []
             *       }
             *     ]
             */
            security: components["schemas"]["SecurityRequirement"][];
            /** @description Used for grouping endpoints together.
             *
             *     A list of tags used by the specification with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the Operation Object must be declared. The tags that are not declared MAY be organized randomly or based on the tools' logic. Each tag name in the list MUST be unique. */
            tags?: components["schemas"]["Tag"][];
            /** @description The available paths and operations for the API. */
            paths: components["schemas"]["Paths"];
            /** @description An element to hold various schemas for the specification. */
            components?: components["schemas"]["Components"];
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
    createOrUpdateDatabase: {
        parameters: {
            query?: never;
            header?: {
                X_UPSTASH_EMAIL?: string;
                X_UPSTASH_API_KEY?: string;
                X_ADMIN_AUTH_TOKEN?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    schemaString: string;
                    databaseSlug: string;
                    authToken?: string;
                    /**
                     * @description Can be set for a new database. Cannot be changed
                     * @enum {string}
                     */
                    region?: "eu-west-1" | "us-east-1" | "us-west-1" | "ap-northeast-1" | "us-central1";
                };
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
    renderCrudOpenapi: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                databaseSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["openapi.schema"] | {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    read: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                databaseSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReadContext"];
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadResponse"];
                };
            };
        };
    };
    create: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                databaseSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateContext"];
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateResponse"];
                };
            };
        };
    };
    remove: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                /** @description Upstash ID of the database */
                databaseSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RemoveContext"];
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RemoveResponse"];
                };
            };
        };
    };
    update: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                databaseSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateContext"];
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateResponse"];
                };
            };
        };
    };
}


export type CreateResponse = components["schemas"]["CreateResponse"]
export type CreateContext = components["schemas"]["CreateContext"]
export type Sort = components["schemas"]["Sort"]
export type Filter = components["schemas"]["Filter"]
export type ReadResponse = components["schemas"]["ReadResponse"]
export type ReadContext = components["schemas"]["ReadContext"]
export type UpdateContext = components["schemas"]["UpdateContext"]
export type UpdateResponse = components["schemas"]["UpdateResponse"]
export type RemoveContext = components["schemas"]["RemoveContext"]
export type RemoveResponse = components["schemas"]["RemoveResponse"]
export type StandardResponse = components["schemas"]["StandardResponse"]
  
export const operationUrlObject = {
  "createOrUpdateDatabase": {
    "method": "post",
    "path": "/root/createOrUpdateDatabase"
  },
  "renderCrudOpenapi": {
    "method": "get",
    "path": "/{databaseSlug}/openapi.json"
  },
  "read": {
    "method": "post",
    "path": "/{databaseSlug}/read"
  },
  "create": {
    "method": "post",
    "path": "/{databaseSlug}/create"
  },
  "remove": {
    "method": "post",
    "path": "/{databaseSlug}/remove"
  },
  "update": {
    "method": "post",
    "path": "/{databaseSlug}/update"
  }
}
export const operationKeys = Object.keys(operationUrlObject);