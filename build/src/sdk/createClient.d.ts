export declare const createClient: <operations extends {
    [key: string]: {
        parameters: {
            [key: string]: any;
        };
        requestBody: {
            [key: string]: any;
        };
        responses: {
            [key: string]: any;
        };
    };
}>(operationUrlObject: { [operationId in keyof operations]: {
    method: string;
    path: string;
}; }, config: {
    timeoutSeconds?: number | undefined;
    /**
     * Server URL without slash at the end
     */
    baseUrl?: string | undefined;
    headers: {
        [key: string]: string;
    };
}) => <K extends keyof operations>(operation: K, body?: ((operations[K]["requestBody"] extends {} ? operations[K]["requestBody"]["content"]["application/json"] : {}) & (((Extract<operations[K]["parameters"]["cookie"], {}> extends infer T ? T extends Extract<operations[K]["parameters"]["cookie"], {}> ? T extends any ? (k: T) => void : never : never : never) | (Extract<operations[K]["parameters"]["header"], {}> extends infer T_1 ? T_1 extends Extract<operations[K]["parameters"]["header"], {}> ? T_1 extends any ? (k: T_1) => void : never : never : never) | (Extract<operations[K]["parameters"]["path"], {}> extends infer T_2 ? T_2 extends Extract<operations[K]["parameters"]["path"], {}> ? T_2 extends any ? (k: T_2) => void : never : never : never) | (Extract<operations[K]["parameters"]["query"], {}> extends infer T_3 ? T_3 extends Extract<operations[K]["parameters"]["query"], {}> ? T_3 extends any ? (k: T_3) => void : never : never : never) extends (k: infer I) => void ? I : never) extends infer O ? { [K_1 in keyof O]: O[K_1]; } : never)) | undefined, customConfiguration?: {
    baseUrl?: string | undefined;
    headers?: {
        [key: string]: string;
    } | undefined;
} | undefined) => Promise<operations[K]["responses"][200]["content"]["application/json"]>;
//# sourceMappingURL=createClient.d.ts.map