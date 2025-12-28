import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Checkbox,
  CssBaseline,
  Divider,
  FormControlLabel,
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
 * EVzone My Accounts - Reset Password (v2)
 * Route: /auth/reset-password
 * Update: OTP-based reset supports SMS + WhatsApp (for phone identifiers) and Email (for email identifiers).
 *
 * Features:
 * • Token-based (link from email) or OTP-based reset
 * • New password + confirm + strength
 * • “Sign out all devices” checkbox
 * • Success → sign-in button
 *
 * Style rules:
 * • Background: green-only
 * • Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 */

type ThemeMode = "light" | "dark";

type ResetMode = "token" | "otp";

type Step = "verify" | "set" | "success";

type IdType = "email" | "phone" | "unknown";

type OtpChannel = "email" | "sms" | "whatsapp";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const WHATSAPP = {
  green: "#25D366",
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

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function KeyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M11 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 12v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 12v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function TimerIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M10 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 14l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
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

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  // Official WhatsApp logo (Font Awesome path). Uses currentColor.
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
          root: {
            borderRadius: 14,
            paddingTop: 10,
            paddingBottom: 10,
            boxShadow: "none",
          },
        },
      },
    },
  });
}

// -----------------------------
// Helpers
// -----------------------------
function detectIdType(v: string): IdType {
  const s = v.trim();
  if (!s) return "unknown";
  if (/.+@.+\..+/.test(s)) return "email";
  if (/^\+?[0-9\s-]{8,}$/.test(s)) return "phone";
  return "unknown";
}

function strengthScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..5
}

function reqs(pw: string) {
  return {
    len: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    num: /\d/.test(pw),
    sym: /[^A-Za-z0-9]/.test(pw),
  };
}

// OTP input (6 digits)
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
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, value.length);
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

export default function ResetPasswordPageV2() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const qs = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const tokenFromUrl = qs.get("token") || "";

  const [resetMode, setResetMode] = useState<ResetMode>(tokenFromUrl ? "token" : "otp");
  const [step, setStep] = useState<Step>("verify");

  // token-based
  const [token, setToken] = useState(tokenFromUrl || "");

  // otp-based
  const [identifier, setIdentifier] = useState("+256761677709");
  const idType = detectIdType(identifier);

  const [otpChannel, setOtpChannel] = useState<OtpChannel>(idType === "email" ? "email" : "sms");

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  // new password
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signOutAll, setSignOutAll] = useState(true);

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

  // keep OTP channel valid for identifier type
  useEffect(() => {
    if (idType === "email") {
      setOtpChannel("email");
      return;
    }
    if (idType === "phone") {
      if (otpChannel === "email") setOtpChannel("sms");
      return;
    }
  }, [idType]);

  // reset OTP state when switching channel
  useEffect(() => {
    setOtp(["", "", "", "", "", ""]);
    setCodeSent(false);
    setCooldown(0);
  }, [otpChannel]);

  // reset state when switching resetMode
  useEffect(() => {
    setBanner(null);
    setStep("verify");
    setPw("");
    setConfirm("");
    setShowPw(false);
    setShowConfirm(false);
    setOtp(["", "", "", "", "", ""]);
    setCooldown(0);
    setCodeSent(false);
  }, [resetMode]);

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  // Token verification (demo)
  const tokenOk = (v: string) => v.trim() === "EVZ-RESET-TOKEN";

  const verifyToken = () => {
    setBanner(null);
    if (!token.trim()) {
      setBanner({ severity: "warning", msg: "Enter the reset token from your email link." });
      return;
    }
    if (!tokenOk(token)) {
      setBanner({
        severity: "error",
        msg: "Invalid or expired token. Try requesting a new reset link.",
      });
      return;
    }
    setStep("set");
    setSnack({ open: true, severity: "success", msg: "Token verified. Set a new password." });
  };

  const expectedOtp = otpChannel === "whatsapp" ? "555555" : "444444"; // SMS+Email share a demo code

  const sendOtp = () => {
    setBanner(null);

    if (!identifier.trim()) {
      setBanner({ severity: "warning", msg: "Enter your email or phone number." });
      return;
    }

    if (idType === "unknown") {
      setBanner({ severity: "warning", msg: "Enter a valid email address or phone number." });
      return;
    }

    if (otpChannel === "email" && idType !== "email") {
      setBanner({ severity: "warning", msg: "Email delivery is only available for email identifiers." });
      return;
    }

    if ((otpChannel === "sms" || otpChannel === "whatsapp") && idType !== "phone") {
      setBanner({ severity: "warning", msg: "SMS/WhatsApp delivery is only available for phone identifiers." });
      return;
    }

    setCodeSent(true);
    setCooldown(30);

    const msg =
      otpChannel === "email"
        ? "Reset OTP sent via Email. Demo code: 444444"
        : otpChannel === "sms"
          ? "Reset OTP sent via SMS. Demo code: 444444"
          : "Reset OTP sent via WhatsApp. Demo code: 555555";

    setSnack({ open: true, severity: "success", msg });
  };

  const verifyOtp = () => {
    setBanner(null);

    if (!codeSent) {
      setBanner({ severity: "warning", msg: "Please send the OTP first." });
      return;
    }

    const code = otp.join("");
    if (code.length < 6) {
      setBanner({ severity: "warning", msg: "Enter the 6-digit OTP." });
      return;
    }

    if (code !== expectedOtp) {
      setBanner({ severity: "error", msg: "Incorrect OTP. Try again." });
      return;
    }

    setStep("set");
    setSnack({ open: true, severity: "success", msg: "OTP verified. Set a new password." });
  };

  // Password setting step
  const s = strengthScore(pw);
  const label = s <= 1 ? "Weak" : s === 2 ? "Fair" : s === 3 ? "Good" : s === 4 ? "Strong" : "Very strong";
  const r = reqs(pw);
  const canReset = s >= 3 && pw === confirm;

  const reset = () => {
    setBanner(null);

    if (!pw) {
      setBanner({ severity: "warning", msg: "Enter a new password." });
      return;
    }
    if (s < 3) {
      setBanner({ severity: "warning", msg: "Please strengthen your password." });
      return;
    }
    if (pw !== confirm) {
      setBanner({ severity: "warning", msg: "Passwords do not match." });
      return;
    }

    setStep("success");
    setSnack({
      open: true,
      severity: "success",
      msg: signOutAll ? "Password reset. All devices signed out (demo)." : "Password reset (demo).",
    });
  };

  const goSignIn = () => navigate("/auth/sign-in");

  const ChannelCard = ({
    value,
    title,
    subtitle,
    icon,
    enabled,
    accent,
  }: {
    value: OtpChannel;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    enabled: boolean;
    accent: "orange" | "whatsapp";
  }) => {
    const selected = otpChannel === value;
    const base = accent === "whatsapp" ? WHATSAPP.green : EVZONE.orange;

    return (
      <ButtonBase
        className="w-full"
        disabled={!enabled}
        onClick={() => enabled && setOtpChannel(value)}
        sx={{ textAlign: "left", opacity: enabled ? 1 : 0.55 }}
      >
        <Box
          sx={{
            width: "100%",
            borderRadius: 16,
            border: `1px solid ${alpha(base, selected ? 0.95 : 0.55)}`,
            backgroundColor: selected ? base : alpha(theme.palette.background.paper, 0.35),
            color: selected ? "#FFFFFF" : base,
            p: 1.2,
            transition: "all 160ms ease",
            "&:hover": enabled
              ? {
                backgroundColor: base,
                borderColor: base,
                color: "#FFFFFF",
              }
              : undefined,
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                backgroundColor: selected ? alpha("#FFFFFF", 0.18) : alpha(base, mode === "dark" ? 0.16 : 0.10),
                border: `1px solid ${alpha(selected ? "#FFFFFF" : base, 0.26)}`,
                color: selected ? "#FFFFFF" : base,
              }}
            >
              {icon}
            </Box>
            <Box flex={1}>
              <Typography sx={{ fontWeight: 900, lineHeight: 1.1, color: "inherit" }}>{title}</Typography>
              <Typography variant="body2" sx={{ color: selected ? alpha("#FFFFFF", 0.86) : theme.palette.text.secondary }}>
                {subtitle}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </ButtonBase>
    );
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
                    Reset password
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
                    <Typography variant="h6">Create a new password</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Reset tokens and OTPs are short-lived for your security.
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Demo token: <b>EVZ-RESET-TOKEN</b>
                      <br />
                      Demo OTP: SMS/Email <b>444444</b>, WhatsApp <b>555555</b>
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Button
                      variant="outlined"
                      sx={orangeOutlinedSx}
                      onClick={() =>
                        setSnack({ open: true, severity: "info", msg: "Back to /auth/forgot-password" })
                      }
                    >
                      Back to forgot password
                    </Button>
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
                  <Stack spacing={2.0}>
                    <Stack spacing={0.6}>
                      <Typography variant="h6">Reset password</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Verify your reset link token or use an OTP code.
                      </Typography>
                    </Stack>

                    {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                    <Tabs
                      value={resetMode === "token" ? 0 : 1}
                      onChange={(_, v) => setResetMode(v === 0 ? "token" : "otp")}
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
                      <Tab icon={<KeyIcon size={16} />} iconPosition="start" label="Link token" />
                      <Tab icon={<TimerIcon size={16} />} iconPosition="start" label="OTP" />
                    </Tabs>

                    {step === "verify" ? (
                      resetMode === "token" ? (
                        <Stack spacing={1.4}>
                          <TextField
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            label="Reset token"
                            placeholder="EVZ-RESET-TOKEN"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <KeyIcon size={18} />
                                </InputAdornment>
                              ),
                            }}
                            helperText="Paste the token from your email reset link."
                          />
                          <Button
                            variant="contained"
                            color="secondary"
                            sx={orangeContainedSx}
                            onClick={verifyToken}
                            endIcon={<ArrowRightIcon size={18} />}
                          >
                            Verify token
                          </Button>
                        </Stack>
                      ) : (
                        <Stack spacing={1.4}>
                          <TextField
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            label="Email or phone"
                            placeholder="name@example.com or +256..."
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  {idType === "phone" ? <PhoneIcon size={18} /> : <MailIcon size={18} />}
                                </InputAdornment>
                              ),
                            }}
                            helperText={idType === "unknown" ? "Enter a valid email or phone." : ""}
                          />

                          {/* Delivery method selection */}
                          <Box>
                            <Typography sx={{ fontWeight: 900, mb: 1 }}>Delivery method</Typography>
                            <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <ChannelCard
                                value="email"
                                title="Email"
                                subtitle="Receive the OTP in your email inbox."
                                icon={<MailIcon size={18} />}
                                enabled={idType === "email"}
                                accent="orange"
                              />
                              <ChannelCard
                                value="sms"
                                title="SMS"
                                subtitle="Receive the OTP as an SMS."
                                icon={<PhoneIcon size={18} />}
                                enabled={idType === "phone"}
                                accent="orange"
                              />
                              <ChannelCard
                                value="whatsapp"
                                title="WhatsApp"
                                subtitle="Receive the OTP in WhatsApp chat."
                                icon={<WhatsAppIcon size={18} />}
                                enabled={idType === "phone"}
                                accent="whatsapp"
                              />
                            </Box>
                            {idType === "email" ? (
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: "block" }}>
                                Phone channels are available when you enter a phone number.
                              </Typography>
                            ) : null}
                          </Box>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button
                              variant="contained"
                              color="secondary"
                              sx={orangeContainedSx}
                              onClick={sendOtp}
                              disabled={cooldown > 0 && codeSent}
                            >
                              {codeSent ? "OTP sent" : "Send OTP"}
                            </Button>
                            <Button
                              variant="outlined"
                              sx={orangeOutlinedSx}
                              onClick={sendOtp}
                              disabled={!codeSent || cooldown > 0}
                              startIcon={<TimerIcon size={18} />}
                            >
                              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                            </Button>
                          </Stack>

                          <OtpInput value={otp} onChange={setOtp} autoFocus={codeSent} />

                          <Button
                            variant="contained"
                            color="secondary"
                            sx={orangeContainedSx}
                            onClick={verifyOtp}
                            endIcon={<ArrowRightIcon size={18} />}
                          >
                            Verify OTP
                          </Button>
                        </Stack>
                      )
                    ) : step === "set" ? (
                      <Stack spacing={1.4}>
                        <TextField
                          value={pw}
                          onChange={(e) => setPw(e.target.value)}
                          label="New password"
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
                                <IconButton
                                  size="small"
                                  onClick={() => setShowPw((v) => !v)}
                                  sx={{ color: EVZONE.orange }}
                                >
                                  {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          label="Confirm password"
                          type={showConfirm ? "text" : "password"}
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
                                  onClick={() => setShowConfirm((v) => !v)}
                                  sx={{ color: EVZONE.orange }}
                                >
                                  {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />

                        {/* Strength */}
                        <Stack spacing={0.8}>
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Box
                              sx={{
                                flex: 1,
                                height: 10,
                                borderRadius: 999,
                                backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.14 : 0.10),
                                overflow: "hidden",
                                border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${(s / 5) * 100}%`,
                                  height: "100%",
                                  backgroundColor: EVZONE.orange,
                                  transition: "width 180ms ease",
                                }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{ color: theme.palette.text.secondary, fontWeight: 900 }}
                            >
                              {label}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Box
                          sx={{
                            borderRadius: 18,
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.45),
                            p: 1.2,
                          }}
                        >
                          <Typography sx={{ fontWeight: 900, mb: 0.8 }}>Requirements</Typography>
                          <Stack spacing={0.5}>
                            {[
                              { ok: r.len, text: "At least 8 characters" },
                              { ok: r.upper, text: "One uppercase letter" },
                              { ok: r.lower, text: "One lowercase letter" },
                              { ok: r.num, text: "One number" },
                              { ok: r.sym, text: "One symbol" },
                            ].map((it, idx) => (
                              <Typography
                                key={idx}
                                variant="body2"
                                sx={{
                                  color: it.ok ? theme.palette.text.primary : theme.palette.text.secondary,
                                  fontWeight: it.ok ? 900 : 700,
                                }}
                              >
                                • {it.text}
                              </Typography>
                            ))}
                            <Divider sx={{ my: 0.6 }} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: pw && pw === confirm ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontWeight: pw && pw === confirm ? 900 : 700,
                              }}
                            >
                              • Passwords match
                            </Typography>
                          </Stack>
                        </Box>

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={signOutAll}
                              onChange={(e) => setSignOutAll(e.target.checked)}
                              sx={{
                                color: alpha(EVZONE.orange, 0.7),
                                "&.Mui-checked": { color: EVZONE.orange },
                              }}
                            />
                          }
                          label={<Typography variant="body2">Sign out all devices</Typography>}
                        />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button
                            variant="contained"
                            color="secondary"
                            sx={orangeContainedSx}
                            onClick={reset}
                            disabled={!canReset}
                            endIcon={<ArrowRightIcon size={18} />}
                          >
                            Reset password
                          </Button>
                          <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setStep("verify")}
                          >
                            Back
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ color: EVZONE.green }}>
                            <CheckCircleIcon size={22} />
                          </Box>
                          <Typography variant="h6">Password updated</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Your password has been reset. You can sign in now.
                        </Typography>
                        <Button
                          variant="contained"
                          color="secondary"
                          sx={orangeContainedSx}
                          onClick={goSignIn}
                          endIcon={<ArrowRightIcon size={18} />}
                        >
                          Go to sign in
                        </Button>
                      </Stack>
                    )}

                    <Divider />

                    <Button
                      variant="text"
                      sx={orangeTextSx}
                      onClick={() =>
                        setSnack({ open: true, severity: "info", msg: "Navigate to /auth/account-recovery-help" })
                      }
                    >
                      Account recovery help
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Box>

          {/* Footer */}
          <Box
            className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            sx={{ opacity: 0.92 }}
          >
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
