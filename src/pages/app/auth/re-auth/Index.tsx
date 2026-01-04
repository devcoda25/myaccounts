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
import { useTranslation, Trans } from "react-i18next";
import LanguageSwitcher from "../../../../components/common/LanguageSwitcher";
import {
  IconBase,
  SunIcon,
  MoonIcon,
  GlobeIcon,
  HelpCircleIcon,
  ShieldCheckIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  KeypadIcon,
  SmsIcon,
  MailIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "../../../../utils/icons";

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

function getActionLabel(action: string | null, t: any) {
  switch ((action || "").toLowerCase()) {
    case "withdraw":
    case "withdrawal":
      return t('auth.re_auth.action_withdraw');
    case "change_email":
    case "email":
      return t('auth.re_auth.action_change_email');
    case "change_password":
    case "password":
      return t('auth.re_auth.action_change_password');
    case "disable_mfa":
    case "mfa":
      return t('auth.re_auth.action_disable_mfa');
    default:
      return t('auth.re_auth.action_default');
  }
}

export default function ReAuthPromptPage() {
  const { t } = useTranslation();
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
  const actionLabel = getActionLabel(qs.get("action"), t);

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
    setSnack({ open: true, severity: "success", msg: mfaMethod === "sms" ? t('auth.re_auth.msg_sms_sent') : t('auth.re_auth.msg_email_sent') });
  };

  const expectedCode = mfaMethod === "totp" ? "654321" : mfaMethod === "sms" ? "222222" : "111111";

  const confirm = () => {
    setBanner(null);

    if (promptMode === "password") {
      if (!password) {
        setBanner({ severity: "warning", msg: t('auth.re_auth.validation_password_empty') });
        return;
      }
      if (password !== "EVzone123!") {
        setBanner({ severity: "error", msg: t('auth.re_auth.validation_password_incorrect') });
        return;
      }
      setStep("success");
      setSnack({ open: true, severity: "success", msg: t('auth.re_auth.success_confirmed') });
      return;
    }

    if ((mfaMethod === "sms" || mfaMethod === "email") && !codeSent) {
      setBanner({ severity: "warning", msg: t('auth.re_auth.validation_send_first') });
      return;
    }

    const code = otp.join("");
    if (code.length < 6) {
      setBanner({ severity: "warning", msg: t('auth.re_auth.validation_code_empty') });
      return;
    }

    if (code !== expectedCode) {
      setBanner({ severity: "error", msg: t('auth.re_auth.validation_code_incorrect') });
      return;
    }

    setStep("success");
    setSnack({ open: true, severity: "success", msg: t('auth.re_auth.success_confirmed') });
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
                    {t('app_name')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {t('auth.re_auth.subtitle')}
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

                <LanguageSwitcher />

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
                    <Typography variant="h6">{t('auth.re_auth.subtitle_security_title')}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      <Trans i18nKey="auth.re_auth.subtitle_security_desc" values={{ action: actionLabel }} components={{ b: <b /> }} />
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <ShieldCheckIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.re_auth.feature_fraud_title')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.re_auth.feature_fraud_desc')}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <LockIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.re_auth.feature_short_lived_title')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.re_auth.feature_short_lived_desc')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      <Trans i18nKey="auth.re_auth.demo_hint" />
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
                        <Typography variant="h6">{t('auth.re_auth.title_confirmed')}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {t('auth.re_auth.desc_confirmed')}
                      </Typography>
                      <Button variant="contained" color="secondary" endIcon={<ArrowRightIcon size={18} />} sx={orangeContainedSx} onClick={continueNext}>
                        {t('auth.re_auth.btn_continue_confirmed')}
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">{t('auth.re_auth.title_confirm_identity')}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.re_auth.desc_confirm_identity')}
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
                        <Tab icon={<LockIcon size={16} />} iconPosition="start" label={t('auth.re_auth.tab_password')} />
                        <Tab icon={<KeypadIcon size={16} />} iconPosition="start" label={t('auth.re_auth.tab_mfa_code')} />
                      </Tabs>

                      {promptMode === "password" ? (
                        <Stack spacing={1.4}>
                          <TextField
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label={t('auth.re_auth.tab_password')}
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
                              {t('auth.re_auth.btn_confirm')}
                            </Button>
                            <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => navigate("/auth/forgot-password")}>
                              {t('auth.re_auth.btn_forgot_password')}
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
                            <Tab icon={<KeypadIcon size={16} />} iconPosition="start" label={t('auth.re_auth.tab_auth')} />
                            <Tab icon={<SmsIcon size={16} />} iconPosition="start" label={t('auth.re_auth.tab_sms')} />
                            <Tab icon={<MailIcon size={16} />} iconPosition="start" label={t('auth.re_auth.tab_email')} />
                          </Tabs>

                          {(mfaMethod === "sms" || mfaMethod === "email") ? (
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={sendCode} disabled={cooldown > 0 && codeSent}>
                                {codeSent ? t('auth.re_auth.btn_code_sent') : t('auth.re_auth.btn_send_code')}
                              </Button>
                              <Button
                                variant="outlined"
                                sx={orangeOutlinedSx}
                                onClick={() => {
                                  if (cooldown === 0) sendCode();
                                }}
                                disabled={!codeSent || cooldown > 0}
                              >
                                {cooldown > 0 ? t('auth.re_auth.btn_resend_timer', { seconds: cooldown }) : t('auth.re_auth.btn_resend')}
                              </Button>
                            </Stack>
                          ) : null}

                          <OtpInput value={otp} onChange={setOtp} autoFocus />

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={confirm} endIcon={<ArrowRightIcon size={18} />}>
                              {t('auth.re_auth.btn_confirm')}
                            </Button>
                            <Button variant="outlined" sx={orangeOutlinedSx} onClick={useRecovery}>
                              {t('auth.re_auth.btn_use_recovery')}
                            </Button>
                          </Stack>
                        </Stack>
                      )}

                      <Divider />

                      <Button variant="text" sx={orangeTextSx} onClick={() => navigate(-1)}>
                        {t('auth.re_auth.btn_cancel')}
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
                {t('auth.terms')}
              </Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>
                {t('auth.privacy')}
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
      </Box >
    </ThemeProvider >
  );
}
