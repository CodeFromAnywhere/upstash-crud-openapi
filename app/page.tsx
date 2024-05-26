"use client";

import { Suspense } from "react";
import { makeArray } from "from-anywhere";
import { OpenapiForm } from "react-openapi-form";
import { makeComplexUrlStore } from "./makeComplexUrlStore";
import { useStore } from "./store";
import "react-openapi-form/css.css";
import { StoreProvider } from "./store";
import { DatabaseOverview } from "./DatabaseOverview";
import { CreateDatabaseForm } from "./CreateDatabaseForm";

const HomePage = () => {
  const useUrlStore = makeComplexUrlStore<{
    url: string | string[] | undefined;
  }>();
  const [url, setUrl] = useUrlStore("url");
  const urls = makeArray(url);

  return (
    <StoreProvider>
      <div className="h-full p-4 lg:px-32 lg:py-20">
        <h1 className="text-3xl">OpenAPI CRUD Generator</h1>
        <p>Create a new CRUD OpenAPI</p>

        <iframe
          src="https://ghbtns.com/github-btn.html?user=codefromanywhere&repo=opencrud&type=star&count=true&size=large"
          frameBorder="0"
          scrolling="0"
          width="170"
          height="46"
          className="my-2 p-2 bg-white rounded-md"
          title="GitHub"
        ></iframe>

        <DatabaseOverview />

        <CreateDatabaseForm />
      </div>
    </StoreProvider>
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
