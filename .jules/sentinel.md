## 2024-05-18 - Fix Open Redirect in Authentication Continue
**Vulnerability:** Open Redirect / SSRF bypass in `isValidUrl` using `.includes('evzone.com')` and direct `window.location.href` assignment in auth continue component.
**Learning:** `.includes()` on hostname allows domains like `evzone.com.attacker.com` to bypass checks. Unvalidated `window.location.href` assignment leads to open redirect.
**Prevention:** Use strict equality (`===`) and strict suffix matching (`.endsWith()`) for domains. Always validate redirect URIs before assigning to `window.location.href`.
