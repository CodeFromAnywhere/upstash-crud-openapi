import { operations } from "./openapi-types";
export type PromiseOrNot<T> = Promise<T> | T;
export type GetParameters<K extends keyof operations> = operations[K]["parameters"]["cookie"] | operations[K]["parameters"]["header"] | operations[K]["parameters"]["path"] | operations[K]["parameters"]["query"];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type MergeIntersection<U> = UnionToIntersection<U> extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type MergeParameters<P> = MergeIntersection<Extract<P, {}>>;
export type EndpointBody<T extends keyof operations> = (operations[T]["requestBody"] extends {} ? operations[T]["requestBody"]["content"]["application/json"] : {}) & MergeParameters<GetParameters<T>>;
export type EndpointContext<K extends keyof operations> = (operations[K]["requestBody"] extends {} ? operations[K]["requestBody"]["content"]["application/json"] : {}) & MergeParameters<GetParameters<K>>;
export type ResponseType<T extends keyof operations> = operations[T]["responses"][200]["content"]["application/json"];
export type Endpoint<T extends keyof operations> = (context: EndpointContext<T>) => PromiseOrNot<ResponseType<T>>;
export declare const createClient: (config: {
    timeoutSeconds?: number | undefined;
    /**
     * Server URL without slash at the end
     */
    baseUrl?: string | undefined;
    headers: {
        [key: string]: string;
    };
}) => <K extends keyof operations>(operation: K, body?: EndpointContext<K> | undefined, customConfiguration?: {
    baseUrl?: string | undefined;
    headers?: {
        [key: string]: string;
    } | undefined;
} | undefined) => Promise<operations[K]["responses"][200]["content"]["application/json"]>;
export declare const client: <K extends keyof operations>(operation: K, body?: EndpointContext<K> | undefined, customConfiguration?: {
    baseUrl?: string | undefined;
    headers?: {
        [key: string]: string;
    } | undefined;
} | undefined) => Promise<operations[K]["responses"][200]["content"]["application/json"]>;
export {};
//# sourceMappingURL=client.d.ts.map