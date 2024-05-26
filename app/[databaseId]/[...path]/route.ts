import { OpenapiDocument } from "openapi-util";
import { resolveOpenapiAppRequest } from "openapi-util/build/node/resolveOpenapiAppRequest";
import { create } from "./create";
import { read } from "./read";
import { update } from "./update";
import { remove } from "./remove";
import { renderCrudOpenapi } from "./renderCrudOpenapi";
import openapi from "../../../public/openapi.json";
import { createDatabase } from "./createDatabase";
import { updateDatabase } from "./updateDatabase";

/** function creator to DRY */
const getHandler = (method: string) => (request: Request) =>
  resolveOpenapiAppRequest(request, method, {
    openapi: openapi as OpenapiDocument,
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
