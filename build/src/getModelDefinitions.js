import { pascalCase } from "from-anywhere";
const defaultSchema = {
    type: "object",
    description: "Schema couldn't be found",
    properties: {},
    additionalProperties: true,
};
export const getModelDefinitions = (databases) => {
    const definitions = databases.reduce((previous, database) => {
        const schemaKey = pascalCase(database.databaseSlug);
        return {
            ...previous,
            [schemaKey]: database.details?.schema || defaultSchema,
        };
    }, {});
    return definitions;
};
//# sourceMappingURL=getModelDefinitions.js.map