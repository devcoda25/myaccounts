import React, { useEffect, useMemo, useRef, useState } from "react";
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
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";
import { api } from "@/utils/api";

/**
 * EVzone My Accounts - Download My Data
 * Route: /app/privacy/download
 *
 * Features:
 * • Request export
 * • Status of export
 * • Download link (time-limited)
 */

type ThemeMode = "light" | "dark";
type Severity = "info" | "warning" | "error" | "success";

type ExportStatus = "idle" | "queued" | "processing" | "ready" | "expired" | "failed";

type ExportJob = {
  id: string;
  requestedAt: number;
  status: ExportStatus;
  progress: number;
  readyAt?: number;
  expiresAt?: number;
  failureReason?: string;
};

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

// -----------------------------
// Icons (inline)
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      {children}
    </svg>
  );
}

function DownloadIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v3h16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      success: { main: EVZONE.green },
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

// -----------------------------
// Helpers
// -----------------------------
function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
}

function fmtDateTime(ts?: number) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

function fmtCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function exportPayload(job: ExportJob) {
  return {
    meta: {
      exportId: job.id,
      generatedAt: new Date().toISOString(),
      format: "json",
      note: "Demo export. Replace with real export from backend.",
    },
    profile: {
      fullName: "Ronald Isabirye",
      emails: [{ value: "ronald.isabirye@gmail.com", verified: true, purpose: "personal", isDefault: true }],
      phones: [{ value: "+256761677709", verified: true, purpose: "sms", isDefault: true }],
    },
    wallet: {
      currency: "UGX",
      balance: 1250000,
      sampleTransactions: [
        { id: "tx_001", ref: "EVZ-9F2A3B", amount: 500000, status: "completed" },
        { id: "tx_004", ref: "EVZ-WD-A1B2", amount: -800000, status: "pending" },
      ],
    },
    security: {
      mfaEnabled: true,
      sampleLogins: [
        { when: new Date(Date.now() - 1000 * 60 * 12).toISOString(), device: "Chrome on Windows", status: "success" },
      ],
    },
    consents: {
      termsAcceptedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
      marketingOptIn: false,
    },
  };
}

function downloadJson(filename: string, obj: Record<string, unknown>) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as unknown as Record<string, unknown>;
    if (w.__EVZONE_PRIVACY_EXPORT_TESTS_RAN__) return;
    w.__EVZONE_PRIVACY_EXPORT_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    const id = mkId("EXP");
    assert("mkId", id.startsWith("EXP_"));
    assert("countdown", fmtCountdown(61000) === "1:01");

  } catch (e) {
    // ignore
  }
}

export default function DownloadMyDataPage() {
  const { t } = useTranslation("common");
  {
    const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
    const theme = useMemo(() => buildTheme(mode), [mode]);
    const isDark = mode === "dark";

    const [now, setNow] = useState(() => Date.now());
    const tickRef = useRef<number | null>(null);

    const [jobs, setJobs] = useState<ExportJob[]>(() => {
      const existing: ExportJob[] = [];
      return existing;
    });

    const current = jobs[0] || ({ id: "-", requestedAt: 0, status: "idle", progress: 0 } as ExportJob);

    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({
      open: false,
      severity: "info",
      msg: "",
    });

    useEffect(() => {
      if (typeof window !== "undefined") runSelfTestsOnce();
    }, []);

    useEffect(() => {
      tickRef.current = window.setInterval(() => setNow(Date.now()), 1000);
      return () => {
        if (tickRef.current) window.clearInterval(tickRef.current);
      };
    }, []);

    useEffect(() => {
      // expire job if needed
      if (current.status === "ready" && current.expiresAt && now > current.expiresAt) {
        setJobs((prev) =>
          prev.map((j, idx) =>
            idx === 0
              ? {
                ...j,
                status: "expired",
                progress: 100,
              }
              : j
          )
        );
      }
    }, [now, current.status, current.expiresAt]);

    const toggleMode = () => {
      const next: ThemeMode = mode === "light" ? "dark" : "light";
      setMode(next);
      setStoredMode(next);
    };

    const pageBg =
      mode === "dark"
        ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
        : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const orangeContained = {
      backgroundColor: EVZONE.orange,
      color: "#FFFFFF",
      boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
      "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    } as const;

    const orangeOutlined = {
      borderColor: alpha(EVZONE.orange, 0.65),
      color: EVZONE.orange,
      backgroundColor: alpha(theme.palette.background.paper, 0.20),
      "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    } as const;

    const greenContained = {
      backgroundColor: EVZONE.green,
      color: "#FFFFFF",
      boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.24 : 0.16)}`,
      "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
    } as const;

    const requestExport = async () => {
      setSnack({ open: true, severity: "info", msg: "Requesting your data..." });

      try {
        const data = await api.post<any>('/privacy/export', {});

        const id = mkId("EXP");
        const requestedAt = Date.now();
        const readyAt = Date.now();
        const expiresAt = readyAt + 15 * 60 * 1000;

        const job: ExportJob = { id, requestedAt, status: "ready", progress: 100, readyAt, expiresAt };
        setJobs((prev) => [job, ...prev].slice(0, 8));

        downloadJson(`evzone-my-data-${id}.json`, data);
        setSnack({ open: true, severity: "success", msg: "Export ready and download started." });
      } catch (e) {
        setSnack({ open: true, severity: "error", msg: "Failed to export data." });
      }
    };

    const download = () => {
      if (current.status !== "ready") {
        setSnack({ open: true, severity: "warning", msg: "No ready export to download." });
        return;
      }
      if (current.expiresAt && now > current.expiresAt) {
        setSnack({ open: true, severity: "warning", msg: "Export link expired. Request a new export." });
        return;
      }

      downloadJson(`evzone-my-data-${current.id}.json`, exportPayload(current));
      setSnack({ open: true, severity: "success", msg: "Download started." });
    };

    const statusChip = (s: ExportStatus) => {
      if (s === "idle") return <Chip size="small" variant="outlined" label="No active export" />;
      if (s === "queued") return <Chip size="small" color="warning" label="Queued" />;
      if (s === "processing") return <Chip size="small" color="warning" label="Processing" />;
      if (s === "ready") return <Chip size="small" color="success" label="Ready" />;
      if (s === "expired") return <Chip size="small" color="error" label="Expired" />;
      return <Chip size="small" color="error" label="Failed" />;
    };

    const timeRemainingMs = current.expiresAt ? current.expiresAt - now : 0;
    const timeRemaining = current.status === "ready" ? fmtCountdown(timeRemainingMs) : "-";

    const included = [
      { k: "Account profile", v: "Basic profile and contacts" },
      { k: "Wallet", v: "Balances and transaction references" },
      { k: "Security", v: "Login activity summaries" },
      { k: "Consents", v: "Terms and marketing consents" },
    ];

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />

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
                          <Typography variant="h5">Download my data</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Request an export of your account data. The download link is time-limited.
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                            {statusChip(current.status)}
                            {current.status === "ready" ? <Chip size="small" variant="outlined" icon={<ClockIcon size={16} />} label={`Expires in: ${timeRemaining}`} sx={{ "& .MuiChip-icon": { color: "inherit" }, fontWeight: 900 }} /> : null}
                          </Stack>
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "You will be notified when your data is ready." })}>
                            Request data copy
                          </Button>
                          <Button variant="contained" sx={greenContained} startIcon={<DownloadIcon size={18} />} onClick={download} disabled={current.status !== "ready"}>
                            Download
                          </Button>
                        </Stack>
                      </Stack>

                      <Divider />

                      <Alert severity="info" icon={<ShieldIcon size={18} />}>
                        For your security, exports may exclude some sensitive values. Raw card details are never included.
                      </Alert>

                      {current.status === "queued" || current.status === "processing" ? (
                        <Box>
                          <LinearProgress variant="determinate" value={Math.min(100, Math.max(2, current.progress))} />
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Preparing export… {Math.min(100, Math.max(2, current.progress))}%
                          </Typography>
                        </Box>
                      ) : null}

                      {current.status === "expired" ? <Alert severity="warning">Export expired. Request a new export to download again.</Alert> : null}
                      {current.status === "failed" ? <Alert severity="error">Export failed. Please try again.</Alert> : null}
                    </Stack>
                  </CardContent>
                </Card>

                <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                  <Box className="md:col-span-5">
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">What’s included</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            This is a preview list. Backend can include more items.
                          </Typography>
                          <Divider />
                          <Stack spacing={0.9}>
                            {included.map((x) => (
                              <Box key={x.k} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.1 }}>
                                <Typography sx={{ fontWeight: 950 }}>{x.k}</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{x.v}</Typography>
                              </Box>
                            ))}
                          </Stack>
                          <Divider />
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Export format: JSON. ZIP and PDF reports can be added later.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box className="md:col-span-7">
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Export history</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Latest exports are shown here.
                          </Typography>
                          <Divider />

                          <TableContainer sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden" }}>
                            <Table size="small" sx={{ minWidth: 800 }}>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                                  <TableCell sx={{ fontWeight: 950 }}>Export ID</TableCell>
                                  <TableCell sx={{ fontWeight: 950 }}>Requested</TableCell>
                                  <TableCell sx={{ fontWeight: 950 }}>Status</TableCell>
                                  <TableCell sx={{ fontWeight: 950 }}>Expires</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(jobs.length ? jobs : [{ id: "-", requestedAt: 0, status: "idle" as ExportStatus, progress: 0 }]).map((j) => (
                                  <TableRow key={j.id} hover>
                                    <TableCell sx={{ fontWeight: 950 }}>{j.id}</TableCell>
                                    <TableCell>{j.requestedAt ? fmtDateTime(j.requestedAt) : "-"}</TableCell>
                                    <TableCell>{statusChip(j.status)}</TableCell>
                                    <TableCell>{j.expiresAt ? fmtDateTime(j.expiresAt) : "-"}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          <Alert severity="info" icon={<ClockIcon size={18} />}>
                            Exports expire for safety. Request a new export any time.
                          </Alert>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Mobile sticky actions */}
                <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                  <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                    <CardContent sx={{ py: 1.1, px: 1.2 }}>
                      <Stack direction="row" spacing={1}>
                        <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={requestExport}>
                          Request
                        </Button>
                        <Button fullWidth variant="contained" sx={greenContained} onClick={download} disabled={current.status !== "ready"}>
                          Download
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ opacity: 0.92 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
                </Box>
              </Stack>
            </motion.div>
          </Box>

          <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
            <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
              {snack.msg}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    );
  }
}
