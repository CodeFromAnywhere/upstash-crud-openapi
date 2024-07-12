import { resolveOpenapiAppRequest } from "openapi-util/build/node/resolveOpenapiAppRequest";
import { create } from "./[databaseSlug]/create";
import { read } from "./[databaseSlug]/read";
import { update } from "./[databaseSlug]/update";
import { remove } from "./[databaseSlug]/remove";
import { renderCrudOpenapi } from "./[databaseSlug]/renderCrudOpenapi";
import { createDatabase } from "./root/createDatabase";
import { updateDatabase } from "./root/updateDatabase";
import openapi from "../public/openapi.json";
/** function creator to DRY */
const getHandler = (method) => (request) => resolveOpenapiAppRequest(request, method, {
    openapi: openapi,
    functions: {
        create,
        read,
        update,
        remove,
        renderCrudOpenapi,
        createDatabase,
        updateDatabase,
    },
});
export const GET = getHandler("get");
export const POST = getHandler("post");
export const PUT = getHandler("put");
export const PATCH = getHandler("patch");
export const DELETE = getHandler("delete");
export const HEAD = getHandler("head");
export const OPTIONS = getHandler("options");
//# sourceMappingURL=index.js.map