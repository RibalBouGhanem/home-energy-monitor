import React, { useState, useRef } from "react";
import api from "../api/axios"; // adjust path if needed

export default function Contact() {
  const [buttonText, setButtonText] = useState("Send Message");
  const [buttonSent, setButtonSent] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = formRef.current;
    if (!form) return;

    const formData = {
      name: form.name.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      setButtonText("Sending...");

      // IMPORTANT: this must hit your backend (not direct email from frontend)
      await api.post("/api/contact", formData);

      setButtonText("Message Sent! ✓");
      setButtonSent(true);
      form.reset();

      setTimeout(() => {
        setButtonText("Send Message");
        setButtonSent(false);
      }, 3000);
    } catch (err) {
      console.error("Contact submit failed:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to send message. Please try again."
      );
      setButtonText("Send Message");
      setButtonSent(false);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="dashboard-container">
        <h2 className="section-title">Get In Touch</h2>

        <div className="contact-grid">
          <div className="contact-form">
            <h3 style={{ marginBottom: 30, fontSize: 24 }}>Send us a Message</h3>

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(255, 0, 0, 0.12)",
                  border: "1px solid rgba(255, 0, 0, 0.25)",
                  color: "#fff",
                }}
              >
                {error}
              </div>
            )}

            <form id="contactForm" ref={formRef} onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" required />
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
                />
              </div>

              <button
                type="submit"
                className="cta-button"
                disabled={buttonText === "Sending..."}
                style={{
                  width: "100%",
                  opacity: buttonText === "Sending..." ? 0.85 : 1,
                  cursor: buttonText === "Sending..." ? "not-allowed" : "pointer",
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
						
						<div className="contact-item">
							<div className="contact-icon">📧</div>
							<div className="contact-details">
								<h4>Email Address</h4>
								<p>hello@graphpage.com<br/>support@graphpage.com</p>
							</div>
						</div>

						<a href="https://maps.app.goo.gl/ZUwBGkQi98Kzx7ed6" target="_blank" rel="noopener" className="contact-item">
							<div className="contact-icon">📍</div>
							<div className="contact-details">
								<h4>Office Location</h4>
								<p>123 St<br/>Chtoura</p>
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
