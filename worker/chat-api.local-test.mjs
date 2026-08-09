// Local validation harness for worker/index.js - runs the REAL Worker source
// (the exact module wrangler deploys) with a mock ASSETS binding that reads from
// the production Angular build directory (frontend/dist/frontend/browser).
//
// Usage (from repo root):
//   node worker/chat-api.local-test.mjs
//
// Exit code 0 = all tests passed.

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
  ".css": "text/css"
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
const CASES = [
  ["Who is Adeel Sattar?", /Adeel Sattar is a \.NET Developer/],
  ["Who is Adeel?", /Adeel Sattar/],
  ["Tell me about Adeel.", /Adeel Sattar/],
  ["Tell me about Adeel Sattar.", /Adeel Sattar/],
  ["What does Adeel do?", /Adeel Sattar/],
  ["What is Adeel's role?", /\.NET Developer & Full-Stack Engineer/],
  ["What is Adeel's background?", /Adeel Sattar is a \.NET Developer/],
  ["Tell me something about Adeel's background.", /Adeel Sattar is a \.NET Developer/],
  ["What technologies does Adeel use?", /\.NET 10/],
  ["What is Adeel's tech stack?", /Adeel works with: \.NET 10/],
  ["What technologies does he work with?", /Adeel works with: \.NET 10/],
  ["What does Adeel provide?", /Services offered by Adeel/],
  ["What services does Adeel offer?", /Custom software development/],
  ["What can Adeel build?", /Services offered by Adeel/],
  ["Can Adeel build custom software?", /Services offered by Adeel/],
  ["What projects has Adeel built?", /Featured projects include/],
  ["Tell me about SocialMediaAgent.", /AI-powered social media automation platform/],
  ["What is SocialMediaAgent?", /AI-powered social media automation platform/],
  ["How can I contact Adeel?", /adeelsattar\.dev@gmail\.com/],
  ["What is Adeel's email?", /adeelsattar\.dev@gmail\.com/],
  ["How can I reach Adeel?", /adeelsattar\.dev@gmail\.com/],
  ["Is Adeel available for projects?", /adeelsattar\.dev@gmail\.com/],
  ["Does Adeel work with Angular?", /Yes, Adeel works with Angular/i],
  ["Does Adeel use .NET?", /Yes, Adeel works with \.NET 10/i],
  // Negative / unknown question - MUST NOT hallucinate an answer.
  ["What is Adeel's favorite football team?", /public information/]
];

async function post(env, message, fetchOverride) {
  const prev = globalThis.fetch;
  if (fetchOverride) globalThis.fetch = fetchOverride;
  try {
    const req = new Request("http://local.test/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const res = await worker.fetch(req, env);
    const body = await res.json();
    return { status: res.status, body };
  } finally {
    globalThis.fetch = prev;
  }
}

let failures = 0;

function check(label, ok, detail) {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "\n       -> " + detail : ""}`);
}
console.log("# Scenario A: no AI provider keys configured (pure local knowledge)");
for (const [q, pattern] of CASES) {
  const { status, body } = await post({ ASSETS: fakeAssets }, q);
  check(`[${status}] ${q}`, status === 200 && pattern.test(body.reply || ""), body.reply);
}

console.log("\n# Scenario B: AI provider configured but DOWN -> local answers preserved");
const deadProvider = async () => {
  throw new Error("provider down");
};
for (const [q, pattern] of CASES) {
  const { status, body } = await post(
    { ASSETS: fakeAssets, GEMINI_API_KEY: "fake-key", OPENAI_API_KEY: "fake-key" },
    q,
    deadProvider
  );
  check(`[${status}] ${q}`, status === 200 && pattern.test(body.reply || ""), body.reply);
}

console.log("\n# Scenario C: ASSETS binding missing entirely -> embedded knowledge still answers");
for (const [q, pattern] of CASES) {
  const { status, body } = await post({}, q);
  check(`[${status}] ${q}`, status === 200 && pattern.test(body.reply || ""), body.reply);
}

console.log("\n# Scenario D: server/request error semantics");
{
  const badReq = new Request("http://local.test/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not-json{"
  });
  const res = await worker.fetch(badReq, { ASSETS: fakeAssets });
  check(`malformed JSON -> HTTP ${res.status}`, res.status === 400);
}
{
  const req = new Request("http://local.test/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  const res = await worker.fetch(req, { ASSETS: fakeAssets });
  const body = await res.json();
  check(`empty message -> HTTP ${res.status}`, res.status === 400, JSON.stringify(body));
}
{
  const getReq = new Request("http://local.test/api/chat", { method: "GET" });
  const res = await worker.fetch(getReq, { ASSETS: fakeAssets });
  check(`GET /api/chat -> HTTP ${res.status}`, res.status === 405);
}

console.log("\n----------------------------------------");
console.log(failures === 0 ? "ALL TESTS PASSED" : `${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);