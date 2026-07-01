import { Link } from "react-router-dom";

const QUICK_LINKS = [
  { to: "/profile", label: "Create Profile" },
  { to: "/eligibility-results", label: "Check Eligibility" },
  { to: "/recommendations", label: "Recommendations" },
  { to: "/explorer", label: "Explore Schemes" },
  { to: "/chat", label: "AI Assistant" },
];

const PLATFORM_LINKS = [
  { to: "/profiles", label: "User Manager" },
  { to: "/admin/profiles", label: "Admin Panel" },
];

export default function Footer() {
  return (
    <footer className="border-t border-navy-200 bg-navy-800">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy-800">
                <span className="text-sm font-bold">SS</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">SchemeSense</div>
                <div className="text-xs text-navy-400">
                  Eligibility Intelligence
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-navy-400">
              AI-powered platform to discover, evaluate, and apply for
              government schemes across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-300">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-navy-400 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-300">
              Platform
            </h3>
            <ul className="mt-4 space-y-2">
              {PLATFORM_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-navy-400 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-300">
              About
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-navy-400">
              Built with structured eligibility rules, AI-powered explanations,
              and confidence-scored recommendations.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-navy-700 pt-6">
          <p className="text-xs text-navy-500">
            © {new Date().getFullYear()} SchemeSense. Eligibility Intelligence
            Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
