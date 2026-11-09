# Pharmacy contact form backend

This repository uses a Node.js serverless function at `api/contact.js`, compatible with the existing Vercel deployment. The contact form sends general messages to `basitaheer43@gmail.com` using SMTP.

## Configure email delivery

Add these environment variables in the Vercel project settings (and locally in a private `.env` file when using Vercel CLI):

- `SMTP_HOST` — SMTP server hostname from your email provider
- `SMTP_PORT` — usually `465` for implicit TLS or `587` for STARTTLS
- `SMTP_SECURE` — `true` for port 465, otherwise `false`
- `SMTP_USER` — SMTP account username
- `SMTP_PASS` — SMTP password or provider-issued app password
- `MAIL_FROM` — optional sender address verified by your SMTP provider; otherwise `SMTP_USER` is used
- `CONTACT_EMAIL` — `basitaheer43@gmail.com`

Install dependencies with `npm install`. To test the Vercel function locally, install/use the Vercel CLI and run `vercel dev` after setting the environment variables. Never commit SMTP credentials or put them in browser-side code.

The form is for general messages only. Do not send prescription details or other sensitive health information through it. The basic honeypot and input validation are not a substitute for provider-level spam protection or rate limiting before public production use.
