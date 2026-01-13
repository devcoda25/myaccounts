import { AuthProviderProps } from 'react-oidc-context';

// Derive authority (Origin) from API URL because OIDC is mounted at root, not /api/v1
// USER REQUEST: Production should use accounts.evzone.app
const isProd = import.meta.env.PROD;
const devAuthority = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const prodAuthority = 'https://accounts.evzone.app';

let authority = isProd ? prodAuthority : devAuthority;
try {
    // If devAuthority has a path (e.g. /api), strip it to get origin
    // But for prod, we typically want the full domain 'https://accounts.evzone.app'
    if (!isProd) {
        authority = new URL(devAuthority).origin;
    }
} catch { /* ignore */ }

export const oidcConfig: AuthProviderProps = {
    authority, // Backend URL (Origin)
    client_id: 'evzone-portal',
    redirect_uri: window.location.origin + '/auth/callback',
    post_logout_redirect_uri: window.location.origin + '/auth/signed-out',
    response_type: 'code',
    scope: 'openid profile email offline_access', // Add offline_access for Refresh Tokens
    automaticSilentRenew: true,
    // We don't save secrets in frontend
};

export const BACKEND_URL = 'http://localhost:3000';
