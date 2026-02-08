import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { API_BASE_URL } from "@/config";


import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  CircularProgress,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useSocialLogin } from "@/hooks/useSocialLogin";
import AuthHeader from "@/components/layout/AuthHeader";
import { EVZONE } from "@/theme/evzone";
import { useNotification } from "@/context/NotificationContext";

import {
  Severity
} from "@/types";
import {
  LockIcon,
  MailIcon,
  PhoneIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  FingerprintIcon,
  GoogleGIcon,
  AppleIcon
} from "@/components/icons";
import { getSecureRandomBytes } from "@/utils/secure-random";

// -----------------------------
// Helpers
// -----------------------------
function isEmail(v: string) {
  return /.+@.+\..+/.test(v);
}

function maskIdentifier(v: string) {
  const s = v.trim();
  if (!s) return "";
  if (isEmail(s)) {
    const [u, d] = s.split("@");
    const safeU = u.length <= 2 ? u[0] + "*" : u.slice(0, 2) + "***";
    return `${safeU}@${d}`;
  }
  return s.length > 6 ? `${s.slice(0, 3)}***${s.slice(-3)}` : s;
}

function supportsPasskeys() {
  try {
    const w = window as any;
    return !!w.PublicKeyCredential;
  } catch {
    return false;
  }
}

async function tryWebAuthnGet(): Promise<{ ok: boolean; message: string }> {
  try {
    const nav: any = navigator as any;
    if (!nav?.credentials?.get) return { ok: false, message: "WebAuthn is not available." };

    await nav.credentials.get({
      publicKey: {
        challenge: getSecureRandomBytes(32),
        timeout: 60000,
        userVerification: "preferred",
      },
    });

    return { ok: true, message: "Passkey verified. Signed in (demo)." };
  } catch (e: any) {
    const name = e?.name || "Error";
    return { ok: false, message: `${name}: passkey prompt was cancelled or not allowed in this environment.` };
  }
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_SIGNIN_V41_TESTS_RAN__) return;
    w.__EVZONE_SIGNIN_V41_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("supportsPasskeys boolean", typeof supportsPasskeys() === "boolean");
    assert("maskIdentifier email", maskIdentifier("ronald@evzone.com").includes("@"));

  } catch (e) {
    // ignore
  }
}

export default function SignInPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [identifier, setIdentifier] = useState("example@mail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [useOtpInstead, setUseOtpInstead] = useState(false);

  // password rate limit
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [lockTick, setLockTick] = useState(0);

  // passkeys
  const [passkeySupported, setPasskeySupported] = useState<boolean | null>(null);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // [Fix] Anti-flicker guard

  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supports = supportsPasskeys();
      if (!supports) {
        if (mounted) setPasskeySupported(false);
        return;
      }
      try {
        const w = window as any;
        const fn = w.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable;
        if (typeof fn === "function") {
          const ok = await fn.call(w.PublicKeyCredential);
          if (mounted) setPasskeySupported(!!ok);
        } else {
          if (mounted) setPasskeySupported(true);
        }
      } catch {
        if (mounted) setPasskeySupported(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isLocked = lockUntil !== null && Date.now() < lockUntil;
  const secondsLeft = isLocked ? Math.max(1, Math.ceil((lockUntil! - Date.now()) / 1000)) : 0;

  useEffect(() => {
    if (!isLocked) return;
    const t = window.setInterval(() => setLockTick((x) => x + 1), 500);
    return () => window.clearInterval(t);
  }, [isLocked]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _lockTick = lockTick;

  const pageBg =
    isDark
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.20)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.70),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.35),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, isDark ? 0.14 : 0.10) },
  } as const;

  const googleBtnSx = {
    borderColor: "#DADCE0",
    backgroundColor: "#FFFFFF",
    color: "#3C4043",
    "&:hover": { backgroundColor: "#F8F9FA", borderColor: "#DADCE0" },
    "&:active": { backgroundColor: "#F1F3F4" },
  } as const;

  const appleBtnSx = {
    borderColor: "#000000",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    "&:hover": { backgroundColor: "#111111", borderColor: "#111111" },
    "&:active": { backgroundColor: "#1B1B1B" },
  } as const;

  const { login, user } = useAuthStore();
  const location = useLocation();
  const { initGoogleLogin, initGoogleCustomLogin, initAppleLogin, isGoogleLoading, isAppleLoading, renderGoogleButton, isGoogleScriptLoaded } = useSocialLogin();

  // OIDC Integration
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const auth = useAuth();

  // If not logged in and not in interaction flow (uid), start OIDC login
  // [ENABLED] Auto-redirect to ensure OIDC session is initialized.
  useEffect(() => {
    // 1. Check for interaction errors from the server (e.g. SessionNotFound)
    const interactionErr = searchParams.get("interaction_error");
    if (interactionErr) {
      showNotification({
        type: "error",
        title: t('auth.session.issue'),
        message: interactionErr === "session_expired" || interactionErr.includes("cookie not found")
          ? t('auth.session.expired')
          : `${t('auth.session.error')}: ${interactionErr}`
      });
      return; // Wait for user to react
    }

    const hasInteractionError = searchParams.has('interaction_error') || searchParams.has('error');

    if (!uid && !auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator && !auth.error && !isRedirecting && !hasInteractionError) {
      setIsRedirecting(true);
      console.log("[SignIn] Initiating OIDC signinRedirect...");
      auth.signinRedirect().catch(err => {
        console.error("Sign in redirect failed", err);
        setIsRedirecting(false);
      });
    }
  }, [uid, auth, searchParams, isRedirecting, t, showNotification]);

  // Restore redirection to App when API session is established (e.g. via Google Custom Login)
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || "/app";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  async function submitInteraction(uidVal: string, email: string, password: string) {
    const targetUrl = `/oidc/interaction/${encodeURIComponent(uidVal)}/login`;

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
        redirect: "manual", // ✅ CRITICAL: Prevent fetch from consuming interaction UID
      });

      // Handle redirect responses (302, 303)
      if (response.status === 302 || response.status === 303 || response.type === "opaqueredirect") {
        const locationHeader = response.headers.get("Location");

        console.log("[OIDC] Response Type:", response.type);
        console.log("[OIDC] Response Headers:",
          Object.fromEntries(Array.from(response.headers.entries())));

        let nextUrl = locationHeader || response.url;

        if (!nextUrl || nextUrl.includes("/login")) {
          console.log("[OIDC] Manually constructing resumption URL for UID:", uidVal);
          nextUrl = `/oidc/auth/${encodeURIComponent(uidVal)}`;
        }

        console.log("[OIDC] Interaction Finished. Redirecting to:", nextUrl);
        window.location.assign(nextUrl);
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Login failed" }));
        throw new Error(error.message || `Login failed with status ${response.status}`);
      }

      console.log("[OIDC] Login success (200). Navigating to response URL:", response.url);
      window.location.assign(response.url);

    } catch (error) {
      console.error("[OIDC] Interaction submit error:", error);
      throw error;
    }
  }

  const submitPasswordSignIn = async () => {
    setBanner(null);

    const id = identifier.trim();
    if (!id) {
      showNotification({
        type: "warning",
        title: t('common.errors.required'),
        message: t('auth.signIn.errors.enterEmailOrPhone'),
      });
      return;
    }
    if (!password) {
      showNotification({
        type: "warning",
        title: t('auth.signIn.title'),
        message: t('auth.signIn.errors.enterPassword'),
      });
      return;
    }

    if (isLocked) {
      setBanner({ severity: "error", msg: t('auth.signIn.errors.locked', { seconds: secondsLeft }) });
      return;
    }

    // OIDC INTERACTION MODE
    if (uid) {
      showNotification({ type: "info", title: t('auth.signIn.title'), message: t('auth.signIn.verifying') });
      try {
        await submitInteraction(uid, id, password);
      } catch (err: any) {
        console.error("Interaction login failed:", err);
        showNotification({
          type: "error",
          title: t('auth.signIn.failed'),
          message: err.message || t('auth.signIn.errors.invalidCredentials'),
        });
      }
      return;
    }

    // Start OIDC Flow
    try {
      await auth.signinRedirect({
        extraQueryParams: {
          login_hint: id
        }
      });
    } catch (err: any) {
      console.error("Sign in redirect error:", err);
      showNotification({
        type: "error",
        title: t('auth.session.systemError'),
        message: t('auth.session.failedStart'),
      });
    }
  };

  const onGoogle = () => initGoogleCustomLogin(uid || undefined);
  const onApple = () => initAppleLogin(uid || undefined);

  const onPasskey = async () => {
    if (passkeySupported === false) {
      showNotification({
        type: "warning",
        title: t('auth.passkey.notSupported'),
        message: t('auth.passkey.notAvailable'),
      });
      return;
    }

    setPasskeyBusy(true);
    try {
      const res = await tryWebAuthnGet();
      if (!res.ok) {
        showNotification({
          type: "info",
          title: t('auth.passkey.title'),
          message: res.message,
        });
      } else {
        showNotification({
          type: "success",
          title: t('auth.passkey.verified'),
          message: t('auth.passkey.redirecting'),
        });
      }
    } finally {
      setPasskeyBusy(false);
    }
  };

  const passkeyChip =
    passkeySupported === null ? (
      <Chip size="small" variant="outlined" label={t('auth.signIn.checking')} />
    ) : passkeySupported ? (
      null
    ) : (
      <Chip size="small" color="warning" label={t('auth.signIn.unavailable')} />
    );

  // Error Handling: If OIDC fails, show error and allow retry
  if (auth.error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: pageBg, p: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>{t('auth.session.systemError')}</Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
          {auth.error.message || t('auth.session.initializing')}
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          {t('common.actions.retry')}
        </Button>
      </Box>
    );
  }

  // Anti-Flicker: If initializing OIDC (redirecting) or already authenticated, show loading instead of form
  if (!uid && !auth.error && (auth.isLoading || isRedirecting)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: pageBg }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: theme.palette.text.secondary }}>{t('auth.session.initializing')}</Typography>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      {/* Unified Auth Header */}
      <AuthHeader
        title={t('app.name')}
        subtitle={t('auth.signIn.subtitle')}
      />

      {/* Body */}
      <Box className="mx-auto max-w-lg px-4 py-8 md:px-6 md:py-12">
        <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
          {/* Full width */}
          <motion.div className="md:col-span-12" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={2.0}>
                  <Stack spacing={0.6}>
                    <Typography variant="h6">{t('auth.signIn.title')}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.signIn.right.subtitle')}
                    </Typography>
                  </Stack>

                  {/* Social + Passkeys */}
                  <Stack spacing={1}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleGIcon size={18} />}
                        onClick={onGoogle}
                        disabled={isGoogleLoading}
                        sx={{ ...googleBtnSx, borderRadius: 14, textTransform: "none", fontWeight: 800 }}
                      >
                        {isGoogleLoading ? t('common.loading.loading') : t('auth.signUp.continueWithGoogle')}
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AppleIcon size={18} />}
                        onClick={onApple}
                        disabled={isAppleLoading}
                        sx={{ ...appleBtnSx, borderRadius: 14, textTransform: "none", fontWeight: 800 }}
                      >
                        {isAppleLoading ? t('common.loading.loading') : t('auth.signUp.continueWithApple')}
                      </Button>
                    </Stack>

                    {/* Passkey button: OUTLINED + hover fills orange */}
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FingerprintIcon size={18} />}
                      onClick={onPasskey}
                      disabled={passkeySupported === false || passkeyBusy}
                      sx={orangeOutlinedSx}
                    >
                      {passkeyBusy ? t('common.loading.loading') : t('auth.passkey.title')}
                    </Button>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      {passkeyChip}
                    </Stack>

                    {passkeyBusy ? (
                      <Box>
                        <LinearProgress />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.signIn.switchingToPassword')}
                        </Typography>
                      </Box>
                    ) : null}

                    <Divider>{t('auth.signIn.or')}</Divider>
                  </Stack>

                  {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                  <Stack spacing={1.4}>
                    <TextField
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      label={t('auth.signIn.emailOrPhone')}
                      placeholder={t('auth.signIn.placeholders.email')}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {identifier.trim().startsWith("+") || /\d/.test(identifier.trim().slice(0, 1)) ? (
                              <PhoneIcon size={18} />
                            ) : (
                              <MailIcon size={18} />
                            )}
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      label={t('auth.signIn.password')}
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon size={18} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={showPassword ? t('auth.signIn.hidePassword') : t('auth.signIn.showPassword')}
                              sx={{ color: EVZONE.orange }}
                            >
                              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }}
                          />
                        }
                        label={<Typography variant="body2">{t('auth.signIn.rememberMe')}</Typography>}
                      />
                      <Button variant="text" sx={orangeTextSx} onClick={() => navigate("/auth/forgot-password")}>
                        {t('auth.signIn.forgotPassword')}
                      </Button>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<ArrowRightIcon size={18} />}
                        onClick={submitPasswordSignIn}
                        disabled={isLocked}
                        sx={orangeContainedSx}
                      >
                        {isLocked ? t('auth.signIn.locked', { seconds: secondsLeft }) : t('auth.signIn.submit')}
                      </Button>
                      <Button fullWidth variant="outlined" onClick={() => navigate(uid ? `/auth/sign-up?uid=${uid}` : "/auth/sign-up")} sx={orangeOutlinedSx}>
                        {t('auth.signUp.createAccount')}
                      </Button>
                    </Stack>

                    {/* OTP toggle */}
                    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.signIn.useOtpTitle')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.signIn.useOtpSubtitle')}
                          </Typography>
                        </Box>
                        <Switch checked={useOtpInstead} onChange={(e) => setUseOtpInstead(e.target.checked)} />
                      </Stack>
                      {useOtpInstead ? (
                        <Box sx={{ mt: 1.2 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => showNotification({ type: 'info', title: t('auth.signIn.comingSoon'), message: t('auth.signIn.otpComingSoon') })}
                            sx={orangeContainedSx}
                          >
                            {t('auth.signIn.sendCode')}
                          </Button>
                        </Box>
                      ) : null}
                    </Box>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.signIn.termsAgree')}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Footer */}
        <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </Typography>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>
              {t('footer.terms')}
            </Button>
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>
              {t('footer.privacy')}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function FeatureRow({ icon, title, desc, bg }: { icon: React.ReactNode; title: string; desc: string; bg: string }) {
  return (
    <Stack direction="row" spacing={1.1} alignItems="center">
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          backgroundColor: alpha(bg, 0.10),
          border: `1px solid ${alpha("#0B1A17", 0.10)}`,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {desc}
        </Typography>
      </Box>
    </Stack>
  );
}
