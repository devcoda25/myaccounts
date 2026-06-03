
## YYYY-MM-DD - Fix Open Redirect in Authentication flows
**Vulnerability:** Open redirect vulnerabilities on `/auth/continue` and `/auth/signed-out` caused by unsafe assignments of `redirectUri` to `window.location.href`.
**Learning:** Found multiple instances where dynamic query parameters (`redirect_uri`) were assigned directly to `window.location.href` without verification, leading to Open Redirect vulnerabilities.
**Prevention:** Always validate user-supplied redirect URLs against a strict allowlist (e.g. `isValidUrl()`) before navigating to them.
