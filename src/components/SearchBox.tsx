import { useId, useRef, useState } from "react";
import { Search, Calendar } from "lucide-react";
import SearchSuggestions from "./SearchSuggestions";
import { APP_CONFIG } from "../data/config";

interface SearchBoxProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (query: string) => void;
  suggestions: string[];
  incidentDate: string;
  onIncidentDateChange: (value: string) => void;
}

export default function SearchBox({
  query,
  onQueryChange,
  onSubmit,
  suggestions,
  incidentDate,
  onIncidentDateChange,
}: SearchBoxProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const isBeforeCommencement =
    incidentDate && incidentDate < APP_CONFIG.bnsCommencementDate;

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setShowSuggestions(false);
    onSubmit(query);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const value = suggestions[activeIndex];
      onQueryChange(value);
      setShowSuggestions(false);
      onSubmit(value);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <label htmlFor="bns-search-input" className="sr-only">
          Describe what happened
        </label>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 dark:text-navy-500"
          size={22}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id="bns-search-input"
          type="text"
          role="combobox"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Describe what happened..."
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setShowSuggestions(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-2xl border border-navy-200 bg-white py-4 pl-12 pr-4 text-base text-navy-900 shadow-sm placeholder:text-navy-400 focus:border-saffron-400 dark:border-navy-700 dark:bg-navy-900 dark:text-white dark:placeholder:text-navy-500 sm:py-5 sm:text-lg"
        />
        {showSuggestions && (
          <SearchSuggestions
            id={listboxId}
            suggestions={suggestions}
            activeIndex={activeIndex}
            onSelect={(value) => {
              onQueryChange(value);
              setShowSuggestions(false);
              onSubmit(value);
            }}
          />
        )}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-navy-400 dark:text-navy-500" aria-hidden="true" />
          <label htmlFor="incident-date" className="text-sm text-navy-600 dark:text-navy-300">
            Date of Incident <span className="text-navy-400">(optional)</span>
          </label>
          <input
            id="incident-date"
            type="date"
            value={incidentDate}
            onChange={(e) => onIncidentDateChange(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-navy-200 bg-white px-2.5 py-1.5 text-sm text-navy-800 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
          />
        </div>

        <button type="submit" className="btn-primary w-full sm:w-auto">
          <Search size={18} aria-hidden="true" />
          Find BNS Provisions
        </button>
      </div>

      {isBeforeCommencement && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-saffron-300 bg-saffron-50 p-3.5 text-sm text-saffron-900 dark:border-saffron-500/40 dark:bg-saffron-500/10 dark:text-saffron-200"
        >
          The incident date is before the general commencement of the Bharatiya Nyaya Sanhita on 1 July 2024.
          Earlier criminal law provisions and applicable savings/transitional rules may need to be considered.
          This tool should not automatically substitute BNS sections for earlier law.
        </div>
      )}
    </form>
  );
}
