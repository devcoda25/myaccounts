import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import AuthHeader from "../../../../components/headers/AuthHeader";
import { EVZONE } from "../../../../theme/evzone";

import {
  HelpCircleIcon,
  LockIcon,
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TimerIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon
} from "../../../../utils/icons";

/**
 * EVzone My Accounts - Reset Password (v2)
 * Route: /auth/reset-password
 * Update: OTP-based reset supports SMS + WhatsApp (for phone identifiers) and Email (for email identifiers).
 */

type ResetMode = "token" | "otp";

type Step = "verify" | "set" | "success";

type IdType = "email" | "phone" | "unknown";

type OtpChannel = "email" | "sms" | "whatsapp";

const WHATSAPP = {
  green: "#25D366",
} as const;

// -----------------------------
// Helpers
// -----------------------------
function detectIdType(v: string): IdType {
  const s = v.trim();
  if (!s) return "unknown";
  if (/.+@.+\..+/.test(s)) return "email";
  if (/^\+?[0-9\s-]{8,}$/.test(s)) return "phone";
  return "unknown";
}

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

// OTP input (6 digits)
function OtpInput({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  autoFocus?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!autoFocus) return;
    window.setTimeout(() => refs.current[0]?.focus(), 200);
  }, [autoFocus]);

  const setDigit = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = d;
    onChange(next);
    if (d && i < next.length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPasteFirst = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, value.length);
    if (!text) return;
    e.preventDefault();
    const chars = text.split("");
    const next = [...value];
    for (let i = 0; i < next.length; i++) next[i] = chars[i] || "";
    onChange(next);
    const lastIndex = Math.min(next.length - 1, text.length - 1);
    window.setTimeout(() => refs.current[lastIndex]?.focus(), 0);
  };

  return (
    <Box className="grid grid-cols-6 gap-2">
      {value.map((digit, i) => (
        <Box key={i}>
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={digit}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={i === 0 ? onPasteFirst : undefined}
            inputMode="numeric"
            maxLength={1}
            className="w-full rounded-xl border border-white/10 bg-transparent px-0 py-3 text-center text-lg font-extrabold outline-none"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
            }}
            aria-label={`OTP digit ${i + 1}`}
          />
        </Box>
      ))}
    </Box>
  );
}

export default function ResetPasswordPageV2() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const qs = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const tokenFromUrl = qs.get("token") || "";

  const [resetMode, setResetMode] = useState<ResetMode>(tokenFromUrl ? "token" : "otp");
  const [step, setStep] = useState<Step>("verify");

  // token-based
  const [token, setToken] = useState(tokenFromUrl || "");

  // otp-based
  const [identifier, setIdentifier] = useState("+256761677709");
  const idType = detectIdType(identifier);

  const [otpChannel, setOtpChannel] = useState<OtpChannel>(idType === "email" ? "email" : "sms");

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  // new password
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [signOutAll, setSignOutAll] = useState(true);

  const [banner, setBanner] = useState<
    { severity: "error" | "warning" | "info" | "success"; msg: string } | null
  >(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    severity: "success" | "info" | "warning" | "error";
    msg: string;
  }>({ open: false, severity: "info", msg: "" });

  // Green-only background
  const pageBg =
    isDark
      ? "radial-gradient(1200px 600px at 12% 6%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 10%, rgba(3,205,140,0.16), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.18), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.12), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, isDark ? 0.28 : 0.20)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
  } as const;

  const orangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.35),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, isDark ? 0.14 : 0.10) },
  } as const;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  // keep OTP channel valid for identifier type
  useEffect(() => {
    if (idType === "email") {
      setOtpChannel("email");
      return;
    }
    if (idType === "phone") {
      if (otpChannel === "email") setOtpChannel("sms");
      return;
    }
  }, [idType]);

  // reset OTP state when switching channel
  useEffect(() => {
    setOtp(["", "", "", "", "", ""]);
    setCodeSent(false);
    setCooldown(0);
  }, [otpChannel]);

  // reset state when switching resetMode
  useEffect(() => {
    setBanner(null);
    setStep("verify");
    setPw("");
    setConfirm("");
    setShowPw(false);
    setShowConfirm(false);
    setOtp(["", "", "", "", "", ""]);
    setCooldown(0);
    setCodeSent(false);
  }, [resetMode]);



  // Token verification (demo)
  const tokenOk = (v: string) => v.trim() === "EVZ-RESET-TOKEN";

  const verifyToken = () => {
    setBanner(null);
    if (!token.trim()) {
      setBanner({ severity: "warning", msg: "Please enter the reset token." });
      return;
    }
    if (!tokenOk(token)) {
      setBanner({
        severity: "error",
        msg: "Invalid token.",
      });
      return;
    }
    setStep("set");
    setSnack({ open: true, severity: "success", msg: "Token verified." });
  };

  const expectedOtp = otpChannel === "whatsapp" ? "555555" : "444444"; // SMS+Email share a demo code

  const sendOtp = () => {
    setBanner(null);

    if (!identifier.trim()) {
      setBanner({ severity: "warning", msg: "Please enter your email or phone." });
      return;
    }

    if (idType === "unknown") {
      setBanner({ severity: "warning", msg: "Invalid email or phone." });
      return;
    }

    if (otpChannel === "email" && idType !== "email") {
      setBanner({ severity: "warning", msg: "Please enter a valid email." });
      return;
    }

    if ((otpChannel === "sms" || otpChannel === "whatsapp") && idType !== "phone") {
      setBanner({ severity: "warning", msg: "Please enter a valid phone number." });
      return;
    }

    setCodeSent(true);
    setCooldown(30);

    const msg =
      otpChannel === "email"
        ? "Code sent to your email."
        : otpChannel === "sms"
          ? "Code sent via SMS."
          : "Code sent via WhatsApp.";

    setSnack({ open: true, severity: "success", msg });
  };

  const verifyOtp = () => {
    setBanner(null);

    if (!codeSent) {
      setBanner({ severity: "warning", msg: "Please send the code first." });
      return;
    }

    const code = otp.join("");
    if (code.length < 6) {
      setBanner({ severity: "warning", msg: "Please enter a 6-digit code." });
      return;
    }

    if (code !== expectedOtp) {
      setBanner({ severity: "error", msg: "Invalid code." });
      return;
    }

    setStep("set");
    setSnack({ open: true, severity: "success", msg: "Code verified." });
  };

  // Password setting step
  const s = strengthScore(pw);
  const label = s <= 1 ? "Weak" : s === 2 ? "Fair" : s === 3 ? "Good" : s === 4 ? "Strong" : "Very Strong";
  const r = reqs(pw);
  const canReset = s >= 3 && pw === confirm;

  const reset = () => {
    setBanner(null);

    if (!pw) {
      setBanner({ severity: "warning", msg: "Please enter a password." });
      return;
    }
    if (s < 3) {
      setBanner({ severity: "warning", msg: "Password must be stronger." });
      return;
    }
    if (pw !== confirm) {
      setBanner({ severity: "warning", msg: "Passwords do not match." });
      return;
    }

    setStep("success");
    setSnack({
      open: true,
      severity: "success",
      msg: signOutAll ? "Password reset. You have been signed out of all devices." : "Password reset successfully.",
    });
  };

  const goSignIn = () => navigate("/auth/sign-in");

  const ChannelCard = ({
    value,
    title,
    subtitle,
    icon,
    enabled,
    accent,
  }: {
    value: OtpChannel;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    enabled: boolean;
    accent: "orange" | "whatsapp";
  }) => {
    const selected = otpChannel === value;
    const base = accent === "whatsapp" ? WHATSAPP.green : EVZONE.orange;

    return (
      <ButtonBase
        className="w-full"
        disabled={!enabled}
        onClick={() => enabled && setOtpChannel(value)}
        sx={{ textAlign: "left", opacity: enabled ? 1 : 0.55 }}
      >
        <Box
          sx={{
            width: "100%",
            borderRadius: 16,
            border: `1px solid ${alpha(base, selected ? 0.95 : 0.55)}`,
            backgroundColor: selected ? base : alpha(theme.palette.background.paper, 0.35),
            color: selected ? "#FFFFFF" : base,
            p: 1.2,
            transition: "all 160ms ease",
            "&:hover": enabled
              ? {
                backgroundColor: base,
                borderColor: base,
                color: "#FFFFFF",
              }
              : undefined,
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                backgroundColor: selected ? alpha("#FFFFFF", 0.18) : alpha(base, isDark ? 0.16 : 0.10),
                border: `1px solid ${alpha(selected ? "#FFFFFF" : base, 0.26)}`,
                color: selected ? "#FFFFFF" : base,
              }}
            >
              {icon}
            </Box>
            <Box flex={1}>
              <Typography sx={{ fontWeight: 900, lineHeight: 1.1, color: "inherit" }}>{title}</Typography>
              <Typography variant="body2" sx={{ color: selected ? alpha("#FFFFFF", 0.86) : theme.palette.text.secondary }}>
                {subtitle}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </ButtonBase>
    );
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      {/* Unified Auth Header */}
      <AuthHeader title="EVzone" subtitle="Reset Password" />

      {/* Body */}
      <Box className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
          {/* Left */}
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <CardContent className="p-5 md:p-6">
                <Stack spacing={1.2}>
                  <Typography variant="h6">Create New Password</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Enter a new password for your account.
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Use <b>EVZ-RESET-TOKEN</b> for demo.
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Button
                    variant="outlined"
                    sx={orangeOutlinedSx}
                    onClick={() =>
                      setSnack({ open: true, severity: "info", msg: "Back to /auth/forgot-password" })
                    }
                  >
                    Back to Forgot Password
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right */}
          <motion.div
            className="md:col-span-7"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack spacing={2.0}>
                  <Stack spacing={0.6}>
                    <Typography variant="h6">Reset Password</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Enter your details to reset your password.
                    </Typography>
                  </Stack>

                  {banner ? <Alert severity={banner.severity}>{banner.msg}</Alert> : null}

                  <Tabs
                    value={resetMode === "token" ? 0 : 1}
                    onChange={(_, v) => setResetMode(v === 0 ? "token" : "otp")}
                    variant="fullWidth"
                    sx={{
                      borderRadius: 16,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                      overflow: "hidden",
                      minHeight: 44,
                      "& .MuiTab-root": { minHeight: 44, fontWeight: 900 },
                      "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 },
                    }}
                  >
                    <Tab icon={<KeyIcon size={16} />} iconPosition="start" label="Token" />
                    <Tab icon={<TimerIcon size={16} />} iconPosition="start" label="Code" />
                  </Tabs>

                  {step === "verify" ? (
                    resetMode === "token" ? (
                      <Stack spacing={1.4}>
                        <TextField
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          label="Reset Token"
                          placeholder="Enter token"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <KeyIcon size={18} />
                              </InputAdornment>
                            ),
                          }}
                          helperText="Check your email for the token."
                        />
                        <Button
                          variant="contained"
                          color="secondary"
                          sx={orangeContainedSx}
                          onClick={verifyToken}
                          endIcon={<ArrowRightIcon size={18} />}
                        >
                          Verify Token
                        </Button>
                      </Stack>
                    ) : (
                      <Stack spacing={1.4}>
                        <TextField
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          label="Email or Phone"
                          placeholder="Enter email or phone"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {idType === "phone" ? <PhoneIcon size={18} /> : <MailIcon size={18} />}
                              </InputAdornment>
                            ),
                          }}
                          helperText={idType === "unknown" ? "We will determine the method based on your input." : ""}
                        />

                        {/* Delivery method selection */}
                        <Box>
                          <Typography sx={{ fontWeight: 900, mb: 1 }}>Delivery Method</Typography>
                          <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <ChannelCard
                              value="email"
                              title="Email"
                              subtitle="Send to email"
                              icon={<MailIcon size={18} />}
                              enabled={idType === "email"}
                              accent="orange"
                            />
                            <ChannelCard
                              value="sms"
                              title="SMS"
                              subtitle="Send via SMS"
                              icon={<PhoneIcon size={18} />}
                              enabled={idType === "phone"}
                              accent="orange"
                            />
                            <ChannelCard
                              value="whatsapp"
                              title="WhatsApp"
                              subtitle="Send via WhatsApp"
                              icon={<WhatsAppIcon size={18} />}
                              enabled={idType === "phone"}
                              accent="whatsapp"
                            />
                          </Box>
                          {idType === "email" ? (
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: "block" }}>
                              Phone channels are disabled for email users.
                            </Typography>
                          ) : null}
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button
                            variant="contained"
                            color="secondary"
                            sx={orangeContainedSx}
                            onClick={sendOtp}
                            disabled={cooldown > 0 && codeSent}
                          >
                            {codeSent ? "Code Sent" : "Send Code"}
                          </Button>
                          <Button
                            variant="outlined"
                            sx={orangeOutlinedSx}
                            onClick={sendOtp}
                            disabled={!codeSent || cooldown > 0}
                            startIcon={<TimerIcon size={18} />}
                          >
                            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                          </Button>
                        </Stack>

                        <OtpInput value={otp} onChange={setOtp} autoFocus={codeSent} />

                        <Button
                          variant="contained"
                          color="secondary"
                          sx={orangeContainedSx}
                          onClick={verifyOtp}
                          endIcon={<ArrowRightIcon size={18} />}
                        >
                          Verify Code
                        </Button>
                      </Stack>
                    )
                  ) : step === "set" ? (
                    <Stack spacing={1.4}>
                      <TextField
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        label="New Password"
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
                              <IconButton
                                size="small"
                                onClick={() => setShowPw((v) => !v)}
                                sx={{ color: EVZONE.orange }}
                              >
                                {showPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        label="Confirm Password"
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
                              <IconButton
                                size="small"
                                onClick={() => setShowConfirm((v) => !v)}
                                sx={{ color: EVZONE.orange }}
                              >
                                {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Strength */}
                      <Stack spacing={0.8}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Box
                            sx={{
                              flex: 1,
                              height: 10,
                              borderRadius: 999,
                              backgroundColor: alpha(EVZONE.green, isDark ? 0.14 : 0.10),
                              overflow: "hidden",
                              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(s / 5) * 100}%`,
                                height: "100%",
                                backgroundColor: EVZONE.orange,
                                transition: "width 180ms ease",
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary, fontWeight: 900 }}
                          >
                            {label}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Box
                        sx={{
                          borderRadius: 18,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.45),
                          p: 1.2,
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, mb: 0.8 }}>Requirements</Typography>
                        <Stack spacing={0.5}>
                          {[
                            { ok: r.len, text: "At least 8 characters" },
                            { ok: r.upper, text: "One uppercase letter" },
                            { ok: r.lower, text: "One lowercase letter" },
                            { ok: r.num, text: "One number" },
                            { ok: r.sym, text: "One special character" },
                          ].map((it, idx) => (
                            <Typography
                              key={idx}
                              variant="body2"
                              sx={{
                                color: it.ok ? theme.palette.text.primary : theme.palette.text.secondary,
                                fontWeight: it.ok ? 900 : 700,
                              }}
                            >
                              • {it.text}
                            </Typography>
                          ))}
                          <Divider sx={{ my: 0.6 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: pw && pw === confirm ? theme.palette.text.primary : theme.palette.text.secondary,
                              fontWeight: pw && pw === confirm ? 900 : 700,
                            }}
                          >
                            • Passwords match
                          </Typography>
                        </Stack>
                      </Box>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={signOutAll}
                            onChange={(e) => setSignOutAll(e.target.checked)}
                            sx={{
                              color: alpha(EVZONE.orange, 0.7),
                              "&.Mui-checked": { color: EVZONE.orange },
                            }}
                          />
                        }
                        label={<Typography variant="body2">Sign out of all other devices</Typography>}
                      />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button
                          variant="contained"
                          color="secondary"
                          sx={orangeContainedSx}
                          onClick={reset}
                          disabled={!canReset}
                          endIcon={<ArrowRightIcon size={18} />}
                        >
                          Reset Password
                        </Button>
                        <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setStep("verify")}
                        >
                          Back
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: EVZONE.green }}>
                          <CheckCircleIcon size={22} />
                        </Box>
                        <Typography variant="h6">Password Updated</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Your password has been changed successfully.
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={orangeContainedSx}
                        onClick={goSignIn}
                        endIcon={<ArrowRightIcon size={18} />}
                      >
                        Go to Sign In
                      </Button>
                    </Stack>
                  )}

                  <Divider />

                  <Button
                    variant="text"
                    sx={orangeTextSx}
                    onClick={() =>
                      setSnack({ open: true, severity: "info", msg: "Navigate to /auth/account-recovery-help" })
                    }
                  >
                    Account Recovery Help
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Footer */}
        <Box
          className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
          sx={{ opacity: 0.92 }}
        >
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            © {new Date().getFullYear()} EVzone Group.
          </Typography>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Button
              size="small"
              variant="text"
              sx={orangeTextSx}
              onClick={() => window.open("/legal/terms", "_blank")}
            >
              Terms
            </Button>
            <Button
              size="small"
              variant="text"
              sx={orangeTextSx}
              onClick={() => window.open("/legal/privacy", "_blank")}
            >
              Privacy
            </Button>
          </Stack>
        </Box>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3400}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant={isDark ? "filled" : "standard"}
          sx={{
            borderRadius: 16,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
            backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.92) : alpha(theme.palette.background.paper, 0.96),
            color: theme.palette.text.primary,
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
