import { resolveReferenceOrContinue } from "./resolver";
import { JSONSchemaType } from "ajv";
import { OpenAPIDocument, Operation, Reference } from "actionschema/types";

export const tryGetOperationBodySchema = async (
  openapi: OpenAPIDocument,
  operation: Operation,
  documentLocation?: string,
) => {
  try {
    const requestBody = await resolveReferenceOrContinue(
      operation.requestBody,
      openapi,
      documentLocation,
    );

    const schemaOrReference = requestBody?.content?.["application/json"]
      ?.schema as JSONSchemaType<any> | Reference | undefined;
    const schema = await resolveReferenceOrContinue(
      schemaOrReference,
      openapi,
      documentLocation,
    );
    return schema;
  } catch (e) {
    console.log("tryGetOperationBodySchema", e);
    return;
  }
};
