import { useEffect, useState } from "react";
import {
  checkEligibility,
  optimizeBenefits,
  fetchUserProfileById,
} from "../services/platformApi";
import { useUserProfile } from "../hooks/useUserProfile";
import SchemeResultCard from "../components/schemes/SchemeResultCard";
import { Play, User, AlertCircle } from "lucide-react";

export default function EligibilityResults() {
  const { profile, hasProfile, clearProfile } = useUserProfile();
  const [results, setResults] = useState([]);
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function validateProfile() {
      if (!profile?.profileId) {
        return;
      }

      try {
        const existingProfile = await fetchUserProfileById(profile.profileId);
        if (active && !existingProfile) {
          clearProfile();
          setResults([]);
          setError(
            "Your saved profile was removed by admin. Please create profile again."
          );
        }
      } catch {
        // Silently ignore
      }
    }

    validateProfile();

    return () => {
      active = false;
    };
  }, [profile?.profileId, clearProfile]);

  async function runEligibilityCheck() {
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...(profile || {}),
        age: profile?.age === "" ? null : Number(profile?.age),
        income: profile?.income === "" ? null : Number(profile?.income),
        land_owned:
          profile?.land_owned === "" ? null : Number(profile?.land_owned),
        userId: profile?.userId || null,
        profileId: profile?.profileId || null,
      };

      const data = await checkEligibility(payload);
      const normalizedResults = Array.isArray(data?.results) ? data.results : [];
      setResults(normalizedResults);

      const optimized = await optimizeBenefits(payload);
      setOptimization(optimized);
    } catch (err) {
      setError(err.message || "Failed to evaluate eligibility");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Eligibility Results</h1>
        <p className="page-subtitle">
          Run structured + keyword + AI eligibility analysis for all schemes.
        </p>
      </div>

      {/* Profile summary + action */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-100 text-navy-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-900">
                {hasProfile
                  ? profile.name || "User"
                  : "No profile found"}
              </p>
              <p className="text-xs text-navy-500">
                {hasProfile
                  ? `${profile.state || "State not set"} · ${profile.occupation || "Occupation not set"
                  }`
                  : "Create a profile to run eligibility checks"}
              </p>
            </div>
          </div>

          <button
            onClick={runEligibilityCheck}
            disabled={loading || !profile}
            className="btn-primary"
          >
            <Play className="h-4 w-4" />
            {loading ? "Evaluating..." : "Run Eligibility Check"}
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
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-navy-700">
            {results.length} scheme{results.length !== 1 ? "s" : ""} evaluated
          </p>
        </div>
      )}

      {optimization && (
        <div className="card">
          <h2 className="text-base font-semibold text-navy-900">Benefit Optimization</h2>
          <p className="mt-1 text-sm text-navy-600">
            Estimated combined benefit: INR {Number(optimization.totalEstimatedBenefit || 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-sm text-navy-600">
            Selected schemes: {optimization.selectedSchemes?.length || 0} of {optimization.totalSchemesConsidered || 0}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {results.map((scheme) => (
          <SchemeResultCard
            key={`${scheme.id}-${scheme.name}`}
            scheme={scheme}
          />
        ))}
      </div>

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="card py-12 text-center">
          <p className="text-sm text-navy-500">
            Run eligibility check to view confidence-scored scheme cards.
          </p>
        </div>
      )}
    </div>
  );
}
