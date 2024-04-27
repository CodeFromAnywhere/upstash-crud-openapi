import { tryParseJson } from "from-anywhere";
import { JSONSchema7 } from "json-schema";

export const setSchema = async (context: {
  adminToken: string;
  schemaString: string;
  /**
   * URL compliant unique name for this schema. If it already exists, will be overwritten.
   */
  name: string;
}) => {
  const { schemaString } = context;

  const schema = tryParseJson<JSONSchema7>(schemaString);

  if (!schema || schema.type !== "object") {
    return { isSuccessful: false, message: "It's not an object JSON Schema" };
  }

  //It takes in a JSON-Schema or URL where a JSON-Schema can be found of a single item
  //
  // It stores that with an admin-token and [name]
};
