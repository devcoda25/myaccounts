import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { api } from "@/utils/api";
import { ISession } from "@/types";

/**
 * EVzone My Accounts - Security Overview
 * Route: /app/security
 *
 * Features:
 * - Password status + change CTA
 * - MFA status + setup CTA
 * - Passkeys status (optional)
 * - Recovery options status
 * - Quick "Review devices" CTA
 */

type RoleMode = "User" | "Provider";

type Severity = "info" | "warning" | "error" | "success";

interface ISecurityOverview {
  password: {
    lastChangedDays: number;
    strength: number;
    compromised: boolean;
  };
  mfa: {
    enabled: boolean;
    methods: string[];
    recoveryCodesRemaining: number;
  };
  passkeys: {
    enabled: boolean;
    count: number;
  };
  recovery: {
    verifiedEmails: number;
    verifiedPhones: number;
  };
}

const WHATSAPP = {
  green: "#25D366",
} as const;

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

function KeyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M11 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 12v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 12v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function FingerprintIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 11a3 3 0 0 0-3 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5a7 7 0 0 0-7 7v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5a7 7 0 0 1 7 7v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 14v2a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 14v1a6 6 0 0 1-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
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

function AlertTriangleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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

export default function SecurityOverviewPage() {
  const { t } = useTranslation("common"); {
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

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


  // API Data State
  const [data, setData] = useState<ISecurityOverview | null>(null);
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });


  useEffect(() => {
    Promise.all([
      api<ISecurityOverview>("/security/overview").catch(() => null),
      api<ISession[]>("/auth/sessions").catch(() => [])
    ]).then(([overviewData, sessionsData]: [ISecurityOverview | null, ISession[]]) => {
      setData(overviewData);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setLoading(false);
    });
  }, []);

  // Computed from API data or defaults
  const password = data?.password || { lastChangedDays: 0, strength: 0, compromised: false };
  const mfa = data?.mfa || { enabled: false, methods: [], recoveryCodesRemaining: 0 };
  const passkeys = data?.passkeys || { enabled: false, count: 0 };
  const recovery = data?.recovery || { verifiedEmails: 0, verifiedPhones: 0 };

  // Map sessions to devices list (top 3)
  const devices = useMemo(() => {
    return sessions.slice(0, 3).map((s) => ({
      id: s.id,
      when: s.lastUsedAt ? new Date(s.lastUsedAt).getTime() : 0,
      device: s.deviceInfo?.device || "Unknown Device",
      location: typeof s.deviceInfo?.location === "object" && s.deviceInfo.location
        ? [s.deviceInfo.location.city, s.deviceInfo.location.country].filter(Boolean).join(", ") || "Unknown Location"
        : (s.deviceInfo?.location as string) || "Unknown Location",
      status: "trusted" as const
    }));
  }, [sessions]);

  const passwordStrengthLabel = password.strength <= 2 ? "Weak" : password.strength === 3 ? "Good" : password.strength === 4 ? "Strong" : "Very strong";

  const overallScore = useMemo(() => {
    let score = 0;
    if (password.strength >= 3) score += 35;
    if (mfa.enabled) score += 40;
    if (passkeys.enabled) score += 10;
    if (recovery.verifiedEmails + recovery.verifiedPhones >= 2) score += 15;
    return Math.min(100, score);
  }, [password.strength, mfa.enabled, passkeys.enabled, recovery.verifiedEmails, recovery.verifiedPhones]);

  const riskAlerts = useMemo(() => {
    const arr: Array<{ id: string; severity: Severity; title: string; msg: string; action?: string }> = [];
    if (!mfa.enabled) {
      arr.push({ id: "mfa", severity: "warning", title: "2FA not enabled", msg: "Enable MFA to protect your wallet and account.", action: "Enable MFA" });
    }
    if (password.lastChangedDays > 30) {
      arr.push({ id: "pw", severity: "info", title: "Password aging", msg: `Your password was last changed ${password.lastChangedDays} days ago.`, action: "Change password" });
    }
    arr.push({ id: "sus", severity: "error", title: "Suspicious activity", msg: "We blocked a login attempt from a new device.", action: "Review devices" });
    return arr;
  }, [mfa.enabled, password.lastChangedDays]);

  const navigate = useNavigate();

  const action = (label: string) => {
    if (label === "Change password") {
      navigate("/app/security/change-password");
      return;
    }
    if (label === "Enable MFA") {
      navigate("/app/security/2fa");
      return;
    }
    if (label === "Review devices") {
      navigate("/app/security/sessions");
      return;
    }
    setSnack({ open: true, severity: "info", msg: `${label} (demo).` });
  };

  const mutedCardSx = {
    borderRadius: "4px",
    border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.50),
  } as const;

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>


      {/* Body */}
      <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Stack spacing={2.2}>
            {/* Header */}
            <Card sx={mutedCardSx}>
              <CardContent className="p-5 md:p-6">
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                  <Box>
                    <Typography variant="h5">Security overview</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Manage password, MFA, passkeys, recovery options, and devices.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<LockIcon size={18} />} onClick={() => action("Change password")}>
                      Change password
                    </Button>
                    <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<ShieldCheckIcon size={18} />} onClick={() => action("Enable MFA")}>
                      {mfa.enabled ? "Manage MFA" : "Enable MFA"}
                    </Button>
                    <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<DevicesIcon size={18} />} onClick={() => action("Review devices")}>
                      Review devices
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 950 }}>Security score</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={overallScore}
                    sx={{ height: 10, borderRadius: "4px", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.12 : 0.10), "& .MuiLinearProgress-bar": { backgroundColor: EVZONE.orange, borderRadius: "4px" } }}
                  />
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Higher scores reduce account takeover risk. Enable MFA for the biggest improvement.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Stack spacing={1.2}>
              {riskAlerts.map((a) => (
                <Alert
                  key={a.id}
                  severity={a.severity}
                  icon={<AlertTriangleIcon size={18} />}
                  action={
                    a.action ? (
                      <Button size="small" variant="outlined" sx={evOrangeOutlinedSx} onClick={() => action(a.action!)}>
                        {a.action}
                      </Button>
                    ) : undefined
                  }
                >
                  <b>{a.title}:</b> {a.msg}
                </Alert>
              ))}
            </Stack>

            {/* Status cards */}
            <Box className="grid gap-4 md:grid-cols-2">
              {/* Password */}
              <Card>
                <CardContent className="p-5">
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <LockIcon size={18} />
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontWeight: 950 }}>Password</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Last changed {password.lastChangedDays} days ago
                        </Typography>
                      </Box>
                      <Chip label={passwordStrengthLabel} color={password.strength >= 4 ? "success" : password.strength === 3 ? "info" : "warning"} size="small" />
                    </Stack>

                    {password.compromised ? <Alert severity="error">Password appears in a breach. Change it immediately.</Alert> : null}

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={() => action("Change password")} endIcon={<ArrowRightIcon size={18} />}>
                        Change password
                      </Button>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/app/security/sessions")}>
                        Active sessions
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* MFA */}
              <Card>
                <CardContent className="p-5">
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <ShieldCheckIcon size={18} />
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontWeight: 950 }}>Multi-factor authentication</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {mfa.enabled ? "Enabled" : "Not enabled"}
                        </Typography>
                      </Box>
                      <Chip label={mfa.enabled ? "Enabled" : "Disabled"} color={mfa.enabled ? "success" : "warning"} size="small" />
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {mfa.methods.map((m: string) => (
                        <Chip
                          key={m}
                          label={m}
                          size="small"
                          sx={m === "WhatsApp" ? { border: `1px solid ${alpha(WHATSAPP.green, 0.6)}`, color: WHATSAPP.green, backgroundColor: alpha(WHATSAPP.green, 0.10) } : undefined}
                        />
                      ))}
                      {mfa.recoveryCodesRemaining > 0 ? <Chip label={`${mfa.recoveryCodesRemaining} recovery codes`} size="small" /> : null}
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={() => action("Enable MFA")} endIcon={<ArrowRightIcon size={18} />}>
                        {mfa.enabled ? "Manage MFA" : "Set up MFA"}
                      </Button>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/app/security/recovery-codes")}>
                        Recovery codes
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Passkeys */}
              <Card>
                <CardContent className="p-5">
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <FingerprintIcon size={18} />
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontWeight: 950 }}>Passkeys</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {passkeys.enabled ? `${passkeys.count} passkey(s)` : "Not enabled"}
                        </Typography>
                      </Box>
                      <Chip label={passkeys.enabled ? "Enabled" : "Optional"} size="small" />
                    </Stack>

                    <Alert severity="info">
                      Passkeys provide phishing-resistant sign-in. Optional for now.
                    </Alert>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={() => navigate("/app/security/passkeys")}>
                        Add passkey
                      </Button>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/app/security/passkeys")}>
                        Manage
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Recovery */}
              <Card>
                <CardContent className="p-5">
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                        <KeyIcon size={18} />
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontWeight: 950 }}>Recovery options</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {recovery.verifiedEmails} verified email(s), {recovery.verifiedPhones} verified phone(s)
                        </Typography>
                      </Box>
                      <Chip label={recovery.verifiedEmails + recovery.verifiedPhones >= 2 ? "Good" : "Needs attention"} color={recovery.verifiedEmails + recovery.verifiedPhones >= 2 ? "success" : "warning"} size="small" />
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip size="small" label={`${recovery.verifiedEmails} email`} />
                      <Chip size="small" label={`${recovery.verifiedPhones} phone`} />
                      <Chip
                        size="small"
                        label="WhatsApp"
                        sx={{ border: `1px solid ${alpha(WHATSAPP.green, 0.6)}`, color: WHATSAPP.green, backgroundColor: alpha(WHATSAPP.green, 0.10) }}
                      />
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={() => navigate("/app/profile/contact")}>
                        Manage contacts
                      </Button>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/auth/account-recovery-help")}>
                        Recovery help
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Devices */}
            <Card>
              <CardContent className="p-5 md:p-6">
                <Stack spacing={1.4}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h6">Devices</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Review sign-ins and trusted devices.
                      </Typography>
                    </Box>
                    <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<DevicesIcon size={18} />} onClick={() => action("Review devices")}>
                      Review devices
                    </Button>
                  </Stack>

                  <Divider />

                  <List disablePadding>
                    {devices.map((d) => (
                      <ListItem key={d.id} sx={{ px: 0, py: 1.2, borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}` }} secondaryAction={<Chip label={d.status === "trusted" ? "Trusted" : "Blocked"} color={d.status === "trusted" ? "success" : "error"} size="small" />}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary }}>
                            <DevicesIcon size={18} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
                              <Typography sx={{ fontWeight: 900 }}>{d.device}</Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{timeAgo(d.when)}</Typography>
                            </Stack>
                          }
                          secondary={<Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{d.location}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={() => navigate("/app/security/sessions")}>
                      Manage sessions
                    </Button>
                    <Button variant="outlined" sx={evOrangeOutlinedSx} disabled>
                      Export report
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Box className="mt-2" sx={{ opacity: 0.92 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
            </Box>
          </Stack>
        </motion.div>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
