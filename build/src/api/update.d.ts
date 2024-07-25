import { UpdateContext } from "../sdk/crud.js";
/**
Update an item in a specified row in a table.

- applies authorization
- validates the partial item against the schema to ensure its correct

 */
export declare const update: (context: UpdateContext & {
    Authorization?: string;
}) => Promise<{
    isSuccessful: boolean;
    message: string;
    status?: undefined;
} | {
    isSuccessful: boolean;
    message: string;
    status: number;
}>;
//# sourceMappingURL=update.d.ts.map