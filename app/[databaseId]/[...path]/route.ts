import { OpenapiDocument, resolveOpenapiAppRequest } from "openapi-util";
import { create } from "./create";
import { read } from "./read";
import { update } from "./update";
import { remove } from "./remove";
import { renderCrudOpenapi } from "./renderCrudOpenapi";
import openapi from "../../../public/openapi.json";
import { createOrUpdateDatabase } from "./createOrUpdateDatabase";

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
      createOrUpdateDatabase,
    },
  });

export const GET = getHandler("get");
export const POST = getHandler("post");
export const PUT = getHandler("put");
export const PATCH = getHandler("patch");
export const DELETE = getHandler("delete");
export const HEAD = getHandler("head");
export const OPTIONS = getHandler("options");
