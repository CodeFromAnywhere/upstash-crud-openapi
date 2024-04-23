import path from "path";
import { downloadAndWriteJson } from "./downloadAndWriteJson";

const publicPath = path.resolve(".", "public");

downloadAndWriteJson(
  {
    key: "convertapi",
    title: "ConvertAPI",
    originalUrl: "https://v2.convertapi.com/info/openapi",
  },
  0,
  [],
  publicPath,
).then(console.log);
