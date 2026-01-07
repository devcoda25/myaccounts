import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
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
  LinearProgress,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { OrganizationService } from "@/services/OrganizationService";
import { formatOrgId } from "@/utils/format";

/**
 * EVzone My Accounts - Org Provisioning (SCIM)
 * Route: /app/orgs/:orgId/provisioning
 *
 * Features:
 * - SCIM tokens
 * - Connection status
 */

type ThemeMode = "light" | "dark";
type Severity = "info" | "warning" | "error" | "success";

type Token = {
  id: string;
  name: string;
  prefix: string;
  createdAt: number;
  lastUsedAt?: number;
  status: "Active" | "Revoked";
};

type Provider = "Okta" | "Azure AD" | "Google Workspace" | "JumpCloud" | "Custom";

type ConnectionStatus = "Disconnected" | "Connected" | "Degraded";

type ProvisionEvent = {
  id: string;
  at: number;
  action: "Create" | "Update" | "Deactivate" | "GroupSync";
  target: string;
  result: "Success" | "Failed";
  detail: string;
};

// Local EVZONE and THEME_KEY removed

// -----------------------------
// Inline icons (CDN-safe)
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
function UsersIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
function KeyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M7 14a5 5 0 1 1 3.6-8.5L22 5v4l-3 1v3l-3 1v3h-4l-1.4-1.4A5 5 0 0 1 7 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}
function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}
function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

// -----------------------------
// Theme
// -----------------------------
// Local theme logic removed

// -----------------------------
// Helpers
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

function safeRandomBytes(n: number) {
  const out = new Uint8Array(n);
  try {
    window.crypto.getRandomValues(out);
  } catch {
    for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 256);
  }
  return out;
}

function toBase32(bytes: Uint8Array) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
}

function mkSecret(prefix: string) {
  const raw = toBase32(safeRandomBytes(26));
  return `${prefix}_${raw.slice(0, 8)}${raw.slice(8, 16)}${raw.slice(16, 24)}`;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function parseOrgId() {
  try {
    const path = window.location.pathname;
    const m = path.match(/\/app\/orgs\/([^/]+)\/provisioning/);
    return m?.[1] || "org_001";
  } catch {
    return "org_001";
  }
}

// Self-tests removed

export default function OrgProvisioningScimPage() {
  // const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  // const theme = useMemo(() => buildTheme(mode), [mode]);
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const orgId = useMemo(() => parseOrgId(), []);

  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    OrganizationService.getOrg(orgId).then(data => setOrgName(data.name)).catch(() => { });
  }, [orgId]);

  const [enabled, setEnabled] = useState(true);
  const [provider, setProvider] = useState<Provider>("Okta");
  const [status, setStatus] = useState<ConnectionStatus>("Connected");
  const [testing, setTesting] = useState(false);

  const [tokens, setTokens] = useState<Token[]>(() => {
    const now = Date.now();
    return [
      { id: "t1", name: "Okta SCIM token", prefix: "SCIM_92AF…", createdAt: now - 1000 * 60 * 60 * 24 * 80, lastUsedAt: now - 1000 * 60 * 5, status: "Active" },
    ];
  });

  const [events] = useState<ProvisionEvent[]>(() => {
    const now = Date.now();
    return [
      { id: "e1", at: now - 1000 * 60 * 4, action: "Update", target: "user: ronald.isabirye@gmail.com", result: "Success", detail: "Updated phone" },
      { id: "e2", at: now - 1000 * 60 * 18, action: "Create", target: "user: new.user@example.com", result: "Success", detail: "Provisioned account" },
      { id: "e3", at: now - 1000 * 60 * 42, action: "GroupSync", target: "group: Finance", result: "Failed", detail: "Invalid group mapping" },
    ];
  });

  // Create token
  const [createOpen, setCreateOpen] = useState(false);
  const [tokenName, setTokenName] = useState("SCIM token");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  // Self-tests effect removed

  const toggleMode = () => {
    // Mode toggling handled by ContextSwitcher or outside
  };

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 4px 14px ${alpha(EVZONE.orange, 0.4)}`, // Standardized
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const greenContained = {
    backgroundColor: EVZONE.green,
    color: "#FFFFFF",
    boxShadow: `0 4px 14px ${alpha(EVZONE.green, 0.4)}`, // Standardized
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.green, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const baseUrl = `https://api.evzone.com/scim/v2/orgs/${orgId}`;

  const statusChip = () => {
    if (!enabled) return <Chip size="small" variant="outlined" label="Disabled" />;
    if (status === "Connected") return <Chip size="small" color="success" label="Connected" />;
    if (status === "Degraded") return <Chip size="small" color="warning" label="Degraded" />;
    return <Chip size="small" color="error" label="Disconnected" />;
  };

  const testConnection = async () => {
    setTesting(true);
    setSnack({ open: true, severity: "info", msg: "Testing connection…" });
    await new Promise((r) => setTimeout(r, 900));
    setTesting(false);
    // demo flip
    setStatus((s) => (s === "Connected" ? "Degraded" : "Connected"));
    setSnack({ open: true, severity: "success", msg: "Test complete (demo)." });
  };

  const openCreate = () => {
    setTokenName(`${provider} SCIM token`);
    setCreateOpen(true);
  };

  const createToken = () => {
    if (tokenName.trim().length < 3) {
      setSnack({ open: true, severity: "warning", msg: "Token name too short." });
      return;
    }
    const secret = mkSecret("SCIM");
    const prefix = secret.slice(0, 9) + "…";
    const t: Token = { id: mkSecret("t").slice(0, 10), name: tokenName.trim(), prefix, createdAt: Date.now(), lastUsedAt: undefined, status: "Active" };
    setTokens((prev) => [t, ...prev]);
    setCreateOpen(false);
    setCreatedSecret(secret);
    setSnack({ open: true, severity: "success", msg: "Token created. Copy secret now." });
  };

  const revokeToken = (id: string) => {
    setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Revoked" } : t)));
    setSnack({ open: true, severity: "success", msg: "Token revoked." });
  };

  const copy = async (text: string) => {
    const ok = await copyToClipboard(text);
    setSnack({ open: true, severity: ok ? "success" : "warning", msg: ok ? "Copied" : "Copy failed" });
  };

  return (
    <>
      <CssBaseline />
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top bar */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${EVZONE.green} 0%, rgba(3,205,140,0.75) 100%)` }}>
                  <Typography sx={{ color: "#fff", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>{orgName}</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Provisioning • {formatOrgId(orgId || "")}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Switch to Light/Dark Mode">
                  <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: "4px", color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: "4px", color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <UsersIcon size={18} />
                          <Typography variant="h5">SCIM provisioning</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Automatically create, update, and deactivate users from your identity provider.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" variant="outlined" label={`Org: ${orgId}`} />
                          {statusChip()}
                          <Chip size="small" variant="outlined" label={`Provider: ${provider}`} />
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<RefreshIcon size={18} />} onClick={testConnection} disabled={testing}>
                          Test connection
                        </Button>
                        <Button variant="contained" sx={orangeContained} startIcon={<KeyIcon size={18} />} onClick={openCreate}>
                          Create token
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
                      <Alert severity="info" icon={<PlugIcon size={18} />} sx={{ flex: 1, m: 0 }}>
                        SCIM requests must include a Bearer token. Rotate tokens if exposed.
                      </Alert>
                      <Box sx={{ display: "flex", gap: 1.2, alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                        <Stack spacing={0.2}>
                          <Typography sx={{ fontWeight: 950 }}>Enable provisioning</Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>When disabled, SCIM requests are rejected</Typography>
                        </Stack>
                        <Switch
                          checked={enabled}
                          onChange={(e) => {
                            setEnabled(e.target.checked);
                            setSnack({ open: true, severity: "info", msg: e.target.checked ? "Provisioning enabled" : "Provisioning disabled" });
                          }}
                        />
                      </Box>
                    </Stack>

                    {testing ? (
                      <Box>
                        <LinearProgress />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Testing…</Typography>
                      </Box>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Connection */}
                <Box className="md:col-span-5">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Connection</Typography>
                        <Divider />

                        <TextField select label="Identity provider" value={provider} onChange={(e) => setProvider(e.target.value as Provider)} fullWidth>
                          {(["Okta", "Azure AD", "Google Workspace", "JumpCloud", "Custom"] as Provider[]).map((p) => (
                            <MenuItem key={p} value={p}>
                              {p}
                            </MenuItem>
                          ))}
                        </TextField>

                        <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                          <Stack spacing={0.8}>
                            <Typography sx={{ fontWeight: 950 }}>SCIM Base URL</Typography>
                            <TextField value={baseUrl} fullWidth InputProps={{ readOnly: true, startAdornment: (<InputAdornment position="start"><PlugIcon size={18} /></InputAdornment>) }} />
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="outlined" sx={orangeOutlined} startIcon={<CopyIcon size={18} />} onClick={() => copy(baseUrl)}>
                                Copy URL
                              </Button>
                              <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "Open SCIM docs (later)." })}>
                                Docs (later)
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>

                        <Alert severity={status === "Connected" ? "success" : status === "Degraded" ? "warning" : "error"}>
                          Status: {enabled ? status : "Disabled"}
                        </Alert>

                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          In production, SCIM endpoint and status are validated via health checks.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Tokens */}
                <Box className="md:col-span-7">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Tokens</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Tokens are secrets. Treat them like passwords.
                        </Typography>
                        <Divider />

                        <Stack spacing={1.2}>
                          {tokens.map((t) => (
                            <Box key={t.id} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                              <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                                <Box>
                                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                    <Typography sx={{ fontWeight: 950 }}>{t.name}</Typography>
                                    {t.status === "Active" ? <Chip size="small" color="success" label="Active" /> : <Chip size="small" color="error" label="Revoked" />}
                                    <Chip size="small" variant="outlined" label={t.prefix} />
                                  </Stack>
                                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    Created {timeAgo(t.createdAt)} • Last used: {timeAgo(t.lastUsedAt)}
                                  </Typography>
                                </Box>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                  <Button variant="outlined" sx={orangeOutlined} startIcon={<CopyIcon size={18} />} onClick={() => copy(t.prefix)}>
                                    Copy prefix
                                  </Button>
                                  <Button variant="contained" sx={orangeContained} startIcon={<TrashIcon size={18} />} onClick={() => revokeToken(t.id)} disabled={t.status !== "Active"}>
                                    Revoke
                                  </Button>
                                </Stack>
                              </Stack>
                            </Box>
                          ))}

                          {!tokens.length ? <Alert severity="info">No tokens yet.</Alert> : null}
                        </Stack>

                        <Divider />

                        <Alert severity="warning">
                          Rotating tokens: create a new token, update your IdP, then revoke the old one.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Logs */}
                <Box className="md:col-span-12">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Provisioning activity</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Recent SCIM events for this org.
                        </Typography>
                        <Divider />

                        <TableContainer sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden" }}>
                          <Table size="small" sx={{ minWidth: 800 }}>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                                <TableCell sx={{ fontWeight: 950 }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 950 }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 950 }}>Target</TableCell>
                                <TableCell sx={{ fontWeight: 950 }}>Result</TableCell>
                                <TableCell sx={{ fontWeight: 950 }}>Detail</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {events.map((e) => (
                                <TableRow key={e.id} hover>
                                  <TableCell>{new Date(e.at).toLocaleString()}</TableCell>
                                  <TableCell>{e.action}</TableCell>
                                  <TableCell>{e.target}</TableCell>
                                  <TableCell>
                                    {e.result === "Success" ? <Chip size="small" color="success" label="Success" /> : <Chip size="small" color="error" label="Failed" />}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{e.detail}</Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button variant="outlined" sx={orangeOutlined} startIcon={<RefreshIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Refresh logs (demo)." })}>
                            Refresh
                          </Button>
                          <Button variant="contained" sx={greenContained} onClick={() => setSnack({ open: true, severity: "info", msg: "Export logs CSV (later)." })}>
                            Export (later)
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
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={testConnection} disabled={testing}>
                        Test
                      </Button>
                      <Button fullWidth variant="contained" sx={orangeContained} onClick={openCreate}>
                        Token
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </motion.div>
        </Box>

        {/* Create token dialog */}
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Create SCIM token</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>You will see the token secret once.</Typography>
              <TextField value={tokenName} onChange={(e) => setTokenName(e.target.value)} label="Token name" fullWidth />
              <Alert severity="warning">Store the secret in your identity provider configuration.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="contained" sx={orangeContained} onClick={createToken}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* Secret dialog */}
        <Dialog open={!!createdSecret} onClose={() => setCreatedSecret(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Copy token secret</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Alert severity="warning" icon={<KeyIcon size={18} />}>
                This is the only time you will see the SCIM token secret.
              </Alert>
              <TextField value={createdSecret || ""} fullWidth label="Secret" InputProps={{ readOnly: true }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button variant="contained" sx={orangeContained} startIcon={<CopyIcon size={18} />} onClick={() => createdSecret && copy(createdSecret)}>
                  Copy
                </Button>
                <Button variant="outlined" sx={orangeOutlined} onClick={() => setCreatedSecret(null)}>
                  Done
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
