"use client";

import { StandardResponse } from "@/openapi-types";
import { OpenapiForm } from "react-openapi-form";
import openapi from "../../public/openapi.json";
import { useStore } from "../store";

export default function DatabasePage(props: {
  params: { databaseId: string };
}) {
  const [databases, setDatabases] = useStore("databases");
  const database = databases?.find(
    (x) => x.databaseSlug === props.params.databaseId,
  );

  /*This is not possible: process.env.NODE_ENV === "development"
      ? `http://localhost:3000`
      : `https://data.actionschema.com` 
      
      that will provide mixed-content problems:Possible mixed-content issue? The page was loaded over https:// but a http:// URL was specified. Check that you are not attempting to load mixed content.
*/
  const origin = `https://data.actionschema.com`;
  const openapiUrl = `${origin}/${props.params.databaseId}/openapi.json`;

  const links = [
    {
      title: "Swagger",
      url: `https://petstore.swagger.io/?url=${openapiUrl}`,
    },
    {
      title: "Swagger Editor",
      url: `https://editor.swagger.io/?url=${openapiUrl}`,
    },
    {
      title: "OpenAPI GUI",
      url: `https://mermade.github.io/openapi-gui/?url=${openapiUrl}`,
    },
    {
      title: "Stoplight",
      url: `https://elements-demo.stoplight.io/?spec=${openapiUrl}`,
    },

    {
      title: "ActionSchema Combination Proxy",
      url: `https://proxy.actionschema.com/?url=${openapiUrl}`,
    },

    {
      title: "Source",
      url: openapiUrl,
    },
  ];

  return (
    <div className="p-10">
      <div className="flex flex-wrap flex-row gap-4 py-10 items-center">
        <a href="/"> ← </a>
        <h1 className="text-3xl">{props.params.databaseId}</h1>
      </div>
      <div className="flex flex-row flex-wrap">
        {links.map((link) => {
          return (
            <a
              className="pr-6 text-blue-500 hover:text-blue-600"
              href={link.url}
              key={link.url}
            >
              {link.title}
            </a>
          );
        })}
      </div>
      <div>
        {database ? (
          <>
            <OpenapiForm
              openapi={openapi}
              path="/{databaseSlug}/updateDatabase"
              method="post"
              uiSchema={{
                schemaString: {
                  "ui:widget": "textarea",
                },
                X_ADMIN_AUTH_TOKEN: { "ui:widget": "hidden" },
                databaseSlug: { "ui:widget": "hidden" },
              }}
              initialData={{
                databaseSlug: props.params.databaseId,
                X_ADMIN_AUTH_TOKEN: database?.adminToken || "",
                authToken: database?.authToken || "",
                schemaString: database?.schemaString || "",
              }}
              withResponse={(response) => {
                const {
                  statusCode,
                  statusText,
                  body,
                  headers,
                  method,
                  bodyData,
                  url,
                } = response;
                const requestResponse = response.response as
                  | StandardResponse
                  | undefined;

                if (!requestResponse?.isSuccessful) {
                  alert(requestResponse?.message || "Something went wrong");
                  return;
                }

                const newDatabases = databases.map((x) =>
                  x.databaseSlug === props.params.databaseId
                    ? {
                        ...x,
                        authToken: bodyData?.authToken,
                        schemaString: bodyData?.schemaString,
                      }
                    : x,
                );

                setDatabases(newDatabases);

                alert(requestResponse.message);
              }}
            />

            <OpenapiForm
              openapi={openapi}
              path="/{databaseSlug}/read"
              method="post"
              uiSchema={{}}
              initialData={{
                databaseSlug: props.params.databaseId,
                X_ADMIN_AUTH_TOKEN: database?.adminToken || "",
                Authorization: database?.authToken || "",
              }}
              withResponse={(response) => {
                const requestResponse = response.response as
                  | StandardResponse
                  | undefined;

                if (!requestResponse?.isSuccessful) {
                  alert(requestResponse?.message || "Something went wrong");
                  return;
                }
                console.log({ requestResponse });
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
