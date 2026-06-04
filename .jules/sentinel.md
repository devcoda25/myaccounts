## 2024-05-24 - [HIGH] Fix Open Redirect Vulnerability
**Vulnerability:** Direct assignment of user-supplied `redirect_uri` to `window.location.href` without strict validation creates an Open Redirect vulnerability.
**Learning:** `redirect_uri` validation in applications often expects safe URLs, but if missing or improperly implemented at the route level, it can expose the app to redirects to malicious domains.
**Prevention:** Always validate user-provided URLs before using them in `window.location.href` by using strict hostname checking (e.g., `isValidUrl`).
