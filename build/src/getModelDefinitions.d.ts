import { DatabaseDetails } from "./types";
import { JSONSchema7 } from "json-schema";
export declare const getModelDefinitions: (databases: {
    databaseSlug: string;
    details: DatabaseDetails | null;
}[]) => {
    [schemaKey: string]: JSONSchema7;
};
//# sourceMappingURL=getModelDefinitions.d.ts.map