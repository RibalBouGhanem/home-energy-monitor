import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Basic validation helper
function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ""));
}

router.post("/", async (req, res) => {
  try {
    const { name, subject, message } = req.body || {};

    if (!name || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return res.status(500).json({ message: "ADMIN_EMAIL is not set in .env" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Energy Monitor Website" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `[Contact] ${subject}`,
      text:
        `New contact message:\n\n` +
        `Name: ${name}\n` +
        `Subject: ${subject}\n\n` +
        `Message:\n${message}\n`,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Subject:</b> ${escapeHtml(subject)}</p>
        <p><b>Message:</b></p>
        <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(message)}</pre>
      `,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Contact email failed:", err);
    return res.status(500).json({ message: "Failed to send email." });
  }
});


function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default router;
