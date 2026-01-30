import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";

/**
 * EVzone - Privacy Policy
 * Route: /legal/privacy
 * Public page
 *
 * NOTE: Template content only. Replace with final policy text.
 */

import { ThemeMode, Severity } from "@/types";
import {
  SunIcon,
  MoonIcon,
  GlobeIcon,
  ShieldIcon,
  PrintIcon,
  LinkIcon
} from "@/components/icons";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

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
      h5: { fontWeight: 950, letterSpacing: -0.6 },
      h6: { fontWeight: 900, letterSpacing: -0.28 },
      body1: { lineHeight: 1.75 },
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

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Box id={id} sx={{ scrollMarginTop: 96 }}>
      <Typography variant="h6" sx={{ fontWeight: 950 }}>{title}</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body1" sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}>{children}</Typography>
    </Box>
  );
}

export default function PrivacyPolicyPage() {
  const { t } = useTranslation("common"); {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const lastUpdated = "2025-12-25";

  const sections = useMemo(
    () => [
      { id: "overview", title: "1. Overview" },
      { id: "data", title: "2. Data we collect" },
      { id: "use", title: "3. How we use data" },
      { id: "share", title: "4. Sharing" },
      { id: "security", title: "5. Security" },
      { id: "retention", title: "6. Retention" },
      { id: "rights", title: "7. Your rights" },
      { id: "cookies", title: "8. Cookies" },
      { id: "contact", title: "9. Contact" },
    ],
    []
  );

  const [snack, setSnack] = useState(false);

  const toggleMode = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    setStoredMode(next);
  };

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.18), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.12), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.14), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.09), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSnack(true);
    } catch {
      setSnack(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ minHeight: "100vh", background: pageBg }}>
        {/* Header */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", backgroundColor: alpha(theme.palette.background.default, 0.72), borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${EVZONE.green} 0%, rgba(3,205,140,0.75) 100%)` }}>
                  <Typography sx={{ color: "white", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>EVzone</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Privacy Policy</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Print">
                  <IconButton size="small" onClick={() => window.print()} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    <PrintIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy link">
                  <IconButton size="small" onClick={copyLink} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    <LinkIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <Stack spacing={2.2}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={1.2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ShieldIcon size={18} />
                    <Typography variant="h5">Privacy Policy</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Last updated: {lastUpdated}</Typography>
                  <Divider />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    This page is a template. Replace with your final privacy policy.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip variant="outlined" label="Public" />
                    <Chip variant="outlined" label="Linked in footer" />
                    <Chip variant="outlined" label="Applies across EVzone apps" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
              <Box className="md:col-span-4">
                <Card>
                  <CardContent className="p-5">
                    <Stack spacing={1.0}>
                      <Typography sx={{ fontWeight: 950 }}>Table of contents</Typography>
                      <Divider />
                      {sections.map((s) => (
                        <Button key={s.id} variant="outlined" sx={orangeOutlined} onClick={() => scrollToId(s.id)}>
                          {s.title}
                        </Button>
                      ))}
                      <Divider />
                      <Button variant="outlined" sx={orangeOutlined} onClick={() => scrollToId("rights")}>Go to rights</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box className="md:col-span-8">
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={2.2}>
                      <Section id="overview" title="1. Overview">
                        EVzone collects and processes personal data to provide and improve services.
                        This section should describe your scope and definitions.
                      </Section>

                      <Section id="data" title="2. Data we collect">
                        Examples: profile data (name, email, phone), wallet and transaction references, device and security logs, and verification data for KYC.
                      </Section>

                      <Section id="use" title="3. How we use data">
                        Examples: account access, security, service delivery, payments, fraud prevention, customer support, and legal compliance.
                      </Section>

                      <Section id="share" title="4. Sharing">
                        Examples: payment providers, verification providers, hosting providers, and partners when needed to deliver services.
                        Explain cross-border transfers where applicable.
                      </Section>

                      <Section id="security" title="5. Security">
                        EVzone applies technical and organizational controls to protect data.
                        No system is 100% secure. Encourage users to use strong passwords and 2FA.
                      </Section>

                      <Section id="retention" title="6. Retention">
                        Data is retained only as long as needed for the purposes described, including legal and audit requirements.
                      </Section>

                      <Section id="rights" title="7. Your rights">
                        Examples: access, correction, deletion, data portability, and objection.
                        Provide instructions for requesting these rights using My Accounts.
                      </Section>

                      <Section id="cookies" title="8. Cookies">
                        Refer to Cookie Policy for details. Cookies support login sessions, security, and analytics.
                      </Section>

                      <Section id="contact" title="9. Contact">
                        Provide official support channels. Avoid listing personal numbers in the final policy.
                      </Section>

                      <Divider />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Stack>
        </Box>

        <Snackbar open={snack} autoHideDuration={2200} onClose={() => setSnack(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Card sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96) }}>
            <CardContent sx={{ py: 1.0, px: 1.4 }}>
              <Typography sx={{ fontWeight: 900 }}>Copied</Typography>
            </CardContent>
          </Card>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
