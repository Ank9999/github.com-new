import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ExternalLink, ScrollText, AlertTriangle } from "lucide-react";
import ClassificationBadge from "./ClassificationBadge";
import type { SearchResult } from "../types/legal";
import { highlightMatches } from "../lib/normalizer";

const STRENGTH_STYLES: Record<string, string> = {
  "Strong match": "bg-saffron-500 text-white dark:bg-saffron-500 dark:text-navy-950",
  "Possible match": "bg-navy-700 text-white dark:bg-navy-700",
  "Related provision": "bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200",
};

const FACTS_THAT_MAY_CHANGE_DEFAULT = [
  "Was a weapon used?",
  "What injury or loss occurred?",
  "What was the intention or knowledge involved?",
  "Were there aggravating circumstances (e.g. night-time, group, victim's vulnerability)?",
];

export default function ResultCard({ result }: { result: SearchResult }) {
  const [expanded, setExpanded] = useState(false);
  const { entry, matchStrength, matchedTerms, whyRelevant } = result;

  const summarySegments = highlightMatches(entry.official_summary, matchedTerms);

  return (
    <article className="card p-5 sm:p-6" aria-label={`BNS Section ${entry.section}: ${entry.title}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-400">
            BNS Section {entry.section}
            {entry.subsection ? ` ${entry.subsection}` : ""}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-navy-900 dark:text-white sm:text-xl">
            {entry.title}
          </h3>
          <p className="mt-0.5 text-xs text-navy-500 dark:text-navy-400">{entry.chapter}</p>
        </div>
        <span className={`badge ${STRENGTH_STYLES[matchStrength]}`}>
          Search Match: {matchStrength.replace(" match", "").replace("Related provision", "Related")}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">Why this may be relevant</p>
        <p className="text-sm text-navy-600 dark:text-navy-300">{whyRelevant}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">Essential Ingredients</p>
        <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-navy-600 dark:text-navy-300">
          {entry.ingredients.slice(0, 4).map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">Punishment</p>
        <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{entry.punishment}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-6 border-t border-navy-100 pt-4 dark:border-navy-800">
        <ClassificationBadge label="Cognizable" value={entry.cognizable} />
        <ClassificationBadge label="Bailable" value={entry.bailable} />
        <ClassificationBadge label="Triable by" value={entry.triable_by} />
      </div>

      <div className="mt-4 rounded-xl bg-navy-50 p-3.5 text-sm dark:bg-navy-800/50">
        <p className="flex items-center gap-1.5 font-semibold text-navy-800 dark:text-navy-100">
          <AlertTriangle size={15} className="text-saffron-600 dark:text-saffron-400" aria-hidden="true" />
          Facts that may change the result
        </p>
        <ul className="mt-1.5 list-inside list-disc space-y-1 text-navy-600 dark:text-navy-300">
          {(entry.exclusions.length > 0 ? entry.exclusions : FACTS_THAT_MAY_CHANGE_DEFAULT).map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      {entry.special_law_warning && (
        <p className="mt-3 text-xs text-navy-500 dark:text-navy-400">
          <strong>Other laws may also be relevant:</strong> {entry.special_law_warning}
        </p>
      )}

      {entry.related_sections.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">Related Provisions</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {entry.related_sections.map((sec) => (
              <Link key={sec} to={`/section/${sec}`} className="chip !py-1 text-xs">
                Section {sec.split("-")[0]}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-navy-100 pt-4 dark:border-navy-800">
        <Link to={`/section/${entry.id}`} className="btn-secondary text-sm">
          <ScrollText size={16} aria-hidden="true" />
          View legal details
        </Link>
        <a
          href={entry.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
        >
          Official Source
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="ml-auto flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-saffron-600 dark:text-navy-300 dark:hover:text-saffron-400"
        >
          {expanded ? "Hide summary" : "Quick preview"}
          <ChevronDown size={16} className={`transition ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <p className="mt-3 rounded-xl border border-navy-100 bg-white p-3.5 text-sm leading-relaxed text-navy-600 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-300">
          {summarySegments.map((seg, i) =>
            seg.matched ? <mark key={i}>{seg.text}</mark> : <span key={i}>{seg.text}</span>
          )}
        </p>
      )}
    </article>
  );
}
