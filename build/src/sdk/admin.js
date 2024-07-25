export const operationUrlObject = {
    "listDatabases": {
        "method": "get",
        "path": "/listDatabases"
    },
    "upsertDatabase": {
        "method": "post",
        "path": "/upsertDatabase"
    },
    "removeDatabase": {
        "method": "post",
        "path": "/removeDatabase"
    },
    "setCurrentProject": {
        "method": "post",
        "path": "/setCurrentProject"
    },
    "listProjects": {
        "method": "get",
        "path": "/listProjects"
    },
    "removeProject": {
        "method": "post",
        "path": "/removeProject"
    },
    "getOpenapi": {
        "method": "get",
        "path": "/openapi.json"
    },
    "getCrudOpenapi": {
        "method": "get",
        "path": "/{databaseSlug}/openapi.json"
    },
    "getProjectOpenapi": {
        "method": "get",
        "path": "/project/{projectSlug}/openapi.json"
    },
    "getSchema": {
        "method": "get",
        "path": "/{databaseSlug}/schema.json"
    }
};
export const operationKeys = Object.keys(operationUrlObject);
//# sourceMappingURL=admin.js.map