#!/usr/bin/env bun

import { readdirSync } from "node:fs";
import path from "node:path";
import { createDatabase } from "./app/[databaseId]/[...path]/createDatabase";
import fs from "node:fs";

/**
Useful for creating databases from json files in fs
 */
const createDatabaseCli = async () => {
  const [basePath] = process.argv.slice(2);
  const X_ADMIN_AUTH_TOKEN = process.env.X_ADMIN_AUTH_TOKEN;

  if (!X_ADMIN_AUTH_TOKEN) {
    console.log("Please add 'X_ADMIN_AUTH_TOKEN' to your env");
    return;
  }

  const absolutePath =
    !basePath || basePath.startsWith(".")
      ? path.join(process.cwd(), basePath || ".")
      : basePath;

  const stats = fs.existsSync(absolutePath)
    ? fs.statSync(absolutePath)
    : undefined;

  if (!stats) {
    console.log("File doesn't exist", absolutePath);
    return;
  }

  const isDirectory = stats.isDirectory();

  const filePaths = isDirectory
    ? readdirSync(absolutePath, { withFileTypes: true })
        .filter((x) => x.isFile() && x.name.endsWith(".json"))
        .map((x) => path.join(absolutePath, x.name))
    : [absolutePath];

  const results = await Promise.all(
    filePaths.map((filePath) => {
      const databaseSlug = path.parse(filePath).name.split(".")[0];
      const schemaString = fs.readFileSync(filePath, "utf8");
      return createDatabase({ databaseSlug, schemaString, X_ADMIN_AUTH_TOKEN });
    }),
  );

  console.log({ results });
};
createDatabaseCli();
