import { Link } from "react-router-dom";
import { APP_CONFIG } from "../data/config";

export default function Footer({ datasetCount }: { datasetCount: number }) {
  return (
    <footer className="border-t border-navy-100 bg-navy-50/50 dark:border-navy-800 dark:bg-navy-900/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-semibold text-navy-900 dark:text-white">BNS Section Finder</p>
            <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">
              Independent legal-information tool. Not an official Government of India service.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">Explore</p>
            <ul className="mt-2 space-y-1.5 text-sm text-navy-600 dark:text-navy-300">
              <li><Link to="/" className="hover:text-saffron-600 dark:hover:text-saffron-400">Search</Link></li>
              <li><Link to="/browse" className="hover:text-saffron-600 dark:hover:text-saffron-400">Browse BNS</Link></li>
              <li><Link to="/about" className="hover:text-saffron-600 dark:hover:text-saffron-400">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">Legal</p>
            <ul className="mt-2 space-y-1.5 text-sm text-navy-600 dark:text-navy-300">
              <li><Link to="/disclaimer" className="hover:text-saffron-600 dark:hover:text-saffron-400">Disclaimer</Link></li>
              <li><Link to="/privacy" className="hover:text-saffron-600 dark:hover:text-saffron-400">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-800 dark:text-navy-100">Dataset</p>
            <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">
              BNS legal dataset last verified: <span className="font-medium">{APP_CONFIG.datasetVerifiedDate}</span>
            </p>
            <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">
              {datasetCount} verified offence entries
            </p>
            <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
              Sources: India Code and Government of India / Ministry of Home Affairs.
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-navy-200 pt-6 text-xs text-navy-500 dark:border-navy-800 dark:text-navy-400">
          Accused persons are presumed innocent unless proved guilty according to law. This tool does not
          determine guilt, innocence, or the probability of conviction.
        </p>
      </div>
    </footer>
  );
}
