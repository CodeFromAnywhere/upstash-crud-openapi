Make this CRUD website:

index.html: login, set the admin-token with prompt, stored at localstorage, then retrieves list via listDatabases, set that to localStorage too. Then from there, it links each database to model.html?databaseSlug={slug}

model.html uses ?databaseSlug=xxx and the authToken from localStorage, and calls `/read` and `/getSchema` when loading, showing the results in a table. Every property in the schema from `/getSchema` is a column in the table. Each row has a button linking to `update.html?databaseSlug={slug}&rowId={id}`. There should be a `New item` button that goes to `update.html?databaseSlug=[slug]` above the table.

`update.html` uses `?databaseSlug={slug}&rowId={id}` and the `authToken` and retreives the item using `/read`, showing the JSON value in a <textarea>. Submitting the JSON will call `/update` for that `rowId`. If there's no rowId given, generate a random `rowId` of 16 characters when submitting.

The OpenAPI to base this on:
