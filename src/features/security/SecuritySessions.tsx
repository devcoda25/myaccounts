import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import {
  ISession,
  IRiskTag
} from "@/types";
import { api } from "@/utils/api";
import { useNotification } from "@/context/NotificationContext";

/**
 * EVzone My Accounts - Active Devices & Sessions
 * Route: /app/security/sessions
 */

// -----------------------------
// Inline icons
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}
function DevicesIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="2" y="6" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M6 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 8h4v10h-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}
function MapPinIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
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
function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
function LogOutIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M10 17l-1 1a4 4 0 0 1-6 0V6a4 4 0 0 1 6 0l1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 9l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
function AlertTriangleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

// -----------------------------
// Helpers
// -----------------------------
function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function maskIp(ip: string) {
  const parts = ip.split(".");
  if (parts.length !== 4) return ip;
  return `${parts[0]}.${parts[1]}.x.x`;
}

function riskChipProps(r: IRiskTag) {
  if (r === "suspicious") return { label: "Suspicious", color: "error" as const, icon: <AlertTriangleIcon size={16} /> };
  if (r === "new_location") return { label: "New location", color: "warning" as const, icon: <MapPinIcon size={16} /> };
  return { label: "Old device", color: "info" as const, icon: <ClockIcon size={16} /> };
}

export default function ActiveSessionsPage() {
  const { t } = useTranslation("common");
  {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const isDark = mode === "dark";

    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [sessions, setSessions] = useState<ISession[]>([]);

    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await api<{ data: ISession[]; total: number }>("/auth/sessions");
        const data = response.data || [];
        const mapped: ISession[] = (Array.isArray(data) ? data : []).map((s) => ({
          id: s.id,
          isCurrent: s.isCurrent,
          deviceLabel: s.deviceInfo?.device || "Unknown Device",
          os: s.deviceInfo?.os || "Unknown OS",
          browser: s.deviceInfo?.browser || "Unknown Browser",
          location: typeof s.deviceInfo?.location === 'object' && s.deviceInfo.location
            ? `${s.deviceInfo.location.city || ''}, ${s.deviceInfo.location.country || ''}`.replace(/^, |, $/g, '') || "Unknown Location"
            : s.deviceInfo?.location || "Unknown Location",
          ip: s.deviceInfo?.ip || "Unknown IP",
          lastActiveAt: s.lastUsedAt ? new Date(s.lastUsedAt).getTime() : Date.now(),
          lastUsedAt: s.lastUsedAt,
          createdAt: Date.now(),
          trust: "trusted",
          risk: s.risk || [],
        }));
        setSessions(mapped);
      } catch (err) {
        console.error(err);
        showNotification({
          type: "error",
          title: "Load Failed",
          message: "Failed to load active sessions. Please try again later."
        });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchSessions();
    }, []);

    const pageBg =
      mode === "dark"
        ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
        : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const evOrangeContainedSx = {
      backgroundColor: EVZONE.orange,
      color: "#FFFFFF",
      boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
      "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
      "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
    } as const;

    const evOrangeOutlinedSx = {
      borderColor: alpha(EVZONE.orange, 0.65),
      color: EVZONE.orange,
      backgroundColor: alpha(theme.palette.background.paper, 0.20),
      "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    } as const;

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      return sessions
        .filter((s) =>
          !q
            ? true
            : [s.deviceLabel, s.os, s.browser, s.location, s.ip].some((x) => x.toLowerCase().includes(q))
        )
        .sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0));
    }, [sessions, query]);

    const riskyCount = useMemo(() => sessions.filter((s) => s.risk.length > 0).length, [sessions]);
    const current = useMemo(() => sessions.find((s) => s.isCurrent), [sessions]);

    const applySignOut = async (mode: "one" | "others" | "all", id?: string) => {
      try {
        if (mode === "one" && id) {
          await api(`/auth/sessions/${id}`, { method: "DELETE" });
          setSessions((prev) => prev.filter((x) => x.id !== id));
          showNotification({ type: "success", title: "Device Removed", message: "The device has been successfully signed out." });
        } else if (mode === "others") {
          const response = await api<{ revokedCount: number }>("/auth/sessions", { method: "DELETE" });
          setSessions((prev) => prev.filter((x) => x.isCurrent));
          showNotification({ type: "success", title: "Sessions Ended", message: `All other devices have been signed out (${response.revokedCount || 0} sessions).` });
        } else if (mode === "all") {
          const response = await api<{ revokedCount: number }>("/auth/sessions", { method: "DELETE" });
          setSessions([]);
          showNotification({ type: "success", title: "Signed Out", message: `All active sessions have been revoked (${response.revokedCount || 0} sessions).` });
        }
      } catch (e) {
        showNotification({ type: "error", title: "Action Failed", message: "Failed to sign out device. Please try again." });
      }
    };

    const openConfirmOne = (id: string) => {
      showNotification({
        type: "warning",
        title: "Sign Out Device",
        message: "This will end the session for the selected device. You will need to sign in again on that device.",
        actionText: "Sign Out",
        onAction: () => applySignOut("one", id)
      });
    };

    const openConfirmOthers = () => {
      showNotification({
        type: "warning",
        title: "Sign Out Others",
        message: "This will end sessions on all devices except this one. This is recommended if you suspect unauthorized access.",
        actionText: "Sign Out Others",
        onAction: () => applySignOut("others")
      });
    };

    const openConfirmAll = () => {
      showNotification({
        type: "error",
        title: "Sign Out All",
        message: "This will end ALL sessions including this one. You will be signed out immediately.",
        actionText: "Sign Out All",
        onAction: () => applySignOut("all")
      });
    };

    return (
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        <CssBaseline />

        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5">Active devices & sessions</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Review where your account is signed in. Sign out any device you don’t recognize.
                      </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<LogOutIcon size={18} />} onClick={openConfirmOthers}>
                        Sign out other devices
                      </Button>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<LogOutIcon size={18} />} onClick={openConfirmAll}>
                        Sign out all
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box className="grid gap-3 md:grid-cols-3">
                    <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Active sessions</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 950 }}>{sessions.length}</Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Includes web and mobile sessions.</Typography>
                    </Box>
                    <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Risky sessions</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 950 }}>{riskyCount}</Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>New locations or suspicious events.</Typography>
                    </Box>
                    <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Current device</Typography>
                      <Typography sx={{ fontWeight: 950 }}>{current?.deviceLabel || "-"}</Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{current ? `${current.browser} • ${current.location}` : ""}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <TextField
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    label="Search devices"
                    placeholder="Search by device, browser, location, IP"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon size={18} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: "block" }}>
                    Tip: If you see an unknown device, sign it out and change your password.
                  </Typography>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-2">
                {filtered.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="p-5">
                      <Stack spacing={1.2}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: "4px",
                              display: "grid",
                              placeItems: "center",
                              backgroundColor: alpha(EVZONE.green, isDark ? 0.18 : 0.12),
                              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                            }}
                          >
                            <DevicesIcon size={18} />
                          </Box>
                          <Box flex={1}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography sx={{ fontWeight: 950 }}>{s.deviceLabel}</Typography>
                              {s.isCurrent ? <Chip size="small" color="success" label="This device" /> : null}
                              {s.trust === "trusted" ? (
                                <Chip size="small" variant="outlined" label="Trusted" />
                              ) : (
                                <Chip size="small" color="warning" label="Untrusted" />
                              )}
                            </Stack>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              {s.os} • {s.browser}
                            </Typography>
                          </Box>
                          <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<LogOutIcon size={18} />} onClick={() => openConfirmOne(s.id)}>
                            Sign out
                          </Button>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {s.risk.length ? (
                            s.risk.map((r) => {
                              const p = riskChipProps(r);
                              return (
                                <Chip
                                  key={r}
                                  size="small"
                                  icon={p.icon}
                                  label={p.label}
                                  color={p.color}
                                  sx={{
                                    "& .MuiChip-icon": { color: "inherit" },
                                  }}
                                />
                              );
                            })
                          ) : (
                            <Chip size="small" color="success" label="No risk detected" />
                          )}
                        </Stack>

                        <Divider />

                        <Stack spacing={0.6}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ color: theme.palette.text.secondary }}>
                              <MapPinIcon size={18} />
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              {s.location}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ color: theme.palette.text.secondary }}>
                              <ClockIcon size={18} />
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Last active {timeAgo(s.lastActiveAt || Date.now())}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ color: theme.palette.text.secondary }}>
                              <ShieldCheckIcon size={18} />
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              IP: {maskIp(s.ip)}
                            </Typography>
                          </Stack>
                        </Stack>

                        {s.risk.includes("suspicious") ? (
                          <Alert severity="error" icon={<AlertTriangleIcon size={18} />} sx={{ borderRadius: "4px" }}>
                            We recommend signing out this device and changing your password.
                          </Alert>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
              </Box>
            </Stack>
          </motion.div>
        </Box>
      </Box>
    );
  }
}
