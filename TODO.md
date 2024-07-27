# Feature rate limits

Apply `ADMIN_MAX_DB_COUNT` in `upsertDatabase`

Apply `ADMIN_MAX_DB_SIZE` in `update` and `create`

Apply `ADMIN_MAX_REQUESTS_PER_HOUR` in all CRUD operations.

# Small improvements

Apply all needed transformations in `/{databaseSlug}/openapi.json` as well (especially removing required from partialItem)

Fix `/update` so it can actually find the schema again, and have a little bit of validation in create and update.

Remove ambiguity with vectors and search, and get a simpler `read` api.
