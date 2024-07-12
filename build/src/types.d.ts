import { JSONSchema7 } from "json-schema";
export type OpenaiEmbeddingModelEnum = "text-embedding-ada-002" | "text-embedding-3-small" | "text-embedding-3-large";
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
    openaiApiKey?: string;
    vectorIndexColumnDetails?: {
        propertyKey: string;
        vectorRestToken: string;
        vectorRestUrl: string;
        dimensions: number;
        model: OpenaiEmbeddingModelEnum;
    }[];
};
//# sourceMappingURL=types.d.ts.map