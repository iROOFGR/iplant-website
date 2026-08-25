import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const root = process.cwd();
const ignored = new Set(["node_modules", ".next", ".git"]);
const sources = [];
const importErrors = [];
const syntaxErrors = [];
const seoErrors = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(ts|tsx)$/.test(entry.name)) sources.push(file);
  }
}

function resolvesAlias(specifier) {
  const relative = specifier.slice(2);
  const target = path.join(root, relative);
  return [
    target,
    `${target}.ts`,
    `${target}.tsx`,
    `${target}.json`,
    path.join(target, "index.ts"),
    path.join(target, "index.tsx"),
  ].some((candidate) => fs.existsSync(candidate));
}

walk(root);
for (const file of sources) {
  const text = fs.readFileSync(file, "utf8");
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  for (const diagnostic of source.parseDiagnostics) {
    const position = source.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    syntaxErrors.push(`${path.relative(root, file)}:${position.line + 1}:${position.character + 1} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
  }
  const matches = text.matchAll(/(?:from\s+|import\s*\()(["'])(@\/[^"']+)\1/g);
  for (const match of matches) {
    const specifier = match[2];
    if (specifier && !resolvesAlias(specifier)) importErrors.push(`${path.relative(root, file)}: ${specifier}`);
  }
}

function requireSeo(relativePath, checks) {
  const text = fs.readFileSync(path.join(root, relativePath), "utf8");
  for (const [label, pattern] of checks) {
    if (!pattern.test(text)) seoErrors.push(`${relativePath}: ${label}`);
  }
}

requireSeo("proxy.ts", [
  ["bare routes use a permanent 308 locale redirect", /NextResponse\.redirect\(url,\s*308\)/],
  ["SEO discovery files bypass locale redirects", /robots\.txt\|sitemap\.xml\|manifest\.webmanifest/],
]);
requireSeo("lib/metadata.ts", [
  ["localized pages emit self-canonicals", /canonical:\s*localizedPath/],
  ["localized pages publish reciprocal language alternates", /LOCALES\.map\(\(language\)/],
  ["localized pages publish an x-default", /["']x-default["']:\s*`\/en/],
]);
requireSeo("app/sitemap.ts", [
  ["sitemap publishes language alternates", /alternates:\s*\{\s*languages:/],
  ["sitemap includes x-default", /["']x-default["']/],
]);
requireSeo("app/robots.ts", [
  ["robots references the canonical sitemap", /sitemap:\s*`\$\{site\.siteUrl\}\/sitemap\.xml`/],
  ["robots keeps API routes out of search", /disallow:\s*\["\/api\/"\]/],
]);
requireSeo("app/[locale]/page.tsx", [
  ["homepage renders Organization structured data", /["']@type["']:\s*["']Organization["']/],
  ["homepage renders WebSite structured data", /["']@type["']:\s*["']WebSite["']/],
]);

if (syntaxErrors.length || importErrors.length || seoErrors.length) {
  if (syntaxErrors.length) console.error("Syntax errors:\n" + syntaxErrors.map((item) => `  - ${item}`).join("\n"));
  if (importErrors.length) console.error("Unresolved local imports:\n" + importErrors.map((item) => `  - ${item}`).join("\n"));
  if (seoErrors.length) console.error("SEO source errors:\n" + seoErrors.map((item) => `  - ${item}`).join("\n"));
  process.exit(1);
}

console.log(`✓ ${sources.length} TypeScript/TSX files parsed.`);
console.log("✓ All @/ local imports resolve.");
console.log("✓ Locale redirects, canonicals, discovery files and structured data are guarded.");
