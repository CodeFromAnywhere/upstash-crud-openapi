🚫 BLOCKED 🚫 make oauth for admin, logging in with github via ChatGPT

## CRUDDY OAUTH2

✅ Add oauth to cruddy, so it requires admin login.

✅ Confirm it finds your admin auth based on the github login.

## Performance

✅ In `read`, make a direct keys mget that doesn't use range incase of specified rowIds.

✅ Test if it's fast now. **It is! Lots better**

Try to see why the DB endpoints are so slow, lets log timing for calling the client endpoints. Can it be made faster somehow?

## Reduce DB requirement

We have a limit of # of databases per user. Therefore, let's try to fit all databases in a single database by changing the key value structure. `db_{slug}_{key}` should contain a row of db {slug}

- Figure out how the range works so I can get all items in a certain db, but nothing else
- Change it everywhere so dbs don't need to be created but use the root-db with `db_{slug}_` prefix
- Remove all dbs except the root one, using a simple query
- Add limits on db-size and admin-db-count, that are sensible to the bottlenecks of upstash

## User or group separation header

Confirm oauth works in the GPT so it gets logged in into ActionSchema.

Try oauth security mechanism with the minimal way to make new admins login

Agent-OpenAPI and CRUD-OpenAPI user oAuth

Also admin oauth for root openapi

Figure out how to do Key Ranges or other way to efficiently index/separate on keys (maybe 1 db per user)

Figure out how to do oAuth properly so users can login when using the GPT

Make a POC in the oAI GPT builder where the user logs in with oAuth, then it keeps track of a calendar-db for each user.

# CRUDDY IDEA:

1. remake all endpoints to support projects according to new kv-store idea
2. serve entire openapi spec with user-based oauth2 at https://data.actionschema.com/project/{slug}/openapi.json
3. make CRUDDY communicate this clearly

Now we can bypass the backend, making it super easy to serve an MVP! And I don't see why this would be insecure! Afterwards, we can use a CLI to go from openapi + problem/solution ==> sitemap.xml with description ==> html.

# Bugs

Read bug: it does hundreds of this: `0!==17837860735467677114`. Also it's slow and there are some other warnings.

Test both agents here and improve until they're good.

Draw out idea --> endpoint once more for homepage and see what else I need in `/message`.

# `website.yaml`

- ✅ Iterate on `website.yaml` source (in english)
- Make JSON Schema for `website.yaml` and host it on dui.actionschema.com/website.schema.json
- Make a CLI that looks into `website.yaml` or `public/website.yaml` and runs the claude3.5 prompt for all each file provided as param (or all if '.') and stores the result in the file in public.
- Ensure it uses public/openapi.json or http://localhost:3000/openapi.json if not there and uses `pruneOpenapi` for context.
- 🎉 Now I have an easy way to update my frontend after I change the backend

# Chain

- run `npx summarize-folder .`
- prune-prompt.md -> prune_result.yaml
- getFileHierarchyContent(prune_result.yaml) -> prune_content.yaml
- code-prompt.md -> changes_content.yaml
- writeFileHierarchyContent(changes_content.yaml)
- See diff!

TODO:

- Make cli `npx writeprompt [promptpath] [outputpath]` that has relative filepaths and other variables as context in `{}` to create the full prompt, executes `llm.actionschema.com/claude/completion`, and writes the resulting last codeblock to the file.
- Make cli `npx executeapi operationId [inputglob] [outputfile]` that logs in into actionschema and then has all apis and envs in one
- After making the other stuff also CLIs I should be able to chain it using `&&`
- This is a great ux I can probably borrow and insert my api into: https://github.com/saoudrizwan/claude-dev
- If this can be done on a public repo for any issue, we can test it!!!! It can also be hidden and served as API this way. Don't deploy this publicly, private vercel project should do the trick and we can then serve it as `npx aiswe "paste your ticket"` and it would literally just do everything remotely and write to your fs afterwards.

## Ratelimit

After there's oauth, add a ratelimit for every admin and every user of every crud.

## Improvements

- Ensure at the `/update` endpoint "required" is removed from the type interface of each property (if it's an object).
- Remove ambiguity and make search much more simple.
- Greatly simplify the CRUD API by removing lots of stuff and use some sort of hybrid search.

## Relative references

Schemas and openapis should have ability to cross reference local relative files. This should be able to be resolved in all tools, both locally and in production, both on backend and frontend.

This will help to remove code duplication in schemas that is becoming an increasingly big problem now.
