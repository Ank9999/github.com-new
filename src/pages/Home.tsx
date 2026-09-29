import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchX, History, Trash2, ShieldCheck } from "lucide-react";
import SearchBox from "../components/SearchBox";
import ResultCard from "../components/ResultCard";
import ClarificationPanel from "../components/ClarificationPanel";
import Disclaimer from "../components/Disclaimer";
import { BnsSearchEngine } from "../lib/searchEngine";
import { addRecentSearch, clearRecentSearches, getRecentSearches } from "../lib/storage";
import type { BnsSection, ClarificationAnswer } from "../types/legal";

const EXAMPLE_CHIPS = [
  "Theft",
  "Physical assault",
  "Criminal intimidation",
  "Fraud",
  "House breaking",
  "Kidnapping",
  "Forgery",
  "Property damage",
];

export default function Home({ dataset }: { dataset: BnsSection[] }) {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [incidentDate, setIncidentDate] = useState("");
  const [clarifications, setClarifications] = useState<ClarificationAnswer[]>([]);
  const [recent, setRecent] = useState<string[]>(() => getRecentSearches());
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  const engine = useMemo(() => new BnsSearchEngine(dataset), [dataset]);
  const suggestions = useMemo(() => engine.suggest(query), [engine, query]);

  const results = useMemo(() => {
    if (!submittedQuery.trim()) return [];
    return engine.search(submittedQuery, clarifications);
  }, [engine, submittedQuery, clarifications]);

  function handleSubmit(q: string) {
    const trimmed = q.trim();
    setHasSearched(true);
    setSubmittedQuery(trimmed);
    setParams(trimmed ? { q: trimmed } : {});
    if (trimmed) setRecent(addRecentSearch(trimmed));
  }

  function handleClearHistory() {
    clearRecentSearches();
    setRecent([]);
  }

  const showClarifications = results.length > 0;

  return (
    <div>
      <section className="bg-gradient-to-b from-navy-50 to-white px-4 py-12 dark:from-navy-900 dark:to-navy-950 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1 text-xs font-medium text-saffron-300 dark:bg-saffron-500/15 dark:text-saffron-300">
            <ShieldCheck size={14} aria-hidden="true" />
            Independent legal-information tool — not an official Government of India service
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 dark:text-white sm:text-4xl md:text-5xl">
            Understand BNS provisions in plain language.
          </h1>
          <p className="mt-4 text-base text-navy-600 dark:text-navy-300 sm:text-lg">
            Describe an alleged incident and explore potentially relevant provisions of the Bharatiya Nyaya
            Sanhita, 2023.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBox
            query={query}
            onQueryChange={setQuery}
            onSubmit={handleSubmit}
            suggestions={suggestions}
            incidentDate={incidentDate}
            onIncidentDateChange={setIncidentDate}
          />

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="chip"
                onClick={() => {
                  setQuery(chip);
                  handleSubmit(chip);
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {!hasSearched && recent.length > 0 && (
            <div className="mt-8 text-left">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-700 dark:text-navy-200">
                  <History size={16} aria-hidden="true" />
                  Recent Searches
                </p>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-saffron-600 dark:text-navy-400 dark:hover:text-saffron-400"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="chip"
                    onClick={() => {
                      setQuery(r);
                      handleSubmit(r);
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-navy-400 dark:text-navy-500">Your searches stay on this device.</p>
            </div>
          )}
        </div>
      </section>

      {hasSearched && (
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {results.length > 0 ? (
            <>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold text-navy-900 dark:text-white">
                  Potentially Applicable Provisions
                </h2>
                <p className="text-sm text-navy-500 dark:text-navy-400">
                  {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{submittedQuery}&rdquo;
                </p>
              </div>

              {showClarifications && (
                <div className="mb-6">
                  <ClarificationPanel answers={clarifications} onChange={setClarifications} />
                </div>
              )}

              <div className="space-y-5">
                {results.map((r) => (
                  <ResultCard key={r.entry.id} result={r} />
                ))}
              </div>

              <div className="mt-8">
                <Disclaimer />
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center gap-3 p-8 text-center">
              <SearchX size={32} className="text-navy-400 dark:text-navy-500" aria-hidden="true" />
              <p className="text-base font-semibold text-navy-800 dark:text-navy-100">
                No sufficiently reliable match was found from the current BNS dataset.
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-navy-600 dark:text-navy-300">
                <li>Try using more detail — describe what happened rather than a single word</li>
                <li>Check spelling, or try a Hindi/Hinglish phrase</li>
                <li>Browse BNS categories instead</li>
              </ul>
              <Link to="/browse" className="btn-secondary mt-2 text-sm">
                Browse BNS Categories
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
