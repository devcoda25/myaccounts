import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Delete / Deactivate Account
 * Route: /app/privacy/delete-account
 *
 * Features:
 * • Warnings about impact across EVzone apps
 * • Re-auth required
 * • Optional cooling-off period (7-14 days)
 * • Confirmation and final status page
 */

type ThemeMode = "light" | "dark";
type Severity = "info" | "warning" | "error" | "success";

type ActionType = "deactivate" | "delete";

type ReAuthMode = "password" | "mfa";

type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

type FlowState = "form" | "submitted" | "cancelled";

type Schedule = {
  action: ActionType;
  requestedAt: number;
  effectiveAt: number;
  coolingDays: number;
};

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const WHATSAPP = {
  green: "#25D366",
} as const;

const THEME_KEY = "evzone_myaccounts_theme";

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

function AlertTriangleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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

function PauseIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="7" y="5" width="3" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="3" height="14" rx="1" fill="currentColor" />
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
      error: { main: "#B42318" },
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
function mfaCodeFor(channel: MfaChannel) {
  if (channel === "Authenticator") return "654321";
  if (channel === "SMS") return "222222";
  if (channel === "WhatsApp") return "333333";
  return "111111";
}

function addDays(ts: number, days: number) {
  return ts + days * 24 * 60 * 60 * 1000;
}

function fmt(ts: number) {
  return new Date(ts).toLocaleString();
}

// --- self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_DELETE_ACCOUNT_TESTS_RAN__) return;
    w.__EVZONE_DELETE_ACCOUNT_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("mfa", mfaCodeFor("WhatsApp") === "333333");
    assert("addDays", addDays(0, 7) === 7 * 24 * 60 * 60 * 1000);

  } catch (e) {
    // ignore
  }
}

export default function DeleteDeactivateAccountPage() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const navigate = useNavigate();
  const isDark = mode === "dark";

  const [flow, setFlow] = useState<FlowState>("form");
  const [action, setAction] = useState<ActionType>("deactivate");
  const [coolingDays, setCoolingDays] = useState<number>(14);

  // confirmations
  const [ackDataLoss, setAckDataLoss] = useState(false);
  const [ackWallet, setAckWallet] = useState(false);
  const [ackOrgs, setAckOrgs] = useState(false);

  // re-auth dialog
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
  const [password, setPassword] = useState("");
  const [mfaChannel, setMfaChannel] = useState<MfaChannel>("SMS");
  const [otp, setOtp] = useState("");

  const [schedule, setSchedule] = useState<Schedule | null>(null);

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

  const dangerContained = {
    backgroundColor: "#B42318",
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha("#B42318", mode === "dark" ? 0.35 : 0.18)}`,
    "&:hover": { backgroundColor: alpha("#B42318", 0.92), color: "#FFFFFF" },
  } as const;

  const canProceed = useMemo(() => {
    if (action === "deactivate") return ackDataLoss && ackWallet;
    return ackDataLoss && ackWallet && ackOrgs;
  }, [action, ackDataLoss, ackWallet, ackOrgs]);

  const openReauth = () => {
    if (!canProceed) {
      setSnack({ open: true, severity: "warning", msg: "Please confirm the impact checkboxes first." });
      return;
    }
    setPassword("");
    setOtp("");
    setReauthMode("password");
    setMfaChannel("SMS");
    setReauthOpen(true);
  };

  const closeReauth = () => setReauthOpen(false);

  const submit = () => {
    // validate reauth
    if (reauthMode === "password") {
      if (password !== "EVzone123!") {
        setSnack({ open: true, severity: "error", msg: "Re-auth failed. Incorrect password." });
        return;
      }
    } else {
      if (otp.trim() !== mfaCodeFor(mfaChannel)) {
        setSnack({ open: true, severity: "error", msg: "Re-auth failed. Incorrect code." });
        return;
      }
    }

    const now = Date.now();
    const effectiveAt = action === "deactivate" ? now : addDays(now, coolingDays);
    setSchedule({ action, requestedAt: now, effectiveAt, coolingDays });
    setFlow("submitted");
    setReauthOpen(false);

    setSnack({ open: true, severity: "success", msg: action === "deactivate" ? "Account deactivated (demo)." : "Deletion scheduled (demo)." });
  };

  const cancelDeletion = () => {
    setFlow("cancelled");
    setSnack({ open: true, severity: "success", msg: "Deletion request cancelled (demo)." });
  };

  const impacts = [
    { t: "Sign-in", d: "You may lose access to EVzone apps on this account." },
    { t: "Wallet", d: "Withdraw funds and settle disputes before deleting." },
    { t: "Charging", d: "History and receipts may be removed or anonymized." },
    { t: "Marketplace", d: "Orders, returns, and seller records may be impacted." },
    { t: "Organizations", d: "You may be removed from organizations and roles." },
  ];

  const statusCard = () => {
    if (!schedule) return null;

    if (flow === "cancelled") {
      return (
        <Card>
          <CardContent className="p-5 md:p-7">
            <Stack spacing={1.2}>
              <Typography variant="h6">Request cancelled</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                No further account changes are scheduled.
              </Typography>
              <Divider />
              <Button variant="contained" sx={orangeContained} onClick={() => setFlow("form")}>Back</Button>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    if (schedule.action === "deactivate") {
      return (
        <Card>
          <CardContent className="p-5 md:p-7">
            <Stack spacing={1.2}>
              <Typography variant="h6">Account deactivated</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Effective immediately: {fmt(schedule.effectiveAt)}
              </Typography>
              <Divider />
              <Alert severity="info" icon={<ShieldIcon size={18} />}>
                You can reactivate by signing in again (demo behavior).
              </Alert>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <Button variant="contained" sx={orangeContained} onClick={() => navigate('/auth/sign-in')}>
                  Reactivate by sign-in
                </Button>
                <Button variant="outlined" sx={orangeOutlined} onClick={() => setFlow("form")}>
                  Back to settings
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    // delete
    return (
      <Card>
        <CardContent className="p-5 md:p-7">
          <Stack spacing={1.2}>
            <Typography variant="h6">Deletion scheduled</Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Requested: {fmt(schedule.requestedAt)}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Deletion date: {fmt(schedule.effectiveAt)} (cooling-off: {schedule.coolingDays} days)
            </Typography>

            <Divider />

            <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
              You can cancel within the cooling-off period.
            </Alert>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button variant="contained" sx={dangerContained} onClick={cancelDeletion}>
                Cancel deletion
              </Button>
              <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/privacy/download')}>
                Download my data
              </Button>
            </Stack>

            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              This is a demo UI. Real deletion requires backend workflows and legal compliance.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const banner = (
    <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
      Deleting or deactivating affects all EVzone apps. Read the impact carefully.
    </Alert>
  );

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
                    <Typography variant="h5">Delete or deactivate account</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Choose what to do with your EVzone account. Deactivate is reversible. Delete is permanent after cooling-off.
                    </Typography>
                    {banner}
                  </Stack>
                </CardContent>
              </Card>

              {flow !== "form" ? statusCard() : (
                <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                  <Box className="md:col-span-7">
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.4}>
                          <Typography variant="h6">Choose an option</Typography>
                          <Divider />

                          <Tabs
                            value={action === "deactivate" ? 0 : 1}
                            onChange={(_, v) => setAction(v === 0 ? "deactivate" : "delete")}
                            variant="fullWidth"
                            sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
                          >
                            <Tab icon={<PauseIcon size={16} />} iconPosition="start" label="Deactivate" />
                            <Tab icon={<TrashIcon size={16} />} iconPosition="start" label="Delete" />
                          </Tabs>

                          {action === "deactivate" ? (
                            <Alert severity="info" icon={<ShieldIcon size={18} />}>
                              Deactivation temporarily disables sign-in. You can reactivate later.
                            </Alert>
                          ) : (
                            <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
                              Deletion removes your account across EVzone apps after the cooling-off period.
                            </Alert>
                          )}

                          {action === "delete" ? (
                            <TextField
                              select
                              label="Cooling-off period"
                              value={coolingDays}
                              onChange={(e) => setCoolingDays(Number(e.target.value))}
                              fullWidth
                              helperText="You can cancel within this period."
                            >
                              <MenuItem value={7}>7 days</MenuItem>
                              <MenuItem value={14}>14 days</MenuItem>
                            </TextField>
                          ) : null}

                          <Divider />

                          <Typography sx={{ fontWeight: 950 }}>Confirm impact</Typography>
                          <FormControlLabel
                            control={<Checkbox checked={ackDataLoss} onChange={(e) => setAckDataLoss(e.target.checked)} />}
                            label={<Typography sx={{ fontWeight: 900 }}>I understand this affects all EVzone apps</Typography>}
                          />
                          <FormControlLabel
                            control={<Checkbox checked={ackWallet} onChange={(e) => setAckWallet(e.target.checked)} />}
                            label={<Typography sx={{ fontWeight: 900 }}>I checked wallet balance and pending disputes</Typography>}
                          />
                          {action === "delete" ? (
                            <FormControlLabel
                              control={<Checkbox checked={ackOrgs} onChange={(e) => setAckOrgs(e.target.checked)} />}
                              label={<Typography sx={{ fontWeight: 900 }}>I understand organizations and roles may be removed</Typography>}
                            />
                          ) : null}

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" sx={dangerContained} startIcon={<LockIcon size={18} />} onClick={openReauth}>
                              Continue (re-auth)
                            </Button>
                            <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/privacy/download')}>
                              Download my data
                            </Button>
                          </Stack>

                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            This is a demo page. Real flows must comply with local regulations.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box className="md:col-span-5">
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">What will be impacted</Typography>
                          <Divider />
                          <Stack spacing={1.0}>
                            {impacts.map((x) => (
                              <Box key={x.t} sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.1 }}>
                                <Typography sx={{ fontWeight: 950 }}>{x.t}</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{x.d}</Typography>
                              </Box>
                            ))}
                          </Stack>
                          <Divider />
                          <Alert severity="info" icon={<ShieldIcon size={18} />}>
                            Need help? Contact support before deleting.
                          </Alert>
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/support')}>
                            Contact support
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              )}

              {/* Mobile sticky */}
              {flow === "form" ? (
                <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                  <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                    <CardContent sx={{ py: 1.1, px: 1.2 }}>
                      <Stack direction="row" spacing={1}>
                        <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => navigate('/app/privacy/download')}>
                          Data
                        </Button>
                        <Button fullWidth variant="contained" sx={dangerContained} onClick={openReauth}>
                          Continue
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              ) : null}

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
              </Box>
            </Stack>
          </motion.div>
        </Box>

        {/* Re-auth dialog */}
        <Dialog open={reauthOpen} onClose={closeReauth} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Confirm it’s you</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                This is a sensitive action. Please re-authenticate.
              </Typography>

              <Tabs
                value={reauthMode === "password" ? 0 : 1}
                onChange={(_, v) => setReauthMode(v === 0 ? "password" : "mfa")}
                variant="fullWidth"
                sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
              >
                <Tab icon={<LockIcon size={16} />} iconPosition="start" label="Password" />
                <Tab icon={<KeypadIcon size={16} />} iconPosition="start" label="MFA" />
              </Tabs>

              {reauthMode === "password" ? (
                <TextField
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                      return (
                        <Button
                          key={it.c}
                          variant={selected ? "contained" : "outlined"}
                          startIcon={it.icon}
                          onClick={() => setMfaChannel(it.c)}
                          sx={
                            selected
                              ? ({ borderRadius: 14, backgroundColor: base, color: "#FFFFFF", "&:hover": { backgroundColor: alpha(base, 0.92) } } as const)
                              : ({ borderRadius: 14, borderColor: alpha(base, 0.65), color: base, backgroundColor: alpha(theme.palette.background.paper, 0.25), "&:hover": { borderColor: base, backgroundColor: base, color: "#FFFFFF" } } as const)
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

              <Alert severity="info" icon={<ShieldIcon size={18} />}>
                This is a demo re-auth flow.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={closeReauth}>Cancel</Button>
            <Button variant="contained" sx={dangerContained} onClick={submit}>Confirm</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
