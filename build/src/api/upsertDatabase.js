import { Redis } from "@upstash/redis";
import { createUpstashRedisDatabase, getUpstashRedisDatabase, } from "../upstashRedis.js";
import { generateRandomString, notEmpty, tryParseJson, } from "from-anywhere";
import { rootDatabaseName } from "../state.js";
import { embeddingsClient } from "../embeddings.js";
export const upsertDatabase = async (context) => {
    const { databaseSlug, schemaString, region, openaiApiKey, vectorIndexColumns, Authorization, } = context;
    const apiKey = Authorization?.slice("Bearer ".length);
    if (!apiKey || apiKey.length < 64) {
        return { isSuccessful: false, message: "Please provide your auth token" };
    }
    // comes from .env
    const useRootDatabase = process.env["USE_ROOT_DATABASE"]
        ? process.env["USE_ROOT_DATABASE"] !== "false"
        : false;
    const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
    const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
    const rootUpstashDatabaseId = process.env["X_UPSTASH_ROOT_DATABASE_ID"];
    if (!rootUpstashApiKey || !rootUpstashEmail || !rootUpstashDatabaseId) {
        return {
            isSuccessful: false,
            message: "Please provide your upstash details environment variables",
        };
    }
    const rootDatabaseDetails = await getUpstashRedisDatabase({
        upstashEmail: rootUpstashEmail,
        databaseId: rootUpstashDatabaseId,
        upstashApiKey: rootUpstashApiKey,
    });
    if (!rootDatabaseDetails) {
        return {
            isSuccessful: false,
            message: "Couldn't get root database details",
        };
    }
    // now we have root-db
    const root = new Redis({
        url: `https://${rootDatabaseDetails.endpoint}`,
        token: rootDatabaseDetails.rest_token,
    });
    let admin = await root.get(`admin_${apiKey}`);
    if (!admin) {
        const newAdmin = {
            currentProjectSlug: generateRandomString(16),
        };
        await root.set(`admin_${apiKey}`, newAdmin);
        admin = newAdmin;
    }
    if (!admin) {
        //should be created by now
        return { isSuccessful: false, message: "Couldn't find user" };
    }
    let previousDatabaseDetails = await root.get(`db_${databaseSlug}`);
    const schema = tryParseJson(schemaString);
    if (!schema) {
        return { isSuccessful: false, message: "Invalid Schema" };
    }
    if (["root", rootDatabaseName].includes(databaseSlug) ||
        (previousDatabaseDetails &&
            !!previousDatabaseDetails.adminAuthToken &&
            previousDatabaseDetails.adminAuthToken !== apiKey)) {
        return {
            isSuccessful: false,
            status: 403,
            message: "A database with this name already exists, and you're not authorized to edit it.",
        };
    }
    let databaseDetails = null;
    if (!previousDatabaseDetails) {
        // creates indexes
        const vectorIndexColumnDetails = vectorIndexColumns && rootUpstashApiKey && rootUpstashEmail
            ? (await Promise.all(vectorIndexColumns.map(async (item) => {
                const index = await embeddingsClient.createIndex({
                    upstashApiKey: rootUpstashApiKey,
                    upstashEmail: rootUpstashEmail,
                    dimension_count: item.dimension_count,
                    region: item.region,
                    similarity_function: item.similarity_function,
                    vectorIndexName: `${databaseSlug}-${item.propertyKey}`,
                });
                if (!index) {
                    return;
                }
                const { propertyKey } = item;
                const { endpoint, token, name } = index;
                return {
                    propertyKey,
                    vectorRestToken: token,
                    vectorRestUrl: `https://${endpoint}`,
                    dimensions: item.dimension_count,
                    model: item.model,
                };
            }))).filter(notEmpty)
            : undefined;
        //create if we couldn't find it before
        let created = {
            result: undefined,
            isSuccessful: true,
            message: "Using root",
        };
        if (!useRootDatabase) {
            created = await createUpstashRedisDatabase({
                upstashApiKey: rootUpstashApiKey,
                upstashEmail: rootUpstashEmail,
                name: `db_${databaseSlug}`,
                region,
            });
            if (!created.result) {
                return {
                    isSuccessful: false,
                    message: `Upstash result failed: ${created.message}`,
                };
            }
        }
        const adminAuthToken = apiKey || generateRandomString(64);
        const realAuthToken = generateRandomString(64);
        databaseDetails = {
            projectSlug: admin.currentProjectSlug,
            openaiApiKey,
            vectorIndexColumnDetails,
            adminAuthToken,
            upstashApiKey: rootUpstashApiKey,
            upstashEmail: rootUpstashEmail,
            authToken: realAuthToken,
            schema,
            // Set the correct DB Details!
            database_id: useRootDatabase
                ? rootDatabaseDetails.database_id
                : created?.result.database_id,
            endpoint: useRootDatabase
                ? rootDatabaseDetails.endpoint
                : created?.result.endpoint,
            rest_token: useRootDatabase
                ? rootDatabaseDetails.rest_token
                : created?.result.rest_token,
        };
        console.log(`creating`, { databaseDetails });
    }
    else {
        databaseDetails = {
            ...previousDatabaseDetails,
            upstashApiKey: rootUpstashApiKey,
            upstashEmail: rootUpstashEmail,
            schema,
        };
    }
    // re-set the database details
    await root.set(`db_${databaseSlug}`, databaseDetails);
    // add database slug to project
    await root.sadd(`project_${admin.currentProjectSlug}`, databaseSlug);
    return {
        isSuccessful: true,
        message: "Database created",
        adminAuthToken: databaseDetails.adminAuthToken,
        databaseSlug,
        openapiUrl: "https://data.actionschema.com/" + databaseSlug + "/openapi.json",
        projectOpenapiUrl: "https://data.actionschema.com/project/" +
            admin.currentProjectSlug +
            "/openapi.json",
    };
};
//# sourceMappingURL=upsertDatabase.js.map