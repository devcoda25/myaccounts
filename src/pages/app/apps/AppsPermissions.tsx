import React, { useEffect, useMemo, useState } from "react";
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
  IconButton,
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
import { useThemeStore } from "../../../stores/themeStore";
import { EVZONE } from "../../../theme/evzone";

/**
 * EVzone My Accounts - Authorized Apps & Permissions
 * Route: /app/apps/permissions
 */

type Severity = "info" | "warning" | "error" | "success";

type ReAuthMode = "password" | "mfa";

type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

type AppKind = "EVzone" | "Third-party";

type AppPerm = {
  id: string;
  name: string;
  kind: AppKind;
  lastUsedAt?: number;
  scopes: string[];
  revoked: boolean;
};

const WHATSAPP = {
  green: "#25D366",
} as const;

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

function ShieldIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function mfaCodeFor(channel: MfaChannel) {
  if (channel === "Authenticator") return "654321";
  if (channel === "SMS") return "222222";
  if (channel === "WhatsApp") return "333333";
  return "111111";
}

// Self-tests removed

export default function AppsPermissionsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const [apps, setApps] = useState<AppPerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/apps/permissions", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
          }
        });
        if (!res.ok) throw new Error("Failed to load permissions");
        const data = await res.json();
        // Backend returns active consents. Backend does not return "revoked" items usually (they are deleted).
        // But frontend UI has a "Revoked" tab.
        // For now, we only show Active consents from backend.
        setApps(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPerms();
  }, []);

  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const [search, setSearch] = useState("");

  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
  const [reauthPassword, setReauthPassword] = useState("");
  const [mfaChannel, setMfaChannel] = useState<MfaChannel>("Authenticator");
  const [otp, setOtp] = useState("");
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  // Self-tests effect removed


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

  const waOutlined = {
    borderColor: alpha(WHATSAPP.green, 0.75),
    color: WHATSAPP.green,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { borderColor: WHATSAPP.green, backgroundColor: WHATSAPP.green, color: "#FFFFFF" },
  } as const;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps
      .filter((a) => (!q ? true : [a.name, a.kind, a.scopes.join(" ")].some((x) => x.toLowerCase().includes(q))))
      .filter((a) => {
        if (tab === 0) return true;
        if (tab === 1) return !a.revoked;
        return a.revoked;
      })
      .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0));
  }, [apps, search, tab]);

  const openReauthForRevoke = (id: string) => {
    setPendingRevoke(id);
    setReauthMode("password");
    setReauthPassword("");
    setMfaChannel("Authenticator");
    setOtp("");
    setReauthOpen(true);
  };

  const closeReauth = () => {
    setReauthOpen(false);
    setPendingRevoke(null);
  };

  const validateReauth = () => {
    if (reauthMode === "password") {
      if (reauthPassword !== "EVzone123!") {
        setSnack({ open: true, severity: "error", msg: "Re-auth failed. Incorrect password." });
        return false;
      }
      return true;
    }

    if (otp.trim() !== mfaCodeFor(mfaChannel)) {
      setSnack({ open: true, severity: "error", msg: "Re-auth failed. Incorrect code." });
      return false;
    }
    return true;
  };

  const revoke = async () => {
    if (!pendingRevoke) return;
    if (!validateReauth()) return;

    try {
      const res = await fetch(`/api/apps/${pendingRevoke}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        }
      });
      if (!res.ok) throw new Error("Failed to revoke");

      // Update local state to show as revoked
      setApps((prev) => prev.map((a) => (a.id === pendingRevoke ? { ...a, revoked: true } : a)));
      setSnack({ open: true, severity: "success", msg: "Access revoked. You will be logged out of that service." });
      closeReauth();
    } catch (e) {
      setSnack({ open: true, severity: "error", msg: "Failed to revoke access." });
    }
  };

  const restore = (id: string) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, revoked: false, lastUsedAt: Date.now() } : a)));
    setSnack({ open: true, severity: "success", msg: "Access restored (demo)." });
  };

  const avatarFor = (kind: AppKind) => {
    return kind === "EVzone" ? (
      <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, borderRadius: "4px" }}>
        <AppsIcon size={18} />
      </Avatar>
    ) : (
      <Avatar sx={{ bgcolor: alpha(EVZONE.orange, 0.12), color: EVZONE.orange, borderRadius: "4px", border: `1px solid ${alpha(EVZONE.orange, 0.25)}` }}>
        <ShieldIcon size={18} />
      </Avatar>
    );
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
                      <Typography variant="h5">Authorized apps and scopes</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Review and revoke access granted to apps. Revoking logs you out of that service.
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/apps")}>
                        Back to apps
                      </Button>
                      <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<ShieldCheckIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Review security settings (demo)." })}>
                        Security
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}>
                    <Tab label="All" />
                    <Tab label="Active" />
                    <Tab label="Revoked" />
                  </Tabs>

                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    label="Search apps or scopes"
                    placeholder="Search by app name or scope"
                    fullWidth
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>) }}
                  />

                  <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                    Tip: If you see unknown apps, revoke access immediately and review login activity.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>

            <Box className="grid gap-4 md:grid-cols-2">
              {filtered.map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-5">
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        {avatarFor(a.kind)}
                        <Box flex={1}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Typography sx={{ fontWeight: 950 }}>{a.name}</Typography>
                            <Chip size="small" variant="outlined" label={a.kind} />
                            {a.revoked ? <Chip size="small" color="error" label="Revoked" /> : <Chip size="small" color="success" label="Active" />}
                          </Stack>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Last used: {timeAgo(a.lastUsedAt)}
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider />

                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 900 }}>Scopes</Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {a.scopes.slice(0, 8).map((s) => (
                          <Chip key={s} size="small" variant="outlined" label={s} />
                        ))}
                        {a.scopes.length > 8 ? <Chip size="small" variant="outlined" label={`+${a.scopes.length - 8} more`} /> : null}
                      </Box>

                      <Divider />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        {!a.revoked ? (
                          <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<TrashIcon size={18} />} onClick={() => openReauthForRevoke(a.id)}>
                            Revoke access
                          </Button>
                        ) : (
                          <Button variant="contained" color="secondary" sx={orangeContained} onClick={() => restore(a.id)}>
                            Restore
                          </Button>
                        )}
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => setSnack({ open: true, severity: "info", msg: "View app details (demo)." })}>
                          Details
                        </Button>
                      </Stack>

                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Security note: revoking access invalidates refresh tokens and may log you out.
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
                    <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/apps")}>
                      Apps
                    </Button>
                    <Button fullWidth variant="contained" color="secondary" sx={orangeContained} onClick={() => setSnack({ open: true, severity: "info", msg: "Review login activity (demo)." })}>
                      Activity
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

      {/* Re-auth */}
      <Dialog open={reauthOpen} onClose={closeReauth} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>Confirm it’s you</DialogTitle>
        <DialogContent>
          <Stack spacing={1.4}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              For your security, please re-authenticate to revoke app access.
            </Typography>

            <Tabs value={reauthMode === "password" ? 0 : 1} onChange={(_, v) => setReauthMode(v === 0 ? "password" : "mfa")} variant="fullWidth" sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}>
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
                InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon size={18} /></InputAdornment>) }}
                helperText="Demo password: EVzone123!"
              />
            ) : (
              <>
                <Typography sx={{ fontWeight: 950 }}>Choose a channel</Typography>
                <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {([
                    { c: "Authenticator" as const, icon: <KeypadIcon size={18} />, color: EVZONE.orange },
                    { c: "SMS" as const, icon: <SmsIcon size={18} />, color: EVZONE.orange },
                    { c: "WhatsApp" as const, icon: <WhatsAppIcon size={18} />, color: WHATSAPP.green },
                    { c: "Email" as const, icon: <MailIcon size={18} />, color: EVZONE.orange },
                  ] as const).map((it) => {
                    const selected = mfaChannel === it.c;
                    const base = it.color;
                    const outlined = it.c === "WhatsApp" ? waOutlined : orangeOutlined;
                    return (
                      <Button
                        key={it.c}
                        variant={selected ? "contained" : "outlined"}
                        startIcon={it.icon}
                        onClick={() => setMfaChannel(it.c)}
                        sx={
                          selected
                            ? ({ borderRadius: "4px", backgroundColor: base, color: "#FFFFFF", "&:hover": { backgroundColor: alpha(base, 0.92) } } as const)
                            : ({ ...outlined, borderRadius: "4px" } as const)
                        }
                        fullWidth
                      >
                        {it.c}
                      </Button>
                    );
                  })}
                </Box>

                <TextField
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  label="6-digit code"
                  placeholder="123456"
                  fullWidth
                  InputProps={{ startAdornment: (<InputAdornment position="start"><KeypadIcon size={18} /></InputAdornment>) }}
                  helperText={`Demo code for ${mfaChannel}: ${mfaCodeFor(mfaChannel)}`}
                />
              </>
            )}

            <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
              This is a demo re-auth flow.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={orangeOutlined} onClick={closeReauth}>Cancel</Button>
          <Button variant="contained" color="secondary" sx={orangeContained} onClick={revoke}>Continue</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
