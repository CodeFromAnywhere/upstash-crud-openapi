import { rootDatabaseName } from "./state.js";
import { createUpstashRedisDatabase, listUpstashRedisDatabases, } from "./upstashRedis";
import { writeFileSync } from "fs";
const makeRootDb = async () => {
    const rootUpstashApiKey = process.env["X_UPSTASH_API_KEY"];
    const rootUpstashEmail = process.env["X_UPSTASH_EMAIL"];
    if (!rootUpstashApiKey || !rootUpstashEmail) {
        return {
            isSuccessful: false,
            message: "Please provide upstash credentials in your environment variables",
        };
    }
    const dbs = await listUpstashRedisDatabases({
        upstashApiKey: rootUpstashApiKey,
        upstashEmail: rootUpstashEmail,
    });
    // list dbs and find databaseId and "root".
    if (!dbs.result) {
        return { isSuccessful: false, message: "Invalid upstash root credentials" };
    }
    let rootDb = dbs.result.find((x) => x.database_name === rootDatabaseName);
    if (!rootDb) {
        //if not available, make "root"
        const created = await createUpstashRedisDatabase({
            upstashApiKey: rootUpstashApiKey,
            upstashEmail: rootUpstashEmail,
            name: rootDatabaseName,
        });
        rootDb = created.result;
    }
    if (!rootDb) {
        return { isSuccessful: false, message: "Couldn't create root database." };
    }
    const envString = `X_UPSTASH_EMAIL=${rootUpstashEmail}
X_UPSTASH_API_KEY=${rootUpstashApiKey}
X_UPSTASH_ROOT_DATABASE_ID=${rootDb.database_id}
X_UPSTASH_ENDPOINT=${rootDb.endpoint}
X_UPSTASH_REST_TOKEN=${rootDb.rest_token}`;
    writeFileSync(".env.local", envString, "utf8");
    return {
        isSuccessful: true,
        message: "Root db created and written to .env.local. Please fill these details in production too.",
    };
};
makeRootDb().then(console.log);
//# sourceMappingURL=makeRootDb.cli.js.map