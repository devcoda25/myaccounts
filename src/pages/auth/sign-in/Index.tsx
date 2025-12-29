import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

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

type ThemeMode = "light" | "dark";

type Severity = "success" | "info" | "warning" | "error";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

// -----------------------------
// Inline icons (CDN-safe)
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      {children}
    </svg>
  );
}

function SunIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M21 13a8 8 0 0 1-10-10 7.5 7.5 0 1 0 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function GlobeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function HelpCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.9.3-1.2.8-1.2 1.6v.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12s3.5-7 10-7c2 0 3.8.5 5.3 1.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12s-3.5 7-10 7c-2.2 0-4.2-.5-5.8-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 10a3 3 0 0 0 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function FingerprintIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 11a3 3 0 0 1 3 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 14v2a6 6 0 0 0 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 14v2a9 9 0 0 0 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7a7 7 0 0 1 7 7v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7a7 7 0 0 0-7 7v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// Brand icons
function GoogleGIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.23 3.23l6.9-6.9C35.95 2.27 30.33 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.02 6.23C12.58 13.2 17.86 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.57-.14-3.08-.4-4.54H24v8.6h12.5c-.54 2.9-2.14 5.36-4.54 7.02l6.96 5.4C43.2 36.98 46.1 31.3 46.1 24.5z" />
      <path fill="#FBBC05" d="M10.58 28.45A14.9 14.9 0 0 1 9.8 24c0-1.55.27-3.05.78-4.45l-8.02-6.23A24.02 24.02 0 0 0 0 24c0 3.9.94 7.6 2.56 10.78l8.02-6.33z" />
      <path fill="#34A853" d="M24 48c6.33 0 11.65-2.1 15.54-5.72l-6.96-5.4c-1.94 1.3-4.42 2.07-8.58 2.07-6.14 0-11.42-3.7-13.42-8.95l-8.02 6.33C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function AppleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <path d="M318.7 268.7c-.2-37.3 16.4-65.6 51.5-87.2-19.2-27.5-48.2-42.6-86.5-45.5-36.5-2.9-76.3 21.3-90.9 21.3-15.4 0-50.5-20.3-78.3-20.3C56.8 137 0 181.7 0 273.4c0 27.1 5 55.1 15 84 13.4 37.3 61.7 128.9 112.1 127.4 26.2-.7 44.8-18.6 78.9-18.6 33.1 0 50.3 18.6 79.5 18.6 50.9-.7 94.6-82.7 107.3-120-58.2-27.7-74.2-79.5-74.1-96.1zM259.1 80.2c28.1-33.3 25.6-63.6 24.8-74.2-24.8 1.4-53.4 16.9-69.7 36-17.9 20.5-28.4 45.9-26.1 73.2 26.9 2.1 50.6-10.8 71-35z" />
    </svg>
  );
}

// -----------------------------
// Theme
// -----------------------------
function getStoredMode(): ThemeMode {
  try {
    const v = window.localStorage.getItem("evzone_myaccounts_theme");
    return v === "light" || v === "dark" ? (v as ThemeMode) : "light";
  } catch {
    return "light";
  }
}

function setStoredMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem("evzone_myaccounts_theme", mode);
  } catch {
    // ignore
  }
}

function buildTheme(mode: ThemeMode) {
  const isDark = mode === "dark";

  const bg = isDark ? "#07110F" : "#F4FFFB";
  const paper = isDark ? "#0B1A17" : "#FFFFFF";
  const textPrimary = isDark ? "#E9FFF7" : "#0B1A17";
  const textSecondary = isDark ? alpha("#E9FFF7", 0.74) : alpha("#0B1A17", 0.70);

  return createTheme({
    palette: {
      mode,
      primary: { main: EVZONE.green },
      secondary: { main: EVZONE.orange },
      background: { default: bg, paper },
      text: { primary: textPrimary, secondary: textSecondary },
      divider: isDark ? alpha("#E9FFF7", 0.12) : alpha("#0B1A17", 0.10),
    },
    shape: { borderRadius: 18 },
    typography: {
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
      h6: { fontWeight: 900, letterSpacing: -0.28 },
      subtitle1: { fontWeight: 760 },
      button: { fontWeight: 900, textTransform: "none" },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
            backgroundImage:
              "radial-gradient(900px 420px at 12% 0%, rgba(3,205,140,0.14), transparent 60%), radial-gradient(900px 420px at 88% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 14, paddingTop: 10, paddingBottom: 10, boxShadow: "none" },
        },
      },
    },
  });
}

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

    // eslint-disable-next-line no-console
    console.log("EVzone Sign In v4.1: self-tests passed");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

export default function SignInPageV41() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [identifier, setIdentifier] = useState("ronald@evzone.com");
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

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

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
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.20)}`,
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
    "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) },
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

  const submitPasswordSignIn = () => {
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
      setBanner({ severity: "error", msg: `Too many failed attempts. Try again in ${secondsLeft}s.` });
      return;
    }

    const ok = id.toLowerCase() === "ronald@evzone.com" && password === "EVzone123!";
    if (!ok) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= 3) {
        setLockUntil(Date.now() + 30_000);
        setBanner({ severity: "error", msg: "Too many failed attempts. Account temporarily locked for 30 seconds." });
        return;
      }

      setBanner({ severity: "error", msg: "Invalid credentials. Please check your details and try again." });
      return;
    }

    setAttempts(0);
    setLockUntil(null);
    setSnack({ open: true, severity: "success", msg: `Signed in successfully as ${maskIdentifier(id)}.` });

    if (rememberMe) {
      try {
        window.localStorage.setItem("evzone_device_session", "true");
      } catch {
        // ignore
      }
    }
  };

  const onGoogle = () => setSnack({ open: true, severity: "info", msg: "Google sign-in: redirecting (demo)." });
  const onApple = () => setSnack({ open: true, severity: "info", msg: "Apple sign-in: redirecting (demo)." });

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
      <Chip size="small" variant="outlined" label="Checking passkey support…" />
    ) : passkeySupported ? (
      <Chip size="small" color="success" label="Passkeys supported" />
    ) : (
      <Chip size="small" color="warning" label="Passkeys unavailable" />
    );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top Bar */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box className="mx-auto max-w-5xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background:
                      "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.82) 55%, rgba(3,205,140,0.62) 100%)",
                    boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.22)}`,
                  }}
                >
                  <Typography sx={{ color: "white", fontWeight: 900, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>
                    EVzone My Accounts
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Sign in to continue
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton
                    onClick={toggleMode}
                    size="small"
                    sx={{
                      border: `1px solid ${alpha(EVZONE.orange, 0.35)}`,
                      borderRadius: 12,
                      backgroundColor: alpha(theme.palette.background.paper, 0.6),
                      color: EVZONE.orange,
                    }}
                  >
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton
                    size="small"
                    sx={{
                      border: `1px solid ${alpha(EVZONE.orange, 0.35)}`,
                      borderRadius: 12,
                      backgroundColor: alpha(theme.palette.background.paper, 0.6),
                      color: EVZONE.orange,
                    }}
                  >
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Help">
                  <IconButton
                    size="small"
                    onClick={() => navigate("/auth/account-recovery-help")}
                    sx={{
                      border: `1px solid ${alpha(EVZONE.orange, 0.35)}`,
                      borderRadius: 12,
                      backgroundColor: alpha(theme.palette.background.paper, 0.6),
                      color: EVZONE.orange,
                    }}
                  >
                    <HelpCircleIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Body */}
        <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
          <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
            {/* Left */}
            <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-6">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">One account for all EVzone platforms</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Sign in once and continue securely across EVzone apps.
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={1.1}>
                      <FeatureRow icon={<ShieldCheckIcon size={18} />} title="Secure sessions" desc="Protected login with strong session controls." bg={EVZONE.green} />
                      <FeatureRow icon={<FingerprintIcon size={18} />} title="Passkeys" desc="Sign in with your device lock. Phishing-resistant." bg={EVZONE.green} />
                      <FeatureRow icon={<LockIcon size={18} />} title="Privacy first" desc="Minimal data sharing and clear permissions." bg={EVZONE.green} />
                    </Stack>

                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Demo login: <b>ronald@evzone.com</b> with password <b>EVzone123!</b>
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
                      <Typography variant="h6">Sign in</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Use passkey, Google/Apple, or email/phone and password.
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
                          sx={{ ...googleBtnSx, borderRadius: 14, textTransform: "none", fontWeight: 800 }}
                        >
                          Continue with Google
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AppleIcon size={18} />}
                          onClick={onApple}
                          sx={{ ...appleBtnSx, borderRadius: 14, textTransform: "none", fontWeight: 800 }}
                        >
                          Continue with Apple
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
                        {passkeyBusy ? "Waiting for passkey…" : "Continue with Passkey"}
                      </Button>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        {passkeyChip}
                        <Chip size="small" variant="outlined" label="You can set up passkeys later in Security" />
                      </Stack>

                      {passkeyBusy ? (
                        <Box>
                          <LinearProgress />
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            If the prompt does not appear, use password or OTP.
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
                        label="Email or phone"
                        placeholder="name@example.com or +256…"
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
                          label={<Typography variant="body2">Remember this device</Typography>}
                        />
                        <Button variant="text" sx={orangeTextSx} onClick={() => navigate("/auth/forgot-password")}>
                          Forgot password?
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
                          {isLocked ? `Try again in ${secondsLeft}s` : "Sign in"}
                        </Button>
                        <Button fullWidth variant="outlined" onClick={() => navigate("/auth/sign-up")} sx={orangeOutlinedSx}>
                          Create account
                        </Button>
                      </Stack>

                      {/* OTP toggle */}
                      <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1}>
                          <Box>
                            <Typography sx={{ fontWeight: 900 }}>Use OTP instead</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Sign in with a one-time code sent to your email or phone.
                            </Typography>
                          </Box>
                          <Switch checked={useOtpInstead} onChange={(e) => setUseOtpInstead(e.target.checked)} />
                        </Stack>
                        {useOtpInstead ? (
                          <Box sx={{ mt: 1.2 }}>
                            <Button fullWidth variant="contained" onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /auth/sign-in/otp" })} sx={orangeContainedSx}>
                              Continue with OTP
                            </Button>
                          </Box>
                        ) : null}
                      </Box>

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        By signing in, you agree to EVzone Terms and acknowledge the Privacy Policy.
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
              © {new Date().getFullYear()} EVzone Group.
            </Typography>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open Terms (demo)" })}>
                Terms
              </Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open Privacy (demo)" })}>
                Privacy
              </Button>
            </Stack>
          </Box>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant={mode === "dark" ? "filled" : "standard"}
            sx={{
              borderRadius: 16,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
              backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96),
              color: theme.palette.text.primary,
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
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
