import {
  OpenapiDocument,
  fetchOpenapi,
  humanCase,
  tryParseJson,
} from "from-anywhere";
import { readJsonFile, writeJsonToFile } from "from-anywhere/node";
import fs from "node:fs";
import path from "path";

export type OpenapiListItem = {
  key: string;
  originalUrl?: string;
  /** Useful for if its here already */
  absolutePath?: string;
  title: string | undefined;
};

export const hardcodedItemObject = {
  flyio: "https://docs.machines.dev/spec/openapi3.json",
  heygen: "https://openai-plugin.heygen.com/openapi.yaml",
  replicate: "https://api.replicate.com/openapi.json",
  vapi: "https://api.vapi.ai/api-json",
  klippa: "https://dochorizon.klippa.com/api/open-api.yaml",
  // deepgram: ?????
  uberduck: "https://api.uberduck.ai/openapi.json",
  openai:
    "https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml",
  huggingface: "https://api.endpoints.huggingface.cloud/api-doc/openapi.json",
  cloudflare:
    "https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json",
  twilio: "https://github.com/twilio/twilio-oai/tree/main/spec/json",
  sendgrid:
    "https://raw.githubusercontent.com/sendgrid/sendgrid-oai/main/oai.json",
  linode: "https://www.linode.com/docs/api/openapi.yaml",
  vercel: "https://openapi.vercel.sh/",
  firecrawl:
    "https://raw.githubusercontent.com/mendableai/firecrawl/main/apps/api/openapi.json",
  //(unofficial)
  playht:
    "https://raw.githubusercontent.com/cielo24/playht-openapi/main/playht.yml",
  browserless: "https://docs.browserless.io/redocusaurus/plugin-redoc-0.yaml",
  convertapi: "https://v2.convertapi.com/info/openapi",
  // NB: as I made it, here it should be exactly how they should've made it.
  serper: "./public/handmade/serper.json",
  doppio: "./public/handmade/doppio.json",
  multion: "./public/handmade/multion.json",
};

export const downloadAndWriteJson = async (
  item: OpenapiListItem,
  index: number,
  array: any[],
  publicPath: string,
) => {
  console.log(`${index + 1}/${array.length}`);
  const downloaded = item.absolutePath
    ? await readJsonFile<OpenapiDocument>(item.absolutePath)
    : await fetchOpenapi(item.originalUrl);

  if (!downloaded) {
    return { isSuccessful: false, message: "Not downloaded" };
  }

  const realDownloaded =
    typeof downloaded === "string"
      ? tryParseJson<OpenapiDocument>(downloaded)
      : downloaded;

  if (!realDownloaded) {
    return { isSuccessful: false, message: "Coudnt parse" };
  }

  if (JSON.stringify(realDownloaded, undefined, 2).length > 1024 * 1024 * 8) {
    return { isSuccessful: false, message: "Too big" };
  }

  // if (JSON.stringify(realDownloaded).length < 400) {
  //   return { isSuccessful: false, message: "Too small" };
  // }

  if (!realDownloaded.servers || realDownloaded.servers.length === 0) {
    return {
      isSuccessful: false,
      message: "No servers",
      K: Object.keys(realDownloaded),
    };
  }

  const switchedServers = {
    ...realDownloaded,
    //@ts-ignore
    "x-origin-servers": realDownloaded.servers.map((x) => {
      const absoluteUrl =
        x.url.startsWith("/") && item.originalUrl
          ? new URL(item.originalUrl).origin + x.url
          : x.url;

      if (x.url.startsWith("/")) {
        console.log(
          `[${item.key}.json]: apispec from ${item.originalUrl} server stars with slash: ${x.url}... should become ${absoluteUrl}... `,
        );
      }
      // NB: support for relative urls by making them absolute if we put the openapi on another server.

      return {
        ...x,
        url: absoluteUrl,
      };
    }),
    servers: [
      {
        description: "Proxy server",
        url: `https://${item.key}.dataman.ai`,
      },
    ],
  } satisfies OpenapiDocument;

  const keyPath = path.join(publicPath, item.key + ".json");

  await writeJsonToFile(keyPath, switchedServers);
  return { isSuccessful: true, message: "DONE", key: item.key };
};

export const hardcodedList = Object.keys(hardcodedItemObject).map((key) => {
  const uri = hardcodedItemObject[key as keyof typeof hardcodedItemObject];
  const absolutePath =
    uri.startsWith(".") && fs.existsSync(path.join(uri))
      ? path.resolve(uri)
      : undefined;
  const originalUrl = absolutePath ? undefined : uri;

  return {
    key,
    originalUrl,
    absolutePath,
    title: humanCase(key),
  } satisfies OpenapiListItem;
});
