import openapi from "../../src/openapi.json" assert { type: "json" };
const isDev = process.env.__VERCEL_DEV_RUNNING === "1";
export const getOpenapi = () => {
    const newOpenapi = {
        ...openapi,
        servers: isDev ? [{ url: "http://localhost:3000" }] : openapi.servers,
    };
    return newOpenapi;
};
//# sourceMappingURL=getOpenapi.js.map