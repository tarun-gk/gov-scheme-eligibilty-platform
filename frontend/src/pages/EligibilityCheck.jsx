import { useEffect, useMemo, useState } from "react";
import SchemeCard from "../components/schemes/SchemeCard";
import SchemeDetailsModal from "../components/schemes/SchemeDetailsModal";
import { fetchSchemes } from "../api";
import { Search } from "lucide-react";

export default function EligibilityCheck() {
  const [state, setState] = useState("Telangana");
  const [age, setAge] = useState(24);
  const [income, setIncome] = useState(150000);
  const [gender, setGender] = useState("Male");

  const [search, setSearch] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);

  const [selectedScheme, setSelectedScheme] = useState(null);

  // backend data
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchemes()
      .then((data) => setSchemes(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return schemes
      .filter((s) => s.state === state)
      .filter((s) => (onlyVerified ? s.rules_verified === 1 : true))
      .filter((s) =>
        (s.scheme_name || "").toLowerCase().includes(search.toLowerCase())
      )
      .filter((s) => (s.min_age == null ? true : age >= s.min_age))
      .filter((s) => (s.max_age == null ? true : age <= s.max_age))
      .filter((s) => (s.income_max == null ? true : income <= s.income_max))
      .filter((s) =>
        s.gender_allowed === "Any" ? true : s.gender_allowed === gender
      );
  }, [schemes, state, onlyVerified, search, age, income, gender]);

  if (loading) {
    return (
      <div className="card py-12 text-center">
        <p className="text-sm text-navy-500">Loading schemes from backend…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card py-12 text-center">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Eligibility Check</h1>
        <p className="page-subtitle">
          Filter schemes using eligibility inputs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT: Inputs */}
        <div className="card space-y-5">
          <h2 className="section-title">User Eligibility Inputs</h2>

          <div>
            <label className="label">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="select mt-1.5"
            >
              <option value="Telangana">Telangana</option>
              <option value="Central">Central</option>
            </select>
          </div>

          <div>
            <label className="label">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="input mt-1.5"
            />
          </div>

          <div>
            <label className="label">Annual Income (Rs)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="input mt-1.5"
            />
          </div>

          <div>
            <label className="label">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="select mt-1.5"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="section-title">Matching Schemes</h2>
            <p className="text-sm text-navy-500">
              Results:{" "}
              <span className="font-semibold text-navy-800">
                {filtered.length}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-navy-600">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded border-navy-300"
              />
              Only Verified
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filtered.map((scheme) => (
              <SchemeCard
                key={scheme.scheme_id}
                scheme={scheme}
                onViewDetails={setSelectedScheme}
              />
            ))}

            {filtered.length === 0 && (
              <div className="card py-12 text-center">
                <p className="text-sm text-navy-500">
                  No schemes match the selected eligibility filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SchemeDetailsModal
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
      />
    </div>
  );
}
