import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Privacy Consents
 * Route: /app/privacy/consents
 *
 * Features:
 * - Terms acceptance history
 * - Marketing opt-ins
 * - Cookie preferences (if managed here)
 */

type ThemeMode = "light" | "dark";

type Severity = "info" | "warning" | "error" | "success";

type ConsentKind = "Terms" | "Privacy" | "Cookies";

type ConsentRecord = {
  id: string;
  kind: ConsentKind;
  title: string;
  version: string;
  acceptedAt: number;
  channel: "Web" | "Android" | "iOS";
  ipMasked: string;
};

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

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

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function DocumentIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function MegaphoneIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 11v2a3 3 0 0 0 3 3h1l2 5h2l-2-5h5l7-4V8l-7-4H7a3 3 0 0 0-3 3v2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M22 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function CookieIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M20 12a8 8 0 1 1-8-8c.2 1.8 1.7 3.3 3.5 3.5.6 2.2 2.8 3.8 5.1 3.5.2.3.3.7.4 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <circle cx="14" cy="10" r="1" fill="currentColor" />
    </IconBase>
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

function SaveIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 4h12l4 4v12H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 4v6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="14" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
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
      background: { default: bg, paper },
      text: { primary: textPrimary, secondary: textSecondary },
      divider: isDark ? alpha("#E9FFF7", 0.12) : alpha("#0B1A17", 0.10),
    },
    shape: { borderRadius: 1 },
    typography: {
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      h5: { fontWeight: 950, letterSpacing: -0.5 },
      h6: { fontWeight: 900, letterSpacing: -0.28 },
      button: { fontWeight: 900, textTransform: "none" },
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: "4px", textTransform: "none", boxShadow: "none" } } },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "4px",
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
// Utils
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

function exportCsv(records: ConsentRecord[]) {
  const header = ["kind", "title", "version", "acceptedAt", "channel", "ip"];
  const rows = records.map((r) => [r.kind, r.title, r.version, new Date(r.acceptedAt).toISOString(), r.channel, r.ipMasked]);
  const csv = [header, ...rows]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "evzone-consent-history.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_PRIVACY_CONSENTS_TESTS_RAN__) return;
    w.__EVZONE_PRIVACY_CONSENTS_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("maskIp", maskIp("197.157.10.20").includes("x"));
    // eslint-disable-next-line no-console
    console.log("EVzone Privacy Consents: self-tests passed");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

export default function PrivacyConsentsPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isDark = mode === "dark";

  const [tab, setTab] = useState<0 | 1 | 2>(0);

  const [records] = useState<ConsentRecord[]>(() => {
    const now = Date.now();
    return [
      {
        id: "c1",
        kind: "Terms",
        title: "EVzone Terms of Service",
        version: "v2.1",
        acceptedAt: now - 1000 * 60 * 60 * 24 * 32,
        channel: "Web",
        ipMasked: maskIp("197.157.10.20"),
      },
      {
        id: "c2",
        kind: "Privacy",
        title: "EVzone Privacy Policy",
        version: "v1.9",
        acceptedAt: now - 1000 * 60 * 60 * 24 * 32,
        channel: "Web",
        ipMasked: maskIp("197.157.10.20"),
      },
      {
        id: "c3",
        kind: "Cookies",
        title: "Cookie Preferences",
        version: "v1.2",
        acceptedAt: now - 1000 * 60 * 60 * 24 * 6,
        channel: "Web",
        ipMasked: maskIp("102.90.4.18"),
      },
    ];
  });

  // Marketing
  const [marketingEmail, setMarketingEmail] = useState(true);
  const [marketingSms, setMarketingSms] = useState(false);
  const [marketingWhatsapp, setMarketingWhatsapp] = useState(false);
  const [marketingProduct, setMarketingProduct] = useState(true);
  const [marketingPartners, setMarketingPartners] = useState(false);

  // Cookies
  const [cookiesAnalytics, setCookiesAnalytics] = useState(true);
  const [cookiesMarketing, setCookiesMarketing] = useState(false);
  const [cookiesPersonalization, setCookiesPersonalization] = useState(true);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

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

  const saveMarketing = () => {
    setSnack({ open: true, severity: "success", msg: "Marketing preferences saved (demo)." });
  };

  const saveCookies = () => {
    setSnack({ open: true, severity: "success", msg: "Cookie preferences saved (demo)." });
  };

  const viewDoc = (r: ConsentRecord) => {
    setSnack({ open: true, severity: "info", msg: `View ${r.title} ${r.version} (demo).` });
  };

  const filteredRecords = useMemo(() => {
    if (tab === 0) return records;
    if (tab === 1) return records.filter((r) => r.kind === "Terms" || r.kind === "Privacy");
    return records.filter((r) => r.kind === "Cookies");
  }, [records, tab]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="min-h-screen" sx={{ background: pageBg }}>


        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">Privacy consents</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Review your legal acceptances and manage privacy preferences.
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<DownloadIcon size={18} />} onClick={() => exportCsv(records)}>
                          Download history
                        </Button>
                        <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<ShieldCheckIcon size={18} />} onClick={() => navigate("/app/privacy/data-requests")}>
                          Data requests
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}>
                      <Tab label="All" />
                      <Tab label="Terms and privacy" />
                      <Tab label="Cookies" />
                    </Tabs>

                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                      Your acceptance history is stored for compliance and auditing.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Left: history */}
                <Box className="md:col-span-7">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="h6">Acceptance history</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{filteredRecords.length} record(s)</Typography>
                          </Box>
                          <Chip size="small" variant="outlined" label={`Latest: ${new Date(records[0].acceptedAt).toLocaleDateString()}`} />
                        </Stack>

                        <Divider />

                        <Stack spacing={1.2}>
                          {filteredRecords
                            .slice()
                            .sort((a, b) => b.acceptedAt - a.acceptedAt)
                            .map((r) => (
                              <Box key={r.id} sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                                <Stack spacing={0.8}>
                                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      {r.kind === "Cookies" ? <CookieIcon size={18} /> : <DocumentIcon size={18} />}
                                      <Typography sx={{ fontWeight: 950 }}>{r.title}</Typography>
                                    </Stack>
                                    <Chip size="small" variant="outlined" label={r.kind} />
                                  </Stack>

                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip size="small" variant="outlined" label={`Version ${r.version}`} />
                                    <Chip size="small" variant="outlined" label={`Accepted ${timeAgo(r.acceptedAt)}`} />
                                    <Chip size="small" variant="outlined" label={r.channel} />
                                    <Chip size="small" variant="outlined" label={`IP ${r.ipMasked}`} />
                                  </Stack>

                                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                    <Button variant="outlined" sx={orangeOutlined} startIcon={<DocumentIcon size={18} />} onClick={() => viewDoc(r)}>
                                      View
                                    </Button>
                                    <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Download PDF copy (demo)." })}>
                                      Download
                                    </Button>
                                  </Stack>
                                </Stack>
                              </Box>
                            ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Right: preferences */}
                <Box className="md:col-span-5">
                  <Stack spacing={2.2}>
                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <MegaphoneIcon size={18} />
                            <Typography variant="h6">Marketing preferences</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Choose how you want to receive product updates.
                          </Typography>

                          <Divider />

                          <Stack spacing={0.6}>
                            <FormControlLabel control={<Switch checked={marketingEmail} onChange={(e) => setMarketingEmail(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Email marketing</Typography>} />
                            <FormControlLabel control={<Switch checked={marketingSms} onChange={(e) => setMarketingSms(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>SMS marketing</Typography>} />
                            <FormControlLabel control={<Switch checked={marketingWhatsapp} onChange={(e) => setMarketingWhatsapp(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>WhatsApp marketing</Typography>} />
                          </Stack>

                          <Divider />

                          <Stack spacing={0.6}>
                            <FormControlLabel control={<Checkbox checked={marketingProduct} onChange={(e) => setMarketingProduct(e.target.checked)} />} label={<Typography sx={{ fontWeight: 900 }}>Product updates</Typography>} />
                            <FormControlLabel control={<Checkbox checked={marketingPartners} onChange={(e) => setMarketingPartners(e.target.checked)} />} label={<Typography sx={{ fontWeight: 900 }}>Partner offers</Typography>} />
                          </Stack>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<SaveIcon size={18} />} onClick={saveMarketing}>
                              Save
                            </Button>
                            <Button variant="outlined" sx={orangeOutlined} onClick={() => { setMarketingEmail(false); setMarketingSms(false); setMarketingWhatsapp(false); setMarketingProduct(false); setMarketingPartners(false); setSnack({ open: true, severity: "info", msg: "All marketing disabled (demo)." }); }}>
                              Disable all
                            </Button>
                          </Stack>

                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            You can opt out anytime. Transactional messages are still sent.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CookieIcon size={18} />
                            <Typography variant="h6">Cookie preferences</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Control analytics, marketing, and personalization cookies.
                          </Typography>

                          <Divider />

                          <Stack spacing={0.8}>
                            <FormControlLabel control={<Switch checked disabled />} label={<Typography sx={{ fontWeight: 900 }}>Essential cookies (required)</Typography>} />
                            <FormControlLabel control={<Switch checked={cookiesAnalytics} onChange={(e) => setCookiesAnalytics(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Analytics</Typography>} />
                            <FormControlLabel control={<Switch checked={cookiesMarketing} onChange={(e) => setCookiesMarketing(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Marketing</Typography>} />
                            <FormControlLabel control={<Switch checked={cookiesPersonalization} onChange={(e) => setCookiesPersonalization(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Personalization</Typography>} />
                          </Stack>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<SaveIcon size={18} />} onClick={saveCookies}>
                              Save
                            </Button>
                            <Button variant="outlined" sx={orangeOutlined} onClick={() => { setCookiesAnalytics(false); setCookiesMarketing(false); setCookiesPersonalization(false); setSnack({ open: true, severity: "info", msg: "Only essential cookies enabled (demo)." }); }}>
                              Essential only
                            </Button>
                          </Stack>

                          <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                            Some modules may rely on analytics for performance and fraud prevention.
                          </Alert>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </Box>

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => exportCsv(records)}>
                        Export
                      </Button>
                      <Button fullWidth variant="contained" color="secondary" sx={orangeContained} onClick={() => { saveMarketing(); saveCookies(); }}>
                        Save
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
    </ThemeProvider>
  );
}
