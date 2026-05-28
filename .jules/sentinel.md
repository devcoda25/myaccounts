
## 2024-05-18 - Open Redirect in Auth Continue and Sign Out Flows
**Vulnerability:** The application was vulnerable to Open Redirects in `/auth/continue` and `/auth/signed-out` pages due to assigning a dynamic, user-provided `redirectUri` to `window.location.href` without validation.
**Learning:** Directly assigning URL parameters like `redirectUri` to `window.location.href` allows attackers to redirect users to malicious external domains.
**Prevention:** Always validate user-provided URLs using `isValidUrl` from `src/sanitizers/url.ts` before using them in redirects (`window.location.href`), and fallback to internal navigation (e.g., `navigate('/app')`) if validation fails.
