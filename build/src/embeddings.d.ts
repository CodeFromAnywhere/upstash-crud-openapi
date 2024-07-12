import OpenAI from "openai";
import type { EmbeddingCreateParams } from "openai/resources/embeddings";
import { DatabaseDetails, OpenaiEmbeddingModelEnum } from "./types";
import { O } from "from-anywhere";
/**
https://upstash.com/docs/vector

An array of objects may contain 1 column that I want vectorised. The array needs to initiate the db if not already. It can then insert a vector with {id, vector, metadata } where “id” can refer to a unique identifier of an item in the array.

We can now make search available in a crud.
 */
export declare const vectorSearch: (context: {
    vectorRestUrl: string;
    vectorRestToken: string;
    vector: number[];
    topK: number;
    includeMetadata: boolean;
    includeVectors: boolean;
}) => Promise<import("@upstash/vector/dist/vector-wT6XsV3D").Q<import("@upstash/vector/dist/vector-wT6XsV3D").D>[]>;
export declare const deleteVector: (context: {
    vectorRestUrl: string;
    vectorRestToken: string;
    ids: string[] | number[] | string | number;
}) => Promise<{
    deleted: number;
}>;
export declare const deleteIndex: (context: {
    vectorRestUrl: string;
    vectorRestToken: string;
    namespace: string;
}) => Promise<string>;
/**
https://upstash.com/docs/vector

An array of objects may contain 1 column that I want vectorised. The array needs to initiate the db if not already. It can then insert a vector with {id, vector, metadata } where “id” can refer to a unique identifier of an item in the array.

We can now make search available in a crud.
 */
export declare const upsertVector: (context: {
    vectorRestUrl: string;
    vectorRestToken: string;
    vector: number[];
    metadata: {
        [key: string]: string;
    };
    id: string | number;
}) => Promise<string>;
type VectorIndexResponse = {
    customerId: string;
    id: string;
    name: string;
    similarityFunction: string;
    dimensionCount: number;
    embeddingModel: string;
    /** the vectorRestUrl */
    endpoint: string;
    /** the vectorRestToken */
    token: string;
    readOnlyToken: string;
    type: string;
    region: string;
    maxVectorCount: number;
    maxDailyUpdates: number;
    maxDailyQueries: number;
    maxMonthlyBandwidth: number;
    maxWritesPerSecond: number;
    maxQueryPerSecond: number;
    maxReadsPerRequest: number;
    maxWritesPerRequest: number;
    creationTime: number;
};
/**
Even though it's not documented, reverse engineering the upstash console request worked fine
*/
export declare const createIndex: (context: {
    upstashApiKey: string;
    upstashEmail: string;
    vectorIndexName: string;
    region: "us-east-1" | "eu-west-1" | "us-central1";
    dimension_count: number;
    similarity_function: "COSINE" | "EUCLIDIAN" | "DOT_PRODUCT";
}) => Promise<VectorIndexResponse | undefined>;
export declare const vectorizeStrings: (openaiApiKey: string, params: EmbeddingCreateParams) => Promise<OpenAI.Embeddings.Embedding[]>;
export declare const vectorizeString: (context: {
    input: string;
    openaiApiKey: string;
    dimensions?: number;
    model?: OpenaiEmbeddingModelEnum;
}) => Promise<number[]>;
/**
auto-vectorize and auto-submit a column into the vector database everytime it changes.
 */
export declare const submitVectorFromString: (context: {
    /**ID Belonging to the row */
    id: string;
    input: string;
    dimensions?: number;
    model?: OpenaiEmbeddingModelEnum;
    openaiApiKey: string;
    vectorRestToken: string;
    vectorRestUrl: string;
}) => Promise<{
    isSuccessful: boolean;
    message: string;
}>;
/**
Provide a search endpoint that performs `vectorizeString`, `vectorSearch`, and `read` based on `propertyKey:ENUM, search:string`
 */
export declare const search: (context: {
    input: string;
    topK?: number;
    openaiApiKey: string;
    vectorRestToken: string;
    vectorRestUrl: string;
    /** TODO: Should maybe be kept somehow when creating the index */
    model?: "text-embedding-ada-002" | "text-embedding-3-small" | "text-embedding-3-large";
}) => Promise<import("@upstash/vector/dist/vector-wT6XsV3D").Q<import("@upstash/vector/dist/vector-wT6XsV3D").D>[]>;
/** NB: If we use this, we can later decouple it more easily with added openapi in between */
export declare const embeddingsClient: {
    createIndex: (context: {
        upstashApiKey: string;
        upstashEmail: string;
        vectorIndexName: string;
        region: "us-east-1" | "eu-west-1" | "us-central1";
        dimension_count: number;
        similarity_function: "COSINE" | "EUCLIDIAN" | "DOT_PRODUCT";
    }) => Promise<VectorIndexResponse | undefined>;
    deleteVector: (context: {
        vectorRestUrl: string;
        vectorRestToken: string;
        ids: string[] | number[] | string | number;
    }) => Promise<{
        deleted: number;
    }>;
    search: (context: {
        input: string;
        topK?: number;
        openaiApiKey: string;
        vectorRestToken: string;
        vectorRestUrl: string;
        /** TODO: Should maybe be kept somehow when creating the index */
        model?: "text-embedding-ada-002" | "text-embedding-3-small" | "text-embedding-3-large";
    }) => Promise<import("@upstash/vector/dist/vector-wT6XsV3D").Q<import("@upstash/vector/dist/vector-wT6XsV3D").D>[]>;
    upsertVector: (context: {
        vectorRestUrl: string;
        vectorRestToken: string;
        vector: number[];
        metadata: {
            [key: string]: string;
        };
        id: string | number;
    }) => Promise<string>;
};
export declare const upsertIndexVectors: (databaseDetails: DatabaseDetails, id: string, item: O) => Promise<void>;
export {};
//# sourceMappingURL=embeddings.d.ts.map