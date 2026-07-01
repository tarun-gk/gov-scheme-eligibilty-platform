import { createContext, useContext, useMemo, useState } from "react";

const I18nContext = createContext(null);

const resources = {
  en: {
    home: "Home",
    profile: "Profile",
    users: "Users",
    eligibility: "Eligibility",
    recommendations: "Recommendations",
    chat: "Assistant",
    explorer: "Explorer",
    admin: "Admin",
    signIn: "Sign In",
    signOut: "Sign Out",
    signedInAs: "Signed in as",
    platformTagline: "Government Scheme Eligibility Platform",
  },
  hi: {
    home: "होम",
    profile: "प्रोफाइल",
    users: "उपयोगकर्ता",
    eligibility: "पात्रता",
    recommendations: "सिफारिशें",
    chat: "सहायक",
    explorer: "खोज",
    admin: "प्रशासन",
    signIn: "साइन इन",
    signOut: "साइन आउट",
    signedInAs: "लॉगिन उपयोगकर्ता",
    platformTagline: "सरकारी योजना पात्रता प्लेटफॉर्म",
  },
};

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("app_language") || "en";
    } catch {
      return "en";
    }
  });

  const value = useMemo(() => ({
    language,
    setLanguage: (nextLanguage) => {
      const safe = resources[nextLanguage] ? nextLanguage : "en";
      setLanguage(safe);
      try {
        localStorage.setItem("app_language", safe);
      } catch {
      }
    },
    t: (key) => resources[language]?.[key] || resources.en[key] || key,
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
