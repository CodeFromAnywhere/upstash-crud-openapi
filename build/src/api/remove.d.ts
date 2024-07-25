import { RemoveContext } from "../sdk/crud.js";
export type ActionSchemaDeleteResponse = {
    isSuccessful: boolean;
    message: string;
    deleteCount?: number;
};
export declare const remove: (context: RemoveContext & {
    Authorization?: string;
}) => Promise<{
    isSuccessful: boolean;
    message: string;
    deleteCount?: undefined;
} | {
    isSuccessful: boolean;
    message: string;
    deleteCount: number;
}>;
//# sourceMappingURL=remove.d.ts.map