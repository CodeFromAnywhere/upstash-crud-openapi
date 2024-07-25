# User or group separation header

✅ Confirm oauth works in the GPT so it gets logged in into ActionSchema.

✅ Add `isUserLevelSeparationEnabled` property to db details

✅ Alter the crud openapi and project openapi so they have the oauth2 scheme.

✅ Figure out how to do Key Ranges or other way to efficiently index/separate on keys

# Projects Refactor

✅ Backup important data: especially oauth-admin info

✅ Alter `getProjectOpenapi` to include all models for the project

✅ Fix other problematic errors in files.

✅ Upstash limits max databases to 100. Therefore, create option `USE_ROOT_DATABASE` to not create a database in `.env`

Fit all databases in a single database by changing the key value structure.

- ✅ Find row(s): If `isUserLevelSeparationEnabled` then `db_{databaseSlug}_{auth}_{id}` else `db_{databaseSlug}_{auth}_{id}`
- ✅ Db selection: If `USE_ROOT_DATABASE`: use `root`, otherwise use `{databaseSlug}`

✅ Apply `USE_ROOT_DATABSE` everywhere where needed.

✅ Remake all admin-endpoints to support projects according to new kv-store idea.

✅ Add `ADMIN_MAX_*` on db-size and admin-db-count, that are sensible to the bottlenecks of upstash.

✅ Remove all DBs except the root one, using a simple one-time query.

Recreate dbs for agents and for auth
Apply `ADMIN_MAX_DB_COUNT` in `upsertDatabase`

Apply `ADMIN_MAX_DB_SIZE` in `update` and `create`

Apply `ADMIN_MAX_REQUESTS_PER_HOUR` in all CRUD operations.

# Auth Refactor

✅ Refactor `getOpenapi, getCrudOpenapi, getProjectOpenapi` to add auth2 flows but also keep secondary options available.

✅ For all CRUD endpoints, use permission endpoint of `auth` to authenticate with `admin + user` scope.

🟠 Now a oauth2-user can alter any database, even if it's not user-based. How do this right?

🟠 For all admin endpoints, use permission endpoint of `auth` to authenticate with `admin` scope.

🟠 Ensure admin can only manage their own projects.

# Test / Frontend / GPT

Test CRUD OpenAPI in localhost, and ensure now it's easy to play around with it.

Make a new html by applying `website.yaml`. Alter it so it logs in with github first, then renders projects and models, linking to `project.html?id=`, `model.html?id=` as well as the respective references. Take baseUrl from `window.location.origin`.

Give CRUDDY the instructions to make it easy for people to try a project or model by linking to the reference of it.

Now we can bypass the backend, making it super easy to serve an MVP! And I don't see why this would be insecure! Afterwards, we can use a CLI to go from openapi + problem/solution ==> sitemap.xml with description ==> html.

# POC: Landing Pages

After that works, replace the current agent.actionschema.com with admin.html becoming index.html and remake it.

Do the same for data.actionschema.com

Do the same for actionschema.com but only after entering `search.html`. Ensure to use `redirectUrl` feature here.

Document this all in some docs

Before login, make scopes easy to set from the frontpage

Ensure scopes are properly passed and stored, and it all works for multiple providers.

## Improvements

- Ensure at the `/update` endpoint "required" is removed from the type interface of each property (if it's an object).
- Remove ambiguity and make search much more simple.
- Greatly simplify the CRUD API by removing lots of stuff and use some sort of hybrid search.

# Demos

Plan demos to demonstrate the ActionSchema data plugin:

- Make a Video
- Demo to Maarten/Milan
- Demo to some devs
- Demo to Nexler
- Demo to Upstash
- Demo to Krijn
