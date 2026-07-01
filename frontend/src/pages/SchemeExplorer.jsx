import { useState } from "react";
import {
  explainScheme,
  fetchSchemes,
  searchSchemes,
} from "../services/platformApi";
import { useUserProfile } from "../hooks/useUserProfile";
import { Search, ExternalLink, MessageSquare } from "lucide-react";

export default function SchemeExplorer() {
  const { profile } = useUserProfile();
  const [query, setQuery] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");

  async function runSearch(event) {
    event?.preventDefault();
    setLoading(true);
    setExplanation("");

    try {
      const data = query.trim()
        ? await searchSchemes(query)
        : await fetchSchemes();
      setSchemes(Array.isArray(data) ? data.slice(0, 50) : []);
    } catch (error) {
      setExplanation(error.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleExplain(schemeId) {
    try {
      const response = await explainScheme(schemeId, profile || {});
      setExplanation(response?.explanation || "No explanation available");
    } catch (error) {
      setExplanation(error.message || "Failed to explain scheme");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Scheme Explorer</h1>
        <p className="page-subtitle">
          Search by intent — find schemes for farmers, students, entrepreneurs,
          and more.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={runSearch} className="card">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input pl-10"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Explanation */}
      {explanation && (
        <div className="card border-brand-200 bg-brand-50">
          <p className="text-sm leading-relaxed text-navy-700">{explanation}</p>
        </div>
      )}

      {/* Results count */}
      {schemes.length > 0 && (
        <p className="text-sm font-medium text-navy-600">
          {schemes.length} scheme{schemes.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {schemes.map((scheme) => (
          <article
            key={scheme.scheme_id || scheme.id}
            className="card-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-navy-900">
                  {scheme.scheme_name || scheme.name}
                </h3>
                <span className="badge-neutral shrink-0">
                  {scheme.state || "Unknown"}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-navy-600">
                {scheme.eligibility || scheme.description || "No description"}
              </p>
            </div>

            <div className="mt-4 flex gap-2 border-t border-navy-100 pt-4">
              <button
                onClick={() => handleExplain(scheme.scheme_id || scheme.id)}
                className="btn-secondary text-xs"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Explain
              </button>
              <a
                href={scheme.apply_link || scheme.official_link || "#"}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Apply
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
