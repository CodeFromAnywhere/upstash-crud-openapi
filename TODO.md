# Small but important

✅ Improve `/{databaseSlug}/openapi.json` so it also replace ModelItem properly **seems already fine!**

✅ Improve `/project/{slug}/openapi.json` so it has proper schema references, and operationIds for the duplicated operations!

✅ Ensure at the `/update` endpoint "required" is removed from the type interface of each property (if it's an object).

# Improved Auth client creation

✅ Make `auth:upsertClient` simpler so it doesn't need clientId (Autogen it) and it has some examples in the schema definition so we know how to create one for github auth, for example.

✅ As a non-admin, I should be able to make a functioning client. For this `upsertClient-->client` needs to be indexed so it can easily be found.

# Improved GPTs

Give `ActionSchema Data` better instructions:

- Add `auth:upsertClient` action with proper oauth2
- new conversations, ensure to check current project, and select a project first
- make it easy for people to try a project or model by linking to the reference + api key of it at every step.
- add action suggestions at every step: among other things, creating a client
- ensure it knows what it can and can't do.

Give `AcitonSchema Backend` better instructions:

- First force to retrieve db openapi and other (pruned) openapis you want to do something with and instruct to get it first if you haven't got it.
- Ensure it outputs:
  - openapi with proper oauth2 spec
  - the written endpoint in the correct typescript Request/Response style

# Small improvements

Apply all needed transformations in `/{databaseSlug}/openapi.json` as well (especially removing required from partialItem)

Fix `/update` so it can actually find the schema again, and have a little bit of validation in create and update.

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

- Remove ambiguity and make search much more simple.
- Greatly simplify the CRUD API by removing lots of stuff and use some sort of hybrid search.
