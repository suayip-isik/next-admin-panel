import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const examplePath = path.join(projectRoot, ".env.example");
const targetPath = path.join(projectRoot, ".env.local");

if (!fs.existsSync(examplePath)) {
  console.error("Missing .env.example. Cannot initialize environment file.");
  process.exit(1);
}

if (fs.existsSync(targetPath)) {
  console.log(".env.local already exists. Leaving it unchanged.");
  process.exit(0);
}

fs.copyFileSync(examplePath, targetPath);

const emptyKeys = fs
  .readFileSync(examplePath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split("="))
  .filter(([, value]) => value === "")
  .map(([key]) => key);

console.log("Created .env.local from .env.example");

if (emptyKeys.length > 0) {
  console.log("Review and fill these optional/secret values if needed:");
  for (const key of emptyKeys) {
    console.log(`- ${key}`);
  }
}
