import { rootDatabaseName } from "./state";
import { deleteUpstashRedisDatabases } from "./upstashRedis";
deleteUpstashRedisDatabases({
    upstashEmail: process.env.X_UPSTASH_EMAIL,
    upstashApiKey: process.env.X_UPSTASH_API_KEY,
    excludeDatabaseName: rootDatabaseName,
}).then(console.log);
//# sourceMappingURL=deleteAll.cli.js.map