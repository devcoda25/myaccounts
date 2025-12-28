import React, { useEffect, useMemo, useRef, useState } from "react";
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
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";
import { EVZONE } from "../../../theme/evzone";

/**
 * EVzone My Accounts - Enterprise SSO Setup
 * Route: /app/orgs/:orgId/sso
 *
 * Features:
 * • Choose: SAML / OIDC
 * • Upload metadata or enter endpoints
 * • Certificate management
 * • Domain matching rules (email domain)
 * • Test SSO button (sandbox test)
 * • Enable/disable SSO (with warnings)
 */

type ThemeMode = "light" | "dark";

type Severity = "info" | "warning" | "error" | "success";

type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer";

type SsoType = "SAML" | "OIDC";

type DomainRule = {
  id: string;
  domain: string;
  verified: boolean;
  requireSso: boolean;
  allowPasswordFallback: boolean;
  defaultRole: Exclude<OrgRole, "Owner">;
};

type CertStatus = "Active" | "Expiring" | "Inactive";

type CertItem = {
  id: string;
  name: string;
  fingerprint: string;
  expiresAt: number;
  status: CertStatus;
  createdAt: number;
};

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

function KeyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M11 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 12v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 12v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function LinkIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function UploadIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function DocumentIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function BeakerIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M10 2v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function CertificateIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="6" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 17l2 4 2-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

// -----------------------------
// Theme helpers
// -----------------------------

// -----------------------------
// Utilities
// -----------------------------
function isAdminRole(role: OrgRole) {
  return role === "Owner" || role === "Admin";
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function readParam(key: string, fallback: string) {
  try {
    const qs = new URLSearchParams(window.location.search);
    return qs.get(key) || fallback;
  } catch {
    return fallback;
  }
}

function fingerprintFromPem(pem: string) {
  // demo fingerprint (not cryptographic)
  const cleaned = pem.replace(/\s+/g, "");
  let h = 2166136261;
  for (let i = 0; i < cleaned.length; i++) {
    h ^= cleaned.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `${hex.slice(0, 2)}:${hex.slice(2, 4)}:${hex.slice(4, 6)}:${hex.slice(6, 8)}`.toUpperCase();
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

function dateInputValue(ts: number) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function EnterpriseSSOSetupPage() {
  // const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  // const theme = useMemo(() => buildTheme(mode), [mode]);
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  // demo: org context
  const orgId = readParam("orgId", "org_evworld");
  const orgName = orgId === "org_evzone_group" ? "EVzone Group" : orgId === "org_partner" ? "Partner Organization" : "EV World";

  // demo: my role
  const [myRole, setMyRole] = useState<OrgRole>("Admin");
  const canEdit = isAdminRole(myRole);

  // SSO master switch
  const [ssoEnabled, setSsoEnabled] = useState<boolean>(true);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [toggleNextValue, setToggleNextValue] = useState<boolean>(true);

  // Provider type
  const [ssoType, setSsoType] = useState<SsoType>("SAML");

  // SAML config
  const [samlMode, setSamlMode] = useState<"metadata" | "manual">("metadata");
  const [metadataUrl, setMetadataUrl] = useState("https://idp.example.com/metadata.xml");
  const [metadataFileName, setMetadataFileName] = useState<string | null>(null);
  const metadataRef = useRef<HTMLInputElement | null>(null);

  const [samlEntityId, setSamlEntityId] = useState("https://idp.example.com/entity");
  const [samlSsoUrl, setSamlSsoUrl] = useState("https://idp.example.com/sso");
  const [samlSloUrl, setSamlSloUrl] = useState("https://idp.example.com/slo");
  const [samlCertPem, setSamlCertPem] = useState("-----BEGIN CERTIFICATE-----\nMIID...demo...\n-----END CERTIFICATE-----");
  const [wantSignedResponse, setWantSignedResponse] = useState(true);

  // OIDC config
  const [oidcIssuer, setOidcIssuer] = useState("https://idp.example.com");
  const [oidcAuth, setOidcAuth] = useState("https://idp.example.com/oauth2/authorize");
  const [oidcToken, setOidcToken] = useState("https://idp.example.com/oauth2/token");
  const [oidcJwks, setOidcJwks] = useState("https://idp.example.com/.well-known/jwks.json");
  const [oidcClientId, setOidcClientId] = useState("evzone-myaccounts");
  const [oidcClientSecret, setOidcClientSecret] = useState("demo-secret");
  const [oidcRedirectUris, setOidcRedirectUris] = useState("https://accounts.evzone.com/callback\nhttps://accounts.evzone.com/oidc/callback");
  const [oidcScopes, setOidcScopes] = useState("openid email profile");
  const [oidcPkce, setOidcPkce] = useState(true);

  // Domain matching rules
  const [domainRules, setDomainRules] = useState<DomainRule[]>(() => [
    { id: "d1", domain: "evworld.africa", verified: true, requireSso: true, allowPasswordFallback: false, defaultRole: "Manager" },
    { id: "d2", domain: "evzonecharging.com", verified: false, requireSso: false, allowPasswordFallback: true, defaultRole: "Member" },
  ]);
  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newDomainRequireSso, setNewDomainRequireSso] = useState(true);
  const [newDomainFallback, setNewDomainFallback] = useState(false);
  const [newDomainRole, setNewDomainRole] = useState<Exclude<OrgRole, "Owner">>("Member");

  // Certificates
  const [certs, setCerts] = useState<CertItem[]>(() => {
    const now = Date.now();
    return [
      { id: "c1", name: "Primary signing cert", fingerprint: "AB:CD:EF:12", createdAt: now - 1000 * 60 * 60 * 24 * 60, expiresAt: now + 1000 * 60 * 60 * 24 * 120, status: "Active" },
      { id: "c2", name: "Old cert (rotated)", fingerprint: "11:22:33:44", createdAt: now - 1000 * 60 * 60 * 24 * 400, expiresAt: now - 1000 * 60 * 60 * 24 * 10, status: "Inactive" },
    ];
  });
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [certName, setCertName] = useState("New certificate");
  const [certPem, setCertPem] = useState("-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----");
  const [certExpiry, setCertExpiry] = useState<string>(() => dateInputValue(Date.now() + 1000 * 60 * 60 * 24 * 365));

  // Test SSO
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("finance@evworld.africa");
  const [testResult, setTestResult] = useState<{ status: "idle" | "running" | "success" | "fail"; logs: string[] }>({ status: "idle", logs: [] });

  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  // Self-tests effect removed

  const toggleMode = () => {
    // Mode toggling handled by ContextSwitcher or outside
  };

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 4px 14px ${alpha(EVZONE.orange, 0.4)}`, // Standardized
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const waOutlined = {
    borderColor: alpha(WHATSAPP.green, 0.75),
    color: WHATSAPP.green,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    "&:hover": { borderColor: WHATSAPP.green, backgroundColor: WHATSAPP.green, color: "#FFFFFF" },
  } as const;

  const openToggleConfirm = (next: boolean) => {
    if (!canEdit) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can enable or disable SSO." });
      return;
    }
    setToggleNextValue(next);
    setToggleConfirmOpen(true);
  };

  const applyToggle = () => {
    setSsoEnabled(toggleNextValue);
    setToggleConfirmOpen(false);
    setSnack({ open: true, severity: "success", msg: toggleNextValue ? "SSO enabled (demo)." : "SSO disabled (demo)." });
  };

  const parseMetadata = () => {
    if (!canEdit) return;
    setSnack({ open: true, severity: "success", msg: "Metadata parsed (demo). Fields updated." });
    // Demo: update a couple of fields
    setSamlEntityId("https://idp.example.com/saml/entity");
    setSamlSsoUrl("https://idp.example.com/saml/sso");
    setSamlSloUrl("https://idp.example.com/saml/slo");
  };

  const onUploadMetadata = () => metadataRef.current?.click();
  const onMetadataFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMetadataFileName(f.name);
    setSnack({ open: true, severity: "success", msg: "Metadata file selected (demo)." });
  };

  const openAddRule = () => {
    if (!canEdit) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can edit domain rules." });
      return;
    }
    setNewDomain("");
    setNewDomainRequireSso(true);
    setNewDomainFallback(false);
    setNewDomainRole("Member");
    setAddDomainOpen(true);
  };

  const addRule = () => {
    const d = newDomain.trim().toLowerCase();
    if (!d || !d.includes(".")) {
      setSnack({ open: true, severity: "warning", msg: "Enter a valid domain." });
      return;
    }
    const id = `d_${Math.random().toString(16).slice(2, 7)}`;
    setDomainRules((prev) => [
      {
        id,
        domain: d,
        verified: false,
        requireSso: newDomainRequireSso,
        allowPasswordFallback: newDomainFallback,
        defaultRole: newDomainRole,
      },
      ...prev,
    ]);
    setAddDomainOpen(false);
    setSnack({ open: true, severity: "success", msg: "Domain rule added (demo)." });
  };

  const toggleRule = (id: string, patch: Partial<DomainRule>) => {
    if (!canEdit) return;
    setDomainRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const openAddCert = () => {
    if (!canEdit) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can manage certificates." });
      return;
    }
    setCertName("New certificate");
    setCertPem("-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----");
    setCertExpiry(dateInputValue(Date.now() + 1000 * 60 * 60 * 24 * 365));
    setCertDialogOpen(true);
  };

  const addCert = () => {
    const exp = new Date(certExpiry + "T00:00:00").getTime();
    if (!certPem.includes("BEGIN CERTIFICATE")) {
      setSnack({ open: true, severity: "warning", msg: "Paste a valid PEM certificate." });
      return;
    }
    const fp = fingerprintFromPem(certPem);
    const id = `c_${Math.random().toString(16).slice(2, 7)}`;
    const now = Date.now();
    const status: CertStatus = exp < now ? "Inactive" : exp - now < 1000 * 60 * 60 * 24 * 30 ? "Expiring" : "Active";
    setCerts((prev) => [{ id, name: certName.trim() || "Certificate", fingerprint: fp, expiresAt: exp, createdAt: now, status }, ...prev]);
    setCertDialogOpen(false);
    setSnack({ open: true, severity: "success", msg: "Certificate added (demo)." });
  };

  const rotateCert = (id: string) => {
    if (!canEdit) return;
    setCerts((prev) =>
      prev.map((c) => {
        if (c.id === id) return { ...c, status: "Inactive" as const };
        return c;
      })
    );
    setSnack({ open: true, severity: "info", msg: "Certificate rotated (demo). Add a new active cert next." });
  };

  const runTest = async () => {
    setTestResult({ status: "running", logs: ["Starting sandbox test...", `Provider: ${ssoType}`, `User: ${testEmail}`] });
    await new Promise((r) => setTimeout(r, 600));

    const email = testEmail.trim().toLowerCase();
    const domain = email.includes("@") ? email.split("@")[1] : "";
    const rule = domainRules.find((r) => r.domain === domain);

    const logs: string[] = [];
    logs.push("Checking domain rules...");
    logs.push(rule ? `Matched domain rule: ${rule.domain} (verified: ${rule.verified ? "yes" : "no"})` : "No matching domain rule.");

    if (!ssoEnabled) {
      logs.push("SSO is disabled.");
      setTestResult({ status: "fail", logs: [...testResult.logs, ...logs, "Result: FAIL (SSO disabled)"] });
      return;
    }

    if (rule?.requireSso && !rule.verified) {
      logs.push("Domain requires SSO but is not verified.");
      setTestResult({ status: "fail", logs: [...testResult.logs, ...logs, "Result: FAIL (verify domain)"] });
      return;
    }

    if (ssoType === "SAML") {
      logs.push("Validating SAML configuration...");
      if (!samlSsoUrl.trim() || !samlEntityId.trim()) {
        setTestResult({ status: "fail", logs: [...testResult.logs, ...logs, "Result: FAIL (missing SAML endpoints)"] });
        return;
      }
      if (!certs.some((c) => c.status === "Active")) {
        setTestResult({ status: "fail", logs: [...testResult.logs, ...logs, "Result: FAIL (no active certificate)"] });
        return;
      }
      logs.push("SAML endpoints OK.");
      logs.push("Certificate OK.");
      logs.push("Simulating authn request... OK");
      logs.push("Simulating assertion validation... OK");
      setTestResult({ status: "success", logs: [...testResult.logs, ...logs, "Result: SUCCESS"] });
      return;
    }

    // OIDC
    logs.push("Validating OIDC configuration...");
    if (!oidcIssuer.trim() || !oidcAuth.trim() || !oidcToken.trim() || !oidcClientId.trim()) {
      setTestResult({ status: "fail", logs: [...testResult.logs, ...logs, "Result: FAIL (missing OIDC fields)"] });
      return;
    }
    logs.push("OIDC endpoints OK.");
    logs.push(`PKCE: ${oidcPkce ? "required" : "not required"}`);
    logs.push("Simulating auth code flow... OK");
    logs.push("Simulating token exchange... OK");
    setTestResult({ status: "success", logs: [...testResult.logs, ...logs, "Result: SUCCESS"] });
  };

  const save = async () => {
    if (!canEdit) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can save SSO settings." });
      return;
    }
    if (ssoEnabled && domainRules.some((d) => d.requireSso && !d.allowPasswordFallback) && !domainRules.some((d) => d.verified)) {
      setSnack({ open: true, severity: "warning", msg: "At least one verified domain is recommended before enforcing SSO." });
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 650));
    setSaving(false);
    setSnack({ open: true, severity: "success", msg: "SSO settings saved (demo)." });
  };

  const ssoStatusChip = ssoEnabled ? <Chip size="small" color="success" label="Enabled" /> : <Chip size="small" color="warning" label="Disabled" />;

  return (
    <>
      <CssBaseline />

      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top bar */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.75) 100%)", boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.20)}` }}>
                  <Typography sx={{ color: "white", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>My Accounts</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {orgName} • Enterprise SSO
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField select size="small" label="My role" value={myRole} onChange={(e) => setMyRole(e.target.value as OrgRole)} sx={{ minWidth: 140, display: { xs: "none", md: "block" } }}>
                  {(["Owner", "Admin", "Manager", "Member", "Viewer"] as OrgRole[]).map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>

                <Tooltip title="Switch to Light/Dark Mode">
                  <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: "4px", color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Language">
                  <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: "4px", color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              {/* Header */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5">Enterprise SSO setup</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Configure SAML or OIDC federation for your organization.
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip size="small" icon={<KeyIcon size={16} />} label={ssoType} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        {ssoStatusChip}
                        <Chip size="small" label={canEdit ? "Editable" : "Read-only"} color={canEdit ? "success" : "warning"} />
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="outlined" sx={orangeOutlined} startIcon={<BeakerIcon size={18} />} onClick={() => setTestOpen(true)}>
                        Test SSO
                      </Button>
                      <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<ShieldCheckIcon size={18} />} onClick={save} disabled={saving || !canEdit}>
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
                    <Stack spacing={0.6}>
                      <Typography sx={{ fontWeight: 950 }}>SSO status</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {ssoEnabled ? "Users may be redirected to your identity provider." : "Password and OTP sign-in remain available."}
                      </Typography>
                    </Stack>

                    <FormControlLabel
                      control={<Switch checked={ssoEnabled} onChange={() => openToggleConfirm(!ssoEnabled)} color="secondary" />}
                      label={<Typography sx={{ fontWeight: 900 }}>Enable SSO</Typography>}
                      disabled={!canEdit}
                    />
                  </Stack>

                  {!ssoEnabled ? (
                    <Alert severity="warning" icon={<AlertTriangleIcon size={18} />} sx={{ mt: 2 }}>
                      Disabling SSO may allow password login for org accounts. If you enforce SSO, keep it enabled.
                    </Alert>
                  ) : (
                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />} sx={{ mt: 2 }}>
                      Tip: Verify your email domains before enforcing SSO.
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Left: Provider settings */}
                <Box className="md:col-span-7">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Typography variant="h6">Identity provider</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Choose SAML or OIDC and configure endpoints.
                        </Typography>

                        <Divider />

                        <Tabs
                          value={ssoType === "SAML" ? 0 : 1}
                          onChange={(_, v) => setSsoType(v === 0 ? "SAML" : "OIDC")}
                          variant="fullWidth"
                          sx={{ borderRadius: 16, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 44, "& .MuiTab-root": { minHeight: 44, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
                        >
                          <Tab icon={<KeyIcon size={16} />} iconPosition="start" label="SAML" />
                          <Tab icon={<LinkIcon size={16} />} iconPosition="start" label="OIDC" />
                        </Tabs>

                        {ssoType === "SAML" ? (
                          <Stack spacing={1.2}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
                              <Typography sx={{ fontWeight: 950 }}>SAML configuration</Typography>
                              <Tabs
                                value={samlMode === "metadata" ? 0 : 1}
                                onChange={(_, v) => setSamlMode(v === 0 ? "metadata" : "manual")}
                                sx={{ borderRadius: 999, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden", minHeight: 40, "& .MuiTab-root": { minHeight: 40, fontWeight: 900 }, "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3 } }}
                              >
                                <Tab label="Metadata" />
                                <Tab label="Manual" />
                              </Tabs>
                            </Stack>

                            {samlMode === "metadata" ? (
                              <Stack spacing={1.2}>
                                <TextField value={metadataUrl} onChange={(e) => setMetadataUrl(e.target.value)} label="Metadata URL" fullWidth disabled={!canEdit} InputProps={{ startAdornment: (<InputAdornment position="start"><LinkIcon size={18} /></InputAdornment>) }} />
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                  <input ref={metadataRef} type="file" accept=".xml,.txt" style={{ display: "none" }} onChange={onMetadataFile} />
                                  <Button variant="outlined" sx={orangeOutlined} startIcon={<UploadIcon size={18} />} onClick={onUploadMetadata} disabled={!canEdit}>
                                    Upload metadata
                                  </Button>
                                  <Button variant="outlined" sx={orangeOutlined} startIcon={<DocumentIcon size={18} />} onClick={parseMetadata} disabled={!canEdit}>
                                    Parse metadata
                                  </Button>
                                  {metadataFileName ? <Chip size="small" variant="outlined" label={metadataFileName} /> : null}
                                </Stack>
                                <Alert severity="info">
                                  Tip: Metadata parsing can auto-fill Entity ID, SSO URL, certificate, and bindings.
                                </Alert>
                              </Stack>
                            ) : null}

                            <Box className="grid gap-3 md:grid-cols-2">
                              <TextField value={samlEntityId} onChange={(e) => setSamlEntityId(e.target.value)} label="Entity ID" fullWidth disabled={!canEdit} />
                              <TextField value={samlSsoUrl} onChange={(e) => setSamlSsoUrl(e.target.value)} label="SSO URL" fullWidth disabled={!canEdit} />
                              <TextField value={samlSloUrl} onChange={(e) => setSamlSloUrl(e.target.value)} label="SLO URL (optional)" fullWidth disabled={!canEdit} />
                              <FormControlLabel
                                control={<Switch checked={wantSignedResponse} onChange={(e) => setWantSignedResponse(e.target.checked)} color="secondary" />}
                                label={<Typography sx={{ fontWeight: 900 }}>Require signed responses</Typography>}
                                disabled={!canEdit}
                              />
                            </Box>

                            <TextField
                              value={samlCertPem}
                              onChange={(e) => setSamlCertPem(e.target.value)}
                              label="Signing certificate (PEM)"
                              fullWidth
                              disabled={!canEdit}
                              multiline
                              minRows={4}
                              InputProps={{ startAdornment: (<InputAdornment position="start"><CertificateIcon size={18} /></InputAdornment>) }}
                            />

                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              EVzone ACS URL and Audience are configured on the identity provider side (not shown in demo).
                            </Typography>
                          </Stack>
                        ) : (
                          <Stack spacing={1.2}>
                            <Typography sx={{ fontWeight: 950 }}>OIDC configuration</Typography>
                            <Box className="grid gap-3 md:grid-cols-2">
                              <TextField value={oidcIssuer} onChange={(e) => setOidcIssuer(e.target.value)} label="Issuer URL" fullWidth disabled={!canEdit} InputProps={{ startAdornment: (<InputAdornment position="start"><LinkIcon size={18} /></InputAdornment>) }} />
                              <TextField value={oidcJwks} onChange={(e) => setOidcJwks(e.target.value)} label="JWKS URL" fullWidth disabled={!canEdit} InputProps={{ startAdornment: (<InputAdornment position="start"><KeyIcon size={18} /></InputAdornment>) }} />
                              <TextField value={oidcAuth} onChange={(e) => setOidcAuth(e.target.value)} label="Authorization endpoint" fullWidth disabled={!canEdit} />
                              <TextField value={oidcToken} onChange={(e) => setOidcToken(e.target.value)} label="Token endpoint" fullWidth disabled={!canEdit} />
                              <TextField value={oidcClientId} onChange={(e) => setOidcClientId(e.target.value)} label="Client ID" fullWidth disabled={!canEdit} />
                              <TextField value={oidcClientSecret} onChange={(e) => setOidcClientSecret(e.target.value)} label="Client secret" type="password" fullWidth disabled={!canEdit} />
                            </Box>
                            <TextField value={oidcRedirectUris} onChange={(e) => setOidcRedirectUris(e.target.value)} label="Redirect URIs" fullWidth disabled={!canEdit} multiline minRows={3} />
                            <TextField value={oidcScopes} onChange={(e) => setOidcScopes(e.target.value)} label="Scopes" fullWidth disabled={!canEdit} />
                            <FormControlLabel control={<Switch checked={oidcPkce} onChange={(e) => setOidcPkce(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Require PKCE</Typography>} disabled={!canEdit} />
                            <Alert severity="info">Tip: PKCE is recommended for web and mobile clients.</Alert>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Right: Domain rules + Certs */}
                <Box className="md:col-span-5">
                  <Stack spacing={2.2}>
                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Box>
                              <Typography variant="h6">Domain matching rules</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Determine when users must use SSO.
                              </Typography>
                            </Box>
                            <Button variant="outlined" sx={orangeOutlined} startIcon={<PlusIcon size={18} />} onClick={openAddRule}>
                              Add
                            </Button>
                          </Stack>

                          <Divider />

                          <Stack spacing={1.2}>
                            {domainRules.map((d) => (
                              <Box key={d.id} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                                <Stack spacing={0.8}>
                                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Chip size="small" icon={<GlobeIcon size={16} />} label={d.domain} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                                      {d.verified ? <Chip size="small" color="success" label="Verified" /> : <Chip size="small" color="warning" label="Not verified" />}
                                    </Stack>
                                    <Button
                                      size="small"
                                      variant="text"
                                      sx={{ color: EVZONE.orange, fontWeight: 900, "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) } }}
                                      onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /app/orgs/:orgId/domain-verification (demo)." })}
                                    >
                                      Verify
                                    </Button>
                                  </Stack>

                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip size="small" variant="outlined" label={`Default role: ${d.defaultRole}`} />
                                    <Chip size="small" variant="outlined" label={d.requireSso ? "SSO required" : "SSO optional"} />
                                    <Chip size="small" variant="outlined" label={d.allowPasswordFallback ? "Fallback allowed" : "No fallback"} />
                                  </Stack>

                                  <Divider />

                                  <Stack spacing={0.8}>
                                    <FormControlLabel
                                      control={<Switch checked={d.requireSso} onChange={(e) => toggleRule(d.id, { requireSso: e.target.checked })} color="secondary" />}
                                      label={<Typography sx={{ fontWeight: 900 }}>Require SSO for this domain</Typography>}
                                      disabled={!canEdit}
                                    />
                                    <FormControlLabel
                                      control={<Switch checked={d.allowPasswordFallback} onChange={(e) => toggleRule(d.id, { allowPasswordFallback: e.target.checked })} color="secondary" />}
                                      label={<Typography sx={{ fontWeight: 900 }}>Allow password fallback</Typography>}
                                      disabled={!canEdit}
                                    />
                                    <TextField
                                      select
                                      size="small"
                                      label="Default role"
                                      value={d.defaultRole}
                                      onChange={(e) => toggleRule(d.id, { defaultRole: e.target.value as any })}
                                      disabled={!canEdit}
                                    >
                                      {(["Admin", "Manager", "Member", "Viewer"] as Array<Exclude<OrgRole, "Owner">>).map((r) => (
                                        <MenuItem key={r} value={r}>
                                          {r}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </Stack>
                                </Stack>
                              </Box>
                            ))}
                          </Stack>

                          <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
                            If you enforce SSO without verified domains, you may lock out legitimate users.
                          </Alert>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Box>
                              <Typography variant="h6">Certificates</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Manage signing certificates and rotation.
                              </Typography>
                            </Box>
                            <Button variant="outlined" sx={orangeOutlined} startIcon={<PlusIcon size={18} />} onClick={openAddCert}>
                              Add
                            </Button>
                          </Stack>

                          <Divider />

                          <Stack spacing={1.2}>
                            {certs.map((c) => (
                              <Box key={c.id} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                                <Stack spacing={0.8}>
                                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <CertificateIcon size={18} />
                                      <Typography sx={{ fontWeight: 950 }}>{c.name}</Typography>
                                    </Stack>
                                    <Chip size="small" color={c.status === "Active" ? "success" : c.status === "Expiring" ? "warning" : "default"} label={c.status} />
                                  </Stack>
                                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    Fingerprint: <b>{c.fingerprint}</b>
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    Expires: <b>{new Date(c.expiresAt).toLocaleDateString()}</b>
                                  </Typography>
                                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                    <Button variant="outlined" sx={orangeOutlined} startIcon={<CopyIcon size={18} />} onClick={async () => {
                                      const ok = await copyToClipboard(c.fingerprint);
                                      setSnack({ open: true, severity: ok ? "success" : "warning", msg: ok ? "Fingerprint copied." : "Copy failed." });
                                    }}>
                                      Copy fingerprint
                                    </Button>
                                    <Button variant="outlined" sx={orangeOutlined} startIcon={<RefreshIcon size={18} />} onClick={() => rotateCert(c.id)} disabled={!canEdit || c.status !== "Active"}>
                                      Rotate
                                    </Button>
                                  </Stack>
                                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    Created {timeAgo(c.createdAt)}
                                  </Typography>
                                </Stack>
                              </Box>
                            ))
                            }
                          </Stack>

                          <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                            Best practice: keep one active cert and one staged cert during rotation.
                          </Alert>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </Box>

              {/* Mobile sticky actions */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={() => setTestOpen(true)} startIcon={<BeakerIcon size={18} />}>
                        Test
                      </Button>
                      <Button fullWidth variant="contained" color="secondary" sx={orangeContained} onClick={save} disabled={!canEdit || saving} endIcon={<ArrowRightIcon size={18} />}>
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

        {/* Toggle confirm */}
        <Dialog open={toggleConfirmOpen} onClose={() => setToggleConfirmOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>{toggleNextValue ? "Enable SSO" : "Disable SSO"}</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {toggleNextValue ? "Enabling SSO may redirect users to your identity provider." : "Disabling SSO may allow password login for org accounts."}
              </Typography>
              <Alert severity={toggleNextValue ? "info" : "warning"} icon={<AlertTriangleIcon size={18} />}>
                In production, this action should be audited and may require re-authentication.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setToggleConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="secondary" sx={orangeContained} onClick={applyToggle}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add domain rule */}
        <Dialog open={addDomainOpen} onClose={() => setAddDomainOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Add domain rule</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <TextField value={newDomain} onChange={(e) => setNewDomain(e.target.value)} label="Email domain" placeholder="example.com" fullWidth />
              <FormControlLabel control={<Switch checked={newDomainRequireSso} onChange={(e) => setNewDomainRequireSso(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Require SSO for this domain</Typography>} />
              <FormControlLabel control={<Switch checked={newDomainFallback} onChange={(e) => setNewDomainFallback(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Allow password fallback</Typography>} />
              <TextField select label="Default role" value={newDomainRole} onChange={(e) => setNewDomainRole(e.target.value as any)}>
                {(["Admin", "Manager", "Member", "Viewer"] as Array<Exclude<OrgRole, "Owner">>).map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
              <Alert severity="info">You can verify domains in the Domain Verification page.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setAddDomainOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="secondary" sx={orangeContained} onClick={addRule}>
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add certificate */}
        <Dialog open={certDialogOpen} onClose={() => setCertDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Add certificate</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <TextField value={certName} onChange={(e) => setCertName(e.target.value)} label="Name" fullWidth />
              <TextField type="date" label="Expiry date" value={certExpiry} onChange={(e) => setCertExpiry(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField value={certPem} onChange={(e) => setCertPem(e.target.value)} label="Certificate (PEM)" multiline minRows={4} fullWidth />
              <Alert severity="info">Rotation best practice: stage a new cert before deactivating the old one.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setCertDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="secondary" sx={orangeContained} onClick={addCert}>
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Test SSO */}
        <Dialog open={testOpen} onClose={() => setTestOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Test SSO (sandbox)</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                This is a safe test that does not affect production users.
              </Typography>

              <Box className="grid gap-3 md:grid-cols-3">
                <TextField select label="Provider" value={ssoType} onChange={(e) => setSsoType(e.target.value as SsoType)}>
                  <MenuItem value="SAML">SAML</MenuItem>
                  <MenuItem value="OIDC">OIDC</MenuItem>
                </TextField>
                <TextField value={testEmail} onChange={(e) => setTestEmail(e.target.value)} label="Test user email" placeholder="user@example.com" fullWidth />
                <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<BeakerIcon size={18} />} onClick={runTest} disabled={testResult.status === "running"}>
                  {testResult.status === "running" ? "Running..." : "Run test"}
                </Button>
              </Box>

              <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
                  <Typography sx={{ fontWeight: 950 }}>Logs</Typography>
                  <Chip
                    size="small"
                    label={testResult.status === "success" ? "SUCCESS" : testResult.status === "fail" ? "FAIL" : testResult.status === "running" ? "RUNNING" : "IDLE"}
                    color={testResult.status === "success" ? "success" : testResult.status === "fail" ? "error" : testResult.status === "running" ? "warning" : "default"}
                  />
                </Stack>
                <Divider sx={{ my: 1.2 }} />
                <Box sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace", fontSize: 13, whiteSpace: "pre-wrap", color: theme.palette.text.primary }}>
                  {testResult.logs.length ? testResult.logs.join("\n") : "No logs yet."}
                </Box>
              </Box>

              <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                After a successful test, enable SSO and verify domains to enforce it.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setTestOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snack.open} autoHideDuration={3400} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant={mode === "dark" ? "filled" : "standard"}
            sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
