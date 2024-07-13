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
        "/createDatabase": {
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
                summary: string;
                operationId: string;
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
            parameters: {
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                required: boolean;
            }[];
        };
        "/{databaseSlug}/schema.json": {
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
                                    properties: {};
                                    additionalProperties: boolean;
                                };
                            };
                        };
                    };
                };
            };
            parameters: {
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                required: boolean;
            }[];
        };
        "/read": {
            post: {
                summary: string;
                operationId: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
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
        "/create": {
            post: {
                summary: string;
                operationId: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
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
        "/remove": {
            post: {
                summary: string;
                operationId: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
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
        "/update": {
            post: {
                summary: string;
                operationId: string;
                requestBody: {
                    required: boolean;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
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
    };
    security: {
        apiKey: never[];
    }[];
    components: {
        schemas: {
            UrlSlug: {
                type: string;
                pattern: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            CreateResponse: {
                type: string;
                properties: {
                    isSuccessful: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                    result: {
                        type: string;
                        items: {
                            type: string;
                        };
                        description: string;
                    };
                };
                required: string[];
            };
            CreateContext: {
                type: string;
                properties: {
                    databaseSlug: {
                        type: string;
                    };
                    items: {
                        type: string;
                        items: {
                            $ref: string;
                            description: string;
                        };
                    };
                };
                additionalProperties: boolean;
                required: string[];
            };
            Sort: {
                type: string;
                properties: {
                    sortDirection: {
                        type: string;
                        enum: string[];
                    };
                    objectParameterKey: {
                        type: string;
                    };
                };
                required: string[];
            };
            Filter: {
                type: string;
                properties: {
                    operator: {
                        type: string;
                        enum: string[];
                    };
                    value: {
                        type: string;
                    };
                    objectParameterKey: {
                        type: string;
                    };
                };
                required: string[];
            };
            ReadResponse: {
                type: string;
                properties: {
                    isSuccessful: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                    $schema: {
                        type: string;
                    };
                    items: {
                        type: string;
                        additionalProperties: {
                            $ref: string;
                        };
                    };
                    schema: {
                        type: string;
                        additionalProperties: boolean;
                    };
                    canWrite: {
                        type: string;
                    };
                    hasMore: {
                        type: string;
                    };
                };
                required: string[];
            };
            ReadContext: {
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    databaseSlug: {
                        type: string;
                    };
                    search: {
                        type: string;
                    };
                    vectorSearch: {
                        type: string;
                        properties: {
                            propertyKey: {
                                type: string;
                            };
                            input: {
                                type: string;
                            };
                            topK: {
                                type: string;
                            };
                            minimumSimilarity: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                    rowIds: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    startFromIndex: {
                        type: string;
                    };
                    maxRows: {
                        type: string;
                    };
                    filter: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    sort: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    objectParameterKeys: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    ignoreObjectParameterKeys: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
            };
            UpdateContext: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    databaseSlug: {
                        type: string;
                    };
                    id: {
                        type: string;
                        description: string;
                    };
                    partialItem: {
                        $ref: string;
                        description: string;
                    };
                };
                required: string[];
            };
            UpdateResponse: {
                type: string;
                properties: {
                    isSuccessful: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                };
                required: string[];
            };
            ModelItem: {
                type: string;
                properties: {};
                additionalProperties: boolean;
            };
            RemoveContext: {
                type: string;
                properties: {
                    databaseSlug: {
                        type: string;
                    };
                    rowIds: {
                        description: string;
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
                additionalProperties: boolean;
                required: string[];
            };
            RemoveResponse: {
                type: string;
                properties: {
                    isSuccessful: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                    deleteCount: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
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
        securitySchemes: {
            apiKey: {
                type: string;
                bearerFormat: string;
                scheme: string;
                description: string;
            };
        };
    };
};
//# sourceMappingURL=getOpenapi.d.ts.map