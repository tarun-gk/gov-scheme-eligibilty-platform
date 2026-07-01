import { useState } from "react";
import { getRecommendedSchemes } from "../services/platformApi";
import { useUserProfile } from "../hooks/useUserProfile";
import SchemeResultCard from "../components/schemes/SchemeResultCard";
import { Sparkles, AlertCircle } from "lucide-react";

export default function RecommendedSchemes() {
  const { profile, hasProfile } = useUserProfile();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadRecommendations() {
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...(profile || {}),
        age: profile?.age === "" ? null : Number(profile?.age),
        income: profile?.income === "" ? null : Number(profile?.income),
        land_owned:
          profile?.land_owned === "" ? null : Number(profile?.land_owned),
      };

      const data = await getRecommendedSchemes(payload, 15);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Recommended Schemes</h1>
        <p className="page-subtitle">
          AI-aware ranking based on profile relevance and confidence score.
        </p>
      </div>

      {/* Action bar */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-navy-600">
            {hasProfile
              ? `Recommendations for ${profile.name || "your profile"}`
              : "Create a profile to improve ranking quality"}
          </p>
          <button
            onClick={loadRecommendations}
            disabled={loading}
            className="btn-primary"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <p className="text-sm font-medium text-navy-700">
          {results.length} scheme{results.length !== 1 ? "s" : ""} recommended
        </p>
      )}

      <div className="grid grid-cols-1 gap-4">
        {results.map((scheme) => (
          <SchemeResultCard
            key={`${scheme.schemeId}-${scheme.schemeName}`}
            scheme={scheme}
          />
        ))}
      </div>

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="card py-12 text-center">
          <p className="text-sm text-navy-500">
            Click "Get Recommendations" to view top ranked schemes.
          </p>
        </div>
      )}
    </div>
  );
}
