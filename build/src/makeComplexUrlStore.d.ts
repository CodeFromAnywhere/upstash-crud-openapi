import { Keys } from "from-anywhere";
import { O } from "from-anywhere";
/**
 * Variant to the original use url store that has an easier setup and allows for more complex datastructures
 *
 * Uses https://www.npmjs.com/package/qs
 *
 * Usage:
 *
 * ```ts
 * import { makeComplexUrlStore } from "use-url-store";
 * const useCustomUrlStore = makeComplexUrlStore<{a:string,b:{c:number}}>();
 * ```
 *
 * NB: the base type needs to be an object!
 */
export declare const makeComplexUrlStore: <T extends O>() => <K extends Keys<T>>(queryKey: K) => [T[K], (newValue: T[K] | undefined) => Promise<boolean>, boolean];
//# sourceMappingURL=makeComplexUrlStore.d.ts.map