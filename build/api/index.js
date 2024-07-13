import { resolveReferenceBrowser, } from "openapi-util";
import { create } from "../src/api/create.js";
import { read } from "../src/api/read.js";
import { update } from "../src/api/update.js";
import { remove } from "../src/api/remove.js";
import { getCrudOpenapi } from "../src/api/getCrudOpenapi.js";
import { createDatabase } from "../src/api/createDatabase.js";
import { getSchema } from "../src/api/getSchema.js";
import { listDatabases } from "../src/api/listDatabases.js";
import { getOpenapi } from "../src/api/getOpenapi.js";
import openapi from "../src/openapi.json" assert { type: "json" };
import { mergeObjectsArray, notEmpty, onlyUnique2 } from "from-anywhere";
import { tryValidateSchema, makeOpenapiPathRouter } from "openapi-util";
import { resolveReferenceOrContinue } from "../src/resolveReferenceOrContinue.js";
/** Retreives the right body from the request based on the openapi and operation */
export const getRequestOperationBody = async (openapi, operation, documentLocation, request) => {
    if (!operation.requestBody) {
        return { schema: undefined, data: undefined };
    }
    const requestBody = await resolveReferenceBrowser(operation.requestBody, openapi, documentLocation);
    const mediaTypes = requestBody?.content
        ? Object.keys(requestBody.content)
        : [];
    const headerMediaType = request.headers.get("content-type");
    const mediaType = headerMediaType && mediaTypes.includes(headerMediaType)
        ? headerMediaType
        : mediaTypes[0];
    if (!mediaType) {
        return { schema: undefined, data: undefined };
    }
    const schemaOrReference = requestBody?.content?.[mediaType]?.schema;
    const schema = await resolveReferenceBrowser(schemaOrReference, openapi, documentLocation);
    try {
        // TODO: maybe there are more mediatypes that can be parsed like yaml and xml
        const data = mediaType === "application/json"
            ? await request.json()
            : mediaType === "plain/text"
                ? await request.text()
                : undefined;
        return { schema: schema, data };
    }
    catch (e) {
        return { schema, data: undefined };
    }
};
/** Retrieves an object of the query params belonging to an endpoint */
export const getUrlQueryParams = (url, permittedQueryKeys) => {
    try {
        const urlQueryParams = Array.from(new URL(url).searchParams.entries()).reduce((previous, [key, value]) => ({ ...previous, [key]: value }), {});
        const queryParams = permittedQueryKeys.reduce((previous, key) => urlQueryParams[key]
            ? { ...previous, [key]: urlQueryParams[key] }
            : previous, {});
        return queryParams;
    }
    catch (e) {
        return {};
    }
};
/**
 * Function that turns a regular function into an endpoint. If the function is available in the OpenAPI (with function name equalling the operationId), the input will be validated.
 *
 * NB: You can use this anywhere you want your openapi to be available. Usually it's in a catch-all route, but you can also use other next routing in case you need to have pages in some cases.
 */
export const resolveOpenapiAppRequest = async (request, method, config) => {
    const { functions, openapi, prefixParameterName } = config;
    const defaultHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    if (method === "options") {
        // preflight stuff
        return new Response("OK", {
            status: 200,
            headers: {
                ...defaultHeaders,
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    }
    const url = request.url;
    const urlObject = new URL(url);
    const requestPathname = urlObject.pathname;
    // basePath may depend on openapi server
    const serverUrl = openapi.servers?.[0]?.url || urlObject.origin;
    const serverBasePathname = new URL(serverUrl).pathname;
    const restPathname = "/" + requestPathname.slice(serverBasePathname.length);
    const router = makeOpenapiPathRouter(openapi);
    const regularMatch = router(restPathname);
    //////// NB: Logic to also resolve if theres a prefix /////////
    const chunks = restPathname.split("/");
    const prefixParameterValue = prefixParameterName ? chunks[1] : undefined;
    const pathnameWithoutPrefix = prefixParameterName
        ? "/" + restPathname.split("/").slice(2).join("/")
        : undefined;
    const prefixMatch = pathnameWithoutPrefix
        ? router(pathnameWithoutPrefix)
        : undefined;
    const match = (regularMatch || prefixMatch);
    const prefixParamPart = prefixParameterName && prefixParameterValue && prefixMatch
        ? { [prefixParameterName]: prefixParameterValue }
        : {};
    /////////
    // console.log({
    //   chunks,
    //   prefixParameterName,
    //   prefixParameterValue,
    //   pathnameWithoutPrefix,
    //   prefixMatch,
    //   match,
    //   prefixParamPart,
    // });
    if (!regularMatch && !prefixMatch) {
        const allowedMethods = [
            "get",
            "post",
            "put",
            "patch",
            "delete",
            "head",
            "options",
        ];
        const methods = mergeObjectsArray(Object.keys(openapi.paths).map((path) => {
            return {
                [path]: Object.keys(openapi.paths[path]).filter((method) => allowedMethods.includes(method)),
            };
        }));
        return new Response(JSON.stringify({
            message: `Invalid method.`,
            methods,
            restPathname,
        }), {
            status: 404,
            headers: { ...defaultHeaders, "Content-Type": "application/json" },
        });
    }
    const pathItem = openapi.paths?.[match.path];
    const operation = pathItem?.[method];
    if (!operation) {
        return new Response("Endpoint not found", {
            status: 404,
            headers: defaultHeaders,
        });
    }
    const parameters = pathItem.parameters || operation?.parameters;
    const documentLocation = undefined;
    const resolvedParameters = parameters
        ? await Promise.all(parameters.map((parameter) => {
            return resolveReferenceOrContinue(parameter, openapi, documentLocation);
        }))
        : undefined;
    const parameterHeaderKeys = resolvedParameters
        ?.filter((item) => item?.in === "header")
        .map((x) => x.name) || [];
    const parameterQueryKeys = resolvedParameters
        ?.filter((item) => item?.in === "query")
        .map((x) => x.name) || [];
    const headerKeys = parameterHeaderKeys
        //always add Authorization as a possible header
        .concat("Authorization")
        .filter(onlyUnique2());
    const headers = mergeObjectsArray(headerKeys
        .map((key) => {
        const value = request.headers.get(key);
        if (value === null) {
            // this could be a problem if it were required
            return;
        }
        return { [key]: value };
    })
        .filter(notEmpty));
    const queryParams = getUrlQueryParams(request.url, parameterQueryKeys);
    const { schema, data } = await getRequestOperationBody(openapi, operation, "", request);
    // console.log({
    //   url,
    //   data,
    //   requestPathname,
    //   match,
    //   headers,
    //   queryParams,
    // });
    const errors = schema
        ? tryValidateSchema({ schema: schema, data })
        : undefined;
    // validate this schema and return early if it fails
    if (errors && errors.length > 0) {
        console.log({ errors });
        return new Response(JSON.stringify({
            isSuccessful: false,
            message: "Invalid Input\n\n" +
                errors
                    .map((x) => x.instancePath + x.schemaPath + ": " + x.message)
                    .join(" \n\n"),
            // errors,
        }), {
            status: 422,
            headers: { ...defaultHeaders, "Content-Type": "application/json" },
        });
    }
    const operationId = operation.operationId || match.path.slice(1) + "=" + method;
    const fn = functions[operationId];
    if (!fn) {
        return new Response("Function not found", {
            status: 404,
            headers: defaultHeaders,
        });
    }
    const pathParams = Object.keys(match.context).length > 0 ? match.context : undefined;
    // TODO: Add proper typing for this if we ever accept non-object bodies in our openapi spec
    const body = typeof data === "object" && !Array.isArray(data) && data !== null
        ? data
        : data === undefined
            ? undefined
            : { body: data };
    const context = {
        ...body,
        ...pathParams,
        ...queryParams,
        ...headers,
        ...prefixParamPart,
    };
    // console.log({ parameters, resolvedParameters, headers, context });
    // valid! Let's execute.
    const resultJson = await fn(context);
    if (typeof resultJson === undefined) {
        return new Response("No response", { status: 404 });
    }
    return new Response(JSON.stringify(resultJson), {
        status: 200,
        headers: { ...defaultHeaders, "Content-Type": "application/json" },
    });
};
/** function creator to DRY */
const getHandler = (method) => (request) => {
    return resolveOpenapiAppRequest(request, method, {
        openapi: openapi,
        prefixParameterName: "databaseSlug",
        functions: {
            create,
            read,
            update,
            remove,
            getOpenapi,
            getCrudOpenapi,
            createDatabase,
            getSchema,
            listDatabases,
        },
    });
};
export const GET = getHandler("get");
export const POST = getHandler("post");
export const PUT = getHandler("put");
export const PATCH = getHandler("patch");
export const DELETE = getHandler("delete");
export const HEAD = getHandler("head");
export const OPTIONS = getHandler("options");
//# sourceMappingURL=index.js.map