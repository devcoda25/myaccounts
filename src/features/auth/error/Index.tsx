import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

/**
 * EVzone My Accounts - OAuth Error / Request Blocked
 * Route: /auth/error
 * Features:
 * - Friendly error title + code
 * - Common cases: invalid redirect URI, expired request, user cancelled
 * - Actions: retry, return to app, support
 *
 * Style rules:
 * - Background: green-only
 * - EVzone actions: orange-only buttons with white text
 */

type ThemeMode = "light" | "dark";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

// -----------------------------
// Inline icons
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
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

function AlertTriangleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function RefreshIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M20 6v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 0 0-14.7-4.7L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12a8 8 0 0 0 14.7 4.7L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
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
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      h6: { fontWeight: 900, letterSpacing: -0.28 },
      button: { fontWeight: 900, textTransform: "none" },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
            backgroundImage: "radial-gradient(900px 420px at 12% 0%, rgba(3,205,140,0.14), transparent 60%), radial-gradient(900px 420px at 88% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
      MuiButton: {
        styleOverrides: { root: { borderRadius: 14, paddingTop: 10, paddingBottom: 10, boxShadow: "none" } },
      },
    },
  });
}

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function friendlyTitle(error: string) {
  const e = (error || "").toLowerCase();
  if (e.includes("invalid_redirect") || e.includes("redirect")) return "Invalid redirect address";
  if (e.includes("expired") || e.includes("timeout")) return "Request expired";
  if (e.includes("access_denied") || e.includes("cancel")) return "Request cancelled";
  if (e.includes("invalid_request")) return "Invalid request";
  if (e.includes("unauthorized_client")) return "App not authorized";
  return "Sign-in request blocked";
}

export default function OAuthErrorPage() {
  const { t } = useTranslation("common");
  {
    const navigate = useNavigate();
    const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
    const theme = useMemo(() => buildTheme(mode), [mode]);
    const isDark = mode === "dark";

    const qs = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const appName = qs.get("app") || "EVzone App";
    const redirectUri = qs.get("redirect_uri") || "";
    const error = qs.get("error") || qs.get("code") || "request_blocked";
    const desc = qs.get("error_description") || "The sign-in request could not be completed.";

    const [supportOpen, setSupportOpen] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({ open: false, severity: "info", msg: "" });

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

    const retry = () => window.location.reload();
    const returnToApp = () => navigate("/app");

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box className="min-h-screen" sx={{ background: pageBg }}>
          {/* Top bar */}
          <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box className="mx-auto max-w-5xl px-4 py-3 md:px-6">
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <Box sx={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.82) 55%, rgba(3,205,140,0.62) 100%)", boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.22)}` }}>
                    <Typography sx={{ color: "white", fontWeight: 900, letterSpacing: -0.4 }}>EV</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>EVzone My Accounts</Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>OAuth error</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
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
                    <IconButton size="small" onClick={() => setSupportOpen(true)} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.35)}`, borderRadius: 12, backgroundColor: alpha(theme.palette.background.paper, 0.6), color: EVZONE.orange }}>
                      <HelpCircleIcon size={18} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>
          </Box>

          {/* Body */}
          <Box className="mx-auto max-w-5xl px-4 py-10 md:px-6">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={2.0}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.14 : 0.10), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <AlertTriangleIcon size={20} />
                        </Box>
                        <Box>
                          <Typography variant="h6">{friendlyTitle(error)}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            {desc}
                          </Typography>
                        </Box>
                      </Stack>

                      <Box sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), px: 1.5, py: 1.1 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Error code</Typography>
                        <Typography sx={{ fontWeight: 900 }}>{error}</Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.40), p: 1.4 }}>
                      <Stack spacing={0.8}>
                        <Typography sx={{ fontWeight: 900 }}>Common fixes</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>• Try again and ensure the app is updated.</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>• If you cancelled, start the sign-in again from the app.</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>• If you see an invalid redirect, the app configuration may be wrong.</Typography>
                        {redirectUri ? (
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>• Redirect destination: <b>{safeHost(redirectUri)}</b></Typography>
                        ) : null}
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={orangeContainedSx} startIcon={<RefreshIcon size={18} />} onClick={retry}>
                        Retry
                      </Button>
                      <Button variant="outlined" sx={orangeOutlinedSx} startIcon={<ArrowLeftIcon size={18} />} onClick={returnToApp}>
                        Return to {appName}
                      </Button>
                      <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setSupportOpen(true)}>
                        Support
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      If you keep seeing this message, contact support and share the error code.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Footer */}
            <Box className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between" sx={{ opacity: 0.92 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/terms", "_blank")}>Terms</Button>
                <Button size="small" variant="text" sx={orangeTextSx} onClick={() => window.open("/legal/privacy", "_blank")}>Privacy</Button>
              </Stack>
            </Box>
          </Box>

          {/* Support dialog */}
          <Dialog open={supportOpen} onClose={() => setSupportOpen(false)} PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
            <DialogTitle sx={{ fontWeight: 950 }}>Support</DialogTitle>
            <DialogContent>
              <Stack spacing={1.2}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Share the error code and what you were trying to do. For security, do not share passwords.
                </Typography>
                <Alert severity="info">Error code: <b>{error}</b></Alert>
                <Box sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.55), p: 1.2 }}>
                  <Typography sx={{ fontWeight: 900 }}>Support channels (demo)</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.8 }}>• Email: support@evzone.com</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>• Phone: +256 700 000 000</Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setSupportOpen(false)}>
                Close
              </Button>
              <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={() => { setSupportOpen(false); setSnack({ open: true, severity: "success", msg: "Support request submitted (demo)." }); }}>
                Submit
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
            <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
              {snack.msg}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    );
  }
}
