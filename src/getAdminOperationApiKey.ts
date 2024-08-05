import * as client from "./sdk.js";

/**
 * Will check Authorizaiton token and respond with the user api key if scope is sufficient.
 */
export const getAdminOperationApiKey = async (
  Authorization: string | null | undefined,
) => {
  if (!Authorization) {
    return;
  }

  const apiKey = Authorization?.slice("Bearer ".length);
  if (
    process.env.ADMIN_SECRET &&
    Authorization === `Bearer ${process.env.ADMIN_SECRET}`
  ) {
    // allow system admin
    return apiKey;
  }

  const permissionResult = Authorization
    ? await client.authClient("permission", undefined, {
        access_token: apiKey,
      })
    : undefined;

  if (!permissionResult?.userAuthToken) {
    return;
  }

  if (!permissionResult?.permission?.scope?.split(" ").includes("admin")) {
    return;
  }

  return permissionResult.userAuthToken;
};
