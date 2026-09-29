import { Lock, WifiOff, UserX, Database } from "lucide-react";

const POINTS = [
  {
    icon: WifiOff,
    title: "Searches are processed locally",
    body: "All matching happens inside your browser using a bundled dataset. Your search text is never sent to a server or to any AI model.",
  },
  {
    icon: UserX,
    title: "No account required",
    body: "You can use every feature of this tool without signing up, logging in, or providing any personal information.",
  },
  {
    icon: Database,
    title: "Recent searches stay on your device",
    body: "If you use the Recent Searches feature, your search history is stored only in your browser's LocalStorage. It is never transmitted anywhere, and you can clear it at any time from the home page.",
  },
  {
    icon: Lock,
    title: "No analytics or trackers by default",
    body: "This application does not include third-party analytics, advertising, or tracking scripts by default.",
  },
];

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">Privacy</h1>
      <p className="mt-3 text-navy-600 dark:text-navy-300">
        This application is built to keep your searches private by design, not just by policy.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {POINTS.map((p) => (
          <div key={p.title} className="card p-5">
            <p.icon className="text-saffron-600 dark:text-saffron-400" size={22} aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold text-navy-900 dark:text-white">{p.title}</h2>
            <p className="mt-1.5 text-sm text-navy-600 dark:text-navy-300">{p.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-navy-500 dark:text-navy-400">
        Because this is a static application with no backend, there is no server-side log of what you search
        for. If this application is deployed on a hosting platform (such as Vercel, Netlify, or GitHub Pages),
        that platform may collect standard, anonymized web-server access logs (e.g. for security and
        reliability) independent of this application's own code — refer to that platform's own privacy policy
        for details.
      </p>
    </div>
  );
}
