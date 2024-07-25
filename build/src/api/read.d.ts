import { O } from "from-anywhere";
import { ReadContext } from "../sdk/crud.js";
export type ModelKey = string;
export declare const read: (context: ReadContext & {
    Authorization?: string;
}) => Promise<{
    isSuccessful: boolean;
    message: string;
    hasMore?: undefined;
    items?: undefined;
} | {
    isSuccessful: boolean;
    message: string;
    hasMore: boolean;
    items: {
        [key: string]: O;
    };
}>;
//# sourceMappingURL=read.d.ts.map