import React, { useEffect, useMemo, useState } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Forgot Password
 * Route: /auth/forgot-password
 * Features:
 * • Email/phone input
 * • Delivery method selection
 * • Confirm send
 * • Abuse prevention: rate limiting + optional captcha
 *
 * Style rules:
 * • Background: green-only
 * • Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 */

type ThemeMode = "light" | "dark";

type IdType = "email" | "phone" | "unknown";

type Delivery = "email_link" | "sms_code" | "whatsapp_code";

type Step = "request" | "sent";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const WHATSAPP = {
  green: "#25D366",
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
      <path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.9.3-1.2.8-1.2 1.6v.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
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
          root: { borderRadius: 14, paddingTop: 10, paddingBottom: 10, boxShadow: "none" },
        },
      },
    },
  });
}

function detectIdType(v: string): IdType {
  const s = v.trim();
  if (!s) return "unknown";
  if (/.+@.+\..+/.test(s)) return "email";
  if (/^\+?[0-9\s-]{8,}$/.test(s)) return "phone";
  return "unknown";
}

function maskEmail(email: string) {
  const e = email.trim();
  if (!/.+@.+\..+/.test(e)) return e;
  const [u, d] = e.split("@");
  const safeU = u.length <= 2 ? u[0] + "*" : u.slice(0, 2) + "***";
  return `${safeU}@${d}`;
}

function maskPhone(phone: string) {
  const s = phone.trim().replace(/\s+/g, "");
  if (s.length <= 6) return s;
  return `${s.slice(0, 3)}***${s.slice(-3)}`;
}

function labelForDelivery(d: Delivery) {
  if (d === "email_link") return "Email link";
  if (d === "sms_code") return "SMS code";
  return "WhatsApp code";
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("ronald@evzone.com");
  const idType = detectIdType(identifier);

  const [delivery, setDelivery] = useState<Delivery>("email_link");

  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({ open: false, severity: "info", msg: "" });

  // Green-only background
  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  // Orange buttons
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

  // keep delivery valid for identifier type
  useEffect(() => {
    if (idType === "email") {
      setDelivery("email_link");
      return;
    }
    if (idType === "phone") {
      if (delivery === "email_link") setDelivery("sms_code");
      return;
    }
  }, [idType]);

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const deliveryMask = () => {
    if (idType === "email") return maskEmail(identifier);
    if (idType === "phone") return maskPhone(identifier);
    return identifier.trim();
  };

  const canSend = () => {
    if (cooldown > 0) return false;
    if (!identifier.trim()) return false;
    if (idType === "unknown") return false;
    if (captchaRequired && !captchaChecked) return false;
    return true;
  };

  const requestSend = () => {
    setBanner(null);

    if (!identifier.trim()) {
      setBanner({ severity: "warning", msg: "Enter your email or phone number." });
      return;
    }

    if (idType === "unknown") {
      setBanner({ severity: "warning", msg: "Enter a valid email address or phone number." });
      return;
    }

    if (cooldown > 0) {
      setBanner({ severity: "warning", msg: `Please wait ${cooldown}s before trying again.` });
      return;
    }

    if (captchaRequired && !captchaChecked) {
      setBanner({ severity: "warning", msg: "Please complete the verification checkbox to continue." });
      return;
    }

    setConfirmOpen(true);
  };

  const doSend = () => {
    setConfirmOpen(false);

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    // require captcha after repeated requests
    if (nextAttempts >= 3) setCaptchaRequired(true);

    setCooldown(30);
    setStep("sent");

    const via = labelForDelivery(delivery);

    setSnack({
      open: true,
      severity: "success",
      msg: `Reset instructions sent via ${via}. (Demo)`
    });
  };

  const resetForm = () => {
    setStep("request");
    setBanner(null);
  };

  const DeliveryCard = ({
    value,
    title,
    subtitle,
    enabled,
    accent,
    icon,
  }: {
    value: Delivery;
    title: string;
    subtitle: string;
    enabled: boolean;
    accent: "orange" | "whatsapp";
    icon: React.ReactNode;
  }) => {
    const selected = delivery === value;
    const base = accent === "whatsapp" ? WHATSAPP.green : EVZONE.orange;

    return (
      <ButtonBase
        className="w-full"
        disabled={!enabled}
        onClick={() => enabled && setDelivery(value)}
        sx={{ textAlign: "left", opacity: enabled ? 1 : 0.55 }}
      >
        <Box
          sx={{
            width: "100%",
            borderRadius: 16,
            border: `1px solid ${alpha(base, selected ? 0.95 : 0.55)}`,
            backgroundColor: selected ? base : alpha(theme.palette.background.paper, 0.35),
            color: selected ? "#FFFFFF" : theme.palette.text.primary,
            p: 1.2,
            transition: "all 160ms ease",
            "&:hover": enabled
              ? {
                backgroundColor: base,
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
                    Forgot password
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
            {/* Left info */}
            <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-6">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">Reset your access</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      We will send password reset instructions to your verified email or phone.
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <TimerIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Rate limiting</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Requests may be limited to protect against abuse.
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <MailIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>Secure link / code</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Reset tokens expire quickly and can’t be reused.
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => navigate("/auth/sign-in")}>
                      Back to sign in
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right form */}
            <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  {step === "sent" ? (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">Check your {idType === "email" ? "email" : "phone"}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          We sent reset instructions to <b>{deliveryMask()}</b> via <b>{labelForDelivery(delivery)}</b>.
                        </Typography>
                      </Stack>

                      <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                        <Stack spacing={1}>
                          <Typography sx={{ fontWeight: 900 }}>Next</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Follow the link or enter the code to reset your password.
                          </Typography>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button
                              variant="contained"
                              color="secondary"
                              sx={orangeContainedSx}
                              endIcon={<ArrowRightIcon size={18} />}
                              onClick={() => navigate("/auth/reset-password")}
                            >
                              Go to reset password
                            </Button>
                            <Button
                              variant="outlined"
                              sx={orangeOutlinedSx}
                              startIcon={<TimerIcon size={18} />}
                              onClick={() => {
                                if (cooldown === 0) {
                                  setConfirmOpen(true);
                                }
                              }}
                              disabled={cooldown > 0}
                            >
                              {cooldown > 0 ? `Send again in ${cooldown}s` : "Send again"}
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlinedSx} onClick={resetForm}>
                          Change email/phone
                        </Button>
                        <Button
                          variant="outlined"
                          sx={orangeOutlinedSx}
                          onClick={() => navigate("/auth/account-recovery-help")}
                        >
                          Need help?
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">Forgot password</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Enter your email or phone number and choose how to receive reset instructions.
                        </Typography>
                      </Stack>

                      {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                      <TextField
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        label="Email or phone"
                        placeholder="name@example.com or +256..."
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, color: theme.palette.text.secondary, display: "grid", placeItems: "center" }}>
                              {idType === "phone" ? <PhoneIcon size={18} /> : <MailIcon size={18} />}
                            </Box>
                          ),
                        }}
                        helperText={idType === "unknown" ? "Enter a valid email or phone." : ""}
                      />

                      <Box>
                        <Typography sx={{ fontWeight: 900, mb: 1 }}>Delivery method</Typography>
                        <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <DeliveryCard
                            value="email_link"
                            title="Email link"
                            subtitle="Send a secure reset link to your email."
                            enabled={idType === "email"}
                            accent="orange"
                            icon={<MailIcon size={18} />}
                          />
                          <DeliveryCard
                            value="sms_code"
                            title="SMS code"
                            subtitle="Send a reset code to your phone."
                            enabled={idType === "phone"}
                            accent="orange"
                            icon={<PhoneIcon size={18} />}
                          />
                          <DeliveryCard
                            value="whatsapp_code"
                            title="WhatsApp code"
                            subtitle="Send a reset code via WhatsApp."
                            enabled={idType === "phone"}
                            accent="whatsapp"
                            icon={<WhatsAppIcon size={18} />}
                          />
                        </Box>
                        {idType === "email" ? (
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: "block" }}>
                            Phone methods are available when you enter a phone number.
                          </Typography>
                        ) : null}
                      </Box>

                      {captchaRequired ? (
                        <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={captchaChecked}
                                onChange={(e) => setCaptchaChecked(e.target.checked)}
                                sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 900 }}>
                                  I’m not a robot
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  Optional abuse protection (demo).
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>
                      ) : null}

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          variant="contained"
                          color="secondary"
                          sx={orangeContainedSx}
                          endIcon={<ArrowRightIcon size={18} />}
                          onClick={requestSend}
                          disabled={!canSend()}
                        >
                          Continue
                        </Button>
                        <Button
                          variant="outlined"
                          sx={orangeOutlinedSx}
                          startIcon={<HelpCircleIcon size={18} />}
                          onClick={() => navigate("/auth/account-recovery-help")}
                        >
                          Account recovery help
                        </Button>
                      </Stack>

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Tip: If you don’t receive anything, check spam folders (email) or ensure network coverage (phone).
                      </Typography>
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

        {/* Confirm send dialog */}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}
        >
          <DialogTitle sx={{ fontWeight: 950 }}>Confirm send</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Send reset instructions to:
              </Typography>
              <Box sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.55), p: 1.2 }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{ color: delivery === "whatsapp_code" ? WHATSAPP.green : EVZONE.orange }}>
                    {delivery === "email_link" ? <MailIcon size={18} /> : delivery === "sms_code" ? <PhoneIcon size={18} /> : <WhatsAppIcon size={18} />}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900 }}>{deliveryMask()}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Delivery: <b>{labelForDelivery(delivery)}</b>
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Alert severity="info">If this account exists, you will receive reset instructions shortly.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={doSend}>
              Send
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
            sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
