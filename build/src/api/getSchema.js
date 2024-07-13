import { getDatabaseDetails } from "../getDatabaseDetails.js";
export const getSchema = async (context) => {
    const { databaseSlug } = context;
    const { databaseDetails } = await getDatabaseDetails(databaseSlug);
    if (!databaseDetails) {
        return {
            isSuccessful: false,
            status: 404,
            message: "Couldn't find database details",
        };
    }
    return databaseDetails.schema;
};
//# sourceMappingURL=getSchema.js.map