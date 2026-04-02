#!/usr/bin/env node

/**
 * Fetches real scores for all registry skills from the Skyll API
 * and writes them to app/data/scores.json.
 *
 * Run: node scripts/update-scores.mjs
 * Re-run before deploy to refresh scores.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = "https://api.skyll.app";
const BATCH = 5;
const DELAY = 800;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Extract skill IDs from registry.ts
const registryPath = join(__dirname, "../app/data/registry.ts");
const registryContent = readFileSync(registryPath, "utf-8");
const idMatches = [...registryContent.matchAll(/id:\s*"([^"]+)"/g)];
const skillIds = idMatches.map((m) => m[1]);

console.log(`Fetching scores for ${skillIds.length} skills...`);

const scores = {};
let fetched = 0;

for (let i = 0; i < skillIds.length; i += BATCH) {
  if (i > 0) await sleep(DELAY);

  const batch = skillIds.slice(i, i + BATCH);
  const results = await Promise.allSettled(
    batch.map(async (id) => {
        const res = await fetch(`${API}/skill/${id}?include_references=true`);
      if (!res.ok) return { id, relevance_score: 0, install_count: 0 };
      const data = await res.json();
      return {
        id,
        relevance_score: data.relevance_score ?? 0,
        install_count: data.install_count ?? 0,
      };
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") {
      scores[r.value.id] = {
        relevance_score: r.value.relevance_score,
        install_count: r.value.install_count,
      };
      fetched++;
      const pct = ((fetched / skillIds.length) * 100).toFixed(0);
      process.stdout.write(`\r  ${fetched}/${skillIds.length} (${pct}%) - ${r.value.id}: ${r.value.relevance_score}`);
    }
  }
}

console.log("\n");

const outPath = join(__dirname, "../app/data/scores.json");
writeFileSync(outPath, JSON.stringify(scores, null, 2));
console.log(`Written to ${outPath}`);

// Summary
const vals = Object.values(scores);
const avg = vals.reduce((a, b) => a + b.relevance_score, 0) / vals.length;
const top = Object.entries(scores)
  .sort((a, b) => b[1].relevance_score - a[1].relevance_score)
  .slice(0, 5);
console.log(`\nAvg score: ${avg.toFixed(1)}`);
console.log("Top 5:");
for (const [id, s] of top) {
  console.log(`  ${s.relevance_score.toFixed(1)}  ${id} (${s.install_count} installs)`);
}
