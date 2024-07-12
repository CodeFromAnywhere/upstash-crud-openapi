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
        "/listDatabases": {
            parameters: {
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                required: boolean;
                description: string;
            }[];
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
                                                properties: {
                                                    databaseSlug: {
                                                        type: string;
                                                    };
                                                    authToken: {
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
            parameters: {
                in: string;
                required: boolean;
                name: string;
                schema: {
                    type: string;
                    description: string;
                };
            }[];
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
                                    vectorIndexColumns: {
                                        $ref: string;
                                    };
                                    authToken: {
                                        type: string;
                                        description: string;
                                    };
                                    region: {
                                        description: string;
                                        type: string;
                                        enum: string[];
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
        "/{databaseSlug}/updateDatabase": {
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
                                    schemaString: {
                                        type: string;
                                        description: string;
                                    };
                                    authToken: {
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
            parameters: ({
                in: string;
                required: boolean;
                name: string;
                schema: {
                    type: string;
                    description: string;
                };
            } | {
                in: string;
                name: string;
                schema: {
                    type: string;
                    description?: undefined;
                };
                required: boolean;
            })[];
        };
        "/{databaseSlug}/read": {
            parameters: ({
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                required: boolean;
                description?: undefined;
            } | {
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                required: boolean;
                description: string;
            })[];
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
        "/{databaseSlug}/create": {
            parameters: ({
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                required: boolean;
                description?: undefined;
            } | {
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                required: boolean;
                description: string;
            })[];
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
        "/{databaseSlug}/remove": {
            parameters: {
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                description: string;
                required: boolean;
            }[];
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
        "/{databaseSlug}/update": {
            parameters: ({
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                required: boolean;
                description?: undefined;
            } | {
                in: string;
                name: string;
                schema: {
                    type: string;
                };
                required: boolean;
                description: string;
            })[];
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
                    items: {
                        type: string;
                        items: {
                            $ref: string;
                            description: string;
                        };
                    };
                };
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
                properties: {
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
                properties: {
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
                    rowIds: {
                        description: string;
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
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
};
//# sourceMappingURL=getOpenapi.d.ts.map