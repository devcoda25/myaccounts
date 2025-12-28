import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";
import { EVZONE } from "../../../theme/evzone";

/**
 * EVzone My Accounts - Notification Preferences
 * Route: /app/notifications
 *
 * Features:
 * • Security alerts (recommended always on)
 * • Product updates
 * • Marketing
 * • Channels: email/SMS/push (push later)
 */

type Severity = "info" | "warning" | "error" | "success";

type Digest = "Instant" | "Daily" | "Weekly";

type Channels = {
  email: boolean;
  sms: boolean;
  push: boolean; // push later
};

type NotifPrefs = {
  security: Channels;
  product: Channels;
  marketing: Channels;
  productDigest: Digest;
  marketingDigest: Digest;
  quietHoursEnabled: boolean;
  quietStart: string; // HH:MM
  quietEnd: string; // HH:MM
};

const PREFS_KEY = "evzone_myaccounts_notif_prefs_v1";

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

function GlobeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function SparklesIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l1.5 5L19 8.5l-5.5 1.5L12 15l-1.5-5L5 8.5 10.5 7 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 14l.8 2.6L23 17.4l-2.2.8L20 21l-.8-2.8L17 17.4l2.2-.8L20 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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
// Storage + helpers
// -----------------------------
function safeLoadPrefs(): NotifPrefs {
  const recommended: NotifPrefs = {
    security: { email: true, sms: true, push: false },
    product: { email: true, sms: false, push: false },
    marketing: { email: false, sms: false, push: false },
    productDigest: "Instant",
    marketingDigest: "Weekly",
    quietHoursEnabled: false,
    quietStart: "22:00",
    quietEnd: "06:00",
  };

  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return recommended;
    const parsed = JSON.parse(raw) as Partial<NotifPrefs>;
    return {
      ...recommended,
      ...parsed,
      security: { ...recommended.security, ...(parsed.security || {}) },
      product: { ...recommended.product, ...(parsed.product || {}) },
      marketing: { ...recommended.marketing, ...(parsed.marketing || {}) },
    };
  } catch {
    return recommended;
  }
}

function safeSavePrefs(p: NotifPrefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function countEnabled(c: Channels) {
  return (c.email ? 1 : 0) + (c.sms ? 1 : 0) + (c.push ? 1 : 0);
}

export default function NotificationPreferencesPage() {
  const { mode } = useThemeContext();
  const theme = useTheme();
  const isDark = mode === "dark";

  const [prefs, setPrefs] = useState<NotifPrefs>(() => safeLoadPrefs());
  const [dirty, setDirty] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    // Auto-save lightly, but keep a Save CTA
    if (!dirty) return;
    const t = window.setTimeout(() => safeSavePrefs(prefs), 650);
    return () => window.clearTimeout(t);
  }, [prefs, dirty]);

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    borderRadius: "4px",
    boxShadow: `0 4px 12px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    borderRadius: "4px",
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const setChannel = (key: keyof NotifPrefs, channel: keyof Channels, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: { ...(prev as any)[key], [channel]: value } } as NotifPrefs;

      // Security alerts: always on, require at least one channel (push is disabled)
      if (key === "security") {
        const channels = next.security;
        const enforced = { ...channels, push: false };
        if (!enforced.email && !enforced.sms) {
          // Keep email on by default
          enforced.email = true;
          setSnack({ open: true, severity: "warning", msg: "Security alerts require at least one channel." });
        }
        next.security = enforced;
      }

      return next;
    });
    setDirty(true);
  };

  const setDigest = (key: "productDigest" | "marketingDigest", value: Digest) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const saveNow = () => {
    safeSavePrefs(prefs);
    setDirty(false);
    setSnack({ open: true, severity: "success", msg: "Notification preferences saved." });
  };

  const resetRecommended = () => {
    const next = safeLoadPrefs();
    // safeLoadPrefs returns stored or default; build a strict recommended
    const recommended: NotifPrefs = {
      security: { email: true, sms: true, push: false },
      product: { email: true, sms: false, push: false },
      marketing: { email: false, sms: false, push: false },
      productDigest: "Instant",
      marketingDigest: "Weekly",
      quietHoursEnabled: false,
      quietStart: "22:00",
      quietEnd: "06:00",
    };
    setPrefs({ ...next, ...recommended });
    setDirty(true);
    setSnack({ open: true, severity: "info", msg: "Applied recommended settings." });
  };

  const securitySummary = `${prefs.security.email ? "Email" : ""}${prefs.security.email && prefs.security.sms ? ", " : ""}${prefs.security.sms ? "SMS" : ""}` || "Email";

  const banner = (
    <Alert severity="info" icon={<ShieldIcon size={18} />}>
      Security alerts are recommended always on. Push notifications will be available later.
    </Alert>
  );

  const ChannelRow = ({
    label,
    desc,
    icon,
    value,
    onChange,
    disabled,
    suffix,
  }: {
    label: string;
    desc: string;
    icon: React.ReactNode;
    value: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    suffix?: React.ReactNode;
  }) => {
    return (
      <Box
        sx={{
          borderRadius: "4px",
          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.45),
          p: 1.2,
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.1} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "4px",
                display: "grid",
                placeItems: "center",
                backgroundColor: alpha(EVZONE.green, 0.12),
                border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
                {suffix}
              </Stack>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {desc}
              </Typography>
            </Box>
          </Stack>

          <Switch checked={value} onChange={(e) => onChange(e.target.checked)} disabled={!!disabled} color="primary" />
        </Stack>
      </Box>
    );
  };

  return (
    <>
      <Box className="min-h-screen" sx={{ background: pageBg }}>


        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card sx={{ borderRadius: "4px" }}>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">Notification preferences</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Choose what you receive and how. Security alerts are recommended always on.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" icon={<ShieldIcon size={16} />} label={`Security: ${securitySummary}`} variant="outlined" sx={{ borderRadius: "4px", "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" icon={<SparklesIcon size={16} />} label={`Product: ${countEnabled(prefs.product) ? "On" : "Off"}`} variant="outlined" sx={{ borderRadius: "4px", "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" icon={<BellIcon size={16} />} label={`Marketing: ${countEnabled(prefs.marketing) ? "On" : "Off"}`} variant="outlined" sx={{ borderRadius: "4px", "& .MuiChip-icon": { color: "inherit" } }} />
                          {dirty ? <Chip size="small" color="warning" label="Unsaved changes" sx={{ borderRadius: "4px" }} /> : <Chip size="small" color="success" label="Saved" sx={{ borderRadius: "4px" }} />}
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={resetRecommended}>
                          Reset to recommended
                        </Button>
                        <Button variant="contained" sx={orangeContained} onClick={saveNow}>
                          Save
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    {banner}
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Security */}
                <Box className="md:col-span-6">
                  <Card sx={{ borderRadius: "4px" }}>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ShieldIcon size={18} />
                          <Typography variant="h6">Security alerts</Typography>
                          <Chip size="small" color="success" label="Always on" sx={{ borderRadius: "4px" }} />
                        </Stack>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Suspicious login, password changes, new device sign-in.
                        </Typography>
                        <Divider />

                        <ChannelRow
                          label="Email"
                          desc="Recommended for detailed alerts."
                          icon={<MailIcon size={18} />}
                          value={prefs.security.email}
                          onChange={(v) => setChannel("security", "email", v)}
                        />
                        <ChannelRow
                          label="SMS"
                          desc="Fast alerts for urgent security events."
                          icon={<SmsIcon size={18} />}
                          value={prefs.security.sms}
                          onChange={(v) => setChannel("security", "sms", v)}
                        />
                        <ChannelRow
                          label="Push"
                          desc="Mobile push notifications (coming soon)."
                          icon={<PhoneIcon size={18} />}
                          value={false}
                          onChange={() => { }}
                          disabled
                          suffix={<Chip size="small" variant="outlined" label="Later" sx={{ borderRadius: "4px" }} />}
                        />

                        <Alert severity="info" icon={<ShieldIcon size={18} />}>
                          Minimum one channel required.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Product */}
                <Box className="md:col-span-6">
                  <Card sx={{ borderRadius: "4px" }}>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <SparklesIcon size={18} />
                          <Typography variant="h6">Product updates</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          New features, release notes, service upgrades.
                        </Typography>
                        <Divider />

                        <ChannelRow
                          label="Email"
                          desc="Release notes and product announcements."
                          icon={<MailIcon size={18} />}
                          value={prefs.product.email}
                          onChange={(v) => {
                            setPrefs((p) => ({ ...p, product: { ...p.product, email: v, push: false } }));
                            setDirty(true);
                          }}
                        />
                        <ChannelRow
                          label="SMS"
                          desc="Short important updates only."
                          icon={<SmsIcon size={18} />}
                          value={prefs.product.sms}
                          onChange={(v) => {
                            setPrefs((p) => ({ ...p, product: { ...p.product, sms: v, push: false } }));
                            setDirty(true);
                          }}
                        />
                        <ChannelRow
                          label="Push"
                          desc="Mobile push notifications (coming soon)."
                          icon={<PhoneIcon size={18} />}
                          value={false}
                          onChange={() => { }}
                          disabled
                          suffix={<Chip size="small" variant="outlined" label="Later" sx={{ borderRadius: "4px" }} />}
                        />

                        <TextField select label="Delivery" value={prefs.productDigest} onChange={(e) => setDigest("productDigest", e.target.value as Digest)} fullWidth>
                          {(["Instant", "Daily", "Weekly"] as Digest[]).map((d) => (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Marketing */}
                <Box className="md:col-span-7">
                  <Card sx={{ borderRadius: "4px" }}>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <BellIcon size={18} />
                          <Typography variant="h6">Marketing</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Promotions, partner offers, events. You can opt out anytime.
                        </Typography>
                        <Divider />

                        <ChannelRow
                          label="Email"
                          desc="Offers and announcements (recommended off by default)."
                          icon={<MailIcon size={18} />}
                          value={prefs.marketing.email}
                          onChange={(v) => {
                            setPrefs((p) => ({ ...p, marketing: { ...p.marketing, email: v, push: false } }));
                            setDirty(true);
                          }}
                        />
                        <ChannelRow
                          label="SMS"
                          desc="Limited promotions only."
                          icon={<SmsIcon size={18} />}
                          value={prefs.marketing.sms}
                          onChange={(v) => {
                            setPrefs((p) => ({ ...p, marketing: { ...p.marketing, sms: v, push: false } }));
                            setDirty(true);
                          }}
                        />
                        <ChannelRow
                          label="Push"
                          desc="Mobile push notifications (coming soon)."
                          icon={<PhoneIcon size={18} />}
                          value={false}
                          onChange={() => { }}
                          disabled
                          suffix={<Chip size="small" variant="outlined" label="Later" sx={{ borderRadius: "4px" }} />}
                        />

                        <TextField select label="Delivery" value={prefs.marketingDigest} onChange={(e) => setDigest("marketingDigest", e.target.value as Digest)} fullWidth>
                          {(["Instant", "Daily", "Weekly"] as Digest[]).map((d) => (
                            <MenuItem key={d} value={d}>
                              {d}
                            </MenuItem>
                          ))}
                        </TextField>

                        <Alert severity="info">Transaction and security messages are always delivered.</Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Quiet hours */}
                <Box className="md:col-span-5">
                  <Card sx={{ borderRadius: "4px" }}>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ClockIcon size={18} />
                          <Typography variant="h6">Quiet hours</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Reduce non-urgent messages during your preferred hours.
                        </Typography>
                        <Divider />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={prefs.quietHoursEnabled}
                              onChange={(e) => {
                                setPrefs((p) => ({ ...p, quietHoursEnabled: e.target.checked }));
                                setDirty(true);
                              }}
                            />
                          }
                          label={<Typography sx={{ fontWeight: 800 }}>Enable quiet hours</Typography>}
                        />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <TextField
                            type="time"
                            label="Start"
                            value={prefs.quietStart}
                            onChange={(e) => {
                              setPrefs((p) => ({ ...p, quietStart: e.target.value }));
                              setDirty(true);
                            }}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            disabled={!prefs.quietHoursEnabled}
                          />
                          <TextField
                            type="time"
                            label="End"
                            value={prefs.quietEnd}
                            onChange={(e) => {
                              setPrefs((p) => ({ ...p, quietEnd: e.target.value }));
                              setDirty(true);
                            }}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            disabled={!prefs.quietHoursEnabled}
                          />
                        </Stack>

                        <Alert severity="info" icon={<ClockIcon size={18} />}>
                          Security alerts still come through.
                        </Alert>
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
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={resetRecommended}>
                        Reset
                      </Button>
                      <Button fullWidth variant="contained" sx={orangeContained} onClick={saveNow}>
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

        <Snackbar open={snack.open} autoHideDuration={3300} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
