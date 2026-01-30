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
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  Stack,
  Switch, // Kept for layout compatibility if needed, but not used? Or remove it.
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { startRegistration } from "@simplewebauthn/browser";
import { api } from "@/utils/api";
import { ISecurityPasskey } from "@/types";

/**
 * EVzone My Accounts - Passkeys Setup
 * Route: /app/security/passkeys
 */

type Severity = "info" | "warning" | "error" | "success";
type Transport = "internal" | "hybrid" | "usb" | "nfc" | "ble";

type Passkey = {
  id: string;
  name: string;
  createdAt: number;
  lastUsedAt?: number;
  deviceLabel: string;
  synced: boolean;
  transports: Transport[];
  residentKey: boolean;
};

// -----------------------------
// Inline icons
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}
function KeyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M7 14a5 5 0 1 1 3.6-8.5L22 5v4l-3 1v3l-3 1v3h-4l-1.4-1.4A5 5 0 0 1 7 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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
function EditIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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
function LaptopIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="4" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 19h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}
function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="8" y="2" width="8" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M11 19h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}
function CloudIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M8 18h9a4 4 0 0 0 .6-8A6 6 0 0 0 6.2 9.8 3.5 3.5 0 0 0 8 18Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}
function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

// -----------------------------
// Helpers
// -----------------------------
function timeAgo(ts?: number | string) {
  if (!ts) return "Never";
  const date = typeof ts === "string" ? new Date(ts).getTime() : ts;
  const diff = Date.now() - date;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function transportLabel(t: Transport) {
  if (t === "internal") return "This device";
  if (t === "hybrid") return "Phone";
  if (t === "usb") return "USB";
  if (t === "nfc") return "NFC";
  return t;
}

async function safePlatformAvailable(): Promise<boolean> {
  try {
    const w = window as any;
    if (!w.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) return false;
    return await w.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export default function PasskeysPage() {
  const { t } = useTranslation("common");
  {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode } = useThemeStore();
    const isDark = mode === "dark";

    const [platformAvailable, setPlatformAvailable] = useState<boolean | null>(null);
    const [busy, setBusy] = useState(false);
    const [passkeys, setPasskeys] = useState<Passkey[]>([]);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

    const fetchPasskeys = async () => {
      try {
        const res = await api.get<ISecurityPasskey[]>("/auth/passkeys");
        if (Array.isArray(res)) {
          const mapped: Passkey[] = res.map((p) => ({
            id: p.id,
            name: p.userAgent || "Unknown Device",
            createdAt: new Date(p.createdAt).getTime(),
            lastUsedAt: p.lastUsedAt ? new Date(p.lastUsedAt).getTime() : undefined,
            deviceLabel: "Passkey",
            synced: false,
            transports: (p.transports as Transport[]) || [],
            residentKey: true,
          }));
          setPasskeys(mapped);
        }
      } catch (e) {
        console.error(e);
      }
    };

    useEffect(() => {
      safePlatformAvailable().then((v) => setPlatformAvailable(v));
      fetchPasskeys();
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
      "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
    } as const;

    const orangeOutlined = {
      borderColor: alpha(EVZONE.orange, 0.65),
      color: EVZONE.orange,
      backgroundColor: alpha(theme.palette.background.paper, 0.20),
      "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    } as const;

    const createPasskey = async () => {
      setBusy(true);
      try {
        const supports = typeof window !== "undefined" && !!(window as any).PublicKeyCredential;
        if (!supports) {
          setSnack({ open: true, severity: "warning", msg: "Passkeys are not supported in this environment." });
          return;
        }
        // 1. Get options from backend
        // TODO: Type the registration options properly (PublicKeyCredentialCreationOptionsJSON)
        // For now, using unknown or any is hard to avoid without pulling in types package,
        // but we can at least avoid explicit 'any' cast if generic is implied or use object.
        const options = await api.post<Record<string, unknown>>("/auth/passkeys/register/start");
        // 2. Browser interaction
        // startRegistration expects PublicKeyCredentialCreationOptionsJSON. We assume backend returns compatible JSON.
        const attResp = await startRegistration(options as any); // Cast to any because startRegistration types are strict and backend response might be loosely typed here
        // 3. Finish
        const verification = await api.post<{ verified: boolean }>("/auth/passkeys/register/finish", attResp);

        if (verification.verified) {
          setSnack({ open: true, severity: "success", msg: "Passkey created successfully." });
          fetchPasskeys();
        } else {
          setSnack({ open: true, severity: "error", msg: "Verification failed." });
        }
      } catch (err: unknown) {
        console.error(err);
        const e = err as Error;
        if (e.name === "InvalidStateError") {
          setSnack({ open: true, severity: "error", msg: "This authenticator is already registered." });
        } else {
          setSnack({ open: true, severity: "error", msg: "Failed to create passkey." });
        }
      } finally {
        setBusy(false);
      }
    };

    const openRemove = (id: string) => {
      setActiveId(id);
      setRemoveOpen(true);
    };

    const confirmRemove = async () => {
      if (!activeId) return;
      try {
        await api.delete(`/auth/passkeys/${activeId}`);
        setPasskeys((prev) => prev.filter((p) => p.id !== activeId));
        setSnack({ open: true, severity: "success", msg: "Passkey removed." });
      } catch (e) {
        setSnack({ open: true, severity: "error", msg: "Failed to remove passkey." });
      }
      setRemoveOpen(false);
    };

    const capabilityChip =
      platformAvailable === null ? (
        <Chip size="small" variant="outlined" label="Checking passkey support…" />
      ) : platformAvailable ? (
        <Chip size="small" color="success" label="This device supports passkeys" />
      ) : (
        <Chip size="small" color="warning" label="Limited passkey support" />
      );

    return (
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        <CssBaseline />
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              {/* Header */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FingerprintIcon size={18} />
                          <Typography variant="h5">Passkeys</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Passkeys let you sign in using your device lock (biometrics or PIN). They are phishing-resistant.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          {capabilityChip}
                          <Chip size="small" variant="outlined" label={`Passkeys: ${passkeys.length}`} />
                          <Chip size="small" variant="outlined" label="WebAuthn" />
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/app/security")}>
                          Back
                        </Button>
                        <Button variant="contained" sx={orangeContained} startIcon={<KeyIcon size={18} />} onClick={createPasskey} disabled={busy}>
                          Create passkey
                        </Button>
                      </Stack>
                    </Stack>
                    <Divider />
                    <Alert severity="info" icon={<FingerprintIcon size={18} />} sx={{ borderRadius: "4px" }}>
                      Tip: Keep at least one backup method (password + recovery codes) to avoid lockout.
                    </Alert>
                    {busy ? (
                      <Box>
                        <LinearProgress />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Working…</Typography>
                      </Box>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                <Box className="md:col-span-12">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Your passkeys</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Removing a passkey stops it from signing in.
                        </Typography>
                        <Divider />

                        <Stack spacing={1.2}>
                          {passkeys.map((p) => (
                            <Box key={p.id} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                                <Stack direction="row" spacing={1.2} alignItems="center">
                                  <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.14), color: theme.palette.text.primary, borderRadius: "4px" }}>
                                    {p.transports.includes("internal") ? <LaptopIcon size={18} /> : <PhoneIcon size={18} />}
                                  </Avatar>
                                  <Box>
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                      <Typography sx={{ fontWeight: 950 }}>{p.name}</Typography>
                                      {p.synced ? <Chip size="small" variant="outlined" icon={<CloudIcon size={16} />} label="Synced" sx={{ "& .MuiChip-icon": { color: "inherit" } }} /> : <Chip size="small" variant="outlined" label="Device key" />}
                                    </Stack>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                      {p.deviceLabel} • Created {timeAgo(p.createdAt)}
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                                      {p.transports.map((t) => (
                                        <Chip key={t} size="small" variant="outlined" label={transportLabel(t)} />
                                      ))}
                                    </Stack>
                                  </Box>
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                  <Button variant="contained" sx={orangeContained} startIcon={<TrashIcon size={18} />} onClick={() => openRemove(p.id)}>
                                    Remove
                                  </Button>
                                </Stack>
                              </Stack>
                            </Box>
                          ))}
                          {!passkeys.length ? <Alert severity="info" sx={{ borderRadius: "4px" }}>No passkeys yet. Create one to sign in faster.</Alert> : null}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
              </Box>
            </Stack>
          </motion.div>
        </Box>

        {/* Remove dialog */}
        <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Remove passkey</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Alert severity="warning" sx={{ borderRadius: "4px" }}>This passkey will no longer be able to sign in.</Alert>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                If this was your last passkey, make sure you can still sign in using password or another method.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setRemoveOpen(false)}>{t("auth.common.cancel")}</Button>
            <Button variant="contained" sx={orangeContained} onClick={confirmRemove}>Remove</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    );
  }
}
