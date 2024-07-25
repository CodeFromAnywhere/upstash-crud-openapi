import { CreateContext } from "../sdk/crud.js";
export declare const create: (context: CreateContext & {
    Authorization?: string;
}) => Promise<{
    isSuccessful: boolean;
    message: string;
    /** The rowIds created */
    result?: string[];
}>;
//# sourceMappingURL=create.d.ts.map