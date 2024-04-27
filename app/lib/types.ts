import { JSONSchema7 } from "json-schema";

/** Details that are found in the KV store after de-serialisation */
export type DatabaseDetails = {
  schema: JSONSchema7;
};
