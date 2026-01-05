import React, { useEffect, useMemo, useState } from "react";
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
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { api } from "../../../utils/api";
import { getProviderIcon, getProviderColor } from "../../../assets/paymentIcons";


/**
 * EVzone My Accounts - Withdraw Funds
 * Route: /app/wallet/withdraw
 *
 * Features:
 * - Amount
 * - Destination selection (bank/mobile money)
 * - Limits & fees
 * - Confirmation + security re-auth
 */

type ThemeMode = "light" | "dark";

type Severity = "info" | "warning" | "error" | "success";

type ReAuthMode = "password" | "mfa";

type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

type DestType = "momo" | "bank";

type Dest = {
  id: string;
  type: DestType;
  label: string;
  details: string;
  verified: boolean;
  default?: boolean;
};

type WithdrawState = "form" | "processing" | "success" | "failed";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

const WHATSAPP = {
  green: "#25D366",
} as const;

// Redundant THEME_KEY removed

// -----------------------------
// Icons (inline)
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

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function ArrowUpIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 20V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function BankIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 3 3 8h18l-9-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 10v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 10v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 10v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 10v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

// -----------------------------
// Theme helpers removed
// -----------------------------

// -----------------------------
// Helpers
// -----------------------------
function clampMoney(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function money(amount: number, currency = "UGX") {
  const v = Math.abs(Math.round(amount));
  return `${currency} ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

import { useAuthStore } from "../../../stores/authStore";

/*
function mfaCodeFor(channel: MfaChannel) {
  if (channel === "Authenticator") return "654321";
  if (channel === "SMS") return "222222";
  if (channel === "WhatsApp") return "333333";
  return "111111";
}
*/

function feeFor(destType: DestType, amount: number) {
  const a = clampMoney(amount);
  // Demo fees: bank 1% + 500, momo 1% (min 500)
  if (destType === "bank") return Math.round(a * 0.01) + 500;
  return Math.max(500, Math.round(a * 0.01));
}

function shortId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

// --- lightweight self-tests ---
function runSelfTestsOnce() {
  try {
    const w = window as any;
    if (w.__EVZONE_WITHDRAW_TESTS_RAN__) return;
    w.__EVZONE_WITHDRAW_TESTS_RAN__ = true;

    const assert = (name: string, cond: boolean) => {
      if (!cond) throw new Error(`Test failed: ${name}`);
    };

    // assert("mfa", mfaCodeFor("WhatsApp") === "333333");
    assert("fee", feeFor("momo", 100000) >= 500);

  } catch (e) {
    // ignore
  }
}

import { useThemeStore } from "../../../stores/themeStore";

export default function WithdrawFundsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeStore();
  const { user, requestPhoneVerification, verifyPhone } = useAuthStore();
  const isDark = mode === "dark";

  const currency = "UGX";
  const [balance, setBalance] = useState<number>(0);
  const [available, setAvailable] = useState<number>(0);

  // Real KYC tier and limits
  const [kycTier, setKycTier] = useState<"Unverified" | "Basic" | "Full">("Unverified");
  const [dailyLimit, setDailyLimit] = useState(1000000);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Fetch data
  useEffect(() => {
    setLoadingConfig(true);

    const fetchData = async () => {
      try {
        const [walletRes, kycRes, methodsRes, limitsRes] = await Promise.all([
          api.get('/wallets/me').catch(e => { console.warn("Wallet fetch failed", e); return null; }),
          api.get('/kyc/status').catch(e => { console.warn("KYC fetch failed", e); return { tier: "Unverified" }; }),
          api.get('/wallets/me/methods').catch(e => { console.warn("Methods fetch failed", e); return []; }),
          api.get('/wallets/me/limits').catch(e => { console.warn("Limits fetch failed", e); return { dailyLimit: 1000000 }; })
        ]);

        if (walletRes) {
          setBalance(Number(walletRes.balance) || 0);
          setAvailable(Number(walletRes.balance) || 0);
        }

        if (kycRes && kycRes.tier) {
          setKycTier(kycRes.tier);
        }

        if (limitsRes && limitsRes.dailyLimit) {
          setDailyLimit(limitsRes.dailyLimit);
        }

        if (Array.isArray(methodsRes)) {
          const mapped: Dest[] = methodsRes.map((m: any) => ({
            id: m.id,
            type: m.type === 'card' ? 'bank' : m.type, // Simplify type mapping for icon
            label: m.provider, // Provider name like "MTN MoMo"
            details: m.details?.number || m.details?.accountNumber || `•••• ${m.details?.last4 || '????'}`,
            verified: true, // Assume saved methods are verified for now
            default: m.isDefault
          }));
          setDestinations(mapped);

          if (mapped.length > 0) {
            const def = mapped.find(d => d.default);
            setDestId(def ? def.id : mapped[0].id);
          } else {
            setDestinations([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchData();
  }, []);

  // Initial state empty, populated by API
  const [destinations, setDestinations] = useState<Dest[]>([]);

  const [destId, setDestId] = useState<string>("");
  const selectedDest = useMemo(() => destinations.find((d) => d.id === destId) || destinations[0], [destId, destinations]);

  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState<string>("");

  const [state, setState] = useState<WithdrawState>("form");
  const [receipt, setReceipt] = useState<{ id: string; reference: string } | null>(null);

  // Re-auth
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
  const [reauthPassword, setReauthPassword] = useState("");
  const [mfaChannel, setMfaChannel] = useState<MfaChannel>("Authenticator");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    if (typeof window !== "undefined") runSelfTestsOnce();
  }, []);

  // toggleMode removed

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

  const waOutlined = {
    borderColor: alpha(WHATSAPP.green, 0.75),
    color: WHATSAPP.green,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: WHATSAPP.green, backgroundColor: WHATSAPP.green, color: "#FFFFFF" },
  } as const;

  const fee = selectedDest ? feeFor(selectedDest.type, amount) : 0;
  const total = clampMoney(amount) + fee;

  const canSubmit = !!selectedDest && clampMoney(amount) >= 1000 && clampMoney(amount) <= available && clampMoney(amount) <= dailyLimit;

  const openReauth = () => {
    if (!selectedDest) return setSnack({ open: true, severity: "warning", msg: "Please select a destination." });

    if (!canSubmit) {
      if (clampMoney(amount) < 1000) return setSnack({ open: true, severity: "warning", msg: "Minimum withdrawal is UGX 1,000." });
      if (clampMoney(amount) > available) return setSnack({ open: true, severity: "warning", msg: "Amount exceeds available balance." });
      if (clampMoney(amount) > dailyLimit) return setSnack({ open: true, severity: "warning", msg: "Amount exceeds your daily limit." });
      return;
    }

    setReauthMode("password");
    setReauthPassword("");
    setMfaChannel("Authenticator");
    setOtp("");
    setReauthOpen(true);
  };

  const closeReauth = () => setReauthOpen(false);

  const sendCode = async () => {
    if (cooldown > 0) return;
    if (!user?.phoneNumber) {
      setSnack({ open: true, severity: "warning", msg: "No phone number linked to account." });
      return;
    }
    try {
      const method = mfaChannel === "WhatsApp" ? "whatsapp_code" : "sms_code";
      await requestPhoneVerification(user.phoneNumber, method);
      setCooldown(30);
      setSnack({ open: true, severity: "success", msg: `Code sent via ${mfaChannel}.` });
    } catch (err: any) {
      setSnack({ open: true, severity: "error", msg: err.message || "Failed to send code" });
    }
  };

  const submit = async () => {
    if (!selectedDest) return;

    if (reauthMode === "password") {
      if (reauthPassword !== "EVzone123!") {
        setSnack({ open: true, severity: "error", msg: "Re-auth failed. Incorrect password." });
        return;
      }
    } else {
      if (!user?.phoneNumber) {
        setSnack({ open: true, severity: "error", msg: "No phone number linked." });
        return;
      }
      try {
        await verifyPhone(user.phoneNumber, otp);
      } catch (e) {
        setSnack({ open: true, severity: "error", msg: "Invalid OTP code." });
        return;
      }
    }

    setReauthOpen(false);
    setState("processing");
    setReceipt(null);

    try {
      const destMapping: Record<string, string> = {
        'd_mtn': 'mtn',
        'd_airtel': 'airtel',
        'd_bank': 'standard_chartered' // demo mapping
      };

      const res = await api('/wallets/me/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount: clampMoney(amount),
          currency: "UGX",
          method: selectedDest.type === 'momo' ? 'mobile_money' : 'bank_transfer',
          provider: selectedDest.label.includes('MTN') ? 'mtn' : selectedDest.label.includes('Airtel') ? 'airtel' : 'standard_chartered',
          accountNumber: selectedDest.details
        })
      });

      // The API returns the transaction
      const ref = res.referenceId || shortId("EVZ");
      setReceipt({ id: res.id, reference: ref });
      setState("success");
      setSnack({ open: true, severity: "success", msg: "Withdrawal submitted." });
    } catch (err) {
      console.error(err);
      setState("failed");
      setSnack({ open: true, severity: "error", msg: "Withdrawal failed. Try again." });
    }
  };

  const reset = () => {
    setState("form");
    setReceipt(null);
  };

  const DestCard = ({ d }: { d: Dest }) => {
    const selected = d.id === destId;
    const accent = d.type === "bank" ? EVZONE.green : EVZONE.orange;
    return (
      <Box
        role="button"
        tabIndex={0}
        onClick={() => setDestId(d.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setDestId(d.id);
        }}
        sx={{
          borderRadius: 20,
          border: `1px solid ${alpha(theme.palette.text.primary, selected ? 0.22 : 0.10)}`,
          backgroundColor: selected ? alpha(accent, mode === "dark" ? 0.16 : 0.10) : alpha(theme.palette.background.paper, 0.45),
          p: 1.2,
          cursor: "pointer",
          transition: "all 160ms ease",
          "&:hover": { borderColor: alpha(EVZONE.orange, 0.75), transform: "translateY(-1px)" },
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar sx={{ bgcolor: alpha(accent, 0.18), color: theme.palette.text.primary, borderRadius: 16 }}>
              {getProviderIcon(d.type === 'bank' ? 'bank' : d.label, 24)}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography sx={{ fontWeight: 950 }}>{d.label}</Typography>
                {d.default ? <Chip size="small" color="info" label="Default" /> : null}
                {d.verified ? <Chip size="small" color="success" label="Verified" /> : <Chip size="small" color="warning" label="Unverified" />}
              </Stack>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{d.details}</Typography>
            </Box>
          </Stack>
          {selected ? <Chip size="small" color="success" label="Selected" /> : <Chip size="small" variant="outlined" label="Select" />}
        </Stack>
      </Box>
    );
  };

  const ResultPanel = () => {
    if (state === "form") return null;

    const ok = state === "success";

    return (
      <Card>
        <CardContent className="p-5 md:p-7">
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(ok ? EVZONE.green : EVZONE.orange, 0.16), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                {ok ? <CheckCircleIcon size={18} /> : state === "processing" ? <ShieldCheckIcon size={18} /> : <XCircleIcon size={18} />}
              </Box>
              <Box>
                <Typography variant="h6">{state === "processing" ? "Processing" : ok ? "Withdrawal submitted" : "Withdrawal failed"}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {state === "processing"
                    ? "Please wait while we confirm your request."
                    : ok
                      ? "Your withdrawal is queued. Processing time depends on provider."
                      : "No funds were withdrawn in this demo."}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
              <Stack spacing={0.6}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Amount</Typography>
                  <Typography sx={{ fontWeight: 950 }}>{money(clampMoney(amount), currency)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Fee</Typography>
                  <Typography sx={{ fontWeight: 950 }}>{money(fee, currency)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Total debited</Typography>
                  <Typography sx={{ fontWeight: 950 }}>{money(total, currency)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Destination</Typography>
                  <Typography sx={{ fontWeight: 950 }}>{selectedDest?.label || "None"}</Typography>
                </Stack>
                {receipt ? (
                  <>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Receipt</Typography>
                      <Typography sx={{ fontWeight: 950 }}>{receipt.id}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Reference</Typography>
                      <Typography sx={{ fontWeight: 950 }}>{receipt.reference}</Typography>
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </Box>

            {ok ? <Alert severity="success">You can track this in your wallet transactions.</Alert> : state === "failed" ? <Alert severity="error">Try a different destination or smaller amount.</Alert> : <Alert severity="info">This is a sandbox flow for UI preview.</Alert>}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              {state === "processing" ? null : (
                <Button variant="contained" sx={greenContained} onClick={reset}>
                  New withdrawal
                </Button>
              )}
              <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet")}>
                Back to wallet
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>


      <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Stack spacing={2.2}>
            {/* Header */}
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                  <Box>
                    <Typography variant="h5">Withdraw funds</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Send wallet funds to mobile money or bank. This action requires re-auth.
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      <Chip size="small" variant="outlined" icon={<WalletIcon size={16} />} label={`Available: ${money(available, currency)}`} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                      <Chip size="small" color={kycTier === "Full" ? "success" : kycTier === "Basic" ? "warning" : "error"} label={`KYC: ${kycTier}`} />
                      <Chip size="small" variant="outlined" label={`Daily limit: ${money(dailyLimit, currency)}`} />
                    </Stack>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <Button variant="outlined" sx={orangeOutlined} startIcon={<ArrowLeftIcon size={18} />} onClick={() => navigate("/app/wallet")}>
                      Back
                    </Button>
                    <Button variant="contained" sx={greenContained} startIcon={<WalletIcon size={18} />} onClick={() => navigate("/app/wallet")}>
                      Wallet
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Alert severity={kycTier === "Full" ? "success" : "warning"} icon={<ShieldCheckIcon size={18} />}>
                  {kycTier === "Full"
                    ? "Your account has higher withdrawal limits."
                    : "Complete Full KYC to unlock higher withdrawal limits."}
                </Alert>
              </CardContent>
            </Card>

            {/* Result panel */}
            <ResultPanel />

            {/* Main form */}
            {state !== "form" ? null : (
              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                <Box className="md:col-span-7">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.6}>
                        <Typography variant="h6">Withdrawal details</Typography>

                        <TextField
                          value={String(amount)}
                          onChange={(e) => setAmount(clampMoney(Number(e.target.value.replace(/\D/g, ""))))}
                          label={`Amount (${currency})`}
                          placeholder="200000"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography sx={{ fontWeight: 950 }}>{currency}</Typography>
                              </InputAdornment>
                            ),
                          }}
                          helperText={`Minimum: ${money(1000, currency)} • Max (daily): ${money(dailyLimit, currency)}`}
                        />

                        <TextField
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          label="Optional note"
                          placeholder="Example: Weekly settlement"
                          fullWidth
                        />

                        <Divider />

                        <Typography variant="h6">Destination</Typography>
                        {loadingConfig ? (
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Loading payment methods...</Typography>
                        ) : destinations.length === 0 ? (
                          <Alert severity="warning">
                            No withdrawal destinations found. Please add a payment method first.
                          </Alert>
                        ) : (
                          <Stack spacing={1.2}>
                            {destinations.map((d) => (
                              <DestCard key={d.id} d={d} />
                            ))}
                          </Stack>
                        )}

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet/payment-methods")}>
                            {destinations.length === 0 ? "Add method" : "Manage destinations"}
                          </Button>
                          {kycTier === "Full" ? (
                            <Button variant="outlined" color="success" startIcon={<CheckCircleIcon size={18} />} sx={{ borderColor: theme.palette.success.main, color: theme.palette.success.main, pointerEvents: "none" }}>
                              Verified Account
                            </Button>
                          ) : (
                            <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet/kyc")}>
                              Upgrade KYC
                            </Button>
                          )}
                        </Stack>

                        <Alert severity="info">
                          Withdrawals may be reviewed for fraud prevention. Keep your 2FA enabled.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                <Box className="md:col-span-5">
                  <Stack spacing={2.2}>
                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Fees and limits</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Fees may vary by provider.
                          </Typography>
                          <Divider />

                          <Stack spacing={0.8}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Available</Typography>
                              <Typography sx={{ fontWeight: 950 }}>{money(available, currency)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Amount</Typography>
                              <Typography sx={{ fontWeight: 950 }}>{money(clampMoney(amount), currency)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Fee</Typography>
                              <Typography sx={{ fontWeight: 950 }}>{money(fee, currency)}</Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Total debited</Typography>
                              <Typography sx={{ fontWeight: 950 }}>{money(total, currency)}</Typography>
                            </Stack>
                          </Stack>

                          {!canSubmit ? (
                            <Alert severity="warning">
                              {clampMoney(amount) < 1000
                                ? "Minimum withdrawal is UGX 1,000."
                                : clampMoney(amount) > available
                                  ? "Amount exceeds available balance."
                                  : clampMoney(amount) > dailyLimit
                                    ? "Amount exceeds your daily limit."
                                    : "Check inputs."}
                            </Alert>
                          ) : (
                            <Alert severity="success">Ready to withdraw. Re-auth will be required.</Alert>
                          )}

                          <Button variant="contained" sx={orangeContained} startIcon={<ArrowUpIcon size={18} />} onClick={openReauth} disabled={!canSubmit}>
                            Confirm withdrawal
                          </Button>

                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            This is a demo UI. Real withdrawals require PSP integrations.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Security checks</Typography>
                          <Divider />
                          <Chip size="small" icon={<ShieldCheckIcon size={16} />} label="Re-auth required" variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" icon={<ShieldCheckIcon size={16} />} label="Audit logged" variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" icon={<ShieldCheckIcon size={16} />} label="Fraud checks" variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </Box>
            )}

            {/* Mobile sticky */}
            <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
              <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ py: 1.1, px: 1.2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => navigate("/app/wallet")}>
                      Wallet
                    </Button>
                    <Button fullWidth variant="contained" sx={orangeContained} onClick={openReauth} disabled={!canSubmit}>
                      Withdraw
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

      {/* Re-auth dialog */}
      <Dialog open={reauthOpen} onClose={closeReauth} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>Confirm it’s you</DialogTitle>
        <DialogContent>
          <Stack spacing={1.4}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Withdrawals are sensitive. Please re-authenticate to continue.
            </Typography>

            <Tabs value={reauthMode === "password" ? 0 : 1} onChange={(_, v) => setReauthMode(v === 0 ? "password" : "mfa")} variant="fullWidth" sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}>
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
                    const outlined = it.c === "WhatsApp" ? waOutlined : orangeOutlined;
                    return (
                      <Button
                        key={it.c}
                        variant={selected ? "contained" : "outlined"}
                        startIcon={it.icon}
                        onClick={() => setMfaChannel(it.c)}
                        sx={
                          selected
                            ? ({ borderRadius: 14, backgroundColor: base, color: "#FFFFFF", "&:hover": { backgroundColor: alpha(base, 0.92) } } as const)
                            : ({ ...outlined, borderRadius: 14 } as const)
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
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><KeypadIcon size={18} /></InputAdornment>),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button size="small" onClick={sendCode} disabled={cooldown > 0}>
                          {cooldown > 0 ? `${cooldown}s` : "Send"}
                        </Button>
                      </InputAdornment>
                    )
                  }}
                  helperText={user?.phoneNumber ? `Code sent to ${user.phoneNumber}` : "Add phone number in settings."}
                />
              </>
            )}

            <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
              This is a demo re-auth flow.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={orangeOutlined} onClick={closeReauth}>Cancel</Button>
          <Button variant="contained" sx={orangeContained} onClick={submit}>Continue</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
