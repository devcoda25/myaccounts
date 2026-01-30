import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
  MenuItem,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
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
 * EVzone My Accounts - Report a Security Issue
 * Route: /app/support/security
 *
 * Features:
 * • Report suspicious login
 * • Report compromised account
 * • Emergency action: “Lock my account” (optional)
 */

type ThemeMode = "light" | "dark";
type Severity = "info" | "warning" | "error" | "success";

type SuspiciousReason = "Unknown device" | "Unknown location" | "Unexpected password change" | "Other";

type CompromiseReason = "I lost my phone" | "I was phished" | "Someone changed my email" | "Other";

type LoginEvent = {
  id: string;
  when: number;
  device: string;
  location: string;
  ipMasked: string;
  status: "Success" | "Failed";
};

// -----------------------------
// Inline icons
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

function ShieldIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function FingerprintIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 11a3 3 0 0 1 3 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 14v2a6 6 0 0 0 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 14v2a9 9 0 0 0 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7a7 7 0 0 1 7 7v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 7a7 7 0 0 0-7 7v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function DeviceIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}


import { useNavigate } from "react-router-dom";

export default function ReportSecurityIssuePage() {
  const { t } = useTranslation("common"); {
  const { mode } = useThemeStore();
  const theme = useTheme();
  const navigate = useNavigate();

  const [tab, setTab] = useState<0 | 1>(0);
  const [locked, setLocked] = useState(false);
  const [lockDialog, setLockDialog] = useState(false);

  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await api.get<any[]>("/security/activity");
        const mapped: LoginEvent[] = data
          .filter((l) => l.action === "login" || l.action === "login_failure" || l.action === "otp_login")
          .map((l) => ({
            id: l.id,
            when: new Date(l.createdAt).getTime(),
            device: l.details?.device || "Unknown Device",
            location: l.details?.location ? `${l.details.location.city || ""}, ${l.details.location.country || "Unknown"}` : "Unknown Location",
            ipMasked: l.ipAddress || "Unknown IP",
            status: l.action === "login_failure" ? "Failed" : "Success",
          }));
        setEvents(mapped);
      } catch (e) {
        console.error("Failed to fetch activity", e);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  // Suspicious login form
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [susReason, setSusReason] = useState<SuspiciousReason>("Unknown device");
  const [susDetails, setSusDetails] = useState("");
  const [susConfirm, setSusConfirm] = useState(true);

  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0].id);
    }
  }, [events, selectedEvent]);

  // Compromised account form
  const [compReason, setCompReason] = useState<CompromiseReason>("I was phished");
  const [compEmail, setCompEmail] = useState("ronald.isabirye@gmail.com");
  const [compDetails, setCompDetails] = useState("");
  const [actionPwd, setActionPwd] = useState(false);
  const [action2fa, setAction2fa] = useState(false);
  const [actionSessions, setActionSessions] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });


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

  const dangerContained = {
    backgroundColor: "#B42318",
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha("#B42318", mode === "dark" ? 0.35 : 0.18)}`,
    "&:hover": { backgroundColor: alpha("#B42318", 0.92), color: "#FFFFFF" },
    borderRadius: "4px",
  } as const;

  const selected = events.find((e) => e.id === selectedEvent) || events[0];

  const submitSuspicious = async () => {
    if (locked) {
      setSnack({ open: true, severity: "warning", msg: "Account is locked. Contact support to proceed." });
      return;
    }
    if (susDetails.trim().length < 10) {
      setSnack({ open: true, severity: "warning", msg: "Please provide details (at least 10 characters)." });
      return;
    }

    try {
      await api.post('/support/security/reports', {
        type: 'SUSPICIOUS_LOGIN',
        description: susDetails,
        metadata: {
          eventId: selectedEvent,
          reason: susReason,
          event: selected
        }
      });
      setSnack({ open: true, severity: "success", msg: "Report submitted. Our team will review it." });
      setSusDetails("");
    } catch (e) {
      setSnack({ open: true, severity: "error", msg: "Failed to submit report." });
    }
  };

  const submitCompromised = async () => {
    if (locked) {
      setSnack({ open: true, severity: "warning", msg: "Account is locked. Contact support to proceed." });
      return;
    }
    if (compDetails.trim().length < 10) {
      setSnack({ open: true, severity: "warning", msg: "Please provide details (at least 10 characters)." });
      return;
    }

    try {
      await api.post('/support/security/reports', {
        type: 'COMPROMISED_ACCOUNT',
        description: compDetails,
        metadata: {
          reason: compReason,
          contactEmail: compEmail,
          actionsTaken: {
            changedPassword: actionPwd,
            enabled2fa: action2fa,
            reviewedSessions: actionSessions
          }
        }
      });
      setSnack({ open: true, severity: "success", msg: "Compromise report submitted." });
      setCompDetails("");
    } catch (e) {
      setSnack({ open: true, severity: "error", msg: "Failed to submit report." });
    }
  };

  const lockNow = async () => {
    try {
      await api.post('/security/lock', {});
      setLocked(true);
      setLockDialog(false);
      setSnack({ open: true, severity: "success", msg: "Account locked and sessions revoked." });

      // Optionally redirect to login or force logout handling
      // setTimeout(() => window.location.href = '/login', 2000);
    } catch (e) {
      setSnack({ open: true, severity: "error", msg: "Failed to lock account." });
    }
  };

  const steps = ["Submit", "Review", "Action", "Resolved"];

  return (
    <>
      <CssBaseline />

      <Box className="min-h-screen" sx={{ background: pageBg }}>


        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">Report a security issue</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Use this form to report suspicious login activity or a compromised account.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" variant="outlined" icon={<ShieldIcon size={16} />} label="Audit logged" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          {locked ? <Chip size="small" color="error" label="Account locked" /> : <Chip size="small" color="success" label="Account active" />}
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/security/activity')}>
                          View login activity
                        </Button>
                        <Button variant="contained" sx={dangerContained} startIcon={<LockIcon size={18} />} onClick={() => setLockDialog(true)}>
                          Lock my account
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
                      If you suspect compromise, lock your account and change your password immediately.
                    </Alert>

                    {/* Review step */}
                    <Stepper activeStep={1} alternativeLabel>
                      {steps.map((s) => (
                        <Step key={s}>
                          <StepLabel>{s}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>

                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}>
                      <Tab label="Suspicious login" />
                      <Tab label="Compromised account" />
                    </Tabs>
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Form */}
                <Box className="md:col-span-7">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      {loading ? (
                        <Typography>Loading activity...</Typography>
                      ) : tab === 0 ? (
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Report suspicious login</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Choose a login event and tell us why it looks suspicious.
                          </Typography>
                          <Divider />

                          <TextField select label="Login event" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} fullWidth>
                            {events.map((ev) => (
                              <MenuItem key={ev.id} value={ev.id}>
                                {new Date(ev.when).toLocaleString()} • {ev.device} • {ev.location} • {ev.status}
                              </MenuItem>
                            ))}
                          </TextField>

                          <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                            <Stack spacing={0.5}>
                              <Row label="Device" value={selected.device} icon={<DeviceIcon size={18} />} />
                              <Row label="Location" value={selected.location} icon={<GlobeIcon size={18} />} />
                              <Row label="IP" value={selected.ipMasked} icon={<ShieldIcon size={18} />} />
                              <Row label="When" value={timeAgo(selected.when)} icon={<ClockIcon size={18} />} />
                            </Stack>
                          </Box>

                          <TextField select label="Reason" value={susReason} onChange={(e) => setSusReason(e.target.value as SuspiciousReason)} fullWidth>
                            {(["Unknown device", "Unknown location", "Unexpected password change", "Other"] as SuspiciousReason[]).map((r) => (
                              <MenuItem key={r} value={r}>
                                {r}
                              </MenuItem>
                            ))}
                          </TextField>

                          <TextField label="Details" value={susDetails} onChange={(e) => setSusDetails(e.target.value)} placeholder="Explain what you noticed" fullWidth multiline minRows={4} />

                          <FormControlLabel control={<Checkbox checked={susConfirm} onChange={(e) => setSusConfirm(e.target.checked)} />} label={<Typography sx={{ fontWeight: 900 }}>I confirm this was not me</Typography>} />

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" sx={orangeContained} startIcon={<ShieldIcon size={18} />} onClick={submitSuspicious} disabled={locked}>
                              Submit report
                            </Button>
                            <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/security/sessions')} disabled={locked}>
                              Review sessions
                            </Button>
                          </Stack>

                          <Alert severity="info" icon={<FingerprintIcon size={18} />}>
                            After reporting, consider enabling 2FA and reviewing trusted devices.
                          </Alert>
                        </Stack>
                      ) : (
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Report compromised account</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Tell us what happened. We can help secure your account.
                          </Typography>
                          <Divider />

                          <TextField select label="What happened" value={compReason} onChange={(e) => setCompReason(e.target.value as CompromiseReason)} fullWidth>
                            {(["I lost my phone", "I was phished", "Someone changed my email", "Other"] as CompromiseReason[]).map((r) => (
                              <MenuItem key={r} value={r}>
                                {r}
                              </MenuItem>
                            ))}
                          </TextField>

                          <TextField label="Contact email" value={compEmail} onChange={(e) => setCompEmail(e.target.value)} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><MailIcon size={18} /></InputAdornment>) }} />

                          <TextField label="Details" value={compDetails} onChange={(e) => setCompDetails(e.target.value)} placeholder="Include when it happened and what changed" fullWidth multiline minRows={4} />

                          <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                            <Typography sx={{ fontWeight: 950 }}>Actions taken</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Stack spacing={0.6}>
                              <FormControlLabel control={<Checkbox checked={actionPwd} onChange={(e) => setActionPwd(e.target.checked)} />} label={<Typography sx={{ fontWeight: 900 }}>Changed password</Typography>} />
                              <FormControlLabel control={<Checkbox checked={action2fa} onChange={(e) => setAction2fa(e.target.checked)} />} label={<Typography sx={{ fontWeight: 900 }}>Enabled 2FA</Typography>} />
                              <FormControlLabel control={<Checkbox checked={actionSessions} onChange={(e) => setActionSessions(e.target.checked)} />} label={<Typography sx={{ fontWeight: 900 }}>Reviewed active sessions</Typography>} />
                            </Stack>
                          </Box>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" sx={orangeContained} startIcon={<ShieldIcon size={18} />} onClick={submitCompromised} disabled={locked}>
                              Submit report
                            </Button>
                            <Button variant="contained" sx={greenContained} onClick={() => navigate('/app/security/change-password')} disabled={locked}>
                              Change password
                            </Button>
                            <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/security/2fa/setup')} disabled={locked}>
                              Enable 2FA
                            </Button>
                          </Stack>

                          <Alert severity="info" icon={<ShieldIcon size={18} />}>
                            If you cannot access your email or phone, use account recovery.
                          </Alert>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Box>

                {/* Right: Quick actions */}
                <Box className="md:col-span-5">
                  <Stack spacing={2.2}>
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Quick actions</Typography>
                          <Divider />
                          <Button variant="contained" sx={greenContained} onClick={() => navigate('/app/security/change-password')}>
                            Change Password
                          </Button>
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/security/sessions')}>
                            Sign out devices
                          </Button>
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/security/2fa/setup')}>
                            Enable 2FA
                          </Button>
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate('/auth/account-recovery-help')}>
                            Account recovery help
                          </Button>

                          <Alert severity="info" icon={<ShieldIcon size={18} />}>
                            Locking your account signs out all sessions.
                          </Alert>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">What happens after you report</Typography>
                          <Divider />
                          <Stepper activeStep={1} orientation="vertical">
                            {steps.map((s) => (
                              <Step key={s}>
                                <StepLabel>{s}</StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            This is a demo UI. In production, reports generate a case ID and SLA.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </Box>

              {/* Mobile sticky */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/security/activity')}>
                        Activity
                      </Button>
                      <Button fullWidth variant="contained" sx={dangerContained} onClick={() => setLockDialog(true)}>
                        Lock
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

        {/* Lock dialog */}
        <Dialog open={lockDialog} onClose={() => setLockDialog(false)} PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Lock my account</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                This signs you out everywhere and blocks sign-in until support verifies you.
              </Typography>
              <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
                Use this if you believe someone has access to your account.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setLockDialog(false)}>
              Cancel
            </Button>
            <Button variant="contained" sx={dangerContained} startIcon={<LockIcon size={18} />} onClick={lockNow}>
              Lock account
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 28, height: 28, borderRadius: 12, display: "grid", placeItems: "center", backgroundColor: "rgba(3,205,140,0.10)", border: "1px solid rgba(0,0,0,0.08)" }}>
          {icon}
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ fontWeight: 950 }}>{value}</Typography>
    </Stack>
  );
}
