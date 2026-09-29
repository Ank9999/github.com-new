// Local, client-side search/matching engine over the BNS dataset.
// No network calls are made here — everything runs against the bundled
// JSON using Fuse.js for fuzzy/typo-tolerant matching, layered with a
// weighted scoring pass tuned for legal-ingredient and synonym matching.
//
// IMPORTANT: this produces an information-retrieval relevance ranking
// ("Search Match: Strong / Possible / Related"), never a probability of
// guilt or conviction. See types/legal.ts for the MatchStrength type.

import Fuse, { type IFuseOptions } from "fuse.js";
import type { BnsSection, ClarificationAnswer, MatchStrength, SearchResult } from "../types/legal";
import { normalizeText, significantTokens } from "./normalizer";

interface SearchableRecord {
  entry: BnsSection;
  offenceTitle: string;
  aliasesBlob: string;
  keywordsBlob: string;
  hindiBlob: string;
  hinglishBlob: string;
  contextBlob: string;
  ingredientsBlob: string;
  summaryBlob: string;
}

function buildSearchable(entries: BnsSection[]): SearchableRecord[] {
  return entries.map((entry) => ({
    entry,
    offenceTitle: entry.title,
    aliasesBlob: entry.aliases.join(" | "),
    keywordsBlob: entry.keywords.join(" | "),
    hindiBlob: entry.hindi_aliases.join(" | "),
    hinglishBlob: entry.hinglish_aliases.join(" | "),
    contextBlob: entry.context_terms.join(" | "),
    ingredientsBlob: entry.ingredients.join(" | "),
    summaryBlob: entry.official_summary,
  }));
}

/** Minimum combined relevance for a provision to be shown at all. */
const MIN_RELEVANCE = 0.12;

const FUSE_OPTIONS: IFuseOptions<SearchableRecord> = {
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
  useExtendedSearch: false,
  minMatchCharLength: 2,
  threshold: 0.38, // typo tolerance; lower = stricter
  distance: 200,
  keys: [
    { name: "offenceTitle", weight: 0.22 },
    { name: "aliasesBlob", weight: 0.2 },
    { name: "keywordsBlob", weight: 0.2 },
    { name: "hinglishBlob", weight: 0.14 },
    { name: "hindiBlob", weight: 0.1 },
    { name: "contextBlob", weight: 0.09 },
    { name: "ingredientsBlob", weight: 0.03 },
    { name: "summaryBlob", weight: 0.02 },
  ],
};

export class BnsSearchEngine {
  private fuse: Fuse<SearchableRecord>;
  private records: SearchableRecord[];

  constructor(entries: BnsSection[]) {
    this.records = buildSearchable(entries);
    this.fuse = new Fuse(this.records, FUSE_OPTIONS);
  }

  /**
   * Runs a query and returns ranked results with a human-readable Match
   * Strength label. `clarifications` can nudge ranking based on the
   * optional "Details that can improve the search" chips.
   */
  search(rawQuery: string, clarifications: ClarificationAnswer[] = []): SearchResult[] {
    const query = normalizeText(rawQuery);
    if (query.length === 0) return [];

    const tokens = significantTokens(rawQuery);

    // Fuse is used for fuzzy/typo tolerance. A long sentence rarely fuzzy-
    // matches any single field as a whole, so we also search each significant
    // word separately and keep each entry's best (lowest) Fuse score.
    const fuseScoreById = new Map<string, number>();
    const fuseQueries = [query, ...tokens.filter((t) => t.length >= 3)];
    for (const fq of fuseQueries) {
      for (const r of this.fuse.search(fq)) {
        const id = r.item.entry.id;
        const s = r.score ?? 1;
        const prev = fuseScoreById.get(id);
        if (prev === undefined || s < prev) fuseScoreById.set(id, s);
      }
    }

    // Score every record (the dataset is small), not only Fuse candidates,
    // so exact keyword/alias hits are never lost when Fuse finds nothing.
    const scored = this.records.map((rec) => {
      const entry = rec.entry;
      const fuseScore = fuseScoreById.get(entry.id) ?? 1; // 0 = perfect, 1 = worst

      // --- Weighted bonus pass, per spec §6 ---
      let bonus = 0;
      const matchedTerms = new Set<string>();

      const normTitle = normalizeText(entry.title);
      const normQuery = query;

      // Exact offence phrase match (title or alias equals/contains the query)
      if (normTitle === normQuery || entry.aliases.some((a) => normalizeText(a) === normQuery)) {
        bonus += 0.5;
        matchedTerms.add(entry.title);
      } else if (normTitle.includes(normQuery) || normQuery.includes(normTitle)) {
        bonus += 0.3;
      }

      // Legal-ingredient / keyword / synonym term hits
      const allTermFields: [string[], number][] = [
        [entry.aliases, 0.22],
        [entry.keywords, 0.2],
        [entry.hinglish_aliases, 0.18],
        [entry.hindi_aliases, 0.16],
        [entry.context_terms, 0.12],
      ];
      for (const [field, weight] of allTermFields) {
        for (const term of field) {
          const normTerm = normalizeText(term);
          if (!normTerm) continue;
          if (normQuery.includes(normTerm) || normTerm.includes(normQuery)) {
            bonus += weight;
            matchedTerms.add(term);
            continue;
          }
          const termWords = significantTokens(term);
          if (termWords.length <= 1) {
            // single-word term: exact token match only
            if (tokens.includes(normTerm)) {
              bonus += weight * 0.6;
              matchedTerms.add(term);
            }
          } else {
            // multi-word term (e.g. "bike theft", "damaged my car"): partial
            // word overlap still counts, scaled by how much of the phrase matched.
            const overlapCount = termWords.filter((w) => tokens.includes(w)).length;
            const ratio = overlapCount / termWords.length;
            if (ratio >= 0.5) {
              bonus += weight * 0.55 * ratio;
              matchedTerms.add(term);
            }
          }
        }
      }

      // Ingredient / general description matches (lower weight, per spec)
      for (const ingredient of entry.ingredients) {
        const normIngredient = normalizeText(ingredient);
        const overlap = tokens.filter((t) => normIngredient.includes(t)).length;
        if (overlap > 0) bonus += Math.min(0.08, overlap * 0.02);
      }

      // Combine: fuseScore is "distance" (lower=better); invert to a 0..1
      // relevance, then add our bonus.
      const fuseRelevance = 1 - fuseScore;
      let base = fuseRelevance * 0.5 + bonus;

      // Clarification-driven nudges only re-rank entries that already matched
      // the description — they never pull an unrelated provision into results.
      if (base >= MIN_RELEVANCE) {
        for (const answer of clarifications) {
          base += applyClarificationNudge(entry, answer);
        }
      }

      const combined = Math.max(0, Math.min(1, base));

      return {
        entry,
        rawScore: combined,
        matchedTerms: Array.from(matchedTerms),
      };
    });

    // De-duplicate by entry id, keep the best score
    const byId = new Map<string, (typeof scored)[number]>();
    for (const s of scored) {
      const existing = byId.get(s.entry.id);
      if (!existing || s.rawScore > existing.rawScore) byId.set(s.entry.id, s);
    }

    const ranked = Array.from(byId.values())
      .filter((s) => s.rawScore >= MIN_RELEVANCE) // drop near-zero noise
      .sort((a, b) => b.rawScore - a.rawScore)
      .slice(0, 12);

    return ranked.map((r) => ({
      entry: r.entry,
      score: r.rawScore,
      matchStrength: scoreToStrength(r.rawScore),
      matchedTerms: r.matchedTerms,
      whyRelevant: buildWhyRelevant(r.entry, r.matchedTerms, rawQuery),
    }));
  }

  /** Local, offline autocomplete: matches query prefix/substring against titles, aliases and keywords. */
  suggest(rawQuery: string, limit = 6): string[] {
    const query = normalizeText(rawQuery);
    if (query.length < 2) return [];

    const suggestions = new Set<string>();
    for (const rec of this.records) {
      const candidates = [
        rec.entry.title,
        ...rec.entry.aliases,
        ...rec.entry.keywords,
        ...rec.entry.hinglish_aliases,
      ];
      for (const c of candidates) {
        const norm = normalizeText(c);
        if (norm.startsWith(query) || norm.includes(query)) {
          suggestions.add(c);
        }
        if (suggestions.size >= limit * 3) break;
      }
    }
    return Array.from(suggestions).slice(0, limit);
  }
}

function scoreToStrength(score: number): MatchStrength {
  if (score >= 0.55) return "Strong match";
  if (score >= 0.3) return "Possible match";
  return "Related provision";
}

function buildWhyRelevant(entry: BnsSection, matchedTerms: string[], rawQuery: string): string {
  if (matchedTerms.length === 0) {
    return `The description shares general context with "${entry.title}" (${entry.section}).`;
  }
  const shown = matchedTerms.slice(0, 3).join(", ");
  return `Your description matched terms associated with "${entry.title}" (Section ${entry.section}): ${shown}.`;
}

/**
 * Nudges an entry's score up or down based on an answered clarification
 * chip (spec §9). Nudges are intentionally small and additive — they
 * refine ranking, they never single-handedly manufacture a match.
 */
function applyClarificationNudge(entry: BnsSection, answer: ClarificationAnswer): number {
  const { questionId, value } = answer;
  const factors = entry.aggravating_factors.join(" ").toLowerCase();
  const exclusions = entry.exclusions.join(" ").toLowerCase();
  const category = entry.category.toLowerCase();

  let nudge = 0;

  switch (questionId) {
    case "injury":
      if (value === "serious" && (entry.title.toLowerCase().includes("grievous") || factors.includes("weapon"))) {
        nudge += 0.15;
      }
      if (value === "none" && entry.title.toLowerCase().includes("grievous")) {
        nudge -= 0.15;
      }
      if (value === "minor" && entry.id === "115-2") nudge += 0.15;
      break;
    case "weapon":
      if (value !== "none" && (factors.includes("weapon") || factors.includes("knife") || factors.includes("gun"))) {
        nudge += 0.15;
      }
      if (value === "none" && entry.id === "109") nudge -= 0.05;
      break;
    case "accused_count":
      if (value === "multiple" && (entry.id === "191" || factors.includes("acting together"))) {
        nudge += 0.2;
      }
      break;
    case "victim_died":
      if (value === "yes" && entry.id === "103") nudge += 0.3;
      if (value === "yes" && entry.id === "109") nudge -= 0.2;
      if (value === "no" && entry.id === "109") nudge += 0.15;
      if (value === "no" && entry.id === "103") nudge -= 0.3;
      break;
    case "intent_to_kill":
      if (value === "yes" && (entry.id === "109" || entry.id === "103")) nudge += 0.15;
      if (value === "unknown" && category.includes("offences against body")) nudge += 0.02;
      break;
    default:
      break;
  }

  if (exclusions && nudge > 0) {
    // don't let a nudge push an entry the query context seems to exclude
    nudge *= 0.9;
  }

  return nudge;
}
