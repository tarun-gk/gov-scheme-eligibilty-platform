import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchSchemeById } from "../api";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  FileText,
} from "lucide-react";

export default function SchemeDetails() {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadScheme() {
      try {
        const data = await fetchSchemeById(id);
        if (isMounted) {
          setScheme(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load scheme details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadScheme();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="card py-12 text-center">
        <p className="text-sm text-navy-500">Loading scheme details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card space-y-4">
        <h1 className="text-xl font-semibold text-navy-900">
          Unable to load scheme
        </h1>
        <p className="text-sm text-navy-600">{error}</p>
        <Link to="/eligibility-results" className="btn-secondary inline-flex">
          <ArrowLeft className="h-4 w-4" />
          Back to Eligibility
        </Link>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="card space-y-4">
        <h1 className="text-xl font-semibold text-navy-900">
          Scheme not found
        </h1>
        <p className="text-sm text-navy-600">
          The scheme you are looking for does not exist in the dataset.
        </p>
        <Link to="/eligibility-results" className="btn-secondary inline-flex">
          <ArrowLeft className="h-4 w-4" />
          Back to Eligibility
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-navy-500">
        <Link
          to="/eligibility-results"
          className="hover:text-navy-700 transition-colors"
        >
          Eligibility
        </Link>
        <span>/</span>
        <span className="text-navy-800 font-medium">{scheme.scheme_name}</span>
      </nav>

      {/* Header card */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              {scheme.scheme_name}
            </h1>
            <p className="mt-1 text-sm text-navy-500">
              {scheme.state} · {scheme.category}
            </p>
          </div>

          {scheme.rules_verified === 1 ? (
            <span className="badge-success">
              <CheckCircle className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : (
            <span className="badge-neutral">
              <AlertCircle className="h-3.5 w-3.5" />
              Unverified
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-navy-600">
          {scheme.benefits}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-navy-400" />
            <span className="stat-label">Min Age</span>
          </div>
          <span className="stat-value text-lg">
            {scheme.min_age ?? "Not specified"}
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-navy-400" />
            <span className="stat-label">Max Age</span>
          </div>
          <span className="stat-value text-lg">
            {scheme.max_age ?? "Not specified"}
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-navy-400" />
            <span className="stat-label">Income Max</span>
          </div>
          <span className="stat-value text-lg">
            {scheme.income_max ?? "Not specified"}
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-navy-400" />
            <span className="stat-label">Gender Allowed</span>
          </div>
          <span className="stat-value text-lg">
            {scheme.gender_allowed ?? "Any"}
          </span>
        </div>
      </div>

      {/* Eligibility & Documents */}
      {scheme.eligibility && (
        <div className="card">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-navy-400" />
            <h2 className="section-title">Eligibility Criteria</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">
            {scheme.eligibility}
          </p>
        </div>
      )}

      {scheme.documents && (
        <div className="card">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-navy-400" />
            <h2 className="section-title">Required Documents</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">
            {scheme.documents}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <a
          href={scheme.apply_link}
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
        >
          <ExternalLink className="h-4 w-4" />
          Apply Official Link
        </a>
        <Link to="/eligibility-results" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>
    </div>
  );
}
