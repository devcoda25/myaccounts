// API (your Nest app routes)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// OIDC issuer/authority (your oidc-provider)
export const OIDC_AUTHORITY =
  import.meta.env.VITE_OIDC_AUTHORITY ||
  (import.meta.env.PROD
    ? "https://accounts.evzone.app/oidc"
    : "http://localhost:3000/oidc");
