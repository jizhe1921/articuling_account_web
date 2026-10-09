import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath is required on Windows. Using URL.pathname directly turns
// file:///D:/Projects/... into /D:/Projects/..., which path.resolve may expand
// incorrectly as D:\\D:\\Projects\\....
const root = fileURLToPath(new URL("../", import.meta.url));
const expected = [
  "index.html",
  "404.html",
  "CNAME",
  ".nojekyll",
  "verify-email/index.html",
  "reset-password/index.html",
  "assets/site.css",
  "assets/site-config.js",
  "assets/token-utils.js",
  "assets/desktop-link.js",
  "assets/api-client.js",
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const files = await walk(root);
const relativeFiles = new Set(files.map((file) => relative(root, file).replaceAll("\\", "/")));
for (const path of expected) {
  if (!relativeFiles.has(path)) throw new Error(`Missing required file: ${path}`);
}

const forbiddenExtensions = new Set([".py", ".pyc", ".db", ".sqlite", ".sqlite3", ".log"]);
for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (forbiddenExtensions.has(ext)) throw new Error(`Forbidden deploy file: ${relative(root, file)}`);
}

const cname = (await readFile(join(root, "CNAME"), "utf8")).trim();
if (cname !== "account.articuling.com") throw new Error("CNAME must be account.articuling.com");

const sourceFiles = files.filter((file) => [".html", ".js", ".mjs", ".css", ".md", ".ps1", ".cmd"].includes(extname(file).toLowerCase()));
for (const file of sourceFiles) {
  const text = await readFile(file, "utf8");
  if (/AKIA[0-9A-Z]{16}/.test(text) || /re_[A-Za-z0-9_-]{24,}/.test(text)) {
    throw new Error(`Possible secret detected in ${relative(root, file)}`);
  }
}

console.log(JSON.stringify({ ok: true, files: files.length, cname }, null, 2));
