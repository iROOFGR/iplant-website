import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const en = readJson("content/content.en.json");
const ar = readJson("content/content.ar.json");
const errors = [];
const warnings = [];

const routeSet = new Set([
  "/systems",
  "/systems/hug",
  "/systems/greenspin",
  "/systems/rooftop-farming",
  "/systems/automation",
  "/farming-as-a-service",
  "/projects",
  "/consultation",
  "/virtual-farm",
  "/about",
  "/contact",
  "/privacy",
]);
const linkTokens = new Set(["IROOF_URL", "WHATSAPP_URL", "MAILTO_URL", "CONTROLLER_URL"]);
const forbiddenDraftTerms = /(?:REPLACE_WITH|\bTODO\b|\bFIXME\b|lorem ipsum)/i;

function compareShape(a, b, trail = "content") {
  const aArray = Array.isArray(a);
  const bArray = Array.isArray(b);
  if (aArray !== bArray || typeof a !== typeof b) {
    errors.push(`${trail}: English and Arabic types differ.`);
    return;
  }
  if (aArray) {
    if (a.length !== b.length) errors.push(`${trail}: English has ${a.length} items; Arabic has ${b.length}.`);
    for (let i = 0; i < Math.min(a.length, b.length); i += 1) compareShape(a[i], b[i], `${trail}[${i}]`);
    return;
  }
  if (a && typeof a === "object") {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (ak.join("|") !== bk.join("|")) {
      errors.push(`${trail}: key mismatch. EN=[${ak.join(", ")}] AR=[${bk.join(", ")}]`);
      return;
    }
    for (const key of ak) compareShape(a[key], b[key], `${trail}.${key}`);
  }
}

function validateHref(value, trail) {
  if (linkTokens.has(value) || value.startsWith("http") || value.startsWith("mailto:") || value.startsWith("#")) return;
  if (!value.startsWith("/")) {
    errors.push(`${trail}: unsupported link target: ${value}`);
    return;
  }
  const route = value.split("?")[0].replace(/\/$/, "") || "/";
  if (route !== "/" && !routeSet.has(route)) errors.push(`${trail}: no matching site route for ${value}`);
}

function inspect(value, trail = "content", key = "", warnConfirm = true) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspect(item, `${trail}[${index}]`, key, warnConfirm));
    return;
  }
  if (value && typeof value === "object") {
    if (warnConfirm && value.needsConfirmation === true) warnings.push(`${trail}: marked needsConfirmation.`);
    Object.entries(value).forEach(([childKey, item]) => inspect(item, `${trail}.${childKey}`, childKey, warnConfirm));
    return;
  }
  if (typeof value !== "string") return;
  if (forbiddenDraftTerms.test(value)) errors.push(`${trail}: contains unfinished draft text.`);
  if (key === "href") validateHref(value, trail);
  if (value.startsWith("/media/") || value.startsWith("/brand/")) {
    const file = path.join(root, "public", value.slice(1));
    if (!fs.existsSync(file)) errors.push(`${trail}: referenced file does not exist: ${value}`);
  }
}

function walkSource(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walkSource(file);
    else if (/\.(?:ts|tsx|css)$/.test(entry.name)) {
      const source = fs.readFileSync(file, "utf8");
      for (const match of source.matchAll(/["'`](\/(?:media|brand)\/[^"'`?#)\s]+)["'`]/g)) {
        const asset = match[1];
        if (asset.includes("${")) continue;
        const target = path.join(root, "public", asset.slice(1));
        if (!fs.existsSync(target)) errors.push(`${path.relative(root, file)}: referenced asset does not exist: ${asset}`);
      }
    }
  }
}

compareShape(en, ar);
inspect(en);
inspect(ar, "content.ar", "", false);
walkSource(root);

if (errors.length) {
  console.error("\nContent validation failed:\n" + [...new Set(errors)].map((item) => `  - ${item}`).join("\n"));
  process.exit(1);
}

console.log("✓ English and Arabic content structures match.");
console.log("✓ Internal content links map to implemented routes.");
console.log("✓ All referenced local media and brand files exist.");
console.log("✓ No draft placeholders were found in public content.");
if (warnings.length) {
  console.warn("\nPublishing review required:");
  [...new Set(warnings)].forEach((item) => console.warn(`  - ${item}`));
}
