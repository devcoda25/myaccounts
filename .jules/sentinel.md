## 2024-05-24 - Open Redirect Vulnerability in Auth Flows
**Vulnerability:** Open Redirect caused by unvalidated assignment of `window.location.href` to user-supplied query parameters like `redirect_uri`.
**Learning:** Dynamic segment validation must always check against a strict allowlist. When resolving a URL from query string, using string manipulation isn't sufficient.
**Prevention:** Use an exact domain match with a parsed URL or strict Regex matching, implemented in `isValidUrl`, before assigning to `window.location.href`. Provide safe fallback mechanisms using React Router (`navigate`).
