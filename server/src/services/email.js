const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  const from = process.env.EMAIL_FROM || 'noreply@localhost';
  if (!t) {
    console.info('[email] skipped (no SMTP):', subject, '->', to);
    return { skipped: true };
  }
  await t.sendMail({ from, to, subject, text, html });
  return { sent: true };
}

module.exports = { sendMail };
