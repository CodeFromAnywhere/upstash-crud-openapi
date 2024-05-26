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

# Overview

✅ List the databases (from `localStorage`).

✅ Link to `/{slug}`

✅ On dbpage, show links

# Editing

✅ Render form for `updateDatabase` `data.actionschema.com/[databaseSlug]`

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

Try to use the openapi spec to do stuff in swagger.

# Unauthorized APIs

If `authToken` is left empty, do not put any authToken.

## Own upstash

Confirm it works with a secondary upstash as well.

## Reserved db keys

Ensure keys root and root-db and ones that already existed cannot be picked.

# Agenda OpenAPI in an agent

See if I can make a simple people db and use it in an agent to test it.

Test if dereferencing things before returning the MODEL openapi.json could make it more stable.

Think about different use-cases for LLM

Figure out what would be needed to make this work on a per-user basis, and what would be the best way to make that scale, assuming users don't need each other but the scheme is the same.

## Data exploration

On database-page, add a link to `explorer.actionschema.com/{openapi}` and confirm it works.

In explorer, add button to fill your own URL.

Add ability to prefil fields in explorer with query parameters and ensure that gets cached into localStorage, and do this with the `authToken`

Ideally, from explorer I can get all rows with 1 click of a button.

# After that works...

Ensure EnhancementProxy, CombinationProxy, and AgentOpenapi datstructures are available in `public`.

Confirm we can use data.actionschema.com with `$ref` to an external url like the above.

Use data.actionschema.com to create CRUD openapis to keep a global state for:

- EnhancementProxy: https://openapi.actionschema.com/[proxySlug]/openapi.json
- CombinationProxy: https://proxy.actionschema.com/[proxySlug]/openapi.json
- AgentOpenapi: https://agent.actionschema.com/[agentSlug]/openapi.json

Now I can make those and add those endpoints into my own openapi there via the new `x-proxy` standard.

Now I can also use forms in explorer. It'd be perfect to test things a little.

Now I can also use forms in all of the above.
