import { useMemo, useState, useEffect, useCallback } from "react";
import { fetchUserProfiles } from "../services/platformApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

const STORAGE_KEY = "gov_scheme_user_profile_v1";
const REQUIRED_FIELDS = ["name", "age", "income", "state", "occupation"];

const DEFAULT_PROFILE = {
  localProfileId: "",
  userId: null,
  profileId: null,
  name: "",
  age: "",
  income: "",
  gender: "",
  occupation: "",
  caste_category: "",
  state: "",
  land_owned: "",
};

function createLocalProfileId() {
  return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeProfile(input = {}) {
  return {
    ...DEFAULT_PROFILE,
    ...input,
    localProfileId: input.localProfileId || createLocalProfileId(),
  };
}

function isVerifiedProfile(profile = {}) {
  if (!profile?.profileId) {
    return false;
  }

  return REQUIRED_FIELDS.every((field) => {
    const value = profile[field];
    return value !== null && value !== undefined && String(value).trim() !== "";
  });
}

function readCachedProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { profiles: [], activeProfileId: null };
    }

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed?.profiles)) {
      const profiles = parsed.profiles.length
        ? parsed.profiles.map((p) => normalizeProfile(p)).filter(isVerifiedProfile)
        : [];

      const hasActive = profiles.some(
        (p) => p.localProfileId === parsed.activeProfileId
      );

      return {
        profiles,
        activeProfileId: hasActive
          ? parsed.activeProfileId
          : profiles[0]?.localProfileId || null,
      };
    }

    const legacyProfile = normalizeProfile(parsed || {});
    const legacyProfiles = isVerifiedProfile(legacyProfile)
      ? [legacyProfile]
      : [];

    return {
      profiles: legacyProfiles,
      activeProfileId: legacyProfiles[0]?.localProfileId || null,
    };
  } catch {
    return { profiles: [], activeProfileId: null };
  }
}

function toLocalProfile(serverProfile) {
  return normalizeProfile({
    profileId: serverProfile.id,
    userId: serverProfile.user_id,
    name: serverProfile.name || "",
    age: serverProfile.age ?? "",
    income: serverProfile.income ?? "",
    gender: serverProfile.gender ?? "",
    occupation: serverProfile.occupation ?? "",
    caste_category: serverProfile.caste_category ?? "",
    state: serverProfile.state ?? "",
    land_owned: serverProfile.land_owned ?? "",
  });
}

export function useUserProfile() {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState(readCachedProfiles);

  // Sync with backend when authenticated
  const loadFromServer = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const serverProfiles = await fetchUserProfiles();
      if (Array.isArray(serverProfiles) && serverProfiles.length > 0) {
        const mapped = serverProfiles.map(toLocalProfile);
        const nextState = {
          profiles: mapped,
          activeProfileId:
            mapped[0]?.localProfileId || null,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        setState(nextState);
      }
    } catch {
      // Fall back to cached data
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  const profile = useMemo(() => {
    if (!state.activeProfileId) {
      return null;
    }

    return (
      state.profiles.find(
        (item) => item.localProfileId === state.activeProfileId
      ) || null
    );
  }, [state]);

  const hasProfile = useMemo(() => {
    return Boolean(
      profile?.name || profile?.occupation || profile?.state || profile?.age
    );
  }, [profile]);

  function persist(nextState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    setState(nextState);
  }

  function setProfiles(nextProfilesOrUpdater) {
    setState((prev) => {
      const candidateProfiles =
        typeof nextProfilesOrUpdater === "function"
          ? nextProfilesOrUpdater(prev.profiles)
          : nextProfilesOrUpdater;

      const normalizedProfiles =
        Array.isArray(candidateProfiles) && candidateProfiles.length
          ? candidateProfiles
            .map((item) => normalizeProfile(item))
            .filter(isVerifiedProfile)
          : [];

      const activeExists = normalizedProfiles.some(
        (item) => item.localProfileId === prev.activeProfileId
      );

      const nextState = {
        profiles: normalizedProfiles,
        activeProfileId:
          prev.activeProfileId === null
            ? null
            : activeExists
              ? prev.activeProfileId
              : normalizedProfiles[0]?.localProfileId || null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      return nextState;
    });
  }

  function updateProfile(patch) {
    if (!profile?.localProfileId) {
      return;
    }

    const profiles = state.profiles.map((item) =>
      item.localProfileId === profile.localProfileId
        ? {
          ...item,
          ...patch,
        }
        : item
    );

    persist({
      profiles,
      activeProfileId: profile.localProfileId,
    });
  }

  function clearProfile() {
    if (!profile?.localProfileId) {
      return;
    }

    const cleared = {
      ...DEFAULT_PROFILE,
      localProfileId: profile.localProfileId,
    };

    const profiles = state.profiles.map((item) =>
      item.localProfileId === profile.localProfileId ? cleared : item
    );

    persist({
      profiles,
      activeProfileId: profile.localProfileId,
    });
  }

  function addProfile(profileInput) {
    const nextProfile = normalizeProfile(profileInput || {});
    if (!isVerifiedProfile(nextProfile)) {
      return false;
    }

    persist({
      profiles: [...state.profiles, nextProfile],
      activeProfileId: nextProfile.localProfileId,
    });

    return true;
  }

  function selectProfile(localProfileId) {
    if (!localProfileId) {
      persist({
        profiles: state.profiles,
        activeProfileId: null,
      });
      return;
    }

    const exists = state.profiles.some(
      (item) => item.localProfileId === localProfileId
    );
    if (!exists) {
      return;
    }

    persist({
      profiles: state.profiles,
      activeProfileId: localProfileId,
    });
  }

  function deleteProfile(localProfileId) {
    const remaining = state.profiles.filter(
      (item) => item.localProfileId !== localProfileId
    );
    const profiles = remaining;
    const activeExists = profiles.some(
      (item) => item.localProfileId === state.activeProfileId
    );

    persist({
      profiles,
      activeProfileId: activeExists
        ? state.activeProfileId
        : profiles[0]?.localProfileId || null,
    });
  }

  return {
    profile,
    profiles: state.profiles,
    activeProfileId: state.activeProfileId,
    setProfiles,
    setProfile: updateProfile,
    clearProfile,
    addProfile,
    selectProfile,
    deleteProfile,
    hasProfile,
    refreshProfiles: loadFromServer,
  };
}
