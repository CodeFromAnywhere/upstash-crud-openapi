# April 2024

## Initial Setup of the server with Upstash backends

✅ Take `actionschema-core/crude` and where it defines the openapi, and implement something similar but without execution

✅ Refactor kvRead

✅ Refactor kvCreate

✅ Refactor kvDelete

✅ Refactor kvUpdate

✅ Put all in next.js project (copy from one with same routing)

✅ Put all schemas into an openapi JSON and make the types

✅ Make openapi router that matches on {} variables

✅ In `resolveOpenapiAppRequest` - fix resolving the parameters in path, cookie, header, and query, and ensure they are provided as context of the function as well.

✅ Render whatever comes back from `renderCrudOpenapi` at `data.actionschema.com/[databaseId]/openapi.json`

✅ Make function `createOrUpdateDatabase`: takes in a JSON-Schema string of a single item, and stores that with an authToken and [databaseId].

✅ Add random `authToken` generated for each crud we make, so users can access their creations without needing the admin token being required in the headers for those endpoints.

✅ Alter `createOrUpdateDatabase` so it will use a global root-db (using .env db, never from headers)

✅ Add admin auth token requirement

✅ Alter `create` so it maps the slug to a databaseId and credentials.

✅ Update all endpoints with the right map and auth

# May 2024

## Create/update Database Form

✅ Render a form at `opencrud/app/page.tsx` to submit `createDatabase`.

✅ Refactor; install `react-openapi-form` in `opencrud`

✅ Add proper `description`s in `openapi.json#paths/createDatabase`

✅ Submit `createDatabase` and confirm it works, db gets created in upstash

✅ Confirm the root-db gets the details, and the child-db gets the db itself (check it in upstash).

✅ After form-submission - keep a `localStorage` with the `databaseSlug, adminToken, authToken, schemaString` so from `data.actionschema.com` all your databases can be listed.

## Overview

✅ List the databases (from `localStorage`).

✅ Link to `/{slug}`

✅ On dbpage, show links

## Editing

✅ Render form for `updateDatabase` `data.actionschema.com`

✅ Prefil form with localStorage-values.

✅ Make new function `updateDatabase` that simplifies `createDatabase`

✅ Only render form incase adminToken exists in localStorage.

✅ Hide admintoken field but still submit. (ui:)

✅ Test updating and confirm it works.

## openapi.json generation

✅ Improve `renderCrudOpenapi` openapi.json to respond nicely

✅ Make openapi returned the pruned version: crud only

✅ Deploy everything so it works remotely.

✅ Adapt CRUD operations to refer to `$ref:ModelItem`

✅ Ensure `ModelItem` is replaced with the actual model item.

✅ Ensure databaseSlug isn't required in the body (it's a parameter).

✅ Try to use the openapi spec to do stuff in swagger.

## More Requirements

Test the entire app and also ensure the below requirements get built in.

- ✅ Fix options request so it works from swagger-ui 🎉
- ❌ If `authToken` is left empty, do not put any authToken.
- ✅ Fix problem with incorrect naming with a validation both frontend and backend.
- ✅ Confirm it works with a secondary upstash as well.
- ✅ Redirect to new db after it gets created. Also better error handing
- ✅ Ensure keys root and root-db and ones that already existed cannot be picked.
- ✅ See if I can make a simple people db and use it in an agent to test it. Test if dereferencing things before returning the MODEL openapi.json did make it more stable/easier.

https://chatgpt.com/share/3a11c4f6-0637-4e31-83e9-e74d7e6733bd

🎉 Works incredibly well!

## Vector Embedding Search Integration into any CRUD

- ✅ Created a simple integration with upstash vector store and openai embedding models
- ✅ In `createDatabase`, specify needed columns, and ensure to call `createIndex` for needed columns
- ✅ In `create` and `update`, ensure to call `submitVectorFromString` for needed columns. NB: If we'd had actionschema, this wouldn't have needed to be changed except for them activating the actionschema maybe
- ✅ In `remove`, ensure to call `deleteVector` for needed columns. NB: If we had actionschema.x-unmountOperationId, an unmount property could be set.
- ✅ In `read` add an array of `search(input,topK)` and `minimumSimilarity?` parameters and retreive only the ones from `search`, then still do other filters.

# July 2024

## Refactor CRUD-openapi

- ✅ Create `crud-openapi2` which is a bare vercel project.
- ✅ Add `index.html` elements file which exposes the openapi as an HTML frontend. Super cool!
- ✅ Improve `tsconfig.json` so `../public/openapi.json` can be imported without error. If not possible, use `fs` and ensure the file is present.
- ✅ Refactor `vercel.json` so it directs to `index.ts` for all routes.
- ✅ Fix imports and other problems that arised
- ✅ Confirm that everything works as expected!
- ✅ Also expose the `index.html` at `GET ` by using `fs` to import it. It should allow to test any slug.
- ✅ Also expose GET `/slug/schema.json`
- ✅ Create new endpoint `listDatabases`
- ✅ When creating/updating a CRUD DB, ensure to save it in another KV where the key is the admin authToken, the value all db slugs so far.
- ✅ Make a `listDatabases` endpoint `listDatabases(admintoken) ==> mylist[]`

🎉 Fully refactored this from a next.js to a bare vercel project, being aware that this changes the capabilities. We can now not use react easily anymore, but this is ok since the base is the openapi, and it serves stoplight at the index.

## Improve actionschema migrate

- ✅ Function `openapiCombinationToSdkConfig`
- ✅ Make two agents in JSON files
- ✅ Get the `/agent/message` endpoints into the openapi as well `api/messageXyzAgent.ts` POST endpoint for now, that simply forwards it
- ✅ Bun segfault. Fix `runMigration` in a way that it works using `npx` instead.
- ✅ Make it search `public/actionschema.json` as well

## FE Generation

- ✅ Made a fantastic POC that allows one to browse their own DBs via a html website
- ✅ Came up with `website.yaml` data format for making frontends

## CRUDDY GPT (July 13th)

❗️❗️❗️ Finish until it fully works again. things are broken now ❗️❗️❗️

https://data.actionschema.com/openapi.json GPT? good to have compatibility

- ✅ Removed unsupported 'parameters' from CRUD openapi and added global auth header
- ✅ Add props from `securityScheme` to `Endpoint` type and pass it correctly
- ✅ Remove the `databaseSlug` body-parameter from the `renderCrudOpenapi` response

> I just refactored the whole openapi spec removing parameters because it doesn't work very well with GPTs and maybe others too. But now things at `/{slug}/read` and others don't arrive in the right place so we need to add them as duplicate operation to the openapi. This is also better because it adds transparancy as the spec really is so.

- ✅ Added a property to the resolve so it can handle the prefix, and also match it.
- ✅ Test CRUDDY via GPT
- ✅ Test the crud itself via 'admintoken' as well as via the crud token and confirm it works with the prefix thingy as well as via the regular path.
- ✅ Deploy
- ✅ Test `agent-openapi/src/sdk/client.ts` via `client.test.ts`, ensuring it works. **Fixed some bugs. Now works!**

## CRUDDY OAUTH2 (july 22nd)

✅ Add oauth to cruddy, so it requires admin login.

✅ Confirm it finds your admin auth based on the github login.

## Performance (july 23rd)

✅ Read bug: it does hundreds of this: `0!==17837860735467677114`. Also it's slow and there are some other warnings.

✅ In `read`, make a direct keys mget that doesn't use range incase of specified rowIds.

✅ Test if it's fast now. **It is! Lots better**

✅ Try to see why the DB endpoints are so slow, lets log timing for calling the client endpoints. Can it be made faster somehow? **Yes. I've added a count = 1000 to the `range` searcher (scan) and this seems to help!**

## OAuth2 verification in CRUD Openapi (july 23rd)

✅ Added `isTrustedOauthLink` to oauth-provider

If I'm not logged in and I log in with a trusted provider, it should find the oauth-admin that has logged in with it before. For this we need to map service-id combos (e.g. github:CodeFromAnywhere) to an admin authToken.

- ✅ Create index `oauth-linked-accounts.json` mapping `service:userId` to an admin token
- ✅ Add an index `oauth-permission.json` mapping `authToken` to `adminAuthToken` so every `authToken` can be used, fast.
- ✅ Recreate client and fix

Every permission given to actionschema:

- ✅ If trusted provider, must get userId, find or create `oauth-linked-account`
- ✅ If it found a linked account but you already had another account with other logins, this is problematic. We should handle this scenario well.
- ✅ Must become an item in `oauthAdmin.permissions` with scopes.
- ✅ Must become `oauth-permission` kv-map

✅ Add endpoint `/authenticate(adminAuth, authToken)` that checks the permissioned authToken, and responds with the permission item or a 403 (for now entire me item)

## User or group separation header (July 25th)

✅ Confirm oauth works in the GPT so it gets logged in into ActionSchema.

✅ Add `isUserLevelSeparationEnabled` property to db details

✅ Alter the crud openapi and project openapi so they have the oauth2 scheme.

✅ Figure out how to do Key Ranges or other way to efficiently index/separate on keys

## Auth Refactor (July 25th)

✅ Refactor `getOpenapi, getCrudOpenapi, getProjectOpenapi` to add auth2 flows but also keep secondary options available.

✅ For all CRUD endpoints, use permission endpoint of `auth` to authenticate with `admin + user` scope.

✅ For all admin endpoints, use permission endpoint of `auth` to authenticate with `admin` scope.

✅ Ensure admin can only manage their own projects.

## Projects Refactor (July 25th)

✅ Backup important data: especially oauth-admin info

✅ Alter `getProjectOpenapi` to include all models for the project

✅ Fix other problematic errors in files.

✅ Upstash limits max databases to 100. Therefore, create option `USE_ROOT_DATABASE` to not create a database in `.env`

✅ Fit all databases in a single database by changing the key value structure.

✅ Find row(s): If `isUserLevelSeparationEnabled` then `db_{databaseSlug}_{auth}_{id}` else `db_{databaseSlug}_{auth}_{id}`

✅ Db selection: If `USE_ROOT_DATABASE`: use `root`, otherwise use `{databaseSlug}`

✅ Apply `USE_ROOT_DATABSE` everywhere where needed.

✅ Remake all admin-endpoints to support projects according to new kv-store idea.

✅ Add `ADMIN_MAX_*` on db-size and admin-db-count, that are sensible to the bottlenecks of upstash.

✅ Remove all DBs except the root one, using a simple one-time query.

✅ Deployed openapi-util/migrate and finally crud-openapi

## Deployment and production-readiness (July 25th)

✅ OAuth2 needs CRUD-OpenAPI and CRUD-OpenAPI needs OAuth2. Im stuck! Let's make an admin token that always works in `.env` and deploy this.

✅ Test creating a database via https://data.actionschema.com/reference.html and confirm the creation works as expected, as well as projects, and CRUD.

✅ Recreate DBs for agents and for auth and also deploy the keys.

✅ `"message": "Invalid method."`. Fix that I can crud at: https://data.actionschema.com/actionschema-oauth-state/reference.html#/operations/read . The endpoints aren't accessible now due to the resolver.

✅ Test all CRUD operations for the above. Verify each time within upstash.

✅ Now add the admin oauth values as previously under the same Auth

✅ Fixed authToken bug and other keys in `upsertDatabase`. Ran migration again.

✅ 🤔 Test auth locally and figure out why `permission` endpoint isn't authorized. Why does it try to authorize with `permission` in the first place? It doesn't use the adminAuthToken from the DB since it has stuff stored directly without being an admin in `auth`. That's not an issue for me... So let's remove `getAdminAuthorized` for now when it's not REALLY needed.

✅ Fixed some crucial bugs in redis: mget empty set, and improper setting of keys to wrong values

✅ Now test all https://data.actionschema.com/reference.html endpoints and confirm it works there without crashes.

🎉 Confirm crud works again
