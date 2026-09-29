import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Scale } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import type { Theme } from "../lib/storage";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { to: "/", label: "Search", end: true },
  { to: "/browse", label: "Browse BNS" },
  { to: "/browse?view=categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/disclaimer", label: "Disclaimer" },
];

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur dark:border-navy-800 dark:bg-navy-950/90">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-navy-900 dark:text-white" aria-label="BNS Section Finder home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-saffron-400 dark:bg-saffron-500 dark:text-navy-950">
            <Scale size={18} aria-hidden="true" />
          </span>
          <span className="text-base sm:text-lg">BNS Section Finder</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-navy-900 text-white dark:bg-saffron-500 dark:text-navy-950"
                    : "text-navy-600 hover:bg-navy-50 hover:text-navy-900 dark:text-navy-300 dark:hover:bg-navy-800 dark:hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 md:hidden dark:text-navy-200 dark:hover:bg-navy-800"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-navy-100 px-4 pb-4 md:hidden dark:border-navy-800">
          <ul className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-navy-900 text-white dark:bg-saffron-500 dark:text-navy-950"
                        : "text-navy-700 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
