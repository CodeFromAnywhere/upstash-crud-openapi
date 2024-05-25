"use client";
import { Suspense } from "react";
import { makeArray } from "from-anywhere";
import { OpenapiForm } from "react-openapi-form";
import { makeComplexUrlStore } from "./makeComplexUrlStore";
import openapi from "../public/openapi.json";
import "react-openapi-form/css.css";

const HomePage = () => {
  const useStore = makeComplexUrlStore<{
    url: string | string[] | undefined;
  }>();
  const [url, setUrl] = useStore("url");
  const urls = makeArray(url);

  return (
    <div className="h-full p-4 lg:px-32 lg:py-20">
      <h1 className="text-3xl">OpenAPI CRUD Generator</h1>
      <p>Create a new CRUD OpenAPI</p>

      <OpenapiForm
        openapi={openapi as any}
        path="/root/createDatabase"
        method="post"
        uiSchema={{
          schemaString: {
            "ui:widget": "textarea",
          },
        }}
      />
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
