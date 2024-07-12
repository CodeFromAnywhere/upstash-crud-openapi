import { getSubsetFromObject } from "from-anywhere";
import Ajv from "ajv";
// this doesn't include coercion for objects
// see https://ajv.js.org/coercion.html
const ajv = new Ajv({ coerceTypes: true });
export const isSchemaValid = (context) => {
    const { partialItem, partialItemPropertyKeys, validPartialItemPropertyKeys, schema, } = context;
    if (schema.type !== "object" || !schema.properties) {
        return;
    }
    const propertyKeysNotNull = partialItemPropertyKeys.filter((key) => {
        const isValueNotNull = partialItem[key] !== null;
        return isValueNotNull;
    });
    const prunedProperties = getSubsetFromObject(schema.properties, 
    // NB: the ones set to 'null' need not be validated. Null is always allowed as it removes the property. The ones not occuring in the schema need not be validated either as they will be removed beforehand as well.
    validPartialItemPropertyKeys.filter((k) => propertyKeysNotNull.includes(k)));
    const schemaToValidate = {
        type: "object",
        properties: prunedProperties,
    };
    const prunedPartialItem = getSubsetFromObject(partialItem, validPartialItemPropertyKeys);
    try {
        const validateFn = ajv.compile(schemaToValidate);
        const isValid = validateFn(prunedPartialItem);
        if (!isValid) {
            console.log({
                errors: validateFn.errors,
                partialItem,
            });
            return { isSuccessful: false, message: "Invalid input" };
        }
        return { isSuccessful: true, message: "Input valid" };
    }
    catch (e) {
        console.log("ey not valid still updating cus catched", e);
        return { isSuccessful: false, message: "Validation error" };
    }
};
//# sourceMappingURL=isSchemaValid.js.map