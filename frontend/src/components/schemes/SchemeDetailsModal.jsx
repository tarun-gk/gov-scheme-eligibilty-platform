import VerifiedBadge from "./VerifiedBadge";
import { X, ExternalLink } from "lucide-react";

export default function SchemeDetailsModal({ scheme, onClose }) {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-navy-200 bg-white shadow-elevated">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-navy-200 p-5">
          <div>
            <h2 className="text-xl font-bold text-navy-900">
              {scheme.scheme_name}
            </h2>
            <p className="mt-1 text-sm text-navy-500">
              {scheme.state} · {scheme.category}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-navy-400 hover:bg-navy-100 hover:text-navy-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between">
            <VerifiedBadge verified={scheme.rules_verified === 1} />
            <p className="text-xs text-navy-500">
              {scheme.rules_verified === 1
                ? `Source: ${scheme.rule_source}`
                : "Rules not verified yet"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-800">Eligibility</h3>
            <p className="mt-1 text-sm leading-relaxed text-navy-600">
              {scheme.eligibility}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-800">Benefits</h3>
            <p className="mt-1 text-sm leading-relaxed text-navy-600">
              {scheme.benefits}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-800">Documents</h3>
            <p className="mt-1 text-sm leading-relaxed text-navy-600">
              {scheme.documents || "Not specified"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="stat-card py-3">
              <span className="stat-label text-xs">Min Age</span>
              <span className="stat-value text-base">
                {scheme.min_age ?? "N/A"}
              </span>
            </div>
            <div className="stat-card py-3">
              <span className="stat-label text-xs">Max Age</span>
              <span className="stat-value text-base">
                {scheme.max_age ?? "N/A"}
              </span>
            </div>
            <div className="stat-card py-3">
              <span className="stat-label text-xs">Income Max</span>
              <span className="stat-value text-base">
                {scheme.income_max ?? "N/A"}
              </span>
            </div>
            <div className="stat-card py-3">
              <span className="stat-label text-xs">Gender</span>
              <span className="stat-value text-base">
                {scheme.gender_allowed}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
            <a
              href={scheme.apply_link}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <ExternalLink className="h-4 w-4" />
              Open Apply Link
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
