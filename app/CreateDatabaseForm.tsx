"use client";

import { OpenapiForm } from "react-openapi-form";
import openapi from "../public/openapi.json";
import { useStore } from "./store";
import { CreateDatabaseResponse, StandardResponse } from "./openapi-types";

export const CreateDatabaseForm = () => {
  const [databases, setDatabases] = useStore("databases");

  return (
    <OpenapiForm
      openapi={openapi as any}
      path="/root/createDatabase"
      method="post"
      uiSchema={{
        schemaString: {
          "ui:widget": "textarea",
        },
      }}
      withResponse={(response) => {
        const { statusCode, statusText, body, headers, method, bodyData, url } =
          response;
        const requestResponse = response.response as
          | CreateDatabaseResponse
          | undefined;

        const adminToken = requestResponse?.adminAuthToken;
        const authToken = requestResponse?.authToken;
        const databaseSlug = bodyData?.databaseSlug as string;

        if (!adminToken || !authToken || !databaseSlug) {
          return;
        }
        const newDatabases = databases
          .filter((x) => x.databaseSlug !== bodyData?.databaseSlug)
          .concat([{ adminToken, authToken, databaseSlug }]);

        setDatabases(newDatabases);

        alert(requestResponse.message);
      }}
    />
  );
};
