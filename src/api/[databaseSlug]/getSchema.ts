import { Endpoint } from "../../client.js";
import { getDatabaseDetails } from "../../getDatabaseDetails.js";

export const getSchema: Endpoint<"getSchema"> = async (context) => {
  const { databaseSlug } = context;
  const { databaseDetails } = await getDatabaseDetails(databaseSlug);

  if (!databaseDetails) {
    return {
      isSuccessful: false,
      status: 404,
      message: "Couldn't find database details",
    } as { [key: string]: unknown };
  }

  return databaseDetails.schema as { [key: string]: unknown };
};
