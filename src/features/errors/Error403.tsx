import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";

/**
 * EVzone - 403 / Access Denied
 * Route: /errors/403
 */

import { ThemeMode, Severity } from "@/types";
import {
  SunIcon,
  MoonIcon,
  GlobeIcon,
  ShieldOffIcon,
  ArrowLeftIcon,
  HelpCircleIcon
} from "@/components/icons";

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;
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
      h3: { fontWeight: 950, letterSpacing: -1.2 },
      h5: { fontWeight: 950, letterSpacing: -0.6 },
      button: { fontWeight: 900, textTransform: "none" },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)} `,
            backgroundImage:
              "radial-gradient(900px 420px at 10% 0%, rgba(3,205,140,0.14), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
      MuiButton: { styleOverrides: { root: { borderRadius: 14, boxShadow: "none" } } },
    },
  });
}

function routeInfo() {
  try {
    return window.location.pathname || "/errors/403";
  } catch {
    return "/errors/403";
  }
}

export default function Error403Page() {
  const { t } = useTranslation("common");
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const navigate = useNavigate();
  const isDark = mode === "dark";

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1100px 520px at 12% 6%, rgba(3,205,140,0.22), transparent 58%), radial-gradient(900px 520px at 92% 10%, rgba(3,205,140,0.10), transparent 60%), linear-gradient(180deg, #04110D 0%, #07110F 100%)"
      : "radial-gradient(1100px 520px at 12% 6%, rgba(3,205,140,0.18), transparent 60%), radial-gradient(900px 520px at 92% 10%, rgba(3,205,140,0.10), transparent 62%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const toggleMode = () => {
    const next: ThemeMode = isDark ? "light" : "dark";
    setMode(next);
    setStoredMode(next);
  };

  const requested = "EVzone Auth";
  const account = "ronald.isabirye@gmail.com";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", background: pageBg }}>
        {/* Top bar */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", borderBottom: `1px solid ${theme.palette.divider} `, backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: `linear - gradient(135deg, ${EVZONE.green} 0 %, rgba(3, 205, 140, 0.75) 100 %)` }}>
                  <Typography sx={{ color: "#fff", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>System</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Access denied</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)} `, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    {isDark ? <SunIcon /> : <MoonIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)} `, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    <GlobeIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <Stack spacing={2.2}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={1.4}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <Box sx={{ width: 54, height: 54, borderRadius: 18, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.orange, 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)} ` }}>
                        <ShieldOffIcon size={20} />
                      </Box>
                      <Box>
                        <Typography variant="h3">403</Typography>
                        <Typography variant="h5">Access denied</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          You do not have permission to view this page.
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon />} onClick={() => setSnack({ open: true, severity: "info", msg: "Go back (demo)." })}>
                        Go back
                      </Button>
                      <Button variant="contained" sx={orangeContained} onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /auth/choose-account (demo)." })}>
                        Switch account
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Box className="grid gap-3 md:grid-cols-3">
                    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)} `, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Signed in as</Typography>
                      <Typography sx={{ fontWeight: 950 }}>{account}</Typography>
                    </Box>
                    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)} `, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Requested service</Typography>
                      <Typography sx={{ fontWeight: 950 }}>{requested}</Typography>
                    </Box>
                    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)} `, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Route</Typography>
                      <Typography sx={{ fontWeight: 950 }}>{routeInfo()}</Typography>
                    </Box>
                  </Box>

                  <Alert severity="info" icon={<HelpCircleIcon size={18} />}>
                    If you believe this is a mistake, request access from your organization admin or contact EVzone support.
                  </Alert>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Button variant="contained" sx={orangeContained} onClick={() => navigate("/auth/sign-in")}>
                      Sign in
                    </Button>
                    <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app")}>
                      Go back home
                    </Button>
                  </Stack>

                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    © {new Date().getFullYear()} EVzone Group
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Mobile sticky */}
            <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
              <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)} `, backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ py: 1.1, px: 1.2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /auth/sign-in (demo)." })}>
                      Sign in
                    </Button>
                    <Button fullWidth variant="contained" sx={orangeContained} onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /auth/choose-account (demo)." })}>
                      Accounts
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)} `, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
