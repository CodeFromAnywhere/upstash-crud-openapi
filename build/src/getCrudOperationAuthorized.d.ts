import { DatabaseDetails } from "./types.js";
/**
 Auth can be gained either from:

 - admin Authorization token
 - model-wide Authorization token
 - user Authorization token
*/
export declare const getCrudOperationAuthorized: (databaseDetails: DatabaseDetails | null | undefined, Authorization: string | undefined) => Promise<boolean>;
//# sourceMappingURL=getCrudOperationAuthorized.d.ts.map