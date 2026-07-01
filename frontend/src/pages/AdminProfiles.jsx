import { useState } from "react";
import {
  deleteAdminProfile,
  fetchAdminProfiles,
  fetchAdminProfileStats,
} from "../services/platformApi";
import {
  Shield,
  LogOut,
  RefreshCw,
  Trash2,
  Users,
  BarChart3,
  FileCheck,
  Lock,
} from "lucide-react";

const ADMIN_KEY_STORAGE = "gov_scheme_admin_key";

export default function AdminProfiles() {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem(ADMIN_KEY_STORAGE) || ""
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(sessionStorage.getItem(ADMIN_KEY_STORAGE))
  );
  const [stats, setStats] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAdminData(key = adminKey) {
    setLoading(true);
    setMessage("");

    try {
      const [statsResponse, profilesResponse] = await Promise.all([
        fetchAdminProfileStats(key),
        fetchAdminProfiles(key, { limit: 100, offset: 0 }),
      ]);

      setStats(statsResponse);
      setProfiles(Array.isArray(profilesResponse) ? profilesResponse : []);
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    } catch (error) {
      setMessage(error.message || "Admin access denied");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!adminKey.trim()) {
      setMessage("Admin key is required");
      return;
    }
    await loadAdminData(adminKey.trim());
  }

  async function handleDelete(profileId) {
    const confirmed = window.confirm(
      `Delete profile ${profileId}? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminProfile(adminKey, profileId);
      await loadAdminData(adminKey);
      setMessage(`Profile ${profileId} deleted.`);
    } catch (error) {
      setMessage(error.message || "Delete failed");
    }
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    setIsAuthenticated(false);
    setAdminKey("");
    setProfiles([]);
    setStats(null);
    setMessage("Logged out from admin panel.");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">
          Secure panel for managing user profiles and system records.
        </p>
      </div>

      {!isAuthenticated ? (
        /* Login */
        <form onSubmit={handleLogin} className="card max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100 text-navy-600">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-900">
                Authentication Required
              </p>
              <p className="text-xs text-navy-500">
                Enter admin key to access the panel
              </p>
            </div>
          </div>

          <div>
            <label className="label">Admin Key</label>
            <input
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              className="input mt-1.5"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            <Shield className="h-4 w-4" />
            {loading ? "Verifying..." : "Access Admin Panel"}
          </button>
        </form>
      ) : (
        <>
          {/* Admin toolbar */}
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-navy-700">
                  Authenticated as admin
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadAdminData(adminKey)}
                  className="btn-secondary text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </button>
                <button onClick={logout} className="btn-secondary text-xs">
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                icon={Users}
                label="Total Profiles"
                value={stats.totalProfiles}
              />
              <StatCard
                icon={BarChart3}
                label="Total Users"
                value={stats.totalUsers}
              />
              <StatCard
                icon={FileCheck}
                label="Eligibility Results"
                value={stats.totalEligibilityResults}
              />
            </div>
          )}

          {/* Profiles table */}
          <div className="overflow-x-auto rounded-lg border border-navy-200 bg-white shadow-card">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-200 bg-navy-800 text-navy-100">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-4 py-3 font-semibold">Occupation</th>
                  <th className="px-4 py-3 font-semibold">Income</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile, index) => (
                  <tr
                    key={profile.id}
                    className={`border-b border-navy-100 last:border-b-0 ${index % 2 === 0 ? "bg-white" : "bg-navy-50/50"
                      }`}
                  >
                    <td className="px-4 py-3 font-medium text-navy-800">
                      {profile.id}
                    </td>
                    <td className="px-4 py-3 text-navy-700">
                      {profile.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-navy-600">
                      {profile.state || "—"}
                    </td>
                    <td className="px-4 py-3 text-navy-600">
                      {profile.occupation || "—"}
                    </td>
                    <td className="px-4 py-3 text-navy-600">
                      {profile.income ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-navy-500">
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="btn-danger text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Message */}
      {message && (
        <p
          className={`text-sm ${message.includes("deleted") || message.includes("Logged out")
              ? "text-navy-600"
              : "text-red-600"
            }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-navy-400" />
        <span className="stat-label">{label}</span>
      </div>
      <span className="stat-value">{value ?? 0}</span>
    </div>
  );
}
