# Small but important

✅ Improve `/{databaseSlug}/openapi.json` so it also replace ModelItem properly **seems already fine!**

Improve `/project/{slug}/openapi.json` so it has proper schema references, and operationIds for the duplicated operations!

Fix `/update` so it can actually find the schema again, and have a little bit of validation in create and update.

# Better connection to oauth

Make upsertClient simpler so it doesn't need clientId (Autogen it)

For every new project, call upsertClient so it has authorization clientID+secret immediately!

For every new database, call upsertClient so it has authorization clientID+secret immediately!

For listDatabases, respond with clientId/clientSecret.

Give CRUDDY the instructions to make it easy for people to try a project or model by linking to the reference of it.

Now we can bypass the backend, making it super easy to serve an MVP! And I don't see why this would be insecure! Afterwards, we can use a CLI to go from openapi + problem/solution ==> sitemap.xml with description ==> html.

# Demos

Make a Video in which I create a simple to-do app with ActionSchema Data and Claude.

Plan demos to demonstrate the ActionSchema data plugin:

- Demo to Maarten/Milan
- Demo to some devs
- Demo to Nexler
- Demo to Upstash
- Demo to Krijn

# Read-only option

Dbs with `isUserLevelSeparationEnabled:true` are fine now as they're fully separated. But if this is not the case, should any user be able to alter any database? Maybe an additional read-only option would be great

# Feature rate limits

Apply `ADMIN_MAX_DB_COUNT` in `upsertDatabase`

Apply `ADMIN_MAX_DB_SIZE` in `update` and `create`

Apply `ADMIN_MAX_REQUESTS_PER_HOUR` in all CRUD operations.

# Improvements

- Ensure at the `/update` endpoint "required" is removed from the type interface of each property (if it's an object).
- Remove ambiguity and make search much more simple.
- Greatly simplify the CRUD API by removing lots of stuff and use some sort of hybrid search.
