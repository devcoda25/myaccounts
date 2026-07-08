## 2024-07-08 - Open Redirect via insecure .includes()
**Vulnerability:** The isValidUrl and sanitizeUrl functions validated domains insecurely using .includes('evzone.com'), which would allow domains like attacker-evzone.com or evzone.com.attacker.com to pass validation and result in Open Redirects or SSRF.
**Learning:** Naive substring matching on hostnames is dangerous and easily bypassed.
**Prevention:** Always validate hostnames via exact match (===) or strict Regex matching tied to domain boundaries.
