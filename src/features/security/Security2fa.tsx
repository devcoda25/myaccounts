import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
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
 * EVzone My Accounts - Manage 2FA Methods
 * Route: /app/security/2fa
 *
 * Features:
 * - Enable/disable (requires re-auth)
 * - Add backup method
 * - Regenerate recovery codes
 */

type Severity = "info" | "warning" | "error" | "success";

type ReAuthMode = "password" | "mfa";

type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

type MethodKey = "authenticator" | "sms" | "whatsapp";

type MethodItem = {
  key: MethodKey;
  name: string;
  enabled: boolean;
  primary?: boolean;
  lastUsedAt?: number;
};

interface IMfaStatusResponse {
  enabled: boolean;
  methods: string[];
}


// Redundant EVZONE removed

const WHATSAPP = {
  green: "#25D366",
} as const;

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

function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

// [Removed] mfaCodeFor mock

export default function Manage2FAPage() {
  const { t } = useTranslation("common"); {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  // API Data State
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [methods, setMethods] = useState<MethodItem[]>([]);

  // Fetch status
  useEffect(() => {

    api<IMfaStatusResponse>("/auth/mfa/status")
      .then((data) => {
        setMfaEnabled(data.enabled);
        setMethods(data.methods.map((m) => ({
          key: m.toLowerCase() as MethodKey, // Assuming m matches MethodKey
          name: m,
          enabled: true, // Assuming methods returned by API are enabled
          addedAt: Date.now(), // approximation
          lastUsedAt: Date.now(),
          primary: m === "Authenticator"
        })));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  // Re-auth for sensitive actions
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
  const [reauthPassword, setReauthPassword] = useState("");
  const [mfaChannel, setMfaChannel] = useState<MfaChannel>("Authenticator");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState<null | { type: "toggle" | "add" | "disable"; payload?: string | MethodKey }>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const requestChallenge = async () => {
    try {
      const channelMap: Record<string, 'sms' | 'whatsapp' | 'email'> = {
        'SMS': 'sms',
        'WhatsApp': 'whatsapp',
        'Email': 'email'
      };
      const c = channelMap[mfaChannel];
      if (!c) return;

      await api('/auth/mfa/challenge/send', { method: 'POST', body: JSON.stringify({ channel: c }) });
      setCodeSent(true);
      setCooldown(30);
      setSnack({ open: true, severity: "success", msg: `Code sent to ${mfaChannel}` });
    } catch (err: any) {
      setSnack({ open: true, severity: "error", msg: err.message || "Failed to send code" });
    }
  };

  const [addOpen, setAddOpen] = useState(false);
  const [addChoice, setAddChoice] = useState<MethodKey>("sms");

  // toggleMode removed

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const evOrangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
  } as const;

  const evOrangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const whatsappOutlinedSx = {
    borderColor: alpha(WHATSAPP.green, 0.75),
    color: WHATSAPP.green,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: WHATSAPP.green, backgroundColor: WHATSAPP.green, color: "#FFFFFF" },
  } as const;

  const openReauth = (p: { type: "toggle" | "add" | "disable"; payload?: string | MethodKey }) => {
    setPending(p);
    setReauthMode("password");
    setReauthPassword("");
    setMfaChannel("Authenticator");
    setCodeSent(false);
    setCooldown(0);
    setOtp("");
    setReauthOpen(true);
  };

  const closeReauth = () => {
    setReauthOpen(false);
    setPending(null);
  };

  const validateReauth = async () => {
    if (reauthMode === "password") {
      try {
        await api.post<void>("/auth/verify-password", { password: reauthPassword });
        return true;
      } catch (err: unknown) {
        console.error(err);
        setSnack({ open: true, severity: "error", msg: (err as Error).message || "Re-auth failed. Incorrect password." });
        return false;
      }
    }

    // Verify MFA via backend
    try {
      const channelMap: Record<string, 'authenticator' | 'sms' | 'whatsapp' | 'email'> = {
        'Authenticator': 'authenticator',
        'SMS': 'sms',
        'WhatsApp': 'whatsapp',
        'Email': 'email'
      };
      const c = channelMap[mfaChannel];
      await api('/auth/mfa/challenge/verify', { method: 'POST', body: JSON.stringify({ code: otp, channel: c }) });
      return true;
    } catch (err: any) {
      setSnack({ open: true, severity: "error", msg: err.message || "Re-auth failed. Invalid code." });
      return false;
    }
  };

  const applyPending = async () => {
    if (!pending) return;
    const ok = await validateReauth();
    if (!ok) return;

    if (pending.type === "toggle") {
      if (mfaEnabled) {
        // We are disabling
        try {
          await api.post<void>("/auth/mfa/disable");
          setMfaEnabled(false);
          setSnack({ open: true, severity: "success", msg: "Two-factor authentication disabled." });
        } catch (err: unknown) {
          setSnack({ open: true, severity: "error", msg: (err as Error).message || "Failed to disable 2FA." });
        }
      } else {
        // We are enabling
        navigate("/app/security/2fa/setup");
      }
    }

    if (pending.type === "add") {
      const k = pending.payload as MethodKey;
      if (k === "authenticator" || k === "sms") {
        navigate(`/app/security/2fa/setup?method=${k}`);
      } else {
        setSnack({ open: true, severity: "info", msg: "WhatsApp method will be available when enabled in your contact settings." });
      }
    }

    if (pending.type === "disable") {
      const key = pending.payload as MethodKey;
      setMethods((prev) => prev.map((m) => (m.key === key ? { ...m, enabled: false, primary: false } : m)));
      setSnack({ open: true, severity: "success", msg: "Method disabled (demo)." });
    }

    closeReauth();
  };

  const openAdd = () => {
    setAddChoice("sms");
    setAddOpen(true);
  };

  const submitAdd = () => {
    setAddOpen(false);
    openReauth({ type: "add", payload: addChoice });
  };

  const markPrimary = (key: MethodKey) => {
    // primary selection is sensitive too
    openReauth({ type: "add", payload: key });
  };

  const disableMethod = (key: MethodKey) => {
    openReauth({ type: "disable", payload: key });
  };

  const cardSx = {
    borderRadius: "4px",
    border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.45),
  } as const;

  const methodIcon = (key: MethodKey) => {
    if (key === "authenticator") return <KeypadIcon size={18} />;
    if (key === "sms") return <PhoneIcon size={18} />;
    return <WhatsAppIcon size={18} />;
  };

  const methodColor = (key: MethodKey) => {
    if (key === "whatsapp") return WHATSAPP.green;
    return EVZONE.orange;
  };

  const anyEnabled = methods.some((m) => m.enabled);

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      {/* Redundant Top bar removed */}

      {/* Body */}
      <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Stack spacing={2.2}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                  <Box>
                    <Typography variant="h5">Two-factor authentication</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Enable, disable, and manage your 2FA methods. Sensitive actions require re-authentication.
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<RefreshIcon size={18} />} onClick={() => window.location.reload()}>
                      Refresh
                    </Button>
                    <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={openAdd}>
                      Add backup method
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
                  <Box>
                    <Typography sx={{ fontWeight: 950 }}>2FA status</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {mfaEnabled ? "Enabled" : "Disabled"}
                    </Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={mfaEnabled}
                        onChange={() => openReauth({ type: "toggle" })}
                        color="secondary"
                      />
                    }
                    label={<Typography sx={{ fontWeight: 900 }}>Enable 2FA</Typography>}
                  />
                </Stack>

                {!mfaEnabled ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    2FA is disabled. Enable it to protect wallet withdrawals and sensitive actions.
                  </Alert>
                ) : null}
              </CardContent>
            </Card>

            <Box className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <Stack spacing={1.2}>
                    <Typography sx={{ fontWeight: 950 }}>Your methods</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Choose a primary method and keep at least one backup.
                    </Typography>

                    <Divider />

                    <List disablePadding>
                      {methods.map((m) => {
                        const accent = methodColor(m.key);
                        return (
                          <ListItem
                            key={m.key}
                            sx={{ px: 0, py: 1.1, borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}` }}
                            secondaryAction={
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={m.key === "whatsapp" ? whatsappOutlinedSx : evOrangeOutlinedSx}
                                  onClick={() => markPrimary(m.key)}
                                >
                                  Set primary
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={evOrangeOutlinedSx}
                                  disabled={!m.enabled || m.primary}
                                  onClick={() => disableMethod(m.key)}
                                >
                                  Disable
                                </Button>
                              </Stack>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary }}>
                                {methodIcon(m.key)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                  <Typography sx={{ fontWeight: 950 }}>{m.name}</Typography>
                                  {m.primary ? <Chip size="small" color="info" label="Primary" /> : null}
                                  {m.enabled ? <Chip size="small" color="success" label="Enabled" /> : <Chip size="small" variant="outlined" label="Disabled" />}
                                </Stack>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  Last used: {timeAgo(m.lastUsedAt)}
                                </Typography>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>

                    <Divider />

                    <Alert severity={anyEnabled ? "info" : "warning"}>
                      {anyEnabled
                        ? "Tip: Keep a backup method to avoid lockouts."
                        : "No methods enabled. Use setup to add a method."}
                    </Alert>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={evOrangeContainedSx}
                        startIcon={<ShieldCheckIcon size={18} />}
                        onClick={() => navigate("/app/security/2fa/setup")}
                      >
                        Setup 2FA
                      </Button>
                      <Button
                        variant="outlined"
                        sx={evOrangeOutlinedSx}
                        startIcon={<RefreshIcon size={18} />}
                        onClick={() => navigate("/app/security/recovery-codes")}
                      >
                        Recovery codes
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <Stack spacing={1.2}>
                    <Typography sx={{ fontWeight: 950 }}>Recovery codes</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Regenerate codes if you think they were exposed. Old codes will stop working.
                    </Typography>

                    <Divider />

                    <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                      <Stack spacing={0.6}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Status
                        </Typography>
                        <Typography sx={{ fontWeight: 950 }}>Available</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          View and download from the Recovery Codes page.
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/app/security/recovery-codes")}>
                        View codes
                      </Button>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<RefreshIcon size={18} />} onClick={() => openReauth({ type: "add", payload: "regenerate" })}>
                        Regenerate
                      </Button>
                    </Stack>

                    <Alert severity="info">
                      For safety, regeneration requires re-authentication.
                    </Alert>
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

      {/* Add method dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>Add backup method</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Choose a method to add. You will be redirected to setup.
            </Typography>

            <TextField select label="Method" value={addChoice} onChange={(e) => setAddChoice(e.target.value as MethodKey)} fullWidth>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="authenticator">Authenticator</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
            </TextField>

            <Alert severity="info">WhatsApp becomes available when enabled in your contact settings.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={submitAdd}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Re-auth dialog */}
      <Dialog open={reauthOpen} onClose={closeReauth} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>Confirm it’s you</DialogTitle>
        <DialogContent>
          <Stack spacing={1.4}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              For your security, please re-authenticate to continue.
            </Typography>

            <Tabs
              value={reauthMode === "password" ? 0 : 1}
              onChange={(_, v) => setReauthMode(v === 0 ? "password" : "mfa")}
              variant="fullWidth"
              sx={{
                borderRadius: "4px",
                border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                overflow: "hidden",
                minHeight: 44,
                "& .MuiTab-root": { minHeight: 44, fontWeight: 900 },
                "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 },
              }}
            >
              <Tab icon={<LockIcon size={16} />} iconPosition="start" label="Password" />
              <Tab icon={<KeypadIcon size={16} />} iconPosition="start" label="MFA" />
            </Tabs>

            {reauthMode === "password" ? (
              <TextField
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                label="Password"
                type="password"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon size={18} />
                    </InputAdornment>
                  ),
                }}
                helperText="Enter your current password."
              />
            ) : (
              <>
                <Typography sx={{ fontWeight: 950 }}>Choose a channel</Typography>
                <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {([
                    { c: "Authenticator" as const, icon: <KeypadIcon size={18} />, color: EVZONE.orange },
                    { c: "SMS" as const, icon: <PhoneIcon size={18} />, color: EVZONE.orange },
                    { c: "WhatsApp" as const, icon: <WhatsAppIcon size={18} />, color: WHATSAPP.green },
                    { c: "Email" as const, icon: <ShieldCheckIcon size={18} />, color: EVZONE.orange },
                  ] as const).map((it) => {
                    const selected = mfaChannel === it.c;
                    const base = it.color;
                    return (
                      <Button
                        key={it.c}
                        variant={selected ? "contained" : "outlined"}
                        startIcon={it.icon}
                        onClick={() => { setMfaChannel(it.c); setCodeSent(false); }}
                        sx={
                          selected
                            ? ({ borderRadius: "4px", backgroundColor: base, color: "#FFFFFF", "&:hover": { backgroundColor: alpha(base, 0.92) } } as const)
                            : ({ borderRadius: "4px", borderColor: alpha(base, 0.65), color: base, backgroundColor: alpha(theme.palette.background.paper, 0.25), "&:hover": { borderColor: base, backgroundColor: base, color: "#FFFFFF" } } as const)
                        }
                        fullWidth
                      >
                        {it.c}
                      </Button>
                    );
                  })}
                </Box>



                {mfaChannel !== "Authenticator" && (
                  <Button
                    disabled={cooldown > 0}
                    onClick={requestChallenge}
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2, borderRadius: 3, borderColor: theme.palette.divider }}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : codeSent ? "Resend Code" : "Send Code"}
                  </Button>
                )}

                <TextField
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  label="6-digit code"
                  placeholder="123456"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeypadIcon size={18} />
                      </InputAdornment>
                    ),
                  }}
                  helperText={mfaChannel === "Authenticator" ? "Open Authenticator app" : codeSent ? "Code sent." : "Request a code first"}
                />
              </>
            )}

            {/* Demo alert removed */}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={closeReauth}>
            Cancel
          </Button>
          <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={applyPending}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant={mode === "dark" ? "filled" : "standard"}
          sx={{
            borderRadius: "2px",
            border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
            backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96),
            color: theme.palette.text.primary,
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box >
  );
}
