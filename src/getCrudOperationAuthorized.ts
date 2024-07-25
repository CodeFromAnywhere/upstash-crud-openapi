import { DatabaseDetails } from "./types.js";
import * as client from "./sdk/client.js";

/** 
 Auth can be gained either from:

 - admin Authorization token 
 - model-wide Authorization token
 - user Authorization token
*/
export const getCrudOperationAuthorized = async (
  databaseDetails: DatabaseDetails | null | undefined,
  Authorization: string | undefined,
) => {
  if (!Authorization) {
    return false;
  }

  if (!databaseDetails) {
    return false;
  }

  if (Authorization === `Bearer ${databaseDetails.adminAuthToken}`) {
    return true;
  }

  if (Authorization === `Bearer ${databaseDetails.authToken}`) {
    return true;
  }

  const permission = await client.auth("permission", undefined, {
    headers: { Authorization },
  });

  //allow entire project for admin as well as user
  const allowedScopes = [`admin`, `user`];

  if (
    allowedScopes.find((scope) =>
      permission.scope?.split(" ").find((s) => s === scope),
    )
  ) {
    return true;
  }

  return false;
};
