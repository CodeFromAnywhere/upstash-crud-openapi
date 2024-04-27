# OpenCRUD

# TODO

🔥 For now, forget ActionSchema and focus on a JSON-Schema CRUD. Having an ability to quickly create this is very useful. If we can somehow add an optional user-auth layer that will create separated stores, even better.

✅ Take `actionschema-core/crude` and where it defines the openapi, and implement something similar but without execution

✅ Refactor kvRead

✅ Refactor kvCreate

✅ Refactor kvDelete

✅ Refactor kvUpdate

✅ Put all in next.js project (copy from one with same routing)

✅ Put all schemas into an openapi JSON and make the types

In `resolveOpenapiAppRequest` - fix resolving the parameters in path, cookie, header, and query, and ensure they are provided as context of the function as well.

🟠 Render whatever comes back from `renderCrudOpenapi` at `data.actionschema.com/[databaseId]/openapi.json`

🟠 Make function `createOrUpdateDatabase`: takes in a JSON-Schema string of a single item, and stores that with an authToken and [databaseId]

Allow people to clone with ease and set upstash info in `.env`. Potentially use the default Vercel upstash if that has a good free plan and can be easily set up.

Make this CRUD for `{proxy,openapi}` with token `adminToken`

❗️ Having users with ratelimits or stuff like that is not the goal! This is just a demo and intention is for it to be used via a clone with your own db behind it.
