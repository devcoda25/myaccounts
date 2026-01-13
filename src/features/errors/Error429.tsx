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
  LinearProgress,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";

/**
 * EVzone - 429 / Too Many Requests
 * Route: /errors/429
 * Requirement: Include “Try again in {time}” messaging.
 */

type ThemeMode = "light" | "dark";
type Severity = "info" | "warning" | "error" | "success";

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;
const THEME_KEY = "evzone_myaccounts_theme";

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
function GaugeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 18a9 9 0 1 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12l4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

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
            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
            backgroundImage:
              "radial-gradient(900px 420px at 10% 0%, rgba(3,205,140,0.14), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(3,205,140,0.10), transparent 55%)",
          },
        },
      },
      MuiButton: { styleOverrides: { root: { borderRadius: 14, boxShadow: "none" } } },
    },
  });
}

function fmtSeconds(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function Error429Page() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const navigate = useNavigate();
  const isDark = mode === "dark";

  // In production, this can be set from Retry-After header.
  const [retryInSec, setRetryInSec] = useState<number>(60);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (retryInSec <= 0) return;
    const t = window.setInterval(() => setRetryInSec((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [retryInSec]);

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

  const tryAgain = () => {
    if (retryInSec > 0) return;
    setSnack({ open: true, severity: "success", msg: "Retrying request (demo)." });
    // In a real app: refresh last request or navigate back.
    setRetryInSec(0);
  };

  const pct = Math.min(100, Math.max(0, (1 - retryInSec / 60) * 100));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", background: pageBg }}>
        {/* Top bar */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${EVZONE.green} 0%, rgba(3,205,140,0.75) 100%)` }}>
                  <Typography sx={{ color: "#fff", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>System</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Too many requests</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    {isDark ? <SunIcon /> : <MoonIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
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
                      <Box sx={{ width: 54, height: 54, borderRadius: 18, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.orange, 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <GaugeIcon size={20} />
                      </Box>
                      <Box>
                        <Typography variant="h3">429</Typography>
                        <Typography variant="h5">Too many requests</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          You have sent too many requests in a short time.
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="outlined" sx={orangeOutlined} startIcon={<RefreshIcon />} onClick={() => setRetryInSec(60)}>
                        Restart timer
                      </Button>
                      <Button variant="contained" sx={orangeContained} onClick={tryAgain} disabled={retryInSec > 0}>
                        Try again
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Alert severity="warning" icon={<ClockIcon size={18} />}>
                    Try again in <b>{fmtSeconds(retryInSec)}</b>.
                  </Alert>

                  <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                    <Stack spacing={0.8}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontWeight: 950 }}>Cooldown</Typography>
                        <Chip size="small" variant="outlined" label={`${fmtSeconds(retryInSec)} remaining`} />
                      </Stack>
                      <LinearProgress variant="determinate" value={pct} />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Tip: Avoid refreshing repeatedly. If you are automating, back off with exponential retry.
                      </Typography>
                    </Stack>
                  </Box>

                  <Box className="grid gap-3 md:grid-cols-3">
                    <QuickTip title="If you are signing in" body="Wait for the timer to finish, then retry sign-in." />
                    <QuickTip title="If you are calling APIs" body="Respect rate limits. Use idempotency keys for retries." />
                    <QuickTip title="If this persists" body="Check service status or contact support." />
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Button variant="contained" sx={orangeContained} onClick={() => navigate("/app")}>
                      Go to My Accounts
                    </Button>
                    <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/status")}>
                      Service status
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
              <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ py: 1.1, px: 1.2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /app (demo)." })}>
                      Home
                    </Button>
                    <Button fullWidth variant="contained" sx={orangeContained} onClick={tryAgain} disabled={retryInSec > 0}>
                      Retry
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

function QuickTip({ title, body }: { title: string; body: string }) {
  return (
    <Box sx={{ borderRadius: 18, border: "1px solid rgba(0,0,0,0)", backgroundColor: "transparent" }}>
      <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>{body}</Typography>
    </Box>
  );
}
