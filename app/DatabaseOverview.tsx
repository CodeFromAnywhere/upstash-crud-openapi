import { useEffect } from "react";
import { useStore } from "./store";

export const DatabaseOverview = () => {
  const [databases] = useStore("databases");

  return (
    <div className="my-4">
      {databases && databases.length > 0 ? <b>My databases</b> : null}
      <ul>
        {databases
          ? databases.map((item) => {
              return (
                <li
                  className="ml-2 list-inside list-disc list-item"
                  key={item.databaseSlug}
                >
                  <p>
                    <a href={`/${item.databaseSlug}`}>{item.databaseSlug}</a>
                  </p>
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
};
