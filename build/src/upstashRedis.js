import { mapKeys, mergeObjectsArray, notEmpty, tryParseJson, } from "from-anywhere";
import { Redis } from "@upstash/redis";
export const listUpstashRedisDatabases = async (context) => {
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
        .then((response) => response.json())
        .catch((error) => {
        console.error("Error:", error);
        return undefined;
    });
    return { isSuccessful: true, message: "Listed db", result };
};
/**
 */
export const createUpstashRedisDatabase = async (context) => {
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
        .then((response) => response.json())
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
export const getUpstashRedisDatabase = async (context) => {
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
        return json;
    })
        .catch((error) => {
        console.error("Error:", error);
        return undefined;
    });
    return result;
};
/** see https://upstash.com/docs/redis/features/restapi */
export const upstashRedisRequest = async (context) => {
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
            const json = tryParseJson(text);
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
export const getUpstashRedisRangeKeys = async (context) => {
    const { baseKey, redisRestToken, redisRestUrl } = context;
    const redis = new Redis({
        url: `https://${redisRestUrl}`,
        token: redisRestToken,
    });
    let cursor = "0";
    let allKeys = [];
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
        console.log(`${cursor}!==${newCursor}. Continue with ${newCursor}. Limit is ${limit}`, result);
        cursor = newCursor;
    }
    return allKeys.concat(baseKey || "");
};
export const upstashRedisSetItems = async (context) => {
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
export const upstashRedisGetRange = async (context) => {
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
    const mgetResult = (await redis.mget(...allKeys));
    // console.log({ mgetResult });
    const allValues = mergeObjectsArray(mgetResult
        .map((value, index) => {
        if (!value) {
            return null;
        }
        return { [allKeys[index]]: value };
    })
        .filter(notEmpty));
    return allValues;
};
/** Gets a range of items from redis by first iterating over the keys (in range or all) and then efficiently getting all values */
export const upstashRedisGetMultiple = async (context) => {
    const { redisRestToken, redisRestUrl, keys, baseKey } = context;
    const redis = new Redis({
        url: `https://${redisRestUrl}`,
        token: redisRestToken,
    });
    const realKeys = baseKey ? keys.map((k) => `${baseKey}${k}`) : keys;
    const mgetResult = (await redis.mget(...realKeys));
    return mgetResult;
};
export const deleteUpstashRedisDatabases = async (context) => {
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
    const databasesToDelete = listResult.result?.filter?.((db) => db.database_name !== excludeDatabaseName);
    console.log({
        databasesToDelete: databasesToDelete.map((x) => x.database_name),
    });
    const deletedDatabases = [];
    const errors = {};
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
            }
            else {
                const errorText = await response.text();
                errors[db.database_id] = `Failed to delete: ${errorText}`;
            }
        }
        catch (error) {
            errors[db.database_id] = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
    const isSuccessful = deletedDatabases.length === databasesToDelete.length;
    const message = isSuccessful
        ? `Successfully deleted all databases except '${excludeDatabaseName}'`
        : `Deleted some databases, but encountered errors. Check the 'errors' object for details.`;
    return { isSuccessful, message, deletedDatabases, errors };
};
//# sourceMappingURL=upstashRedis.js.map