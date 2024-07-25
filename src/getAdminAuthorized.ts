import * as client from "./sdk/client.js";

/** */
export const getAdminAuthorized = async (Authorization: string | undefined) => {
  if (!Authorization) {
    return false;
  }

  if (
    process.env.ADMIN_SECRET &&
    Authorization === `Bearer ${process.env.ADMIN_SECRET}`
  ) {
    // allow system admin
    return true;
  }

  const permission = await client.auth("permission", undefined, {
    headers: { Authorization },
  });

  if (!permission) {
    return false;
  }

  if (permission.scope?.split(" ").find((s) => s === "admin")) {
    return true;
  }

  return false;
};
