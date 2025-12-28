import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Re-authentication Prompt
 * Route: /auth/re-auth
 * Purpose: Required for sensitive actions (wallet withdrawals, changing email/password, disabling MFA).
 *
 * Features:
 * • Confirm password OR MFA code
 * • Clear explanation: "For your security…"
 *
 * Style rules:
 * • Background: green-only
 * • Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 */

type ThemeMode = "light" | "dark";

type PromptMode = "password" | "mfa";

type MfaMethod = "totp" | "sms" | "email";

type Step = "prompt" | "success";

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

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M2 12s3.5-7 10-7c2 0 3.8.5 5.3 1.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 12s-3.5 7-10 7c-2.2 0-4.2-.5-5.8-1.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M10 10a3 3 0 0 0 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m8.5 12 2.3 2.3L15.8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

  const sanitizeDigits = (raw: string) => raw.replace(/[^0-9]/g, "");

  const setDigit = (i: number, raw: string) => {
    const digits = sanitizeDigits(raw);
    const d = digits.slice(-1);
    const next = [...value];
    next[i] = d;
    onChange(next);
    if (d && i < next.length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPasteFirst = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = sanitizeDigits(e.clipboardData.getData("text")).slice(0, value.length);
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

function getActionLabel(action: string | null) {
  switch ((action || "").toLowerCase()) {
    case "withdraw":
    case "withdrawal":
      return "Wallet withdrawal";
    case "change_email":
    case "email":
      return "Change email";
    case "change_password":
    case "password":
      return "Change password";
    case "disable_mfa":
    case "mfa":
      return "Disable MFA";
    default:
      return "Sensitive action";
  }
}

export default function ReAuthPromptPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [step, setStep] = useState<Step>("prompt");
  const [promptMode, setPromptMode] = useState<PromptMode>("password");
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>("totp");

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({ open: false, severity: "info", msg: "" });

  const qs = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const actionLabel = getActionLabel(qs.get("action"));

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

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    setBanner(null);
    setPassword("");
    setOtp(["", "", "", "", "", ""]);
    setCodeSent(false);
    setCooldown(0);
  }, [promptMode]);

  useEffect(() => {
    if (promptMode !== "mfa") return;
    setOtp(["", "", "", "", "", ""]);
    setCodeSent(false);
    setCooldown(0);
  }, [mfaMethod, promptMode]);

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const sendCode = () => {
    if (mfaMethod === "totp") return;
    setCodeSent(true);
    setCooldown(30);
    setSnack({ open: true, severity: "success", msg: mfaMethod === "sms" ? "SMS code sent. Demo: 222222" : "Email OTP sent. Demo: 111111" });
  };

  const expectedCode = mfaMethod === "totp" ? "654321" : mfaMethod === "sms" ? "222222" : "111111";

  const confirm = () => {
    setBanner(null);

    if (promptMode === "password") {
      if (!password) {
        setBanner({ severity: "warning", msg: "Enter your password." });
        return;
      }
      if (password !== "EVzone123!") {
        setBanner({ severity: "error", msg: "Incorrect password." });
        return;
      }
      setStep("success");
      setSnack({ open: true, severity: "success", msg: "Re-authentication confirmed." });
      return;
    }

    if ((mfaMethod === "sms" || mfaMethod === "email") && !codeSent) {
      setBanner({ severity: "warning", msg: "Please send the code first." });
      return;
    }

    const code = otp.join("");
    if (code.length < 6) {
      setBanner({ severity: "warning", msg: "Enter the 6-digit code." });
      return;
    }

    if (code !== expectedCode) {
      setBanner({ severity: "error", msg: "Incorrect code. Please try again." });
      return;
    }

    setStep("success");
    setSnack({ open: true, severity: "success", msg: "Re-authentication confirmed." });
  };

  const continueNext = () => {
    // Navigate back to where they came from
    navigate(-1);
  };

  const useRecovery = () => {
    navigate("/auth/recovery-code");
  };

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
                    Re-authentication
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton
                    onClick={toggleMode}
                    size="small"
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}
                  >
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton
                    size="small"
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}
                  >
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Help">
                  <IconButton
                    size="small"
                    onClick={() => navigate("/auth/account-recovery-help")}
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}
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
                    <Typography variant="h6">For your security</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Before we proceed with <b>{actionLabel}</b>, please confirm your identity again.
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <ShieldCheckIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Prevents fraud</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Confirms it’s you on sensitive actions.
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <LockIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Short-lived</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            This prompt only applies for this action.
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Demo password: <b>EVzone123!</b> • MFA codes: Authenticator <b>654321</b>, SMS <b>222222</b>, Email <b>111111</b>
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right */}
            <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  {step === "success" ? (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: EVZONE.green }}>
                          <CheckCircleIcon size={22} />
                        </Box>
                        <Typography variant="h6">Confirmed</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Re-authentication succeeded. You can continue.
                      </Typography>
                      <Button variant="contained" color="secondary" endIcon={<ArrowRightIcon size={18} />} sx={orangeContainedSx} onClick={continueNext}>
                        Continue
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">Confirm identity</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Choose one method: password or MFA code.
                        </Typography>
                      </Stack>

                      {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                      <Tabs
                        value={promptMode === "password" ? 0 : 1}
                        onChange={(_, v) => setPromptMode(v === 0 ? "password" : "mfa")}
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
                        <Tab icon={<LockIcon size={16} />} iconPosition="start" label="Password" />
                        <Tab icon={<KeypadIcon size={16} />} iconPosition="start" label="MFA code" />
                      </Tabs>

                      {promptMode === "password" ? (
                        <Stack spacing={1.4}>
                          <TextField
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="Password"
                            type={showPw ? "text" : "password"}
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon size={18} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" onClick={() => setShowPw((v) => !v)} sx={{ color: EVZONE.orange }}>
                                    {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={confirm} endIcon={<ArrowRightIcon size={18} />}>
                              Confirm
                            </Button>
                            <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => navigate("/auth/forgot-password")}>
                              Forgot password
                            </Button>
                          </Stack>
                        </Stack>
                      ) : (
                        <Stack spacing={1.4}>
                          <Tabs
                            value={mfaMethod === "totp" ? 0 : mfaMethod === "sms" ? 1 : 2}
                            onChange={(_, v) => setMfaMethod(v === 0 ? "totp" : v === 1 ? "sms" : "email")}
                            variant="fullWidth"
                            sx={{
                              borderRadius: 16,
                              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                              overflow: "hidden",
                              minHeight: 42,
                              "& .MuiTab-root": { minHeight: 42, fontWeight: 900 },
                              "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 },
                            }}
                          >
                            <Tab icon={<KeypadIcon size={16} />} iconPosition="start" label="Auth" />
                            <Tab icon={<SmsIcon size={16} />} iconPosition="start" label="SMS" />
                            <Tab icon={<MailIcon size={16} />} iconPosition="start" label="Email" />
                          </Tabs>

                          {(mfaMethod === "sms" || mfaMethod === "email") ? (
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={sendCode} disabled={cooldown > 0 && codeSent}>
                                {codeSent ? "Code sent" : "Send code"}
                              </Button>
                              <Button
                                variant="outlined"
                                sx={orangeOutlinedSx}
                                onClick={() => {
                                  if (cooldown === 0) sendCode();
                                }}
                                disabled={!codeSent || cooldown > 0}
                              >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                              </Button>
                            </Stack>
                          ) : null}

                          <OtpInput value={otp} onChange={setOtp} autoFocus />

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={confirm} endIcon={<ArrowRightIcon size={18} />}>
                              Confirm
                            </Button>
                            <Button variant="outlined" sx={orangeOutlinedSx} onClick={useRecovery}>
                              Use recovery code
                            </Button>
                          </Stack>
                        </Stack>
                      )}

                      <Divider />

                      <Button variant="text" sx={orangeTextSx} onClick={() => navigate(-1)}>
                        Cancel
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
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>
                Terms
              </Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>
                Privacy
              </Button>
            </Stack>
          </Box>
        </Box>

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
