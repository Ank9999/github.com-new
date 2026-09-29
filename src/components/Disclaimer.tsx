import { ShieldAlert } from "lucide-react";

export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      aria-label="Legal information disclaimer"
      className={`card flex gap-3 border-navy-200 bg-navy-50/60 p-4 text-sm text-navy-700 dark:border-navy-800 dark:bg-navy-900/60 dark:text-navy-300 ${
        compact ? "" : "sm:p-5"
      }`}
    >
      <ShieldAlert className="mt-0.5 shrink-0 text-saffron-600 dark:text-saffron-400" size={20} aria-hidden="true" />
      <div className="space-y-2">
        <p>
          <strong className="text-navy-900 dark:text-white">Legal Information Disclaimer:</strong> This tool
          provides general informational assistance based on the Bharatiya Nyaya Sanhita, 2023 and related
          official legal sources. A search result does not mean that any person is guilty or that a particular
          offence or charge legally applies. The applicable provisions depend on the complete facts, evidence,
          date of occurrence, investigation, procedural law, special/local laws, and judicial interpretation.
          Consult a qualified legal professional for advice concerning a specific matter.
        </p>
        <p className="font-medium text-navy-800 dark:text-navy-200">
          Accused persons are presumed innocent unless proved guilty according to law.
        </p>
      </div>
    </div>
  );
}
