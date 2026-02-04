# Sentinel Journal - Security Learnings

## 2024-05-22 - Duplicated Security Logic
**Vulnerability:** Inconsistent input validation and masking due to duplicated logic in component files (e.g., `sign-in/Index.tsx`).
**Learning:** Local reimplementations of security controls (masking, validation) bypass centralized fixes and create dead code.
**Prevention:** Enforce usage of `src/validators/` and `src/masks/` via code review or custom lint rules.
