/*
The biggest goal of this implementation of Vector search is for it to be super modular. By separating vector creation and vector db from another db, we can still use any db without limits.

REQUIREMENTS for a Vector micro-service OpenAPI

INDEX
- create index
- remove index

VECTOR
- upsert vector
- delete vector
- vectorize string
- vector search

Now, the crud openapi can potentially integrate with this Vector openapi as a microservice that is interchangeable.

In the CRUD we need actionschema capabilities. We can then:

- create an index when the CRUD schema gets created/updated. This would give some metadata for the index that needs to be retreivable: `{propertyKey, vectorRestUrl, vectorRestToken}`.
- auto-vectorize and auto-submit a column into the vector database everytime it changes.
- provide a search endpoint that performs `vectorizeString`, `vectorSearch`, and `read` based on `propertyKey:ENUM, search:string`

Implementing it into `crud-openapi` will be easy. Implementing it in a more generic way into actionschema will be harder. For now, doing a direct integration should be fine.

Integration into any crud:

- ✅ In `createDatabase`, specify needed columns, and ensure to call `createIndex` for needed columns
- ✅ In `create` and `update`, ensure to call `submitVectorFromString` for needed columns. NB: If we'd had actionschema, this wouldn't have needed to be changed except for them activating the actionschema maybe
- ✅ In `remove`, ensure to call `deleteVector` for needed columns. NB: If we had actionschema.x-unmountOperationId, an unmount property could be set.
- ✅ In `read` add an array of `search(input,topK)` and `minimumSimilarity?` parameters and retreive only the ones from `search`, then still do other filters.

*/
import OpenAI from "openai";

import { Index } from "@upstash/vector";
import { EmbeddingCreateParams } from "openai/resources/embeddings.mjs";
import { DatabaseDetails, OpenaiEmbeddingModelEnum } from "@/types";
import { O } from "from-anywhere";

/**
https://upstash.com/docs/vector

An array of objects may contain 1 column that I want vectorised. The array needs to initiate the db if not already. It can then insert a vector with {id, vector, metadata } where “id” can refer to a unique identifier of an item in the array.

We can now make search available in a crud.
 */
export const vectorSearch = async (context: {
  vectorRestUrl: string;
  vectorRestToken: string;
  vector: number[];
  topK: number;
  includeMetadata: boolean;
  includeVectors: boolean;
}) => {
  const {
    vectorRestToken,
    vectorRestUrl,
    vector,
    topK,
    includeMetadata,
    includeVectors,
  } = context;

  const index = new Index({
    url: vectorRestUrl,
    token: vectorRestToken,
  });

  const result = await index.query({
    vector,
    topK,
    includeMetadata,
    includeVectors,
  });

  return result;
};

export const deleteVector = async (context: {
  vectorRestUrl: string;
  vectorRestToken: string;
  ids: string[] | number[] | string | number;
  //namespace: string;
}) => {
  const { vectorRestToken, vectorRestUrl, ids } = context;

  const index = new Index({
    url: vectorRestUrl,
    token: vectorRestToken,
  });
  const result = await index.delete(
    ids,
    //{ namespace }
  );

  return result;
};

export const deleteIndex = async (context: {
  vectorRestUrl: string;
  vectorRestToken: string;
  namespace: string;
}) => {
  const { vectorRestToken, vectorRestUrl, namespace } = context;

  const index = new Index({
    url: vectorRestUrl,
    token: vectorRestToken,
  });
  const result = await index.deleteNamespace(namespace);

  return result;
};

/**
https://upstash.com/docs/vector

An array of objects may contain 1 column that I want vectorised. The array needs to initiate the db if not already. It can then insert a vector with {id, vector, metadata } where “id” can refer to a unique identifier of an item in the array.

We can now make search available in a crud.
 */
export const upsertVector = async (context: {
  vectorRestUrl: string;
  vectorRestToken: string;
  vector: number[];
  metadata: { [key: string]: string };
  // data: string;
  id: string | number;
}) => {
  const { vectorRestToken, vectorRestUrl, vector, metadata, id } = context;

  const index = new Index({
    url: vectorRestUrl,
    token: vectorRestToken,
  });

  const result = await index.upsert({
    vector,
    metadata,
    //  data,
    id,
  });

  return result;
};

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
export const createIndex = async (context: {
  upstashApiKey: string;
  upstashEmail: string;
  vectorIndexName: string;
  region: "us-east-1" | "eu-west-1" | "us-central1";
  dimension_count: number;
  similarity_function: "COSINE" | "EUCLIDIAN" | "DOT_PRODUCT";
}) => {
  const {
    upstashApiKey,
    upstashEmail,
    vectorIndexName,
    dimension_count,
    region,
    similarity_function,
  } = context;
  const url = `https://api.upstash.com/v2/vector/index`;
  const auth = `Basic ${btoa(`${upstashEmail}:${upstashApiKey}`)}`; // Encode credentials

  const result = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: vectorIndexName,
      region,
      type: "payg",
      dimension_count,
      similarity_function,
    }),
  })
    .then(async (response) => {
      const json = await response.json();
      return json as VectorIndexResponse;
    })
    .catch((error) => {
      console.error("Error:", error);
      return undefined;
    });

  return result;
};

export const vectorizeStrings = async (
  openaiApiKey: string,
  params: EmbeddingCreateParams,
) => {
  const openai = new OpenAI({ apiKey: openaiApiKey });
  const result = await openai.embeddings.create(params);
  return result.data;
};

export const vectorizeString = async (context: {
  input: string;
  openaiApiKey: string;
  dimensions?: number;
  model?: OpenaiEmbeddingModelEnum;
}) => {
  const { input, openaiApiKey, dimensions, model } = context;
  const result = (
    await vectorizeStrings(openaiApiKey, {
      input,
      model: model || "text-embedding-3-large",
      dimensions,
      encoding_format: "float",
      user: "crud-openapi",
    })
  )?.[0]?.embedding;

  return result;
};

/**
auto-vectorize and auto-submit a column into the vector database everytime it changes.
 */
export const submitVectorFromString = async (context: {
  /**ID Belonging to the row */
  id: string;
  input: string;
  dimensions?: number;
  model?: OpenaiEmbeddingModelEnum;
  //keys
  openaiApiKey: string;
  vectorRestToken: string;
  vectorRestUrl: string;
}) => {
  const {
    input,
    openaiApiKey,
    dimensions,
    model,
    id,
    vectorRestToken,
    vectorRestUrl,
  } = context;
  const vector = await vectorizeString({
    input,
    openaiApiKey,
    dimensions,
    model,
  });
  const upsertResultMessage = await upsertVector({
    vector,
    id,
    metadata: {},
    vectorRestToken,
    vectorRestUrl,
  });

  return { isSuccessful: upsertResultMessage === "ok", message: "Done" };
};

/**
Provide a search endpoint that performs `vectorizeString`, `vectorSearch`, and `read` based on `propertyKey:ENUM, search:string`
 */
export const search = async (context: {
  input: string;
  topK?: number;
  openaiApiKey: string;
  vectorRestToken: string;
  vectorRestUrl: string;
  /** TODO: Should maybe be kept somehow when creating the index */
  model?:
    | "text-embedding-ada-002"
    | "text-embedding-3-small"
    | "text-embedding-3-large";
}) => {
  const { vectorRestToken, vectorRestUrl, topK, openaiApiKey, input, model } =
    context;

  const index = new Index({
    url: vectorRestUrl,
    token: vectorRestToken,
  });

  const { dimension } = await index.info();
  const vec = await vectorizeString({
    openaiApiKey,
    input,
    dimensions: dimension,
    model,
  });

  const results = await vectorSearch({
    vectorRestToken,
    vectorRestUrl,
    vector: vec,
    topK: topK || 100,
    includeMetadata: false,
    includeVectors: false,
  });

  return results;
};

/** NB: If we use this, we can later decouple it more easily with added openapi in between */
export const embeddingsClient = {
  createIndex,
  deleteVector,
  search,
  upsertVector,
};

export const upsertIndexVectors = async (
  databaseDetails: DatabaseDetails,
  id: string,
  item: O,
) => {
  if (
    !databaseDetails.vectorIndexColumnDetails ||
    !databaseDetails.openaiApiKey
  ) {
    return;
  }
  //for each inserted item, for each column, create vectors.
  const res = await Promise.all(
    databaseDetails.vectorIndexColumnDetails.map(async (details) => {
      const input = item?.[details.propertyKey];
      if (typeof input !== "string") {
        return;
      }
      const { vectorRestToken, vectorRestUrl, dimensions, model } = details;
      const res = await submitVectorFromString({
        id,
        input,
        openaiApiKey: databaseDetails.openaiApiKey!,
        vectorRestToken,
        vectorRestUrl,
        dimensions,
        model,
      });

      return res;
    }),
  );
};
