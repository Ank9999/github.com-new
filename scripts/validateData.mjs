#!/usr/bin/env node
// Standalone data-quality check for src/data/bns_sections.json.
// Zero third-party dependencies — runs with plain Node, so it works even
// before `npm install` has pulled in the rest of the toolchain, and in CI.
//
// Usage: node scripts/validateData.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "src", "data", "bns_sections.json");

const REQUIRED_STRING_FIELDS = [
  "id",
  "section",
  "chapter",
  "title",
  "official_summary",
  "punishment",
  "cognizable",
  "bailable",
  "triable_by",
  "effective_from",
  "source",
  "source_url",
  "verified_date",
  "category",
];

const REQUIRED_ARRAY_FIELDS = ["ingredients", "keywords", "aliases", "related_sections"];

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function validate(entries) {
  const issues = [];
  const seenIds = new Set();
  const excluded = new Set();

  for (const entry of entries) {
    const id = entry.id ?? "(missing id)";

    if (seenIds.has(id)) {
      issues.push({ entryId: id, field: "id", message: "Duplicate section identifier.", severity: "error" });
      excluded.add(id);
    }
    seenIds.add(id);

    for (const field of REQUIRED_STRING_FIELDS) {
      const value = entry[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        issues.push({ entryId: id, field, message: `Missing or empty required field "${field}".`, severity: "error" });
        excluded.add(id);
      }
    }

    for (const field of REQUIRED_ARRAY_FIELDS) {
      const value = entry[field];
      if (!Array.isArray(value) || value.length === 0) {
        issues.push({ entryId: id, field, message: `Missing or empty required array field "${field}".`, severity: "error" });
        excluded.add(id);
      }
    }

    if (entry.source_url && !isValidUrl(entry.source_url)) {
      issues.push({ entryId: id, field: "source_url", message: `Malformed source URL: "${entry.source_url}".`, severity: "error" });
      excluded.add(id);
    }

    if (entry.verified_date && !isValidDate(entry.verified_date)) {
      issues.push({ entryId: id, field: "verified_date", message: `Invalid verified_date: "${entry.verified_date}".`, severity: "error" });
      excluded.add(id);
    }

    const allowedClassification = ["Yes", "No", "Varies"];
    if (entry.cognizable && !allowedClassification.includes(entry.cognizable)) {
      issues.push({ entryId: id, field: "cognizable", message: `Unexpected cognizable value "${entry.cognizable}".`, severity: "warning" });
    }
    if (entry.bailable && !allowedClassification.includes(entry.bailable)) {
      issues.push({ entryId: id, field: "bailable", message: `Unexpected bailable value "${entry.bailable}".`, severity: "warning" });
    }
  }

  return {
    totalRecords: entries.length,
    validRecords: entries.length - excluded.size,
    excludedRecords: excluded.size,
    issues,
  };
}

const raw = readFileSync(DATA_PATH, "utf-8");
const entries = JSON.parse(raw);
const report = validate(entries);

const errors = report.issues.filter((i) => i.severity === "error");
const warnings = report.issues.filter((i) => i.severity === "warning");

console.log(`\nBNS dataset validation report`);
console.log(`==============================`);
console.log(`Total records:    ${report.totalRecords}`);
console.log(`Valid records:    ${report.validRecords}`);
console.log(`Excluded records: ${report.excludedRecords}`);
console.log(`Errors:           ${errors.length}`);
console.log(`Warnings:         ${warnings.length}\n`);

if (errors.length > 0) {
  console.log("ERRORS:");
  for (const e of errors) console.log(`  [${e.entryId}] ${e.field}: ${e.message}`);
}
if (warnings.length > 0) {
  console.log("\nWARNINGS:");
  for (const w of warnings) console.log(`  [${w.entryId}] ${w.field}: ${w.message}`);
}

if (errors.length > 0) {
  console.error(`\n✗ Validation failed: ${errors.length} record(s) have blocking errors and would be excluded from search.`);
  process.exit(1);
} else {
  console.log(`\n✓ All ${report.totalRecords} records passed validation.`);
  process.exit(0);
}
