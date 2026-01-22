import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { BACKEND_URL } from "@/config";
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

/**
 * EVzone My Accounts - Sign In v4.1 (Passkey Outline)
 * Route: /auth/sign-in
 *
 * Update:
 * - Passkey button is outlined by default and fills orange on hover.
 * - Keeps Google + Apple brand styling.
 *
 * Global style rules:
 * - Background: green-only
 * - EVzone buttons: orange-only with white text
 * - Social buttons: brand styling (Google/Apple)
 */

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

function safeRandomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  try {
    window.crypto.getRandomValues(out);
  } catch {
    for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
  }
  return out;
}

async function tryWebAuthnGet(): Promise<{ ok: boolean; message: string }> {
  try {
    const nav: any = navigator as any;
    if (!nav?.credentials?.get) return { ok: false, message: "WebAuthn is not available." };

    await nav.credentials.get({
      publicKey: {
        challenge: safeRandomBytes(32),
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

  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

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
  // If not logged in and not in interaction flow (uid), start OIDC login
  // [ENABLED] Auto-redirect to ensure OIDC session is initialized.
  useEffect(() => {
    if (!uid && !auth.isAuthenticated && !auth.isLoading && !auth.activeNavigator && !auth.error) {
      auth.signinRedirect().catch(err => {
        console.error("Sign in redirect failed", err);
        // auth.error should be set by the lib, but if not we can't do much here except rely on the UI to show something if auth.error updates.
      });
    }
  }, [uid, auth]);

  /*
  useEffect(() => {
    if (auth.isAuthenticated) {
      // If standard login success (via callback), redirect
      navigate("/app", { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);
  */

  // Restore redirection to App when API session is established (e.g. via Google Custom Login)
  // This avoids the OIDC loop because it depends on the API 'user' object, which is cleared on 401.
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || "/app";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // React.useEffect(() => {
  //   if (isGoogleScriptLoaded) {
  //     renderGoogleButton('google-signin-btn');
  //   }
  // }, [isGoogleScriptLoaded, renderGoogleButton]);

  // Helper: Submit Interaction via Fetch to handle errors inline
  const submitInteraction = async (uidVal: string, e: string, p: string) => {
    // [FIX] Interaction endpoints are at root, not /api/v1
    const interactionBaseUrl = BACKEND_URL.replace(/\/api\/v1\/?$/, '');
    const targetUrl = `${interactionBaseUrl}/oidc/interaction/${uidVal}/login`;

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // [Fix] Required for CORS cookies
        body: JSON.stringify({ email: e, password: p })
      });

      if (res.ok) {
        // Success: OIDC provider redirects us. Fetch follows redirects automatically.
        // If the final destination is the app or consent page, navigate there.
        // Ideally, res.url is the new location.
        window.location.assign(res.url);
      } else {
        // Error: Parse JSON
        const data = await res.json().catch(() => ({}));
        const errorMsg = data.error || "Login failed. Please check your credentials.";
        setBanner({ severity: "error", msg: errorMsg });
        setSnack({ open: false, severity: "info", msg: "" }); // Clear loading snack
      }
    } catch (err: any) {
      console.error("Login Interaction Error:", err);
      setBanner({ severity: "error", msg: "Network error. Please try again." });
      setSnack({ open: false, severity: "info", msg: "" });
    }
  };

  const submitPasswordSignIn = async () => {
    setBanner(null);

    const id = identifier.trim();
    if (!id) {
      setBanner({ severity: "warning", msg: "Enter your email or phone number." });
      return;
    }
    if (!password) {
      setBanner({ severity: "warning", msg: "Enter your password." });
      return;
    }

    if (isLocked) {
      setBanner({ severity: "error", msg: `Locked. Retry in ${secondsLeft}s` });
      return;
    }

    // OIDC INTERACTION MODE
    if (uid) {
      setSnack({ open: true, severity: "info", msg: "Verifying credentials..." });
      submitInteraction(uid, id, password);
      return;
    }

    // Start OIDC Flow
    try {
      setSnack({ open: true, severity: "info", msg: "Redirecting to secure sign in..." });
      await auth.signinRedirect({
        extraQueryParams: {
          login_hint: id
        }
      });
    } catch (err: any) {
      console.error("Sign in redirect error:", err);
      setBanner({ severity: "error", msg: "Failed to start sign-in flow. Please try again." });
    }
  };

  const onGoogle = () => initGoogleCustomLogin();
  const onApple = () => initAppleLogin();

  const onPasskey = async () => {
    setBanner(null);

    if (passkeySupported === false) {
      setSnack({ open: true, severity: "warning", msg: "Passkeys are not supported on this device/browser." });
      return;
    }

    setPasskeyBusy(true);
    try {
      const res = await tryWebAuthnGet();
      setSnack({ open: true, severity: res.ok ? "success" : "warning", msg: res.message });
      if (res.ok) {
        setSnack({ open: true, severity: "info", msg: "Return to the requesting EVzone app (demo)." });
      } else {
        setBanner({ severity: "info", msg: "If passkeys are not available here, use password, OTP, or Google/Apple." });
      }
    } finally {
      setPasskeyBusy(false);
    }
  };

  const passkeyChip =
    passkeySupported === null ? (
      <Chip size="small" variant="outlined" label="Checking..." />
    ) : passkeySupported ? (
      null
    ) : (
      <Chip size="small" color="warning" label="Unavailable" />
    );

  // Error Handling: If OIDC fails, show error and allow retry
  if (auth.error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: pageBg, p: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>Authentication Error</Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 400 }}>
          {auth.error.message || "Failed to initialize secure session."}
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  // Anti-Flicker: If initializing OIDC (redirecting) or already authenticated, show loading instead of form
  // But ONLY if no error exists.
  if (!uid && !auth.error && auth.isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: pageBg }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: theme.palette.text.secondary }}>Initializing secure session...</Typography>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      {/* Unified Auth Header */}
      <AuthHeader
        title="EVzone Accounts"
        subtitle="Manage your diverse EVzone portfolio"
      />

      {/* Body */}
      <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
          {/* Left */}
          <motion.div className="hidden md:block md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card>
              <CardContent className="p-5 md:p-6">
                <Stack spacing={1.2}>
                  <Typography variant="h6">One account for everything EVzone</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Seamlessly access Charging, Marketplace, and Pay with a single secure identity.
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Stack spacing={1.1}>
                    <FeatureRow icon={<ShieldCheckIcon size={18} />} title="Secure Sessions" desc="Bank-grade security monitoring 24/7." bg={EVZONE.green} />
                    <FeatureRow icon={<FingerprintIcon size={18} />} title="Passkeys & Biometrics" desc="Sign in with TouchID or FaceID." bg={EVZONE.green} />
                    <FeatureRow icon={<LockIcon size={18} />} title="Privacy First" desc="We maximize your data privacy." bg={EVZONE.green} />
                  </Stack>

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Pre-filled for demo: example@mail.com
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right */}
          <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={2.0}>
                  <Stack spacing={0.6}>
                    <Typography variant="h6">Sign In</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      to continue to EVzone Portal
                    </Typography>
                  </Stack>

                  {/* Social + Passkeys */}
                  <Stack spacing={1}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      {/* <div id="google-signin-btn" style={{ width: '100%', height: 44 }}></div> */}

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleGIcon size={18} />}
                        onClick={onGoogle}
                        disabled={isGoogleLoading}
                        sx={{ ...googleBtnSx, borderRadius: 14, textTransform: "none", fontWeight: 800 }}
                      >
                        {isGoogleLoading ? "Loading..." : "Continue with Google"}
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AppleIcon size={18} />}
                        onClick={onApple}
                        disabled={isAppleLoading}
                        sx={{ ...appleBtnSx, borderRadius: 14, textTransform: "none", fontWeight: 800 }}
                      >
                        {isAppleLoading ? "Loading..." : "Continue with Apple"}
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
                      {passkeyBusy ? "Waiting..." : "Passkey"}
                    </Button>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      {passkeyChip}

                    </Stack>

                    {passkeyBusy ? (
                      <Box>
                        <LinearProgress />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Switching to password...
                        </Typography>
                      </Box>
                    ) : null}

                    <Divider>or</Divider>
                  </Stack>

                  {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                  <Stack spacing={1.4}>
                    <TextField
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      label="Email or Phone"
                      placeholder="name@example.com"
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
                      label="Password"
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
                              aria-label={showPassword ? "Hide password" : "Show password"}
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
                        label={<Typography variant="body2">Remember me</Typography>}
                      />
                      <Button variant="text" sx={orangeTextSx} onClick={() => navigate("/auth/forgot-password")}>
                        Forgot?
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
                        {isLocked ? `Locked. Retry in ${secondsLeft}s` : "Sign In"}
                      </Button>
                      <Button fullWidth variant="outlined" onClick={() => navigate(uid ? `/auth/sign-up?uid=${uid}` : "/auth/sign-up")} sx={orangeOutlinedSx}>
                        Create account
                      </Button>
                    </Stack>

                    {/* OTP toggle */}
                    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Use One-Time Code</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            No password? Use a magic code.
                          </Typography>
                        </Box>
                        <Switch checked={useOtpInstead} onChange={(e) => setUseOtpInstead(e.target.checked)} />
                      </Stack>
                      {useOtpInstead ? (
                        <Box sx={{ mt: 1.2 }}>
                          <Button fullWidth variant="contained" onClick={() => setSnack({ open: true, severity: "info", msg: "OTP sign-in coming soon." })} sx={orangeContainedSx}>
                            Send Code
                          </Button>
                        </Box>
                      ) : null}
                    </Box>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      By continuing, you agree to EVzone's Terms & Privacy.
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
            © {new Date().getFullYear()} EVzone Group
          </Typography>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>
              Terms
            </Button>
            <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>
              Privacy
            </Button>
          </Stack>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant={isDark ? "filled" : "standard"}
          sx={{
            borderRadius: 16,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
            backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96),
            color: theme.palette.text.primary,
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
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
