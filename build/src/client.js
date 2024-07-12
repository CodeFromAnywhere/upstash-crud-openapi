import { operationUrlObject } from "./openapi-types";
export const createClient = (config) => {
    const client = async (operation, body, 
    /** NB: always use `getPersonConfig` for this! */
    customConfiguration) => {
        const details = operationUrlObject[operation];
        const { headers, baseUrl } = customConfiguration || config;
        if (!details) {
            throw new Error(`No details found for operation: ${operation}`);
        }
        if (!baseUrl) {
            throw new Error("No baseUrl found");
        }
        const fullUrl = `${baseUrl}${details.path}`;
        try {
            const abortController = new AbortController();
            const id = setTimeout(() => abortController.abort(), (config.timeoutSeconds || 30) * 1000);
            const response = await fetch(fullUrl, {
                method: details.method,
                signal: abortController.signal,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            })
                .then(async (response) => {
                if (!response.ok) {
                    console.log("Response not ok", response.status, response.statusText);
                }
                if (!response.headers.get("Content-Type")?.includes("json")) {
                    // const headers = Array.from(response.headers.keys()).map((key) => ({
                    //   [key]: response.headers.get(key),
                    // }));
                    console.log("No JSON?"); // headers);
                }
                const responseText = await response.text();
                try {
                    return JSON.parse(responseText);
                }
                catch (e) {
                    console.log(`couldn't parse JSON`, {
                        responseText,
                        operation,
                        body,
                        customConfiguration,
                    });
                }
            })
                .catch((error) => {
                console.log({
                    explanation: `Your request could not be executed, you may be disconnected or the server may not be available. `,
                    error,
                    errorStatus: error.status,
                    errorString: String(error),
                    operation,
                    body,
                    customConfiguration,
                });
                return {
                    isSuccessful: false,
                    isNotConnected: true,
                    message: "Could not connect to any API. Please see your API configuration.",
                };
            });
            clearTimeout(id);
            return response;
        }
        catch (e) {
            return {
                isSuccessful: false,
                isNotConnected: true,
                message: "The API didn't resolve, and the fetch crashed because of it: " +
                    String(e),
            };
        }
    };
    return client;
};
export const client = createClient({
    baseUrl: "http://localhost:3000",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeoutSeconds: 60,
});
//# sourceMappingURL=client.js.map