## 2024-05-25 - [Open Redirect]
**Vulnerability:** Open Redirect vulnerability via window.location.href assignment in redirect flows.
**Learning:** External unvalidated parameters can redirect users to arbitrary domains.
**Prevention:** Validate redirect URIs strictly with isValidUrl before navigation.
