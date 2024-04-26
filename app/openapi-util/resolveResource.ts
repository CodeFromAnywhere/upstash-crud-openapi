import { OpenAPIDocument } from "actionschema/types";
import { JSONSchemaType } from "ajv";
import { readJsonFile } from "from-anywhere/node";
import path from "path";

export const resolveResource = async (
  uri: string,
  document: OpenAPIDocument | JSONSchemaType<any>,
  documentLocation: string,
): Promise<OpenAPIDocument | JSONSchemaType<any>> => {
  if (uri === "") {
    // we're already there
    return document;
  }

  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    // absolute url
    const json = await fetch(uri).then(
      (res) => res.json() as Promise<OpenAPIDocument | JSONSchemaType<any>>,
    );
    return json;
  }

  if (uri.startsWith("/")) {
    // absolute path
    const json = await readJsonFile<OpenAPIDocument | JSONSchemaType<any>>(uri);

    if (json === null) {
      throw new Error("JSON Not found at " + uri);
    }
    return json;
  }

  // relative path
  const absolutePath = path.resolve(documentLocation, uri);
  const json = await readJsonFile<OpenAPIDocument | JSONSchemaType<any>>(
    absolutePath,
  );
  if (json === null) {
    throw new Error("JSON Not found at " + uri);
  }

  return json;
};
