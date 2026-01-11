import { AuthProviderProps } from 'react-oidc-context';

// Derive authority (Origin) from API URL because OIDC is mounted at root, not /api/v1
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
let authority = apiBase;
try {
    authority = new URL(apiBase).origin;
} catch { /* ignore */ }

export const oidcConfig: AuthProviderProps = {
    authority, // Backend URL (Origin)
    client_id: 'evzone-portal',
    redirect_uri: window.location.origin + '/auth/callback',
    response_type: 'code',
    scope: 'openid profile email offline_access', // Add offline_access for Refresh Tokens
    automaticSilentRenew: true,
    // We don't save secrets in frontend
};

export const BACKEND_URL = 'http://localhost:3000';
