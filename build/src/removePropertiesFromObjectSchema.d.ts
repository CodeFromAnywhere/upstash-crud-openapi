import { JSONSchema7 } from "json-schema";
/** Removes one or more properties from an object json schema */
export declare const removePropertiesFromObjectSchema: (schema: JSONSchema7, propertyKeys: string[]) => {
    properties: {
        [key: string]: import("json-schema").JSONSchema7Definition;
    } | undefined;
    required: string[] | undefined;
    $id?: string | undefined;
    $ref?: string | undefined;
    $schema?: string | undefined;
    $comment?: string | undefined;
    $defs?: {
        [key: string]: import("json-schema").JSONSchema7Definition;
    } | undefined;
    type?: import("json-schema").JSONSchema7TypeName | import("json-schema").JSONSchema7TypeName[] | undefined;
    enum?: import("json-schema").JSONSchema7Type[] | undefined;
    const?: import("json-schema").JSONSchema7Type | undefined;
    multipleOf?: number | undefined;
    maximum?: number | undefined;
    exclusiveMaximum?: number | undefined;
    minimum?: number | undefined;
    exclusiveMinimum?: number | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    pattern?: string | undefined;
    items?: import("json-schema").JSONSchema7Definition | import("json-schema").JSONSchema7Definition[] | undefined;
    additionalItems?: import("json-schema").JSONSchema7Definition | undefined;
    maxItems?: number | undefined;
    minItems?: number | undefined;
    uniqueItems?: boolean | undefined;
    contains?: import("json-schema").JSONSchema7Definition | undefined;
    maxProperties?: number | undefined;
    minProperties?: number | undefined;
    patternProperties?: {
        [key: string]: import("json-schema").JSONSchema7Definition;
    } | undefined;
    additionalProperties?: import("json-schema").JSONSchema7Definition | undefined;
    dependencies?: {
        [key: string]: string[] | import("json-schema").JSONSchema7Definition;
    } | undefined;
    propertyNames?: import("json-schema").JSONSchema7Definition | undefined;
    if?: import("json-schema").JSONSchema7Definition | undefined;
    then?: import("json-schema").JSONSchema7Definition | undefined;
    else?: import("json-schema").JSONSchema7Definition | undefined;
    allOf?: import("json-schema").JSONSchema7Definition[] | undefined;
    anyOf?: import("json-schema").JSONSchema7Definition[] | undefined;
    oneOf?: import("json-schema").JSONSchema7Definition[] | undefined;
    not?: import("json-schema").JSONSchema7Definition | undefined;
    format?: string | undefined;
    contentMediaType?: string | undefined;
    contentEncoding?: string | undefined;
    definitions?: {
        [key: string]: import("json-schema").JSONSchema7Definition;
    } | undefined;
    title?: string | undefined;
    description?: string | undefined;
    default?: import("json-schema").JSONSchema7Type | undefined;
    readOnly?: boolean | undefined;
    writeOnly?: boolean | undefined;
    examples?: import("json-schema").JSONSchema7Type | undefined;
};
//# sourceMappingURL=removePropertiesFromObjectSchema.d.ts.map