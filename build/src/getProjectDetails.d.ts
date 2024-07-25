import { DatabaseDetails, ProjectDetails } from "./types.js";
/** In order to go from databaseSlug to databaseId, we need a simple global KV for that */
export declare const getProjectDetails: (projectSlug: string) => Promise<{
    isSuccessful: boolean;
    message: string;
    projectDetails?: undefined;
    databases?: undefined;
} | {
    projectDetails: ProjectDetails;
    databases: {
        databaseSlug: string;
        details: DatabaseDetails | null;
    }[];
    isSuccessful: boolean;
    message: string;
}>;
//# sourceMappingURL=getProjectDetails.d.ts.map