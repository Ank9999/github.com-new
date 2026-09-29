import Disclaimer from "../components/Disclaimer";

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">Disclaimer</h1>

      <div className="mt-6">
        <Disclaimer />
      </div>

      <div className="prose prose-navy mt-8 max-w-none space-y-4 text-navy-700 dark:text-navy-200">
        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">Responsible use of this tool</h2>
        <p>
          BNS Section Finder is a statute-discovery and legal-information tool. It surfaces{" "}
          <strong>potentially applicable</strong> provisions of the Bharatiya Nyaya Sanhita, 2023 based on a
          plain-language description you provide. It does not, and cannot, determine:
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>Guilt or innocence of any person</li>
          <li>The credibility of any account of events</li>
          <li>Intent, knowledge, or any other mental element as an established fact</li>
          <li>The probability of a conviction</li>
          <li>The sentence a court would impose in any individual case</li>
        </ul>
        <p>
          A search result reflects information-retrieval relevance — how closely your description matches the
          language and legal ingredients of a provision in the dataset — not legal certainty. The complete
          facts, the evidence available, the date of occurrence, the investigation, applicable procedural and
          special/local laws, and judicial interpretation all determine which provisions actually apply in a
          real matter.
        </p>
        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">Date-of-incident handling</h2>
        <p>
          The Bharatiya Nyaya Sanhita generally came into force on 1 July 2024, subject to the commencement
          notification and applicable exceptions/savings. If an incident occurred before that date, earlier
          criminal law (the Indian Penal Code, 1860, and related procedural law) and applicable savings or
          transitional rules may need to be considered instead. This tool does not automatically translate an
          IPC provision into a BNS section, or vice versa, without verified mapping.
        </p>
        <h2 className="text-lg font-semibold text-navy-900 dark:text-white">Get qualified help</h2>
        <p>
          For any specific matter, consult a qualified legal professional, or contact the police / relevant
          authorities. Accused persons are presumed innocent unless proved guilty according to law.
        </p>
      </div>
    </div>
  );
}
