import { OpenapiDocument, mergeObjectsArray } from "from-anywhere";
import { readJsonFile } from "from-anywhere/node";
import { existsSync } from "fs";
import path from "path";

/**
1. look up proxy+openapi with id in kv-store
2. match the path in the openapi spec
3. send the request to the original location and retreive response
 */
const handleProxyRequest = async (request: Request, method: string) => {
  const url = request.url;
  const urlObject = new URL(url);

  const [tld, domain, subdomain] = urlObject.hostname.split(".").reverse();

  const key =
    urlObject.hostname === "localhost"
      ? process.env.LOCALHOST_TEST_KEY
      : subdomain || domain;

  const openapiPath = path.resolve(".", "public", key + ".json");

  const hasOpenapi = existsSync(openapiPath);
  // setting for allow-all cors
  const defaultResponseInit = {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      // "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  };

  if (!hasOpenapi) {
    return Response.json(
      {
        message: `Invalid domain.`,
        openapiPath,
      },
      defaultResponseInit,
    );
  }

  const openapi = await readJsonFile<OpenapiDocument>(openapiPath);
  if (!openapi?.paths) {
    return Response.json(
      {
        message: `Failed to read.`,
        openapiPath,
      },
      defaultResponseInit,
    );
  }

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

  const originalServerUrl = (openapi as any)?.["x-origin-servers"]?.[0]?.url as
    | string
    | undefined;

  if (!originalServerUrl) {
    return Response.json(
      {
        message: `origin-server url could not be found`,
      },
      defaultResponseInit,
    );
  }

  const fullOriginalUrl =
    originalServerUrl + urlObject.pathname + urlObject.search + urlObject.hash;

  console.log(`FOUND ORIGINAL URL`, fullOriginalUrl);

  const result = await fetch(fullOriginalUrl, {
    method,
    body: request.body,
    //@ts-ignore
    // SEE: https://github.com/nodejs/node/issues/46221
    duplex: "half",
    headers: request.headers,
  });

  //  new Response()
  return result; //Response.json(result, defaultResponseInit);
};

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request: Request) {
  return handleProxyRequest(request, "get");
}
export async function POST(request: Request) {
  return handleProxyRequest(request, "post");
}
export async function PUT(request: Request) {
  return handleProxyRequest(request, "put");
}
export async function PATCH(request: Request) {
  return handleProxyRequest(request, "patch");
}
export async function DELETE(request: Request) {
  return handleProxyRequest(request, "delete");
}

export async function HEAD(request: Request) {
  return handleProxyRequest(request, "head");
}

export async function OPTIONS(request: Request) {
  return handleProxyRequest(request, "options");
}
