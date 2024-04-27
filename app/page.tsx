"use client";
import { Info } from "actionschema/types";
import { Suspense, useState } from "react";
import { client } from "./client";
import { makeArray } from "from-anywhere";
import { makeComplexUrlStore } from "./makeComplexUrlStore";

const HomePage = () => {
  const useStore = makeComplexUrlStore<{
    url: string | string[] | undefined;
  }>();
  const [url, setUrl] = useStore("url");
  const urls = makeArray(url);
  const [databaseId, setDatabaseId] = useState<string>("");
  const [schemaString, setSchemaString] = useState<string>("");

  return (
    <div className="h-full p-4">
      <h1 className="text-3xl">OpenAPI CRUD Generator</h1>
      <p>Create a new CRUD OpenAPI</p>

      <p>
        TODO: Need a form for createOrUpdateDatabase that includes the
        parameters taken from the openapi specification.
      </p>

      <div className="flex flex-row gap-2">
        <div
          onClick={async () => {
            const result = await client("createOrUpdateDatabase", {
              databaseId,
              schemaString,
            });

            console.log({ result });
          }}
          className="cursor-pointer border border-black p-2 rounded-sm"
        >
          Create
        </div>
      </div>
    </div>
  );
};

export default function SuspensedHomepage() {
  // Needed for https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
