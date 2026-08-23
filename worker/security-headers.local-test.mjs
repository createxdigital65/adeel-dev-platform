// Local validation harness for the Worker security-header layer. Runs the REAL
// Worker source (the exact module wrangler deploys) against the production
// Angular build directory (frontend/dist/frontend/browser) and asserts that:
//   1. Every response (HTML, JS/CSS assets, JSON, API, errors) carries the
//      required security headers.
//   2. Status codes, bodies, Content-Type, and CORS headers are preserved
//      (no functional regression).
//   3. The CSP contains no unsafe fallbacks ('unsafe-inline', 'unsafe-eval').
//   4. The SHIPPED build artifacts comply with the CSP (static cross-check):
//      no inline scripts/styles/event handlers, and every referenced resource
//      origin is allowed by the policy.
//
// Usage (from repo root):   node worker/security-headers.local-test.mjs
//
// Exit code 0 = all checks passed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../frontend/dist/frontend/browser");

const indexHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf8");

const MIME = {
  ".json": "application/json",
  ".html": "text/html;charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const fakeAssets = {
  async fetch(request) {
    const url = new URL(request.url);
    let rel = url.pathname;
    if (rel === "/") rel = "/index.html";
    const file = path.join(DIST_DIR, rel);
    if (fs.existsSync(file)) {
      const body = fs.readFileSync(file);
      return new Response(body, {
        status: 200,
        headers: { "Content-Type": MIME[path.extname(rel)] || "application/octet-stream" }
      });
    }
    // Mimic "single-page-application" asset fallback for missing files.
    return new Response(indexHtml, { status: 200, headers: { "Content-Type": "text/html" } });
  }
};

let failures = 0;

function check(label, ok, detail) {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "\n       -> " + detail : ""}`);
}

const REQUIRED_HEADERS = [
  ["strict-transport-security", (v) => v === "max-age=31536000; includeSubDomains"],
  ["x-content-type-options", (v) => v === "nosniff"],
  ["x-frame-options", (v) => v === "DENY"],
  ["content-security-policy", (v) => typeof v === "string" && v.length > 50]
];

async function fetchFromWorker(url, init) {
  return worker.fetch(new Request(url, init), { ASSETS: fakeAssets });
}

function checkSecurityHeaders(label, res) {
  for (const [name, isValid] of REQUIRED_HEADERS) {
    const value = res.headers.get(name);
    check(`${label} -> ${name}`, value !== null && isValid(value), value || "MISSING");
  }
}

console.log("# Section 1: security headers on static responses");
{
  const res = await fetchFromWorker("http://local.test/");
  checkSecurityHeaders("GET /", res);
  const ct = res.headers.get("content-type") || "";
  check("GET / -> Content-Type preserved (html)", ct.includes("text/html"), ct);
  const body = await res.text();
  check(
    "GET / -> HTML body intact",
    body.includes("<app-root>") && /main-[A-Z0-9]+\.js/.test(body),
    ""
  );
}

const jsAsset = fs.readdirSync(DIST_DIR).find((f) => /^main-.+\.js$/.test(f)) || "main.js";
const cssAsset = fs.readdirSync(DIST_DIR).find((f) => /^styles-.+\.css$/.test(f)) || "styles.css";
for (const asset of [jsAsset, cssAsset, "favicon.ico", "favicon.svg", "personal-knowledge.json"]) {
  const filePath = path.join(DIST_DIR, asset);
  if (!fs.existsSync(filePath)) continue;
  const expectedBytes = fs.statSync(filePath).size;
  const res = await fetchFromWorker(`http://local.test/${asset}`);
  checkSecurityHeaders(`GET /${asset}`, res);
  const buf = await res.arrayBuffer();
  check(
    `GET /${asset} -> body byte-for-byte (${expectedBytes} bytes)`,
    buf.byteLength === expectedBytes,
    `${buf.byteLength} bytes`
  );
}

console.log("\n# Section 2: security headers on /api/chat (contract unchanged)");
{
  const res = await fetchFromWorker("http://local.test/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Who is Adeel Sattar?" })
  });
  checkSecurityHeaders("POST /api/chat (valid)", res);
  const body = await res.json();
  check(
    "POST /api/chat -> 200 JSON reply preserved",
    res.status === 200 && /Adeel Sattar/.test(body.reply || "") && body.mode === "local",
    JSON.stringify(body)
  );
}
{
  const res = await fetchFromWorker("http://local.test/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not-json{"
  });
  checkSecurityHeaders("POST /api/chat (bad JSON)", res);
  check("POST /api/chat (bad JSON) -> 400 kept", res.status === 400, String(res.status));
}
{
  const res = await fetchFromWorker("http://local.test/api/chat", { method: "GET" });
  checkSecurityHeaders("GET /api/chat (405)", res);
  check("GET /api/chat -> 405 kept", res.status === 405, String(res.status));
}
{
  const res = await fetchFromWorker("http://local.test/api/chat", { method: "OPTIONS" });
  checkSecurityHeaders("OPTIONS /api/chat", res);
  check(
    "OPTIONS /api/chat -> CORS preflight headers preserved",
    res.status === 204 &&
      res.headers.get("access-control-allow-origin") === "*" &&
      (res.headers.get("access-control-allow-methods") || "").includes("POST"),
    `status=${res.status}`
  );
}

console.log("\n# Section 3: CSP strength");
{
  const csp =
    (await (await fetchFromWorker("http://local.test/")).headers.get(
      "content-security-policy"
    )) || "";
  check("CSP starts from default-src 'none'", csp.includes("default-src 'none'"), csp);
  check("CSP has no 'unsafe-inline'", !csp.includes("unsafe-inline"), csp);
  check("CSP has no 'unsafe-eval'", !csp.includes("unsafe-eval"), csp);
  check(
    "CSP has no wildcard sources",
    !/(^|\s)(\*|https:|blob:)(\s|$|;)/.test(csp.replace(/'/g, "")),
    csp
  );
}

console.log("\n# Section 4: shipped build artifacts comply with CSP (no runtime breakage)");
{
  const csp =
    (await (await fetchFromWorker("http://local.test/")).headers.get(
      "content-security-policy"
    )) || "";

  const directiveTokens = (directive) => {
    const m = csp.match(new RegExp(directive + "\\s+([^;]+)"));
    return m ? m[1].trim().split(/\s+/) : [];
  };
  const cspAllows = (directive, url) => {
    const tokens = directiveTokens(directive);
    if (!tokens.length) return false;
    if (/^data:/i.test(url)) return tokens.includes("data:");
    if (url.startsWith("//")) {
      const host = url.slice(2).split(/[/?#]/)[0];
      return tokens.some((t) => t === host);
    }
    if (/^https?:\/\//i.test(url)) {
      try {
        const u = new URL(url.replace(/&amp;/g, "&"));
        return tokens.some((t) => t === u.host || t === u.origin || t === "https:" || t === "http:");
      } catch {
        return false;
      }
    }
    // Relative or root-relative URL -> same origin.
    return tokens.includes("'self'");
  };

  // 4a. No inline executable/style content left in the served HTML.
  check("dist index.html: no inline <style> blocks", !/<style[\s>]/i.test(indexHtml));
  check("dist index.html: no inline handlers or js: URLs", !/\son[a-z]+\s*=|javascript:/i.test(indexHtml));
  check(
    "dist index.html: no inline <script> bodies",
    !/<script(?![^>]*\bsrc=)[^>]*>\s*\S/i.test(indexHtml)
  );
  check("dist index.html: no web app manifest reference", !/rel=["']manifest["']/i.test(indexHtml));

  // 4b. Every resource referenced by the HTML must be CSP-allowed.
  for (const m of indexHtml.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)) {
    check(`HTML <script src="${m[1]}"> allowed by script-src`, cspAllows("script-src", m[1]));
  }
  for (const m of indexHtml.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi)) {
    const href = (m[0].match(/href=["']([^"']+)["']/i) || [])[1] || "";
    check(`HTML stylesheet "${href}" allowed by style-src`, cspAllows("style-src", href));
  }

  // 4c. Absolute fonts/images referenced by the bundled CSS must be allowed.
  const cssText = fs.readFileSync(path.join(DIST_DIR, cssAsset), "utf8");
  const cssUrls = [...cssText.matchAll(/url\(\s*["']?([^"')]+?)["']?\s*\)/gi)]
    .map((m) => m[1])
    .filter((u) => /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(u));
  for (const u of new Set(cssUrls)) {
    const directive = /^data:image/i.test(u) ? "img-src" : "font-src";
    check(
      `CSS url(${u.slice(0, 64)}${u.length > 64 ? "..." : ""}) allowed by ${directive}`,
      cspAllows(directive, u)
    );
  }

  // 4d. Runtime behaviour verified statically against the shipped bundle.
  const jsText = fs.readFileSync(path.join(DIST_DIR, jsAsset), "utf8");
  check("bundle spawns no Web Workers", !/new\s+Worker\s*\(/.test(jsText));
  check(
    "bundle dynamically imports no external chunks",
    !/import\s*\(\s*["'](?!["']|\.\/|\.\.\/|\/)[^"']*["']/.test(jsText)
  );

  // 4e. Every external host named in the HTML must appear somewhere in the CSP.
  const htmlHosts = new Set();
  for (const m of indexHtml.matchAll(/(?:href|src)=["'](https?:\/\/[^/"']+)/gi)) {
    htmlHosts.add(new URL(m[1]).host);
  }
  for (const host of htmlHosts) {
    check(`External host "${host}" covered by CSP`, csp.includes(host));
  }
}

console.log("\n----------------------------------------");
console.log(failures === 0 ? "ALL SECURITY CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
