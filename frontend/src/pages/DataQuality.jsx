import { useEffect, useState } from "react";
import { fetchSchemes } from "../api";
import { Database, CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function DataQuality() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSchemes() {
      try {
        const data = await fetchSchemes();
        if (isMounted) {
          setSchemes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load data quality metrics");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSchemes();

    return () => {
      isMounted = false;
    };
  }, []);

  const total = schemes.length;
  const verified = schemes.filter(
    (s) => Number(s.rules_verified) === 1
  ).length;
  const unverified = total - verified;

  if (loading) {
    return (
      <div className="card py-12 text-center">
        <p className="text-sm text-navy-500">
          Loading data quality metrics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card space-y-2">
        <h1 className="text-xl font-semibold text-navy-900">
          Data load failed
        </h1>
        <p className="text-sm text-navy-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Data Quality Dashboard</h1>
        <p className="page-subtitle">
          Shows how many schemes have verified rule sources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-navy-400" />
            <span className="stat-label">Total Schemes</span>
          </div>
          <span className="stat-value">{total}</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="stat-label">Verified Schemes</span>
          </div>
          <span className="stat-value">{verified}</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="stat-label">Unverified Schemes</span>
          </div>
          <span className="stat-value">{unverified}</span>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-navy-400" />
          <h2 className="section-title">Why this matters</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-navy-600">
          Verified schemes contain structured eligibility rules and official
          sources, making recommendations more reliable and reducing incorrect
          matches.
        </p>
      </div>
    </div>
  );
}
