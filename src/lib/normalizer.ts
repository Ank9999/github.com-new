// Text normalization helpers shared by the search engine and suggestions.
// Everything here runs synchronously, client-side, with no network calls.

/** Lowercase, strip punctuation, and collapse whitespace. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // strip punctuation, keep unicode letters/digits (incl. Devanagari)
    .replace(/\s+/g, " ")
    .trim();
}

/** Simple English stopwords worth down-weighting (not removed outright, to preserve short queries). */
export const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "my",
  "me",
  "i",
  "he",
  "she",
  "they",
  "someone",
  "somebody",
  "person",
  "is",
  "was",
  "were",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "and",
  "or",
  "with",
  "from",
]);

export function tokenize(input: string): string[] {
  return normalizeText(input)
    .split(" ")
    .filter((tok) => tok.length > 0);
}

export function significantTokens(input: string): string[] {
  return tokenize(input).filter((tok) => !STOPWORDS.has(tok));
}

/** Highlights occurrences of any of `terms` inside `text`, returning HTML-safe React-renderable segments. */
export interface HighlightSegment {
  text: string;
  matched: boolean;
}

export function highlightMatches(text: string, terms: string[]): HighlightSegment[] {
  const cleanTerms = terms
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
    .sort((a, b) => b.length - a.length);

  if (cleanTerms.length === 0) return [{ text, matched: false }];

  const pattern = new RegExp(
    `(${cleanTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );

  const parts = text.split(pattern);
  return parts
    .filter((p) => p.length > 0)
    .map((part) => ({
      text: part,
      matched: cleanTerms.some((t) => t.toLowerCase() === part.toLowerCase()),
    }));
}
