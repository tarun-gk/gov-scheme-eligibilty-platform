import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveUserProfile } from "../services/platformApi";
import { useUserProfile } from "../hooks/useUserProfile";
import { Save, ArrowRight } from "lucide-react";

const REQUIRED_FIELD_LABELS = {
  name: "Full Name",
  age: "Age",
  income: "Annual Income",
  state: "State",
  occupation: "Occupation",
};

const REQUIRED_FIELDS = Object.keys(REQUIRED_FIELD_LABELS);

const SELECT_OPTIONS = {
  state: ["Telangana", "Central", "Maharashtra", "Gujarat", "Assam"],
  gender: ["Male", "Female", "Other"],
  income: [
    { label: "Up to ₹1,00,000", value: "100000" },
    { label: "₹1,00,001 - ₹2,50,000", value: "250000" },
    { label: "₹2,50,001 - ₹5,00,000", value: "500000" },
    { label: "₹5,00,001 - ₹8,00,000", value: "800000" },
    { label: "Above ₹8,00,000", value: "1000000" },
  ],
  occupation: [
    "farmer",
    "student",
    "entrepreneur",
    "self-employed",
    "unemployed",
    "government employee",
    "private employee",
  ],
  caste_category: ["General", "OBC", "SC", "ST", "EWS"],
};

const INPUT_FIELDS = [
  { key: "name", label: "Full Name", type: "text" },
  { key: "age", label: "Age", type: "number" },
  { key: "land_owned", label: "Land Owned (acres)", type: "number" },
];

const EMPTY_DRAFT = {
  name: "",
  age: "",
  income: "",
  gender: "",
  occupation: "",
  caste_category: "",
  state: "",
  land_owned: "",
};

export default function UserProfile() {
  const navigate = useNavigate();
  const {
    profile,
    profiles,
    activeProfileId,
    setProfile,
    addProfile,
    selectProfile,
  } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [draftProfile, setDraftProfile] = useState(EMPTY_DRAFT);

  const activeProfile = profile || draftProfile;

  // Count filled required fields for progress
  const filledCount = REQUIRED_FIELDS.filter((f) => {
    const v = activeProfile[f];
    return v !== null && v !== undefined && String(v).trim() !== "";
  }).length;

  function updateActiveProfile(patch) {
    const touchedFields = Object.keys(patch || {});
    if (touchedFields.length > 0) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        touchedFields.forEach((field) => {
          delete next[field];
        });
        return next;
      });
    }

    if (profile) {
      setProfile(patch);
      return;
    }

    setDraftProfile((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  function validateRequiredFields(input) {
    return Object.entries(REQUIRED_FIELD_LABELS).reduce(
      (errors, [field, label]) => {
        const value = input[field];
        if (
          value === null ||
          value === undefined ||
          String(value).trim() === ""
        ) {
          errors[field] = `${label} is required.`;
        }
        return errors;
      },
      {}
    );
  }

  function isRequiredField(field) {
    return REQUIRED_FIELDS.includes(field);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setFieldErrors({});

    try {
      const validationErrors = validateRequiredFields(activeProfile);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        return;
      }

      const payload = {
        ...activeProfile,
        age: activeProfile.age === "" ? null : Number(activeProfile.age),
        income:
          activeProfile.income === "" ? null : Number(activeProfile.income),
        land_owned:
          activeProfile.land_owned === ""
            ? null
            : Number(activeProfile.land_owned),
      };

      const saved = await saveUserProfile(payload);

      if (profile) {
        setProfile({
          ...payload,
          userId: saved?.userId || null,
          profileId: saved?.profileId || null,
        });
      } else {
        addProfile({
          ...payload,
          userId: saved?.userId || null,
          profileId: saved?.profileId || null,
        });
        setDraftProfile(EMPTY_DRAFT);
      }

      setMessage("User saved successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">
          Enter user details to power eligibility checks, recommendations, and
          AI explanations.
        </p>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-navy-700">Profile Completeness</span>
          <span className="text-navy-500">
            {filledCount} / {REQUIRED_FIELDS.length} required fields
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-navy-100">
          <div
            className="h-2 rounded-full bg-brand-600 transition-all duration-300"
            style={{
              width: `${(filledCount / REQUIRED_FIELDS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Active user selector */}
        <div>
          <label className="label">Active User</label>
          <select
            value={activeProfileId || ""}
            onChange={(event) => selectProfile(event.target.value)}
            className="select mt-1.5"
          >
            <option value="">Create New User</option>
            {profiles.map((savedProfile) => (
              <option
                key={savedProfile.localProfileId}
                value={savedProfile.localProfileId}
              >
                {savedProfile.name +
                  (savedProfile.state ? ` — ${savedProfile.state}` : "") +
                  (savedProfile.profileId
                    ? ` (ID ${savedProfile.profileId})`
                    : "")}
              </option>
            ))}
          </select>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {INPUT_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="label">
                {field.label}
                {isRequiredField(field.key) && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>
              <input
                type={field.type}
                value={activeProfile[field.key] ?? ""}
                onChange={(event) =>
                  updateActiveProfile({ [field.key]: event.target.value })
                }
                className="input mt-1.5"
              />
              {fieldErrors[field.key] && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors[field.key]}
                </p>
              )}
            </div>
          ))}

          <div>
            <label className="label">
              Annual Income
              <span className="ml-1 text-red-500">*</span>
            </label>
            <select
              value={activeProfile.income ?? ""}
              onChange={(event) =>
                updateActiveProfile({ income: event.target.value })
              }
              className="select mt-1.5"
            >
              <option value="">Select income bracket</option>
              {SELECT_OPTIONS.income.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.income && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.income}</p>
            )}
          </div>

          <div>
            <label className="label">
              State
              <span className="ml-1 text-red-500">*</span>
            </label>
            <select
              value={activeProfile.state ?? ""}
              onChange={(event) =>
                updateActiveProfile({ state: event.target.value })
              }
              className="select mt-1.5"
            >
              <option value="">Select state</option>
              {SELECT_OPTIONS.state.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldErrors.state && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.state}</p>
            )}
          </div>

          <div>
            <label className="label">Gender</label>
            <select
              value={activeProfile.gender ?? ""}
              onChange={(event) =>
                updateActiveProfile({ gender: event.target.value })
              }
              className="select mt-1.5"
            >
              <option value="">Select gender</option>
              {SELECT_OPTIONS.gender.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Occupation
              <span className="ml-1 text-red-500">*</span>
            </label>
            <select
              value={activeProfile.occupation ?? ""}
              onChange={(event) =>
                updateActiveProfile({ occupation: event.target.value })
              }
              className="select mt-1.5"
            >
              <option value="">Select occupation</option>
              {SELECT_OPTIONS.occupation.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldErrors.occupation && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.occupation}
              </p>
            )}
          </div>

          <div>
            <label className="label">Caste Category</label>
            <select
              value={activeProfile.caste_category ?? ""}
              onChange={(event) =>
                updateActiveProfile({ caste_category: event.target.value })
              }
              className="select mt-1.5"
            >
              <option value="">Select category</option>
              {SELECT_OPTIONS.caste_category.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 border-t border-navy-100 pt-5">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save User"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/eligibility-results")}
            className="btn-secondary"
          >
            Check Eligibility
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {message && (
          <p
            className={`text-sm ${message.includes("success")
                ? "text-emerald-700"
                : "text-red-600"
              }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
