// Core data shapes for the BNS dataset and search results.
// Keep this in sync with the JSON schema documented in README.md.

export type ClassificationValue = string; // e.g. "Yes", "No", "Varies", free-text nuance

export interface BnsSection {
  /** Unique id, e.g. "303" or "351-3" for a subsection-specific entry. */
  id: string;
  section: string;
  subsection?: string;
  chapter: string;
  title: string;
  official_summary: string;
  ingredients: string[];
  punishment: string;
  cognizable: ClassificationValue;
  bailable: ClassificationValue;
  triable_by: string;
  classification_note?: string;
  keywords: string[];
  aliases: string[];
  hindi_aliases: string[];
  hinglish_aliases: string[];
  context_terms: string[];
  exclusions: string[];
  aggravating_factors: string[];
  related_sections: string[];
  special_law_warning?: string;
  effective_from: string;
  source: string;
  source_url: string;
  verified_date: string;
  category: string;
  /** True only for records that have passed dataValidation checks. */
  verified?: boolean;
}

export type MatchStrength = "Strong match" | "Possible match" | "Related provision";

export interface SearchResult {
  entry: BnsSection;
  score: number; // 0 (best) to 1 (worst), as returned by Fuse
  matchStrength: MatchStrength;
  matchedTerms: string[];
  whyRelevant: string;
}

export interface ClarificationAnswer {
  questionId: string;
  value: string;
}

export interface DataValidationIssue {
  entryId: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface DataValidationReport {
  totalRecords: number;
  validRecords: number;
  excludedRecords: number;
  issues: DataValidationIssue[];
}
