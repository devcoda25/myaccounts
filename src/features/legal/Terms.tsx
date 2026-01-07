import React, { useEffect, useMemo, useRef, useState } from "react";
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
 * EVzone - Terms of Service
 * Route: /legal/terms
 * Public page (linked everywhere)
 *
 * NOTE: This is a premium UI template with placeholder legal text.
 * Replace with lawyer reviewed terms.
 */

import { ThemeMode, Severity } from "@/types";
import {
  SunIcon,
  MoonIcon,
  GlobeIcon,
  FileTextIcon,
  PrintIcon,
  LinkIcon
} from "@/components/icons";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

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

export default function TermsOfServicePage() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const lastUpdated = "2025-12-25";

  const sections = useMemo(
    () => [
      { id: "acceptance", title: "1. Acceptance" },
      { id: "eligibility", title: "2. Eligibility" },
      { id: "accounts", title: "3. Accounts and security" },
      { id: "wallet", title: "4. Wallet and payments" },
      { id: "services", title: "5. EVzone services" },
      { id: "prohibited", title: "6. Prohibited use" },
      { id: "termination", title: "7. Suspension and termination" },
      { id: "liability", title: "8. Disclaimers and limitation of liability" },
      { id: "law", title: "9. Governing law" },
      { id: "contact", title: "10. Contact" },
    ],
    []
  );

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    // no-op
  }, []);

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

  const greenContained = {
    backgroundColor: EVZONE.green,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.22 : 0.14)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
  } as const;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSnack({ open: true, severity: "success", msg: "Link copied." });
    } catch {
      setSnack({ open: true, severity: "warning", msg: "Copy failed." });
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
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Terms of Service</Typography>
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

        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <Stack spacing={2.2}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={1.2}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FileTextIcon size={18} />
                        <Typography variant="h5">Terms of Service</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Last updated: {lastUpdated}
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" sx={greenContained} onClick={() => scrollToId("acceptance")}>Read now</Button>
                      <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Download PDF (later)." })}>
                        Download PDF (later)
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    This page is a template. Replace all content with lawyer reviewed terms.
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
              {/* TOC */}
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
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              {/* Content */}
              <Box className="md:col-span-8">
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={2.2}>
                      <Section id="acceptance" title="1. Acceptance">
                        By accessing or using EVzone services, you agree to these Terms. If you do not agree, do not use the services.
                      </Section>

                      <Section id="eligibility" title="2. Eligibility">
                        You must be legally able to form a contract in your jurisdiction. Some services may have additional requirements.
                      </Section>

                      <Section id="accounts" title="3. Accounts and security">
                        You are responsible for maintaining account confidentiality. Notify EVzone immediately of suspected unauthorized access. EVzone may require re-authentication for sensitive actions.
                      </Section>

                      <Section id="wallet" title="4. Wallet and payments">
                        Wallet features may require verification. Fees and limits may apply. EVzone does not store raw card details. Payment processing may be performed by third-party providers.
                      </Section>

                      <Section id="services" title="5. EVzone services">
                        EVzone may provide charging services, marketplace services, education services, and other digital services. Service availability may vary by region.
                      </Section>

                      <Section id="prohibited" title="6. Prohibited use">
                        Do not use the services for fraud, unlawful activity, unauthorized access, or abuse. EVzone may investigate and take action.
                      </Section>

                      <Section id="termination" title="7. Suspension and termination">
                        EVzone may suspend or terminate accounts for violations, security risk, or legal compliance. You may deactivate or request deletion through My Accounts.
                      </Section>

                      <Section id="liability" title="8. Disclaimers and limitation of liability">
                        Services are provided on an as-is basis. To the extent permitted by law, EVzone limits liability for indirect or consequential damages.
                      </Section>

                      <Section id="law" title="9. Governing law">
                        Governing law and dispute resolution will be specified for your operating region. Replace this placeholder with final terms.
                      </Section>

                      <Section id="contact" title="10. Contact">
                        Contact EVzone support through the support center in My Accounts, or via official channels listed on the EVzone website.
                      </Section>

                      <Divider />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        © {new Date().getFullYear()} EVzone Group.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Stack>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Box>
            {/* Use Box to avoid Alert import here */}
            <Card sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96) }}>
              <CardContent sx={{ py: 1.0, px: 1.4 }}>
                <Typography sx={{ fontWeight: 900 }}>{snack.msg}</Typography>
              </CardContent>
            </Card>
          </Box>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
