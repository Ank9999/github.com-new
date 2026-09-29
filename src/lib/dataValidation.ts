// Automated validation of the local legal dataset (spec §26).
// Runs at build/dev time (see scripts/validateData.mjs for the standalone
// CLI version) and again at runtime in dev mode via App.tsx, so a broken
// dataset is loud and visible rather than silently serving bad data.

import type { BnsSection, DataValidationIssue, DataValidationReport } from "../types/legal";

const REQUIRED_STRING_FIELDS: (keyof BnsSection)[] = [
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

const REQUIRED_ARRAY_FIELDS: (keyof BnsSection)[] = [
  "ingredients",
  "keywords",
  "aliases",
  "related_sections",
];

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

export function validateDataset(entries: BnsSection[]): DataValidationReport {
  const issues: DataValidationIssue[] = [];
  const seenIds = new Set<string>();
  const excluded = new Set<string>();

  for (const entry of entries) {
    const id = entry.id ?? "(missing id)";

    // Duplicate identifiers
    if (seenIds.has(id)) {
      issues.push({
        entryId: id,
        field: "id",
        message: "Duplicate section identifier.",
        severity: "error",
      });
      excluded.add(id);
    }
    seenIds.add(id);

    // Missing required string fields
    for (const field of REQUIRED_STRING_FIELDS) {
      const value = entry[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        issues.push({
          entryId: id,
          field: String(field),
          message: `Missing or empty required field "${String(field)}".`,
          severity: "error",
        });
        excluded.add(id);
      }
    }

    // Missing required array fields
    for (const field of REQUIRED_ARRAY_FIELDS) {
      const value = entry[field];
      if (!Array.isArray(value) || value.length === 0) {
        issues.push({
          entryId: id,
          field: String(field),
          message: `Missing or empty required array field "${String(field)}".`,
          severity: "error",
        });
        excluded.add(id);
      }
    }

    // Missing punishment text specifically (spec calls this out separately)
    if (!entry.punishment || entry.punishment.trim().length === 0) {
      issues.push({
        entryId: id,
        field: "punishment",
        message: "Missing statutory punishment text.",
        severity: "error",
      });
      excluded.add(id);
    }

    // Missing source
    if (!entry.source || entry.source.trim().length === 0) {
      issues.push({
        entryId: id,
        field: "source",
        message: "Missing authoritative source citation.",
        severity: "error",
      });
      excluded.add(id);
    }

    // Malformed source URL
    if (entry.source_url && !isValidUrl(entry.source_url)) {
      issues.push({
        entryId: id,
        field: "source_url",
        message: `Malformed source URL: "${entry.source_url}".`,
        severity: "error",
      });
      excluded.add(id);
    }

    // Missing / malformed verification date
    if (!entry.verified_date) {
      issues.push({
        entryId: id,
        field: "verified_date",
        message: "Missing verification date.",
        severity: "error",
      });
      excluded.add(id);
    } else if (!isValidDate(entry.verified_date)) {
      issues.push({
        entryId: id,
        field: "verified_date",
        message: `Verification date "${entry.verified_date}" is not a valid ISO date (YYYY-MM-DD).`,
        severity: "error",
      });
      excluded.add(id);
    }

    // Inconsistent classification values (warn, don't exclude)
    const allowedCognizable = ["Yes", "No", "Varies"];
    if (entry.cognizable && !allowedCognizable.includes(entry.cognizable)) {
      issues.push({
        entryId: id,
        field: "cognizable",
        message: `Unexpected "cognizable" value "${entry.cognizable}" (expected Yes/No/Varies).`,
        severity: "warning",
      });
    }
    const allowedBailable = ["Yes", "No", "Varies"];
    if (entry.bailable && !allowedBailable.includes(entry.bailable)) {
      issues.push({
        entryId: id,
        field: "bailable",
        message: `Unexpected "bailable" value "${entry.bailable}" (expected Yes/No/Varies).`,
        severity: "warning",
      });
    }

    // effective_from sanity check
    if (entry.effective_from && !isValidDate(entry.effective_from)) {
      issues.push({
        entryId: id,
        field: "effective_from",
        message: `"effective_from" is not a valid ISO date: "${entry.effective_from}".`,
        severity: "warning",
      });
    }
  }

  return {
    totalRecords: entries.length,
    validRecords: entries.length - excluded.size,
    excludedRecords: excluded.size,
    issues,
  };
}

/** Returns only entries that pass validation without errors (warnings are allowed through). */
export function getVerifiedEntries(entries: BnsSection[]): BnsSection[] {
  const report = validateDataset(entries);
  const excludedIds = new Set(
    report.issues.filter((i) => i.severity === "error").map((i) => i.entryId)
  );
  return entries
    .filter((e) => !excludedIds.has(e.id))
    .map((e) => ({ ...e, verified: true }));
}
