import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import ForgotPassword from "../components/forgotPassword";
import "../styles/LoginPage.css"

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, token, setUser, setToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("success");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/login", { email, password });
      setUser(res.data.user);
      setToken(res.data.token);

      // role-based redirect
      if (res.data.user.isAdmin) {
		navigate("/admin");
	  } else {
		navigate("/");
	  }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
	  setStatus("error");
    }
  };

	return (
		<main className="login-page">
			<div className="login-hero-bg" />
			<div className="login-geometric-shapes">
				<div className="shape shape1" />
				<div className="shape shape2" />
				<div className="shape shape3" />
				<div className="shape shape4" />
				<div className="shape shape5" />
				<div className="shape shape6" />
			</div>

			<section className="login-container">
				{/* Left side copy */}
				<div className="login-intro">
					<h1>
						Welcome back
						<br />
						to <span>Graph Page</span>
					</h1>
					<p>
						Sign in to access your analytics dashboard, custom reports, and real-time
						insights across all your data streams.
					</p>

					<div className="login-stats">
						<div className="login-stat-item">
							<span className="login-stat-label">System Uptime</span>
							<span className="login-stat-value">99.9%</span>
						</div>
						<div className="login-stat-item">
							<span className="login-stat-label">Daily Active</span>
							<span className="login-stat-value">3.2K</span>
						</div>
						<div className="login-stat-item">
							<span className="login-stat-label">NPS Score</span>
							<span className="login-stat-value">89</span>
						</div>
					</div>
				</div>

				{/* Right side card */}
				<div className="login-card">
					<h2>Log in</h2>
					<p className="login-subtitle">
						Use your registered email and password to continue.
					</p>

					<form className="login-form" onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="login-email">Email</label>
							<input
								id="login-email"
								type="text"
								name="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Email@example.com"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="login-password">Password</label>
							<input
								id="login-password"
								type="password"
								name="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
						</div>

						<ForgotPassword />

						<button type="submit" className="cta-button login-submit">
							Log In
						</button>

						{error && <p className={`login-status ${status}`} >{error}</p>}
					</form>
				</div>
			</section>
		</main>
	);
};

export default LoginPage;
