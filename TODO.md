# TODO

## User or group separation header

Try oauth security mechanism with the minimal way to make new admins login

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
