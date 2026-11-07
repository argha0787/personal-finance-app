# Security and privacy guidelines

- Rotate any Gemini credential pasted into chat or another untrusted place.
  Store the replacement only in `backend/.env` or a managed backend secret
  store. Never use a `VITE_` variable for credentials.
- Keep `.env` files and local databases out of source control. `.env.example`
  contains names and placeholders only.
- Passwords are stored as salted PBKDF2-HMAC-SHA256 hashes; plaintext passwords
  are not persisted. Session tokens use a backend secret and are delivered in
  an HTTP-only, SameSite=Lax cookie.
- For deployment, use HTTPS, set `COOKIE_SECURE=true`, replace `SECRET_KEY`
  with a unique random value of at least 32 characters and configure CORS with
  exact trusted frontend origins.
- Every record query is scoped to the signed-in user. Backend validation and
  ownership checks are required even when the frontend validates inputs.
- Gemini requests originate from the backend and include only the question and
  a limited dashboard summary. The model cannot perform account actions. Do
  not enter credentials, full account numbers or identity documents in prompts.
- The AI provider receives data according to its own terms and retention
  policy; configure and review that policy before enabling the integration.
- CSV exports can contain sensitive financial details. Keep exports private.
- Uploads and bank connections are not enabled. If added, validate file size,
  content, storage access and malware-handling requirements before accepting
  user files.
- This initial release does not provide rate limiting, account recovery,
  production monitoring, automated backups or a full security audit. Do not
  expose it publicly with real records until those controls are addressed.