"use client";

import { OpenapiForm } from "react-openapi-form";
import openapi from "../public/openapi.json";
import { useStore } from "./store";
import { CreateDatabaseResponse, StandardResponse } from "./openapi-types";
import { useRouter } from "next/navigation";

export const CreateDatabaseForm = () => {
  const [databases, setDatabases] = useStore("databases");
  const router = useRouter();
  return (
    <div>
      <b>New Database</b>
      <p>Only the Database ID and Schema are required.</p>
      <div className="my-10">
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
              | CreateDatabaseResponse
              | undefined;

            const adminToken = requestResponse?.adminAuthToken;
            const authToken = requestResponse?.authToken;
            const databaseSlug = bodyData?.databaseSlug as string;

            if (!adminToken || !authToken || !databaseSlug) {
              alert(requestResponse?.message);
              return;
            }
            const newDatabases = databases
              .filter((x) => x.databaseSlug !== bodyData?.databaseSlug)
              .concat([
                {
                  adminToken,
                  authToken,
                  databaseSlug,
                  schemaString: bodyData?.schemaString || "",
                },
              ]);

            setDatabases(newDatabases);

            router.push(`/${databaseSlug}`);
          }}
        />
      </div>
    </div>
  );
};
