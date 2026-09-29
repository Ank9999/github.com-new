import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { LayoutGrid, Hash, BookOpen } from "lucide-react";
import type { BnsSection } from "../types/legal";

type ViewMode = "sections" | "categories" | "chapters";

function groupBy(entries: BnsSection[], keyFn: (e: BnsSection) => string) {
  const map = new Map<string, BnsSection[]>();
  for (const e of entries) {
    const key = keyFn(e);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return map;
}

export default function Browse({ dataset }: { dataset: BnsSection[] }) {
  const [params, setParams] = useSearchParams();
  const initialView = (params.get("view") as ViewMode) || "sections";
  const [view, setView] = useState<ViewMode>(initialView);
  const [query, setQuery] = useState("");

  function changeView(v: ViewMode) {
    setView(v);
    setParams(v === "sections" ? {} : { view: v });
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return dataset;
    const q = query.toLowerCase();
    return dataset.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.section.includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [dataset, query]);

  const byCategory = useMemo(() => groupBy(filtered, (e) => e.category), [filtered]);
  const byChapter = useMemo(() => groupBy(filtered, (e) => e.chapter), [filtered]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => Number(a.section) - Number(b.section) || a.id.localeCompare(b.id)),
    [filtered]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">Browse BNS</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">
        Explore the verified offence entries in this dataset by section, chapter, or category.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2" role="tablist" aria-label="Browse view">
          <button
            role="tab"
            aria-selected={view === "sections"}
            onClick={() => changeView("sections")}
            className={`chip ${view === "sections" ? "!border-saffron-500 !bg-saffron-100 !text-saffron-800 dark:!bg-saffron-500/20" : ""}`}
          >
            <Hash size={14} aria-hidden="true" /> By Section
          </button>
          <button
            role="tab"
            aria-selected={view === "categories"}
            onClick={() => changeView("categories")}
            className={`chip ${view === "categories" ? "!border-saffron-500 !bg-saffron-100 !text-saffron-800 dark:!bg-saffron-500/20" : ""}`}
          >
            <LayoutGrid size={14} aria-hidden="true" /> By Category
          </button>
          <button
            role="tab"
            aria-selected={view === "chapters"}
            onClick={() => changeView("chapters")}
            className={`chip ${view === "chapters" ? "!border-saffron-500 !bg-saffron-100 !text-saffron-800 dark:!bg-saffron-500/20" : ""}`}
          >
            <BookOpen size={14} aria-hidden="true" /> By Chapter
          </button>
        </div>

        <label className="w-full sm:w-64">
          <span className="sr-only">Filter</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, section or category..."
            className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-white"
          />
        </label>
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-sm text-navy-500 dark:text-navy-400">No entries match that filter.</p>
      )}

      {view === "sections" && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {sorted.map((e) => (
            <SectionRow key={e.id} entry={e} />
          ))}
        </ul>
      )}

      {view === "categories" && (
        <div className="mt-6 space-y-8">
          {Array.from(byCategory.entries()).map(([category, entries]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{category}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {entries.map((e) => (
                  <SectionRow key={e.id} entry={e} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {view === "chapters" && (
        <div className="mt-6 space-y-8">
          {Array.from(byChapter.entries()).map(([chapter, entries]) => (
            <div key={chapter}>
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{chapter}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {entries.map((e) => (
                  <SectionRow key={e.id} entry={e} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionRow({ entry }: { entry: BnsSection }) {
  return (
    <li>
      <Link
        to={`/section/${entry.id}`}
        className="card block p-4 transition hover:border-saffron-400 dark:hover:border-saffron-500"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-400">
          Section {entry.section}
          {entry.subsection ? ` ${entry.subsection}` : ""}
        </p>
        <p className="mt-1 font-medium text-navy-900 dark:text-white">{entry.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-navy-500 dark:text-navy-400">{entry.official_summary}</p>
      </Link>
    </li>
  );
}
