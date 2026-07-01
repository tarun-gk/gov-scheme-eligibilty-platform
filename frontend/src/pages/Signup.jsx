import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { UserPlus, Mail, Lock, User, AlertCircle } from "lucide-react";

export default function Signup() {
    const { signup, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (isAuthenticated) {
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setSubmitting(true);

        try {
            await signup(name, email, password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message || "Signup failed. Please try again.");
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
                            <UserPlus className="h-7 w-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-navy-900">
                            Create Account
                        </h1>
                        <p className="mt-1 text-sm text-navy-500">
                            Join SchemeSense to discover eligible government schemes
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
                            <label htmlFor="signup-name" className="label mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                                <input
                                    id="signup-name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    className="input pl-10"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="signup-email" className="label mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                                <input
                                    id="signup-email"
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
                            <label htmlFor="signup-password" className="label mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                                <input
                                    id="signup-password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    className="input pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="signup-confirm" className="label mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                                <input
                                    id="signup-confirm"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    className="input pl-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full disabled:opacity-60"
                        >
                            {submitting ? "Creating account…" : "Create Account"}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-navy-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-brand-600 hover:text-brand-700"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
