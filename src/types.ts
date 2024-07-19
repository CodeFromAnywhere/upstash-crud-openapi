import { JSONSchema7 } from "json-schema";

/**
KEYS

admin-dbs:

- key = `dbs_{auth}`
- value = slug[]

admin-projects:

- key = `projects_{auth}`
- value = slug[]

adminDetails

- key = `admin_{auth}`
- value = {currentProjectSlug,githubAuthToken,email}

databaseDetails

- key = slug
- value = details (has auth to be checked)

projectDetails

- key = `project_{slug}`
- value = details (description, auth to be checked)

 */
export type DbKey =
  | `dbs_${string}`
  | `projects_${string}`
  | `admin_${string}`
  | `db_${string}`
  | `project_${string}`;

export type OpenaiEmbeddingModelEnum =
  | "text-embedding-ada-002"
  | "text-embedding-3-small"
  | "text-embedding-3-large";

/**
 * Details that are found in the KV store after de-serialisation
 *
 * Key should be a databaseSlug, then these values should be there
 */
export type DatabaseDetails = {
  projectSlug: string;
  upstashApiKey: string;
  upstashEmail: string;
  database_id: string;
  endpoint: string;
  rest_token: string;
  authToken: string;
  adminAuthToken: string;
  schema: JSONSchema7;

  openaiApiKey?: string;
  // TODO: put the right stuff in there after creating the indexes, so we can easily perform actions with it.
  vectorIndexColumnDetails?: {
    propertyKey: string;
    vectorRestToken: string;
    vectorRestUrl: string;
    dimensions: number;
    model: OpenaiEmbeddingModelEnum;
  }[];
};

/**
 * a project is a collection of dbs.
 */
export type ProjectDetails = {
  adminAuthToken: string;
  description: string;
  databaseSlugs: string[];
};

export type AdminDetails = {
  currentProjectSlug: string;
  githubAuthToken: string;
  email: string;
};
