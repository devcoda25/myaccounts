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
import { useTranslation, Trans } from "react-i18next";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher";
import {
  IconBase,
  SunIcon,
  MoonIcon,
  GlobeIcon,
  HelpCircleIcon,
  ShieldCheckIcon,
  KeypadIcon,
  SmsIcon,
  MailIcon,
  WhatsAppIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "../../../utils/icons";

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
  const { t } = useTranslation();
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
        ? t('auth.mfa.msg_sms_sent')
        : method === "whatsapp"
          ? t('auth.mfa.msg_whatsapp_sent')
          : t('auth.mfa.msg_email_sent');

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
      setBanner({ severity: "error", msg: t('auth.mfa.validation_too_many_attempts_timer', { seconds: secondsLeft }) });
      return;
    }

    if ((method === "sms" || method === "whatsapp" || method === "email") && !codeSent) {
      setBanner({ severity: "warning", msg: t('auth.mfa.validation_send_first') });
      return;
    }

    const code = otp.join("");
    if (code.length < 6) {
      setBanner({ severity: "warning", msg: t('auth.mfa.validation_incomplete') });
      return;
    }

    if (code !== expectedCode) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockedUntil(Date.now() + 30_000);
        setBanner({ severity: "error", msg: t('auth.mfa.validation_locked') });
        return;
      }
      setBanner({ severity: "error", msg: t('auth.mfa.validation_incorrect') });
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
    setSnack({ open: true, severity: "success", msg: t('auth.mfa.success_complete') });
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
      ? t('auth.mfa.help_totp')
      : method === "sms"
        ? t('auth.mfa.help_sms')
        : method === "whatsapp"
          ? t('auth.mfa.help_whatsapp')
          : t('auth.mfa.help_email');

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
                    {t('app_name')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {t('auth.mfa.subtitle')}
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

                <LanguageSwitcher />

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
                    <Typography variant="h6">{t('auth.mfa.challenge_title')}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.mfa.challenge_desc')}
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
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.mfa.feature_protection_title')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.mfa.feature_protection_desc')}
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
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.mfa.feature_options_title')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.mfa.feature_options_desc')}
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
                            {t('auth.mfa.checkbox_trust')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.mfa.checkbox_trust_desc')}
                          </Typography>
                        </Box>
                      }
                    />

                    <Divider sx={{ my: 1 }} />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setMethodDialog(true)}>
                        {t('auth.mfa.btn_try_another')}
                      </Button>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={openRecovery}>
                        {t('auth.mfa.btn_use_recovery')}
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      <Trans i18nKey="auth.mfa.demo_codes_hint" />
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
                        <Typography variant="h6">{t('auth.mfa.success_title')}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {t('auth.mfa.success_desc')}
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<ArrowRightIcon size={18} />}
                        sx={orangeContainedSx}
                        onClick={continueNext}
                      >
                        {t('auth.mfa.btn_continue')}
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">{t('auth.mfa.enter_code_title')}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.mfa.enter_code_desc')}
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
                        <Tab icon={<KeypadIcon size={16} />} iconPosition="start" label={t('auth.mfa.tab_authenticator')} />
                        <Tab icon={<SmsIcon size={16} />} iconPosition="start" label={t('auth.mfa.tab_sms')} />
                        <Tab icon={<WhatsAppIcon size={16} />} iconPosition="start" label={t('auth.mfa.tab_whatsapp')} />
                        <Tab icon={<MailIcon size={16} />} iconPosition="start" label={t('auth.mfa.tab_email')} />
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
    </ThemeProvider >
  );
}
