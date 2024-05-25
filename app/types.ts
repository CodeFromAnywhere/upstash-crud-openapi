import { JSONSchema7 } from "json-schema";

/**
 * Details that are found in the KV store after de-serialisation
 *
 * Key should be a databaseSlug, then these values should be there
 */
export type DatabaseDetails = {
  upstashApiKey: string;
  upstashEmail: string;
  database_id: string;
  endpoint: string;
  rest_token: string;
  authToken: string;
  adminAuthToken: string;
  schema: JSONSchema7;
};
