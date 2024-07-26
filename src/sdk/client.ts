import { createClient } from "./createClient.js";
    
import { operationUrlObject as authOperationUrlObject, operations as authOperations } from "./auth.js";
import { operationUrlObject as adminOperationUrlObject, operations as adminOperations } from "./admin.js";
import { operationUrlObject as crudOperationUrlObject, operations as crudOperations } from "./crud.js";


 
  //@ts-ignore
  export const auth = createClient<authOperations>(authOperationUrlObject, {
    baseUrl: "https://auth.actionschema.com",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      
    },
    timeoutSeconds: 60,
  });
  

 
  //@ts-ignore
  export const admin = createClient<adminOperations>(adminOperationUrlObject, {
    baseUrl: "https://data.actionschema.com",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      
    },
    timeoutSeconds: 60,
  });
  

 
  //@ts-ignore
  export const crud = createClient<crudOperations>(crudOperationUrlObject, {
    baseUrl: "https://data.actionschema.com/{databaseSlug}",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      
    },
    timeoutSeconds: 60,
  });
  