# Tiny improvements

Improve /slug/openapi.json so it also replace ModelItem properly

Improve `/project/{slug}/openapi.json` so it has proper schema references, and operationIds for the duplicated operations!

Fix the client everywhere so `client.auth("permission")` allows for non-200 status codes without crashing. Can I add this into the type?

# Feature rate limits

Apply `ADMIN_MAX_DB_COUNT` in `upsertDatabase`

Apply `ADMIN_MAX_DB_SIZE` in `update` and `create`

Apply `ADMIN_MAX_REQUESTS_PER_HOUR` in all CRUD operations.
