"use client";

import { makeArray } from "from-anywhere";
import { makeComplexUrlStore } from "./makeComplexUrlStore";

const HomePage = () => {
  const useStore = makeComplexUrlStore<{
    url: string | string[] | undefined;
  }>();
  const [url, setUrl] = useStore("url");
  const urls = makeArray(url);
  return (
    <div className="h-full p-4">
      <h1 className="text-3xl">OpenAPI Combination Proxy</h1>
      <p>Create a new proxy</p>
      <div className="flex flex-col justify-start">
        {/* 
          
          See:
          https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
          
          Use RJSF instead with a dynamic JSON Schema for the operations.

          */}
        {urls?.map((url, index) => {
          return (
            <div className="flex flex-row" key={`url${index}`}>
              <div
                className="cursor-pointer border w-10 h-10 pt-1 m-2 flex justify-center align-center border-black rounded-full"
                onClick={() => {
                  setUrl(urls.filter((x, i) => i !== index));
                }}
              >
                -
              </div>

              <input
                className="my-2 p-2 border border-black bg-transparent"
                value={url}
                name={`url${index}`}
                placeholder="OpenAPI Url"
                onChange={(e) => {
                  urls[index] = e.target.value;
                  setUrl(urls);
                }}
              />
            </div>
          );
        })}
        <div
          className="cursor-pointer border h-10 w-10 border-black m-2 flex justify-center items-center rounded-full"
          onClick={() => {
            setUrl(urls.concat(urls.length === 0 ? "https://" : ""));
          }}
        >
          +
        </div>
      </div>
      <p>
        TODO: For each OpenAPI filled in, load it, and render a checkmark list
        for every operation.
      </p>

      <div className="flex flex-row gap-2">
        <button type="submit" className="border border-black p-2 rounded-sm">
          Create
        </button>
        <div
          onClick={() => {
            alert("json coming");
          }}
          className="cursor-pointer border border-black p-2 rounded-sm"
        >
          Copy JSON
        </div>
      </div>
    </div>
  );
};
import { Suspense } from "react";

export default function SuspensedHomepage() {
  // Needed for https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
