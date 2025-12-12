// src/components/Contact.jsx
import React, { useState, useRef } from "react";

export default function Contact() {
	const [buttonText, setButtonText] = useState("Send Message");
	const [buttonSent, setButtonSent] = useState(false);
	const formRef = useRef(null);

	const handleSubmit = (e) => {
		e.preventDefault();

		const form = formRef.current;
		if (!form) return;

		const formData = {
			name: form.name.value,
			email: form.email.value,
			subject: form.subject.value,
			message: form.message.value,
		};

		console.log("Contact form submitted:", formData);

		setButtonText("Message Sent! ✓");
		setButtonSent(true);
		form.reset();

		setTimeout(() => {
			setButtonText("Send Message");
			setButtonSent(false);
		}, 3000);
	};

	return (
		<section className="contact-section" id="contact">
			<div className="dashboard-container">
				<h2 className="section-title">Get In Touch</h2>
				<div className="contact-grid">
					<div className="contact-form">
						<h3 style={{ marginBottom: 30, fontSize: 24 }}>Send us a Message</h3>
						<form id="contactForm" ref={formRef} onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="name">Full Name</label>
								<input type="text" id="name" name="name" required />
							</div>
							<div className="form-group">
								<label htmlFor="email">Email Address</label>
								<input type="email" id="email" name="email" required />
							</div>
							<div className="form-group">
								<label htmlFor="subject">Subject</label>
								<input type="text" id="subject" name="subject" required />
							</div>
							<div className="form-group">
								<label htmlFor="message">Message</label>
								<textarea
									id="message"
									name="message"
									required
									placeholder="Tell us how we can help you..."
								></textarea>
							</div>
							<button
								type="submit"
								className="cta-button"
								style={{
									width: "100%",
									background: buttonSent
										? "linear-gradient(135deg, #4ade80, #22c55e)"
										: "linear-gradient(135deg, #ff6b6b, #ff8e53)",
								}}
							>
								{buttonText}
							</button>
						</form>
					</div>

					{/* contact info unchanged */}
					{/* ... */}
					<div className="contact-info">
						<h3>Contact Information</h3>
						
						<a href="mailto:hello@graphpage.com" className="contact-item">
							<div className="contact-icon">📧</div>
							<div className="contact-details">
								<h4>Email Address</h4>
								<p>hello@graphpage.com<br/>support@graphpage.com</p>
							</div>
						</a>

						<a href="tel:+15551234567" className="contact-item">
							<div className="contact-icon">📞</div>
							<div className="contact-details">
								<h4>Phone Number</h4>
								<p>+1 (555) 123-4567<br/>Available 24/7</p>
							</div>
						</a>

						<a href="https://maps.google.com/?q=123+Data+Drive+Suite+100+Analytics+City" target="_blank" rel="noopener" className="contact-item">
							<div className="contact-icon">📍</div>
							<div className="contact-details">
								<h4>Office Location</h4>
								<p>123 Data Drive, Suite 100<br/>Analytics City, AC 12345</p>
							</div>
						</a>

						<div className="contact-item">
							<div className="contact-icon">🕒</div>
							<div className="contact-details">
								<h4>Business Hours</h4>
								<p>Monday - Friday: 9:00 AM - 6:00 PM<br />Weekend: Emergency support only</p>
							</div>
						</div>
					</div>
					
				</div>
			</div>
		</section>
	);
}
