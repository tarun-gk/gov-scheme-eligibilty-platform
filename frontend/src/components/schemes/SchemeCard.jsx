import { Link } from "react-router-dom";
import VerifiedBadge from "./VerifiedBadge";
import { ExternalLink, ArrowRight } from "lucide-react";

export default function SchemeCard({ scheme }) {
  return (
    <div className="card-hover flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-navy-900">
            {scheme.scheme_name}
          </h3>
          <VerifiedBadge verified={scheme.rules_verified === 1} />
        </div>

        <p className="mt-1 text-xs text-navy-500">
          {scheme.state} · {scheme.category}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-navy-600">
          {scheme.benefits}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-4">
        <Link
          to={`/schemes/${scheme.scheme_id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800 transition-colors"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <a
          href={scheme.apply_link}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary text-xs"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Apply
        </a>
      </div>
    </div>
  );
}
