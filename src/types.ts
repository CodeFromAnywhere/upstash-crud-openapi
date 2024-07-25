import { JSONSchema7 } from "json-schema";

/**

Existing scopes:

- admin:{projectSlug}
- user:{projectSlug}

// MAY BE NICE:
// - user:read:{projectSlug}

*/

type Scope = `admin:${string}` | `user:${string}`;
/**
KEYS

admin-projects:

- key = `projects_{auth}`
- value = slug[]

adminDetails

- key = `admin_{auth}`
- value = {currentProjectSlug,githubAuthToken,email}

databaseDetails

- key = db_{slug}
- value = details (has auth to be checked)

projectDetails

- key = `project_{slug}`
- value = details (description, auth to be checked, and databaseSlugs)

DB key-value:

- key = `db_{databaseSlug}_{auth}_{key}`
- value = the content of the row (according to its schema)


 */
export type DbKey =
  | `projects_${string}`
  | `admin_${string}`
  | `db_${string}`
  | `project_${string}`
  | `db_${string}_${string}`;

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

  /**If true, api will use oauth2 to authenticate, and will add key prefix to it */
  isUserLevelSeparationEnabled?: boolean;

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
};
