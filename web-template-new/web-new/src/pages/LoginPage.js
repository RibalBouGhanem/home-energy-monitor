import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css"

const LoginPage = () => {
	const [form, setForm] = useState({
		username: "",
		password: "",
		remember: false,
	});

	const [status, setStatus] = useState("");
	const [statusMsg, setStatusMsg] = useState("");

	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (form.username === "a" && form.password === "1") {
			setStatus("successful");
			setStatusMsg("Logging in...");
			
			// TODO: replace this with your real auth logic
			navigate('/home');
		} else {
			setStatus("error");
			setStatusMsg("Login unsuccessful, try again");
		}
	};

	return (
		<main className="login-page">
			{/* Optional: if you have a global <Navbar /> component, you’d render it above this main. */}

			{/* Background elements to match hero section */}
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
						Use your registered username and password to continue.
					</p>

					<form className="login-form" onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="login-username">Username</label>
							<input
								id="login-username"
								type="text"
								name="username"
								value={form.username}
								onChange={handleChange}
								placeholder="UsernameExample123"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="login-password">Password</label>
							<input
								id="login-password"
								type="password"
								name="password"
								value={form.password}
								onChange={handleChange}
								placeholder="••••••••"
								required
							/>
						</div>

						<div className="login-row">
							<label className="remember-me">
								<input
									type="checkbox"
									name="remember"
									checked={form.remember}
									onChange={handleChange}
								/>
								<span>Remember me</span>
							</label>

							<button
								type="button"
								className="login-link-button"
								onClick={() => alert("Hook this to your reset flow")}
							>
								Forgot password?
							</button>
						</div>

						<button type="submit" className="cta-button login-submit">
							Sign In
						</button>

						{statusMsg && <p className={`login-status ${status}`} >{statusMsg}</p>}

						<p className="login-footer-text">
							Don't have an account?{" "}
							<button
								type="button"
								className="login-link-button"
								onClick={() => alert("Hook this to your signup route")}
							>
								Create one
							</button>
						</p>
					</form>
				</div>
			</section>
		</main>
	);
};

export default LoginPage;
