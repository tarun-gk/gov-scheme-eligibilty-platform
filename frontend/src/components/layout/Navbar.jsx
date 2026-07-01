import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useI18n } from "../../contexts/I18nContext.jsx";
import {
  Home,
  User,
  Users,
  CheckSquare,
  Star,
  MessageSquare,
  Search,
  Shield,
  Menu,
  X,
  LogOut,
  LogIn,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Build nav links based on auth state
  const NAV_LINKS = isAuthenticated
    ? [
      { to: "/", label: t("home"), icon: Home },
      { to: "/profile", label: t("profile"), icon: User },
      { to: "/profiles", label: t("users"), icon: Users },
      { to: "/eligibility-results", label: t("eligibility"), icon: CheckSquare },
      { to: "/recommendations", label: t("recommendations"), icon: Star },
      { to: "/chat", label: t("chat"), icon: MessageSquare },
      { to: "/explorer", label: t("explorer"), icon: Search },
      { to: "/admin/profiles", label: t("admin"), icon: Shield },
    ]
    : [
      { to: "/", label: t("home"), icon: Home },
      { to: "/explorer", label: t("explorer"), icon: Search },
    ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${isActive
      ? "bg-navy-700 text-white"
      : "text-navy-200 hover:bg-navy-700/50 hover:text-white"
    }`;

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 bg-navy-800 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy-800">
            <span className="text-sm font-bold">SS</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-white">SchemeSense</div>
            <div className="text-xs text-navy-300">
              {t("platformTagline")}
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}

          <select
            className="ml-2 rounded-md border border-navy-600 bg-navy-700 px-2 py-1 text-xs text-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Language"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>

          {/* Auth section */}
          {isAuthenticated ? (
            <div className="ml-3 flex items-center gap-2 border-l border-navy-600 pl-3">
              <span className="text-xs font-medium text-navy-300">
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-navy-300 transition-colors hover:bg-navy-700 hover:text-white"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={linkClass}>
              <LogIn className="h-4 w-4" />
              {t("signIn")}
            </NavLink>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 text-navy-200 hover:bg-navy-700 hover:text-white lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-navy-700 px-4 pb-4 pt-2 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}

            {/* Mobile auth section */}
            <div className="mt-2 border-t border-navy-700 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-navy-400">
                    {t("signedInAs")} {" "}
                    <span className="text-navy-200">
                      {user?.name || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-navy-200 transition-colors hover:bg-navy-700 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("signOut")}
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className={linkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  {t("signIn")}
                </NavLink>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
