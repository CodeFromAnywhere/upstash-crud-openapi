import { OpenAPIDocument, Operation } from "actionschema/types";
import { tryGetOperationBodySchema } from "./tryGetOperationBodySchema";
import { tryValidateSchema } from "./tryValidateSchema";
import { Json } from "from-anywhere";

/**
 * Function that turns a regular function into an endpoint. If the function is available in the OpenAPI (with function name equalling the operationId), the input will be validated.
 *
 * NB: You can use this anywhere you want your openapi to be available. Usually it's in a catch-all route, but you can also use other next routing in case you need to have pages in some cases.
 */
export const resolveOpenapiAppRequest = async (
  request: Request,
  method: string,
  config: {
    openapi: OpenAPIDocument;
    functions: {
      [functionName: string]: (
        jsonBody: any,
      ) => Json | undefined | Promise<Json | undefined>;
    };
  },
) => {
  const { functions, openapi } = config;
  const defaultHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    // "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  const url = request.url;
  const urlObject = new URL(url);
  const pathname = urlObject.pathname;
  // basePath may depend on openapi server
  const basePath = openapi.servers?.[0]?.url || urlObject.origin;
  const restPathname = url.slice(basePath.length);
  const openapiPathname = restPathname;
  // TODO: Match restPathname against the paths

  // DISABLED Path validation for now, until we implement it

  // const operation = (openapi as any).paths?.[pathname]?.[method] as
  //   | undefined
  //   | {};

  // if (!operation) {
  //   const allowedMethods = [
  //     "get",
  //     "post",
  //     "put",
  //     "patch",
  //     "delete",
  //     "head",
  //     "options",
  //   ];
  //   const methods = mergeObjectsArray(
  //     Object.keys(openapi.paths).map((path) => {
  //       return {
  //         [path]: Object.keys((openapi as any).paths[path]).filter((method) =>
  //           allowedMethods.includes(method),
  //         ),
  //       };
  //     }),
  //   );

  //   return Response.json(
  //     {
  //       message: `Invalid method. More info at ${urlObject.origin}/${key}.json`,
  //       methods,
  //       openapiPath,
  //     },
  //     defaultResponseInit,
  //   );
  // }
  const operation = (openapi.paths as any)?.[openapiPathname]?.[method] as
    | Operation
    | undefined;

  if (!operation) {
    return Response.json("Endpoint not found", {
      status: 404,
      headers: defaultHeaders,
    });
  }

  const schema = await tryGetOperationBodySchema(openapi, operation);

  if (!schema) {
    return Response.json("Schema not found", {
      status: 404,
      headers: defaultHeaders,
    });
  }

  if (request.headers.get("content-type") !== "application/json") {
    return Response.json(
      {
        isSuccessful: false,
        message: "Please specify content-type header to be application/json",
      },
      {
        status: 422,
        headers: defaultHeaders,
      },
    );
  }

  const data = request.body as Json;

  const errors = tryValidateSchema({ schema, data });
  // validate this schema and return early if it fails

  if (errors && errors.length > 0) {
    return Response.json(
      {
        isSuccessful: false,
        message:
          "Invalid Input\n\n" +
          errors.map((x) => x.instancePath + ": " + x.message).join(" \n\n"),
        // errors,
      },
      {
        status: 422,
        headers: defaultHeaders,
      },
    );
  }

  const operationId = operation.operationId || openapiPathname + "=" + method;

  const fn = functions[operationId];

  if (!fn) {
    return Response.json("Function not found", {
      status: 404,
      headers: defaultHeaders,
    });
  }

  // valid! Let's execute.
  const resultJson = await fn(data);

  return Response.json(resultJson, {
    status: 200,
    headers: defaultHeaders,
  });
};
