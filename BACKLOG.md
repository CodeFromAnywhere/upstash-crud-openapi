# Read-only option

Dbs with `isUserLevelSeparationEnabled:true` are fine now as they're fully separated. But if this is not the case, should any user be able to alter any database? Maybe an additional read-only option would be great

## Improvements

- Ensure at the `/update` endpoint "required" is removed from the type interface of each property (if it's an object).
- Remove ambiguity and make search much more simple.
- Greatly simplify the CRUD API by removing lots of stuff and use some sort of hybrid search.

## Relative references

Schemas and openapis should have ability to cross reference local relative files. This should be able to be resolved in all tools, both locally and in production, both on backend and frontend.

This will help to remove code duplication in schemas that is becoming an increasingly big problem now.
