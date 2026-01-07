import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { api } from "@/utils/api";
import { IRecoveryCodesResponse } from "@/types";

/**
 * EVzone My Accounts - Recovery Codes
 * Route: /app/security/recovery-codes
 */

type Severity = "info" | "warning" | "error" | "success";
type ReAuthMode = "password" | "mfa";
type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

const WHATSAPP = {
  green: "#25D366",
} as const;

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
function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
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
function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}
function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12s3.5-7 10-7c2 0 3.8.5 5.3 1.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12s-3.5 7-10 7c-2.2 0-4.2-.5-5.8-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 10a3 3 0 0 0 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

// -----------------------------
// Helpers
// -----------------------------

function escapePdfText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildMinimalPdf(lines: string[]) {
  const header = "%PDF-1.3\n";
  const contentLines: string[] = [];
  contentLines.push("BT");
  contentLines.push("/F1 12 Tf");
  contentLines.push("72 740 Td");
  const leading = 16;
  lines.forEach((ln, i) => {
    const safe = escapePdfText(ln);
    if (i === 0) contentLines.push(`(${safe}) Tj`);
    else {
      contentLines.push(`0 -${leading} Td`);
      contentLines.push(`(${safe}) Tj`);
    }
  });
  contentLines.push("ET");
  const stream = contentLines.join("\n") + "\n";
  const streamObj = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  const objs: string[] = [];
  objs.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objs.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objs.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n");
  objs.push(`4 0 obj\n${streamObj}\nendobj\n`);
  objs.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  const offsets: number[] = [0];
  let body = "";
  let cursor = header.length;
  for (const obj of objs) {
    offsets.push(cursor);
    body += obj;
    cursor += obj.length;
  }
  const xrefStart = header.length + body.length;
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    const off = offsets[i].toString().padStart(10, "0");
    xref += `${off} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  const pdf = header + body + xref + trailer;
  return new Uint8Array(Array.from(pdf).map((c) => c.charCodeAt(0)));
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function mfaCodeFor(channel: MfaChannel) {
  // Demo codes
  if (channel === "Authenticator") return "123456";
  if (channel === "SMS") return "222222";
  if (channel === "WhatsApp") return "333333";
  return "444444";
}

export default function RecoveryCodesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const [authed, setAuthed] = useState(false);
  const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
  const [reauthPassword, setReauthPassword] = useState("");
  const [mfaChannel, setMfaChannel] = useState<MfaChannel>("Authenticator");
  const [otp, setOtp] = useState("");

  const [codes, setCodes] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<number | null>(null);

  const [confirmRegenOpen, setConfirmRegenOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });
  const [loading, setLoading] = useState(false);

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

  const validateReauth = () => {
    if (reauthMode === "password") {
      // In a real app, verify with backend
      if (reauthPassword !== "EVzone123!") {
        setSnack({ open: true, severity: "error", msg: "Re-auth failed. Incorrect password." });
        return false;
      }
      return true;
    }
    // Mock MFA check
    if (otp.length < 6) {
      setSnack({ open: true, severity: "error", msg: "Re-auth failed. Incorrect code." });
      return false;
    }
    return true;
  };

  const submitReauth = () => {
    if (!validateReauth()) return;
    setAuthed(true);
    setSnack({ open: true, severity: "success", msg: "Verified. You can regenerate codes now." });
  };

  const doCopy = async () => {
    if (codes.length === 0) return;
    const ok = await copyToClipboard(["EVzone Recovery Codes", ...codes].join("\n"));
    setSnack({ open: true, severity: ok ? "success" : "warning", msg: ok ? "Copied codes." : "Copy failed." });
  };

  const doDownloadPdf = () => {
    if (codes.length === 0) return;
    const pdfBytes = buildMinimalPdf(["EVzone Recovery Codes", `Generated: ${new Date().toLocaleString()}`, "", ...codes]);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evzone-recovery-codes.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openRegen = () => {
    if (!authed) {
      setSnack({ open: true, severity: "warning", msg: "Re-authenticate first to regenerate codes." });
      return;
    }
    setConfirmRegenOpen(true);
  };

  const regenerate = async () => {
    setConfirmRegenOpen(false);
    setLoading(true);
    try {
      const res = await api.post<IRecoveryCodesResponse>("/auth/mfa/recovery-codes");
      setLoading(false);
      if (res.codes) {
        setCodes(res.codes);
        setLastGeneratedAt(Date.now());
        setRevealed(true);
        setSnack({ open: true, severity: "success", msg: "New recovery codes generated. Old codes are invalid." });
      } else {
        setSnack({ open: true, severity: "error", msg: "Failed to generate codes." });
      }
    } catch (e) {
      setLoading(false);
      setSnack({ open: true, severity: "error", msg: "Failed to generate codes." });
    }
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      <CssBaseline />
      <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Stack spacing={2.2}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={1.2}>
                  <Typography variant="h5">Recovery codes</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Use these if you lose access to your 2FA device. Each code can be used once.
                  </Typography>
                  <Alert severity="info" icon={<ShieldCheckIcon size={18} />} sx={{ borderRadius: "4px" }}>
                    Store codes securely. Do not share them.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>

            {!authed ? (
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.6}>
                    <Typography variant="h6">Re-authenticate to continue</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Viewing recovery codes is sensitive. Please confirm it’s you.
                    </Typography>

                    <Tabs
                      value={reauthMode === "password" ? 0 : 1}
                      onChange={(_, v) => setReauthMode(v === 0 ? "password" : "mfa")}
                      variant="fullWidth"
                      sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
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
                        helperText="Demo password: EVzone123!"
                      />
                    ) : (
                      <>
                        <Typography sx={{ fontWeight: 950 }}>Choose a channel</Typography>
                        <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {([
                            { c: "Authenticator" as const, icon: <KeypadIcon size={18} />, color: EVZONE.orange },
                            { c: "SMS" as const, icon: <KeypadIcon size={18} />, color: EVZONE.orange },
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
                                onClick={() => setMfaChannel(it.c)}
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

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={submitReauth}>Continue</Button>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/app/security")}>Back to security</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.6}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">Your recovery codes</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Last generated: {lastGeneratedAt ? new Date(lastGeneratedAt).toLocaleString() : "Unknown"}
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />} onClick={() => setRevealed((v) => !v)}>{revealed ? "Hide" : "Reveal"}</Button>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<CopyIcon size={18} />} onClick={doCopy} disabled={codes.length === 0}>Copy</Button>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<DownloadIcon size={18} />} onClick={doDownloadPdf} disabled={codes.length === 0}>Download PDF</Button>
                      </Stack>
                    </Stack>
                    <Divider />
                    <Box className="grid gap-2 sm:grid-cols-2">
                      {codes.length > 0 ? (
                        codes.map((c) => (
                          <Box key={c} sx={{ borderRadius: "4px", border: `1px dashed ${alpha(theme.palette.text.primary, 0.18)}`, p: 1.1, backgroundColor: alpha(theme.palette.background.paper, 0.35) }}>
                            <Typography sx={{ fontWeight: 950, letterSpacing: 0.6 }}>{revealed ? c : "••••-••••"}</Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>No codes available. Regenerate to get new ones.</Typography>
                      )}
                    </Box>
                    <Divider />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<RefreshIcon size={18} />} onClick={openRegen} disabled={loading}>{loading ? "Regenerating..." : "Regenerate codes"}</Button>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/app/security/2fa")}>Back to Manage 2FA</Button>
                    </Stack>
                    <Alert severity="warning" sx={{ borderRadius: "4px" }}>Regenerating codes invalidates all previous codes immediately.</Alert>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Box sx={{ opacity: 0.92 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
            </Box>
          </Stack>
        </motion.div>
      </Box>

      <Dialog open={confirmRegenOpen} onClose={() => setConfirmRegenOpen(false)} PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>Regenerate recovery codes</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>This will invalidate all previous recovery codes.</Typography>
            <Alert severity="warning" sx={{ borderRadius: "4px" }}>Proceed only if your codes were exposed or lost.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setConfirmRegenOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={regenerate}>Regenerate</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
