import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - MFA Challenge
 * Route: /auth/mfa
 *
 * Update:
 * - Added WhatsApp as an MFA option (Authenticator, SMS, WhatsApp, Email OTP).
 *
 * Style rules:
 * - Background: green-only
 * - Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 *
 * Features:
 * - Method tabs: Authenticator (TOTP), SMS, WhatsApp, Email OTP (fallback)
 * - OTP input
 * - Try another method (dialog)
 * - Use recovery code
 * - Trust this device (checkbox) → sets a device token
 */

type ThemeMode = "light" | "dark";

type Method = "totp" | "sms" | "whatsapp" | "email";

type Step = "challenge" | "success";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

// -----------------------------
// Inline icon set (CDN-safe)
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
      <path d="M4.9 4.9l1.4 1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17.7 17.7l1.4 1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19.1 4.9l-1.4 1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.3 17.7l-1.4 1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M21 13a8 8 0 0 1-10-10 7.5 7.5 0 1 0 10 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function GlobeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3c3 3 3 15 0 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function KeypadIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7h.01M12 7h.01M15 7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 11h.01M12 11h.01M15 11h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 15h.01M12 15h.01M15 15h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

function SmsIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  // Official WhatsApp logo path (Font Awesome). Uses currentColor.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 448 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="m8.5 12 2.3 2.3L15.8 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// -----------------------------
// Theme helpers
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
// OTP input
// -----------------------------
function OtpInput({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  autoFocus?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!autoFocus) return;
    window.setTimeout(() => refs.current[0]?.focus(), 200);
  }, [autoFocus]);

  const setDigit = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = d;
    onChange(next);
    if (d && i < next.length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPasteFirst = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, value.length);
    if (!text) return;
    e.preventDefault();

    const chars = text.split("");
    const next = [...value];
    for (let i = 0; i < next.length; i++) next[i] = chars[i] || "";
    onChange(next);
    const lastIndex = Math.min(next.length - 1, text.length - 1);
    window.setTimeout(() => refs.current[lastIndex]?.focus(), 0);
  };

  return (
    <Box className="grid grid-cols-6 gap-2">
      {value.map((digit, i) => (
        <Box key={i}>
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={digit}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={i === 0 ? onPasteFirst : undefined}
            inputMode="numeric"
            maxLength={1}
            className="w-full rounded-xl border border-white/10 bg-transparent px-0 py-3 text-center text-lg font-extrabold outline-none"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
            }}
            aria-label={`OTP digit ${i + 1}`}
          />
        </Box>
      ))}
    </Box>
  );
}

export default function MfaChallengePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [step, setStep] = useState<Step>("challenge");
  const [method, setMethod] = useState<Method>("totp");

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [trustDevice, setTrustDevice] = useState(true);

  const [cooldown, setCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const [methodDialog, setMethodDialog] = useState(false);
  const [banner, setBanner] = useState<
    { severity: "error" | "warning" | "info" | "success"; msg: string } | null
  >(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    severity: "success" | "info" | "warning" | "error";
    msg: string;
  }>({ open: false, severity: "info", msg: "" });

  // Green-only background
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
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.35),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) },
  } as const;

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const secondsLeft = isLocked ? Math.max(1, Math.ceil((lockedUntil! - Date.now()) / 1000)) : 0;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    // reset OTP when switching method
    setOtp(["", "", "", "", "", ""]);
    setBanner(null);
    if (method === "totp") {
      setCodeSent(false);
      setCooldown(0);
    } else {
      setCodeSent(false);
      setCooldown(0);
    }
  }, [method]);

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const methodIndex = method === "totp" ? 0 : method === "sms" ? 1 : method === "whatsapp" ? 2 : 3;

  const sendCode = () => {
    if (method === "totp") return;
    setCodeSent(true);
    setCooldown(30);

    const msg =
      method === "sms"
        ? "SMS code sent. Demo: 222222"
        : method === "whatsapp"
          ? "WhatsApp code sent. Demo: 333333"
          : "Email OTP sent. Demo: 111111";

    setSnack({ open: true, severity: "success", msg });
  };

  const resendCode = () => {
    if (method === "totp") return;
    if (cooldown > 0) return;
    sendCode();
  };

  const expectedCode =
    method === "totp" ? "654321" : method === "sms" ? "222222" : method === "whatsapp" ? "333333" : "111111";

  const verify = () => {
    setBanner(null);

    if (isLocked) {
      setBanner({ severity: "error", msg: `Too many attempts. Try again in ${secondsLeft}s.` });
      return;
    }

    if ((method === "sms" || method === "whatsapp" || method === "email") && !codeSent) {
      setBanner({ severity: "warning", msg: "Please send the code first." });
      return;
    }

    const code = otp.join("");
    if (code.length < 6) {
      setBanner({ severity: "warning", msg: "Enter the 6-digit code." });
      return;
    }

    if (code !== expectedCode) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockedUntil(Date.now() + 30_000);
        setBanner({ severity: "error", msg: "Too many failed attempts. Locked for 30 seconds." });
        return;
      }
      setBanner({ severity: "error", msg: "Incorrect code. Please try again." });
      return;
    }

    // Success
    setAttempts(0);
    setLockedUntil(null);
    if (trustDevice) {
      try {
        window.localStorage.setItem("evzone_trusted_device", "true");
      } catch {
        // ignore
      }
    }

    setStep("success");
    setSnack({ open: true, severity: "success", msg: "Verification complete." });
  };

  const continueNext = () => {
    navigate("/app");
  };

  const openRecovery = () => {
    navigate("/auth/recovery-code");
  };

  const methodTitle =
    method === "totp"
      ? "Authenticator (TOTP)"
      : method === "sms"
        ? "SMS OTP"
        : method === "whatsapp"
          ? "WhatsApp OTP"
          : "Email OTP";

  const methodHelp =
    method === "totp"
      ? "Open your authenticator app and enter the current code."
      : method === "sms"
        ? "Send a code to your phone number, then enter it here."
        : method === "whatsapp"
          ? "Send a code to your WhatsApp number, then enter it here."
          : "Send a code to your email address, then enter it here.";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top bar */}
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
                    Multi-factor authentication
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
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
            <motion.div
              className="md:col-span-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card>
                <CardContent className="p-5 md:p-6">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">Verify it’s you</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      For your security, we require a second step to confirm it’s really you signing in.
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 14,
                            display: "grid",
                            placeItems: "center",
                            backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10),
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          }}
                        >
                          <ShieldCheckIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Strong protection</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            MFA blocks most account takeover attempts.
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 14,
                            display: "grid",
                            placeItems: "center",
                            backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10),
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          }}
                        >
                          <KeypadIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Multiple options</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Use Authenticator, SMS, WhatsApp, or Email OTP.
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={trustDevice}
                          onChange={(e) => setTrustDevice(e.target.checked)}
                          sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>
                            Trust this device
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            You will be prompted less often on this device.
                          </Typography>
                        </Box>
                      }
                    />

                    <Divider sx={{ my: 1 }} />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setMethodDialog(true)}>
                        Try another method
                      </Button>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={openRecovery}>
                        Use recovery code
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Demo codes: Authenticator <b>654321</b>, SMS <b>222222</b>, WhatsApp <b>333333</b>, Email <b>111111</b>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right */}
            <motion.div
              className="md:col-span-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <Card>
                <CardContent className="p-5 md:p-7">
                  {step === "success" ? (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: EVZONE.green }}>
                          <CheckCircleIcon size={22} />
                        </Box>
                        <Typography variant="h6">Verified</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        You’ve successfully completed multi-factor authentication.
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<ArrowRightIcon size={18} />}
                        sx={orangeContainedSx}
                        onClick={continueNext}
                      >
                        Continue
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">Enter your code</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Choose a method and enter the 6-digit code.
                        </Typography>
                      </Stack>

                      {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                      <Tabs
                        value={methodIndex}
                        onChange={(_, v) =>
                          setMethod(v === 0 ? "totp" : v === 1 ? "sms" : v === 2 ? "whatsapp" : "email")
                        }
                        variant="fullWidth"
                        sx={{
                          borderRadius: 16,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          overflow: "hidden",
                          minHeight: 44,
                          "& .MuiTab-root": { minHeight: 44, fontWeight: 900 },
                          "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 },
                        }}
                      >
                        <Tab icon={<KeypadIcon size={16} />} iconPosition="start" label="Authenticator" />
                        <Tab icon={<SmsIcon size={16} />} iconPosition="start" label="SMS" />
                        <Tab icon={<WhatsAppIcon size={16} />} iconPosition="start" label="WhatsApp" />
                        <Tab icon={<MailIcon size={16} />} iconPosition="start" label="Email" />
                      </Tabs>

                      <Box
                        sx={{
                          borderRadius: 18,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.45),
                          p: 1.4,
                        }}
                      >
                        <Stack spacing={1}>
                          <Typography sx={{ fontWeight: 900 }}>{methodTitle}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {methodHelp}
                          </Typography>

                          {method !== "totp" ? (
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button
                                variant="contained"
                                color="secondary"
                                sx={orangeContainedSx}
                                onClick={sendCode}
                                disabled={cooldown > 0 && codeSent}
                              >
                                {codeSent ? "Code sent" : "Send code"}
                              </Button>
                              <Button
                                variant="outlined"
                                sx={orangeOutlinedSx}
                                onClick={resendCode}
                                disabled={!codeSent || cooldown > 0}
                              >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                              </Button>
                            </Stack>
                          ) : null}
                        </Stack>
                      </Box>

                      <OtpInput value={otp} onChange={setOtp} autoFocus />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          endIcon={<ArrowRightIcon size={18} />}
                          sx={orangeContainedSx}
                          onClick={verify}
                          disabled={isLocked}
                        >
                          {isLocked ? `Try again in ${secondsLeft}s` : "Verify"}
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={orangeOutlinedSx}
                          onClick={() => setMethodDialog(true)}
                        >
                          Try another method
                        </Button>
                      </Stack>

                      <Button variant="text" sx={orangeTextSx} onClick={openRecovery}>
                        Use recovery code
                      </Button>
                    </Stack>
                  )}
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
              <Button
                size="small"
                variant="text"
                sx={orangeTextSx}
                onClick={() => setSnack({ open: true, severity: "info", msg: "Open Terms (demo)" })}
              >
                Terms
              </Button>
              <Button
                size="small"
                variant="text"
                sx={orangeTextSx}
                onClick={() => setSnack({ open: true, severity: "info", msg: "Open Privacy (demo)" })}
              >
                Privacy
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Method dialog */}
        <Dialog
          open={methodDialog}
          onClose={() => setMethodDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 20,
              border: `1px solid ${theme.palette.divider}`,
              backgroundImage: "none",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 950 }}>Choose another method</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              {([
                { k: "totp" as const, title: "Authenticator", icon: <KeypadIcon size={18} /> },
                { k: "sms" as const, title: "SMS", icon: <SmsIcon size={18} /> },
                { k: "whatsapp" as const, title: "WhatsApp", icon: <WhatsAppIcon size={18} /> },
                { k: "email" as const, title: "Email OTP", icon: <MailIcon size={18} /> },
              ] as const).map((m) => {
                const selected = method === m.k;
                return (
                  <Button
                    key={m.k}
                    variant={selected ? "contained" : "outlined"}
                    color="secondary"
                    startIcon={m.icon}
                    sx={selected ? orangeContainedSx : orangeOutlinedSx}
                    onClick={() => {
                      setMethod(m.k);
                      setMethodDialog(false);
                    }}
                    fullWidth
                  >
                    {m.title}
                  </Button>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setMethodDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={3400}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
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
