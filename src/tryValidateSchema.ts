import Ajv, { JSONSchemaType } from "ajv";

// see https://ajv.js.org/coercion.html
// NB: this doesn't include coercion for objects
const ajv = new Ajv({ coerceTypes: true });

export const tryValidateSchema = (context: {
  schema: JSONSchemaType<any>;
  data: any;
}) => {
  const { schema, data } = context;

  try {
    const validateFn = ajv.compile(schema);
    const isValid = validateFn(data);
    if (!isValid) {
      return validateFn.errors;
    }
    return;
  } catch (e) {
    console.log("ey not valid still updating cus catched", e);
    return;
  }
};
