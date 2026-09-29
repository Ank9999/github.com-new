import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import SectionDetail from "./pages/SectionDetail";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import DisclaimerPage from "./pages/DisclaimerPage";
import NotFound from "./pages/NotFound";
import { getStoredTheme, setStoredTheme, type Theme } from "./lib/storage";
import rawData from "./data/bns_sections.json";
import { validateDataset, getVerifiedEntries } from "./lib/dataValidation";
import type { BnsSection } from "./types/legal";

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = getStoredTheme();
    if (stored) return stored;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Data quality gate (spec §26): validate once, log a report in dev, and
  // only ever serve entries that pass validation to the rest of the app.
  const entries = rawData as BnsSection[];
  const verifiedEntries = getVerifiedEntries(entries);

  if (import.meta.env.DEV) {
    const report = validateDataset(entries);
    if (report.issues.length > 0) {
      // eslint-disable-next-line no-console
      console.table(report.issues);
      // eslint-disable-next-line no-console
      console.info(
        `BNS dataset validation: ${report.validRecords}/${report.totalRecords} records passed.`
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-navy-900 dark:bg-navy-950 dark:text-navy-50">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<Home dataset={verifiedEntries} />} />
          <Route path="/browse" element={<Browse dataset={verifiedEntries} />} />
          <Route path="/section/:id" element={<SectionDetail dataset={verifiedEntries} />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer datasetCount={verifiedEntries.length} />
    </div>
  );
}
