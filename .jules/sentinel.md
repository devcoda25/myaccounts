## 2024-07-16 - [HIGH] Open Redirect via Weak URL Validation
**Vulnerability:** The application used `window.location.href` to redirect users based on URL parameters (`redirect_uri`) without robust validation. The `isValidUrl` function was too permissive, allowing bypasses via `https://attacker-evzone.com` due to `.includes('evzone.com')` rather than strict domain matching.
**Learning:** URL validation must strictly check domains using exact matching or `.endsWith('.evzone.com')`. Relative paths also need to be explicitly handled to avoid breaking internal SPA routing.
**Prevention:** Always validate dynamic URLs against a strict allowlist or domain constraint, and wrap `window.location.href` assignments with conditions that fallback to safe internal routes.
