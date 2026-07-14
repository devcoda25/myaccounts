## 2024-07-14 - Open Redirect via Loose Validation
**Vulnerability:** URL validation used loose hostname.includes() and window.location.href was assigned without validation, enabling open redirects.
**Learning:** Includes() allows subdomains controlled by attackers (e.g., evzone.com.attacker.com). URL constructor throws on relative paths, breaking SPA routing.
**Prevention:** Use exact match or endsWith('.domain.com') for hostnames, explicitly allow safe relative paths, and always validate redirect destinations.
