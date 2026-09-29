import { describe, it, expect } from "vitest";
import { validateDataset, getVerifiedEntries } from "../lib/dataValidation";
import rawData from "../data/bns_sections.json";
import type { BnsSection } from "../types/legal";

const dataset = rawData as BnsSection[];

describe("dataValidation", () => {
  it("reports zero blocking errors on the shipped dataset", () => {
    const report = validateDataset(dataset);
    const errors = report.issues.filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
    expect(report.validRecords).toBe(report.totalRecords);
  });

  it("has no duplicate section identifiers", () => {
    const ids = dataset.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("excludes a record with a missing title", () => {
    const broken: BnsSection[] = [
      { ...dataset[0], id: "test-broken", title: "" },
    ];
    const report = validateDataset(broken);
    expect(report.excludedRecords).toBe(1);
    const verified = getVerifiedEntries(broken);
    expect(verified).toHaveLength(0);
  });

  it("excludes a record with a malformed source URL", () => {
    const broken: BnsSection[] = [
      { ...dataset[0], id: "test-bad-url", source_url: "not-a-url" },
    ];
    const report = validateDataset(broken);
    expect(report.excludedRecords).toBe(1);
  });

  it("flags an out-of-range cognizable value as a warning, not an error", () => {
    const odd: BnsSection[] = [
      { ...dataset[0], id: "test-odd-cognizable", cognizable: "Sometimes" },
    ];
    const report = validateDataset(odd);
    const errors = report.issues.filter((i) => i.severity === "error");
    const warnings = report.issues.filter((i) => i.severity === "warning");
    expect(errors).toHaveLength(0);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("every shipped entry has a punishment, source, and verified_date", () => {
    for (const entry of dataset) {
      expect(entry.punishment.length).toBeGreaterThan(0);
      expect(entry.source.length).toBeGreaterThan(0);
      expect(entry.verified_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
