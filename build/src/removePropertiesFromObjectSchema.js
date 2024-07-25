import { removeOptionalKeysFromObjectStrings } from "from-anywhere";
/** Removes one or more properties from an object json schema */
export const removePropertiesFromObjectSchema = (schema, propertyKeys) => {
    return {
        ...schema,
        properties: schema.properties
            ? removeOptionalKeysFromObjectStrings(schema.properties, propertyKeys)
            : undefined,
        required: schema.required?.filter((key) => !propertyKeys.includes(key)),
    };
};
//# sourceMappingURL=removePropertiesFromObjectSchema.js.map