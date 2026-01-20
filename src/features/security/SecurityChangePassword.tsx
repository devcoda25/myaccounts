import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
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
 * EVzone My Accounts - Change Password
 * Route: /app/security/change-password
 */

type Severity = "info" | "warning" | "error" | "success";

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

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// -----------------------------
// Helpers
// -----------------------------
function strengthScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..5
}

function reqs(pw: string) {
  return {
    len: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    num: /\d/.test(pw),
    sym: /[^A-Za-z0-9]/.test(pw),
  };
}

export default function ChangePasswordPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [logoutOthers, setLogoutOthers] = useState(true);
  const [saving, setSaving] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

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

  const s = strengthScore(pw);
  const label = s <= 1 ? "Weak" : s === 2 ? "Fair" : s === 3 ? "Good" : s === 4 ? "Strong" : "Very strong";
  const r = reqs(pw);

  const canSubmit = current.trim() && s >= 3 && pw === confirm;

  const submit = async () => {
    if (!current.trim()) {
      setSnack({ open: true, severity: "warning", msg: "Enter your current password." });
      return;
    }
    if (!pw) {
      setSnack({ open: true, severity: "warning", msg: "Enter a new password." });
      return;
    }
    if (s < 3) {
      setSnack({ open: true, severity: "warning", msg: "Please strengthen your new password." });
      return;
    }
    if (pw !== confirm) {
      setSnack({ open: true, severity: "warning", msg: "Passwords do not match." });
      return;
    }

    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: current,
        newPassword: pw,
        logoutOthers,
      });

      setCurrent("");
      setPw("");
      setConfirm("");

      setSnack({
        open: true,
        severity: "success",
        msg: "Password updated successfully.",
      });
    } catch (err: unknown) {
      console.error(err);
      setSnack({ open: true, severity: "error", msg: (err as Error).message || "Failed to update password. Please check your current password." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      <CssBaseline />

      <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
            {/* Left info */}
            <Box className="md:col-span-4">
              <Card>
                <CardContent className="p-5">
                  <Stack spacing={1.2}>
                    <Typography variant="h6">Password guidance</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Use a unique password. Avoid reused passwords from other sites.
                    </Typography>
                    <Divider />
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {/* Demo info removed */}
                    </Typography>
                    <Alert severity="info" sx={{ borderRadius: "4px" }}>
                      Changing your password is a sensitive action. In production, we may request MFA.
                    </Alert>
                    <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/app/security")}>
                      Back to security
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Form */}
            <Box className="md:col-span-8">
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={2.0}>
                    <Stack spacing={0.6}>
                      <Typography variant="h5">Change password</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Update your password and optionally sign out other devices.
                      </Typography>
                    </Stack>

                    <Divider />

                    <TextField
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      label="Current password"
                      type={showCurrent ? "text" : "password"}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon size={18} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowCurrent((v) => !v)} sx={{ color: EVZONE.orange }}>
                              {showCurrent ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      label="New password"
                      type={showPw ? "text" : "password"}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon size={18} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPw((v) => !v)} sx={{ color: EVZONE.orange }}>
                              {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      label="Confirm new password"
                      type={showConfirm ? "text" : "password"}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon size={18} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowConfirm((v) => !v)} sx={{ color: EVZONE.orange }}>
                              {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Strength meter */}
                    <Stack spacing={0.8}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ flex: 1, height: 10, borderRadius: "4px", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.12 : 0.10), overflow: "hidden", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <Box sx={{ width: `${(s / 5) * 100}%`, height: "100%", backgroundColor: EVZONE.orange, transition: "width 180ms ease" }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 900 }}>{label}</Typography>
                      </Stack>

                      <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                        <Typography sx={{ fontWeight: 950, mb: 0.8 }}>Requirements</Typography>
                        <Stack spacing={0.5}>
                          {[
                            { ok: r.len, text: "At least 8 characters" },
                            { ok: r.upper, text: "One uppercase letter" },
                            { ok: r.lower, text: "One lowercase letter" },
                            { ok: r.num, text: "One number" },
                            { ok: r.sym, text: "One symbol" },
                            { ok: pw && pw === confirm, text: "Passwords match" },
                          ].map((it, idx) => (
                            <Typography key={idx} variant="body2" sx={{ color: it.ok ? theme.palette.text.primary : theme.palette.text.secondary, fontWeight: it.ok ? 900 : 700 }}>
                              • {it.text}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>

                    <FormControlLabel
                      control={<Checkbox checked={logoutOthers} onChange={(e) => setLogoutOthers(e.target.checked)} sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }} />}
                      label={<Typography variant="body2">Log out other devices</Typography>}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={submit} disabled={!canSubmit || saving} endIcon={<ArrowRightIcon size={18} />}>
                        {saving ? "Updating..." : "Update password"}
                      </Button>
                      <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/app/security")}>
                        Cancel
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Tip: Use a password manager to generate and store strong passwords.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </motion.div>

        <Box className="mt-6" sx={{ opacity: 0.92 }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
