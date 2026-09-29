import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-saffron-600 dark:text-saffron-400">404</p>
      <h1 className="mt-2 text-2xl font-bold text-navy-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-300">
        The page you're looking for doesn't exist, or the link may be out of date.
      </p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back to Search
      </Link>
    </div>
  );
}
