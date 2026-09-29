import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import ClassificationBadge from "../components/ClassificationBadge";
import Disclaimer from "../components/Disclaimer";
import type { BnsSection } from "../types/legal";

function toClipboardText(entry: BnsSection): string {
  return [
    `BNS Section ${entry.section}${entry.subsection ? " " + entry.subsection : ""} — ${entry.title}`,
    `Chapter: ${entry.chapter}`,
    "",
    entry.official_summary,
    "",
    "Essential Ingredients:",
    ...entry.ingredients.map((i) => `- ${i}`),
    "",
    `Punishment: ${entry.punishment}`,
    "",
    `Cognizable: ${entry.cognizable} | Bailable: ${entry.bailable} | Triable by: ${entry.triable_by}`,
    "",
    `Source: ${entry.source} (${entry.source_url})`,
    `Last verified: ${entry.verified_date}`,
    "",
    "This is general legal information, not a determination of guilt. Consult a qualified legal professional for advice on a specific matter.",
  ].join("\n");
}

export default function SectionDetail({ dataset }: { dataset: BnsSection[] }) {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const entry = dataset.find((e) => e.id === id || e.section === id);

  if (!entry) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-navy-900 dark:text-white">Section not found</h1>
        <p className="mt-2 text-navy-600 dark:text-navy-300">
          This section isn&apos;t in the current verified dataset. It may not have been added yet, or the
          identifier may be incorrect.
        </p>
        <Link to="/browse" className="btn-secondary mt-5 inline-flex text-sm">
          <ArrowLeft size={16} aria-hidden="true" /> Back to Browse
        </Link>
      </div>
    );
  }

  const related = entry.related_sections
    .map((sec) => dataset.find((e) => e.id === sec || e.section === sec))
    .filter((e): e is BnsSection => Boolean(e));

  // Capture the narrowed (non-undefined) entry so the closure below keeps it.
  const currentEntry: BnsSection = entry;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(toClipboardText(currentEntry));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — ignore silently.
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-saffron-600 dark:text-navy-400 dark:hover:text-saffron-400">
        <ArrowLeft size={15} aria-hidden="true" /> Back to Browse
      </Link>

      <article className="card mt-4 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-400">
          BNS Section {entry.section}
          {entry.subsection ? ` ${entry.subsection}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">{entry.title}</h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{entry.chapter}</p>

        <p className="mt-5 leading-relaxed text-navy-700 dark:text-navy-200">{entry.official_summary}</p>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-navy-800 dark:text-navy-100">Essential Ingredients</h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-navy-600 dark:text-navy-300">
            {entry.ingredients.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-navy-800 dark:text-navy-100">Punishment</h2>
          <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">{entry.punishment}</p>
        </section>

        <section className="mt-6 flex flex-wrap gap-8 border-y border-navy-100 py-5 dark:border-navy-800">
          <ClassificationBadge label="Cognizable" value={entry.cognizable} />
          <ClassificationBadge label="Bailable" value={entry.bailable} />
          <ClassificationBadge label="Triable by" value={entry.triable_by} />
        </section>
        {entry.classification_note && (
          <p className="mt-3 text-xs text-navy-500 dark:text-navy-400">{entry.classification_note}</p>
        )}

        {entry.aggravating_factors.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-navy-800 dark:text-navy-100">Aggravating Factors</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-navy-600 dark:text-navy-300">
              {entry.aggravating_factors.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        {entry.exclusions.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-navy-800 dark:text-navy-100">Facts That May Change the Result</h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-navy-600 dark:text-navy-300">
              {entry.exclusions.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        {entry.special_law_warning && (
          <p className="mt-6 rounded-xl bg-navy-50 p-3.5 text-sm text-navy-600 dark:bg-navy-800/50 dark:text-navy-300">
            <strong className="text-navy-800 dark:text-navy-100">Other laws may also be relevant: </strong>
            {entry.special_law_warning}
          </p>
        )}

        {related.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-navy-800 dark:text-navy-100">Related Sections</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {related.map((r) => (
                <Link key={r.id} to={`/section/${r.id}`} className="chip text-xs">
                  Section {r.section} — {r.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-navy-100 pt-5 dark:border-navy-800">
          <button type="button" onClick={handleCopy} className="btn-secondary text-sm">
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied ? "Copied" : "Copy Section"}
          </button>
          <a href={entry.source_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
            Official Source
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <p className="ml-auto text-xs text-navy-400 dark:text-navy-500">
            Last verified: {entry.verified_date} · {entry.source}
          </p>
        </div>
      </article>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}
