import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Recovery Code Entry
 * Route: /auth/recovery-code
 *
 * Features:
 * - Single-use recovery code input
 * - Guidance on where to find codes
 * - After success → strongly prompt to regenerate recovery codes
 */

type ThemeMode = "light" | "dark";

type Step = "entry" | "success";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

import { useTranslation, Trans } from "react-i18next";
import LanguageSwitcher from "../../../../components/common/LanguageSwitcher";
import {
  IconBase,
  SunIcon,
  MoonIcon,
  GlobeIcon,
  HelpCircleIcon,
  KeyIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
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
      MuiButton: { styleOverrides: { root: { borderRadius: 14, paddingTop: 10, paddingBottom: 10, boxShadow: "none" } } },
    },
  });
}

function normalizeCode(s: string) {
  return s
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

export default function RecoveryCodeEntryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [step, setStep] = useState<Step>("entry");
  const [code, setCode] = useState("EVZ-REC-1A2B3C");
  const [banner, setBanner] = useState<{ severity: "error" | "warning" | "info" | "success"; msg: string } | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>(
    { open: false, severity: "info", msg: "" }
  );

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

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const verify = () => {
    setBanner(null);
    const v = normalizeCode(code);
    if (!v) {
      setBanner({ severity: "warning", msg: t('auth.recovery_code.validation_empty') });
      return;
    }

    // Demo accepted code
    if (v !== "EVZ-REC-1A2B3C") {
      setBanner({ severity: "error", msg: t('auth.recovery_code.validation_invalid') });
      return;
    }

    setStep("success");
    setSnack({ open: true, severity: "success", msg: t('auth.recovery_code.success_verified') });
  };

  const regenerate = () => {
    navigate("/app/security/recovery-codes");
  };

  const continueNext = () => {
    // In real app, redirect to original destination
    navigate("/app");
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
                    {t('auth.recovery_code.subtitle')}
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
            {/* Left guidance */}
            <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-6">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">{t('auth.recovery_code.title')}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.recovery_code.desc')}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={0.8}>
                      <Typography sx={{ fontWeight: 900 }}>{t('auth.recovery_code.where_find_title')}</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        • {t('auth.recovery_code.where_find_1')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        • {t('auth.recovery_code.where_find_2')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        • {t('auth.recovery_code.where_find_3')}
                      </Typography>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Alert severity="warning">
                      {t('auth.recovery_code.alert_single_use')}
                    </Alert>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      <Trans i18nKey="auth.recovery_code.demo_code_hint" />
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right form */}
            <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  {step === "success" ? (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: EVZONE.green }}>
                          <CheckCircleIcon size={22} />
                        </Box>
                        <Typography variant="h6">{t('auth.recovery_code.success_title')}</Typography>
                      </Stack>

                      <Alert severity="warning">
                        {t('auth.recovery_code.alert_regenerate')}
                      </Alert>

                      <Box
                        sx={{
                          borderRadius: 18,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.45),
                          p: 1.4,
                        }}
                      >
                        <Stack spacing={1.2}>
                          <Typography sx={{ fontWeight: 900 }}>{t('auth.recovery_code.next_steps_title')}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {t('auth.recovery_code.next_steps_desc')}
                          </Typography>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={regenerate}>
                              {t('auth.recovery_code.btn_regenerate')}
                            </Button>
                            <Button variant="outlined" sx={orangeOutlinedSx} onClick={continueNext} endIcon={<ArrowRightIcon size={18} />}>
                              {t('auth.recovery_code.btn_continue')}
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  ) : (
                    <Stack spacing={2.0}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">{t('auth.recovery_code.enter_code_title')}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {t('auth.recovery_code.enter_code_desc')}
                        </Typography>
                      </Stack>

                      {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                      <TextField
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        label={t('auth.recovery_code.label_code')}
                        placeholder={t('auth.recovery_code.placeholder_code')}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <KeyIcon size={18} />
                            </InputAdornment>
                          ),
                        }}
                        helperText={t('auth.recovery_code.helper_code')}
                      />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          variant="contained"
                          color="secondary"
                          sx={orangeContainedSx}
                          onClick={verify}
                          endIcon={<ArrowRightIcon size={18} />}
                        >
                          {t('auth.recovery_code.btn_verify')}
                        </Button>
                        <Button
                          variant="outlined"
                          sx={orangeOutlinedSx}
                          onClick={() => navigate("/auth/mfa")}
                          startIcon={<ArrowLeftIcon size={18} />}
                        >
                          {t('auth.recovery_code.btn_back_mfa')}
                        </Button>
                      </Stack>

                      <Button variant="text" sx={orangeTextSx} onClick={() => navigate("/auth/account-recovery-help")}>
                        {t('auth.recovery_code.link_cant_access')}
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
    </ThemeProvider >
  );
}
