import nodemailer from 'nodemailer';

const MAX_BODY_BYTES = 12_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

export default async function handler(req, res) {
  res.setHeader('Allow', 'POST');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return sendJson(res, 415, { error: 'Please submit the form using the website.' });
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return sendJson(res, 413, { error: 'Your message is too long.' });
  }

  const { name, email, message, website } = req.body || {};
  if (typeof website === 'string' && website.trim()) {
    return sendJson(res, 200, { ok: true });
  }

  if (![name, email, message].every((value) => typeof value === 'string')) {
    return sendJson(res, 400, { error: 'Please complete all fields.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();
  if (!cleanName || cleanName.length > 100 || !EMAIL_PATTERN.test(cleanEmail) || cleanEmail.length > 254 || !cleanMessage || cleanMessage.length > 2000) {
    return sendJson(res, 400, { error: 'Please check your name, email, and message, then try again.' });
  }

  const requiredSettings = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_EMAIL'];
  if (requiredSettings.some((key) => !process.env[key])) {
    console.error('Contact form email settings are missing.');
    return sendJson(res, 503, { error: 'The contact form is temporarily unavailable. Please email us directly.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      replyTo: cleanEmail,
      subject: `Website contact message from ${cleanName}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`
    });

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error('Unable to deliver contact form message:', error.message);
    return sendJson(res, 502, { error: 'We could not send your message right now. Please try again or email us directly.' });
  }
}
