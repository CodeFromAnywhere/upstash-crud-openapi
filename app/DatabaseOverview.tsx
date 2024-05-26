import { useEffect } from "react";
import { useStore } from "./store";

export const DatabaseOverview = () => {
  const [databases] = useStore("databases");

  return (
    <div className="my-20">
      {databases
        ? databases.map((item) => {
            return (
              <div key={item.databaseSlug}>
                <p>
                  <a href={`/${item.databaseSlug}`}>{item.databaseSlug}</a>
                </p>
              </div>
            );
          })
        : null}
    </div>
  );
};
