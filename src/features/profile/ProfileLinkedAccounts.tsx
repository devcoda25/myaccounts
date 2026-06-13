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
import { useThemeStore } from "@/stores/themeStore";
import { api } from "@/utils/api";
import { useSocialLogin } from "@/hooks/useSocialLogin";
import { IUser, ICredential } from "@/types";
import { ProfileSidebar } from "./components/ProfileSidebar";

/**
 * EVzone My Accounts - Linked Accounts
 * Route: /app/profile/linked-accounts
 *
 * Features:
 * • Connected providers (Google, Apple)
 * • Link/unlink (with re-auth)
 * • Show last used / last login method
 */

type Severity = "info" | "warning" | "error" | "success";

type ProviderKey = "google" | "apple";

type Provider = {
  key: ProviderKey;
  name: string;
  connected: boolean;
  connectedEmail?: string;
  connectedAt?: number;
  lastUsedAt?: number;
  lastLoginMethod?: "Password" | "OTP" | "Google" | "Apple";
};

type ReAuthMode = "password" | "mfa";

type MfaChannel = "Authenticator" | "SMS" | "WhatsApp" | "Email";

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

function HelpCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.9.3-1.2.8-1.2 1.6v.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

function LinkIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function UnlinkIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path
        d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  // Official WhatsApp logo (Font Awesome path). Uses currentColor.
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

function GoogleGIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.72 1.22 9.23 3.23l6.9-6.9C35.95 2.27 30.33 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.02 6.23C12.58 13.2 17.86 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.57-.14-3.08-.4-4.54H24v8.6h12.5c-.54 2.9-2.14 5.36-4.54 7.02l6.96 5.4C43.2 36.98 46.1 31.3 46.1 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.58 28.45A14.9 14.9 0 0 1 9.8 24c0-1.55.27-3.05.78-4.45l-8.02-6.23A24.02 24.02 0 0 0 0 24c0 3.9.94 7.6 2.56 10.78l8.02-6.33z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.33 0 11.65-2.1 15.54-5.72l-6.96-5.4c-1.94 1.3-4.42 2.07-8.58 2.07-6.14 0-11.42-3.7-13.42-8.95l-8.02 6.33C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function AppleIcon({ size = 18 }: { size?: number }) {
  // Apple logo path (Font Awesome). Uses currentColor.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 384 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <path d="M318.7 268.7c-.2-37.3 16.4-65.6 51.5-87.2-19.2-27.5-48.2-42.6-86.5-45.5-36.5-2.9-76.3 21.3-90.9 21.3-15.4 0-50.5-20.3-78.3-20.3C56.8 137 0 181.7 0 273.4c0 27.1 5 55.1 15 84 13.4 37.3 61.7 128.9 112.1 127.4 26.2-.7 44.8-18.6 78.9-18.6 33.1 0 50.3 18.6 79.5 18.6 50.9-.7 94.6-82.7 107.3-120-58.2-27.7-74.2-79.5-74.1-96.1zM259.1 80.2c28.1-33.3 25.6-63.6 24.8-74.2-24.8 1.4-53.4 16.9-69.7 36-17.9 20.5-28.4 45.9-26.1 73.2 26.9 2.1 50.6-10.8 71-35z" />
    </svg>
  );
}

// Redundant EVZONE removed

// -----------------------------
// Helpers
// -----------------------------
function timeAgo(ts?: number) {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function maskEmail(email?: string) {
  if (!email) return "";
  const e = email.trim();
  const m = e.match(/^(.{1,2}).*(@.*)$/);
  if (!m) return e;
  return `${m[1]}***${m[2]}`;
}

// [Removed] mfaCodeFor (was mock)

export default function LinkedAccountsPage() {
  const { t } = useTranslation("common");
  {
    const { mode } = useThemeStore();
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = mode === "dark";

    const [providers, setProviders] = useState<Provider[]>([
      {
        key: "google",
        name: "Google",
        connected: false,
        lastUsedAt: undefined,
        lastLoginMethod: undefined,
      },
      {
        key: "apple",
        name: "Apple",
        connected: false,
        lastUsedAt: undefined,
        lastLoginMethod: undefined,
      },
    ]);

    const { initGoogleCustomLogin, initAppleLogin } = useSocialLogin(); // Hook usage

    useEffect(() => {
      // Load Connections
      reloadProviders();
    }, []);

    const reloadProviders = () => {
      api<IUser>('/users/me')
        .then((user) => {
          if (user && user.credentials) {
            setProviders(prev => prev.map(p => {
              const cred = user.credentials?.find((c) => c.providerType === p.key);
              if (cred) {
                return {
                  ...p,
                  connected: true,
                  connectedEmail: cred.providerId.includes('@') ? cred.providerId : undefined, // providerId often stores sub, but for display we might need email from metadata or just show Connected
                  connectedAt: Date.now(),
                  lastUsedAt: Date.now()
                };
              }
              return { ...p, connected: false };
            }));
          }
        })
        .catch(err => console.error(err));
    };

    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({
      open: false,
      severity: "info",
      msg: "",
    });

    const [reauthOpen, setReauthOpen] = useState(false);
    const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
    const [reauthPassword, setReauthPassword] = useState("");
    const [mfaChannel, setMfaChannel] = useState<MfaChannel>("Authenticator");
    const [otp, setOtp] = useState("");
    const [pendingAction, setPendingAction] = useState<null | { provider: ProviderKey; action: "unlink" | "link" }>(null);
    const [codeSent, setCodeSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Cooldown effect
    useEffect(() => {
      if (cooldown > 0) {
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
      }
    }, [cooldown]);

    const requestChallenge = async () => {
      try {
        const channelMap: Record<string, 'sms' | 'whatsapp' | 'email'> = {
          'SMS': 'sms',
          'WhatsApp': 'whatsapp',
          'Email': 'email'
        };
        const c = channelMap[mfaChannel];
        if (!c) return;

        await api('/auth/mfa/challenge/send', { method: 'POST', body: JSON.stringify({ channel: c }) });
        setCodeSent(true);
        setCooldown(30);
        setSnack({ open: true, severity: "success", msg: `Code sent to ${mfaChannel}` });
      } catch (err: any) {
        setSnack({ open: true, severity: "error", msg: err.message || "Failed to send code" });
      }
    };

    // redundant code removed

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

    const googleBtnSx = {
      borderColor: "#DADCE0",
      backgroundColor: "#FFFFFF",
      color: "#3C4043",
      "&:hover": { backgroundColor: "#F8F9FA", borderColor: "#DADCE0" },
      "&:active": { backgroundColor: "#F1F3F4" },
    } as const;

    const appleBtnSx = {
      borderColor: "#000000",
      backgroundColor: "#000000",
      color: "#FFFFFF",
      "&:hover": { backgroundColor: "#111111", borderColor: "#111111" },
      "&:active": { backgroundColor: "#1B1B1B" },
    } as const;

    const openReauth = (provider: ProviderKey, action: "unlink" | "link") => {
      setPendingAction({ provider, action });
      setReauthOpen(true);
      setReauthMode("password");
      setReauthPassword("");
      setMfaChannel("Authenticator");
      setOtp("");
      setCodeSent(false);
      setCooldown(0);
    };

    const closeReauth = () => {
      setReauthOpen(false);
      setPendingAction(null);
    };

    const applyAction = async () => {
      if (!pendingAction) return;

      // 1. Re-authenticate
      try {
        if (reauthMode === "password") {
          await api('/auth/verify-password', { method: 'POST', body: JSON.stringify({ password: reauthPassword }) });
        } else {
          // MFA Verification
          const channelMap: Record<string, 'authenticator' | 'sms' | 'whatsapp' | 'email'> = {
            'Authenticator': 'authenticator',
            'SMS': 'sms',
            'WhatsApp': 'whatsapp',
            'Email': 'email'
          };
          const c = channelMap[mfaChannel];
          await api('/auth/mfa/challenge/verify', {
            method: 'POST', body: JSON.stringify({
              code: otp,
              channel: c
            })
          });
        }
      } catch (err) {
        setSnack({ open: true, severity: "error", msg: "Re-authentication failed. Incorrect credentials." });
        return;
      }

      // 2. Perform Action
      try {
        if (pendingAction.action === "unlink") {
          await api(`/users/me/credentials/${pendingAction.provider}`, { method: 'DELETE' });
          setSnack({ open: true, severity: "success", msg: "Account unlinked successfully." });
          reloadProviders();
          closeReauth();
        } else {
          // Link Action
          closeReauth(); // Close dialog to show popup
          if (pendingAction.provider === 'google') {
            initGoogleCustomLogin(undefined, async (token: string) => {
              try {
                await api('/auth/link/google', { method: 'POST', body: JSON.stringify({ token }) });
                setSnack({ open: true, severity: "success", msg: "Account linked successfully." });
                reloadProviders();
              } catch (lErr: unknown) {
                console.error(lErr);
                setSnack({ open: true, severity: "error", msg: (lErr as Error).message || "Failed to link account." });
              }
            });
          } else {
            // Apple Link
            // TODO: Update useSocialLogin to support Apple Link callback or implement here
            // Using stub for now as Apple Link requires specific JS structure
            setSnack({ open: true, severity: "info", msg: "Apple linking coming soon." });
          }
        }
      } catch (err: any) {
        console.error(err);
        setSnack({ open: true, severity: "error", msg: err.message || "Action failed." });
      }
    };

    const lastLogin = useMemo(() => {
      const p = providers
        .filter((x) => x.connected)
        .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))[0];
      return p?.lastLoginMethod || "Password";
    }, [providers]);

    const ProviderAvatar = ({ provider }: { provider: Provider }) => {
      if (provider.key === "google") {
        return (
          <Avatar sx={{ bgcolor: alpha("#FFFFFF", 0.90), border: `1px solid ${alpha("#DADCE0", 1)}` }}>
            <GoogleGIcon size={18} />
          </Avatar>
        );
      }
      return (
        <Avatar sx={{ bgcolor: "#000", color: "#FFF" }}>
          <AppleIcon size={18} />
        </Avatar>
      );
    };

    const ProviderActionButton = ({ provider }: { provider: Provider }) => {
      if (provider.connected) {
        return (
          <Button
            variant="outlined"
            sx={evOrangeOutlinedSx}
            startIcon={<UnlinkIcon size={18} />}
            onClick={() => openReauth(provider.key, "unlink")}
          >
            Unlink
          </Button>
        );
      }

      const brandSx = provider.key === "google" ? googleBtnSx : appleBtnSx;
      const brandVariant = provider.key === "google" ? ("outlined" as const) : ("contained" as const);
      const brandIcon = provider.key === "google" ? <GoogleGIcon size={18} /> : <AppleIcon size={18} />;

      return (
        <Button
          variant={brandVariant}
          startIcon={brandIcon}
          onClick={() => openReauth(provider.key, "link")}
          sx={{ ...brandSx, borderRadius: 14, fontWeight: 900 }}
        >
          Link {provider.name}
        </Button>
      );
    };

    return (
      <>
        <CssBaseline />

        <Box className="min-h-screen" sx={{ background: pageBg }}>
          {/* Body */}
          <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Sidebar */}
                <Box className="hidden md:col-span-3 md:block">
                  <ProfileSidebar />
                </Box>

                {/* Main */}
                <Box className="md:col-span-9">
                  <Stack spacing={2.2}>
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={2.0}>
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            alignItems={{ xs: "flex-start", md: "center" }}
                            justifyContent="space-between"
                          >
                            <Box>
                              <Typography variant="h5">Linked accounts</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Connect trusted providers to sign in faster. Linking and unlinking requires re-authentication.
                              </Typography>
                            </Box>

                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              <Chip
                                icon={<ClockIcon size={16} />}
                                label={`Last sign-in: ${lastLogin}`}
                                variant="outlined"
                                sx={{ fontWeight: 900 }}
                              />
                            </Box>
                          </Stack>

                          <Divider />

                          <Alert severity="info">
                            Security tip: Keep at least one backup sign-in method (password or another provider) so you do not get locked out.
                          </Alert>

                          <Stack spacing={1.4}>
                            {providers.map((p) => (
                              <Box
                                key={p.key}
                                sx={{
                                  borderRadius: 20,
                                  border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                  backgroundColor: alpha(theme.palette.background.paper, 0.45),
                                  p: 1.4,
                                }}
                              >
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1.4}
                                  alignItems={{ xs: "flex-start", sm: "center" }}
                                >
                                  <Stack direction="row" spacing={1.2} alignItems="center" flex={1}>
                                    <ProviderAvatar provider={p} />
                                    <Box>
                                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Typography sx={{ fontWeight: 950 }}>{p.name}</Typography>
                                        {p.connected ? (
                                          <Chip size="small" color="success" label="Connected" />
                                        ) : (
                                          <Chip size="small" variant="outlined" label="Not connected" />
                                        )}
                                      </Stack>
                                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        {p.connected
                                          ? p.connectedEmail
                                            ? maskEmail(p.connectedEmail)
                                            : "Connected"
                                          : "Not linked yet"}
                                      </Typography>
                                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                                        <Chip size="small" variant="outlined" label={`Last used: ${timeAgo(p.lastUsedAt)}`} />
                                        <Chip size="small" variant="outlined" label={`Last login method: ${p.lastLoginMethod || "Unknown"}`} />
                                      </Stack>
                                    </Box>
                                  </Stack>

                                  <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                    sx={{ width: { xs: "100%", sm: "auto" } }}
                                  >
                                    <ProviderActionButton provider={p} />
                                  </Stack>
                                </Stack>
                              </Box>
                            ))}
                          </Stack>

                          <Divider />

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button
                              variant="contained"
                              color="secondary"
                              sx={evOrangeContainedSx}
                              startIcon={<ShieldCheckIcon size={18} />}
                              onClick={() => navigate('/app/security')}
                            >
                              Security overview
                            </Button>
                            <Button
                              variant="outlined"
                              sx={evOrangeOutlinedSx}
                              startIcon={<HelpCircleIcon size={18} />}
                              onClick={() => navigate('/app/support')}
                            >
                              Support
                            </Button>
                          </Stack>

                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Linking providers may share basic profile information. You can revoke access anytime.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Mobile quick actions */}
                    <Box className="md:hidden">
                      <Card
                        sx={{
                          borderRadius: 22,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                          backgroundColor: alpha(theme.palette.background.paper, 0.70),
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <CardContent>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button
                              fullWidth
                              variant="outlined"
                              sx={evOrangeOutlinedSx}
                              onClick={() => navigate('/app/profile')}
                              startIcon={<ArrowLeftIcon size={18} />}
                            >
                              Profile
                            </Button>
                            <Button
                              fullWidth
                              variant="contained"
                              color="secondary"
                              sx={evOrangeContainedSx}
                              onClick={() => navigate('/app/security')}
                            >
                              Security
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Box>

                    <Box className="mt-2" sx={{ opacity: 0.92 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        © {new Date().getFullYear()} EVzone Group
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Box>

        {/* Re-auth dialog */}
        <Dialog
          open={reauthOpen}
          onClose={closeReauth}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}
        >
          <DialogTitle sx={{ fontWeight: 950 }}>Confirm it’s you</DialogTitle>
          <DialogContent>
            <Stack spacing={1.4}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                For your security, please re-authenticate to continue.
              </Typography>

              <Tabs
                value={reauthMode === "password" ? 0 : 1}
                onChange={(_, v) => setReauthMode(v === 0 ? "password" : "mfa")}
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
                          onClick={() => { setMfaChannel(it.c); setCodeSent(false); setOtp(""); }}
                          sx={
                            selected
                              ? ({
                                borderRadius: 14,
                                backgroundColor: base,
                                color: "#FFFFFF",
                                "&:hover": { backgroundColor: alpha(base, 0.92) },
                              } as const)
                              : ({
                                borderRadius: 14,
                                borderColor: alpha(base, 0.65),
                                color: base,
                                backgroundColor: alpha(theme.palette.background.paper, 0.25),
                                "&:hover": { borderColor: base, backgroundColor: base, color: "#FFFFFF" },
                              } as const)
                          }
                          fullWidth
                        >
                          {it.c}
                        </Button>
                      );
                    })}
                  </Box>

                  {mfaChannel !== "Authenticator" && (
                    <Button
                      disabled={cooldown > 0}
                      onClick={requestChallenge}
                      fullWidth
                      variant="outlined"
                      sx={{ borderRadius: 12, borderColor: theme.palette.divider }}
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : codeSent ? "Resend Code" : "Send Code"}
                    </Button>
                  )}

                  <TextField
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
                    helperText={mfaChannel === "Authenticator" ? "Open your Authenticator app" : codeSent ? "Code sent to your contact method" : "Request a code first"}
                  />
                </>
              )}

              <Alert severity="info">This is a demo re-auth flow. In production, we verify via your security settings.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={closeReauth}>
              Cancel
            </Button>
            <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={applyAction}>
              Continue
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3400}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant={mode === "dark" ? "filled" : "standard"}
            sx={{
              borderRadius: 16,
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
}
