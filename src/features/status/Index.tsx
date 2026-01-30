import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { alpha, useTheme } from "@mui/material/styles";

/**
 * EVzone - Service Status Page
 * Route: /status
 *
 * Shows: Auth, Wallet, Notifications, Integrations (green/orange badges).
 */

import { Severity, Health, Service } from "@/types";
import {
  SunIcon,
  MoonIcon,
  GlobeIcon,
  PulseIcon,
  ShieldIcon,
  WalletIcon,
  BellIcon,
  PlugIcon,
  WrenchIcon
} from "@/components/icons";
import { EVZONE } from "@/theme/evzone";
import { useThemeStore } from "@/stores/themeStore";
import { api } from "@/utils/api";

function healthChip(health: Health) {
  if (health === "Operational") return { label: "Operational", color: "success" as const, tone: EVZONE.green };
  if (health === "Maintenance") return { label: "Maintenance", color: "warning" as const, tone: EVZONE.orange };
  return { label: "Degraded", color: "warning" as const, tone: EVZONE.orange };
}

export default function SystemStatusPage() {
  const { t } = useTranslation("common"); {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeStore();
  const isDark = theme.palette.mode === "dark";

  const [services, setServices] = useState<Service[]>([]);
  const [overallStatus, setOverallStatus] = useState<Health>("Operational");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api<{ services: Service[]; status: Health }>('/health');
        setServices(res.services || []);
        setOverallStatus(res.status || "Operational");
      } catch (err) {
        console.error(err);
        setSnack({ open: true, severity: "error", msg: "Failed to load system status." });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setSnack({ open: true, severity: "success", msg: "Status refreshed." });
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

  const banner = overallStatus !== "Operational" ? (
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
    <Box sx={{ minHeight: "100vh", background: pageBg }}>
      {/* Header */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
        <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
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
                      © {new Date().getFullYear()} EVzone Group
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
    </Box >
  );
}
