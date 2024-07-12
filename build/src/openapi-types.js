export const operationUrlObject = {
    "getOpenapi": {
        "method": "get",
        "path": "/openapi.json"
    },
    "listDatabases": {
        "method": "get",
        "path": "/listDatabases"
    },
    "createDatabase": {
        "method": "post",
        "path": "/createDatabase"
    },
    "renderCrudOpenapi": {
        "method": "get",
        "path": "/{databaseSlug}/openapi.json"
    },
    "getSchema": {
        "method": "get",
        "path": "/{databaseSlug}/schema.json"
    },
    "updateDatabase": {
        "method": "post",
        "path": "/{databaseSlug}/updateDatabase"
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
};
export const operationKeys = Object.keys(operationUrlObject);
//# sourceMappingURL=openapi-types.js.map