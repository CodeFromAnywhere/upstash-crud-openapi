export const operationUrlObject = {
    "listDatabases": {
        "method": "get",
        "path": "/listDatabases"
    },
    "createDatabase": {
        "method": "post",
        "path": "/createDatabase"
    },
    "getOpenapi": {
        "method": "get",
        "path": "/openapi.json"
    },
    "getCrudOpenapi": {
        "method": "get",
        "path": "/{databaseSlug}/openapi.json"
    },
    "getSchema": {
        "method": "get",
        "path": "/{databaseSlug}/schema.json"
    },
    "read": {
        "method": "post",
        "path": "/read"
    },
    "create": {
        "method": "post",
        "path": "/create"
    },
    "remove": {
        "method": "post",
        "path": "/remove"
    },
    "update": {
        "method": "post",
        "path": "/update"
    }
};
export const operationKeys = Object.keys(operationUrlObject);
//# sourceMappingURL=openapi-types.js.map