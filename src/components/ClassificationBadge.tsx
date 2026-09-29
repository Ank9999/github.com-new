interface ClassificationBadgeProps {
  label: string;
  value: string;
}

function toneFor(label: string, value: string): string {
  const v = value.toLowerCase();
  if (label === "Cognizable") {
    if (v === "yes") return "bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-navy-100";
    if (v === "no") return "bg-navy-50 text-navy-600 dark:bg-navy-900 dark:text-navy-300";
  }
  if (label === "Bailable") {
    if (v === "yes") return "bg-green-50 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    if (v === "no") return "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  }
  return "bg-saffron-50 text-saffron-800 dark:bg-saffron-500/10 dark:text-saffron-300";
}

export default function ClassificationBadge({ label, value }: ClassificationBadgeProps) {
  return (
    <span className="flex flex-col items-start gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-navy-500 dark:text-navy-400">
        {label}
      </span>
      <span className={`badge ${toneFor(label, value)}`}>{value}</span>
    </span>
  );
}
