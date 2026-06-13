import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { api } from "@/utils/api";
import { secureRandomBytes } from "@/utils/secure-random";

/**
 * EVzone My Accounts - Two-Factor Authentication Setup v2
 * Route: /app/security/2fa/setup
 *
 * Features:
 * - Choose method: Authenticator / SMS / WhatsApp
 * - Stepper UI
 * - QR code for TOTP
 * - Verify code step
 * - Success + backup codes reveal
 */

type Severity = "info" | "warning" | "error" | "success";

type TwoFAMethod = "authenticator" | "sms" | "whatsapp";

// Redundant EVZONE removed

const WHATSAPP = {
  green: "#25D366",
} as const;

// -----------------------------
// Inline icons (CDN-safe)
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

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
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

function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m8.5 12 2.3 2.3L15.8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  // Official WhatsApp logo (Font Awesome path). Uses currentColor.
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

function randomBase32(length: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = secureRandomBytes(length);
  let s = "";
  for (let i = 0; i < length; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

function generateRecoveryCodes(count = 10) {
  const bytes = secureRandomBytes(count * 8);
  const codes = new Set<string>();
  const fmt = (arr: number[]) => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const s = arr.map((b) => alphabet[b % alphabet.length]).join("");
    return `${s.slice(0, 4)}-${s.slice(4, 8)}`;
  };
  let idx = 0;
  while (codes.size < count && idx + 8 <= bytes.length) {
    codes.add(fmt(Array.from(bytes.slice(idx, idx + 8))));
    idx += 8;
  }
  while (codes.size < count) codes.add(fmt(Array.from(secureRandomBytes(8))));
  return Array.from(codes);
}

function hash32(input: string) {
  // FNV-1a
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function makeMatrix(seed: string, size: number) {
  const mat: boolean[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => false));

  const setFinder = (x0: number, y0: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const xx = x0 + x;
        const yy = y0 + y;
        const border = x === 0 || y === 0 || x === 6 || y === 6;
        const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        mat[yy][xx] = border || center;
      }
    }
  };

  setFinder(0, 0);
  setFinder(size - 7, 0);
  setFinder(0, size - 7);

  const h = hash32(seed);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      if (inFinder) continue;
      const v = (hash32(`${seed}:${x}:${y}`) ^ h) & 1;
      mat[y][x] = v === 1;
    }
  }

  return mat;
}

function PseudoQr({ seed }: { seed: string }) {
  const size = 21;
  const mat = useMemo(() => makeMatrix(seed, size), [seed]);

  return (
    <Box
      sx={{
        width: 220,
        height: 220,
        borderRadius: "4px",
        border: `1px solid rgba(0,0,0,0.10)`,
        backgroundColor: "#FFFFFF",
        p: 1.4,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box sx={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 0.25 }}>
        {mat.flatMap((row, y) =>
          row.map((on, x) => (
            <Box
              key={`${x}-${y}`}
              sx={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 0.4, backgroundColor: on ? "#0B1A17" : "transparent" }}
            />
          ))
        )}
      </Box>
    </Box>
  );
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function OtpInput({ value, onChange, autoFocus = false }: { value: string[]; onChange: (next: string[]) => void; autoFocus?: boolean }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!autoFocus) return;
    window.setTimeout(() => refs.current[0]?.focus(), 120);
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
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, value.length);
    if (!text) return;
    e.preventDefault();
    const chars = text.split("");
    const next = [...value];
    for (let i = 0; i < next.length; i++) next[i] = chars[i] || "";
    onChange(next);
    const last = Math.min(value.length - 1, text.length - 1);
    window.setTimeout(() => refs.current[last]?.focus(), 0);
  };

  return (
    <Box className="grid grid-cols-6 gap-2">
      {value.map((d, i) => (
        <Box key={i}>
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={i === 0 ? onPasteFirst : undefined}
            inputMode="numeric"
            maxLength={1}
            className="w-full rounded border border-white/10 bg-transparent px-0 py-3 text-center text-lg font-extrabold outline-none"
            style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "inherit" }}
            aria-label={`OTP digit ${i + 1}`}
          />
        </Box>
      ))}
    </Box>
  );
}

export default function TwoFASetupPageV2() {
  const { t } = useTranslation("common");
  {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode } = useThemeStore();
    const isDark = mode === "dark";

    const [activeStep, setActiveStep] = useState(0);
    const [method, setMethod] = useState<TwoFAMethod>("authenticator");

    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const [secret, setSecret] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [showBackup, setShowBackup] = useState(false);

    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

    useEffect(() => {
      // Optional deep link: /app/security/2fa/setup?method=whatsapp
      try {
        const qs = new URLSearchParams(window.location.search);
        const m = qs.get("method");
        if (m === "authenticator" || m === "sms" || m === "whatsapp") {
          setMethod(m as TwoFAMethod);
          setActiveStep(1);
          setOtp(["", "", "", "", "", ""]);
        }
      } catch {
        // ignore
      }
    }, []);

    // Fetch setup params for Authenticator
    useEffect(() => {
      if (activeStep === 1 && method === "authenticator") {
        setLoading(true);
        api.post<{ secret: string; qrCodeUrl: string }>("/auth/mfa/setup/start")
          .then((res) => {
            setSecret(res.secret);
            setQrCodeUrl(res.qrCodeUrl);
            setLoading(false);
          })
          .catch((e) => {
            console.error(e);
            setLoading(false);
          });
      }
    }, [activeStep, method]);

    const steps = ["Choose method", "Set up", "Verify", "Success"];

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
      backgroundColor: alpha(theme.palette.background.paper, 0.25),
      "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    } as const;

    const waContainedSx = {
      backgroundColor: WHATSAPP.green,
      color: "#FFFFFF",
      boxShadow: `0 18px 48px ${alpha(WHATSAPP.green, mode === "dark" ? 0.26 : 0.18)}`,
      "&:hover": { backgroundColor: alpha(WHATSAPP.green, 0.92), color: "#FFFFFF" },
      "&:active": { backgroundColor: alpha(WHATSAPP.green, 0.86), color: "#FFFFFF" },
    } as const;

    const waOutlinedSx = {
      borderColor: alpha(WHATSAPP.green, 0.75),
      color: WHATSAPP.green,
      backgroundColor: alpha(theme.palette.background.paper, 0.25),
      "&:hover": { borderColor: WHATSAPP.green, backgroundColor: WHATSAPP.green, color: "#FFFFFF" },
    } as const;

    // toggleMode removed

    const start = (m: TwoFAMethod) => {
      setMethod(m);
      setActiveStep(1);
      setOtp(["", "", "", "", "", ""]);
      if (m === "authenticator") setSecret(randomBase32(16));
    };

    // expectedCode removed

    const sendCode = async () => {
      if (method === "authenticator") {
        setSnack({ open: true, severity: "info", msg: "Open your authenticator app and enter the current code." });
        return;
      }

      setLoading(true);
      try {
        await api.post("/auth/mfa/setup/sms/send", { phone });
        setSnack({ open: true, severity: "success", msg: "Code sent successfully." });
        setActiveStep(2); // Auto-advance to verification
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Failed to send code.";
        setSnack({ open: true, severity: "error", msg });
      } finally {
        setLoading(false);
      }
    };

    const verify = async () => {
      const code = otp.join("");
      if (code.length < 6) return setSnack({ open: true, severity: "warning", msg: "Enter the 6-digit code." });

      setLoading(true);
      try {
        const payload: Record<string, string> = { token: code, method };
        if (method === "authenticator") payload.secret = secret;
        if (method === "sms" || method === "whatsapp") payload.phone = phone;

        const res = await api.post<{ success: boolean; recoveryCodes?: string[] }>("/auth/mfa/setup/verify", payload);
        setLoading(false);

        if (res.success) {
          setRecoveryCodes(res.recoveryCodes || []);
          setSnack({ open: true, severity: "success", msg: "2FA enabled successfully." });
          setShowBackup(true);
          setActiveStep(3);
        } else {
          setSnack({ open: true, severity: "error", msg: "Verification failed. Code invalid." });
          setOtp(["", "", "", "", "", ""]);
        }
      } catch (err) {
        setLoading(false);
        setSnack({ open: true, severity: "error", msg: "Verification failed. Code invalid." });
        setOtp(["", "", "", "", "", ""]);
      }
    };

    const downloadCodesTxt = () => {
      const content = recoveryCodes.join("\n");
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "evzone-recovery-codes.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const cardSx = {
      borderRadius: "4px",
      border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
      backgroundColor: alpha(theme.palette.background.paper, 0.45),
    } as const;

    return (
      <Box className="min-h-screen" sx={{ background: pageBg }}>

        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Typography variant="h5">Two-factor authentication setup</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Add an extra layer of security to protect your account and wallet.
                    </Typography>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 1.5 }}>
                      {steps.map((s) => (
                        <Step key={s}>
                          <StepLabel>{s}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Stack>
                </CardContent>
              </Card>

              {activeStep === 0 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={2}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">Choose your method</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Authenticator is recommended. SMS and WhatsApp are convenient options.
                        </Typography>
                      </Stack>

                      <Box className="grid gap-4 md:grid-cols-3">
                        <Box sx={cardSx}>
                          <CardContent className="p-5">
                            <Stack spacing={1.2}>
                              <Stack direction="row" spacing={1.2} alignItems="center">
                                <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                                  <KeypadIcon size={18} />
                                </Box>
                                <Box>
                                  <Typography sx={{ fontWeight: 950 }}>Authenticator</Typography>
                                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Best security, works offline.</Typography>
                                </Box>
                              </Stack>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip size="small" color="success" label="Recommended" />
                                <Chip size="small" variant="outlined" label="Phishing-resistant" />
                              </Stack>
                              <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={() => start("authenticator")}>
                                Continue
                              </Button>
                            </Stack>
                          </CardContent>
                        </Box>

                        <Box sx={cardSx}>
                          <CardContent className="p-5">
                            <Stack spacing={1.2}>
                              <Stack direction="row" spacing={1.2} alignItems="center">
                                <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                                  <PhoneIcon size={18} />
                                </Box>
                                <Box>
                                  <Typography sx={{ fontWeight: 950 }}>SMS</Typography>
                                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Code sent to your phone number.</Typography>
                                </Box>
                              </Stack>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip size="small" color="info" label="Simple" />
                                <Chip size="small" variant="outlined" label="Requires network" />
                              </Stack>
                              <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={() => start("sms")}>
                                Continue
                              </Button>
                            </Stack>
                          </CardContent>
                        </Box>

                        <Box sx={cardSx}>
                          <CardContent className="p-5">
                            <Stack spacing={1.2}>
                              <Stack direction="row" spacing={1.2} alignItems="center">
                                <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                                  <WhatsAppIcon size={18} />
                                </Box>
                                <Box>
                                  <Typography sx={{ fontWeight: 950 }}>WhatsApp</Typography>
                                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Code delivered via WhatsApp.</Typography>
                                </Box>
                              </Stack>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip size="small" label="Fast" sx={{ border: `1px solid ${alpha(WHATSAPP.green, 0.6)}`, color: WHATSAPP.green, backgroundColor: alpha(WHATSAPP.green, 0.10) }} />
                                <Chip size="small" variant="outlined" label="Requires WhatsApp" />
                              </Stack>
                              <Button variant="contained" sx={waContainedSx} onClick={() => start("whatsapp")}>
                                Continue
                              </Button>
                            </Stack>
                          </CardContent>
                        </Box>
                      </Box>

                      <Divider />

                      <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                        You will get backup codes after setup. Store them safely.
                      </Alert>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {activeStep === 1 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={2}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">Set up {method === "authenticator" ? "Authenticator" : method === "sms" ? "SMS" : "WhatsApp"}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Follow the steps below, then verify the code.</Typography>
                      </Stack>

                      {method === "authenticator" ? (
                        <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                          <Box className="md:col-span-5">
                            <Stack spacing={1.2}>
                              <Typography sx={{ fontWeight: 950 }}>1) Scan the QR code</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Use Google Authenticator or any TOTP app.</Typography>
                              {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" style={{ borderRadius: "4px", width: 220, height: 220 }} /> : <PseudoQr seed={secret} />}
                            </Stack>
                          </Box>
                          <Box className="md:col-span-7">
                            <Stack spacing={1.2}>
                              <Typography sx={{ fontWeight: 950 }}>2) Or enter the secret</Typography>
                              <TextField
                                value={secret}
                                label="Secret key"
                                fullWidth
                                InputProps={{
                                  readOnly: true,
                                  startAdornment: (<InputAdornment position="start"><KeypadIcon size={18} /></InputAdornment>),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton size="small" onClick={async () => { const ok = await copyToClipboard(secret); setSnack({ open: true, severity: ok ? "success" : "warning", msg: ok ? "Copied secret." : "Copy failed." }); }} sx={{ color: EVZONE.orange }}>
                                        <CopyIcon size={18} />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                helperText="Keep this key private."
                              />
                              <Alert severity="info">Use your authenticator app to get the code.</Alert>
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<ArrowLeftIcon size={18} />} onClick={() => setActiveStep(0)}>{t("auth.common.back")}</Button>
                                <Button variant="contained" color="secondary" sx={evOrangeContainedSx} endIcon={<ArrowRightIcon size={18} />} onClick={() => setActiveStep(2)}>Verify code</Button>
                              </Stack>
                            </Stack>
                          </Box>
                        </Box>
                      ) : (
                        <Stack spacing={1.4}>
                          <Typography sx={{ fontWeight: 950 }}>1) Confirm phone number</Typography>
                          <TextField
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            label="Phone number"
                            fullWidth
                            InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIcon size={18} /></InputAdornment>) }}
                            helperText={method === "sms" ? "A code will be sent by SMS." : "A code will be sent via WhatsApp."}
                          />
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="contained" color="secondary" sx={method === "whatsapp" ? waContainedSx : evOrangeContainedSx} onClick={sendCode}>Send & Verify</Button>
                            <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<ArrowLeftIcon size={18} />} onClick={() => setActiveStep(0)}>{t("auth.common.back")}</Button>
                          </Stack>
                          <Alert severity="info">We'll send a code to <b>{phone}</b>.</Alert>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {activeStep === 2 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={2}>
                      <Stack spacing={0.6}>
                        <Typography variant="h6">Verify your code</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Enter the 6-digit code from {method === "authenticator" ? "your authenticator app" : method === "sms" ? "SMS" : "WhatsApp"}.</Typography>
                      </Stack>
                      <OtpInput value={otp} onChange={setOtp} autoFocus />
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<ArrowLeftIcon size={18} />} onClick={() => setActiveStep(1)}>{t("auth.common.back")}</Button>
                        <Button variant="outlined" sx={method === "whatsapp" ? waOutlinedSx : evOrangeOutlinedSx} onClick={sendCode}>Resend</Button>
                        <Button variant="contained" color="secondary" sx={evOrangeContainedSx} endIcon={<ArrowRightIcon size={18} />} onClick={verify}>{t("auth.common.verify")}</Button>
                      </Stack>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Please enter the code you received.</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {activeStep === 3 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ color: EVZONE.green }}><CheckCircleIcon size={22} /></Box>
                        <Box>
                          <Typography variant="h6">2FA is enabled</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Save your recovery codes. You will need them if you lose access.</Typography>
                        </Box>
                      </Stack>
                      <Divider />
                      <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                          <Typography sx={{ fontWeight: 950 }}>Recovery codes</Typography>
                          <Stack direction="row" spacing={1}>
                            <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<CopyIcon size={18} />} onClick={async () => { const ok = await copyToClipboard(recoveryCodes.join("\n")); setSnack({ open: true, severity: ok ? "success" : "warning", msg: ok ? "Copied codes." : "Copy failed." }); }}>Copy</Button>
                            <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<DownloadIcon size={18} />} onClick={downloadCodesTxt}>Download</Button>
                          </Stack>
                        </Stack>
                        <Divider sx={{ my: 1.2 }} />
                        <Box className="grid gap-2 sm:grid-cols-2">
                          {recoveryCodes.map((c) => (
                            <Box key={c} sx={{ borderRadius: 14, border: `1px dashed ${alpha(theme.palette.text.primary, 0.18)}`, p: 1.1, backgroundColor: alpha(theme.palette.background.paper, 0.35) }}>
                              <Typography sx={{ fontWeight: 950, letterSpacing: 0.6 }}>{showBackup ? c : "••••-••••"}</Typography>
                            </Box>
                          ))}
                        </Box>
                        <Button variant="text" sx={{ mt: 1.2, color: EVZONE.orange, fontWeight: 900, "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) } }} onClick={() => setShowBackup((v) => !v)}>
                          {showBackup ? "Hide codes" : "Reveal codes"}
                        </Button>
                      </Box>
                      <Alert severity="info">We recommend saving these in a password manager. Do not share them.</Alert>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={() => navigate("/app/security/2fa")}>Go to Manage 2FA</Button>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate("/app/security")}>Back to Security</Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group</Typography>
              </Box>
            </Stack>
          </motion.div>
        </Box>

        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    );
  }
}
