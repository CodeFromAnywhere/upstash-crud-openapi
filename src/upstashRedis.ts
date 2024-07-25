import {
  O,
  mapKeys,
  mergeObjectsArray,
  notEmpty,
  tryParseJson,
} from "from-anywhere";
import { Redis } from "@upstash/redis";

/**
 * Represents the details of a database including its identification, configuration,
 * ownership, and operational status.
 */
interface UpstashRedisCreateDatabaseResponse {
  /**
   * ID of the created database.
   */
  database_id: string;

  /**
   * Name of the database.
   */
  database_name: string;

  /**
   * Type of the database in terms of pricing model (Free, Pay as You Go, or Enterprise).
   */
  database_type: string;

  /**
   * The region where the database is hosted.
   */
  region: string;

  /**
   * Database port for clients to connect.
   */
  port: number;

  /**
   * Creation time of the database as Unix time.
   */
  creation_time: number;

  /**
   * State of the database (active or deleted).
   */
  state: string;

  /**
   * Password of the database.
   */
  password: string;

  /**
   * Email or team id of the owner of the database.
   */
  user_email: string;

  /**
   * Endpoint URL of the database.
   */
  endpoint: string;

  /**
   * Indicates whether TLS/SSL is enabled or not.
   */
  tls: boolean;
}

/**
 * Response object for creating a database
 */

interface UpstashRedisGetDatabaseResponse {
  /**
   * ID of the created database
   */
  database_id: string;

  /**
   * Name of the database
   */
  database_name: string;

  /**
   * Type of the database in terms of pricing model(Free, Pay as You Go or Enterprise)
   */
  database_type: "Free" | "Pay as You Go" | "Enterprise";

  /**
   * The region where database is hosted
   */
  region: string;

  /**
   * Database port for clients to connect
   */
  port: number;

  /**
   * Creation time of the database as Unix time
   */
  creation_time: number;

  /**
   * State of database (active or deleted)
   */
  state: "active" | "deleted";

  /**
   * Password of the database
   */
  password: string;

  /**
   * Email or team id of the owner of the database
   */
  user_email: string;

  /**
   * Endpoint URL of the database
   */
  endpoint: string;

  /**
   * TLS/SSL is enabled or not
   */
  tls: boolean;

  /**
   * Token for rest based communication with the database
   */
  rest_token: string;

  /**
   * Read only token for rest based communication with the database
   */
  read_only_rest_token: string;

  /**
   * Max number of concurrent clients can be opened on this database currently
   */
  db_max_clients: number;

  /**
   * Max size of a request that will be accepted by the database currently(in bytes)
   */
  db_max_request_size: number;

  /**
   * Total disk size limit that can be used for the database currently(in bytes)
   */
  db_disk_threshold: number;

  /**
   * Max size of an entry that will be accepted by the database currently(in bytes)
   */
  db_max_entry_size: number;

  /**
   * Max size of a memory the database can use(in bytes)
   */
  db_memory_threshold: number;

  /**
   * Max daily bandwidth can be used by the database(in bytes)
   */
  db_daily_bandwidth_limit: number;

  /**
   * Max number of commands can be sent to the database per second
   */
  db_max_commands_per_second: number;

  /**
   * Total number of commands can be sent to the database
   */
  db_request_limit: number;
}

export const listUpstashRedisDatabases = async (context: {
  upstashEmail: string;
  upstashApiKey: string;
}) => {
  const { upstashApiKey, upstashEmail } = context;
  const url = "https://api.upstash.com/v2/redis/databases";
  const auth = `Basic ${btoa(`${upstashEmail}:${upstashApiKey}`)}`; // Encode credentials

  const result = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  })
    .then(
      (response) =>
        response.json() as Promise<UpstashRedisGetDatabaseResponse[]>,
    )
    .catch((error) => {
      console.error("Error:", error);
      return undefined;
    });

  return { isSuccessful: true, message: "Listed db", result };
};

/**
 */
export const createUpstashRedisDatabase = async (context: {
  upstashEmail: string;
  upstashApiKey: string;
  region?:
    | "eu-west-1"
    | "us-east-1"
    | "us-west-1"
    | "ap-northeast-1"
    | "us-central1";
  name: string;
}) => {
  const { upstashApiKey, upstashEmail, region, name } = context;
  const url = "https://api.upstash.com/v2/redis/database";
  const auth = `Basic ${btoa(`${upstashEmail}:${upstashApiKey}`)}`; // Encode credentials
  console.log("NEED TO CREATE NEW DB");
  const data = {
    name,
    region: region || "us-central1",
    tls: true,
  };

  const result = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(
      (response) =>
        response.json() as Promise<UpstashRedisCreateDatabaseResponse>,
    )
    .catch((error) => {
      console.error("Error:", error);
      return undefined;
    });

  if (!result?.database_id) {
    console.log({ result });
    return {
      isSuccessful: false,
      message: typeof result === "string" ? result : "No database created",
    };
  }

  const dbInfo = await getUpstashRedisDatabase({
    upstashApiKey,
    upstashEmail,
    databaseId: result.database_id,
  });

  if (!dbInfo) {
    return { isSuccessful: false, message: "Couldn't get info" };
  }

  return { isSuccessful: true, message: "Made db", result: dbInfo };
};

/**

 */
export const getUpstashRedisDatabase = async (context: {
  upstashEmail: string;
  upstashApiKey: string;
  databaseId: string;
}) => {
  const { upstashApiKey, upstashEmail, databaseId } = context;
  const url = `https://api.upstash.com/v2/redis/database/${databaseId}`;
  const auth = `Basic ${btoa(`${upstashEmail}:${upstashApiKey}`)}`; // Encode credentials

  const result = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  })
    .then(async (response) => {
      const json = await response.json();

      if (json.error) {
        console.log("UpstashError", json.error);
        return;
      }

      return json as UpstashRedisGetDatabaseResponse;
    })
    .catch((error) => {
      console.error("Error:", error);
      return undefined;
    });

  return result;
};

/** see https://upstash.com/docs/redis/features/restapi */
export const upstashRedisRequest = async (context: {
  redisRestUrl: string;
  redisRestToken: string;
  command: string;
  args: string[];
}) => {
  const { args, command, redisRestToken, redisRestUrl } = context;

  const url = `https://${redisRestUrl}/${command}/${args.join("/")}`;

  console.log({ url, redisRestToken });
  const result = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${redisRestToken}`,
      "Content-Type": "application/json",
    },
  })
    .then(async (response) => {
      console.log(" status", response.status);

      if (response.ok) {
        const text = await response.text();

        const json = tryParseJson<{ result: any }>(text);

        if (!json) {
          return { result: text };
        }

        return json;
      }

      console.log("NO JSON! status", response.status);
      return { result: response.statusText };
    })
    .catch((error) => {
      console.error("Upstash Redis Error:", error.message);
      return { result: undefined };
    });

  return result.result;
};

export const getUpstashRedisRangeKeys = async (context: {
  redisRestUrl: string;
  redisRestToken: string;
  baseKey: string | undefined;
}) => {
  const { baseKey, redisRestToken, redisRestUrl } = context;

  const redis = new Redis({
    url: `https://${redisRestUrl}`,
    token: redisRestToken,
  });

  let cursor: string = "0";
  let allKeys: string[] = [];
  let limit = 0;

  // Temporarily allow max 10 pages, which is 10 api calls.
  while (limit < 10) {
    limit = limit + 1;
    const result = await redis.scan(cursor, {
      match: baseKey ? `${baseKey}*` : "*",
      count: 1000,
    });

    const [newCursor, newKeys] = result;

    allKeys = allKeys.concat(newKeys);

    if (!newCursor || String(cursor) === String(newCursor)) {
      console.log({ newCursor }, "same. BREAK");
      break;
    }

    console.log(
      `${cursor}!==${newCursor}. Continue with ${newCursor}. Limit is ${limit}`,
      result,
    );

    cursor = newCursor;
  }

  return allKeys.concat(baseKey || "");
};

export const upstashRedisSetItems = async (context: {
  baseKey?: string;
  redisRestUrl: string;
  redisRestToken: string;
  items: { [id: string]: { [key: string]: any } };
}) => {
  const { baseKey, redisRestToken, redisRestUrl, items } = context;

  const redis = new Redis({
    url: `https://${redisRestUrl}`,
    token: redisRestToken,
  });

  const realItems = await mapKeys(items, (key) => `${baseKey || ""}${key}`);

  const result = await redis.mset(realItems);

  return result;
};

/** Gets a range of items from redis by first iterating over the keys (in range or all) and then efficiently getting all values */
export const upstashRedisGetRange = async (context: {
  redisRestUrl: string;
  redisRestToken: string;
  baseKey: string | undefined;
}) => {
  const { redisRestToken, redisRestUrl, baseKey } = context;

  const redis = new Redis({
    url: `https://${redisRestUrl}`,
    token: redisRestToken,
  });

  const allKeys = await getUpstashRedisRangeKeys({
    redisRestToken,
    redisRestUrl,
    baseKey,
  });

  if (allKeys.length === 0) {
    return;
  }

  const mgetResult = (await redis.mget(...allKeys)) as O[];

  // console.log({ mgetResult });
  const allValues = mergeObjectsArray(
    mgetResult
      .map((value, index) => {
        if (!value) {
          return null;
        }

        const key = baseKey
          ? allKeys[index].slice(baseKey.length)
          : allKeys[index];
        return { [key]: value };
      })
      .filter(notEmpty),
  );

  return allValues;
};

/** Gets a range of items from redis by first iterating over the keys (in range or all) and then efficiently getting all values */
export const upstashRedisGetMultiple = async (context: {
  redisRestUrl: string;
  redisRestToken: string;
  keys: string[];
  baseKey?: string;
}) => {
  const { redisRestToken, redisRestUrl, keys, baseKey } = context;

  const redis = new Redis({
    url: `https://${redisRestUrl}`,
    token: redisRestToken,
  });

  const realKeys = baseKey ? keys.map((k) => `${baseKey}${k}`) : keys;
  const mgetResult = (await redis.mget(...realKeys)) as (O | null)[];

  return mgetResult;
};

interface DeleteDatabasesResult {
  isSuccessful: boolean;
  message: string;
  deletedDatabases?: string[];
  errors?: { [databaseId: string]: string };
}

export const deleteUpstashRedisDatabases = async (context: {
  upstashEmail: string;
  upstashApiKey: string;
  excludeDatabaseName: string;
}): Promise<DeleteDatabasesResult> => {
  const { upstashEmail, upstashApiKey, excludeDatabaseName } = context;
  console.log({ upstashApiKey, upstashEmail });
  const baseUrl = "https://api.upstash.com/v2/redis/database";
  const auth = `Basic ${btoa(`${upstashEmail}:${upstashApiKey}`)}`;

  const listResult = await listUpstashRedisDatabases({
    upstashEmail,
    upstashApiKey,
  });

  if (!listResult.isSuccessful || !listResult.result) {
    return {
      isSuccessful: false,
      message: "Failed to list databases",
    };
  }

  console.log({ result: listResult.result });
  const databasesToDelete = listResult.result?.filter?.(
    (db) => db.database_name !== excludeDatabaseName,
  );

  console.log({
    databasesToDelete: databasesToDelete.map((x) => x.database_name),
  });

  const deletedDatabases: string[] = [];
  const errors: { [databaseId: string]: string } = {};

  for (const db of databasesToDelete) {
    try {
      const response = await fetch(`${baseUrl}/${db.database_id}`, {
        method: "DELETE",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        deletedDatabases.push(db.database_id);
      } else {
        const errorText = await response.text();
        errors[db.database_id] = `Failed to delete: ${errorText}`;
      }
    } catch (error) {
      errors[db.database_id] = `Error: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  const isSuccessful = deletedDatabases.length === databasesToDelete.length;
  const message = isSuccessful
    ? `Successfully deleted all databases except '${excludeDatabaseName}'`
    : `Deleted some databases, but encountered errors. Check the 'errors' object for details.`;

  return { isSuccessful, message, deletedDatabases, errors };
};
