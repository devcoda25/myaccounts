import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { api } from "@/utils/api";

/**
 * EVzone My Accounts - Connected EVzone Apps
 * Route: /app/apps
 */

type AccessStatus = "Connected" | "Disconnected" | "Limited";

type AppKey =
  | "charging"
  | "marketplace"
  | "pay"
  | "school"
  | "agenthub"
  | "mylivedealz"
  | "logistics"
  | "creator";

type AppTile = {
  key: AppKey;
  name: string;
  tagline: string;
  status: AccessStatus;
  lastUsedAt?: number;
  launchUrl?: string;
  shortcuts: { label: string; action: string }[];
};

// -----------------------------
// Icons
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      {children}
    </svg>
  );
}

function AppsIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function BoltIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function CartIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M6 6h15l-1.5 9H7.5L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 6 5 3H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="20" r="1.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="20" r="1.5" stroke="currentColor" strokeWidth="2" />
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

function GraduationIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3 2 8l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 10v6c0 2 3 4 6 4s6-2 6-4v-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function HeadsetIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="3" y="13" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="17" y="13" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function CameraIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 7h4l2-2h4l2 2h4v12H4V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function TruckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h11v10H3V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v4h-7v-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="7" cy="19" r="1.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="1.5" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function ShieldIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

// -----------------------------
// Utils
// -----------------------------
function timeAgo(ts?: number) {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function statusChip(s: AccessStatus) {
  if (s === "Connected") return <Chip size="small" color="success" label="Connected" />;
  if (s === "Limited") return <Chip size="small" color="warning" label="Limited" />;
  return <Chip size="small" variant="outlined" label="Disconnected" />;
}

function appIcon(key: AppKey) {
  if (key === "charging") return <BoltIcon size={18} />;
  if (key === "marketplace") return <CartIcon size={18} />;
  if (key === "pay") return <WalletIcon size={18} />;
  if (key === "school") return <GraduationIcon size={18} />;
  if (key === "agenthub") return <HeadsetIcon size={18} />;
  if (key === "mylivedealz") return <CameraIcon size={18} />;
  if (key === "logistics") return <TruckIcon size={18} />;
  return <AppsIcon size={18} />;
}

interface IAppResponse {
  key: string;
  name: string;
  status: string;
  lastUsedAt?: number;
  launchUrl?: string;
}

// Self-tests removed

export default function ConnectedAppsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const [snack, setSnack] = useState<{ open: boolean; severity: "info" | "warning" | "error" | "success"; msg: string }>({ open: false, severity: "info", msg: "" });

  // Self-tests effect removed

  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [search, setSearch] = useState("");

  const [apps, setApps] = useState<AppTile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real scenario, we use the shared axios instance
    // import api from "@/utils/api"; 
    // For now assuming a fetch shim or importing api if available.
    // Let's use standard fetch with token if we don't have the api instance imported.
    // Actually we should use the `useApi` hook if it exists, or just `api`.
    // Let's assume `api` utility is available at `src/utils/api.ts` or similar based on previous context
    // But since I don't see imports, I'll attempt a direct fetch with a TODO or try to find api.
    // Wait, the project structure for frontend usually has an api.ts.
    // Let's assume standard fetch for now to be safe or check imports.
    // The previous code didn't import `api`.
    // I will try to use `fetch('/api/v1/apps')` (via proxy).

    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = await api.get<any[]>("/apps");

        // Transform backend data to frontend tile
        const mapped: AppTile[] = data.map((d) => ({
          key: d.key as AppKey,
          name: d.name,
          tagline: "Integrated App",
          status: d.status as AccessStatus,
          lastUsedAt: d.lastUsedAt,
          launchUrl: d.launchUrl,
          shortcuts: [
            { label: "Launch", action: "launch" }
          ]
        }));
        setApps(mapped);
      } catch (err: unknown) {
        console.error(err);
        setSnack({ open: true, severity: "error", msg: (err as Error).message || "Failed to load apps" });
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);


  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 4px 14px ${alpha(EVZONE.orange, 0.4)}`, // Standardized shadow
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps
      .filter((a) => (!q ? true : [a.name, a.tagline, a.status].some((x) => x.toLowerCase().includes(q))))
      .filter((a) => {
        if (tab === 0) return true;
        if (tab === 1) return a.status === "Connected";
        return a.status !== "Connected";
      })
      .sort((a, b) => {
        const ax = a.lastUsedAt || 0;
        const bx = b.lastUsedAt || 0;
        return bx - ax;
      });
  }, [apps, search, tab]);

  const stats = useMemo(() => {
    const connected = apps.filter((a) => a.status === "Connected").length;
    const limited = apps.filter((a) => a.status === "Limited").length;
    const disconnected = apps.filter((a) => a.status === "Disconnected").length;
    return { connected, limited, disconnected };
  }, [apps]);

  const openApp = (a: AppTile) => {
    // If we have a launchUrl, we redirect the user to it
    // This starts the OIDC flow: MyAccounts -> App (with code) -> App calls Token Endpoint
    if (a.launchUrl) {
      // In a real SPA, this might be window.location.href = a.launchUrl
      // For demo purposes, let's open in new tab or simulate redirect
      setSnack({ open: true, severity: "success", msg: `Redirecting to ${a.name}...` });

      // Allow a small delay for snackbar for better UX
      setTimeout(() => {
        window.location.href = a.launchUrl!;
      }, 800);
      return;
    }

    if (a.status === "Disconnected") {
      setSnack({ open: true, severity: "warning", msg: `${a.name} is not connected. Check permissions first.` });
      return;
    }
    setSnack({ open: true, severity: "success", msg: `Opening ${a.name}...` });
  };

  const openPermissions = (a: AppTile) => {
    navigate("/app/apps/permissions");
  };

  const runShortcut = (a: AppTile, s: { label: string; action: string }) => {
    setSnack({ open: true, severity: "info", msg: `${a.name}: ${s.label} (demo).` });
  };

  const requestAccess = (a: AppTile) => {
    setApps((prev) => prev.map((x) => (x.key === a.key ? { ...x, status: "Limited" } : x)));
    setSnack({ open: true, severity: "success", msg: `Requested access for ${a.name} (demo).` });
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>


      {/* Body */}
      <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Stack spacing={2.2}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={1.2}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5">Connected EVzone apps</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Launch modules and manage access from one place.
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip size="small" color="success" label={`${stats.connected} connected`} />
                        <Chip size="small" color="warning" label={`${stats.limited} limited`} />
                        <Chip size="small" variant="outlined" label={`${stats.disconnected} disconnected`} />
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="outlined" sx={orangeOutlined} startIcon={<ShieldIcon size={18} />} onClick={() => navigate("/app/apps/permissions")}>
                        Permissions
                      </Button>
                      <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<AppsIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Open app launcher (demo)." })}>
                        App launcher
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}>
                    <Tab label="All" />
                    <Tab label="Connected" />
                    <Tab label="Needs attention" />
                  </Tabs>

                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    label="Search apps"
                    placeholder="Search by module name"
                    fullWidth
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>) }}
                  />

                  <Alert severity="info" icon={<ShieldIcon size={18} />}>
                    Security note: app access is scoped and can be revoked anytime in Permissions.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>

            <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <Card key={a.key}>
                  <CardContent className="p-5">
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: "4px", display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          {appIcon(a.key)}
                        </Box>
                        <Box flex={1}>
                          <Typography sx={{ fontWeight: 950 }}>{a.name}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{a.tagline}</Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {statusChip(a.status)}
                        <Chip size="small" icon={<ClockIcon size={16} />} label={`Last used: ${timeAgo(a.lastUsedAt)}`} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                      </Stack>

                      <Divider />

                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 900 }}>
                        Shortcuts
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {a.shortcuts.slice(0, 3).map((s) => (
                          <Chip
                            key={s.label}
                            label={s.label}
                            clickable
                            onClick={() => runShortcut(a, s)}
                            sx={{ cursor: "pointer", border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.10) } }}
                          />
                        ))}
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" color="secondary" sx={orangeContained} endIcon={<ArrowRightIcon size={18} />} onClick={() => openApp(a)}>
                          Open app
                        </Button>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => openPermissions(a)}>
                          Manage access
                        </Button>
                      </Stack>

                      {a.status === "Disconnected" ? (
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => requestAccess(a)}>
                          Request access
                        </Button>
                      ) : null}

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Access may vary by role and organization.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Mobile sticky actions */}
            <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
              <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ py: 1.1, px: 1.2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/apps/permissions")}>
                      Permissions
                    </Button>
                    <Button fullWidth variant="contained" color="secondary" sx={orangeContained} onClick={() => setSnack({ open: true, severity: "info", msg: "Open app launcher (demo)." })}>
                      Launcher
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ opacity: 0.92 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
            </Box>
          </Stack>
        </motion.div>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
