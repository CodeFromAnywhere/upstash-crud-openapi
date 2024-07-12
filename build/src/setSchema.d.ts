export declare const setSchema: (context: {
    adminToken: string;
    schemaString: string;
    /**
     * URL compliant unique name for this schema. If it already exists, will be overwritten.
     */
    name: string;
}) => Promise<{
    isSuccessful: boolean;
    message: string;
} | undefined>;
//# sourceMappingURL=setSchema.d.ts.map