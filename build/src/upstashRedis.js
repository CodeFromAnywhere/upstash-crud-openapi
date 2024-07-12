import { mergeObjectsArray, notEmpty, tryParseJson } from "from-anywhere";
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
    while (true) {
        const [newCursor, newKeys] = await redis.scan(cursor, {
            match: baseKey ? `${baseKey}.*` : "*",
        });
        allKeys = allKeys.concat(newKeys);
        console.log({ newCursor });
        if (cursor === newCursor || !newCursor) {
            break;
        }
        cursor = newCursor;
    }
    return allKeys.concat(baseKey || "");
};
export const deleteUpstashRedisRange = async (context) => {
    const { redisRestToken, redisRestUrl, baseKey } = context;
    const keys = await getUpstashRedisRangeKeys(context);
    const redis = new Redis({
        url: `https://${redisRestUrl}`,
        token: redisRestToken,
    });
    const amountRemoved = await redis.del(...keys);
    return amountRemoved;
};
export const upstashRedisSetItems = async (context) => {
    const { redisRestToken, redisRestUrl, items } = context;
    const redis = new Redis({
        url: `https://${redisRestUrl}`,
        token: redisRestToken,
    });
    const result = await redis.mset(items);
    return result;
};
/** Gets a range of items from redis by first iterating over the keys (in range or all) and then efficiently getting all values */
export const upstashRedisGetRange = async (context) => {
    const { redisRestToken, redisRestUrl } = context;
    const redis = new Redis({
        url: `https://${redisRestUrl}`,
        token: redisRestToken,
    });
    const allKeys = await getUpstashRedisRangeKeys(context);
    console.log({ allKeys });
    if (allKeys.length === 0) {
        return;
    }
    const mgetResult = (await redis.mget(...allKeys));
    console.log({ mgetResult });
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
//# sourceMappingURL=upstashRedis.js.map