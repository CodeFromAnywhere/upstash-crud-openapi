/** Ensures the server is correct */
export declare const getOpenapi: () => {
    servers: {
        url: string;
    }[];
    "x-actionschema": string;
    $schema: string;
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    security: {
        oauth2: never[];
    }[];
    components: {
        securitySchemes: {
            oauth2: {
                type: string;
                flows: {
                    authorizationCode: {
                        authorizationUrl: string;
                        tokenUrl: string;
                        scopes: {
                            admin: string;
                            "admin:{projectSlug}": string;
                        };
                    };
                };
            };
        };
        schemas: {
            UrlSlug: {
                type: string;
                pattern: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            CreateDatabaseResponse: {
                type: string;
                required: string[];
                properties: {
                    isSuccessful: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                    authToken: {
                        type: string;
                    };
                    adminAuthToken: {
                        type: string;
                    };
                    databaseSlug: {
                        type: string;
                    };
                    openapiUrl: {
                        type: string;
                    };
                };
            };
            VectorIndexColumns: {
                description: string;
                type: string;
                items: {
                    type: string;
                    properties: {
                        propertyKey: {
                            type: string;
                        };
                        model: {
                            type: string;
                            enum: string[];
                        };
                        region: {
                            type: string;
                            enum: string[];
                        };
                        dimension_count: {
                            type: string;
                        };
                        similarity_function: {
                            type: string;
                            enum: string[];
                        };
                    };
                    required: string[];
                };
            };
            StandardResponse: {
                type: string;
                required: string[];
                properties: {
                    status: {
                        type: string;
                    };
                    isSuccessful: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                    priceCredit: {
                        type: string;
                    };
                };
            };
        };
    };
    paths: {
        "/listDatabases": {
            get: {
                summary: string;
                operationId: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        isSuccessful: {
                                            type: string;
                                        };
                                        message: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                        };
                                        currentProjectSlug: {
                                            type: string;
                                            description: string;
                                        };
                                        databases: {
                                            type: string;
                                            items: {
                                                type: string;
                                                additionalProperties: boolean;
                                                required: string[];
                                                properties: {
                                                    databaseSlug: {
                                                        type: string;
                                                    };
                                                    openapiUrl: {
                                                        type: string;
                                                    };
                                                    authToken: {
                                                        type: string;
                                                        description: string;
                                                    };
                                                    schema: {
                                                        type: string;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        "/upsertDatabase": {
            post: {
                summary: string;
                operationId: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    databaseSlug: {
                                        title: string;
                                        description: string;
                                        $ref: string;
                                    };
                                    schemaString: {
                                        title: string;
                                        type: string;
                                        description: string;
                                    };
                                    authToken: {
                                        type: string;
                                        description: string;
                                        minLength: number;
                                        maxLength: number;
                                    };
                                    isUserLevelSeparationEnabled: {
                                        type: string;
                                        description: string;
                                    };
                                    region: {
                                        description: string;
                                        type: string;
                                        enum: string[];
                                    };
                                    vectorIndexColumns: {
                                        $ref: string;
                                    };
                                    openaiApiKey: {
                                        type: string;
                                        description: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/removeDatabase": {
            post: {
                summary: string;
                operationId: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    databaseSlug: {
                                        $ref: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/setCurrentProject": {
            post: {
                summary: string;
                operationId: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    projectSlug: {
                                        $ref: string;
                                    };
                                    description: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/listProjects": {
            get: {
                summary: string;
                operationId: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {
                                        projects: {
                                            type: string;
                                            items: {
                                                type: string;
                                                properties: {
                                                    projectSlug: {
                                                        $ref: string;
                                                    };
                                                    description: {
                                                        type: string;
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        "/removeProject": {
            post: {
                summary: string;
                operationId: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    projectSlug: {
                                        $ref: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/openapi.json": {
            get: {
                security: ({
                    oauth2: never[];
                } | {
                    oauth2?: undefined;
                })[];
                summary: string;
                operationId: string;
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/{databaseSlug}/openapi.json": {
            get: {
                security: ({
                    oauth2: never[];
                } | {
                    oauth2?: undefined;
                })[];
                summary: string;
                operationId: string;
                parameters: {
                    in: string;
                    name: string;
                    schema: {
                        type: string;
                    };
                    required: boolean;
                }[];
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        required?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        required: string[];
                                        properties: {
                                            isSuccessful: {
                                                type: string;
                                            };
                                            message: {
                                                type: string;
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
        };
        "/project/{projectSlug}/openapi.json": {
            get: {
                security: ({
                    oauth2: never[];
                } | {
                    oauth2?: undefined;
                })[];
                summary: string;
                operationId: string;
                parameters: {
                    in: string;
                    name: string;
                    schema: {
                        type: string;
                    };
                    required: boolean;
                }[];
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        required?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        required: string[];
                                        properties: {
                                            isSuccessful: {
                                                type: string;
                                            };
                                            message: {
                                                type: string;
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
        };
        "/project/{projectSlug}/schema.json": {
            get: {
                security: ({
                    oauth2: never[];
                } | {
                    oauth2?: undefined;
                })[];
                summary: string;
                operationId: string;
                parameters: {
                    in: string;
                    name: string;
                    schema: {
                        type: string;
                    };
                    required: boolean;
                }[];
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {};
                                    additionalProperties: boolean;
                                };
                            };
                        };
                    };
                };
            };
        };
        "/{databaseSlug}/schema.json": {
            get: {
                security: ({
                    oauth2: never[];
                } | {
                    oauth2?: undefined;
                })[];
                summary: string;
                operationId: string;
                parameters: {
                    in: string;
                    name: string;
                    schema: {
                        type: string;
                    };
                    required: boolean;
                }[];
                responses: {
                    "200": {
                        description: string;
                        content: {
                            "application/json": {
                                schema: {
                                    type: string;
                                    properties: {};
                                    additionalProperties: boolean;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=getOpenapi.d.ts.map