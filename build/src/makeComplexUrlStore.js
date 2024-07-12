import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "qs";
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
export const makeComplexUrlStore = () => {
    const useComplexUrlStore = (queryKey) => {
        const router = useRouter();
        const pathname = usePathname();
        const searchParams = useSearchParams();
        const queryString = searchParams.toString();
        /**
         * NB: These options have quite some overlap but may not be 100%. Careful
         */
        const qsParseOptions = {
            allowDots: true,
            parseArrays: true,
            arrayFormat: "repeat",
        };
        const setter = async (newValue) => {
            const newState = { ...parsedQuery, [queryKey]: newValue };
            const newQueryString = qs.stringify(newState, qsParseOptions);
            router.replace(pathname + "?" + newQueryString);
            return true;
        };
        const parsedQuery = qs.parse(queryString, qsParseOptions);
        const value = parsedQuery[queryKey];
        return [value, setter, typeof window !== "undefined"];
    };
    return useComplexUrlStore;
};
//# sourceMappingURL=makeComplexUrlStore.js.map