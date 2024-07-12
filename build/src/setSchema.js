import { tryParseJson } from "from-anywhere";
export const setSchema = async (context) => {
    const { schemaString } = context;
    const schema = tryParseJson(schemaString);
    if (!schema || schema.type !== "object") {
        return { isSuccessful: false, message: "It's not an object JSON Schema" };
    }
    //It takes in a JSON-Schema or URL where a JSON-Schema can be found of a single item
    //
    // It stores that with an admin-token and [name]
};
//# sourceMappingURL=setSchema.js.map