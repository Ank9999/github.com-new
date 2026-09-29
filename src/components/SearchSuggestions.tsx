interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (value: string) => void;
  activeIndex?: number;
  id: string;
}

export default function SearchSuggestions({ suggestions, onSelect, activeIndex = -1, id }: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <ul
      id={id}
      role="listbox"
      className="card absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto py-2 shadow-lg"
    >
      {suggestions.map((s, i) => (
        <li key={s} role="option" aria-selected={i === activeIndex}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(s);
            }}
            className={`block w-full px-4 py-2.5 text-left text-sm ${
              i === activeIndex
                ? "bg-navy-50 text-navy-900 dark:bg-navy-800 dark:text-white"
                : "text-navy-700 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800"
            }`}
          >
            {s}
          </button>
        </li>
      ))}
    </ul>
  );
}
