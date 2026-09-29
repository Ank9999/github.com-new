import { Link } from "react-router-dom";
import { APP_CONFIG } from "../data/config";

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">About BNS Section Finder</h1>

      <div className="prose prose-navy mt-6 max-w-none space-y-5 text-navy-700 dark:text-navy-200">
        <p>
          BNS Section Finder is an independent, statute-discovery tool for the Bharatiya Nyaya Sanhita, 2023
          (BNS) — India&apos;s primary criminal code, which replaced the Indian Penal Code, 1860. It helps
          people describe an alleged incident in plain language and explore which BNS provisions may
          potentially be relevant.
        </p>

        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">What this tool does</h2>
        <p>
          It runs a local, client-side search over a curated dataset of BNS offence provisions, matching your
          description against offence titles, statutory ingredients, keywords, and common English, Hindi, and
          Hinglish phrasings. It returns a ranked list of <strong>potentially applicable provisions</strong>,
          each with the information needed to understand it: the official summary, essential ingredients,
          punishment, classification (cognizable/bailable/triable court, from the BNSS First Schedule), and
          facts that could change which provision actually applies.
        </p>

        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">What this tool is not</h2>
        <p>
          It is not a legal advice service, a guilt-determination tool, or a substitute for a lawyer, the
          police, or a court. It never states that a person is guilty, and it never estimates a probability of
          conviction. Final charging decisions depend on the complete facts, investigation, applicable special
          laws, and judicial determination — see the <Link className="text-saffron-600 underline dark:text-saffron-400" to="/disclaimer">Disclaimer</Link> for details.
        </p>

        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">Data sources</h2>
        <p>Legal data is drawn from official and authoritative sources, including:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <a className="text-saffron-600 underline dark:text-saffron-400" href={APP_CONFIG.sources.indiaCode.url} target="_blank" rel="noopener noreferrer">
              {APP_CONFIG.sources.indiaCode.label}
            </a>
          </li>
          <li>
            <a className="text-saffron-600 underline dark:text-saffron-400" href={APP_CONFIG.sources.mha.url} target="_blank" rel="noopener noreferrer">
              {APP_CONFIG.sources.mha.label}
            </a>
          </li>
          <li>
            <a className="text-saffron-600 underline dark:text-saffron-400" href={APP_CONFIG.sources.bnss.url} target="_blank" rel="noopener noreferrer">
              {APP_CONFIG.sources.bnss.label}
            </a>{" "}
            (for cognizable/bailable/triable-court classification)
          </li>
        </ul>
        <p>
          The dataset currently covers a curated set of commonly searched offences rather than the full BNS
          (358 sections). Every entry that passes automated data-quality validation is marked verified; a
          record that fails validation is excluded from search rather than shown with missing or fabricated
          information. See the README in the project source for the data-update and verification process.
        </p>

        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">How it works technically</h2>
        <p>
          This is a fully static, client-side application. Your search text never leaves your device — there
          is no backend, no AI model call, and no account. See the <Link className="text-saffron-600 underline dark:text-saffron-400" to="/privacy">Privacy</Link> page for details.
        </p>
      </div>
    </div>
  );
}
