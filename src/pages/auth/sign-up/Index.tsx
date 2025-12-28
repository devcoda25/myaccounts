import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
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
 * EVzone My Accounts - Create Account v3
 * Route: /auth/sign-up
 * Update: Google + Apple are ACTIVE and use real brand styling.
 *
 * Important: This creates the EVzone account only. Module onboarding happens later.
 *
 * Global style rules still apply to EVzone actions:
 * - Background: green-only
 * - EVzone buttons: orange-only with white text
 * - Social buttons: brand styling (Google/Apple)
 */

type ThemeMode = "light" | "dark";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const COUNTRIES = [
  { code: "UG", label: "Uganda", dial: "+256" },
  { code: "KE", label: "Kenya", dial: "+254" },
  { code: "TZ", label: "Tanzania", dial: "+255" },
  { code: "RW", label: "Rwanda", dial: "+250" },
  { code: "NG", label: "Nigeria", dial: "+234" },
  { code: "ZA", label: "South Africa", dial: "+27" },
  { code: "US", label: "United States", dial: "+1" },
  { code: "GB", label: "United Kingdom", dial: "+44" },
  { code: "CA", label: "Canada", dial: "+1" },
  { code: "AE", label: "UAE", dial: "+971" },
  { code: "IN", label: "India", dial: "+91" },
  { code: "CN", label: "China", dial: "+86" },
];

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

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 22a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function TicketIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function InfoBadgeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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

function isEmail(v: string) {
  return /.+@.+\..+/.test(v);
}

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..5
}

export default function SignUpPageV3() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [firstName, setFirstName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+256");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [createWithOtp, setCreateWithOtp] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({ open: false, severity: "info", msg: "" });

  // Detect location
  React.useEffect(() => {
    // Simple heuristic or fetch could go here. 
    // For now, we'll try to guess based on timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Nairobi") || tz.includes("Kampala")) setCountryCode("+256"); // Default/Fallback
      else if (tz.includes("New_York") || tz.includes("America")) setCountryCode("+1");
      else if (tz.includes("London") || tz.includes("Europe")) setCountryCode("+44");
      // Add more heuristics as needed or fetch from IP API
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  // EVzone buttons
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

  // Brand button styles
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

  const pwScore = scorePassword(password);
  const pwLabel = pwScore <= 1 ? "Weak" : pwScore === 2 ? "Fair" : pwScore === 3 ? "Good" : pwScore === 4 ? "Strong" : "Very strong";

  const validate = () => {
    const fn = firstName.trim();
    const ln = otherNames.trim();
    const e = email.trim();
    const p = phone.trim();

    if (!fn) return "Enter your first name.";
    if (!ln) return "Enter your other names.";
    if (!e && !p) return "Provide at least an email or phone number.";
    if (e && !isEmail(e)) return "Enter a valid email address.";
    if (!acceptTerms) return "You must accept the Terms and Privacy Policy.";

    if (!createWithOtp) {
      if (!password) return "Create a password.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (password !== confirm) return "Passwords do not match.";
    }

    return null;
  };

  const onContinue = () => {
    setBanner(null);
    const err = validate();
    if (err) {
      setBanner({ severity: "warning", msg: err });
      return;
    }

    // In a real app we'd redirect here using navigate
    navigate("/auth/verify-email"); // Or verify-phone depending on input
  };

  const onGoogle = () => setSnack({ open: true, severity: "info", msg: "Google sign-up: redirecting (demo)." });
  const onApple = () => setSnack({ open: true, severity: "info", msg: "Apple sign-up: redirecting (demo)." });

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
                    background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.82) 55%, rgba(3,205,140,0.62) 100%)",
                    boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.22)}`,
                  }}
                >
                  <Typography sx={{ color: "white", fontWeight: 900, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>EVzone My Accounts</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Create your EVzone account</Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton onClick={toggleMode} size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}>
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}>
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Help">
                  <IconButton size="small" onClick={() => navigate("/auth/account-recovery-help")} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}>
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
                    <Typography variant="h6">Account creation only</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      This creates your EVzone account. Each module will handle its own onboarding after you sign in.
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <ShieldCheckIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Secure identity</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            One login for all EVzone platforms.
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <InfoBadgeIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Clear permissions</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            You can manage access later in My Accounts.
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Button variant="outlined" startIcon={<ArrowLeftIcon size={18} />} sx={orangeOutlinedSx} onClick={() => navigate("/auth/sign-in")}>
                      Back to sign in
                    </Button>
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
                      <Typography variant="h6">Create account</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Create your EVzone identity. You will verify your email or phone in the next step.
                      </Typography>
                    </Stack>

                    {/* Social sign-up (brand styling) */}
                    <Stack spacing={1}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<GoogleGIcon size={18} />}
                          onClick={onGoogle}
                          sx={{
                            borderColor: "#DADCE0",
                            backgroundColor: "#FFFFFF",
                            color: "#3C4043",
                            "&:hover": { backgroundColor: "#F8F9FA", borderColor: "#DADCE0" },
                            "&:active": { backgroundColor: "#F1F3F4" },
                            borderRadius: 14,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Continue with Google
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AppleIcon size={18} />}
                          onClick={onApple}
                          sx={{
                            borderColor: "#000000",
                            backgroundColor: "#000000",
                            color: "#FFFFFF",
                            "&:hover": { backgroundColor: "#111111", borderColor: "#111111" },
                            "&:active": { backgroundColor: "#1B1B1B" },
                            borderRadius: 14,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Continue with Apple
                        </Button>
                      </Stack>
                      <Divider>or</Divider>
                    </Stack>

                    {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                    <Stack spacing={1.4}>
                      <Box className="grid gap-3 md:grid-cols-2">
                        <TextField
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          label="First name"
                          placeholder="John"
                          fullWidth
                          InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon size={18} /></InputAdornment> }}
                        />
                        <TextField
                          value={otherNames}
                          onChange={(e) => setOtherNames(e.target.value)}
                          label="Other names"
                          placeholder="Doe"
                          fullWidth
                          InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon size={18} /></InputAdornment> }}
                        />
                      </Box>

                      <Box className="grid gap-3 md:grid-cols-2">
                        <TextField
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          label="Email (optional)"
                          placeholder="name@example.com"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MailIcon size={18} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            sx={{ width: 100, borderRadius: 1.5, '.MuiSelect-select': { display: 'flex', alignItems: 'center' } }}
                            renderValue={(selected) => (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Typography variant="body2">{selected}</Typography>
                              </Stack>
                            )}
                          >
                            {COUNTRIES.map((c) => (
                              <MenuItem key={c.code} value={c.dial}>
                                <Stack direction="row" justifyContent="space-between" width="100%">
                                  <Typography variant="body2">{c.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">{c.dial}</Typography>
                                </Stack>
                              </MenuItem>
                            ))}
                          </Select>
                          <TextField
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            label="Phone (optional)"
                            placeholder="770 123456"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon size={18} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      </Box>

                      {/* OTP toggle */}
                      <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1}>
                          <Box>
                            <Typography sx={{ fontWeight: 900 }}>Create with OTP</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Use a verification code instead of setting a password now.
                            </Typography>
                          </Box>
                          <Switch checked={createWithOtp} onChange={(e) => setCreateWithOtp(e.target.checked)} color="secondary" />
                        </Stack>
                      </Box>

                      {!createWithOtp ? (
                        <Box>
                          <Box className="grid gap-3 md:grid-cols-2">
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
                                    <IconButton size="small" onClick={() => setShowConfirm((v) => !v)} sx={{ color: EVZONE.orange }}>
                                      {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>

                          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 1.2 }}>
                            <Box sx={{ flex: 1, height: 10, borderRadius: 999, backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.14 : 0.10), overflow: "hidden", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                              <Box sx={{ width: `${(pwScore / 5) * 100}%`, height: "100%", backgroundColor: EVZONE.orange, transition: "width 180ms ease" }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 900 }}>
                              {pwLabel}
                            </Typography>
                          </Stack>

                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Use at least 8 characters. Mix letters, numbers, and symbols for stronger security.
                          </Typography>
                        </Box>
                      ) : (
                        <Alert severity="info">You will verify your email or phone with a one-time code. You can set a password later in Security Settings.</Alert>
                      )}

                      <TextField
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        label="Referral or invite code (optional)"
                        placeholder="Enter code if you have one"
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TicketIcon size={18} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <FormControlLabel
                        control={<Checkbox checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }} />}
                        label={<Typography variant="body2">I agree to the EVzone Terms and Privacy Policy</Typography>}
                      />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button fullWidth variant="contained" color="secondary" endIcon={<ArrowRightIcon size={18} />} onClick={onContinue} sx={orangeContainedSx}>
                          Continue
                        </Button>
                        <Button fullWidth variant="outlined" startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/auth/sign-in")} sx={orangeOutlinedSx}>
                          Sign in instead
                        </Button>
                      </Stack>

                      <Divider />

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Next step: verification. This is account creation, not module onboarding.
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Box>

          {/* Footer */}
          <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>Terms</Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>Privacy</Button>
            </Stack>
          </Box>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
