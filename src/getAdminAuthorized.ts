import * as client from "./sdk/client.js";

/** */
export const getAdminAuthorized = async (Authorization: string | undefined) => {
  if (!Authorization) {
    return false;
  }
  const permission = await client.auth("permission", undefined, {
    headers: { Authorization },
  });

  if (permission.scope?.split(" ").find((s) => s === "admin")) {
    return true;
  }

  return false;
};
