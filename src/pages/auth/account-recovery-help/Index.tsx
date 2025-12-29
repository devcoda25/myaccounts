import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";
import AuthHeader from "../../../components/headers/AuthHeader";

/**
 * EVzone My Accounts - Account Recovery Help
 * Route: /auth/account-recovery-help
 * Features:
 * • Guided troubleshooting: no email received, phone changed, lost MFA
 * • Contact support CTA
 *
 * Style rules:
 * • Background: green-only
 * • Buttons: orange-only with white text (outlined hover -> solid orange + white text)
 */

import { ThemeMode, Severity } from "../../../utils/types";
import {
  IconBase,
  ChevronDownIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  WhatsAppIcon,
  HelpCircleIcon
} from "../../../utils/icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const WHATSAPP = { green: "#25D366" } as const;

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
    shape: { borderRadius: 7 },
    typography: {
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      h6: { fontWeight: 900, letterSpacing: -0.28 },
      subtitle1: { fontWeight: 760 },
      button: { fontWeight: 900, textTransform: "none" },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
            backgroundImage: "radial-gradient(900px 420px at 12% 0%, rgba(3,205,140,0.14), transparent 60%), radial-gradient(900px 420px at 88% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
      MuiButton: { styleOverrides: { root: { borderRadius: 4, paddingTop: 10, paddingBottom: 10, boxShadow: "none" } } },
    },
  });
}

type HelpItem = {
  key: string;
  title: string;
  bullets: string[];
  primaryCta?: { label: string; action: string };
  secondaryCta?: { label: string; action: string };
};

export default function AccountRecoveryHelpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [openKey, setOpenKey] = useState<string>("no_email");
  const [supportOpen, setSupportOpen] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({ open: false, severity: "info", msg: "" });

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

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const items: HelpItem[] = [
    {
      key: "no_email",
      title: t('auth.account_recovery.help_no_email_title'),
      bullets: t('auth.account_recovery.help_no_email_bullets', { returnObjects: true }) as string[],
      primaryCta: { label: t('auth.account_recovery.help_no_email_cta1'), action: "go_forgot" },
      secondaryCta: { label: t('auth.account_recovery.help_no_email_cta2'), action: "support" },
    },
    {
      key: "phone_changed",
      title: t('auth.account_recovery.help_phone_changed_title'),
      bullets: t('auth.account_recovery.help_phone_changed_bullets', { returnObjects: true }) as string[],
      primaryCta: { label: t('auth.account_recovery.help_phone_changed_cta1'), action: "go_forgot" },
      secondaryCta: { label: t('auth.account_recovery.help_phone_changed_cta2'), action: "support" },
    },
    {
      key: "lost_mfa",
      title: t('auth.account_recovery.help_lost_mfa_title'),
      bullets: t('auth.account_recovery.help_lost_mfa_bullets', { returnObjects: true }) as string[],
      primaryCta: { label: t('auth.account_recovery.help_lost_mfa_cta1'), action: "go_recovery" },
      secondaryCta: { label: t('auth.account_recovery.help_lost_mfa_cta2'), action: "support" },
    },
    {
      key: "locked_out",
      title: t('auth.account_recovery.help_locked_out_title'),
      bullets: t('auth.account_recovery.help_locked_out_bullets', { returnObjects: true }) as string[],
      primaryCta: { label: t('auth.account_recovery.help_locked_out_cta1'), action: "go_signin" },
      secondaryCta: { label: t('auth.account_recovery.help_locked_out_cta2'), action: "support" },
    },
  ];

  const runAction = (action: string) => {
    if (action === "go_forgot") {
      navigate("/auth/forgot-password");
      return;
    }
    if (action === "go_recovery") {
      navigate("/auth/recovery-code");
      return;
    }
    if (action === "go_signin") {
      navigate("/auth/sign-in");
      return;
    }
    if (action === "support") {
      setSupportOpen(true);
      return;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Unified Auth Header */}
        {/* Unified Auth Header */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: EVZONE.green,
                display: "grid",
                placeItems: "center",
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
                {t('auth.account_recovery.subtitle')}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <LanguageSwitcher />
          </Stack>
        </Box>

        {/* Body */}
        <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
          <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
            {/* Left: quick actions */}
            <motion.div className="md:col-span-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-6">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">{t('auth.account_recovery.section_quick_actions')}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.account_recovery.section_quick_actions_desc')}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={orangeContainedSx} endIcon={<ArrowRightIcon size={18} />} onClick={() => runAction("go_forgot")}>
                        {t('auth.account_recovery.btn_reset_password')}
                      </Button>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => runAction("go_recovery")}>
                        {t('auth.account_recovery.btn_use_recovery_code')}
                      </Button>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => runAction("go_signin")}>
                        {t('auth.account_recovery.btn_go_signin')}
                      </Button>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Alert severity="info">
                      {t('auth.account_recovery.alert_compromised')}
                    </Alert>

                    <Button variant="text" sx={orangeTextSx} onClick={() => setSupportOpen(true)}>
                      {t('auth.account_recovery.btn_contact_support')}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: guided troubleshooting */}
            <motion.div className="md:col-span-7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.4}>
                    <Stack spacing={0.6}>
                      <Typography variant="h6">{t('auth.account_recovery.section_troubleshooting')}</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {t('auth.account_recovery.section_troubleshooting_desc')}
                      </Typography>
                    </Stack>

                    <Divider />

                    <Stack spacing={1.2}>
                      {items.map((it) => {
                        const open = openKey === it.key;
                        return (
                          <Box
                            key={it.key}
                            sx={{
                              borderRadius: 5,
                              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                              backgroundColor: alpha(theme.palette.background.paper, 0.40),
                              overflow: "hidden",
                            }}
                          >
                            <Button
                              fullWidth
                              variant="text"
                              onClick={() => setOpenKey(open ? "" : it.key)}
                              sx={{
                                justifyContent: "space-between",
                                px: 2,
                                py: 1.5,
                                color: theme.palette.text.primary,
                                fontWeight: 900,
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ color: EVZONE.green }}>
                                  <CheckCircleIcon size={18} />
                                </Box>
                                <Typography sx={{ fontWeight: 900 }}>{it.title}</Typography>
                              </Stack>
                              <Box sx={{ color: EVZONE.orange }}>
                                <ChevronDownIcon size={18} />
                              </Box>
                            </Button>

                            {open ? (
                              <Box sx={{ px: 2, pb: 2 }}>
                                <Divider sx={{ mb: 1.4 }} />
                                <Stack spacing={0.8}>
                                  {it.bullets.map((b, idx) => (
                                    <Typography key={idx} variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                      • {b}
                                    </Typography>
                                  ))}
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 1.6 }}>
                                  {it.primaryCta ? (
                                    <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={() => runAction(it.primaryCta!.action)} endIcon={<ArrowRightIcon size={18} />}>
                                      {it.primaryCta.label}
                                    </Button>
                                  ) : null}
                                  {it.secondaryCta ? (
                                    <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => runAction(it.secondaryCta!.action)}>
                                      {it.secondaryCta.label}
                                    </Button>
                                  ) : null}
                                </Stack>
                              </Box>
                            ) : null}
                          </Box>
                        );
                      })}
                    </Stack>

                    <Divider />

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.account_recovery.footer_troubleshooting')}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Box>

          {/* Footer */}
          <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} {t('app_name')}.</Typography>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>{t('auth.terms')}</Button>
              <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>{t('auth.privacy')}</Button>
            </Stack>
          </Box>
        </Box>

        {/* Support dialog */}
        <Dialog open={supportOpen} onClose={() => setSupportOpen(false)} PaperProps={{ sx: { borderRadius: 6, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>{t('auth.account_recovery.dialog_support_title')}</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {t('auth.account_recovery.dialog_support_desc')}
              </Typography>
              <Box sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.55), p: 1.2 }}>
                <Stack spacing={0.8}>
                  <Typography sx={{ fontWeight: 900 }}>{t('auth.account_recovery.dialog_support_channels')}</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    • {t('auth.account_recovery.dialog_support_email')}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ color: WHATSAPP.green }}>
                      <WhatsAppIcon size={18} />
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('auth.account_recovery.dialog_support_whatsapp')}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    • {t('auth.account_recovery.dialog_support_phone')}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={{ borderColor: alpha(EVZONE.orange, 0.65), color: EVZONE.orange, "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" } }} onClick={() => setSupportOpen(false)}>
              {t('auth.account_recovery.dialog_btn_close')}
            </Button>
            <Button variant="contained" color="secondary" sx={{ backgroundColor: EVZONE.orange, color: "#FFFFFF", "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92) } }} onClick={() => { setSupportOpen(false); setSnack({ open: true, severity: "success", msg: t('auth.account_recovery.success_support_submitted') }); }}>
              {t('auth.account_recovery.dialog_btn_submit')}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider >
  );
}
