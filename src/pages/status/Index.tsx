import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";

/**
 * EVzone - Service Status Page
 * Route: /status
 *
 * Shows: Auth, Wallet, Notifications, Integrations (green/orange badges).
 */

type ThemeMode = "light" | "dark";
type Severity = "info" | "warning" | "error" | "success";

type Health = "Operational" | "Degraded" | "Maintenance";

type Service = {
  key: "auth" | "wallet" | "notifications" | "integrations";
  name: string;
  desc: string;
  health: Health;
  lastUpdatedAt: number;
};

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
function PulseIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 12h4l2-5 4 10 2-5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
function ShieldIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}
function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}
function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}
function PlugIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M9 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 7h10v4a5 5 0 0 1-10 0V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 16v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function healthChip(health: Health) {
  if (health === "Operational") return { label: "Operational", color: "success" as const, tone: EVZONE.green };
  if (health === "Maintenance") return { label: "Maintenance", color: "warning" as const, tone: EVZONE.orange };
  return { label: "Degraded", color: "warning" as const, tone: EVZONE.orange };
}

export default function ServiceStatusPage() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";
  const navigate = useNavigate();
  const location = useLocation();

  // Demo toggles
  const [demoDegraded, setDemoDegraded] = useState(false);
  const [demoMaintenance, setDemoMaintenance] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const services: Service[] = useMemo(() => {
    const now = Date.now();
    const auth: Health = demoMaintenance ? "Maintenance" : demoDegraded ? "Degraded" : "Operational";
    return [
      { key: "auth", name: "Auth", desc: "Login, sessions, consent", health: auth, lastUpdatedAt: now - 1000 * 60 * 2 },
      { key: "wallet", name: "Wallet", desc: "Balances, transactions, payouts", health: demoDegraded ? "Degraded" : "Operational", lastUpdatedAt: now - 1000 * 60 * 3 },
      { key: "notifications", name: "Notifications", desc: "Email and SMS alerts", health: demoMaintenance ? "Maintenance" : "Operational", lastUpdatedAt: now - 1000 * 60 * 5 },
      { key: "integrations", name: "Integrations", desc: "Payments and external services", health: demoDegraded ? "Degraded" : "Operational", lastUpdatedAt: now - 1000 * 60 * 4 },
    ];
  }, [demoDegraded, demoMaintenance, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setSnack({ open: true, severity: "success", msg: "Status refreshed." });
  };

  useEffect(() => {
    // no-op
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

  const anyIssues = services.some((s) => s.health !== "Operational");

  const banner = anyIssues ? (
    <Alert severity="warning" icon={<PulseIcon size={18} />}>
      Some services are experiencing issues. Check details below.
    </Alert>
  ) : (
    <Alert severity="success" icon={<PulseIcon size={18} />}>
      All systems operational.
    </Alert>
  );

  const iconFor = (key: Service["key"]) => {
    if (key === "auth") return <ShieldIcon size={18} />;
    if (key === "wallet") return <WalletIcon size={18} />;
    if (key === "notifications") return <BellIcon size={18} />;
    return <PlugIcon size={18} />;
  };

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
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>EVzone Status</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Service health</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Demo: Degraded">
                  <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mr: 1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Degraded</Typography>
                    <Switch size="small" checked={demoDegraded} onChange={(e) => setDemoDegraded(e.target.checked)} />
                  </Stack>
                </Tooltip>
                <Tooltip title="Demo: Maintenance">
                  <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mr: 1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Maintenance</Typography>
                    <Switch size="small" checked={demoMaintenance} onChange={(e) => setDemoMaintenance(e.target.checked)} />
                  </Stack>
                </Tooltip>

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
                <Stack spacing={1.2}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5">Service status</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Live health for EVzone My Accounts and connected modules.
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip size="small" variant="outlined" label={`Last updated: ${new Date().toLocaleTimeString()}`} />
                        <Chip size="small" variant="outlined" label="Region: Global" />
                        <Chip size="small" variant="outlined" label="Environment: Production" />
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/status/maintenance")} startIcon={<WrenchIcon size={18} />}>
                        Maintenance
                      </Button>
                      <Button variant="contained" sx={orangeContained} onClick={handleRefresh}>
                        Refresh
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  {banner}
                </Stack>
              </CardContent>
            </Card>

            <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
              <Box className="md:col-span-12">
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.2}>
                      <Typography variant="h6">Components</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Green = operational. Orange = degraded or maintenance.
                      </Typography>
                      <Divider />

                      <Box className="grid gap-3 md:grid-cols-2">
                        {services.map((s) => {
                          const chip = healthChip(s.health);
                          return (
                            <Box key={s.key} sx={{ borderRadius: 20, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.3 }}>
                              <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={1.2} alignItems="center">
                                  <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(chip.tone, 0.14), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                                    {iconFor(s.key)}
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontWeight: 950 }}>{s.name}</Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{s.desc}</Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Updated: {new Date(s.lastUpdatedAt).toLocaleTimeString()}</Typography>
                                  </Box>
                                </Stack>

                                <Chip
                                  size="small"
                                  label={chip.label}
                                  sx={{
                                    fontWeight: 900,
                                    border: `1px solid ${alpha(chip.tone, 0.35)}`,
                                    color: chip.tone,
                                    backgroundColor: alpha(chip.tone, 0.10),
                                  }}
                                />
                              </Stack>
                            </Box>
                          );
                        })}
                      </Box>

                      <Divider />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Subscribe to status updates (later)." })}>
                          Subscribe (later)
                        </Button>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/support")}>
                          Contact support
                        </Button>
                        <Button variant="contained" sx={orangeContained} onClick={() => navigate("/app")}>
                          My Accounts
                        </Button>
                      </Stack>

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        © {new Date().getFullYear()} EVzone Group.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Mobile sticky */}
            <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
              <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ py: 1.1, px: 1.2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => navigate("/status/maintenance")}>
                      Maint.
                    </Button>
                    <Button fullWidth variant="contained" sx={orangeContained} onClick={handleRefresh}>
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
