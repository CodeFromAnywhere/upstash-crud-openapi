export const operationUrlObject = {
    "createDatabase": {
        "method": "post",
        "path": "/root/createDatabase"
    },
    "updateDatabase": {
        "method": "post",
        "path": "/{databaseSlug}/updateDatabase"
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
};
export const operationKeys = Object.keys(operationUrlObject);
//# sourceMappingURL=openapi-types.js.map