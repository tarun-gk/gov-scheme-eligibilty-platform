import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    if (isAuthenticated) {
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="relative flex min-h-[60vh] items-center justify-center">
            {/* Decorative background shapes */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-brand-200/30 to-brand-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tl from-navy-300/20 to-brand-300/10 blur-3xl" />

            <div className="relative z-10 w-full max-w-md">
                <div className="card backdrop-blur-sm">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy-800 text-white">
                            <LogIn className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-navy-900">Welcome Back</h1>
                        <p className="mt-1 text-sm text-navy-500">
                            Sign in to your SchemeSense account
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="login-email" className="label mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="input pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="login-password" className="label mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                                <input
                                    id="login-password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    className="input pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full disabled:opacity-60"
                        >
                            {submitting ? "Signing in…" : "Sign In"}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-navy-500">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold text-brand-600 hover:text-brand-700"
                        >
                            Create one
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
