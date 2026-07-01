import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUserProfile } from "../hooks/useUserProfile";
import { fetchUserProfileById } from "../services/platformApi";
import { Search, Plus, Edit, Play, Info } from "lucide-react";

function toSearchable(profile = {}) {
  return [
    profile.name,
    profile.state,
    profile.occupation,
    profile.gender,
    profile.caste_category,
    profile.profileId,
    profile.userId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileManager() {
  const { profiles, activeProfileId, setProfiles, selectProfile } =
    useUserProfile();
  const [query, setQuery] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  const filteredProfiles = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) {
      return profiles;
    }

    return profiles.filter((profile) =>
      toSearchable(profile).includes(searchTerm)
    );
  }, [profiles, query]);

  useEffect(() => {
    let active = true;

    async function syncDeletedProfiles() {
      const profilesWithServerIds = profiles.filter(
        (profile) => profile.profileId
      );
      if (profilesWithServerIds.length === 0) {
        if (active) setSyncMessage("");
        return;
      }

      const checks = await Promise.all(
        profilesWithServerIds.map(async (profile) => {
          try {
            const existing = await fetchUserProfileById(profile.profileId);
            return {
              localProfileId: profile.localProfileId,
              exists: Boolean(existing),
            };
          } catch {
            return {
              localProfileId: profile.localProfileId,
              exists: true,
            };
          }
        })
      );

      const missingIds = new Set(
        checks
          .filter((item) => !item.exists)
          .map((item) => item.localProfileId)
      );

      if (missingIds.size === 0) {
        if (active) setSyncMessage("");
        return;
      }

      setProfiles((current) =>
        current.filter((profile) => !missingIds.has(profile.localProfileId))
      );

      if (active) {
        setSyncMessage(
          `${missingIds.size} deleted user profile(s) were removed from local users.`
        );
      }
    }

    syncDeletedProfiles();

    return () => {
      active = false;
    };
  }, [profiles]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="page-header flex-1 border-none pb-0">
          <h1 className="page-title">User Manager</h1>
          <p className="page-subtitle">
            Search users and switch active user for eligibility,
            recommendations, and AI tools.
          </p>
        </div>

        <Link to="/profile" className="btn-primary">
          <Plus className="h-4 w-4" />
          Create User
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1">
            <label className="label">Search Users</label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <p className="pb-2 text-sm text-navy-500">
            Showing {filteredProfiles.length} of {profiles.length} users
          </p>
        </div>
      </div>

      {/* Sync message */}
      {syncMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="h-5 w-5 shrink-0 text-blue-500" />
          <p className="text-sm text-blue-700">{syncMessage}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-navy-200 bg-white shadow-card">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-navy-200 bg-navy-800 text-navy-100">
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">State</th>
              <th className="px-4 py-3 font-semibold">Occupation</th>
              <th className="px-4 py-3 font-semibold">Profile ID</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfiles.length === 0 && (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm text-navy-500"
                  colSpan={6}
                >
                  No users found. Use "Create User" to add one.
                </td>
              </tr>
            )}
            {filteredProfiles.map((profile, index) => {
              const isActive = profile.localProfileId === activeProfileId;
              return (
                <tr
                  key={profile.localProfileId}
                  className={`border-b border-navy-100 last:border-b-0 ${index % 2 === 0 ? "bg-white" : "bg-navy-50/50"
                    }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-700">
                        {getInitials(profile.name)}
                      </div>
                      <span className="font-medium text-navy-800">
                        {profile.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-navy-600">
                    {profile.state || "—"}
                  </td>
                  <td className="px-4 py-3 text-navy-600">
                    {profile.occupation || "—"}
                  </td>
                  <td className="px-4 py-3 text-navy-600">
                    {profile.profileId || (
                      <span className="text-navy-400">Not saved</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isActive ? (
                      <span className="badge-success">Active</span>
                    ) : (
                      <span className="badge-neutral">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => selectProfile(profile.localProfileId)}
                      className="btn-secondary text-xs"
                    >
                      Switch
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/profile" className="btn-secondary">
          <Edit className="h-4 w-4" />
          Edit Active User
        </Link>
        <Link to="/eligibility-results" className="btn-secondary">
          <Play className="h-4 w-4" />
          Run Eligibility
        </Link>
      </div>
    </div>
  );
}
