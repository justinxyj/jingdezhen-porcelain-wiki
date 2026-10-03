#!/usr/bin/env node
/* Helper for scripts/test_sources_render.py.
   Renders entries through docs/javascripts/wiki-enhancements.js in jsdom (no network, no Supabase)
   and prints {slug: {sources, body, scrolled}} as JSON (sources = 来源 section html, body = .wiki-entry-body html,
   scrolled = id passed to scrollIntoView, if any). An entry may carry `_test_hash` to load the page with that location hash. Reads a JSON array of entries from stdin.
   Requires the optional `jsdom` package (resolved through NODE_PATH); exits 3 when unavailable. */
const fs = require("fs");
const path = require("path");
let JSDOM;
try { ({ JSDOM } = require("jsdom")); } catch (err) {
  if (err && err.code === "MODULE_NOT_FOUND") { process.stderr.write("jsdom not available\n"); process.exit(3); }
  throw err;
}

const JS = path.join(__dirname, "..", "docs", "javascripts");
const read = (name) => fs.readFileSync(path.join(JS, name), "utf8");
const entries = JSON.parse(fs.readFileSync(0, "utf8"));

async function renderOne(entry) {
  const slug = String(entry.slug);
  const dom = new JSDOM('<!doctype html><div id="wiki-entry-root"></div>', {
    url: "https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/?slug=" + encodeURIComponent(slug) + (entry._test_hash || ""),
    runScripts: "outside-only",
  });
  const w = dom.window;
  let scrolled = null;
  w.Element.prototype.scrollIntoView = function () { scrolled = this.id || "(no id)"; };
  w.JDM_KNOWLEDGE = {
    url: (e) => "/jingdezhen-porcelain-wiki/entry/?slug=" + encodeURIComponent(e.slug),
    get: async () => entry,
    entryNetworkContext: async () => ({ relations: [], recommendations: [], worlds: [] }),
    entryContext: async () => ({ relations: [] }),
    recommendations: async () => [],
    reset() {},
  };
  w.eval(read("dom-safe.js"));
  w.eval(read("wiki-enhancements.js"));
  for (let i = 0; i < 20; i++) await new Promise((r) => setTimeout(r, 5));
  const secs = [...w.document.querySelectorAll("section.wiki-entry-v2-section")]
    .filter((s) => s.querySelector(".wiki-entry-section-kicker")?.textContent === "来源");
  const out = secs[0] ? secs[0].innerHTML : null;
  const bodyEl = w.document.querySelector("section.wiki-entry-body");
  const body = bodyEl ? bodyEl.innerHTML : null;
  w.close();
  return { sources: out, body, scrolled };
}

(async () => {
  const result = {};
  for (const e of entries) result[e.slug] = await renderOne(e);
  process.stdout.write(JSON.stringify(result));
})();
