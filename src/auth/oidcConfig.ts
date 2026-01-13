import { AuthProviderProps } from 'react-oidc-context';

// Derive authority (Origin) from API URL because OIDC is mounted at root, not /api/v1
// USER REQUEST: Production should use accounts.evzone.app
const isProd = import.meta.env.PROD;
const devAuthorityOrigin = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
// Append /oidc to authority because backend now namespaces it
const prodAuthority = 'https://accounts.evzone.app/oidc';

let authority = isProd ? prodAuthority : `${new URL(devAuthorityOrigin).origin}/oidc`;
try {
    if (!isProd) {
        // Ensure we use the origin from env then append /oidc
        const origin = new URL(devAuthorityOrigin).origin;
        authority = `${origin}/oidc`;
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
