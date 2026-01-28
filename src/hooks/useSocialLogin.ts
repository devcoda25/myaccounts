import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

declare global {
    interface Window {
        google: any;
        AppleID: any;
    }
}

export function useSocialLogin() {
    const { socialLogin } = useAuthStore();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);

    useEffect(() => {
        // Load Google GSI script
        if (!document.getElementById('google-gsi-script')) {
            const script = document.createElement('script');
            script.id = 'google-gsi-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => setIsGoogleScriptLoaded(true);
            document.head.appendChild(script);
        } else if (window.google && !isGoogleScriptLoaded) {
            setIsGoogleScriptLoaded(true);
        }

        // Load Apple script
        if (!document.getElementById('apple-auth-script')) {
            const script = document.createElement('script');
            script.id = 'apple-auth-script';
            script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    }, [isGoogleScriptLoaded]);

    const initGoogleLogin = (uid?: string) => {


        if (!window.google) {
            console.error('[useSocialLogin] Google script not loaded');
            return;
        }

        setIsGoogleLoading(true);
        try {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                use_fedcm_for_prompt: true, // Opt-in to FedCM
                callback: async (response: any) => {
                    // console.log('[useSocialLogin] Google callback received', response);
                    try {
                        await socialLogin('google', response.credential, uid);
                    } catch (err) {
                        console.error('Google Login Error:', err);
                    } finally {
                        setIsGoogleLoading(false);
                    }
                },
            });
            // window.google.accounts.id.prompt();
        } catch (e) {
            console.error('[useSocialLogin] Exception during init:', e);
            setIsGoogleLoading(false);
        }
    };

    const initAppleLogin = async (uid?: string) => {
        if (!window.AppleID) return;

        setIsAppleLoading(true);
        try {
            window.AppleID.auth.init({
                clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
                scope: 'name email',
                redirectURI: window.location.origin + '/auth/continue',
                usePopup: true,
            });

            const response = await window.AppleID.auth.signIn();
            if (response.authorization?.id_token) {
                await socialLogin('apple', response.authorization.id_token, uid);
            }
        } catch (err) {
            console.error('Apple Login Error:', err);
        } finally {
            setIsAppleLoading(false);
        }
    };

    const renderGoogleButton = (elementId: string, text: 'signin_with' | 'signup_with' | 'continue_with' = 'signin_with', uid?: string) => {
        if (!window.google) return;

        try {
            const element = document.getElementById(elementId);
            if (!element) return;

            // Re-initialize to ensure config is fresh
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                use_fedcm_for_prompt: true,
                callback: async (response: any) => {
                    try {
                        await socialLogin('google', response.credential, uid);
                    } catch (err) {
                        console.error('Google Login Error:', err);
                    }
                },
            });

            window.google.accounts.id.renderButton(
                element,
                // Removed explicit width to allow auto-sizing
                { theme: "outline", size: "large", type: "standard", text: text }
            );
        } catch (e) {
            console.error('[useSocialLogin] Failed to render button:', e);
        }
    };

    const initGoogleCustomLogin = (uid?: string, onSuccess?: (token: string) => void) => {
        if (!window.google) return;

        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: async (response: any) => {
                if (response.access_token) {
                    if (onSuccess) {
                        onSuccess(response.access_token);
                        return;
                    }
                    try {
                        setIsGoogleLoading(true);
                        await socialLogin('google', response.access_token, uid);
                    } catch (err) {
                        console.error('Google Custom Login Error:', err);
                    } finally {
                        setIsGoogleLoading(false);
                    }
                }
            },
        });

        client.requestAccessToken();
    };

    return {
        initGoogleLogin,
        initGoogleCustomLogin,
        renderGoogleButton,
        initAppleLogin,
        isGoogleLoading,
        isAppleLoading,
        isGoogleScriptLoaded,
    };
}
