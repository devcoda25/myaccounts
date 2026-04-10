## 2024-10-27 - [CRITICAL] Multiple DOM-based Open Redirects and XSS

**Vulnerability:** Several unvalidated Open Redirects and potential XSS issues existed across multiple views (`continue/Index.tsx`, `Apps.tsx`, `signed-out/Index.tsx`, `ProfileSidebar.tsx`) where user-supplied URLs were blindly assigned to `window.location.href`. In addition, the central `isValidUrl` validation function used a flawed `.includes('evzone.com')` check, permitting attackers to bypass the check using domains like `evzone.com.attacker.com`.

**Learning:** When URL validation relies on `.includes()` instead of strict domain parsing (`.endsWith()`), the entire application's routing state becomes vulnerable to bypass attacks. Furthermore, developers frequently assumed that URLs parsed from URL parameters (e.g., `redirect_uri` or an API response `launchUrl`) were automatically safe to inject into the `href`.

**Prevention:** Always use `.endsWith('.evzone.com')` (or strict equality) to test for internal domains instead of `.includes()`. Use the centralized `isSafeRedirect()` utility to validate any untrusted input before using it to mutate `window.location.href`. Ensure protocol allowlists are rigidly checked.
