import { createClient } from "./createClient";
import { operationUrlObject as authOperationUrlObject } from "./auth.js";
import { operationUrlObject as adminOperationUrlObject } from "./admin.js";
import { operationUrlObject as crudOperationUrlObject } from "./crud.js";
//@ts-ignore
export const auth = createClient(authOperationUrlObject, {
    baseUrl: "https://auth.actionschema.com",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeoutSeconds: 60,
});
//@ts-ignore
export const admin = createClient(adminOperationUrlObject, {
    baseUrl: "https://data.actionschema.com",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeoutSeconds: 60,
});
//@ts-ignore
export const crud = createClient(crudOperationUrlObject, {
    baseUrl: "https://data.actionschema.com",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeoutSeconds: 60,
});
//# sourceMappingURL=client.js.map