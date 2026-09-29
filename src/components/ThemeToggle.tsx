import { Moon, Sun } from "lucide-react";
import type { Theme } from "../lib/storage";

export default function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800"
    >
      {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  );
}
