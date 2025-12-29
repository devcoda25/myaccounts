import React, { useEffect, useMemo, useState } from "react";
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
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { useTranslation, Trans } from "react-i18next";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  HelpCircleIcon,
  MoonIcon,
  ShieldCheckIcon,
  SunIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  FingerprintIcon,
  LockIcon,
  GlobeIcon,
} from "../../../utils/icons";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Set Password
 * Route: /auth/set-password
 *
 * Fixes:
 * - Removed lucide-react dependency to avoid CDN fetch issues in this sandbox.
 * - Fixed MUI error #9 by removing alpha("currentColor") usage.
 *   (We now use SVG strokeOpacity for dimmed icons.)
 *
 * Requirements:
 * - Premium light + dark mode toggle (persisted)
 * - Background: green-only
 * - Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 *
 * Features:
 * - Password strength meter
 * - Requirements checklist (At least 8 characters)
 * - Confirm password
 * - Optional: “Enable passkey later” teaser
 * - Continue → optional 2FA setup or redirect back to app (demo)
 */

type ThemeMode = "light" | "dark";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

// -----------------------------
// Inline Lucide-style icons
// -----------------------------


// -----------------------------
// Theme utilities
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
      h4: { fontWeight: 930, letterSpacing: -0.7 },
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
// Password scoring
// -----------------------------
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

// --- Lightweight self-tests (runs once, does not affect UI) ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_SET_PASSWORD_TESTS_RAN__) return;
    w.__EVZONE_SET_PASSWORD_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("strengthScore empty", strengthScore("") === 0);
    assert("strengthScore lower len>=8", strengthScore("abcdefghij") === 2); // len + lower
    assert("strengthScore lower len=7", strengthScore("abcdefg") === 1); // lower only
    assert("strengthScore lower len=8", strengthScore("abcdefgh") === 2); // len + lower
    assert("strengthScore upper/lower/len", strengthScore("Abcdefghij") === 3);
    assert("strengthScore strong", strengthScore("Abcdefghij1!") === 5);

    const r1 = reqs("Abcdefghij1!");
    const r2 = reqs("Abcdef1!"); // 8 chars
    const r3 = reqs("Abcde1!"); // 7 chars

    assert("reqs len", r1.len === true);
    assert("reqs upper", r1.upper === true);
    assert("reqs lower", r1.lower === true);
    assert("reqs num", r1.num === true);
    assert("reqs sym", r1.sym === true);

    assert("reqs len=8 true", r2.len === true);
    assert("reqs upper true", r2.upper === true);
    assert("reqs lower true", r2.lower === true);
    assert("reqs num true", r2.num === true);
    assert("reqs sym true", r2.sym === true);

    assert("reqs len=7 false", r3.len === false);

    // eslint-disable-next-line no-console
    console.log("EVzone Set Password: self-tests passed");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

export default function SetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [teaserPasskey, setTeaserPasskey] = useState(true);

  const [banner, setBanner] = useState<
    { severity: "error" | "warning" | "info" | "success"; msg: string } | null
  >(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    severity: "success" | "info" | "warning" | "error";
    msg: string;
  }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
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

  const s = strengthScore(pw);
  const label =
    s <= 1 ? t('auth.set_password.strength_weak') : s === 2 ? t('auth.set_password.strength_fair') : s === 3 ? t('auth.set_password.strength_good') : s === 4 ? t('auth.set_password.strength_strong') : t('auth.set_password.strength_very_strong');
  const r = reqs(pw);
  const canContinue = s >= 3 && pw === confirm;

  const onContinue = () => {
    setBanner(null);

    if (!pw) {
      setBanner({ severity: "warning", msg: t('auth.set_password.validation_create_pw') });
      return;
    }
    if (s < 3) {
      setBanner({ severity: "warning", msg: t('auth.set_password.validation_strengthen') });
      return;
    }
    if (pw !== confirm) {
      setBanner({ severity: "warning", msg: t('auth.set_password.validation_mismatch') });
      return;
    }

    setSnack({
      open: true,
      severity: "success",
      msg: t('auth.set_password.success_set'),
    });
    setTimeout(() => {
      navigate("/app");
    }, 1200);
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
                  <img src="/logo.png" alt="EVzone" style={{ height: '100%', width: 'auto' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>
                    {t('app_name')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {t('auth.set_password.app_subtitle')}
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
                    <Typography variant="h6">{t('auth.set_password.create_strong_title')}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.set_password.create_strong_desc')}
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
                          <KeyIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.set_password.requirements_title')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.set_password.requirements_desc')}
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
                          <ShieldCheckIcon size={18} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.set_password.next_2fa_title')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.set_password.next_2fa_desc')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {teaserPasskey ? (
                      <Box
                        sx={{
                          borderRadius: 18,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.45),
                          p: 1.4,
                        }}
                      >
                        <Stack spacing={0.8}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ color: EVZONE.green, display: "grid", placeItems: "center" }}>
                              <FingerprintIcon size={18} />
                            </Box>
                            <Typography sx={{ fontWeight: 900 }}>{t('auth.set_password.passkey_teaser_title')}</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.set_password.passkey_teaser_desc')}
                          </Typography>
                          <Button variant="text" sx={orangeTextSx} onClick={() => setTeaserPasskey(false)}>
                            {t('auth.set_password.dismiss')}
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Alert severity="info">{t('auth.set_password.passkey_info')}</Alert>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Button
                      variant="outlined"
                      startIcon={<ArrowLeftIcon size={18} />}
                      sx={orangeOutlinedSx}
                      onClick={() => navigate(-1)}
                    >
                      {t('auth.set_password.back')}
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
                      <Typography variant="h6">{t('auth.set_password.title')}</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {t('auth.set_password.subtitle')}
                      </Typography>
                    </Stack>

                    {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                    <Stack spacing={1.4}>
                      <TextField
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        label={t('auth.set_password.password_label')}
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
                                aria-label={showPw ? "Hide password" : "Show password"}
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
                        label={t('auth.set_password.confirm_password_label')}
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
                                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                              >
                                {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Strength meter */}
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
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 900 }}>
                            {label}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.set_password.strength_tip')}
                        </Typography>
                      </Stack>

                      {/* Requirements checklist */}
                      <Box
                        sx={{
                          borderRadius: 18,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.45),
                          p: 1.4,
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, mb: 1 }}>{t('auth.set_password.requirements_header')}</Typography>
                        <Stack spacing={0.7}>
                          {[
                            { ok: r.len, text: t('auth.set_password.req_len') },
                            { ok: r.upper, text: t('auth.set_password.req_upper') },
                            { ok: r.lower, text: t('auth.set_password.req_lower') },
                            { ok: r.num, text: t('auth.set_password.req_num') },
                            { ok: r.sym, text: t('auth.set_password.req_sym') },
                          ].map((item, idx) => (
                            <Stack key={idx} direction="row" spacing={1} alignItems="center">
                              <CheckCircleIcon size={18} color={!item.ok ? alpha(theme.palette.text.primary, 0.35) : undefined} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: item.ok ? theme.palette.text.primary : theme.palette.text.secondary,
                                  fontWeight: item.ok ? 900 : 700,
                                }}
                              >
                                {item.text}
                              </Typography>
                            </Stack>
                          ))}

                          <Divider sx={{ my: 0.6 }} />

                          <Stack direction="row" spacing={1} alignItems="center">
                            <CheckCircleIcon size={18} color={!(pw && pw === confirm) ? alpha(theme.palette.text.primary, 0.35) : undefined} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: pw && pw === confirm ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontWeight: pw && pw === confirm ? 900 : 700,
                              }}
                            >
                              {t('auth.set_password.req_match')}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>

                      {/* Optional passkey teaser */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={teaserPasskey}
                            onChange={(e) => setTeaserPasskey(e.target.checked)}
                            sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }}
                          />
                        }
                        label={<Typography variant="body2">{t('auth.set_password.show_passkey_teaser')}</Typography>}
                      />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          variant="contained"
                          color="secondary"
                          endIcon={<ArrowRightIcon size={18} />}
                          sx={orangeContainedSx}
                          onClick={onContinue}
                          disabled={!canContinue}
                          fullWidth
                        >
                          {t('auth.set_password.btn_continue')}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ArrowLeftIcon size={18} />}
                          sx={orangeOutlinedSx}
                          onClick={() => navigate(-1)}
                          fullWidth
                        >
                          {t('auth.set_password.back')}
                        </Button>
                      </Stack>

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {t('auth.set_password.next_steps_footer')}
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
              © {new Date().getFullYear()} {t('app_name')}.
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
      </Box>
    </ThemeProvider>
  );
}
