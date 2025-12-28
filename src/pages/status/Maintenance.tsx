import React, { useEffect, useMemo, useState } from "react";
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
 * EVzone - 503 / Maintenance
 * Route: /status/maintenance
 * Optional: show expected return window.
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
function WrenchIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M21 7a6 6 0 0 1-8 5.7L6.6 19.1a2 2 0 1 1-2.8-2.8l6.4-6.4A6 6 0 0 1 17 3l-3 3 4 4 3-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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
      h4: { fontWeight: 950, letterSpacing: -0.9 },
      h6: { fontWeight: 900, letterSpacing: -0.28 },
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

function msToHhmm(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Maintenance503Page() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  // Demo: expected return window. In production, fetch from status backend.
  const [startAt] = useState(() => Date.now() - 1000 * 60 * 6);
  const [etaAt] = useState(() => Date.now() + 1000 * 60 * 18); // 18 min from now
  const [now, setNow] = useState(() => Date.now());

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const toggleMode = () => {
    const next: ThemeMode = isDark ? "light" : "dark";
    setMode(next);
    setStoredMode(next);
  };

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

  const duration = Math.max(1, etaAt - startAt);
  const elapsed = Math.max(0, Math.min(duration, now - startAt));
  const pct = Math.round((elapsed / duration) * 100);

  const remainingMs = Math.max(0, etaAt - now);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ minHeight: "100vh", background: pageBg }}>
        {/* Header */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${EVZONE.green} 0%, rgba(3,205,140,0.75) 100%)` }}>
                  <Typography sx={{ color: "#fff", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>Status</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Maintenance</Typography>
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
                        <WrenchIcon size={20} />
                      </Box>
                      <Box>
                        <Typography variant="h4">We’re under maintenance</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          EVzone services are temporarily unavailable while we perform upgrades.
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="contained" sx={orangeContained} onClick={() => setSnack({ open: true, severity: "info", msg: "Refresh (demo)." })}>
                        Refresh
                      </Button>
                      <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /status (demo)." })}>
                        View status
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Alert severity="warning" icon={<ClockIcon size={18} />}>
                    Expected return window: <b>{new Date(etaAt).toLocaleTimeString()}</b> (about <b>{msToHhmm(remainingMs)}</b>).
                  </Alert>

                  <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                    <Stack spacing={0.8}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontWeight: 950 }}>Maintenance progress</Typography>
                        <Chip size="small" variant="outlined" label={`${pct}%`} />
                      </Stack>
                      <LinearProgress variant="determinate" value={pct} />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        If you were signing in to an EVzone app, keep this tab open and retry after maintenance ends.
                      </Typography>
                    </Stack>
                  </Box>

                  <Box className="grid gap-3 md:grid-cols-3">
                    <InfoCard label="Started" value={new Date(startAt).toLocaleString()} />
                    <InfoCard label="Expected" value={new Date(etaAt).toLocaleString()} />
                    <InfoCard label="Scope" value="Auth, Wallet, Notifications" />
                  </Box>

                  <Alert severity="info">
                    We appreciate your patience. Security alerts and critical processing resume first.
                  </Alert>

                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    © {new Date().getFullYear()} EVzone Group.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Mobile sticky */}
            <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
              <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ py: 1.1, px: 1.2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /status (demo)." })}>
                      Status
                    </Button>
                    <Button fullWidth variant="contained" sx={orangeContained} onClick={() => setSnack({ open: true, severity: "info", msg: "Refresh (demo)." })}>
                      Refresh
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ borderRadius: 18, border: "1px solid rgba(0,0,0,0)", backgroundColor: "transparent" }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 950 }}>{value}</Typography>
    </Box>
  );
}