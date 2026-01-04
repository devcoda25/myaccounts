import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Passkey Sign-in
 * Route: /auth/passkey
 *
 * Features:
 * - WebAuthn prompt
 * - Fallback to password
 */

type ThemeMode = "light" | "dark";
type Severity = "info" | "warning" | "error" | "success";

type ViewMode = "passkey" | "password";

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;
const THEME_KEY = "evzone_myaccounts_theme";

// -----------------------------
// Inline icons (CDN-safe)
// -----------------------------
import { useTranslation, Trans } from "react-i18next";
import LanguageSwitcher from "../../../../components/common/LanguageSwitcher";
import AuthHeader from "../../../../components/headers/AuthHeader";
import { EVZONE as EVZONE_THEME } from "../../../../theme/evzone";
import {
  IconBase,
  SunIcon,
  MoonIcon,
  GlobeIcon,
  FingerprintIcon,
  KeyIcon,
  LockIcon,
  ArrowLeftIcon,
  HelpCircleIcon,
} from "../../../../utils/icons";

// -----------------------------
// Theme
// -----------------------------
function getStoredMode(): ThemeMode {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? (v as ThemeMode) : "light";
  } catch {
    return "light";
  }
}
function setStoredMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_KEY, mode);
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
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      h4: { fontWeight: 950, letterSpacing: -0.9 },
      h6: { fontWeight: 900, letterSpacing: -0.28 },
      button: { fontWeight: 900, textTransform: "none" },
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: 14, textTransform: "none", boxShadow: "none" } } },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
            backgroundImage:
              "radial-gradient(900px 420px at 10% 0%, rgba(3,205,140,0.12), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
    },
  });
}

// -----------------------------
// Helpers
// -----------------------------
function supportsPasskeys() {
  try {
    const w = window as any;
    return !!w.PublicKeyCredential;
  } catch {
    return false;
  }
}

async function tryWebAuthnGet(): Promise<{ ok: boolean; message: string }> {
  // In production, you will pass a real challenge and allowCredentials.
  // This demo tries a minimal call and gracefully handles unsupported/blocked contexts.
  try {
    const nav: any = navigator as any;
    if (!nav?.credentials?.get) return { ok: false, message: "WebAuthn is not available." }; // This string is internal/error, we can translate it if needed but maybe later. actually let's use t in the component

    const random = new Uint8Array(32);
    try {
      window.crypto.getRandomValues(random);
    } catch {
      for (let i = 0; i < random.length; i++) random[i] = Math.floor(Math.random() * 256);
    }

    await nav.credentials.get({
      publicKey: {
        challenge: random,
        timeout: 60000,
        userVerification: "preferred",
      },
    });

    return { ok: true, message: "Passkey sign-in successful." };
  } catch (e: any) {
    const name = e?.name || "Error";
    // NotAllowedError / SecurityError are common in non-secure contexts.
    return { ok: false, message: `${name}: passkey prompt was cancelled or not allowed in this environment.` };
  }
}

// --- self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_PASSKEY_SIGNIN_TESTS_RAN__) return;
    w.__EVZONE_PASSKEY_SIGNIN_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("supportsPasskeys returns boolean", typeof supportsPasskeys() === "boolean");

  } catch (e) {
    // ignore
  }
}

export default function PasskeySignInPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [view, setView] = useState<ViewMode>("passkey");
  const [busy, setBusy] = useState(false);

  const [identifier, setIdentifier] = useState("ronald.isabirye@gmail.com");
  const [password, setPassword] = useState("");

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

  const toggleMode = () => {
    const next: ThemeMode = isDark ? "light" : "dark";
    setMode(next);
    setStoredMode(next);
  };

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const greenContained = {
    backgroundColor: EVZONE.green,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.24 : 0.16)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const doPasskey = async () => {
    setBusy(true);
    try {
      if (!supportsPasskeys()) {
        setSnack({ open: true, severity: "warning", msg: t('auth.passkey.validation_no_support') });
        return;
      }
      const res = await tryWebAuthnGet();
      setSnack({ open: true, severity: res.ok ? "success" : "warning", msg: res.message });
      if (res.ok) {
        navigate("/app");
      }
    } finally {
      setBusy(false);
    }
  };

  const doPassword = () => {
    if (!identifier.trim()) {
      setSnack({ open: true, severity: "warning", msg: t('auth.passkey.validation_enter_identifier') });
      return;
    }
    if (password !== "EVzone123!") {
      setSnack({ open: true, severity: "error", msg: t('auth.passkey.validation_invalid_credentials') });
      return;
    }
    setSnack({ open: true, severity: "success", msg: t('auth.passkey.success_signed_in') });
    navigate("/app");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top bar */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${EVZONE.green} 0%, rgba(3,205,140,0.75) 100%)` }}>
                  <Typography sx={{ color: "white", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>{t('app_name')}</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{t('auth.passkey.subtitle')}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <LanguageSwitcher />

                <Tooltip title="Help">
                  <IconButton size="small" onClick={() => navigate("/auth/account-recovery-help")} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    <HelpCircleIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Content */}
        <Box className="mx-auto max-w-3xl px-4 py-8 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h4">{t('auth.passkey.title')}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.passkey.desc')}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" variant="outlined" label={supportsPasskeys() ? t('auth.passkey.tag_supported') : t('auth.passkey.tag_limited')} />
                          <Chip size="small" variant="outlined" label={t('auth.passkey.tag_webauthn')} />
                        </Stack>
                      </Box>

                      <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/auth/sign-in")}>
                        {t('auth.passkey.btn_back')}
                      </Button>
                    </Stack>

                    <Divider />

                    <TextField
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      label={t('auth.passkey.input_identifier')}
                      fullWidth
                      placeholder={t('auth.passkey.input_identifier_placeholder')}
                      InputProps={{ startAdornment: (<InputAdornment position="start"><KeyIcon size={18} /></InputAdornment>) }}
                    />

                    <Alert severity="info" icon={<FingerprintIcon size={18} />}>
                      {t('auth.passkey.alert_phishing')}
                    </Alert>

                    {busy ? (
                      <Box>
                        <LinearProgress />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{t('auth.passkey.status_waiting')}</Typography>
                      </Box>
                    ) : null}

                    {view === "passkey" ? (
                      <Stack spacing={1.2}>
                        <Button variant="contained" sx={orangeContained} startIcon={<FingerprintIcon size={18} />} onClick={doPasskey} disabled={busy}>
                          {t('auth.passkey.btn_continue_passkey')}
                        </Button>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<LockIcon size={18} />} onClick={() => setView("password")} disabled={busy}>
                          {t('auth.passkey.btn_use_password')}
                        </Button>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.passkey.hint_no_passkey')}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={1.2}>
                        <TextField
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          label={t('auth.passkey.input_password')}
                          type="password"
                          fullWidth
                          InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon size={18} /></InputAdornment>) }}
                          helperText={t('auth.passkey.helper_password_demo')}
                        />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button variant="contained" sx={greenContained} onClick={doPassword}>
                            {t('auth.passkey.btn_sign_in')}
                          </Button>
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => setView("passkey")}>
                            {t('auth.passkey.btn_back_passkey')}
                          </Button>
                        </Stack>
                      </Stack>
                    )}

                    <Divider />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/auth/forgot-password")}>
                        {t('auth.passkey.btn_forgot_password')}
                      </Button>
                      <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/auth/sign-in/otp")}>
                        {t('auth.passkey.btn_use_otp')}
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.passkey.footer_terms')}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => setView(view === "passkey" ? "password" : "passkey")}>
                        {view === "passkey" ? t('auth.passkey.toggle_password') : t('auth.passkey.toggle_passkey')}
                      </Button>
                      <Button fullWidth variant="contained" sx={orangeContained} onClick={view === "passkey" ? doPasskey : doPassword} disabled={busy}>
                        {t('auth.passkey.btn_continue')}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
              </Box>
            </Stack>
          </motion.div>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
