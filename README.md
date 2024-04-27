# OpenCRUD

Serverless Redis CRUD Server that generates OpenAPI

# Goals

- Easy creation of authenticated, scalable CRUD Server with a realtime database (without coding)
- Perfect model-specific OpenAPI specification
- Ability for user to bring their own Redis, or clone the repo and change anything.

# Non-goals

- 🔥 For now, forget ActionSchema and focus on a JSON-Schema CRUD. Having an ability to quickly create this is very useful.

- ❗️ Having users with ratelimits or stuff like that is not the goal! This is just a demo and intention is for it to be used via a clone with your own db behind it.

# TODO

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

Render a form at `app/page.tsx` to submit `createOrUpdateDatabase`.

Make this CRUD for `{proxy,openapi}` with token `adminToken`

# Ideas

- Use the default Vercel upstash if that has a good free plan and can be easily set up.
