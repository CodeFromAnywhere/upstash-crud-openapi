# Deployment and production-readiness

✅ OAuth2 needs CRUD-OpenAPI and CRUD-OpenAPI needs OAuth2. Im stuck! Let's make an admin token that always works in `.env` and deploy this.

Test creating a database via https://data.actionschema.com/reference.html and confirm the creation works as expected, as well as projects, and CRUD. Verify each time within upstash.

Recreate DBs for agents and for auth and confirm this works smoothly.

Apply `ADMIN_MAX_DB_COUNT` in `upsertDatabase`

Apply `ADMIN_MAX_DB_SIZE` in `update` and `create`

Apply `ADMIN_MAX_REQUESTS_PER_HOUR` in all CRUD operations.

Ensure `/project/{slug}/openapi.json` has proper schema references!

# POC: Landing Pages

Give CRUDDY the instructions to make it easy for people to try a project or model by linking to the reference of it.

Now we can bypass the backend, making it super easy to serve an MVP! And I don't see why this would be insecure! Afterwards, we can use a CLI to go from openapi + problem/solution ==> sitemap.xml with description ==> html.

After that works, replace the current agent.actionschema.com with admin.html becoming index.html and remake it.

Do the same for data.actionschema.com

Do the same for actionschema.com but only after entering `search.html`. Ensure to use `redirectUrl` feature here.

Document this all in some docs

Before login, make scopes easy to set from the frontpage

Ensure scopes are properly passed and stored, and it all works for multiple providers.

# OAuth

Make a new HTML by applying `website.yaml`.

- Alter it so it logs in with github first, then renders projects and models, linking to `project.html?id=`, `model.html?id=` as well as the respective references. Take baseUrl from `window.location.origin`.
- Ensure it applies scope `user:read` by default (where to apply this default?)
- Ensure it's very easy to create a client for a new `website.yaml`. Maybe via `actionschema.json`? Or is the client in this case simply the crud client? Then it are also my users... How to go about this?

# Demos

Make a Video in which I create a simple to-do app with ActionSchema Data and Claude.

Plan demos to demonstrate the ActionSchema data plugin:

- Demo to Maarten/Milan
- Demo to some devs
- Demo to Nexler
- Demo to Upstash
- Demo to Krijn
