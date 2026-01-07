import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
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
import { api } from "@/utils/api";

/**
 * EVzone My Accounts - Developer / API Access
 * Route: /app/developer
 *
 * Features:
 * - API keys
 * - OAuth client registration
 *
 * Note: This is UI + demo data. Wire to backend later.
 */

type Severity = "info" | "warning" | "error" | "success";

type ReAuthMode = "password" | "mfa";
type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  createdAt: number;
  lastUsedAt?: number;
  scopes: string[];
  status: "Active" | "Revoked";
  secret?: string;
};

type OAuthClient = {
  id: string;
  name: string;
  clientId: string;
  type: "confidential" | "public";
  redirectUris: string[];
  createdAt: number;
  status: "Active" | "Revoked";
  clientSecret?: string;
};

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;
const WHATSAPP = { green: "#25D366" } as const;

const ALL_SCOPES = [
  "profile.read",
  "wallet.read",
  "wallet.write",
  "transactions.read",
  "notifications.send",
  "orgs.read",
  "orgs.manage",
  "charging.read",
  "marketplace.read",
] as const;

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
function KeyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M7 14a5 5 0 1 1 3.6-8.5L22 5v4l-3 1v3l-3 1v3h-4l-1.4-1.4A5 5 0 0 1 7 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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
function LinkIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}
function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}
function KeypadIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7h.01M12 7h.01M15 7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 11h.01M12 11h.01M15 11h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M9 15h.01M12 15h.01M15 15h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}
function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}
function SmsIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function mkKeySecret(prefix: string) {
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

function mfaCodeFor(channel: MfaChannel) {
  if (channel === "Authenticator") return "654321";
  if (channel === "SMS") return "222222";
  if (channel === "WhatsApp") return "333333";
  return "111111";
}

export default function DeveloperAccessPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const theme = useTheme();

  const isDark = mode === "dark";

  const [tab, setTab] = useState<0 | 1>(0);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);

  // Sensitive action gating (re-auth)
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
  const [reauthPassword, setReauthPassword] = useState("");
  const [mfaChannel, setMfaChannel] = useState<MfaChannel>("SMS");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState<null | (() => void)>(null);

  // API key dialogs
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyScopes, setKeyScopes] = useState<string[]>(["profile.read", "wallet.read"]);

  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [createdLabel, setCreatedLabel] = useState<string | null>(null);

  // OAuth dialogs
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientType, setClientType] = useState<OAuthClient["type"]>("confidential");
  const [redirectUris, setRedirectUris] = useState("https://example.com/callback");

  const [createdClientSecret, setCreatedClientSecret] = useState<string | null>(null);
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [keys, cls] = await Promise.all([
          api<ApiKey[]>('/developer/api-keys'),
          api<OAuthClient[]>('/developer/oauth-clients')
        ]);
        setApiKeys(keys);
        setClients(cls);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const greenContained = {
    backgroundColor: EVZONE.green,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.24 : 0.16)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const whatsappOutline = {
    borderColor: alpha(WHATSAPP.green, 0.70),
    color: WHATSAPP.green,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: WHATSAPP.green, backgroundColor: WHATSAPP.green, color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const requireReauth = (fn: () => void) => {
    setPending(() => fn);
    setReauthMode("password");
    setReauthPassword("");
    setMfaChannel("SMS");
    setOtp("");
    setReauthOpen(true);
  };

  const validateReauth = () => {
    if (reauthMode === "password") return reauthPassword === "EVzone123!";
    return otp.trim() === mfaCodeFor(mfaChannel);
  };

  const confirmReauth = () => {
    if (!validateReauth()) {
      setSnack({ open: true, severity: "error", msg: "Re-auth failed (demo)." });
      return;
    }
    setReauthOpen(false);
    const fn = pending;
    setPending(null);
    fn?.();
  };

  // API keys
  const openCreateKey = () => {
    setKeyName("");
    setKeyScopes(["profile.read", "wallet.read"]);
    setCreateKeyOpen(true);
  };

  const createKey = () => {
    if (keyName.trim().length < 3) {
      setSnack({ open: true, severity: "warning", msg: "Name is too short." });
      return;
    }
    requireReauth(async () => {
      try {
        setLoading(true);
        const res = await api.post<ApiKey>('/developer/api-keys', { name: keyName.trim(), scopes: keyScopes });
        setApiKeys((prev) => [res, ...prev]);
        setCreateKeyOpen(false);
        setCreatedSecret(res.secret || null);
        setCreatedLabel(res.name);
        setSnack({ open: true, severity: "success", msg: "API key created. Copy the secret now." });
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Failed to create API key." });
      } finally {
        setLoading(false);
      }
    });
  };

  const revokeKey = (id: string) => {
    requireReauth(async () => {
      try {
        setLoading(true);
        await api.delete(`/developer/api-keys/${id}`);
        setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "Revoked" } : k)));
        setSnack({ open: true, severity: "success", msg: "API key revoked." });
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Failed to revoke API key." });
      } finally {
        setLoading(false);
      }
    });
  };

  // OAuth clients
  const openCreateClient = () => {
    setClientName("");
    setClientType("confidential");
    setRedirectUris("https://example.com/callback");
    setCreateClientOpen(true);
  };

  const createClient = () => {
    if (clientName.trim().length < 3) {
      setSnack({ open: true, severity: "warning", msg: "Client name is too short." });
      return;
    }
    const uris = redirectUris
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!uris.length) {
      setSnack({ open: true, severity: "warning", msg: "Add at least one redirect URI." });
      return;
    }

    requireReauth(async () => {
      try {
        setLoading(true);
        const res = await api.post<OAuthClient>('/developer/oauth-clients', { name: clientName.trim(), type: clientType, redirectUris: uris });
        setClients((prev) => [res, ...prev]);
        setCreateClientOpen(false);
        setCreatedClientId(res.clientId);
        setCreatedClientSecret(res.clientSecret || null);
        setSnack({ open: true, severity: "success", msg: "OAuth client created." });
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Failed to create client." });
      } finally {
        setLoading(false);
      }
    });
  };

  const revokeClient = (id: string) => {
    requireReauth(async () => {
      try {
        setLoading(true);
        await api.delete(`/developer/oauth-clients/${id}`);
        setClients((prev) => prev.filter((c) => c.id !== id));
        setSnack({ open: true, severity: "success", msg: "OAuth client revoked." });
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Failed to revoke client." });
      } finally {
        setLoading(false);
      }
    });
  };

  const copySecret = async (text: string) => {
    const ok = await copyToClipboard(text);
    setSnack({ open: true, severity: ok ? "success" : "warning", msg: ok ? "Copied" : "Copy failed" });
  };

  const ScopeChips = ({ scopes }: { scopes: string[] }) => (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {scopes.slice(0, 4).map((s) => (
        <Chip key={s} size="small" variant="outlined" label={s} />
      ))}
      {scopes.length > 4 ? <Chip size="small" variant="outlined" label={`+${scopes.length - 4}`} /> : null}
    </Stack>
  );

  return (
    <>
      <Box className="min-h-screen" sx={{ background: pageBg }}>


        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">Developer and API access</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Manage API keys and OAuth clients. Sensitive actions require re-authentication.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" variant="outlined" icon={<ShieldIcon size={16} />} label="Audit logged" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" variant="outlined" label="Rate-limited" />
                        </Stack>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/developer/docs")}>
                          Docs
                        </Button>
                        <Button variant="contained" sx={orangeContained} onClick={() => navigate("/app/developer/audit")}>
                          Audit
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Tabs
                      value={tab}
                      onChange={(_, v) => setTab(v)}
                      sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
                    >
                      <Tab label="API keys" />
                      <Tab label="OAuth clients" />
                    </Tabs>

                    <Alert severity="info" icon={<ShieldIcon size={18} />}>
                      Never embed secrets in mobile apps or public websites. Rotate keys if exposed.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {tab === 0 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.2}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                        <Typography variant="h6">API keys</Typography>
                        <Button variant="contained" sx={orangeContained} startIcon={<KeyIcon size={18} />} onClick={openCreateKey}>
                          Create key
                        </Button>
                      </Stack>
                      <Divider />

                      <Stack spacing={1.2}>
                        {apiKeys.map((k) => (
                          <Box key={k.id} sx={{ borderRadius: 20, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                  <Typography sx={{ fontWeight: 950 }}>{k.name}</Typography>
                                  {k.status === "Active" ? <Chip size="small" color="success" label="Active" /> : <Chip size="small" color="error" label="Revoked" />}
                                  <Chip size="small" variant="outlined" label={k.prefix} />
                                </Stack>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  Created {timeAgo(k.createdAt)} • Last used: {timeAgo(k.lastUsedAt)}
                                </Typography>
                                <Box sx={{ mt: 0.8 }}>
                                  <ScopeChips scopes={k.scopes} />
                                </Box>
                              </Box>

                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                <Button variant="outlined" sx={orangeOutlined} startIcon={<CopyIcon size={18} />} onClick={() => copySecret(k.prefix)}>
                                  Copy prefix
                                </Button>
                                <Button variant="contained" sx={orangeContained} startIcon={<TrashIcon size={18} />} onClick={() => revokeKey(k.id)} disabled={k.status !== "Active"}>
                                  Revoke
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>
                        ))}

                        {!apiKeys.length ? <Alert severity="info">No keys yet.</Alert> : null}
                      </Stack>

                      <Divider />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Use short-lived tokens where possible. For server-to-server access, restrict scopes.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.2}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                        <Typography variant="h6">OAuth clients</Typography>
                        <Button variant="contained" sx={orangeContained} startIcon={<LinkIcon size={18} />} onClick={openCreateClient}>
                          Register client
                        </Button>
                      </Stack>
                      <Divider />

                      <Stack spacing={1.2}>
                        {clients.map((c) => (
                          <Box key={c.id} sx={{ borderRadius: 20, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                  <Typography sx={{ fontWeight: 950 }}>{c.name}</Typography>
                                  {c.status === "Active" ? <Chip size="small" color="success" label="Active" /> : <Chip size="small" color="error" label="Revoked" />}
                                  <Chip size="small" variant="outlined" label={c.type} />
                                  <Chip size="small" variant="outlined" label={c.clientId} />
                                </Stack>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  Created {timeAgo(c.createdAt)} • Redirect URIs: {c.redirectUris.length}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                                  {c.redirectUris.slice(0, 2).map((u) => (
                                    <Chip key={u} size="small" variant="outlined" label={u} />
                                  ))}
                                  {c.redirectUris.length > 2 ? <Chip size="small" variant="outlined" label={`+${c.redirectUris.length - 2}`} /> : null}
                                </Stack>
                              </Box>

                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                <Button variant="outlined" sx={orangeOutlined} startIcon={<CopyIcon size={18} />} onClick={() => copySecret(c.clientId)}>
                                  Copy ID
                                </Button>
                                <Button variant="contained" sx={orangeContained} startIcon={<TrashIcon size={18} />} onClick={() => revokeClient(c.id)} disabled={c.status !== "Active"}>
                                  Revoke
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>
                        ))}

                        {!clients.length ? <Alert severity="info">No OAuth clients yet.</Alert> : null}
                      </Stack>

                      <Divider />
                      <Alert severity="info" icon={<ShieldIcon size={18} />}>
                        If you open EVzone APIs externally, use OIDC, PKCE for public clients, and strict redirect URI validation.
                      </Alert>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => setTab(tab === 0 ? 1 : 0)}>
                        {tab === 0 ? "OAuth" : "Keys"}
                      </Button>
                      <Button fullWidth variant="contained" sx={orangeContained} onClick={tab === 0 ? openCreateKey : openCreateClient}>
                        Create
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

        {/* Create API key dialog */}
        <Dialog open={createKeyOpen} onClose={() => setCreateKeyOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Create API key</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Choose a name and scopes. You will see the secret once.</Typography>
              <TextField value={keyName} onChange={(e) => setKeyName(e.target.value)} label="Key name" placeholder="Example: Backend service" fullWidth />

              <TextField
                select
                label="Scopes"
                value={"custom"}
                fullWidth
                helperText="Select common scope sets using quick presets below."
              >
                <MenuItem value="custom">Custom</MenuItem>
              </TextField>

              <Box className="grid gap-2 sm:grid-cols-2">
                <Button variant="outlined" sx={orangeOutlined} onClick={() => setKeyScopes(["profile.read", "wallet.read", "transactions.read"])}>
                  Read-only wallet
                </Button>
                <Button variant="outlined" sx={orangeOutlined} onClick={() => setKeyScopes(["profile.read", "wallet.read", "wallet.write", "transactions.read"])}>
                  Wallet operations
                </Button>
                <Button variant="outlined" sx={orangeOutlined} onClick={() => setKeyScopes(["orgs.read"])}>
                  Org read
                </Button>
                <Button variant="outlined" sx={orangeOutlined} onClick={() => setKeyScopes(["orgs.read", "orgs.manage"])}>
                  Org admin
                </Button>
              </Box>

              <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                <Typography sx={{ fontWeight: 950 }}>Selected scopes</Typography>
                <Divider sx={{ my: 1 }} />
                <ScopeChips scopes={keyScopes} />
              </Box>

              <Alert severity="info" icon={<ShieldIcon size={18} />}>
                Keys are sensitive. Use server-side only.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setCreateKeyOpen(false)}>Cancel</Button>
            <Button variant="contained" sx={orangeContained} onClick={createKey}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* Create OAuth client dialog */}
        <Dialog open={createClientOpen} onClose={() => setCreateClientOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Register OAuth client</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Register a client for OAuth/OIDC. Use PKCE for public clients.
              </Typography>
              <TextField value={clientName} onChange={(e) => setClientName(e.target.value)} label="Client name" fullWidth />
              <TextField select value={clientType} onChange={(e) => setClientType(e.target.value as OAuthClient["type"])} label="Client type" fullWidth>
                <MenuItem value="confidential">Confidential (server)</MenuItem>
                <MenuItem value="public">Public (mobile/web)</MenuItem>
              </TextField>
              <TextField
                value={redirectUris}
                onChange={(e) => setRedirectUris(e.target.value)}
                label="Redirect URIs"
                fullWidth
                multiline
                minRows={3}
                helperText="One per line. Must be HTTPS in production."
              />
              <Alert severity="info" icon={<LinkIcon size={18} />}>
                Strict redirect URI validation is required.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setCreateClientOpen(false)}>Cancel</Button>
            <Button variant="contained" sx={orangeContained} onClick={createClient}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* Re-auth dialog */}
        <Dialog open={reauthOpen} onClose={() => setReauthOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Confirm it’s you</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Sensitive action. Please re-authenticate.</Typography>
              <Tabs value={reauthMode === "password" ? 0 : 1} onChange={(_, v) => setReauthMode(v === 0 ? "password" : "mfa")} variant="fullWidth" sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}>
                <Tab label="Password" />
                <Tab label="MFA" />
              </Tabs>

              {reauthMode === "password" ? (
                <TextField
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  label="Password"
                  type="password"
                  fullWidth
                  InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon size={18} /></InputAdornment>) }}
                  helperText="Demo password: EVzone123!"
                />
              ) : (
                <>
                  <Typography sx={{ fontWeight: 950 }}>Choose channel</Typography>
                  <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button variant={mfaChannel === "Authenticator" ? "contained" : "outlined"} sx={mfaChannel === "Authenticator" ? orangeContained : orangeOutlined} startIcon={<KeypadIcon size={18} />} onClick={() => setMfaChannel("Authenticator")}>
                      Authenticator
                    </Button>
                    <Button variant={mfaChannel === "SMS" ? "contained" : "outlined"} sx={mfaChannel === "SMS" ? orangeContained : orangeOutlined} startIcon={<SmsIcon size={18} />} onClick={() => setMfaChannel("SMS")}>
                      SMS
                    </Button>
                    <Button variant={mfaChannel === "WhatsApp" ? "contained" : "outlined"} sx={mfaChannel === "WhatsApp" ? ({ ...orangeContained, backgroundColor: WHATSAPP.green, "&:hover": { backgroundColor: alpha(WHATSAPP.green, 0.92) } } as const) : whatsappOutline} startIcon={<WhatsAppIcon size={18} />} onClick={() => setMfaChannel("WhatsApp")}>
                      WhatsApp
                    </Button>
                    <Button variant={mfaChannel === "Email" ? "contained" : "outlined"} sx={mfaChannel === "Email" ? orangeContained : orangeOutlined} startIcon={<MailIcon size={18} />} onClick={() => setMfaChannel("Email")}>
                      Email
                    </Button>
                  </Box>

                  <TextField
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    label="6-digit code"
                    fullWidth
                    InputProps={{ startAdornment: (<InputAdornment position="start"><KeypadIcon size={18} /></InputAdornment>) }}
                    helperText={`Demo code for ${mfaChannel}: ${mfaCodeFor(mfaChannel)}`}
                  />
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setReauthOpen(false)}>Cancel</Button>
            <Button variant="contained" sx={greenContained} onClick={confirmReauth}>Continue</Button>
          </DialogActions>
        </Dialog>

        {/* Secret reveal dialog */}
        <Dialog open={!!createdSecret} onClose={() => setCreatedSecret(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Copy your secret now</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Alert severity="warning" icon={<ShieldIcon size={18} />}>
                This is the only time you will see the secret for “{createdLabel || "(new key)"}”.
              </Alert>
              <TextField value={createdSecret || ""} fullWidth label="Secret" InputProps={{ readOnly: true }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button variant="contained" sx={orangeContained} startIcon={<CopyIcon size={18} />} onClick={() => createdSecret && copySecret(createdSecret)}>
                  Copy secret
                </Button>
                <Button variant="outlined" sx={orangeOutlined} onClick={() => setCreatedSecret(null)}>
                  I saved it
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>

        {/* OAuth client credentials dialog */}
        <Dialog open={!!createdClientId} onClose={() => { setCreatedClientId(null); setCreatedClientSecret(null); }} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>OAuth client credentials</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Alert severity="info" icon={<LinkIcon size={18} />}>
                Save these values now.
              </Alert>
              <TextField value={createdClientId || ""} fullWidth label="Client ID" InputProps={{ readOnly: true }} />
              {createdClientSecret ? <TextField value={createdClientSecret} fullWidth label="Client Secret" InputProps={{ readOnly: true }} /> : null}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button variant="contained" sx={orangeContained} startIcon={<CopyIcon size={18} />} onClick={() => copySecret([createdClientId, createdClientSecret].filter(Boolean).join("\n"))}>
                  Copy
                </Button>
                <Button variant="outlined" sx={orangeOutlined} onClick={() => { setCreatedClientId(null); setCreatedClientSecret(null); }}>
                  Done
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
