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

## Create/update database form

Make a function `getFormSchema(openapi,path,method)` combines schemas from parameters and body - and turns it into a single schema.

Render a form at `app/page.tsx` to submit `createOrUpdateDatabase`.

Confirm the root-db gets the details, and the child-db gets the db itself.

After form-submission - keep a `localStorage` with the `databaseSlug, adminToken, authToken, schemaString` so from `data.actionschema.com` all your databases can be listed.

Render form at `data.actionschema.com/[databaseSlug]` as well incase adminToken exists in localStorage. Prefil forms with localStorage-values

List the databases + auth with links to the openapi, swagger, and edit (from localStorage).

## openapi.json generation

Improve `renderCrudOpenapi` openapi.json to be more specific and include auth if needed.

Deploy.

Confirm I can create a database on my own upstash and use the openapi spec to do stuff in swagger.

Confirm it works with a secondary upstash as well.

# After that works...

Use data.actionschema.com to create CRUD openapis to keep a global state for:

- EnhancementProxy: https://openapi.actionschema.com/[proxySlug]/openapi.json
- CombinationProxy: https://proxy.actionschema.com/[proxySlug]/openapi.json
- AgentOpenapi: https://agent.actionschema.com/[agentSlug]/openapi.json

Now I can make those and add those endpoints into my own openapi there via the new `x-proxy` standard.
