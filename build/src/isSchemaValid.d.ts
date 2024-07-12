import { O } from "from-anywhere";
import { JSONSchema7 } from "json-schema";
export declare const isSchemaValid: (context: {
    partialItem: O;
    schema: JSONSchema7;
    validPartialItemPropertyKeys: string[];
    partialItemPropertyKeys: string[];
}) => {
    isSuccessful: boolean;
    message: string;
} | undefined;
//# sourceMappingURL=isSchemaValid.d.ts.map