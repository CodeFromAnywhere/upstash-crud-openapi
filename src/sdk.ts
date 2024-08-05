// I put a lot of functions in one file here, including some from `from-anywhere` because it is to be added to code generation.

import type { JSONSchema7 } from "json-schema";
import type { OpenAPIV3 } from "openapi-types";

type NonFunctionKeyNames<T> = Exclude<
  {
    [key in keyof T]: T[key] extends Function ? never : key;
  }[keyof T],
  undefined
>;

type RemoveFunctions<T> = Pick<T, NonFunctionKeyNames<T>>;

export type OpenapiDocument = RemoveFunctions<OpenAPIV3.Document>;

export type OpenapiPathsObject = OpenAPIV3.PathsObject;
export type OpenapiSchemasObject = OpenAPIV3.ComponentsObject["schemas"];
export type OpenapiHeaderObject = OpenAPIV3.HeaderObject;
export type OpenapiServerObject = OpenAPIV3.ServerObject;
export type OpenapiSecuritySchemeObject = OpenAPIV3.SecuritySchemeObject;
export type OpenapiApiSecurityScheme = OpenAPIV3.ApiKeySecurityScheme;

export type OpenapiPathItemObject = OpenAPIV3.PathItemObject;
export type OpenapiMediaType = OpenAPIV3.MediaTypeObject;
export type OpenapiArraySchemaObject = OpenAPIV3.ArraySchemaObject;
export type OpenapiParameterObject = OpenAPIV3.ParameterObject;
export type OpenapiSchemaObject = OpenAPIV3.SchemaObject;
export type OpenapiReferenceObject = OpenAPIV3.ReferenceObject;
export type OpenapiRequestBodyObject = OpenAPIV3.RequestBodyObject;
export type OpenapiOperationObject = OpenAPIV3.OperationObject;
export type OpenapiResponseObject = OpenAPIV3.ResponseObject;
export type HttpMethods = OpenAPIV3.HttpMethods;
export type ReferenceObject = OpenAPIV3.ReferenceObject;
export type HttpMethodEnum =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

/** Renames all refs to #/components/schemas/ instead of #/definitions */
export const renameRefs = <T extends JSONSchema7 | undefined>(
  schema: T,
  toType: "openapi" | "jsonschema" = "openapi",
): T => {
  if (!schema) {
    return schema;
  }
  // NO SPACES
  const string = JSON.stringify(schema, undefined, 0);

  const jsonschemaLocation = `"$ref":"#/definitions/`;
  const openapiLocation = `"$ref":"#/components/schemas/`;

  const from = toType === "jsonschema" ? openapiLocation : jsonschemaLocation;
  const to = toType === "jsonschema" ? jsonschemaLocation : openapiLocation;

  const newString = string.replaceAll(from, to);

  return JSON.parse(newString) as T;
};
export const omitUndefinedValues = <T extends { [key: string]: any }>(
  object: T,
) => {
  Object.keys(object).map((key) => {
    const value = object[key];
    if (value === undefined) {
      delete object[key];
    }
  });

  return object;
};

export const removeOptionalKeysFromObjectStrings = <TObject extends O>(
  object: TObject,
  keys: string[],
): TObject => {
  const newObject = keys.reduce((objectNow, key) => {
    return {
      ...objectNow,
      [key]: undefined,
    };
  }, object);
  return omitUndefinedValues(newObject);
};

export type O = { [key: string]: any };

const removeCommentsRegex = /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g;

/**
 * if text isn't json, returns null
 */
export const tryParseJson = <T extends unknown>(
  text: string,
  logParseError?: boolean,
): T | null => {
  try {
    const jsonStringWithoutComments = text.replace(
      removeCommentsRegex,
      (m, g) => (g ? "" : m),
    );
    return JSON.parse(jsonStringWithoutComments) as T;
  } catch (parseError) {
    if (logParseError) console.log("JSON Parse error:", parseError);
    return null;
  }
};

/**
 * Removes empty values (null or undefined) from your arrays in a type-safe way
 */
export function notEmpty<TValue extends unknown>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

export const mergeObjectsArray = <T extends { [key: string]: any }>(
  objectsArray: T[],
): T => {
  const result = objectsArray.reduce((previous, current) => {
    return { ...previous, ...current };
  }, {} as T);

  return result;
};

export function stringify(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === null || value === undefined) {
        return encodeURIComponent(key);
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join("&");
}

export type ParsedOperation = {
  openapiUrl: string;
  /** OperationID but with extra that if it's missing, it'll use 'path=method' to create this unique identifier. */
  operationId: string;

  openapiId: string | undefined;
  path: string;
  /** Taken from operation, path item, and lastly the root of the openapi (this is the openapi v3 spec)
   */
  serversWithOrigin: OpenapiServerObject[];
  method: HttpMethodEnum;

  operation: OpenapiOperationObject;
  parameters?: OpenapiParameterObject[];
  resolvedRequestBodySchema?: JSONSchema7;
  responseStatusSchemas: {
    status: string;
    description: string;
    mergedSchema: JSONSchema7;
  }[];

  mergedInputSchema?: JSONSchema7;

  /**
   FORMAT:

  {
    status: number;
    statusDescription?: string;
    statusText?: string;
    [mediaType]: any non-object
    ...any object
  }

   */
  mergedOutputSchema?: JSONSchema7;

  definitions?: {
    [key: string]: JSONSchema7;
  };
};

/** Resolves local ref synchronously */
export const resolveLocalRef = <T>(
  openapi: OpenapiDocument,
  schemaOrRef: T | OpenapiReferenceObject,
) => {
  const ref = (schemaOrRef as any).$ref;
  if (ref && ref.startsWith("#")) {
    const chunks: string[] = ref.split("/").slice(1);
    const referencedSchema = chunks.reduce(
      (previous, chunk) => previous[chunk],
      openapi as { [key: string]: any },
    ) as T | undefined;
    return referencedSchema;
  }
  return schemaOrRef as Exclude<T, OpenapiReferenceObject>;
};

/**
 * Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods.
 *
 * Besides this, it aims to create a more flat object for each input and output.
 */
export const getOperations = (
  openapi: OpenapiDocument,
  openapiId: string,
  openapiUrl: string,
  operationIds?: string[],
) => {
  if (
    !openapiId ||
    !openapiUrl ||
    !openapi ||
    !openapi.paths ||
    typeof openapi.paths !== "object"
  ) {
    return;
  }

  const allowedMethods = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
    "options",
  ];

  const operations: ParsedOperation[] = Object.keys(openapi.paths)
    .map((path) => {
      const item: OpenapiPathItemObject | undefined =
        openapi.paths![path as keyof typeof openapi.paths];

      if (!item) {
        return;
      }

      const methods = Object.keys(item).filter((method) =>
        allowedMethods.includes(method),
      );

      const pathMethods = methods
        .map((method) => {
          const operation = item[
            method as keyof typeof item
          ] as OpenapiOperationObject;

          const operationId =
            operation.operationId || path.slice(1) + "=" + method;

          if (operationIds && !operationIds.includes(operationId)) {
            // prune early
            return;
          }

          const servers = operation.servers?.length
            ? operation.servers
            : item.servers?.length
            ? item.servers
            : openapi.servers;

          const serversWithUrl = servers?.filter((x) => !!x.url);
          const serversWithBaseServer =
            serversWithUrl && serversWithUrl.length > 0
              ? serversWithUrl
              : openapiUrl
              ? [{ url: openapiUrl }]
              : [];

          const serversWithOrigin = serversWithBaseServer.map((server) => {
            const fullUrl =
              server.url.startsWith("http://") ||
              server.url.startsWith("https://")
                ? server.url
                : (openapiUrl || "") + server.url;

            return { ...server, url: fullUrl } as OpenapiServerObject;
          });

          const parameters = (operation.parameters || item.parameters)
            ?.map((item) => resolveLocalRef(openapi, item))
            .filter(notEmpty);

          const parameterSchemas = (parameters || []).map(
            (item) =>
              ({
                type: "object",
                required: item.required ? [item.name] : undefined,
                properties: {
                  [item.name]: resolveLocalRef(openapi, item.schema),
                },
              } as JSONSchema7 | undefined),
          );

          const statusCodes = Object.keys(operation.responses);
          const responseStatusSchemas = statusCodes.map((status) => {
            const responseObject = resolveLocalRef(
              openapi,
              operation.responses[status],
            )!;

            const mediaTypeKeys = responseObject.content
              ? Object.keys(responseObject.content)
              : [];

            const mediaTypes = mediaTypeKeys
              .map((mediaType) => {
                const mediaTypeObject = responseObject.content?.[mediaType];
                if (!mediaTypeObject) {
                  return;
                }
                return { ...mediaTypeObject, mediaType };
              })
              .filter(notEmpty);

            const headerNames = responseObject.headers
              ? Object.keys(responseObject.headers)
              : [];

            const headers = headerNames
              .map((name) => {
                const headerObject = resolveLocalRef(
                  openapi,
                  responseObject.headers?.[name],
                );
                if (!headerObject) {
                  return;
                }

                return { ...headerObject, name };
              })
              .filter(notEmpty);

            // each statuscode can have multiple mediatypes and multiple headers. can we make it flatter here?
            // most common mediatypes are text/plain and json & co.
            // we can probably create a schema in which we merge all object schema mediatypes, and add a mediatype key

            const headersSchema: JSONSchema7 = {
              type: "object",
              properties: mergeObjectsArray(
                headers
                  .map((item) => {
                    const schema = resolveLocalRef(openapi, item.schema);
                    if (!schema) {
                      return;
                    }

                    return {
                      [item.name]: schema as JSONSchema7,
                    };
                  })
                  .filter(notEmpty),
              ),
            };

            const mediaTypesSchemas = mediaTypes.map((item) => {
              const schema = resolveLocalRef(openapi, item.schema) as
                | JSONSchema7
                | undefined;
              const schemaType = schema?.type === "object";

              //  console.log({ schema: item.schema, resolved: schema });

              return schemaType
                ? schema
                : ({
                    type: "object",
                    properties: {
                      [item.mediaType]: schema,
                    },
                  } as JSONSchema7);
            });

            const mediaTypeDescriptions = mediaTypes
              .map(
                (item) =>
                  `${item.mediaType}: ${
                    resolveLocalRef(openapi, item.schema)?.description ||
                    "No description"
                  }`,
              )
              .join("\n\n");

            const allSchemas = [headersSchema].concat(mediaTypesSchemas);

            const mergedSchema = allSchemas.reduce(
              (accumulator, next) => {
                // NB: This assumes body and parameters have no overlapping naming!
                return {
                  ...accumulator,
                  properties: {
                    ...accumulator.properties,
                    ...next.properties,
                  },
                  required: (accumulator.required || []).concat(
                    next.required || [],
                  ),
                };
              },
              {
                type: "object",
                properties: {},
                required: [],
                description: mediaTypeDescriptions,
              } as JSONSchema7,
            );

            return {
              status,
              description: responseObject.description,
              mergedSchema,
            };
          });
          const bestStatusCode =
            statusCodes.find((x) => x === "200") ||
            statusCodes.find((x) => x.startsWith("2")) ||
            statusCodes[0];

          const bestStatusResponse = responseStatusSchemas.find(
            (x) => x.status === bestStatusCode,
          );

          const resolvedRequestBodySchema =
            // NB: only application/json is supported now!
            (operation.requestBody as OpenapiRequestBodyObject)?.content?.[
              "application/json"
            ]?.schema as JSONSchema7 | undefined;

          const allSchemas = [resolvedRequestBodySchema]
            .concat(parameterSchemas)
            .filter(notEmpty);

          const mergedInputSchema = allSchemas.reduce(
            (accumulator, next) => {
              // NB: This assumes body and parameters have no overlapping naming!
              return {
                ...accumulator,
                properties: {
                  ...accumulator.properties,
                  ...next.properties,
                },
                required: (accumulator.required || []).concat(
                  next.required || [],
                ),
              };
            },
            {
              type: "object",
              properties: {},
              required: [],
              additionalProperties: false,
              description:
                resolvedRequestBodySchema?.description ||
                parameterSchemas?.find((x) => x?.description)?.description,
            } as JSONSchema7,
          );

          const statusSchema: JSONSchema7 = {
            type: "object",
            required: ["status"],
            properties: {
              status: {
                type: "number",
                enum: statusCodes.map((x) => Number(x)),
              },
              statusDescription: { type: "string" },
              statusText: { type: "string" },
            },
          };

          const mergedOutputSchema = [
            ...responseStatusSchemas.map((x) => x.mergedSchema),
            statusSchema,
          ].reduce(
            (accumulator, next) => {
              // NB: This assumes body and parameters have no overlapping naming!
              return {
                ...accumulator,
                properties: {
                  ...accumulator.properties,
                  ...next.properties,
                },
                required: (accumulator.required || []).concat(
                  next.required || [],
                ),
              };
            },
            {
              type: "object",
              properties: {},
              required: [],
              additionalProperties: false,
              description: bestStatusResponse?.description
                ? `${bestStatusResponse.status}: ${bestStatusResponse.description}\n\n${bestStatusResponse?.mergedSchema?.description}`
                : undefined,
            } as JSONSchema7,
          );

          const neededRefs = findRefs(
            { mergedInputSchema, mergedOutputSchema },
            openapi.components?.schemas,
          );

          // console.log({ neededRefs });

          const definitions = neededRefs.reduce((previous, refName) => {
            const theRef = openapi.components?.schemas?.[refName] as
              | JSONSchema7
              | undefined;

            const ref = theRef
              ? renameRefs(theRef, "jsonschema")
              : ({
                  description: "Reference couldn't be found",
                } as JSONSchema7);

            return {
              ...previous,
              [refName]: ref,
            };
          }, {} as { [key: string]: JSONSchema7 });

          const realMergedInputSchema =
            !mergedInputSchema.properties ||
            Object.keys(mergedInputSchema.properties).length === 0
              ? undefined
              : mergedInputSchema;
          const realMergedOutputSchema =
            !mergedOutputSchema.properties ||
            Object.keys(mergedOutputSchema.properties).length === 0
              ? undefined
              : mergedOutputSchema;

          return {
            openapiUrl,
            operationId,
            openapiId,
            path,
            serversWithOrigin,
            method: method as HttpMethodEnum,
            operation,
            parameters,
            responseStatusSchemas,
            resolvedRequestBodySchema,
            // these have definitions
            mergedInputSchema: realMergedInputSchema,
            mergedOutputSchema: realMergedOutputSchema,
            definitions,
          } satisfies ParsedOperation;
        })
        .filter(notEmpty);

      return pathMethods;
    })
    .filter(notEmpty)
    .flat();

  return operations;
};

/** Returns the refs names (without pointer) that are included */
export const findRefs = (
  json: any,
  refs: O | undefined,
  refPrefix = "#/components/schemas/",
) => {
  if (!refs) {
    return [];
  }
  // NB: no spaces!
  const string = JSON.stringify(json, undefined, 0);
  const refsIncluded = Object.keys(refs).filter((refKey) => {
    const snippet = `"$ref":"${refPrefix}${refKey}"`;
    const includesSnippet = string.includes(snippet);
    return includesSnippet;
  });
  return refsIncluded;
};

/**
Fills headers, path, query, cookies, and body into a fetch in the right way according to the spec.

 Returns a requestInit  fetch-call.

 Must be using minimal dependencies and libraries so we can potentially use this in very light environments, clients, browsers, edge workers, everywhere.


Second Thoughts & Regressions:

 - Uses always the first server only
 - Doesn't allow for multiple auth headers yet if specified in openapi
 - Determining body is kind of wonky. application/json is the only content-type
 - There is no accept header

 There are probably thousands more things that certain APIs have strange exceptions with. I'm sure this will become a big limitation as APIs will just NOT be working. This is the reason SDKs exist I guess. Luckily I've got multiple ideas to create perfect self-healing SDKs so this is just a starting point and hopefully it already is able to address the majority of the APIs.

 */
export const getOperationRequestInit = (context: {
  openapi: OpenapiDocument;
  openapiUrl: string;
  operationId: string;
  /** Should be provided */
  access_token?: string;
  /** The combined data. Flat object. */
  data: O | undefined;
}) => {
  const { data, openapi, openapiUrl, operationId, access_token } = context;

  if (!openapi || !openapiUrl) {
    return;
  }
  const operation = getOperations(openapi, openapiUrl, openapiUrl, [
    operationId,
  ])?.[0];

  if (!operation) {
    return;
  }

  const securitySchemes = openapi.components?.securitySchemes as
    | {
        [key: string]: OpenapiSecuritySchemeObject;
      }
    | undefined;

  // For now, we take the first server...
  const servers = operation.serversWithOrigin;
  const firstServerUrl = servers?.find((x) => x.url)?.url || "";
  const securityArray = securitySchemes ? Object.values(securitySchemes) : [];

  const basicHttp = securityArray.find(
    (item) => item.type === "http" && item.scheme === "basic",
  );
  const basicBearer = securityArray.find(
    (item) => item.type === "http" && item.scheme === "bearer",
  );
  const apiKeySecurity = securityArray.find(
    (item) => item.type === "apiKey",
  ) as OpenapiApiSecurityScheme | undefined;

  const authHeader = basicHttp
    ? {
        Authorization: `Basic ${access_token}`,
      }
    : basicBearer
    ? { Authorization: `Bearer ${access_token}` }
    : apiKeySecurity && apiKeySecurity.in === "header"
    ? // NB: not entirely sure yet how I should manage this when there are multiple auth headers or other required headers.
      { [apiKeySecurity.name]: access_token }
    : undefined;

  const queryParameters = operation.parameters
    ? operation.parameters.filter((x) => x.in === "query")
    : [];

  // Assuming queryParameters and data are defined
  const queryString = stringify(
    mergeObjectsArray(
      queryParameters
        .map((x) => x.name)
        .map((name) => ({ [name]: data?.[name] })),
    ),
  );

  const queryPart = queryString === "" ? "" : "?" + queryString;

  const pathParameters = operation.parameters
    ? operation.parameters.filter((x) => x.in === "path")
    : [];

  const realPath = pathParameters.reduce((path, parameter) => {
    return path.replaceAll(`{${parameter.name}}`, data?.[parameter.name]);
  }, operation.path);

  const headerParameters = operation.parameters
    ? operation.parameters.filter((x) => x.in === "header")
    : [];

  const bodyData =
    data && operation.parameters
      ? removeOptionalKeysFromObjectStrings(
          data,
          operation.parameters.map((x) => x.name),
        )
      : data;

  const method = operation.method;
  // only add a body if there is body data and we have a request method that can handle body
  const hasBody =
    !!bodyData &&
    Object.keys(bodyData).length > 0 &&
    !["get", "head"].includes(method);

  const body = hasBody ? JSON.stringify(bodyData) : undefined;
  const bodyObject = hasBody ? bodyData : undefined;

  // NB: This is a big limitation! There are soooo many other headers that we need...
  const contentTypeHeader = hasBody
    ? [{ "Content-Type": "application/json" }]
    : undefined;

  const parameterHeaders = headerParameters.map((item) => {
    const isPresent = !!data?.[item.name];
    if (!isPresent) {
      return;
    }
    return { [item.name]: data[item.name] };
  });

  const allHeaders = [authHeader as { [key: string]: string } | undefined]
    .concat(parameterHeaders)
    .concat(contentTypeHeader)
    .filter(notEmpty);

  const headers = mergeObjectsArray(allHeaders);
  const url = firstServerUrl + realPath + queryPart;
  return { url, body, headers, method, bodyObject };
};

function detectNeededParser(
  mediaType: string,
): "json" | "text" | "blob" | "arrayBuffer" {
  // Normalize the media type by trimming and converting to lowercase
  const normalizedType = mediaType.trim().toLowerCase();

  // Check for JSON types
  if (normalizedType.includes("json")) {
    return "json";
  }

  // Check for text types
  if (
    normalizedType.startsWith("text/") ||
    normalizedType === "application/xml" ||
    normalizedType === "application/xhtml+xml" ||
    normalizedType === "application/javascript"
  ) {
    return "text";
  }

  // Check for binary types that typically use blob
  if (
    normalizedType.startsWith("image/") ||
    normalizedType.startsWith("audio/") ||
    normalizedType.startsWith("video/") ||
    normalizedType === "application/pdf" ||
    normalizedType === "application/zip" ||
    normalizedType === "application/x-7z-compressed" ||
    normalizedType.startsWith("application/vnd.openxmlformats-officedocument.")
  ) {
    return "blob";
  }

  // Default to arrayBuffer for other binary types
  return "arrayBuffer";
}

export const createClient = <T>(
  openapi: OpenapiDocument,
  openapiUrl: string,
  config?: {
    access_token?: string;
    timeoutSeconds?: number;
  },
) => {
  type ClientType = <K extends keyof T>(
    operationId: K,
    context: Exclude<T[K], undefined> extends { input: any }
      ? Exclude<T[K], undefined>["input"]
      : undefined,
    customConfig?: {
      access_token?: string;
      timeoutSeconds?: number;
    },
  ) => Promise<
    Exclude<T[K], undefined> extends { output: any }
      ? Exclude<T[K], undefined>["output"]
      : undefined
  >;

  const client = async (
    operationId: string,
    context: any,
    customConfig?: {
      access_token?: string;
      timeoutSeconds?: number;
    },
  ) => {
    const operation = getOperations(openapi, openapiUrl, openapiUrl, [
      operationId,
    ])?.[0];

    const requestInit = getOperationRequestInit({
      openapi,
      data: context,
      openapiUrl,
      operationId,
      access_token: customConfig?.access_token || config?.access_token,
    });

    if (!requestInit || !operation) {
      throw new Error(
        "Couldn't get request init or operation:" + String(operationId),
      );
    }

    try {
      const abortController = new AbortController();
      const id = setTimeout(
        () => abortController.abort(),
        (customConfig?.timeoutSeconds || config?.timeoutSeconds || 30) * 1000,
      );

      const response = await fetch(requestInit.url, {
        method: requestInit.method,
        signal: abortController.signal,
        headers: requestInit.headers,
        body: requestInit.body,
      })
        .then(async (response) => {
          const responseObject = operation.operation.responses[
            String(response.status)
          ] as OpenapiResponseObject;
          const mediaTypes = responseObject.content
            ? Object.keys(responseObject.content)
            : [];
          const contentType = response.headers.get("Content-Type");
          const chosenMediaType = contentType || mediaTypes[0];
          const neededParser = detectNeededParser(chosenMediaType);

          const headers = responseObject.headers
            ? Object.keys(responseObject.headers)
            : [];

          const headerObject = mergeObjectsArray(
            headers.map((name) => ({ [name]: response.headers.get(name) })),
          );

          // can do more here to explode headers
          //const headerObjects = headers.map(x=>responseObject.headers![x] as OpenapiHeaderObject).map(item=>item.)

          const base = {
            statusDescription: responseObject.description,
            statusText: response.statusText,
            status: response.status,
            ...headerObject,
          };

          if (neededParser === "text") {
            const text = await response.text();

            return { ...base, [chosenMediaType]: text };
          } else if (neededParser === "json") {
            const json = await response.json();
            const isJsonObject =
              typeof json === "object" && !Array.isArray(json);
            const rest = isJsonObject ? json : { [chosenMediaType]: json };

            // const isSchemaObject= (responseObject.content?.[chosenMediaType]?.schema as JSONSchema7)?.type === "object";
            return { ...base, ...rest };
          } else if (neededParser === "blob") {
            const blob = await response.blob();

            return { ...base, [chosenMediaType]: blob };
          } else {
            const arrayBuffer = await response.arrayBuffer();
            return { ...base, [chosenMediaType]: arrayBuffer };
          }
        })
        .catch((error) => {
          console.log({
            explanation:
              "Your request could not be executed, you may be disconnected or the server may not be available. ",
            error,
            errorStatus: error.status,
            errorString: String(error),
          });

          return {
            isSuccessful: false,
            isNotConnected: true,
            message:
              "Could not connect to any API. Please see your API configuration.",
          };
        });

      clearTimeout(id);
      return response;
    } catch (e) {
      return {
        isSuccessful: false,
        isNotConnected: true,
        message:
          "The API didn't resolve, and the fetch crashed because of it: " +
          String(e),
      } as any;
    }
  };
  return client as ClientType;
};

/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Auth {
  permission?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://auth.actionschema.com/openapi.json";
    operationId: "permission";
    summary?: "All your info";
    tags?: undefined;
    /**
     * 200: Success
     *
     * application/json: No description
     */
    output: {
      permission?: {
        providerSlug: "actionschema-auth";
        /**
         * Can be a reference to the clientId of the client within actionschema that granted this permission. Can be a client of another user.
         */
        clientId?: string;
        description?: string;
        /**
         * A space-separated list of scopes that the access token is valid for. Only possible combination is 'admin' for now, which means access to everything.
         */
        scope: "admin";
        /**
         * Unix timestamp in MS
         */
        createdAt: number;
        /**
         * The access token string as issued by us.
         */
        access_token: string;
        /**
         * The type of token this is. Always gives Bearer now.
         */
        token_type: "Bearer";
        /**
         * The lifetime in seconds of the access token.
         */
        expires_in?: number;
        /**
         * The refresh token, which can be used to obtain new access tokens using the same authorization grant.
         */
        refresh_token?: string;
      };
      message?: string;
      userAuthToken?: string;
      isAuthorized?: boolean;
      "text/plain"?: string;
      status: 200 | 403;
      statusDescription?: string;
      statusText?: string;
    };
    input?: undefined;
  };
  authenticate?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://auth.actionschema.com/openapi.json";
    operationId: "authenticate";
    summary?: "All your info";
    tags?: undefined;
    /**
     * 200: Success
     *
     * application/json: Model where authorization tokens and oauth details can be stored for a user. As there is only one such setting per admin, the key of this model is the userId. This can be retrieved in several ways.
     */
    output: {
      /**
       * Model to connect third party oauth providers/servers so users can login with them and get access to information and actions there. You can create multiple 'provider clients' per provider because each client usually has a specific app-name and sometimes predetermined scope.
       *
       * It's important to note, that, for now, this can only be defined by the auth admin, which is the person hosting the auth service. In the future, when allowing for subdomains, we could allow for more definitions of by others, but it's not secure now.
       */
      providers?: {
        /**
         * Provider slug as defined in providers.json
         */
        providerSlug: string;
        /**
         * Unique identifier as defined by the provider. As we have multiple providers, we must still use the provider as an additional identifier.
         */
        clientId: string;
        /**
         * Description for this provider
         */
        description?: string;
        /**
         * Secret provided by the provider.
         */
        clientSecret: string;
        /**
         * Will be the value that replaces {slug} in URLs. Usually represents the name of your app. Needed for some providers like Slack.
         */
        urlSlug?: string;
      }[];
      /**
       * List of access tokens the user is authorized for. Can be from oauth providers but also direct secrets in several formats.
       */
      providerPermissions?: {
        /**
         * Unix timestamp in ms
         */
        updatedAt?: number;
        /**
         * slug representation for the API as defined in providers.json
         */
        providerSlug?: string;
        /**
         * Needed in case it's of an unidentified provider
         */
        name?: string;
        /**
         * Needed in case it's of an unidentified provider
         */
        openapiUrl?: string;
        /**
         * Unique user id within the system of the provider. Can be a username, email, or phone number. Used for linking accounts with trusted providers.
         */
        userId?: string;
        /**
         * The access token string as issued by the authorization server.
         */
        access_token: string;
        /**
         * The type of token this is, typically just the string 'Bearer'.
         */
        token_type: string;
        /**
         * The lifetime in seconds of the access token.
         */
        expires_in?: number;
        /**
         * The refresh token, which can be used to obtain new access tokens using the same authorization grant.
         */
        refresh_token?: string;
        /**
         * A space-separated list of scopes that the access token is valid for.
         */
        scope?: string;
      }[];
      /**
       * Model to use ActionSchema Auth as OAuth Server, so other systems (Such as OpenAI GPTs or your own websites, CLIs, or agents) can integrate with your providerPermissions.
       */
      clients?: {
        name?: string;
        description?: string;
        /**
         * Must be a unique clientId across the entire domain, but can be named by the user.
         */
        clientId: string;
        /**
         * 64-character string that is the secret of this client
         */
        clientSecret: string;
        /**
         * If not given, uses ?redirect_url. If given, the callbackUrl cannot be overwritten anymore by ?redirect_url.
         */
        callbackUrl?: string;
        /**
         * Scope provided to interact with the auth proxy or with each provider directly. Must be space-separated in which each item has the format {providerSlug}:{providerScope}. Auth Server scopes can be chosen using `actionschema-auth:*`
         */
        scope?: string;
        /**
         * Replaces requiredProviders[*].reason with a single login flow message that is available to the user that explains why permissions are needed.
         */
        loginFlowMessage?: string;
        /**
         * @deprecated
         * To be replaced by `scope`!!!
         */
        requiredProviders?: {
          providerSlug: string;
          scope: string;
          /**
           * Reason shown to the user to why access is needed.
           */
          reason?: string;
        }[];
        /**
         * If true, this client will provide the direct access token of the service, rather than an access_token for ActionSchema Auth.
         */
        retrieveDirectAccessToken?: boolean;
      }[];
      /**
       * Applications, Agents, Code, CLIs, or anything that has access to your account. Can also be used to create API Keys for developers.
       */
      clientPermissions?: {
        providerSlug: "actionschema-auth";
        /**
         * Can be a reference to the clientId of the client within actionschema that granted this permission. Can be a client of another user.
         */
        clientId?: string;
        description?: string;
        /**
         * A space-separated list of scopes that the access token is valid for. Only possible combination is 'admin' for now, which means access to everything.
         */
        scope: "admin";
        /**
         * Unix timestamp in MS
         */
        createdAt: number;
        /**
         * The access token string as issued by us.
         */
        access_token: string;
        /**
         * The type of token this is. Always gives Bearer now.
         */
        token_type: "Bearer";
        /**
         * The lifetime in seconds of the access token.
         */
        expires_in?: number;
        /**
         * The refresh token, which can be used to obtain new access tokens using the same authorization grant.
         */
        refresh_token?: string;
      }[];
      "text/plain"?: string;
      status: 200 | 403;
      statusDescription?: string;
      statusText?: string;
    };
    input?: undefined;
  };
}

/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Unique slug for the database to be used as prefix to the endpoints.
 */
export type DatabaseID = string;
/**
 * JSON of the schema you want the database to refer to. Should be a Object JSON Schema.
 */
export type Schema = string;
/**
 * A list of vector indexes to be created for several columns in your schema
 */
export type VectorIndexColumns = {
  propertyKey: string;
  model:
    | "text-embedding-ada-002"
    | "text-embedding-3-small"
    | "text-embedding-3-large";
  region: "us-east-1" | "eu-west-1" | "us-central1";
  dimension_count: number;
  similarity_function: "COSINE" | "EUCLIDIAN" | "DOT_PRODUCT";
  [k: string]: unknown;
}[];
/**
 * Slug compatible with URLs
 */
export type UrlSlug = string;
/**
 * @minItems 1
 */
export type SchemaArray = [ActionSchema, ...ActionSchema[]];
export type Parameter = {
  [k: string]: unknown;
} & (
  | {
      in?: "path";
      style?: "matrix" | "label" | "simple";
      required: true;
      [k: string]: unknown;
    }
  | {
      in?: "query";
      style?: "form" | "spaceDelimited" | "pipeDelimited" | "deepObject";
      [k: string]: unknown;
    }
  | {
      in?: "header";
      style?: "simple";
      [k: string]: unknown;
    }
  | {
      in?: "cookie";
      style?: "form";
      [k: string]: unknown;
    }
) & {
    name: string;
    in: string;
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: Schema1 | Reference;
    content?: {
      [k: string]: MediaType;
    };
    example?: unknown;
    examples?: {
      [k: string]: Example | Reference;
    };
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^x-".
     */
    [k: string]: unknown;
  };
export type MediaType = {
  [k: string]: unknown;
} & {
  schema?: Schema1 | Reference;
  example?: unknown;
  examples?: {
    [k: string]: Example | Reference;
  };
  encoding?: {
    [k: string]: Encoding;
  };
  /**
   * This interface was referenced by `undefined`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
};
export type Header = {
  [k: string]: unknown;
} & {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: "simple";
  explode?: boolean;
  allowReserved?: boolean;
  schema?: Schema1 | Reference;
  content?: {
    [k: string]: MediaType;
  };
  example?: unknown;
  examples?: {
    [k: string]: Example | Reference;
  };
  /**
   * This interface was referenced by `undefined`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
};
export type HTTPSecurityScheme = {
  scheme: string;
  bearerFormat?: string;
  description?: string;
  type: "http";
  /**
   * This interface was referenced by `undefined`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
} & (
  | {
      scheme?: string;
      [k: string]: unknown;
    }
  | {
      scheme?: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }
);
/**
 * OAS extension that specifies the parameters you use in your scopes.
 */
export type ScopeParameters = {
  name?: string;
  /**
   * Defaults to string, but can be further defined here if it has a specific syntax (using format or regex, for example)
   */
  schema?: Schema1 | Reference;
  description?: string;
}[];

export interface Admin {
  listDatabases?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "listDatabases";
    summary?: "List your databases";
    tags?: undefined;
    /**
     * 200: My DB List
     *
     * application/json: No description
     */
    output: {
      isSuccessful?: boolean;
      message?: string;
      status: 200;
      /**
       * The slug of the project these databases belong to
       */
      currentProjectSlug?: string;
      databases?: {
        databaseSlug: string;
        openapiUrl: string;
        /**
         * Bearer Authorization token to be used for the openapi of this specific database. Can be used interchangeably to the admin authtoken.
         */
        authToken: string;
        schema: string;
      }[];
      statusDescription?: string;
      statusText?: string;
    };
    input?: undefined;
  };
  upsertDatabase?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "upsertDatabase";
    summary?: "Create or update a database model";
    tags?: undefined;
    /**
     * 200: Create database response
     *
     * application/json: No description
     */
    output: {
      isSuccessful: boolean;
      message?: string;
      authToken?: string;
      adminAuthToken?: string;
      databaseSlug?: string;
      openapiUrl?: string;
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input: {
      databaseSlug: DatabaseID;
      schemaString: Schema;
      /**
       * Token required to authrorize using the CRUD endpoints. Will be generated if not given.
       */
      authToken?: string;
      /**
       * If true, api will use oauth2 to authenticate, and will add key prefix to it so only the keys for the user will be able to be managed.
       */
      isUserLevelSeparationEnabled?: boolean;
      /**
       * Can be set for a new database. Cannot be changed
       */
      region?:
        | "eu-west-1"
        | "us-east-1"
        | "us-west-1"
        | "ap-northeast-1"
        | "us-central1";
      vectorIndexColumns?: VectorIndexColumns;
      /**
       * Needed if you use vectorIndexColumns
       */
      openaiApiKey?: string;
    };
  };
  removeDatabase?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "removeDatabase";
    summary?: "Remove a database";
    tags?: undefined;
    /**
     * 200: Successful response
     *
     * application/json: No description
     */
    output: {
      status: 200;
      isSuccessful: boolean;
      message?: string;
      priceCredit?: number;
      statusDescription?: string;
      statusText?: string;
    };
    input: {
      databaseSlug: UrlSlug;
    };
  };
  setCurrentProject?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "setCurrentProject";
    summary?: "Set a project";
    tags?: undefined;
    /**
     * 200: Successful response
     *
     * application/json: No description
     */
    output: {
      status: 200;
      isSuccessful: boolean;
      message?: string;
      priceCredit?: number;
      statusDescription?: string;
      statusText?: string;
    };
    input: {
      projectSlug: UrlSlug;
      description?: string;
    };
  };
  listProjects?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "listProjects";
    summary?: "List projects";
    tags?: undefined;
    /**
     * 200: Successful response
     *
     * application/json: No description
     */
    output: {
      isSuccessful?: boolean;
      message?: string;
      projects?: {
        projectSlug?: UrlSlug;
        description?: string;
        databaseSlugs?: string[];
        [k: string]: unknown;
      }[];
      currentProjectSlug?: string;
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input?: undefined;
  };
  removeProject?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "removeProject";
    summary?: "Remove a project";
    tags?: undefined;
    /**
     * 200: Successful response
     *
     * application/json: No description
     */
    output: {
      status: 200;
      isSuccessful: boolean;
      message?: string;
      priceCredit?: number;
      statusDescription?: string;
      statusText?: string;
    };
    input: {
      projectSlug: UrlSlug;
    };
  };
  getOpenapi?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "getOpenapi";
    summary?: "Get openapi";
    tags?: undefined;
    /**
     * 200: OpenAPI
     *
     * application/json: No description
     */
    output: {
      "application/json"?: OpenAPIDocument;
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input?: undefined;
  };
  getCrudOpenapi?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "getCrudOpenapi";
    summary?: "Get openapi for this database table alone";
    tags?: undefined;
    /**
     * 200: OpenAPI
     *
     * application/json: No description
     */
    output: {
      "application/json"?:
        | OpenAPIDocument
        | {
            isSuccessful: boolean;
            message?: string;
            [k: string]: unknown;
          };
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input: {
      databaseSlug: string;
    };
  };
  getProjectOpenapi?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "getProjectOpenapi";
    summary?: "Get Project OpenAPI";
    tags?: undefined;
    /**
     * 200: Successful response
     *
     * application/json: No description
     */
    output: {
      "application/json"?:
        | OpenAPIDocument
        | {
            isSuccessful: boolean;
            message?: string;
            [k: string]: unknown;
          };
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input: {
      projectSlug: string;
    };
  };
  getProjectSchema?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "getProjectSchema";
    summary?: "Get Project OpenAPI";
    tags?: undefined;
    /**
     * 200: Successful response
     *
     * application/json: No description
     */
    output: {
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input: {
      projectSlug: string;
    };
  };
  getSchema?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/openapi.json";
    operationId: "getSchema";
    summary?: "Get schema for a database";
    tags?: undefined;
    /**
     * 200: Schema
     *
     * application/json: No description
     */
    output: {
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input: {
      databaseSlug: string;
    };
  };
}
/**
 * The description of OpenAPI v3.0.x documents, as defined by https://spec.openapis.org/oas/v3.0.3 and extended by ActionSchema.
 */
export interface OpenAPIDocument {
  $schema: string;
  $id?: string;
  /**
   * If given, should be a url linking to the original file, the starting point, if this is not already the one. Used to determine if anything has changed.
   */
  $source?: string;
  /**
   * Version
   */
  openapi: "3.1.0";
  /**
   * Version of actionschema.
   */
  "x-actionschema": string;
  info: Info;
  externalDocs?: ExternalDocumentation;
  /**
   * An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /.
   */
  servers?: Server[];
  /**
   * An array of Server Objects, indicating the original servers. Useful when defining a proxy.
   */
  "x-origin-servers"?: Server[];
  /**
   * Security Requirement Object (https://spec.openapis.org/oas/latest.html#security-requirement-object)
   *
   * Lists the required security schemes to execute this operation. The name used for each property MUST correspond to a security scheme declared in the Security Schemes under the Components Object.
   *
   * Security Requirement Objects that contain multiple schemes require that all schemes MUST be satisfied for a request to be authorized. This enables support for scenarios where multiple query parameters or HTTP headers are required to convey security information.
   *
   * When a list of Security Requirement Objects is defined on the OpenAPI Object or Operation Object, only one of the Security Requirement Objects in the list needs to be satisfied to authorize the request.
   *
   * A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. To make security optional, an empty security requirement ({}) can be included in the array.
   *
   * Please note: Every item in this array is an object with keys being the scheme names (can be anything). These names should then also be defined in components.securitySchemes.
   */
  security?: SecurityRequirement[];
  /**
   * Used for grouping endpoints together.
   *
   * A list of tags used by the specification with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the Operation Object must be declared. The tags that are not declared MAY be organized randomly or based on the tools' logic. Each tag name in the list MUST be unique.
   */
  tags?: Tag[];
  paths: Paths;
  components?: Components;
  /**
   * This interface was referenced by `OpenAPIDocument`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
/**
 * Provides metadata about the API. The metadata MAY be used by tooling as required.
 */
export interface Info {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: Contact;
  license?: License;
  /**
   * The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version).
   */
  version: string;
  /**
   * Different people in the company and their capabilities and communication channels
   */
  "x-people"?: Contact1[];
  /**
   * Product info.
   */
  "x-product"?: {
    [k: string]: unknown;
  };
  /**
   * Important links needed for agents to make using the API easier.
   */
  "x-links"?: {
    signupUrl?: string;
    loginUrl?: string;
    forgotPasswordUrl?: string;
    pricingUrl?: string;
    /**
     * Page from where logged-in user can make purchases, cancel subscription, etc.
     */
    billingUrl?: string;
    /**
     * URL of a page where the user can see their usage and its cost.
     */
    usageUrl?: string;
    docsUrl?: string;
    supportUrl?: string;
    /**
     * Url of the page where the user can find the required information for authorizing on the API. Usually this is a page where the user can create and see their API tokens.
     */
    apiAuthorizationSettingsUrl?: string;
  };
  /**
   * Pricing info including monthly fees.
   */
  "x-pricing"?: {
    /**
     * General summary of all plans
     */
    description?: string;
    plans?: {
      price: number;
      currency: string;
      title: string;
      /**
       * How much credit do you get for this. Credit matches the credit spent with 'priceCredit' extension for operations
       */
      credit: number;
      /**
       * How long will you retain the credit you receive?
       */
      persistence?: "forever" | "interval" | "capped";
      /**
       * Required when filling in persistence 'capped'
       */
      persistenceCappedDays?: number;
      /**
       * If the plan is a subscription based plan, fill in the interval on which every time the price is paid, and credit is given.
       *
       * If there is a pay-as-you-go price, fill in the minimum purchase size for each step. It will be assumed the price to credit ratio is linear.
       */
      interval?: "week" | "month" | "quarter" | "year";
      rateLimit?: RateLimit;
    }[];
  };
  "x-rateLimit"?: RateLimit1;
  /**
   * General product reviews, collected.
   */
  "x-reviews"?: {
    [k: string]: unknown;
  };
  /**
   * General latency info.
   */
  "x-latency"?: {
    [k: string]: unknown;
  };
  /**
   * Link to other openapis that could be good alternatives.
   */
  "x-alternatives"?: string[];
  /**
   * Logo metadata. Standard taken from https://apis.guru
   */
  "x-logo"?: {
    /**
     * URL to a logo image
     */
    url?: string;
    backgroundColor?: string;
    secondaryColor?: string;
  };
  /**
   * This interface was referenced by `Info`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
/**
 * Contact information for the exposed API.
 */
export interface Contact {
  name?: string;
  url?: string;
  email?: string;
  "x-phoneNumber"?: string;
  "x-description"?: string;
  /**
   * This interface was referenced by `Contact`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   *
   * This interface was referenced by `Contact1`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
/**
 * The license information for the exposed API.
 */
export interface License {
  name: string;
  url?: string;
  /**
   * This interface was referenced by `License`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface Contact1 {
  name?: string;
  url?: string;
  email?: string;
  "x-phoneNumber"?: string;
  "x-description"?: string;
  /**
   * This interface was referenced by `Contact`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   *
   * This interface was referenced by `Contact1`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
/**
 * Plan-based RateLimit info that overwrites the general rateLimit.
 */
export interface RateLimit {
  limit?: number;
  interval?: "second" | "minute";
  [k: string]: unknown;
}
/**
 * Global ratelimit info. Can be overwritten either by plans or by operations.
 */
export interface RateLimit1 {
  limit?: number;
  interval?: "second" | "minute";
  [k: string]: unknown;
}
/**
 * Additional external documentation.
 */
export interface ExternalDocumentation {
  description?: string;
  url: string;
  /**
   * Scraped markdown from the url
   */
  markdown?: {
    [k: string]: unknown;
  };
  /**
   * This interface was referenced by `ExternalDocumentation`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   *
   * This interface was referenced by `ExternalDocumentation1`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface Server {
  url: string;
  description?: string;
  variables?: {
    [k: string]: ServerVariable;
  };
  /**
   * This interface was referenced by `Server`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface ServerVariable {
  enum?: string[];
  default: string;
  description?: string;
  /**
   * This interface was referenced by `ServerVariable`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface SecurityRequirement {
  [k: string]: string[];
}
export interface Tag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentation1;
  "x-rateLimit"?: RateLimit2;
  /**
   * This interface was referenced by `Tag`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface ExternalDocumentation1 {
  description?: string;
  url: string;
  /**
   * Scraped markdown from the url
   */
  markdown?: {
    [k: string]: unknown;
  };
  /**
   * This interface was referenced by `ExternalDocumentation`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   *
   * This interface was referenced by `ExternalDocumentation1`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
/**
 * Tag-based ratelimit info.
 */
export interface RateLimit2 {
  limit?: number;
  interval?: "second" | "minute";
  [k: string]: unknown;
}
/**
 * The available paths and operations for the API.
 */
export interface Paths {}
/**
 * This interface was referenced by `Paths`'s JSON-Schema definition
 * via the `patternProperty` "^\/".
 */
export interface PathItem {}
/**
 * This interface was referenced by `PathItem`'s JSON-Schema definition
 * via the `patternProperty` "^(get|put|post|delete|options|head|patch|trace)$".
 */
export interface Operation {
  /**
   * ActionSchema addition: This can be filled with an array of different things of what you can do with the endpoint with more information of what the input should be and what the output should be.
   */
  "x-capabilities"?: [] | [string];
  /**
   * ActionSchema addition: You can specify an ActionSchema here that specifies the entire lifecycle of this operation. Defining this will allow the server to infer input and output based on which parameters use plugins and which don't.
   */
  "x-schema"?: {
    /**
     * The ActionSchema that defines the steps to be taken and in what order. Can be a reference or the direct schema.
     */
    schema?: ActionSchema | Reference;
    /**
     * Implemenatation may differ.
     *
     * - 'status' will respond immediately with the initial result and status.
     *  - 'wait' will wait for the entire thing to complete or until it has to wait itself. It doesn't need state.
     * - 'stream' will respond immediately and stream further results as they come. Also no need for state.
     */
    implementation?: "status" | "wait" | "stream";
    [k: string]: unknown;
  };
  /**
   * ActionSchema addition: Should refer to an operationId in the same OpenAPI that would undo the side-effect that calling this function caused.
   *
   * If this is given into a path.post object it should mean that this function has an external side-effect when executed, for example it will store some data somewhere.
   *
   * To undo this side-effect when changing or removing the plugin, we can specify an unmount plugin that is also part of the same openapi.
   *
   * The idea is that if specified, the side effect doesn't leavve any residu
   */
  "x-unmountOperationId"?: string;
  /**
   * Object to configure this endpoint to execute specified code. Beware that everything is possible (both remote and local code) but the implementation of where you host your openapi must support it.
   */
  "x-code"?: {
    canRunInBrowser?: boolean;
    /**
     * Must be a uri-reference to a file where the code is found. This can be used in multiple ways. For one we can show the raw code, and secondly, the server implementation can find the file to be executed (or sent to the browser).
     */
    "code-uri"?: string;
    [k: string]: unknown;
  };
  "x-rateLimit"?: RateLimit3;
  /**
   * Define how much credits need to be blocked for using this endpoint, and deducted afterwards. Can be overwritten in response.
   */
  "x-priceCredit"?: number;
  /**
   * Defining tags here will help group the endpoint for different user interfaces.
   */
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentation1;
  operationId?: string;
  parameters?: (Parameter | Reference)[];
  requestBody?: RequestBody | Reference;
  responses: Responses;
  callbacks?: {
    [k: string]: Callback | Reference;
  };
  deprecated?: boolean;
  security?: SecurityRequirement[];
  servers?: Server[];
  /**
   * This interface was referenced by `Operation`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
/**
 * Core json-schema meta-schema, adapted to make it an ActionSchema with plugin capabilities. Root taken from https://json-schema.org/draft-07/schema#definitions
 */
export interface ActionSchema {
  /**
   * Useful at root. Dot-notation of where to find the items.
   */
  "x-grid-items-location"?: string;
  /**
   * Useful at root. If this is true, its a schema that is allowed to be read by anyone regardless of the data privacy.
   */
  "x-is-public"?: boolean;
  /**
   * Ensures this value will be stored under a key of its dot-location (if null) or of the value referenced in the relative json pointer of this string. The implementation of this spec should ensure the key doesn't conflict with other indexes. A JSON that uses this implementation will contain a $ref object instead of the actual data at this location, which can then be retrieved to build up the full JSON.
   */
  "x-storage"?: string | null;
  "x-plugin"?: ActionschemaPlugin;
  /**
   * An array of suggested operations to alter this key
   */
  "x-suggested-plugins"?: ActionschemaPlugin1[];
  /**
   * Besides serving as default values for e.g. forms and other things, with ActionSchema `default` also serves as a fallback of `x-plugin`. If x-plugin is empty or it fails, and `default` is available, the default will be set as the value.
   */
  default?: ActionSchema | boolean | number | unknown[] | string;
  /**
   * Sample JSON values associated with a particular schema, for the purpose of illustrating usage.
   *
   * Besides serving as example values for e.g. forms and other things, with ActionSchema `examples` also serves as a fallback of `x-plugin` and `default`.
   */
  examples?: unknown[];
  deprecated?: boolean;
  /**
   * Determines how it's shown in forms. See: https://rjsf-team.github.io/react-jsonschema-form/docs/usage/widgets/
   */
  "ui:widget"?: string;
  /**
   * Determines how it's shown in forms. See: https://rjsf-team.github.io/react-jsonschema-form/docs/usage/widgets/
   */
  "ui:options"?: {
    /**
     * If given, it is assumed the value or values of this property link to this model.
     */
    refModelName?: string;
    [k: string]: unknown;
  };
  $id?: string;
  /**
   * If given, should be a url linking to the original file, the starting point, if this is not already the one. Used to determine if anything has changed.
   */
  $source?: string;
  $schema?: string;
  $ref?: string;
  /**
   * Comment for the makers of the schema
   */
  $comment?: string;
  /**
   * In the form this shows up as the title for the property. More readable.
   */
  title?: string;
  /**
   * Description for schema at this location
   */
  description?: string;
  readOnly?: boolean;
  writeOnly?: boolean;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number | boolean;
  maxLength?: number;
  minLength?: number & number;
  pattern?: string;
  additionalItems?: ActionSchema;
  items?: ActionSchema | SchemaArray | boolean;
  maxItems?: number;
  minItems?: number & number;
  uniqueItems?: boolean;
  contains?: ActionSchema;
  maxProperties?: number;
  minProperties?: number & number;
  required?: string[];
  additionalProperties?: ActionSchema | boolean;
  definitions?: {
    [k: string]: ActionSchema;
  };
  properties?: {
    [k: string]: ActionSchema;
  };
  patternProperties?: {
    [k: string]: ActionSchema;
  };
  dependencies?: {
    [k: string]: ActionSchema | string[];
  };
  propertyNames?: ActionSchema;
  const?: ActionSchema | boolean;
  /**
   * @minItems 1
   */
  enum?: [unknown, ...unknown[]];
  type?:
    | (
        | "array"
        | "boolean"
        | "integer"
        | "null"
        | "number"
        | "object"
        | "string"
      )
    | [
        (
          | "array"
          | "boolean"
          | "integer"
          | "null"
          | "number"
          | "object"
          | "string"
        ),
        ...(
          | "array"
          | "boolean"
          | "integer"
          | "null"
          | "number"
          | "object"
          | "string"
        )[],
      ];
  format?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  if?: ActionSchema;
  then?: ActionSchema;
  else?: ActionSchema;
  allOf?: SchemaArray;
  anyOf?: SchemaArray;
  oneOf?: SchemaArray;
  not?: ActionSchema;
}
/**
 * Plug-in an openapi here to say how  this value can be determined.
 */
export interface ActionschemaPlugin {
  /**
   * JSON Schema $ref that resolves to a semantic operation as defined in https://spec.actionschema.com/semantic-operation.json
   */
  $operation?: string;
  summary?: string;
  /**
   * Could be used to auto-describe the usage of this plugin
   */
  description?: string;
  /**
   * For plugins for an array. If true, will replace items in the array fully.
   *
   * By default, ActionSchema will insert into an array with an optional discriminator (see below).
   */
  arrayReplace?: boolean;
  /**
   * For plugins for an array. If given, must be a key of the object in the array. Will now overwrite/replace object-items where a discriminator matches, while keeping the rest as-is.
   */
  arrayDiscriminatorPropertyKey?: boolean & string;
  /**
   * If true, will replace the object rather than overwriting it where needed.
   *
   * By default, ActionSchema will overwrite only the given individual properties of an object. In this case, the other properties will be set to stale if needed.
   */
  objectReplace?: boolean;
  $openapi?: OpenAPIDetails;
  /**
   * If given, must resolve to true in order to run this function
   */
  condition?: string;
  /**
   * Simple localizer on the object. if defined, will use it as path in the object/array, like `a.b.c[0].d`
   */
  outputLocation?: string;
  /**
   * If true, this plugin should cause a vertical expansion. This means, for each row it is ran on, it will copy that row for each item in the resulting array. NB: If vertical expand is enabled, initial calculation will still work, including expansion, but recalculation is disabled as it would create exponential expansion.
   */
  isVerticalExpandEnabled?: boolean;
  /**
   * If true, will not auto-execute when dependencies are met. Useful for example for scheduled columns
   */
  isAutoExecuteDisabled?: boolean;
  /**
   * Context given to the function. For strings, you'll be able to use variables here (using `${propertyName}` syntax). This needs to be known by the AI.
   */
  context?: {
    [k: string]: unknown;
  };
  /**
   * Array of dot locations of datapoints that are required to be non-stale for this plugin to run. Should replace `propertyDependencies`. Might later calculate this in realtime using the `x-plugin.code` property
   */
  dataDependencies?: string[];
  /**
   * Cost estimation to run this plugin. This is needed to give insight in costs for generations.
   */
  priceCredit?: number;
  /**
   * @deprecated
   * This could be the code executed upon receiving any context of the schema as context. If we can create an editor that has the proper typescript context and shows the function based on the body, we have a single source of truth for the codebase. We code inside the actionschemas or openapis! The beauty is, this is programming language agnostic and we have a much more readable way to get interfaces.
   */
  code?: {
    host?: "browser" | "serverless" | "server" | "gpu";
    code?: string;
    [k: string]: unknown;
  };
  /**
   * @deprecated
   * For grid-plugins: if true, entire grid data will be provided into the plugin
   */
  isGridDataProvided?: boolean;
  /**
   * @deprecated
   * Property keys in the same object that are required as context. This is needed to know what can be auto-generated. We can only generate if all used variables aren't undefined/null.
   */
  propertyDependencies?: string[];
  /**
   * @deprecated
   * What should the dependant values do when this value changes? If 'stale', there needs to be an `isStalePropertyName` given, so we can set it to stale.
   */
  onChangeDependantBehavior?: "ignore" | "stale" | "reset" | "delete";
  /**
   * @deprecated
   * If given, this could be a reference to another property that resolves to a boolean that, if true, tells that this value is stale.
   */
  stalePropertyName?: string;
  /**
   * @deprecated
   * If given, this could be a reference to another property that resolves to a boolean that, if false, tells that this value is invalid
   */
  validPropertyName?: string;
  [k: string]: unknown;
}
/**
 * @deprecated
 * The OpenAPI information required to execute the function.
 */
export interface OpenAPIDetails {
  url: string;
  /**
   * @deprecated
   */
  path?: string;
  /**
   * @deprecated
   */
  method?: string;
  /**
   * @deprecated
   */
  emoji?: string;
  operationId: string;
  [k: string]: unknown;
}
/**
 * ActionSchema plugin
 */
export interface ActionschemaPlugin1 {
  /**
   * JSON Schema $ref that resolves to a semantic operation as defined in https://spec.actionschema.com/semantic-operation.json
   */
  $operation?: string;
  summary?: string;
  /**
   * Could be used to auto-describe the usage of this plugin
   */
  description?: string;
  /**
   * For plugins for an array. If true, will replace items in the array fully.
   *
   * By default, ActionSchema will insert into an array with an optional discriminator (see below).
   */
  arrayReplace?: boolean;
  /**
   * For plugins for an array. If given, must be a key of the object in the array. Will now overwrite/replace object-items where a discriminator matches, while keeping the rest as-is.
   */
  arrayDiscriminatorPropertyKey?: boolean & string;
  /**
   * If true, will replace the object rather than overwriting it where needed.
   *
   * By default, ActionSchema will overwrite only the given individual properties of an object. In this case, the other properties will be set to stale if needed.
   */
  objectReplace?: boolean;
  $openapi?: OpenAPIDetails;
  /**
   * If given, must resolve to true in order to run this function
   */
  condition?: string;
  /**
   * Simple localizer on the object. if defined, will use it as path in the object/array, like `a.b.c[0].d`
   */
  outputLocation?: string;
  /**
   * If true, this plugin should cause a vertical expansion. This means, for each row it is ran on, it will copy that row for each item in the resulting array. NB: If vertical expand is enabled, initial calculation will still work, including expansion, but recalculation is disabled as it would create exponential expansion.
   */
  isVerticalExpandEnabled?: boolean;
  /**
   * If true, will not auto-execute when dependencies are met. Useful for example for scheduled columns
   */
  isAutoExecuteDisabled?: boolean;
  /**
   * Context given to the function. For strings, you'll be able to use variables here (using `${propertyName}` syntax). This needs to be known by the AI.
   */
  context?: {
    [k: string]: unknown;
  };
  /**
   * Array of dot locations of datapoints that are required to be non-stale for this plugin to run. Should replace `propertyDependencies`. Might later calculate this in realtime using the `x-plugin.code` property
   */
  dataDependencies?: string[];
  /**
   * Cost estimation to run this plugin. This is needed to give insight in costs for generations.
   */
  priceCredit?: number;
  /**
   * @deprecated
   * This could be the code executed upon receiving any context of the schema as context. If we can create an editor that has the proper typescript context and shows the function based on the body, we have a single source of truth for the codebase. We code inside the actionschemas or openapis! The beauty is, this is programming language agnostic and we have a much more readable way to get interfaces.
   */
  code?: {
    host?: "browser" | "serverless" | "server" | "gpu";
    code?: string;
    [k: string]: unknown;
  };
  /**
   * @deprecated
   * For grid-plugins: if true, entire grid data will be provided into the plugin
   */
  isGridDataProvided?: boolean;
  /**
   * @deprecated
   * Property keys in the same object that are required as context. This is needed to know what can be auto-generated. We can only generate if all used variables aren't undefined/null.
   */
  propertyDependencies?: string[];
  /**
   * @deprecated
   * What should the dependant values do when this value changes? If 'stale', there needs to be an `isStalePropertyName` given, so we can set it to stale.
   */
  onChangeDependantBehavior?: "ignore" | "stale" | "reset" | "delete";
  /**
   * @deprecated
   * If given, this could be a reference to another property that resolves to a boolean that, if true, tells that this value is stale.
   */
  stalePropertyName?: string;
  /**
   * @deprecated
   * If given, this could be a reference to another property that resolves to a boolean that, if false, tells that this value is invalid
   */
  validPropertyName?: string;
  [k: string]: unknown;
}
export interface Reference {
  /**
   * This interface was referenced by `Reference`'s JSON-Schema definition
   * via the `patternProperty` "^\$ref$".
   */
  [k: string]: string;
}
/**
 * Operation-based ratelimit info. This overwrites plan-based or global ratelimits.
 */
export interface RateLimit3 {
  limit?: number;
  interval?: "second" | "minute";
  [k: string]: unknown;
}
export interface Schema1 {
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: number | boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  /**
   * @minItems 1
   */
  required?: [string, ...string[]];
  /**
   * @minItems 1
   */
  enum?: [unknown, ...unknown[]];
  type?: "array" | "boolean" | "integer" | "number" | "object" | "string";
  not?: Schema1 | Reference;
  allOf?: (Schema1 | Reference)[];
  oneOf?: (Schema1 | Reference)[];
  anyOf?: (Schema1 | Reference)[];
  items?: Schema1 | Reference;
  properties?: {
    [k: string]: Schema1 | Reference;
  };
  additionalProperties?: Schema1 | Reference | boolean;
  description?: string;
  format?: string;
  default?: unknown;
  nullable?: boolean;
  discriminator?: Discriminator;
  readOnly?: boolean;
  writeOnly?: boolean;
  example?: unknown;
  externalDocs?: ExternalDocumentation1;
  deprecated?: boolean;
  xml?: XML;
  /**
   * This interface was referenced by `Schema1`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
/**
 * Used to select a oneOf-value based on a property in the value. See https://swagger.io/specification/v3/#discriminator-object
 */
export interface Discriminator {
  propertyName: string;
  mapping?: {
    [k: string]: string;
  };
  [k: string]: unknown;
}
/**
 * A metadata object that allows for more fine-tuned XML model definitions
 */
export interface XML {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
  /**
   * This interface was referenced by `XML`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
/**
 * See https://swagger.io/specification/v3/#example-object
 */
export interface Example {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
  /**
   * This interface was referenced by `Example`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface Encoding {
  contentType?: string;
  headers?: {
    [k: string]: Header | Reference;
  };
  style?: "form" | "spaceDelimited" | "pipeDelimited" | "deepObject";
  explode?: boolean;
  allowReserved?: boolean;
  /**
   * This interface was referenced by `Encoding`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface RequestBody {
  description?: string;
  content: {
    [k: string]: MediaType;
  };
  required?: boolean;
  /**
   * This interface was referenced by `RequestBody`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface Responses {
  default?: Response | Reference;
}
export interface Response {
  description: string;
  headers?: {
    [k: string]: Header | Reference;
  };
  content?: {
    [k: string]: MediaType;
  };
  links?: {
    [k: string]: Link | Reference;
  };
  /**
   * This interface was referenced by `Response`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface Link {
  operationId?: string;
  operationRef?: string;
  parameters?: {
    [k: string]: unknown;
  };
  requestBody?: unknown;
  description?: string;
  server?: Server;
  /**
   * This interface was referenced by `Link`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface Callback {
  [k: string]: PathItem;
}
/**
 * An element to hold various schemas for the specification.
 */
export interface Components {
  schemas?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z0-9\.\-_]+$".
     */
    [k: string]: Schema1 | Reference;
  };
  responses?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z0-9\.\-_]+$".
     */
    [k: string]: Reference | Response;
  };
  parameters?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z0-9\.\-_]+$".
     */
    [k: string]: Reference | Parameter;
  };
  examples?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z0-9\.\-_]+$".
     */
    [k: string]: Reference | Example;
  };
  requestBodies?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z0-9\.\-_]+$".
     */
    [k: string]: Reference | RequestBody;
  };
  headers?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z0-9\.\-_]+$".
     */
    [k: string]: Reference | Header;
  };
  securitySchemes?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z0-9\.\-_]+$".
     */
    [k: string]:
      | Reference
      | (
          | APIKeySecurityScheme
          | HTTPSecurityScheme
          | OAuth2SecurityScheme
          | OpenIdConnectSecurityScheme
        );
  };
  links?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z0-9\.\-_]+$".
     */
    [k: string]: Reference | Link;
  };
  callbacks?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[a-zA-Z0-9\.\-_]+$".
     */
    [k: string]: Reference | Callback;
  };
  /**
   * This interface was referenced by `Components`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface APIKeySecurityScheme {
  type: "apiKey";
  name: string;
  in: "header" | "query" | "cookie";
  description?: string;
  /**
   * This interface was referenced by `APIKeySecurityScheme`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface OAuth2SecurityScheme {
  type: "oauth2";
  flows: OAuthFlows;
  description?: string;
  /**
   * This interface was referenced by `OAuth2SecurityScheme`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface OAuthFlows {
  implicit?: ImplicitOAuthFlow;
  password?: PasswordOAuthFlow;
  clientCredentials?: ClientCredentialsFlow;
  authorizationCode?: AuthorizationCodeOAuthFlow;
  /**
   * This interface was referenced by `OAuthFlows`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface ImplicitOAuthFlow {
  authorizationUrl: string;
  refreshUrl?: string;
  scopes: {
    [k: string]: string;
  };
  /**
   * This interface was referenced by `ImplicitOAuthFlow`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface PasswordOAuthFlow {
  tokenUrl: string;
  refreshUrl?: string;
  scopes: {
    [k: string]: string;
  };
  /**
   * This interface was referenced by `PasswordOAuthFlow`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface ClientCredentialsFlow {
  tokenUrl: string;
  refreshUrl?: string;
  scopes: {
    [k: string]: string;
  };
  /**
   * This interface was referenced by `ClientCredentialsFlow`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
/**
 * See https://developer.okta.com/blog/2018/04/10/oauth-authorization-code-grant-type for a good understanding
 */
export interface AuthorizationCodeOAuthFlow {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  "x-scopes-parameters"?: ScopeParameters;
  scopes: {
    [k: string]: string;
  };
  /**
   * This interface was referenced by `AuthorizationCodeOAuthFlow`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}
export interface OpenIdConnectSecurityScheme {
  type: "openIdConnect";
  openIdConnectUrl: string;
  description?: string;
  /**
   * This interface was referenced by `OpenIdConnectSecurityScheme`'s JSON-Schema definition
   * via the `patternProperty` "^x-".
   */
  [k: string]: unknown;
}

/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Crud {
  read?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/auth-admin/openapi.json";
    operationId: "read";
    summary?: undefined;
    tags?: undefined;
    /**
     * 200: OpenAPI
     *
     * application/json: No description
     */
    output: {
      isSuccessful: boolean;
      message: string;
      $schema?: string;
      items?: {
        [k: string]: ModelItem;
      };
      schema?: {
        [k: string]: unknown;
      };
      canWrite?: boolean;
      hasMore?: boolean;
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input?: undefined;
  };
  create?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/auth-admin/openapi.json";
    operationId: "create";
    summary?: undefined;
    tags?: undefined;
    /**
     * 200: OpenAPI
     *
     * application/json: No description
     */
    output: {
      isSuccessful: boolean;
      message: string;
      /**
       * The rowIds created
       */
      result?: string[];
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input?: undefined;
  };
  remove?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/auth-admin/openapi.json";
    operationId: "remove";
    summary?: undefined;
    tags?: undefined;
    /**
     * 200: OpenAPI
     *
     * application/json: No description
     */
    output: {
      isSuccessful: boolean;
      message: string;
      /**
       * The number of items deleted
       */
      deleteCount?: number;
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input?: undefined;
  };
  update?: {
    description?: undefined;
    externalDocs?: undefined;
    openapiUrl: "https://data.actionschema.com/auth-admin/openapi.json";
    operationId: "update";
    summary?: undefined;
    tags?: undefined;
    /**
     * 200: OpenAPI
     *
     * application/json: No description
     */
    output: {
      isSuccessful: boolean;
      message: string;
      status: 200;
      statusDescription?: string;
      statusText?: string;
    };
    input?: undefined;
  };
}
/**
 * To be replaced with the actual model item
 */
export interface ModelItem {
  [k: string]: unknown;
}

export const authOpenapi = {
  $schema: "https://spec.actionschema.com/openapi.json",
  "x-actionschema": "0.0.1",
  openapi: "3.1.0",
  info: {
    title: "Auth",
    version: "0.0.1",
    description: "API to keep a central place of authentication",
    contact: {
      name: "Wijnand",
      email: "wijnand@karsens.com",
      url: "https://karsens.com",
    },
  },
  paths: {
    "/permission": {
      get: {
        security: [
          {
            oauth2: [],
          },
        ],
        summary: "All your info",
        operationId: "permission",
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    permission: {
                      $schema:
                        "https://spec.actionschema.com/actionschema.json",
                      description: "",
                      type: "object",
                      $comment:
                        "Model to store permissions granted to access ActionSchema Auth's API, which in turn allows access to all available access tokens of a user. NB: I think that this model doesn't store users access of other users, only of yourself granted by your own clients or by clients of other admins.",
                      required: [
                        "providerSlug",
                        "createdAt",
                        "access_token",
                        "token_type",
                        "scope",
                      ],
                      additionalProperties: false,
                      properties: {
                        providerSlug: {
                          type: "string",
                          enum: ["actionschema-auth"],
                        },
                        clientId: {
                          type: "string",
                          description:
                            "Can be a reference to the clientId of the client within actionschema that granted this permission. Can be a client of another user.",
                        },
                        description: {
                          type: "string",
                        },
                        scope: {
                          type: "string",
                          description:
                            "A space-separated list of scopes that the access token is valid for. Only possible combination is 'admin' for now, which means access to everything.",
                          enum: ["admin"],
                        },
                        createdAt: {
                          type: "number",
                          description: "Unix timestamp in MS",
                        },
                        access_token: {
                          type: "string",
                          description:
                            "The access token string as issued by us.",
                        },
                        token_type: {
                          type: "string",
                          description:
                            "The type of token this is. Always gives Bearer now.",
                          enum: ["Bearer"],
                        },
                        expires_in: {
                          type: "integer",
                          description:
                            "The lifetime in seconds of the access token.",
                          minimum: 1,
                        },
                        refresh_token: {
                          type: "string",
                          description:
                            "The refresh token, which can be used to obtain new access tokens using the same authorization grant.",
                        },
                      },
                    },
                    message: {
                      type: "string",
                    },
                    userAuthToken: {
                      type: "string",
                    },
                    isAuthorized: {
                      type: "boolean",
                    },
                  },
                },
              },
            },
          },
          "403": {
            description: "Unauthorized",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
    "/admin": {
      get: {
        security: [
          {
            oauth2: [],
          },
        ],
        summary: "All your info",
        operationId: "authenticate",
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  $schema: "https://spec.actionschema.com/actionschema.json",
                  type: "object",
                  description:
                    "Model where authorization tokens and oauth details can be stored for a user. As there is only one such setting per admin, the key of this model is the userId. This can be retrieved in several ways.",
                  additionalProperties: false,
                  properties: {
                    providers: {
                      description:
                        "Model to connect third party oauth providers/servers so users can login with them and get access to information and actions there. You can create multiple 'provider clients' per provider because each client usually has a specific app-name and sometimes predetermined scope.\n\nIt's important to note, that, for now, this can only be defined by the auth admin, which is the person hosting the auth service. In the future, when allowing for subdomains, we could allow for more definitions of by others, but it's not secure now.",
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["providerSlug", "clientId", "clientSecret"],
                        properties: {
                          providerSlug: {
                            type: "string",
                            description:
                              "Provider slug as defined in providers.json",
                          },
                          clientId: {
                            type: "string",
                            description:
                              "Unique identifier as defined by the provider. As we have multiple providers, we must still use the provider as an additional identifier.",
                          },
                          description: {
                            type: "string",
                            description: "Description for this provider",
                          },
                          clientSecret: {
                            type: "string",
                            description: "Secret provided by the provider.",
                          },
                          urlSlug: {
                            type: "string",
                            description:
                              "Will be the value that replaces {slug} in URLs. Usually represents the name of your app. Needed for some providers like Slack.",
                          },
                        },
                      },
                    },
                    providerPermissions: {
                      description:
                        "List of access tokens the user is authorized for. Can be from oauth providers but also direct secrets in several formats.",
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          updatedAt: {
                            type: "number",
                            description: "Unix timestamp in ms",
                          },
                          providerSlug: {
                            type: "string",
                            description:
                              "slug representation for the API as defined in providers.json",
                          },
                          name: {
                            type: "string",
                            description:
                              "Needed in case it's of an unidentified provider",
                          },
                          openapiUrl: {
                            type: "string",
                            description:
                              "Needed in case it's of an unidentified provider",
                          },
                          userId: {
                            type: "string",
                            description:
                              "Unique user id within the system of the provider. Can be a username, email, or phone number. Used for linking accounts with trusted providers.",
                          },
                          access_token: {
                            type: "string",
                            description:
                              "The access token string as issued by the authorization server.",
                          },
                          token_type: {
                            type: "string",
                            description:
                              "The type of token this is, typically just the string 'Bearer'.",
                          },
                          expires_in: {
                            type: "integer",
                            description:
                              "The lifetime in seconds of the access token.",
                            minimum: 1,
                          },
                          refresh_token: {
                            type: "string",
                            description:
                              "The refresh token, which can be used to obtain new access tokens using the same authorization grant.",
                          },
                          scope: {
                            type: "string",
                            description:
                              "A space-separated list of scopes that the access token is valid for.",
                          },
                        },
                        required: ["access_token", "token_type"],
                        additionalProperties: false,
                      },
                    },
                    clients: {
                      type: "array",
                      description:
                        "Model to use ActionSchema Auth as OAuth Server, so other systems (Such as OpenAI GPTs or your own websites, CLIs, or agents) can integrate with your providerPermissions.",
                      items: {
                        type: "object",
                        "x-storage": "memory",
                        "x-storage-index": "0/clientId",
                        additionalProperties: false,
                        required: ["clientId", "clientSecret"],
                        properties: {
                          name: {
                            type: "string",
                          },
                          description: {
                            type: "string",
                          },
                          clientId: {
                            type: "string",
                            description:
                              "Must be a unique clientId across the entire domain, but can be named by the user.",
                          },
                          clientSecret: {
                            type: "string",
                            description:
                              "64-character string that is the secret of this client",
                            minLength: 64,
                            maxLength: 64,
                          },
                          callbackUrl: {
                            type: "string",
                            description:
                              "If not given, uses ?redirect_url. If given, the callbackUrl cannot be overwritten anymore by ?redirect_url.",
                          },
                          scope: {
                            type: "string",
                            description:
                              "Scope provided to interact with the auth proxy or with each provider directly. Must be space-separated in which each item has the format {providerSlug}:{providerScope}. Auth Server scopes can be chosen using `actionschema-auth:*`",
                            examples: [
                              "actionschema-auth:admin github:read:user",
                            ],
                          },
                          loginFlowMessage: {
                            type: "string",
                            description:
                              "Replaces requiredProviders[*].reason with a single login flow message that is available to the user that explains why permissions are needed.",
                            examples: [
                              "Access to these tools is needed for the app to function.",
                            ],
                          },
                          requiredProviders: {
                            type: "array",
                            deprecated: true,
                            description: "To be replaced by `scope`!!!",
                            items: {
                              type: "object",
                              additionalProperties: false,
                              required: ["providerSlug", "scope"],
                              properties: {
                                providerSlug: {
                                  type: "string",
                                },
                                scope: {
                                  type: "string",
                                },
                                reason: {
                                  type: "string",
                                  description:
                                    "Reason shown to the user to why access is needed.",
                                },
                              },
                              examples: [
                                {
                                  providerSlug: "github",
                                  scope: "read:user",
                                  reason: "Prove you're a GitHub user",
                                },
                              ],
                            },
                          },
                          retrieveDirectAccessToken: {
                            type: "boolean",
                            description:
                              "If true, this client will provide the direct access token of the service, rather than an access_token for ActionSchema Auth.",
                            $comment:
                              "Only works if the amount of requiredProviders is exactly one, due to the limitations of the oauth2 specification with code flow. In the future, the other access tokens may as well be provided via other headers, so agents can talk to providers directly, without proxy.",
                          },
                        },
                      },
                    },
                    clientPermissions: {
                      type: "array",
                      description:
                        "Applications, Agents, Code, CLIs, or anything that has access to your account. Can also be used to create API Keys for developers.",
                      items: {
                        $schema:
                          "https://spec.actionschema.com/actionschema.json",
                        description: "",
                        type: "object",
                        $comment:
                          "Model to store permissions granted to access ActionSchema Auth's API, which in turn allows access to all available access tokens of a user. NB: I think that this model doesn't store users access of other users, only of yourself granted by your own clients or by clients of other admins.",
                        required: [
                          "providerSlug",
                          "createdAt",
                          "access_token",
                          "token_type",
                          "scope",
                        ],
                        additionalProperties: false,
                        properties: {
                          providerSlug: {
                            type: "string",
                            enum: ["actionschema-auth"],
                          },
                          clientId: {
                            type: "string",
                            description:
                              "Can be a reference to the clientId of the client within actionschema that granted this permission. Can be a client of another user.",
                          },
                          description: {
                            type: "string",
                          },
                          scope: {
                            type: "string",
                            description:
                              "A space-separated list of scopes that the access token is valid for. Only possible combination is 'admin' for now, which means access to everything.",
                            enum: ["admin"],
                          },
                          createdAt: {
                            type: "number",
                            description: "Unix timestamp in MS",
                          },
                          access_token: {
                            type: "string",
                            description:
                              "The access token string as issued by us.",
                          },
                          token_type: {
                            type: "string",
                            description:
                              "The type of token this is. Always gives Bearer now.",
                            enum: ["Bearer"],
                          },
                          expires_in: {
                            type: "integer",
                            description:
                              "The lifetime in seconds of the access token.",
                            minimum: 1,
                          },
                          refresh_token: {
                            type: "string",
                            description:
                              "The refresh token, which can be used to obtain new access tokens using the same authorization grant.",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            description: "Unauthorized",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      oauth2: {
        type: "oauth2",
        flows: {
          authorizationCode: {
            authorizationUrl: "https://auth.actionschema.com/oauth/authorize",
            tokenUrl: "https://auth.actionschema.com/oauth/access_token",
            scopes: {
              "actionschema-auth:admin":
                "Full access to all providers, clients, and permissions",
              "actionschema-auth:read:user":
                "Access to ActionSchema Auth UserID, as well as all user IDs of all providers the user logged into.",
              "actionschema-auth:readonly":
                "Only read what services are available",
            },
          },
        },
      },
    },
    schemas: {},
  },
} as OpenapiDocument;

export const authClient = createClient<Auth>(
  authOpenapi,
  "https://auth.actionschema.com/openapi.json",
  { access_token: process.env.undefined },
);

export const adminOpenapi = {
  "x-actionschema": "0.0.1",
  $schema: "https://spec.actionschema.com/openapi.json",
  openapi: "3.1.0",
  info: {
    title: "OpenAPI CRUD",
    version: "1.0",
    description: "",
  },
  servers: [
    {
      url: "https://data.actionschema.com",
    },
  ],
  security: [
    {
      oauth2: [],
    },
  ],
  components: {
    securitySchemes: {
      oauth2: {
        type: "oauth2",
        flows: {
          authorizationCode: {
            authorizationUrl: "https://auth.actionschema.com/oauth/authorize",
            tokenUrl: "https://auth.actionschema.com/oauth/access_token",
            "x-scopes-parameters": [
              {
                name: "projectSlug",
                description: "Refers to a project",
              },
              {
                name: "databaseSlug",
                description: "Refers to a database",
              },
            ],
            scopes: {
              admin: "Access to managing all projects",
              "user:project:{projectSlug}":
                "Access to use all databases in a project, with or without user separation.",
              "user:project:{projectSlug}:read":
                "Access to read all databases in a project, and write to all user-separated databases.",
              "admin:project:{projectSlug}":
                "Access to manage an entire project",
              "admin:db:{databaseSlug}": "Access to manage a database",
            },
          },
        },
      },
    },
    schemas: {
      UrlSlug: {
        type: "string",
        pattern: "^[a-zA-Z0-9._~-]+$",
        minLength: 1,
        maxLength: 64,
        description: "Slug compatible with URLs",
      },
      CreateDatabaseResponse: {
        type: "object",
        required: ["isSuccessful"],
        properties: {
          isSuccessful: {
            type: "boolean",
          },
          message: {
            type: "string",
          },
          authToken: {
            type: "string",
          },
          adminAuthToken: {
            type: "string",
          },
          databaseSlug: {
            type: "string",
          },
          openapiUrl: {
            type: "string",
          },
        },
      },
      VectorIndexColumns: {
        description:
          "A list of vector indexes to be created for several columns in your schema",
        type: "array",
        items: {
          type: "object",
          properties: {
            propertyKey: {
              type: "string",
            },
            model: {
              type: "string",
              enum: [
                "text-embedding-ada-002",
                "text-embedding-3-small",
                "text-embedding-3-large",
              ],
            },
            region: {
              type: "string",
              enum: ["us-east-1", "eu-west-1", "us-central1"],
            },
            dimension_count: {
              type: "number",
            },
            similarity_function: {
              type: "string",
              enum: ["COSINE", "EUCLIDIAN", "DOT_PRODUCT"],
            },
          },
          required: [
            "propertyKey",
            "model",
            "region",
            "dimension_count",
            "similarity_function",
          ],
        },
      },
      StandardResponse: {
        type: "object",
        required: ["isSuccessful"],
        properties: {
          status: {
            type: "number",
          },
          isSuccessful: {
            type: "boolean",
          },
          message: {
            type: "string",
          },
          priceCredit: {
            type: "number",
          },
        },
      },
    },
  },
  paths: {
    "/listDatabases": {
      get: {
        summary: "List your databases",
        operationId: "listDatabases",
        responses: {
          "200": {
            description: "My DB List",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    isSuccessful: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                    status: {
                      type: "number",
                    },
                    currentProjectSlug: {
                      type: "string",
                      description:
                        "The slug of the project these databases belong to",
                    },
                    databases: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: [
                          "databaseSlug",
                          "authToken",
                          "schema",
                          "openapiUrl",
                        ],
                        properties: {
                          databaseSlug: {
                            type: "string",
                          },
                          openapiUrl: {
                            type: "string",
                          },
                          authToken: {
                            type: "string",
                            description:
                              "Bearer Authorization token to be used for the openapi of this specific database. Can be used interchangeably to the admin authtoken.",
                          },
                          schema: {
                            type: "string",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/upsertDatabase": {
      post: {
        summary: "Create or update a database model",
        operationId: "upsertDatabase",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["schemaString", "databaseSlug"],
                properties: {
                  databaseSlug: {
                    title: "Database ID",
                    description:
                      "Unique slug for the database to be used as prefix to the endpoints.",
                    $ref: "#/components/schemas/UrlSlug",
                  },
                  schemaString: {
                    title: "Schema",
                    type: "string",
                    description:
                      "JSON of the schema you want the database to refer to. Should be a Object JSON Schema.",
                  },
                  authToken: {
                    type: "string",
                    description:
                      "Token required to authrorize using the CRUD endpoints. Will be generated if not given.",
                    minLength: 32,
                    maxLength: 128,
                  },
                  isUserLevelSeparationEnabled: {
                    type: "boolean",
                    description:
                      "If true, api will use oauth2 to authenticate, and will add key prefix to it so only the keys for the user will be able to be managed.",
                  },
                  region: {
                    description:
                      "Can be set for a new database. Cannot be changed",
                    type: "string",
                    enum: [
                      "eu-west-1",
                      "us-east-1",
                      "us-west-1",
                      "ap-northeast-1",
                      "us-central1",
                    ],
                  },
                  vectorIndexColumns: {
                    $ref: "#/components/schemas/VectorIndexColumns",
                  },
                  openaiApiKey: {
                    type: "string",
                    description: "Needed if you use vectorIndexColumns",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Create database response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateDatabaseResponse",
                },
              },
            },
          },
        },
      },
    },
    "/removeDatabase": {
      post: {
        summary: "Remove a database",
        operationId: "removeDatabase",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  databaseSlug: {
                    $ref: "#/components/schemas/UrlSlug",
                  },
                },
                required: ["databaseSlug"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardResponse",
                },
              },
            },
          },
        },
      },
    },
    "/setCurrentProject": {
      post: {
        summary: "Set a project",
        operationId: "setCurrentProject",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  projectSlug: {
                    $ref: "#/components/schemas/UrlSlug",
                  },
                  description: {
                    type: "string",
                  },
                },
                required: ["projectSlug"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardResponse",
                },
              },
            },
          },
        },
      },
    },
    "/listProjects": {
      get: {
        summary: "List projects",
        operationId: "listProjects",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    isSuccessful: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                    projects: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          projectSlug: {
                            $ref: "#/components/schemas/UrlSlug",
                          },
                          description: {
                            type: "string",
                          },
                          databaseSlugs: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                    currentProjectSlug: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/removeProject": {
      post: {
        summary: "Remove a project",
        operationId: "removeProject",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  projectSlug: {
                    $ref: "#/components/schemas/UrlSlug",
                  },
                },
                required: ["projectSlug"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardResponse",
                },
              },
            },
          },
        },
      },
    },
    "/openapi.json": {
      get: {
        security: [
          {
            oauth2: [],
          },
          {},
        ],
        summary: "Get openapi",
        operationId: "getOpenapi",
        responses: {
          "200": {
            description: "OpenAPI",
            content: {
              "application/json": {
                schema: {
                  $ref: "https://spec.actionschema.com/openapi.json",
                },
              },
            },
          },
        },
      },
    },
    "/{databaseSlug}/openapi.json": {
      get: {
        security: [
          {
            oauth2: [],
          },
          {},
        ],
        summary: "Get openapi for this database table alone",
        operationId: "getCrudOpenapi",
        parameters: [
          {
            in: "path",
            name: "databaseSlug",
            schema: {
              type: "string",
            },
            required: true,
          },
        ],
        responses: {
          "200": {
            description: "OpenAPI",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      $ref: "https://spec.actionschema.com/openapi.json",
                    },
                    {
                      type: "object",
                      required: ["isSuccessful"],
                      properties: {
                        isSuccessful: {
                          type: "boolean",
                        },
                        message: {
                          type: "string",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/project/{projectSlug}/openapi.json": {
      get: {
        security: [
          {
            oauth2: [],
          },
          {},
        ],
        summary: "Get Project OpenAPI",
        operationId: "getProjectOpenapi",
        parameters: [
          {
            in: "path",
            name: "projectSlug",
            schema: {
              type: "string",
            },
            required: true,
          },
        ],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      $ref: "https://spec.actionschema.com/openapi.json",
                    },
                    {
                      type: "object",
                      required: ["isSuccessful"],
                      properties: {
                        isSuccessful: {
                          type: "boolean",
                        },
                        message: {
                          type: "string",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/project/{projectSlug}/schema.json": {
      get: {
        security: [
          {
            oauth2: [],
          },
          {},
        ],
        summary: "Get Project OpenAPI",
        operationId: "getProjectSchema",
        parameters: [
          {
            in: "path",
            name: "projectSlug",
            schema: {
              type: "string",
            },
            required: true,
          },
        ],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {},
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
    "/{databaseSlug}/schema.json": {
      get: {
        security: [
          {
            oauth2: [],
          },
          {},
        ],
        summary: "Get schema for a database",
        operationId: "getSchema",
        parameters: [
          {
            in: "path",
            name: "databaseSlug",
            schema: {
              type: "string",
            },
            required: true,
          },
        ],
        responses: {
          "200": {
            description: "Schema",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {},
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as OpenapiDocument;

export const adminClient = createClient<Admin>(
  adminOpenapi,
  "https://data.actionschema.com/openapi.json",
  { access_token: process.env.undefined },
);

export const crudOpenapi = {
  "x-actionschema": "0.0.1",
  $schema: "https://spec.actionschema.com/openapi.json",
  openapi: "3.1.0",
  info: {
    title: "OpenAPI CRUD",
    version: "1.0",
    description: "To be replaced with better info about this model",
  },
  security: [
    {
      oauth2: [],
    },
    {
      bearerAuth: [],
    },
  ],
  servers: [
    {
      url: "https://data.actionschema.com/{databaseSlug}",
      description: "NB: this only works with a replaced databaseSlug!",
    },
  ],
  paths: {
    "/read": {
      post: {
        summary: "",
        operationId: "read",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ReadContext",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OpenAPI",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReadResponse",
                },
              },
            },
          },
        },
      },
    },
    "/create": {
      post: {
        summary: "",
        operationId: "create",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateContext",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OpenAPI",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateResponse",
                },
              },
            },
          },
        },
      },
    },
    "/remove": {
      post: {
        summary: "",
        operationId: "remove",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RemoveContext",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OpenAPI",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RemoveResponse",
                },
              },
            },
          },
        },
      },
    },
    "/update": {
      post: {
        summary: "",
        operationId: "update",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateContext",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OpenAPI",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateResponse",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      oauth2: {
        type: "oauth2",
        flows: {
          authorizationCode: {
            authorizationUrl: "https://auth.actionschema.com/oauth/authorize",
            tokenUrl: "https://auth.actionschema.com/oauth/access_token",
            scopes: {
              user: "Full access to this database and rest of the project",
            },
          },
        },
      },
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Bearer",
        description:
          "Hardcoded authToken, either a database-specific one, or an admin auth-token. Please note, that for dbs with `isUserLevelSeparationEnabled:true` the auth you provide will influence which rows you get back.",
      },
    },
    schemas: {
      ModelItem: {
        type: "object",
        description: "To be replaced with the actual model item",
        properties: {},
        additionalProperties: true,
      },
      CreateContext: {
        type: "object",
        properties: {
          databaseSlug: {
            type: "string",
          },
          items: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ModelItem",
              description:
                "If items in this array contain `__id`, it will be overwriting that item if it's already there.",
            },
          },
        },
        additionalProperties: false,
        required: ["items"],
      },
      CreateResponse: {
        type: "object",
        properties: {
          isSuccessful: {
            type: "boolean",
          },
          message: {
            type: "string",
          },
          result: {
            type: "array",
            items: {
              type: "string",
            },
            description: "The rowIds created",
          },
        },
        required: ["isSuccessful", "message"],
      },
      ReadResponse: {
        type: "object",
        properties: {
          isSuccessful: {
            type: "boolean",
          },
          message: {
            type: "string",
          },
          $schema: {
            type: "string",
          },
          items: {
            type: "object",
            additionalProperties: {
              $ref: "#/components/schemas/ModelItem",
            },
          },
          schema: {
            type: "object",
            additionalProperties: true,
          },
          canWrite: {
            type: "boolean",
          },
          hasMore: {
            type: "boolean",
          },
        },
        required: ["isSuccessful", "message"],
      },
      ReadContext: {
        type: "object",
        additionalProperties: false,
        properties: {
          databaseSlug: {
            type: "string",
          },
          search: {
            type: "string",
          },
          vectorSearch: {
            type: "object",
            properties: {
              propertyKey: {
                type: "string",
              },
              input: {
                type: "string",
              },
              topK: {
                type: "number",
              },
              minimumSimilarity: {
                type: "number",
              },
            },
            required: ["propertyKey", "input", "topK", "minimumSimilarity"],
          },
          rowIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
          startFromIndex: {
            type: "integer",
          },
          maxRows: {
            type: "integer",
          },
          filter: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Filter",
            },
          },
          sort: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Sort",
            },
          },
          objectParameterKeys: {
            type: "array",
            items: {
              type: "string",
            },
          },
          ignoreObjectParameterKeys: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
      Sort: {
        type: "object",
        properties: {
          sortDirection: {
            type: "string",
            enum: ["ascending", "descending"],
          },
          objectParameterKey: {
            type: "string",
          },
        },
        required: ["sortDirection", "objectParameterKey"],
      },
      Filter: {
        type: "object",
        properties: {
          operator: {
            type: "string",
            enum: [
              "equal",
              "notEqual",
              "endsWith",
              "startsWith",
              "includes",
              "includesLetters",
              "greaterThan",
              "lessThan",
              "greaterThanOrEqual",
              "lessThanOrEqual",
              "isIncludedIn",
              "isFalsy",
              "isTruthy",
            ],
          },
          value: {
            type: "string",
          },
          objectParameterKey: {
            type: "string",
          },
        },
        required: ["operator", "value", "objectParameterKey"],
      },
      UpdateContext: {
        type: "object",
        additionalProperties: false,
        properties: {
          databaseSlug: {
            type: "string",
          },
          id: {
            type: "string",
            description:
              "The id (indexed key) of the item to update. Update that functions as upsert. If the id didn't exist, it will be created.",
          },
          partialItem: {
            $ref: "#/components/schemas/ModelItem",
            description:
              "New (partial) value of the item. Will update all keys provided here. Please note that it cannot be set to 'undefined' as this doesn't transfer over JSON, but if you set it to 'null', the value will be removed from the database.",
          },
        },
        required: ["id", "partialItem"],
      },
      UpdateResponse: {
        type: "object",
        properties: {
          isSuccessful: {
            type: "boolean",
          },
          message: {
            type: "string",
          },
        },
        required: ["isSuccessful", "message"],
      },
      RemoveContext: {
        type: "object",
        properties: {
          databaseSlug: {
            type: "string",
          },
          rowIds: {
            description: "Which IDs should be removed",
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
        required: ["rowIds"],
      },
      RemoveResponse: {
        type: "object",
        properties: {
          isSuccessful: {
            type: "boolean",
          },
          message: {
            type: "string",
          },
          deleteCount: {
            type: "integer",
            description: "The number of items deleted",
          },
        },
        required: ["isSuccessful", "message"],
      },
    },
  },
} as OpenapiDocument;

export const crudClient = createClient<Crud>(
  crudOpenapi,
  "https://data.actionschema.com/auth-admin/openapi.json",
  { access_token: process.env.undefined },
);
