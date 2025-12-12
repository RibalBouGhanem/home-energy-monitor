// src/components/Hero.jsx
import React from "react";
import Shapes from "./shapes"
import Buildings from "./buildings"

export default function Hero() {
	return (
		<section className="hero" id="home">
			<div className="hero-bg"></div>
			<Shapes/>

			<div className="hero-content">
				<div className="hero-text">
					<h1>
						Your Energy Data
					</h1>
					<p>
						Welcome , your home's energy monitor has some data available to for you!
						Navigate to the page you'd like in order to check out more information on your home's energy!
					</p>
					<a href="#dashboard" className="cta-button">
						Get Started
					</a>
				</div>

				<Buildings/>
			</div>
		</section>
	);
}
