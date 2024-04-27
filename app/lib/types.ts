import { JSONSchema7 } from "json-schema";

export type DatabaseDetails = {
  schema: JSONSchema7;
  authToken: string;
};
