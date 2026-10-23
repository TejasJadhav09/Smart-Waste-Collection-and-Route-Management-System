
import { useState } from "react";
import "./Auth.css";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                }
            );

          const responseText = await response.text();

if (!response.ok) {
    let errorMessage = "Login failed. Please check your credentials.";

    try {
        const errorData = JSON.parse(responseText);
        errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
    } catch {
        if (responseText) {
            errorMessage = responseText;
        }
    }

    throw new Error(
        errorMessage === "Bad credentials"
            ? "Invalid email or password. Please try again."
            : errorMessage
    );
}

const token = responseText;

            if (!token.trim()) {
                throw new Error("The server returned an empty login token.");
            }

            localStorage.setItem("token", token);
            onLogin();
        } catch (err) {
            setError(
                err.message === "Failed to fetch"
                    ? "Unable to connect to the server. Please try again."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-brand">
                    <div className="auth-logo">♻</div>
                    <h1>Smart Waste Management</h1>
                    <p>Smarter collection. Cleaner communities.</p>
                </div>

                <div className="auth-heading">
                    <h2>Welcome back!</h2>
                    <p>Sign in to access your dashboard.</p>
                </div>

                <form className="auth-form" onSubmit={handleLogin}>
                    <label htmlFor="login-email">Email address</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">✉</span>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <label htmlFor="login-password">Password</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">🔒</span>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="auth-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In  →"}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <a href="/register">Register</a>
                </p>

                <p className="auth-footer">
                    Building cleaner, greener communities.
                </p>
            </section>
        </main>
    );
}

export default Login;
