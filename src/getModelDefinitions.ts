import { pascalCase } from "edge-util";
import { DatabaseDetails } from "./types";
import { JSONSchema7 } from "json-schema";

const defaultSchema: JSONSchema7 = {
  type: "object",
  description: "Schema couldn't be found",
  properties: {},
  additionalProperties: true,
};

export const getModelDefinitions = (
  databases: {
    databaseSlug: string;
    details: DatabaseDetails | null;
  }[],
) => {
  const definitions = databases.reduce((previous, database) => {
    const schemaKey = pascalCase(database.databaseSlug);
    return {
      ...previous,
      [schemaKey]: database.details?.schema || defaultSchema,
    };
  }, {} as { [schemaKey: string]: JSONSchema7 });

  return definitions;
};
