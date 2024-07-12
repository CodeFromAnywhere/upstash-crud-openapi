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
- ✅ Also expose the `index.html` at `GET /[databaseSlug]` by using `fs` to import it. It should allow to test any slug.
- Also expose GET `/slug/schema.json`
- `crud-openapi` ==> make a list endpoint `list(admintoken) ==> mylist[]`
- Regenerate CRUDs for agents as I did before using the migrate CLI, and confirm that I can test the CRUD's easily using the elements.
- Test CRUD and confirm it works well with authentication and all.
- Ensure this can somehow be verified when migrating to prevent this in the future. After CRUD works, make agent. After agent works, make message work via proxy.
- After https://data.actionschema.com/openapi.json validates properly, let's make an agent for it.
- Use claude to make a HTML where you can first set the admintoken, stored at localstorage, then retrieves list and makes you read for each model with ease, rendering it in some sort of table. Don't waste too much time though. A standalone react would also be nice.

🎉 Fully refactored this from a next.js to a bare vercel project, being aware that this changes the capabilities. We can now not use react easily anymore, but this is ok since the base is the openapi, and it serves stoplight at the index.

## Refactor agent-openapi

Agent-openapi ==> make a list endpoint `list(admintoken) ==> mylist[]` which should simply proxy to the `read` endpoint for the crud

Follow same practices so i can message all agents from here

## OpenAPI overview

Look at `getOperations` and `resolveReferenceOrContinue` and finish it or remove it altogether if not needed. Ensure it never throws unexpectedly.

Ensure EnhancementProxy, CombinationProxy, and AgentOpenapi datstructures are available in `public`.

Confirm we can use data.actionschema.com with `$ref` to an external url like the above.

Use data.actionschema.com to create CRUD openapis to keep a global state for:

- EnhancementProxy: https://openapi.actionschema.com/[proxySlug]/openapi.json
- CombinationProxy: https://proxy.actionschema.com/[proxySlug]/openapi.json

In explorer, make a frontpage in which you can CRD openapi URLs. Start by adding my own...

For `https://data.actionschema.com/openapi.json`: Error: Value isn't defined [0] at resolveReferenceOrContinue

Ensure to also link to swagger to get proper validations from there.

# Combination proxy

I really need it? Or would support for using 2 openapis and using a queryparameter on it to prune suffice?

# 🔴 User Separation

Agent-openapi and CRUD-openapi user oAuth

Figure out how to do Key Ranges or other way to efficiently index/separate on keys

Figure out how to do oAuth properly so users can login when using the GPT

Make a POC in the oAI GPT builder where the user logs in with oAuth, then it keeps track of a calendar-db for each user.

# 🔴 Threads

Create CRUD for messages

Use the client for that to store messages for the thread. Ensure we use something like `X-USER-AUTH` or so for determining the user.

- For whatsapp, load in the thread of the phone number
- For phonecall, load in the thread for the phone number
- For email, load in the thread for the email

# 🔴 Files

Now we are relying on gpt4 to process just the images which is useful as it is much more integrated and will be in the future, but what about processing of all kinds of stuff? An AI can do this in many ways and that is why we need cool tools.

Let's do it like this:

- provide `attachmentUrls` as text in an additional message, but provide some additional context for each file
- tools provided can use these URLs & context as parameters.

This way we can make our own multimodal LLM with extra functionalities that depend on the usecase. This keeps the model super general purpose.

A good start would be to create an agent that allows for image generation, speech generation, and speech analsysis. Perfect for whatsapp!

# Improvements

- Ensure at the `/update` endpoint "required" is removed from the type interface.
- Greatly simplify the CRUD API by removing lots of stuff and use some sort of hybrid search. Remove ambiguity and make search much more simple

# MORE COOL STUFF

🔴 CRUD to keep and reveal user info + Agent
🔴 Conventional Agent to make CRUD agent more reliable
🔴 API for twilio to connect to another websocket or phonenumber
🔴 Phone number that I can call to make a new agent for any datastructure. It can make the agent, then redirect me to it.
🔴 CRUD cron-sync capability (e.g. with drive, calendar)

The above is basically a Voice Excelsheet. This would be insanely useful.

# Different LLMs

https://sdk.vercel.ai/providers/ai-sdk-providers#provider-support

https://x.com/transitive_bs <-- get feedback, integrate with his stuff maybe?

Read here. These providers should all have an Open API. I should be able to merge them into a single endpoint with some AI that maps it, given very specific instructions. I should be able to have a single gateway in which the openapi url, action, and parameters are provided, in which the map is cached. This would be super epic, as it allows people to provide their own openapi URL without changing the script.

# Sendgrid client

Same trick, same worker.

# Relative references

Schemas and openapis should have ability to cross reference local relative files. This should be able to be resolved in all tools, both locally and in production, buth on backend and frontend.

This will help to remove code duplication in schemas that is becoming an increasingly big problem now.
