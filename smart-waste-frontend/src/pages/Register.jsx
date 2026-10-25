
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Auth.css";
import API_BASE_URL from "../api";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        phone
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            setMessage("Registration successful! You can now log in.");

            setName("");
            setEmail("");
            setPassword("");
            setPhone("");

            setTimeout(() => navigate("/"), 1500);
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
                    <h2>Create your account</h2>
                    <p>Join us in building cleaner communities.</p>
                </div>

                <form className="auth-form" onSubmit={handleRegister}>
                    <label htmlFor="register-name">Full name</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">♙</span>
                        <input
                            id="register-name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            required
                        />
                    </div>

                    <label htmlFor="register-email">Email address</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">✉</span>
                        <input
                            id="register-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <label htmlFor="register-password">Password</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">🔒</span>
                        <input
                            id="register-password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <label htmlFor="register-phone">Phone number</label>
                    <div className="auth-input-wrap">
                        <span className="auth-input-icon">☎</span>
                        <input
                            id="register-phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            autoComplete="tel"
                            required
                        />
                    </div>

                    {message && (
                        <p className="auth-success" role="status">
                            ✓ {message}
                        </p>
                    )}

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
                        {loading ? "Creating account..." : "Create Account  →"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                    >
                        Sign In
                    </button>
                </p>

                <p className="auth-footer">
                    Building cleaner, greener communities.
                </p>
            </section>
        </main>
    );
}

export default Register;
