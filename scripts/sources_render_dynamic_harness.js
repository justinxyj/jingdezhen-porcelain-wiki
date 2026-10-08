#!/usr/bin/env node
/* Helper for scripts/test_sources_render.py.
   Renders entries through docs/javascripts/wiki-enhancements.js in jsdom (no network, no Supabase)
   and prints {slug: sourcesSectionHtml} as JSON. Reads a JSON array of entries from stdin.
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
const {execFileSync}=require('child_process');
const bibliography=JSON.parse(execFileSync('python3',['-c',"import sys,json;sys.path.insert(0,'scripts');from source_reference_catalog import source_catalog;print(json.dumps(source_catalog()))"],{encoding:'utf8'}));
const entries = JSON.parse(fs.readFileSync(0, "utf8"));

async function renderOne(entry) {
  const slug = String(entry.slug);
  const dom = new JSDOM('<!doctype html><div id="wiki-entry-root"></div>', {
    url: "https://justinxyj.github.io/jingdezhen-porcelain-wiki/entry/?slug=" + encodeURIComponent(slug),
    runScripts: "outside-only",
  });
  const w = dom.window;
  w.JDM_SOURCE_REFERENCES=bibliography;
  w.eval(read("data-contract.js"));
  entry=w.JDM_CONTRACT.entry(entry);
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
  // Locate the source list by its stable semantic class, independent of heading copy.
  const section = w.document.querySelector('.wiki-entry-source-links')?.closest('section');
  const out = section ? section.innerHTML : null;
  w.close();
  return out;
}

(async () => {
  const result = {};
  for (const e of entries) result[e.slug] = await renderOne(e);
  process.stdout.write(JSON.stringify(result));
})();
