import { Keys } from "from-anywhere";
import { O } from "from-anywhere";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs, { IParseOptions, IStringifyOptions } from "qs";
import { useState } from "react";

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
export const makeComplexUrlStore = <T extends O>(): (<K extends Keys<T>>(
  queryKey: K,
) => [T[K], (newValue: T[K] | undefined) => Promise<boolean>, boolean]) => {
  const useComplexUrlStore = <K extends Keys<T>>(
    queryKey: K,
  ): [T[K], (newValue: T[K] | undefined) => Promise<boolean>, boolean] => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();

    /**
     * NB: These options have quite some overlap but may not be 100%. Careful
     */
    const qsParseOptions: IParseOptions & IStringifyOptions = {
      allowDots: true,
      parseArrays: true,
      arrayFormat: "repeat",
    };

    const setter = async (newValue: T[K] | undefined) => {
      const newState = { ...parsedQuery, [queryKey]: newValue };
      const newQueryString = qs.stringify(newState, qsParseOptions);
      router.replace(pathname + "?" + newQueryString);

      return true;
    };

    const parsedQuery = qs.parse(queryString, qsParseOptions) as T;
    const value = parsedQuery[queryKey];

    return [value, setter, typeof window !== "undefined"];
  };

  return useComplexUrlStore;
};
