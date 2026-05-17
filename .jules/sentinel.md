## 2024-05-17 - Prevent Open Redirects on Trusted Redirect Destinations

**Vulnerability:** Open Redirect (High)
**Learning:** In React SPA environments using query parameters for redirects, assigning `window.location.href` to user-supplied `redirect_uri` variables without explicit strict checking allows attackers to redirect users to malicious domains if they are given an unvalidated redirect link. A vulnerable implementation was found in authentication continue and sign-out pages.
**Prevention:** Always strictly validate dynamic destinations before mutating `window.location.href` using domain whitelists like `isValidUrl` instead of string matching or assumption of trust.
