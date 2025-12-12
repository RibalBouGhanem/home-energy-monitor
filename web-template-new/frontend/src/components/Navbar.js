// src/components/Navbar.jsx
import React, { useEffect, useState, useCallback } from "react";

const SECTIONS = ["home", "dashboard", "analytics", "reports", "contact"];

export default function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [activeSection, setActiveSection] = useState("home");

	const handleScroll = useCallback(() => {
		const scrollY = window.pageYOffset;
		setScrolled(scrollY > 50);

		const sections = SECTIONS.map((id) => document.getElementById(id)).filter(
			Boolean
		);

		sections.forEach((section) => {
			const sectionHeight = section.offsetHeight;
			const sectionTop = section.offsetTop - 100;
			const sectionId = section.getAttribute("id");

			if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
				setActiveSection(sectionId);
			}
		});
	}, []);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	const handleNavClick = () => {
		// just close mobile menu; let anchor handle scrolling
		setMobileOpen(false);
	};

	return (
		<nav id="navbar" className={scrolled ? "scrolled" : ""}>
			<div className="nav-container">
				<a href="#home" className="logo" onClick={handleNavClick}>
					<div className="logo-icon">
						<svg viewBox="0 0 24 24">
							<path d="M3 13h2v8H3zm4-8h2v13H7zm4-2h2v15h-2zm4 4h2v11h-2zm4-2h2v13h-2z" />
						</svg>
					</div>
					<span className="logo-text">Graph Page</span>
				</a>

				<ul className="nav-links">
					{SECTIONS.map((id) => (
						<li key={id}>
							<a
								href={`#${id}`}
								className={activeSection === id ? "active" : ""}
								onClick={handleNavClick}
							>
								{id.charAt(0).toUpperCase() + id.slice(1)}
							</a>
						</li>
					))}
				</ul>

				<a
					href="https://www.google.com/search"
					target="_blank"
					rel="noopener noreferrer"
					title="Search"
				>
					<svg
						className="search-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.35-4.35"></path>
					</svg>
				</a>

				<div
					className={`hamburger ${mobileOpen ? "active" : ""}`}
					id="hamburger"
					onClick={() => setMobileOpen((prev) => !prev)}
				>
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>

			<ul
				className={`nav-links-mobile ${mobileOpen ? "active" : ""}`}
				id="navLinksMobile"
			>
				{SECTIONS.map((id) => (
					<li key={id}>
						<a
							href={`#${id}`}
							className={activeSection === id ? "active" : ""}
							onClick={handleNavClick}
						>
							{id.charAt(0).toUpperCase() + id.slice(1)}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
