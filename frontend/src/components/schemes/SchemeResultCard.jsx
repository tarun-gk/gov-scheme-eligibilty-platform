import { ExternalLink } from "lucide-react";

export default function SchemeResultCard({ scheme }) {
  const rawScore = scheme?.finalScore ?? 0;
  const score = Number.isFinite(Number(rawScore)) ? Number(rawScore) : 0;

  const statusConfig =
    scheme?.eligibilityStatus === "Eligible"
      ? { className: "badge-success", label: "Eligible" }
      : scheme?.eligibilityStatus === "Possibly Eligible"
        ? { className: "badge-warning", label: "Possibly Eligible" }
        : scheme?.eligibilityStatus === "Not Eligible"
          ? { className: "badge-danger", label: "Not Eligible" }
          : { className: "badge-neutral", label: scheme?.eligibilityStatus || "Unknown" };

  const barColor =
    scheme?.eligibilityStatus === "Eligible"
      ? "bg-emerald-500"
      : scheme?.eligibilityStatus === "Possibly Eligible"
        ? "bg-amber-500"
        : scheme?.eligibilityStatus === "Not Eligible"
          ? "bg-red-500"
          : "bg-navy-400";

  return (
    <div className="card-hover">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-navy-900">
          {scheme.name}
        </h3>
        <span className={statusConfig.className}>{statusConfig.label}</span>
      </div>

      {/* Score bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-navy-500">
            Match Score
          </span>
          <span className="font-semibold text-navy-700">{score}%</span>
        </div>
        <div className="h-2 rounded-full bg-navy-100">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          />
        </div>
      </div>

      {/* Reason */}
      <p className="mt-4 text-sm leading-relaxed text-navy-600">
        {scheme.explanation?.summary || "No explanation available"}
      </p>

      {scheme.readiness && (
        <div className="mt-3 rounded-md border border-brand-200 bg-brand-50 p-3">
          <p className="text-sm font-medium text-navy-700">
            Document Readiness: {scheme.readiness.readinessScore}%
          </p>
          {scheme.readiness.missingDocuments?.length > 0 && (
            <p className="mt-1 text-xs text-navy-600">
              Missing: {scheme.readiness.missingDocuments.join(", ")}
            </p>
          )}
        </div>
      )}

      {scheme.prediction && (
        <div className="mt-3 rounded-md border border-navy-200 bg-white p-3">
          <p className="text-xs text-navy-700">
            Predicted eligibility in {scheme.prediction.predictedEligibleInMonths} month(s)
          </p>
        </div>
      )}

      {Array.isArray(scheme.explanation?.citations) &&
        scheme.explanation.citations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scheme.explanation.citations.map((citation) => (
              <span key={`${citation.field}-${citation.snippet}`} className="badge-neutral" title={citation.snippet}>
                {citation.field}
              </span>
            ))}
          </div>
        )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
        {scheme.official_link && (
          <a
            href={scheme.official_link}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Apply Link
          </a>
        )}
      </div>
    </div>
  );
}
