import { Endpoint } from "../client.js";
import { getModelDefinitions } from "../getModelDefinitions.js";
import { getProjectDetails } from "../getProjectDetails.js";

export const getProjectSchema: Endpoint<"getProjectSchema"> = async (
  context,
) => {
  const { projectSlug } = context;

  const { projectDetails, databases, isSuccessful, message } =
    await getProjectDetails(projectSlug);

  if (!projectDetails || !isSuccessful) {
    return {
      status: 404,
      isSuccessful: false,
      message: `Couldn't find project details: ${message}`,
    };
  }

  const definitions = getModelDefinitions(databases);
  return { definitions };
};
