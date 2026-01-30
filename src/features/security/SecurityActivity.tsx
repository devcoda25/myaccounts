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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { api } from "@/utils/api";
import { ISecurityActivityLog } from "@/types";

/**
 * EVzone My Accounts - Login Activity
 * Route: /app/security/activity
 *
 * Features:
 * • Timeline of login attempts (success/failure)
 * • Filters (date, device)
 * • Report suspicious activity CTA
 */

type Severity = "info" | "warning" | "error" | "success";

type LoginStatus = "success" | "failure" | "blocked";

type LoginMethod = "Password" | "OTP" | "Google" | "Apple" | "WhatsApp";

type RiskTag = "new_location" | "new_device" | "impossible_travel" | "suspicious";

type LoginEvent = {
  id: string;
  when: number;
  device: string;
  method: LoginMethod;
  location: string;
  ip: string;
  status: LoginStatus;
  risk: RiskTag[];
};

// Redundant EVZONE removed

const WHATSAPP = {
  green: "#25D366",
} as const;

// -----------------------------
// Inline icons (CDN-safe)
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
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

function FilterIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 5h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function FlagIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M6 22V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 4h11l-2 4 2 4H6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

// -----------------------------
// Theme
// -----------------------------
// -----------------------------
// Helpers
// -----------------------------

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

function riskChip(r: RiskTag) {
  if (r === "suspicious") return { label: "Suspicious", color: "error" as const, icon: <AlertTriangleIcon size={16} /> };
  if (r === "impossible_travel") return { label: "Impossible travel", color: "warning" as const, icon: <ClockIcon size={16} /> };
  if (r === "new_location") return { label: "New location", color: "warning" as const, icon: <MapPinIcon size={16} /> };
  return { label: "New device", color: "info" as const, icon: <ShieldCheckIcon size={16} /> };
}

function statusChipProps(s: LoginStatus) {
  if (s === "success") return { label: "Success", color: "success" as const };
  if (s === "blocked") return { label: "Blocked", color: "error" as const };
  return { label: "Failed", color: "warning" as const };
}

// --- lightweight self-tests ---
export default function LoginActivityPage() {
  const { t } = useTranslation("common");
  {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const isDark = mode === "dark";

    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });


    const [events, setEvents] = useState<LoginEvent[]>([]);

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

    const waOutlinedSx = {
      borderColor: alpha(WHATSAPP.green, 0.75),
      color: WHATSAPP.green,
      backgroundColor: alpha(theme.palette.background.paper, 0.20),
      "&:hover": { borderColor: WHATSAPP.green, backgroundColor: WHATSAPP.green, color: "#FFFFFF" },
    } as const;

    // Filters
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");
    const [device, setDevice] = useState<string>("all");
    const [status, setStatus] = useState<string>("all");
    const [search, setSearch] = useState<string>("");


    // Fetch from API
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      api<ISecurityActivityLog[]>("/security/activity")
        .then((logs) => {
          const mapped: LoginEvent[] = logs.map((l) => ({
            id: l.id,
            when: l.createdAt ? (typeof l.createdAt === 'string' ? new Date(l.createdAt).getTime() : l.createdAt) : Date.now(),
            device: l.details?.device || "Unknown Device",
            method: (l.action as LoginMethod) || "Password", // Fallback
            location: typeof l.details?.location === 'object' && l.details.location
              ? `${l.details.location.city || ''}, ${l.details.location.country || ''}`.replace(/^, |, $/g, '') || "Unknown Location"
              : l.details?.location || "Unknown Location",
            ip: l.ip || "Unknown IP",
            status: (l.risk && l.risk.length > 0) ? "failure" : "success", // Simplistic mapping, refine based on 'action' if needed
            risk: (l.risk as RiskTag[]) || [],
          }));
          setEvents(mapped);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, []);

    const deviceOptions = useMemo(() => {
      const set = new Set(events.map((e) => e.device));
      return ["all", ...Array.from(set)];
    }, [events]);

    const filtered = useMemo(() => {
      const q = search.trim().toLowerCase();

      const fromTs = from ? new Date(from + "T00:00:00").getTime() : -Infinity;
      const toTs = to ? new Date(to + "T23:59:59").getTime() : Infinity;

      return events
        .filter((e) => e.when >= fromTs && e.when <= toTs)
        .filter((e) => (device === "all" ? true : e.device === device))
        .filter((e) => (status === "all" ? true : e.status === status))
        .filter((e) =>
          !q
            ? true
            : [e.device, e.location, e.ip, e.method, e.status].some((x) => String(x).toLowerCase().includes(q))
        )
        .sort((a, b) => b.when - a.when);
    }, [events, from, to, device, status, search]);

    const stats = useMemo(() => {
      const now = Date.now();
      const last24 = events.filter((x) => now - x.when < 86400000);
      return {
        recentCount: last24.length,
        failures: last24.filter((x) => x.status === "failure" || x.status === "blocked").length,
        suspicious: last24.filter((x) => x.risk.length > 0).length,
      };
    }, [events]);

    // Report dialog
    const [reportOpen, setReportOpen] = useState(false);
    const [reportEventId, setReportEventId] = useState<string>(events[0]?.id || "");
    const [reportMessage, setReportMessage] = useState<string>("");

    useEffect(() => {
      if (!reportEventId && events.length) setReportEventId(events[0].id);
    }, [events, reportEventId]);

    const openReport = (id?: string) => {
      if (id) setReportEventId(id);
      setReportMessage("");
      setReportOpen(true);
    };

    const submitReport = () => {
      setReportOpen(false);
      setSnack({ open: true, severity: "success", msg: "Report submitted (demo). Support will review this login activity." });
    };

    const timelineDotColor = (s: LoginStatus) => {
      if (s === "success") return alpha(EVZONE.green, 0.92);
      if (s === "blocked") return alpha("#ff3b30", 0.92);
      return alpha(EVZONE.orange, 0.92);
    };

    const methodChip = (m: LoginMethod) => {
      if (m === "WhatsApp") {
        return (
          <Chip
            size="small"
            icon={<WhatsAppIcon size={16} />}
            label="WhatsApp"
            sx={{
              border: `1px solid ${alpha(WHATSAPP.green, 0.6)}`,
              color: WHATSAPP.green,
              backgroundColor: alpha(WHATSAPP.green, 0.10),
              "& .MuiChip-icon": { color: "inherit" },
            }}
          />
        );
      }
      return <Chip size="small" variant="outlined" label={m} />;
    };

    return (
      <Box className="min-h-screen" sx={{ background: pageBg }}>

        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5">Login activity</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Review login attempts. Report anything suspicious.
                      </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<FlagIcon size={18} />} onClick={() => openReport()}>
                        Report suspicious activity
                      </Button>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<ShieldCheckIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /app/security/sessions (demo)." })}>
                        Review devices
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box className="grid gap-3 md:grid-cols-3">
                    <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Last 24 hours</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 950 }}>{stats.recentCount}</Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Total attempts</Typography>
                    </Box>
                    <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Failures/blocked</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 950 }}>{stats.failures}</Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Needs review</Typography>
                    </Box>
                    <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Suspicious</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 950 }}>{stats.suspicious}</Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Flagged by risk engine</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
                      <TextField
                        type="date"
                        label="From"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        InputProps={{ startAdornment: (<InputAdornment position="start"><FilterIcon size={18} /></InputAdornment>) }}
                      />
                      <TextField
                        type="date"
                        label="To"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        InputProps={{ startAdornment: (<InputAdornment position="start"><FilterIcon size={18} /></InputAdornment>) }}
                      />
                      <TextField
                        select
                        label="Device"
                        value={device}
                        onChange={(e) => setDevice(e.target.value)}
                        fullWidth
                        InputProps={{ startAdornment: (<InputAdornment position="start"><FilterIcon size={18} /></InputAdornment>) }}
                      >
                        {deviceOptions.map((d) => (
                          <MenuItem key={d} value={d}>
                            {d === "all" ? "All devices" : d}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        fullWidth
                        InputProps={{ startAdornment: (<InputAdornment position="start"><FilterIcon size={18} /></InputAdornment>) }}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="success">Success</MenuItem>
                        <MenuItem value="failure">Failure</MenuItem>
                        <MenuItem value="blocked">Blocked</MenuItem>
                      </TextField>
                    </Stack>

                    <TextField
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      label="Search"
                      placeholder="Search by device, location, IP, method"
                      fullWidth
                      InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>) }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">Timeline</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {filtered.length} result(s)
                        </Typography>
                      </Box>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<ShieldCheckIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Export report (demo)." })}>
                        Export
                      </Button>
                    </Stack>

                    <Divider />

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                      {filtered.map((e, idx) => {
                        const st = statusChipProps(e.status);
                        const risky = e.risk.length > 0;
                        return (
                          <Box
                            key={e.id}
                            sx={{
                              borderRadius: "4px",
                              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                              backgroundColor: alpha(theme.palette.background.paper, 0.45),
                              p: 1.4,
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            {/* left timeline bar */}
                            <Box
                              sx={{
                                position: "absolute",
                                left: 18,
                                top: 0,
                                bottom: 0,
                                width: 2,
                                backgroundColor: alpha(theme.palette.text.primary, 0.10),
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                left: 10,
                                top: 22,
                                width: 18,
                                height: 18,
                                borderRadius: 999,
                                backgroundColor: timelineDotColor(e.status),
                                border: `2px solid ${alpha(theme.palette.background.paper, 0.95)}`,
                              }}
                            />

                            <Stack spacing={1.0} sx={{ pl: 4 }}>
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                  <Chip size="small" label={st.label} color={st.color} />
                                  {methodChip(e.method)}
                                  <Chip size="small" variant="outlined" icon={<ClockIcon size={16} />} label={timeAgo(e.when)} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                  <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<FlagIcon size={18} />} onClick={() => openReport(e.id)}>
                                    Report
                                  </Button>
                                </Stack>
                              </Stack>

                              <Typography sx={{ fontWeight: 950 }}>{e.device}</Typography>
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} flexWrap="wrap" useFlexGap>
                                <Chip size="small" variant="outlined" icon={<MapPinIcon size={16} />} label={e.location} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                                <Chip size="small" variant="outlined" label={`IP: ${maskIp(e.ip)}`} />
                              </Stack>

                              {risky ? (
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  {e.risk.map((r) => {
                                    const c = riskChip(r);
                                    const sx =
                                      r === "suspicious"
                                        ? undefined
                                        : r === "new_location"
                                          ? undefined
                                          : r === "impossible_travel"
                                            ? undefined
                                            : undefined;
                                    return (
                                      <Chip
                                        key={r}
                                        size="small"
                                        icon={c.icon}
                                        label={c.label}
                                        color={c.color}
                                        sx={{
                                          ...(sx || {}),
                                          "& .MuiChip-icon": { color: "inherit" },
                                        }}
                                      />
                                    );
                                  })}
                                </Stack>
                              ) : (
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  No risk signals.
                                </Typography>
                              )}

                              {e.risk.includes("suspicious") ? (
                                <Alert severity="error" icon={<AlertTriangleIcon size={18} />}>
                                  This attempt looks suspicious. Consider changing your password and reviewing devices.
                                </Alert>
                              ) : null}
                            </Stack>
                          </Box>
                        );
                      })}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
              </Box>
            </Stack>
          </motion.div>
        </Box>

        {/* Report dialog */}
        <Dialog open={reportOpen} onClose={() => setReportOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Report suspicious activity</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Tell us what looks suspicious. Our team will review and may contact you.
              </Typography>

              <TextField
                select
                label="Login attempt"
                value={reportEventId}
                onChange={(e) => setReportEventId(e.target.value)}
                fullWidth
              >
                {events
                  .slice()
                  .sort((a, b) => b.when - a.when)
                  .map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {new Date(e.when).toLocaleString()} • {e.device} • {e.location}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                label="What happened?"
                placeholder="Example: I did not attempt this login."
                multiline
                minRows={3}
                fullWidth
              />

              <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                We recommend: 1) sign out unknown devices, 2) change password, 3) enable 2FA.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setReportOpen(false)}>{t("auth.common.cancel")}</Button>
            <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={submitReport}>
              Submit report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant={mode === "dark" ? "filled" : "standard"}
            sx={{
              borderRadius: 16,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
              backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96),
              color: theme.palette.text.primary,
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    );
  }
}
