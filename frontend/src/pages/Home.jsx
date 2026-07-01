import { Link } from "react-router-dom";
import {
  CheckCircle,
  Search,
  MessageSquare,
  User,
  Cpu,
  Database,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: CheckCircle,
    title: "Structured Eligibility Engine",
    description:
      "Rule-based + AI eligibility analysis with confidence scoring for every scheme.",
  },
  {
    icon: Cpu,
    title: "AI-Powered Recommendations",
    description:
      "Personalized scheme ranking based on your profile, occupation, income, and location.",
  },
  {
    icon: Search,
    title: "Smart Scheme Explorer",
    description:
      "Search by intent — find schemes for farmers, students, entrepreneurs, and more.",
  },
  {
    icon: User,
    title: "Profile-Driven Personalization",
    description:
      "Create once, reuse everywhere. Your profile powers all eligibility checks and recommendations.",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbot Assistant",
    description:
      "Ask natural-language questions about schemes, eligibility, and application processes.",
  },
  {
    icon: Database,
    title: "Verified Scheme Database",
    description:
      "Structured data from official government sources with rule verification status.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Enter your details — age, income, state, occupation, and category.",
    link: "/profile",
  },
  {
    number: "02",
    title: "Check Eligibility",
    description:
      "Run AI-powered eligibility analysis across all available government schemes.",
    link: "/eligibility-results",
  },
  {
    number: "03",
    title: "Get Recommendations",
    description:
      "View confidence-scored, ranked schemes tailored to your profile.",
    link: "/recommendations",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-950 px-6 py-12 shadow-elevated sm:px-10 sm:py-16">
        {/* Decorative grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Decorative corner glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-brand-400/8 blur-3xl" />
        {/* Accent dots */}
        <div className="pointer-events-none absolute right-8 top-8 grid grid-cols-3 gap-1.5 opacity-20">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-brand-300" />
          ))}
        </div>

        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">
            AI Government Scheme Navigator
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Discover the right government
            <br className="hidden sm:block" /> schemes — faster.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-300">
            Create your profile once, receive confidence-scored eligibility
            results, AI-powered recommendations, and ask scheme questions through
            a built-in chatbot.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-md transition-all duration-150 hover:bg-navy-50 hover:shadow-lg"
            >
              Create Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/eligibility-results"
              className="inline-flex items-center gap-2 rounded-md border border-navy-500 px-5 py-2.5 text-sm font-semibold text-navy-200 transition-colors duration-150 hover:border-navy-400 hover:text-white"
            >
              View Eligibility Results
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-md border border-navy-600 px-5 py-2.5 text-sm font-semibold text-navy-300 transition-colors duration-150 hover:border-navy-400 hover:text-white"
            >
              Ask AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div className="page-header">
          <h2 className="page-title">How It Works</h2>
          <p className="page-subtitle">
            Three steps to finding your eligible government schemes.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <Link key={step.number} to={step.link} className="card-hover group">
              <span className="text-2xl font-bold text-brand-600">
                {step.number}
              </span>
              <h3 className="mt-3 text-base font-semibold text-navy-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                {step.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 transition-colors group-hover:text-brand-800">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="page-header">
          <h2 className="page-title">Platform Features</h2>
          <p className="page-subtitle">
            Built for accuracy, transparency, and ease of use.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-navy-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
