import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useThemeContext } from "../../../theme/ThemeContext";
import { motion } from "framer-motion";

/**
 * EVzone My Accounts - Add Payment Method
 * Route: /app/wallet/payment-methods/add
 *
 * Features:
 * • Card entry via provider widget OR mobile money form
 * • Billing address (optional)
 * • Verification step if required
 */

type Severity = "info" | "warning" | "error" | "success";

type MethodType = "card" | "momo";
type MomoProvider = "MTN MoMo" | "Airtel Money";
type CardProvider = "Visa" | "Mastercard";

type VerifyChannel = "3DS" | "OTP";

type ResultState = "idle" | "verifying" | "success" | "failed";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const MTN = { yellow: "#FFCC00" } as const;
const AIRTEL = { red: "#E60012" } as const;

const THEME_KEY = "evzone_myaccounts_theme";

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

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function CardIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function XCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function BrandVisa({ size = 18 }: { size?: number }) {
  // simple VISA wordmark-ish icon
  return (
    <svg width={size} height={size} viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <rect x="1" y="1" width="62" height="30" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 23 8 9h4l2 9 2-9h4l-4 14h-4Z" fill="currentColor" />
      <path d="M25 9h4l-2 14h-4l2-14Z" fill="currentColor" />
      <path d="M39 9h-3c-2 0-3 .9-3 2.4 0 3.2 7 2.2 7 7.2 0 2.7-2.3 4.4-5.6 4.4-1.9 0-3.7-.5-4.8-1.1l.6-3c1.1.8 2.7 1.2 4.2 1.2 1.2 0 2-.4 2-1.2 0-2.2-7-2-7-7.1C29.4 10.3 31.6 9 35 9h4l-.1 0Z" fill="currentColor" />
      <path d="M52 23h-4l-.6-2h-5l-1.1 2h-4l7-14h3.7l4 14Zm-5.7-5.1-1.2-4.5-2.2 4.5h3.4Z" fill="currentColor" />
    </svg>
  );
}

function BrandMastercard({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <rect x="1" y="1" width="62" height="30" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="26" cy="16" r="8" fill="currentColor" opacity="0.9" />
      <circle cx="38" cy="16" r="8" fill="currentColor" opacity="0.55" />
      <path d="M32 10a8 8 0 0 0 0 12 8 8 0 0 0 0-12Z" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

// -----------------------------
// Theme
// -----------------------------

// -----------------------------
// Helpers
// -----------------------------
function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function validatePhone(phone: string) {
  const d = digitsOnly(phone);
  return d.length >= 9 && d.length <= 15;
}

function demoVerifyCode(channel: VerifyChannel) {
  return channel === "OTP" ? "222222" : "123456";
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_ADD_PM_TESTS_RAN__) return;
    w.__EVZONE_ADD_PM_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    assert("validatePhone", validatePhone("+256 761 677 709") === true);
    assert("verify code", demoVerifyCode("3DS") === "123456");

    // eslint-disable-next-line no-console
    console.log("EVzone Add Payment Method: self-tests passed");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

export default function AddPaymentMethodPage() {
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const theme = useTheme();
  const isDark = mode === "dark";

  // Flow
  const steps = ["Method", "Details", "Verify", "Done"] as const;
  const [step, setStep] = useState<number>(0);

  // Base
  const [methodType, setMethodType] = useState<MethodType>("card");
  const [label, setLabel] = useState("Primary method");
  const [setDefault, setSetDefault] = useState(true);

  // Card
  const [useProviderWidget, setUseProviderWidget] = useState(true);
  const [cardProvider, setCardProvider] = useState<CardProvider>("Visa");
  const [cardholder, setCardholder] = useState("Ronald Isabirye");
  const [widgetConfirmed, setWidgetConfirmed] = useState(false);

  // Mobile Money
  const [momoProvider, setMomoProvider] = useState<MomoProvider>("MTN MoMo");
  const [momoPhone, setMomoPhone] = useState("+256 761 677 709");

  // Billing address optional
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [billLine1, setBillLine1] = useState("");
  const [billLine2, setBillLine2] = useState("");
  const [billCity, setBillCity] = useState("Kampala");
  const [billRegion, setBillRegion] = useState("Central");
  const [billPostal, setBillPostal] = useState("");
  const [billCountry, setBillCountry] = useState("Uganda");

  // Verification
  const verifyChannel: VerifyChannel = methodType === "momo" ? "OTP" : "3DS";
  const [verifyCode, setVerifyCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [result, setResult] = useState<ResultState>("idle");

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);


  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const greenContained = {
    backgroundColor: EVZONE.green,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.green, mode === "dark" ? 0.24 : 0.16)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.green, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.green, 0.86), color: "#FFFFFF" },
  } as const;

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

  const cardBrandChipSx = {
    borderColor: alpha(EVZONE.orange, 0.35),
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.10) },
  } as const;

  const methodReady = label.trim().length >= 2;

  const detailsReady = useMemo(() => {
    if (methodType === "card") {
      if (!cardholder.trim()) return false;
      if (useProviderWidget) return widgetConfirmed;
      // if not using widget, treat as demo valid when confirmed
      return widgetConfirmed;
    }
    // momo
    return validatePhone(momoPhone);
  }, [methodType, cardholder, useProviderWidget, widgetConfirmed, momoPhone]);

  const billingReady = useMemo(() => {
    if (!billingEnabled) return true;
    return billLine1.trim().length >= 3 && billCountry.trim().length >= 2;
  }, [billingEnabled, billLine1, billCountry]);

  const verifyReady = verifyCode.trim().length === 6;

  const canNext = useMemo(() => {
    if (result === "verifying") return false;
    if (step === 0) return methodReady;
    if (step === 1) return detailsReady && billingReady;
    if (step === 2) return verifyReady;
    return false;
  }, [step, methodReady, detailsReady, billingReady, verifyReady, result]);

  const goNext = () => {
    if (!canNext) {
      if (step === 0) return setSnack({ open: true, severity: "warning", msg: "Enter a label for this method." });
      if (step === 1) {
        if (!detailsReady) return setSnack({ open: true, severity: "warning", msg: methodType === "card" ? "Confirm card details in the secure widget." : "Enter a valid phone number." });
        if (!billingReady) return setSnack({ open: true, severity: "warning", msg: "Complete required billing address fields." });
      }
      if (step === 2) return setSnack({ open: true, severity: "warning", msg: "Enter the 6-digit verification code." });
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    if (result === "verifying") return;
    setStep((s) => Math.max(0, s - 1));
  };

  const sendCode = () => {
    if (cooldown > 0) return;
    setCooldown(30);
    setSnack({ open: true, severity: "info", msg: methodType === "momo" ? "OTP sent (demo)." : "3DS challenge code sent (demo)." });
  };

  const confirmVerify = async () => {
    if (!verifyReady) {
      setSnack({ open: true, severity: "warning", msg: "Enter the 6-digit code." });
      return;
    }

    setResult("verifying");
    await new Promise((r) => setTimeout(r, 900));

    const ok = verifyCode.trim() === demoVerifyCode(verifyChannel) || Math.random() > 0.15;

    if (ok) {
      setResult("success");
      setStep(3);
      setSnack({ open: true, severity: "success", msg: "Payment method added successfully (demo)." });
    } else {
      setResult("failed");
      setSnack({ open: true, severity: "error", msg: "Verification failed. Try again." });
    }
  };

  const resetAll = () => {
    setStep(0);
    setResult("idle");
    setVerifyCode("");
    setCooldown(0);
    setWidgetConfirmed(false);
    setBillingEnabled(false);
    setSnack({ open: true, severity: "info", msg: "Ready to add another method." });
  };

  const summaryLine = useMemo(() => {
    if (methodType === "card") return `${cardProvider} card • ${label}${setDefault ? " (Default)" : ""}`;
    const d = digitsOnly(momoPhone);
    const last = d.slice(-3);
    return `${momoProvider} ••• ${last || ""} • ${label}${setDefault ? " (Default)" : ""}`;
  }, [methodType, cardProvider, momoProvider, momoPhone, label, setDefault]);

  const SecureWidget = () => (
    <Box sx={{ borderRadius: 18, border: `1px dashed ${alpha(theme.palette.text.primary, 0.18)}`, backgroundColor: alpha(theme.palette.background.paper, 0.35), p: 1.4 }}>
      <Stack spacing={1.2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
          <Typography sx={{ fontWeight: 950 }}>Secure card widget</Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              clickable
              variant={cardProvider === "Visa" ? "filled" : "outlined"}
              color={cardProvider === "Visa" ? "warning" : "default"}
              icon={<BrandVisa size={18} />}
              label="Visa"
              onClick={() => setCardProvider("Visa")}
              sx={cardBrandChipSx}
            />
            <Chip
              clickable
              variant={cardProvider === "Mastercard" ? "filled" : "outlined"}
              color={cardProvider === "Mastercard" ? "warning" : "default"}
              icon={<BrandMastercard size={18} />}
              label="Mastercard"
              onClick={() => setCardProvider("Mastercard")}
              sx={cardBrandChipSx}
            />
          </Stack>
        </Stack>

        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          In production, this area is rendered by your payment provider (Stripe Elements, Checkout.com Frames, Flutterwave, etc.).
        </Typography>

        <Box className="grid gap-3 md:grid-cols-3">
          <Box sx={{ borderRadius: 14, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, p: 1.1 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Card number</Typography>
            <Typography sx={{ fontWeight: 950 }}>•••• •••• •••• 4242</Typography>
          </Box>
          <Box sx={{ borderRadius: 14, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, p: 1.1 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Expiry</Typography>
            <Typography sx={{ fontWeight: 950 }}>12 / 30</Typography>
          </Box>
          <Box sx={{ borderRadius: 14, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, p: 1.1 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>CVC</Typography>
            <Typography sx={{ fontWeight: 950 }}>•••</Typography>
          </Box>
        </Box>

        <FormControlLabel
          control={<Checkbox checked={widgetConfirmed} onChange={(e) => setWidgetConfirmed(e.target.checked)} />}
          label={<Typography sx={{ fontWeight: 900 }}>I entered card details in the secure widget</Typography>}
        />
      </Stack>
    </Box>
  );

  const MomoForm = () => (
    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
      <Stack spacing={1.2}>
        <Typography sx={{ fontWeight: 950 }}>Mobile money</Typography>
        <Box className="grid gap-3 md:grid-cols-2">
          <TextField select label="Provider" value={momoProvider} onChange={(e) => setMomoProvider(e.target.value as MomoProvider)} fullWidth>
            <MenuItem value="MTN MoMo">MTN MoMo</MenuItem>
            <MenuItem value="Airtel Money">Airtel Money</MenuItem>
          </TextField>
          <TextField
            label="Phone number"
            value={momoPhone}
            onChange={(e) => setMomoPhone(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon size={18} />
                </InputAdornment>
              ),
            }}
            helperText="Use the phone that will approve the payment request."
          />
        </Box>
        <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
          For your security, mobile money may require an OTP or an approval on your phone.
        </Alert>
      </Stack>
    </Box>
  );

  const BillingSection = () => (
    <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
      <Stack spacing={1.1}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
          <Box>
            <Typography sx={{ fontWeight: 950 }}>Billing address</Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Optional. Useful for card verification and receipts.</Typography>
          </Box>
          <FormControlLabel control={<Switch checked={billingEnabled} onChange={(e) => setBillingEnabled(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Enable</Typography>} />
        </Stack>

        <Collapse in={billingEnabled}>
          <Box className="grid gap-3 md:grid-cols-2" sx={{ mt: 1 }}>
            <TextField value={billLine1} onChange={(e) => setBillLine1(e.target.value)} label="Address line 1" fullWidth />
            <TextField value={billLine2} onChange={(e) => setBillLine2(e.target.value)} label="Address line 2" fullWidth />
            <TextField value={billCity} onChange={(e) => setBillCity(e.target.value)} label="City" fullWidth />
            <TextField value={billRegion} onChange={(e) => setBillRegion(e.target.value)} label="Region" fullWidth />
            <TextField value={billPostal} onChange={(e) => setBillPostal(e.target.value)} label="Postal code" fullWidth />
            <TextField value={billCountry} onChange={(e) => setBillCountry(e.target.value)} label="Country" fullWidth />
          </Box>

          {!billingReady ? (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Address line 1 and Country are required when billing is enabled.
            </Alert>
          ) : null}
        </Collapse>
      </Stack>
    </Box>
  );

  const VerificationPanel = () => (
    <Card>
      <CardContent className="p-5 md:p-7">
        <Stack spacing={1.4}>
          <Typography variant="h6">Verification</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {methodType === "momo"
              ? "We sent an OTP to your phone (demo)."
              : "Your bank may require a 3DS verification (demo)."}
          </Typography>

          <Alert severity="info" icon={<LockIcon size={18} />}>
            Demo code for {verifyChannel}: <b>{demoVerifyCode(verifyChannel)}</b>
          </Alert>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "stretch", sm: "center" }}>
            <TextField
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              label="6-digit code"
              placeholder="123456"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeypadIcon size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" sx={orangeOutlined} onClick={sendCode} disabled={cooldown > 0}>
              {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}
            </Button>
          </Stack>

          {result === "verifying" ? (
            <Box>
              <LinearProgress />
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Verifying...
              </Typography>
            </Box>
          ) : result === "failed" ? (
            <Alert severity="error" icon={<XCircleIcon size={18} />}>
              Verification failed. Check the code and try again.
            </Alert>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={goBack} disabled={result === "verifying"}>
              Back
            </Button>
            <Button variant="contained" sx={greenContained} startIcon={<ShieldCheckIcon size={18} />} onClick={confirmVerify} disabled={!verifyReady || result === "verifying"}>
              Verify and add
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            In production, verification is performed by the payment provider. This UI simulates the flow.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  const DonePanel = () => (
    <Card>
      <CardContent className="p-5 md:p-7">
        <Stack spacing={1.4}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, 0.16), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
              <CheckCircleIcon size={18} />
            </Box>
            <Box>
              <Typography variant="h6">Payment method added</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {summaryLine}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Alert severity="success">You can now use this method to add funds and pay across EVzone services.</Alert>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button variant="contained" sx={greenContained} onClick={() => navigate("/app/wallet/payment-methods")}>
              Back to payment methods
            </Button>
            <Button variant="outlined" sx={orangeOutlined} onClick={resetAll}>
              Add another
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Note: In production, you should store only tokens, never raw card details.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Box className="min-h-screen" sx={{ background: pageBg }}>


        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              {/* Header */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">Add payment method</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Add a secure method for payments and top-ups. Verification may be required.
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/app/wallet/payment-methods")}>
                          Back
                        </Button>
                        <Button variant="contained" sx={orangeContained} startIcon={<PlusIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Add from provider widget (demo)." })}>
                          Provider tools
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stepper activeStep={step} alternativeLabel>
                      {steps.map((s) => (
                        <Step key={s}>
                          <StepLabel>{s}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>

                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                      EVzone stores payment tokens only. Sensitive details stay with the payment provider.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {step === 0 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.6}>
                      <Typography variant="h6">Choose method</Typography>

                      <Tabs
                        value={methodType === "card" ? 0 : 1}
                        onChange={(_, v) => setMethodType(v === 0 ? "card" : "momo")}
                        variant="fullWidth"
                        sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
                      >
                        <Tab icon={<CardIcon size={18} />} iconPosition="start" label="Card" />
                        <Tab icon={<PhoneIcon size={18} />} iconPosition="start" label="Mobile money" />
                      </Tabs>

                      <Box className="grid gap-3 md:grid-cols-2">
                        <TextField value={label} onChange={(e) => setLabel(e.target.value)} label="Label" placeholder="Example: Primary" fullWidth />
                        <TextField select label="Set as default" value={setDefault ? "yes" : "no"} onChange={(e) => setSetDefault(e.target.value === "yes")} fullWidth>
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </TextField>
                      </Box>

                      <Alert severity="info">
                        {methodType === "card" ? "Cards may require 3D Secure verification." : "Mobile money may require an OTP or phone approval."}
                      </Alert>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" sx={greenContained} onClick={goNext} disabled={!methodReady}>
                          Continue
                        </Button>
                        <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet/payment-methods")}>
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {step === 1 ? (
                <Card>
                  <CardContent className="p-5 md:p-7">
                    <Stack spacing={1.6}>
                      <Typography variant="h6">Enter details</Typography>

                      {methodType === "card" ? (
                        <Stack spacing={1.2}>
                          <FormControlLabel
                            control={<Switch checked={useProviderWidget} onChange={(e) => setUseProviderWidget(e.target.checked)} color="secondary" />}
                            label={<Typography sx={{ fontWeight: 900 }}>Use provider secure widget</Typography>}
                          />

                          <TextField value={cardholder} onChange={(e) => setCardholder(e.target.value)} label="Cardholder name" fullWidth />

                          <SecureWidget />

                          <Alert severity="warning" icon={<LockIcon size={18} />}>
                            Demo note: For security, card inputs should never be handled directly by your frontend.
                          </Alert>
                        </Stack>
                      ) : (
                        <MomoForm />
                      )}

                      <BillingSection />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={goBack}>
                          Back
                        </Button>
                        <Button variant="contained" sx={greenContained} onClick={goNext} disabled={!(detailsReady && billingReady)}>
                          Continue
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}

              {step === 2 ? <VerificationPanel /> : null}

              {step === 3 ? <DonePanel /> : null}

              {/* Mobile sticky actions */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.86), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    {step <= 2 ? (
                      <Stack direction="row" spacing={1}>
                        <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={goBack} disabled={step === 0 || result === "verifying"}>
                          Back
                        </Button>
                        {step === 2 ? (
                          <Button fullWidth variant="contained" sx={greenContained} onClick={confirmVerify} disabled={!verifyReady || result === "verifying"}>
                            Verify
                          </Button>
                        ) : (
                          <Button fullWidth variant="contained" sx={greenContained} onClick={goNext} disabled={!canNext}>
                            Continue
                          </Button>
                        )}
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1}>
                        <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={resetAll}>
                          Add another
                        </Button>
                        <Button fullWidth variant="contained" sx={greenContained} onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /app/wallet/payment-methods (demo)." })}>
                          Methods
                        </Button>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ opacity: 0.92 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
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
    </>
  );
}
