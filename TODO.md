# TODO

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
- Test `agent-openapi/src/sdk/client.ts` via `client.test.ts`, ensuring it works.
- Deploy
- Try oauth security mechanism with the minimal way to make new admins login...

## User or group separation header

Agent-OpenAPI and CRUD-OpenAPI user oAuth

Also admin oauth for root openapi

Figure out how to do Key Ranges or other way to efficiently index/separate on keys (maybe 1 db per user)

Figure out how to do oAuth properly so users can login when using the GPT

Make a POC in the oAI GPT builder where the user logs in with oAuth, then it keeps track of a calendar-db for each user.

## Ratelimit

After there's oauth, add a ratelimit for every admin and every user of every crud.

## Improvements

- Ensure at the `/update` endpoint "required" is removed from the type interface of each property (if it's an object).
- Remove ambiguity and make search much more simple.
- Greatly simplify the CRUD API by removing lots of stuff and use some sort of hybrid search.

## Relative references

Schemas and openapis should have ability to cross reference local relative files. This should be able to be resolved in all tools, both locally and in production, both on backend and frontend.

This will help to remove code duplication in schemas that is becoming an increasingly big problem now.
