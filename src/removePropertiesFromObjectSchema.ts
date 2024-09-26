import { removeOptionalKeysFromObjectStrings } from "edge-util";
import { JSONSchema7 } from "json-schema";

/** Removes one or more properties from an object json schema */
export const removePropertiesFromObjectSchema = (
  schema: JSONSchema7,
  propertyKeys: string[],
) => {
  return {
    ...schema,
    properties: schema.properties
      ? removeOptionalKeysFromObjectStrings(schema.properties, propertyKeys)
      : undefined,
    required: schema.required?.filter((key) => !propertyKeys.includes(key)),
  };
};
