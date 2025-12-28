import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Checkbox,
  Chip,
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
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";

/**
 * EVzone My Accounts - Contact Details v2
 * Route: /app/profile/contact
 *
 * Update: Multi-contact support
 * - Multiple emails and phones (Personal/Work/Other)
 * - Different numbers for SMS and WhatsApp supported
 * - Per-purpose defaults (security alerts, password reset, receipts, MFA)
 * - Add/Edit/Verify/Remove with safety checks
 *
 * Style rules:
 * - Background: green-only
 * - EVzone actions: orange-only buttons with white text (outlined hover -> solid orange + white text)
 * - WhatsApp-specific UI may use WhatsApp green
 */

type Severity = "info" | "warning" | "error" | "success";

type ContactLabel = "Personal" | "Work" | "Other";

type EmailContact = {
  id: string;
  label: ContactLabel;
  email: string;
  verified: boolean;
  loginEnabled: boolean;
  createdAt: number;
  lastUsedAt?: number;
};

type PhoneContact = {
  id: string;
  label: ContactLabel;
  phone: string;
  verified: boolean;
  loginEnabled: boolean;
  smsCapable: boolean;
  whatsappCapable: boolean;
  createdAt: number;
  lastUsedAt?: number;
};

type Purpose =
  | "security_email"
  | "security_sms"
  | "security_whatsapp"
  | "reset_email"
  | "reset_sms"
  | "reset_whatsapp"
  | "receipts_email"
  | "mfa_sms"
  | "mfa_whatsapp";

type Prefs = Record<Purpose, string | null>;

type ChangeType = "email" | "phone";

type DialogMode = "add" | "edit";

type VerifyChannel = "Email" | "SMS" | "WhatsApp";

type DialogStep = "form" | "otp" | "done";

const EVZONE = {
  green: "#03cd8c",
  orange: "#f77f00",
} as const;

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
      <path
        d="M21 13a8 8 0 0 1-10-10 7.5 7.5 0 1 0 10 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
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

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="m8.5 12 2.3 2.3L15.8 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function PencilIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
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

function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </IconBase>
  );
}

function TimerIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M10 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 14l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 448 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

// Redundant EVZONE removed

// -----------------------------
// Helpers
// -----------------------------
function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function isEmail(v: string) {
  return /.+@.+\..+/.test(v.trim());
}

function isPhone(v: string) {
  return /^\+?[0-9\s-]{8,}$/.test(v.trim());
}

function maskEmail(email: string) {
  const e = email.trim();
  if (!isEmail(e)) return e;
  const [u, d] = e.split("@");
  const safeU = u.length <= 2 ? u[0] + "*" : u.slice(0, 2) + "***";
  return `${safeU}@${d}`;
}

function maskPhone(phone: string) {
  const s = phone.trim().replace(/\s+/g, "");
  if (s.length <= 6) return s;
  return `${s.slice(0, 3)}***${s.slice(-3)}`;
}

function otpCodeFor(channel: VerifyChannel) {
  if (channel === "Email") return "111111";
  if (channel === "SMS") return "222222";
  return "333333"; // WhatsApp
}

// OTP input
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
    window.setTimeout(() => refs.current[0]?.focus(), 150);
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
            className="w-full rounded-[4px] border border-white/10 bg-transparent px-0 py-3 text-center text-lg font-extrabold outline-none"
            style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "inherit" }}
            aria-label={`OTP digit ${i + 1}`}
          />
        </Box>
      ))}
    </Box>
  );
}

function purposeLabel(p: Purpose) {
  switch (p) {
    case "security_email":
      return "Security alerts (Email)";
    case "security_sms":
      return "Security alerts (SMS)";
    case "security_whatsapp":
      return "Security alerts (WhatsApp)";
    case "reset_email":
      return "Password reset (Email)";
    case "reset_sms":
      return "Password reset (SMS)";
    case "reset_whatsapp":
      return "Password reset (WhatsApp)";
    case "receipts_email":
      return "Receipts & invoices (Email)";
    case "mfa_sms":
      return "MFA fallback (SMS)";
    case "mfa_whatsapp":
      return "MFA fallback (WhatsApp)";
    default:
      return p;
  }
}

function isWhatsAppPurpose(p: Purpose) {
  return p.includes("whatsapp");
}

export default function ContactSettings() {
  const { mode } = useThemeContext();
  const theme = useTheme();
  const isDark = mode === "dark";

  // Sample data
  const [emails, setEmails] = useState<EmailContact[]>(() => [
    { id: "e_personal", label: "Personal", email: "ronald@evzone.com", verified: true, loginEnabled: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120, lastUsedAt: Date.now() - 1000 * 60 * 60 * 2 },
    { id: "e_work", label: "Work", email: "ronald.isabirye@evworld.africa", verified: true, loginEnabled: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45, lastUsedAt: Date.now() - 1000 * 60 * 60 * 6 },
  ]);

  const [phones, setPhones] = useState<PhoneContact[]>(() => [
    { id: "p_sms", label: "Personal", phone: "+256761677709", verified: true, loginEnabled: true, smsCapable: true, whatsappCapable: false, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 220, lastUsedAt: Date.now() - 1000 * 60 * 60 * 3 },
    { id: "p_wa", label: "Work", phone: "+256700000111", verified: true, loginEnabled: false, smsCapable: false, whatsappCapable: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, lastUsedAt: Date.now() - 1000 * 60 * 60 * 10 },
  ]);

  const [prefs, setPrefs] = useState<Prefs>(() => ({
    security_email: "e_personal",
    security_sms: "p_sms",
    security_whatsapp: "p_wa",
    reset_email: "e_personal",
    reset_sms: "p_sms",
    reset_whatsapp: "p_wa",
    receipts_email: "e_work",
    mfa_sms: "p_sms",
    mfa_whatsapp: "p_wa",
  }));

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  // dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [editType, setEditType] = useState<ChangeType>("email");
  const [editMode, setEditMode] = useState<DialogMode>("add");
  const [editStep, setEditStep] = useState<DialogStep>("form");
  const [editId, setEditId] = useState<string | null>(null);

  // form fields
  const [label, setLabel] = useState<ContactLabel>("Personal");
  const [value, setValue] = useState<string>("");
  const [loginEnabled, setLoginEnabled] = useState<boolean>(true);
  const [smsCapable, setSmsCapable] = useState<boolean>(true);
  const [whatsappCapable, setWhatsappCapable] = useState<boolean>(true);
  const [verified, setVerified] = useState<boolean>(false);

  const [verifyChannel, setVerifyChannel] = useState<VerifyChannel>("Email");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState<number>(0);
  const [codeSent, setCodeSent] = useState<boolean>(false);

  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeType, setRemoveType] = useState<ChangeType>("email");
  const [removeId, setRemoveId] = useState<string | null>(null);

  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const [defaultsDraft, setDefaultsDraft] = useState<Prefs>(prefs);

  // toggleMode removed

  // toggleMode removed

  const orangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.35),
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const whatsappOutlinedSx = {
    borderColor: alpha(WHATSAPP.green, 0.75),
    color: WHATSAPP.green,
    backgroundColor: alpha(theme.palette.background.paper, 0.35),
    "&:hover": { borderColor: WHATSAPP.green, backgroundColor: WHATSAPP.green, color: "#FFFFFF" },
  } as const;

  const orangeTextSx = {
    color: EVZONE.orange,
    fontWeight: 900,
    "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) },
  } as const;

  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  // computed lists for selects
  const emailOptions = useMemo(() => {
    return emails.map((e) => ({ id: e.id, label: `${e.label}: ${maskEmail(e.email)}${e.verified ? "" : " (unverified)"}` }));
  }, [emails]);

  const smsPhoneOptions = useMemo(() => {
    return phones
      .filter((p) => p.smsCapable)
      .map((p) => ({ id: p.id, label: `${p.label}: ${maskPhone(p.phone)}${p.verified ? "" : " (unverified)"}` }));
  }, [phones]);

  const waPhoneOptions = useMemo(() => {
    return phones
      .filter((p) => p.whatsappCapable)
      .map((p) => ({ id: p.id, label: `${p.label}: ${maskPhone(p.phone)}${p.verified ? "" : " (unverified)"}` }));
  }, [phones]);

  const verifiedRecoveryCount = useMemo(() => {
    const ve = emails.filter((e) => e.verified).length;
    const vp = phones.filter((p) => p.verified).length;
    return ve + vp;
  }, [emails, phones]);

  const openAdd = (type: ChangeType) => {
    setEditType(type);
    setEditMode("add");
    setEditId(null);
    setEditStep("form");

    setLabel("Personal");
    setValue("");
    setLoginEnabled(true);
    setVerified(false);

    if (type === "phone") {
      setSmsCapable(true);
      setWhatsappCapable(true);
      setVerifyChannel("SMS");
    } else {
      setVerifyChannel("Email");
    }

    setOtp(["", "", "", "", "", ""]);
    setCooldown(0);
    setCodeSent(false);

    setEditOpen(true);
  };

  const openEdit = (type: ChangeType, id: string) => {
    setEditType(type);
    setEditMode("edit");
    setEditId(id);
    setEditStep("form");

    if (type === "email") {
      const e = emails.find((x) => x.id === id);
      if (!e) return;
      setLabel(e.label);
      setValue(e.email);
      setLoginEnabled(e.loginEnabled);
      setVerified(e.verified);
      setVerifyChannel("Email");
    } else {
      const p = phones.find((x) => x.id === id);
      if (!p) return;
      setLabel(p.label);
      setValue(p.phone);
      setLoginEnabled(p.loginEnabled);
      setSmsCapable(p.smsCapable);
      setWhatsappCapable(p.whatsappCapable);
      setVerified(p.verified);
      setVerifyChannel(p.smsCapable ? "SMS" : p.whatsappCapable ? "WhatsApp" : "SMS");
    }

    setOtp(["", "", "", "", "", ""]);
    setCooldown(0);
    setCodeSent(false);

    setEditOpen(true);
  };

  const openRemove = (type: ChangeType, id: string) => {
    setRemoveType(type);
    setRemoveId(id);
    setRemoveOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditStep("form");
  };

  const startVerification = () => {
    const v = value.trim();
    if (editType === "email") {
      if (!isEmail(v)) {
        setSnack({ open: true, severity: "warning", msg: "Enter a valid email address." });
        return;
      }
      setVerifyChannel("Email");
    } else {
      if (!isPhone(v)) {
        setSnack({ open: true, severity: "warning", msg: "Enter a valid phone number." });
        return;
      }
      if (!smsCapable && !whatsappCapable) {
        setSnack({ open: true, severity: "warning", msg: "Enable SMS and/or WhatsApp capability for this phone." });
        return;
      }
      if (verifyChannel === "SMS" && !smsCapable) {
        setVerifyChannel(whatsappCapable ? "WhatsApp" : "SMS");
      }
      if (verifyChannel === "WhatsApp" && !whatsappCapable) {
        setVerifyChannel(smsCapable ? "SMS" : "WhatsApp");
      }
    }

    setCodeSent(true);
    setCooldown(30);
    setEditStep("otp");

    setSnack({
      open: true,
      severity: "success",
      msg: `Verification code sent via ${verifyChannel}. Demo code: ${otpCodeFor(verifyChannel)}`,
    });
  };

  const verifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6) {
      setSnack({ open: true, severity: "warning", msg: "Enter the 6-digit code." });
      return;
    }

    if (code !== otpCodeFor(verifyChannel)) {
      setSnack({ open: true, severity: "error", msg: "Incorrect code. Try again." });
      return;
    }

    // apply changes
    if (editType === "email") {
      const emailVal = value.trim();
      if (editMode === "add") {
        const id = uid("email");
        setEmails((prev) => [
          ...prev,
          {
            id,
            label,
            email: emailVal,
            verified: true,
            loginEnabled,
            createdAt: Date.now(),
          },
        ]);

        // auto-assign defaults if empty
        setPrefs((prev) => ({
          ...prev,
          security_email: prev.security_email ?? id,
          reset_email: prev.reset_email ?? id,
          receipts_email: prev.receipts_email ?? id,
        }));
      } else {
        setEmails((prev) =>
          prev.map((e) =>
            e.id === editId
              ? { ...e, label, email: emailVal, verified: true, loginEnabled }
              : e
          )
        );
      }
    } else {
      const phoneVal = value.trim();
      if (editMode === "add") {
        const id = uid("phone");
        setPhones((prev) => [
          ...prev,
          {
            id,
            label,
            phone: phoneVal,
            verified: true,
            loginEnabled,
            smsCapable,
            whatsappCapable,
            createdAt: Date.now(),
          },
        ]);

        setPrefs((prev) => ({
          ...prev,
          security_sms: prev.security_sms ?? (smsCapable ? id : prev.security_sms),
          security_whatsapp: prev.security_whatsapp ?? (whatsappCapable ? id : prev.security_whatsapp),
          reset_sms: prev.reset_sms ?? (smsCapable ? id : prev.reset_sms),
          reset_whatsapp: prev.reset_whatsapp ?? (whatsappCapable ? id : prev.reset_whatsapp),
          mfa_sms: prev.mfa_sms ?? (smsCapable ? id : prev.mfa_sms),
          mfa_whatsapp: prev.mfa_whatsapp ?? (whatsappCapable ? id : prev.mfa_whatsapp),
        }));
      } else {
        setPhones((prev) =>
          prev.map((p) =>
            p.id === editId
              ? { ...p, label, phone: phoneVal, verified: true, loginEnabled, smsCapable, whatsappCapable }
              : p
          )
        );

        // if capability removed and it is used in defaults, clear affected prefs
        const id = editId;
        if (id) {
          setPrefs((prev) => {
            const next = { ...prev };
            const clearIf = (key: Purpose, cond: boolean) => {
              if (cond && next[key] === id) next[key] = null;
            };
            clearIf("security_sms", !smsCapable);
            clearIf("reset_sms", !smsCapable);
            clearIf("mfa_sms", !smsCapable);
            clearIf("security_whatsapp", !whatsappCapable);
            clearIf("reset_whatsapp", !whatsappCapable);
            clearIf("mfa_whatsapp", !whatsappCapable);
            return next;
          });
        }
      }
    }

    setEditStep("done");
    setSnack({ open: true, severity: "success", msg: "Contact verified and saved." });
  };

  const finishEdit = () => {
    setEditOpen(false);
    setEditStep("form");
  };

  const removeContact = () => {
    if (!removeId) return;

    // Safety: keep at least 1 verified recovery method
    const removingVerified =
      removeType === "email"
        ? Boolean(emails.find((e) => e.id === removeId)?.verified)
        : Boolean(phones.find((p) => p.id === removeId)?.verified);

    if (removingVerified && verifiedRecoveryCount <= 1) {
      setSnack({ open: true, severity: "warning", msg: "You must keep at least one verified contact for account recovery." });
      setRemoveOpen(false);
      return;
    }

    if (removeType === "email") {
      setEmails((prev) => prev.filter((e) => e.id !== removeId));
      setPrefs((prev) => {
        const next = { ...prev };
        (Object.keys(next) as Purpose[]).forEach((k) => {
          if (k.endsWith("_email") && next[k] === removeId) next[k] = null;
        });
        return next;
      });
    } else {
      setPhones((prev) => prev.filter((p) => p.id !== removeId));
      setPrefs((prev) => {
        const next = { ...prev };
        (Object.keys(next) as Purpose[]).forEach((k) => {
          if (!k.endsWith("_email") && next[k] === removeId) next[k] = null;
        });
        return next;
      });
    }

    setRemoveOpen(false);
    setSnack({ open: true, severity: "success", msg: "Contact removed." });
  };

  const openDefaults = () => {
    setDefaultsDraft(prefs);
    setDefaultsOpen(true);
  };

  const saveDefaults = () => {
    // Validate: if a phone default is set for WhatsApp, ensure that phone is WhatsApp-capable
    const phoneById = new Map(phones.map((p) => [p.id, p] as const));

    const enforceCap = (key: Purpose, cap: "sms" | "whatsapp") => {
      const id = defaultsDraft[key];
      if (!id) return;
      const p = phoneById.get(id);
      if (!p) {
        defaultsDraft[key] = null;
        return;
      }
      if (cap === "sms" && !p.smsCapable) defaultsDraft[key] = null;
      if (cap === "whatsapp" && !p.whatsappCapable) defaultsDraft[key] = null;
    };

    enforceCap("security_sms", "sms");
    enforceCap("reset_sms", "sms");
    enforceCap("mfa_sms", "sms");
    enforceCap("security_whatsapp", "whatsapp");
    enforceCap("reset_whatsapp", "whatsapp");
    enforceCap("mfa_whatsapp", "whatsapp");

    setPrefs({ ...defaultsDraft });
    setDefaultsOpen(false);
    setSnack({ open: true, severity: "success", msg: "Defaults saved." });
  };

  // UI
  const TopBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <Box
      sx={{
        px: 1,
        py: 0.35,
        borderRadius: 999,
        backgroundColor: ok ? alpha(EVZONE.green, 0.16) : alpha(EVZONE.orange, 0.16),
        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 950 }}>
        {label}
      </Typography>
    </Box>
  );

  const EmailRow = ({ item }: { item: EmailContact }) => {
    const isDefaultSecurity = prefs.security_email === item.id;
    const isDefaultReset = prefs.reset_email === item.id;
    const isDefaultReceipts = prefs.receipts_email === item.id;

    return (
      <Box
        sx={{
          borderRadius: 18,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.45),
          p: 1.2,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }}>
          <Stack direction="row" spacing={1.2} alignItems="center" flex={1}>
            <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary }}>
              <MailIcon size={18} />
            </Avatar>
            <Box flex={1}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
                <Typography sx={{ fontWeight: 950 }}>{item.label} email</Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {maskEmail(item.email)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 0.6 }}>
                <Chip size="small" color={item.verified ? "success" : "warning"} label={item.verified ? "Verified" : "Unverified"} />
                <Chip size="small" variant="outlined" label={item.loginEnabled ? "Login enabled" : "Login disabled"} />
                {isDefaultSecurity ? <Chip size="small" color="info" label="Security" /> : null}
                {isDefaultReset ? <Chip size="small" color="info" label="Reset" /> : null}
                {isDefaultReceipts ? <Chip size="small" color="info" label="Receipts" /> : null}
              </Stack>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Button
              variant="outlined"
              sx={orangeOutlinedSx}
              startIcon={<PencilIcon size={18} />}
              onClick={() => openEdit("email", item.id)}
              fullWidth
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              sx={orangeOutlinedSx}
              startIcon={<TrashIcon size={18} />}
              onClick={() => openRemove("email", item.id)}
              fullWidth
            >
              Remove
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  };

  const PhoneRow = ({ item }: { item: PhoneContact }) => {
    const isDefaultSms = prefs.security_sms === item.id || prefs.reset_sms === item.id || prefs.mfa_sms === item.id;
    const isDefaultWa = prefs.security_whatsapp === item.id || prefs.reset_whatsapp === item.id || prefs.mfa_whatsapp === item.id;

    return (
      <Box
        sx={{
          borderRadius: 18,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.45),
          p: 1.2,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }}>
          <Stack direction="row" spacing={1.2} alignItems="center" flex={1}>
            <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary }}>
              <PhoneIcon size={18} />
            </Avatar>
            <Box flex={1}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
                <Typography sx={{ fontWeight: 950 }}>{item.label} phone</Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {maskPhone(item.phone)}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 0.6 }}>
                <Chip size="small" color={item.verified ? "success" : "warning"} label={item.verified ? "Verified" : "Unverified"} />
                <Chip size="small" variant="outlined" label={item.loginEnabled ? "Login enabled" : "Login disabled"} />
                {item.smsCapable ? <Chip size="small" label="SMS" /> : <Chip size="small" variant="outlined" label="No SMS" />}
                {item.whatsappCapable ? (
                  <Chip
                    size="small"
                    label="WhatsApp"
                    sx={{
                      border: `1px solid ${alpha(WHATSAPP.green, 0.6)}`,
                      color: WHATSAPP.green,
                      backgroundColor: alpha(WHATSAPP.green, 0.10),
                    }}
                  />
                ) : (
                  <Chip size="small" variant="outlined" label="No WhatsApp" />
                )}
                {isDefaultSms ? <Chip size="small" color="info" label="Used for SMS default" /> : null}
                {isDefaultWa ? <Chip size="small" color="info" label="Used for WhatsApp default" /> : null}
              </Stack>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Button variant="outlined" sx={orangeOutlinedSx} startIcon={<PencilIcon size={18} />} onClick={() => openEdit("phone", item.id)} fullWidth>
              Edit
            </Button>
            <Button variant="outlined" sx={orangeOutlinedSx} startIcon={<TrashIcon size={18} />} onClick={() => openRemove("phone", item.id)} fullWidth>
              Remove
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  };

  const openVerifyChannelForPhone = (c: VerifyChannel) => {
    if (editType !== "phone") return;
    if (c === "SMS" && !smsCapable) return;
    if (c === "WhatsApp" && !whatsappCapable) return;
    setVerifyChannel(c);
  };

  const channelCard = (c: VerifyChannel) => {
    const isWA = c === "WhatsApp";
    const selected = verifyChannel === c;
    const base = isWA ? WHATSAPP.green : EVZONE.orange;
    const enabled = editType === "email" ? c === "Email" : c !== "Email" ? (c === "SMS" ? smsCapable : whatsappCapable) : false;

    return (
      <ButtonBase disabled={!enabled} onClick={() => enabled && (editType === "email" ? setVerifyChannel("Email") : openVerifyChannelForPhone(c))} sx={{ width: "100%", textAlign: "left", opacity: enabled ? 1 : 0.55 }}>
        <Box
          sx={{
            width: "100%",
            borderRadius: 16,
            border: `1px solid ${alpha(base, selected ? 0.95 : 0.55)}`,
            backgroundColor: selected ? base : alpha(theme.palette.background.paper, 0.35),
            color: selected ? "#FFFFFF" : base,
            p: 1.1,
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
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 34, height: 34, borderRadius: 14, display: "grid", placeItems: "center", backgroundColor: selected ? alpha("#FFFFFF", 0.18) : alpha(base, mode === "dark" ? 0.16 : 0.10), border: `1px solid ${alpha(selected ? "#FFFFFF" : base, 0.26)}`, color: "inherit" }}>
              {c === "Email" ? <MailIcon size={18} /> : c === "SMS" ? <PhoneIcon size={18} /> : <WhatsAppIcon size={18} />}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 950, color: "inherit" }}>{c}</Typography>
              <Typography variant="caption" sx={{ color: selected ? alpha("#FFFFFF", 0.86) : theme.palette.text.secondary }}>
                {c === "Email" ? "Email code" : c === "SMS" ? "SMS code" : "WhatsApp code"}
              </Typography>
            </Box>
            <Box flex={1} />
            {selected ? (
              <Box sx={{ color: "#FFFFFF" }}>
                <CheckCircleIcon size={18} />
              </Box>
            ) : null}
          </Stack>
        </Box>
      </ButtonBase>
    );
  };

  // layout
  return (
    <>
      <Stack spacing={2.2}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card sx={{ borderRadius: "4px" }}>
            <CardContent className="p-5 md:p-7">
              <Stack spacing={2.0}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                  <Box>
                    <Typography variant="h5">Contact details</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Add multiple emails and phone numbers. Choose defaults per purpose.
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Button variant="outlined" sx={orangeOutlinedSx} onClick={openDefaults}>
                      Manage defaults
                    </Button>
                    <Button variant="contained" color="secondary" sx={orangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={() => openAdd("email")}>
                      Add email
                    </Button>
                    <Button variant="contained" color="secondary" sx={orangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={() => openAdd("phone")}>
                      Add phone
                    </Button>
                  </Stack>
                </Stack>

                <Divider />

                <Alert severity={verifiedRecoveryCount > 0 ? "info" : "warning"}>
                  {verifiedRecoveryCount > 0
                    ? "Tip: Keep at least one verified contact for password reset and security alerts."
                    : "No verified contacts found. Add and verify at least one contact for account recovery."}
                </Alert>

                {/* Defaults summary */}
                <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                  <Stack spacing={0.8}>
                    <Typography sx={{ fontWeight: 950 }}>Current defaults</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Security: {prefs.security_email ? "Email" : "(none)"} • {prefs.security_sms ? "SMS" : ""} • {prefs.security_whatsapp ? "WhatsApp" : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Password reset: {prefs.reset_email ? "Email" : ""} {prefs.reset_sms ? "SMS" : ""} {prefs.reset_whatsapp ? "WhatsApp" : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Receipts: {prefs.receipts_email ? "Email" : "(none)"}
                    </Typography>
                  </Stack>
                </Box>

                {/* Emails + Phones */}
                <Box className="grid gap-4 md:grid-cols-2">
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography sx={{ fontWeight: 950 }}>Emails</Typography>
                      <Button variant="text" sx={orangeTextSx} onClick={() => openAdd("email")}>
                        Add
                      </Button>
                    </Stack>
                    <Stack spacing={1.2}>
                      {emails.map((e) => (
                        <EmailRow key={e.id} item={e} />
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography sx={{ fontWeight: 950 }}>Phones</Typography>
                      <Button variant="text" sx={orangeTextSx} onClick={() => openAdd("phone")}>
                        Add
                      </Button>
                    </Stack>
                    <Stack spacing={1.2}>
                      {phones.map((p) => (
                        <PhoneRow key={p.id} item={p} />
                      ))}
                    </Stack>
                  </Box>
                </Box>

                {/* Mobile footer actions (removed since embedded) */}
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Stack>

      {/* Add/Edit dialog */}
      <Dialog
        open={editOpen}
        onClose={closeEdit}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>
          {editMode === "add" ? "Add" : "Edit"} {editType === "email" ? "email" : "phone"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.4}>
            {editStep === "done" ? (
              <Alert severity="success">Saved and verified successfully.</Alert>
            ) : null}

            {editStep === "form" ? (
              <>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {editType === "email"
                    ? "Add an email address you can use for login, security alerts, and receipts."
                    : "Add a phone number and choose whether it is used for SMS, WhatsApp, or both."}
                </Typography>

                <TextField
                  select
                  label="Label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value as ContactLabel)}
                  fullWidth
                >
                  {(["Personal", "Work", "Other"] as ContactLabel[]).map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  label={editType === "email" ? "Email" : "Phone"}
                  placeholder={editType === "email" ? "name@example.com" : "+256..."}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {editType === "email" ? <MailIcon size={18} /> : <PhoneIcon size={18} />}
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    editType === "email"
                      ? isEmail(value) || !value ? "" : "Enter a valid email address."
                      : isPhone(value) || !value ? "" : "Enter a valid phone number."
                  }
                />

                {editType === "phone" ? (
                  <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                    <Typography sx={{ fontWeight: 950, mb: 0.8 }}>Capabilities</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={smsCapable}
                            onChange={(e) => setSmsCapable(e.target.checked)}
                            sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }}
                          />
                        }
                        label={<Typography variant="body2">SMS</Typography>}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={whatsappCapable}
                            onChange={(e) => setWhatsappCapable(e.target.checked)}
                            sx={{ color: alpha(WHATSAPP.green, 0.7), "&.Mui-checked": { color: WHATSAPP.green } }}
                          />
                        }
                        label={<Typography variant="body2">WhatsApp</Typography>}
                      />
                    </Stack>
                  </Box>
                ) : null}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={loginEnabled}
                      onChange={(e) => setLoginEnabled(e.target.checked)}
                      sx={{ color: alpha(EVZONE.orange, 0.7), "&.Mui-checked": { color: EVZONE.orange } }}
                    />
                  }
                  label={<Typography variant="body2">Enable as a login identifier</Typography>}
                />

                <Divider />

                <Typography sx={{ fontWeight: 950 }}>Verification channel</Typography>
                {editType === "email" ? (
                  <Box>
                    {channelCard("Email")}
                  </Box>
                ) : (
                  <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {channelCard("SMS")}
                    {channelCard("WhatsApp")}
                  </Box>
                )}

                <Alert severity="info">
                  We will send a verification code. Demo codes: Email 111111, SMS 222222, WhatsApp 333333.
                </Alert>
              </>
            ) : null}

            {editStep === "otp" ? (
              <>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Enter the 6-digit code sent via <b>{verifyChannel}</b>.
                </Typography>

                <OtpInput value={otp} onChange={setOtp} autoFocus />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                  <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={verifyOtp}>
                    Verify
                  </Button>
                  <Button
                    variant="outlined"
                    sx={verifyChannel === "WhatsApp" ? whatsappOutlinedSx : orangeOutlinedSx}
                    startIcon={<TimerIcon size={18} />}
                    disabled={!codeSent || cooldown > 0}
                    onClick={() => {
                      if (cooldown === 0) {
                        setCooldown(30);
                        setSnack({ open: true, severity: "success", msg: `Code resent via ${verifyChannel}. Demo code: ${otpCodeFor(verifyChannel)}` });
                      }
                    }}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                  </Button>
                </Stack>

                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Demo code: <b>{otpCodeFor(verifyChannel)}</b>
                </Typography>
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={orangeOutlinedSx} onClick={closeEdit}>
            Close
          </Button>
          {editStep === "form" ? (
            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={startVerification}>
              Send code
            </Button>
          ) : editStep === "otp" ? (
            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={verifyOtp}>
              Verify
            </Button>
          ) : (
            <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={finishEdit}>
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Remove confirm */}
      <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)} PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>Remove contact</DialogTitle>
        <DialogContent>
          <Stack spacing={1.2}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Are you sure you want to remove this contact? Defaults that reference it will be cleared.
            </Typography>
            <Alert severity={verifiedRecoveryCount <= 1 ? "warning" : "info"} icon={<AlertTriangleIcon size={18} />}>
              {verifiedRecoveryCount <= 1
                ? "Safety: You must keep at least one verified contact for account recovery."
                : "Tip: Keep at least one verified email and one verified phone when possible."}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setRemoveOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={removeContact}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Defaults dialog */}
      <Dialog open={defaultsOpen} onClose={() => setDefaultsOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>Per-purpose defaults</DialogTitle>
        <DialogContent>
          <Stack spacing={1.4}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Choose which contact point to use for each purpose. This supports different numbers for SMS and WhatsApp.
            </Typography>

            <Alert severity="info">
              Recommended: Keep security alerts enabled on at least two channels (email + SMS/WhatsApp).
            </Alert>

            <Divider />

            <Typography sx={{ fontWeight: 950 }}>Security alerts</Typography>
            <Box className="grid gap-3 md:grid-cols-3">
              <TextField
                select
                label={purposeLabel("security_email")}
                value={defaultsDraft.security_email || ""}
                onChange={(e) => setDefaultsDraft((p) => ({ ...p, security_email: e.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">(none)</MenuItem>
                {emailOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label={purposeLabel("security_sms")}
                value={defaultsDraft.security_sms || ""}
                onChange={(e) => setDefaultsDraft((p) => ({ ...p, security_sms: e.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">(none)</MenuItem>
                {smsPhoneOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label={purposeLabel("security_whatsapp")}
                value={defaultsDraft.security_whatsapp || ""}
                onChange={(e) => setDefaultsDraft((p) => ({ ...p, security_whatsapp: e.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">(none)</MenuItem>
                {waPhoneOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Divider />

            <Typography sx={{ fontWeight: 950 }}>Password reset</Typography>
            <Box className="grid gap-3 md:grid-cols-3">
              <TextField
                select
                label={purposeLabel("reset_email")}
                value={defaultsDraft.reset_email || ""}
                onChange={(e) => setDefaultsDraft((p) => ({ ...p, reset_email: e.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">(none)</MenuItem>
                {emailOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label={purposeLabel("reset_sms")}
                value={defaultsDraft.reset_sms || ""}
                onChange={(e) => setDefaultsDraft((p) => ({ ...p, reset_sms: e.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">(none)</MenuItem>
                {smsPhoneOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label={purposeLabel("reset_whatsapp")}
                value={defaultsDraft.reset_whatsapp || ""}
                onChange={(e) => setDefaultsDraft((p) => ({ ...p, reset_whatsapp: e.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">(none)</MenuItem>
                {waPhoneOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Divider />

            <Typography sx={{ fontWeight: 950 }}>Receipts</Typography>
            <Box className="grid gap-3 md:grid-cols-2">
              <TextField
                select
                label={purposeLabel("receipts_email")}
                value={defaultsDraft.receipts_email || ""}
                onChange={(e) => setDefaultsDraft((p) => ({ ...p, receipts_email: e.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">(none)</MenuItem>
                {emailOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Divider />

            <Typography sx={{ fontWeight: 950 }}>MFA fallback (optional)</Typography>
            <Box className="grid gap-3 md:grid-cols-2">
              <TextField
                select
                label={purposeLabel("mfa_sms")}
                value={defaultsDraft.mfa_sms || ""}
                onChange={(e) => setDefaultsDraft((p) => ({ ...p, mfa_sms: e.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">(none)</MenuItem>
                {smsPhoneOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label={purposeLabel("mfa_whatsapp")}
                value={defaultsDraft.mfa_whatsapp || ""}
                onChange={(e) => setDefaultsDraft((p) => ({ ...p, mfa_whatsapp: e.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">(none)</MenuItem>
                {waPhoneOptions.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Divider />

            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Changes to defaults may require re-authentication in a real system.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" sx={orangeOutlinedSx} onClick={() => setDefaultsOpen(false)}>
            Close
          </Button>
          <Button variant="contained" color="secondary" sx={orangeContainedSx} onClick={saveDefaults}>
            Save defaults
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant={mode === "dark" ? "filled" : "standard"}
          sx={{
            borderRadius: "4px",
            border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
            backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96),
            color: theme.palette.text.primary,
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
