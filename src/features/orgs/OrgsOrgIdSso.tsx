import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
import { useNavigate, useParams } from 'react-router-dom';
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { OrganizationDto } from "@/services/OrganizationService";
import { OrgRole, Severity } from "@/types";
import { api } from "@/utils/api";

interface SsoConfigResponse {
  isEnabled: boolean;
  provider: SsoType;
  config: ISsoConfig;
}

interface ISsoConfig {
  entityId?: string;
  ssoUrl?: string;
  sloUrl?: string;
  cert?: string;
  wantSignedResponse?: boolean;
  issuer?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  jwksUrl?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUris?: string[];
  scopes?: string[];
  usePkce?: boolean;
}

interface DomainRuleResponse {
  id: string;
  domain: string;
  status: string;
  requireSso: boolean;
  allowPasswordFallback: boolean;
  defaultRole: string;
}

type SsoType = "SAML" | "OIDC";

type DomainRule = {
  id: string;
  domain: string;
  verified: boolean;
  requireSso: boolean;
  allowPasswordFallback: boolean;
  defaultRole: string; // backend uses string, effectively OrgRole
};

// ... Icons ...
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>{children}</svg>);
}
function SunIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M22 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function MoonIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M21 13a8 8 0 0 1-10-10 7.5 7.5 0 1 0 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>);
}
function GlobeIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>);
}
function KeyIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><path d="M11 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18 12v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M15 12v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function LinkIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function UploadIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function DocumentIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M15 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function BeakerIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M10 2v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M8 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function AlertTriangleIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></IconBase>);
}
function CertificateIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><rect x="6" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M9 7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M10 17l2 4 2-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>);
}

// Utils
function isAdminRole(role: OrgRole) {
  return role === "Owner" || role === "Admin";
}

function dateInputValue(ts: number) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function EnterpriseSSOSetupPage() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeStore();
  const isDark = mode === "dark";
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [myRole, setMyRole] = useState<OrgRole>("Viewer");
  const canEdit = isAdminRole(myRole);

  // SSO state
  const [ssoEnabled, setSsoEnabled] = useState<boolean>(false);
  const [ssoType, setSsoType] = useState<SsoType>("SAML");

  // SAML fields
  const [samlMode, setSamlMode] = useState<"metadata" | "manual">("metadata");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [metadataFileName, setMetadataFileName] = useState<string | null>(null);
  const metadataRef = useRef<HTMLInputElement | null>(null);
  const [samlEntityId, setSamlEntityId] = useState("");
  const [samlSsoUrl, setSamlSsoUrl] = useState("");
  const [samlSloUrl, setSamlSloUrl] = useState("");
  const [samlCertPem, setSamlCertPem] = useState("");
  const [wantSignedResponse, setWantSignedResponse] = useState(true);

  // OIDC fields
  const [oidcIssuer, setOidcIssuer] = useState("");
  const [oidcAuth, setOidcAuth] = useState("");
  const [oidcToken, setOidcToken] = useState("");
  const [oidcJwks, setOidcJwks] = useState("");
  const [oidcClientId, setOidcClientId] = useState("");
  const [oidcClientSecret, setOidcClientSecret] = useState("");
  const [oidcRedirectUris, setOidcRedirectUris] = useState("");
  const [oidcScopes, setOidcScopes] = useState("openid email profile");
  const [oidcPkce, setOidcPkce] = useState(true);

  // Domains
  const [domainRules, setDomainRules] = useState<DomainRule[]>([]);
  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [toggleNextValue, setToggleNextValue] = useState<boolean>(true);


  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const [orgData, ssoData, domainsData] = await Promise.all([
        api<OrganizationDto>(`/orgs/${orgId}`),
        api<SsoConfigResponse | null>(`/orgs/${orgId}/sso`).catch(() => null), // might be null
        api<DomainRuleResponse[]>(`/orgs/${orgId}/domains`)
      ]);

      setOrgName(orgData.name);
      setMyRole(orgData.role as OrgRole);

      if (ssoData) {
        setSsoEnabled(ssoData.isEnabled);
        setSsoType(ssoData.provider as SsoType);
        const cfg = ssoData.config || {};
        // Populate config fields
        if (ssoData.provider === 'SAML') {
          setSamlEntityId(cfg.entityId || "");
          setSamlSsoUrl(cfg.ssoUrl || "");
          setSamlSloUrl(cfg.sloUrl || "");
          setSamlCertPem(cfg.cert || "");
          setWantSignedResponse(cfg.wantSignedResponse ?? true);
        } else {
          setOidcIssuer(cfg.issuer || "");
          setOidcAuth(cfg.authorizationUrl || "");
          setOidcToken(cfg.tokenUrl || "");
          setOidcJwks(cfg.jwksUrl || "");
          setOidcClientId(cfg.clientId || "");
          setOidcClientSecret(cfg.clientSecret || "");
          setOidcRedirectUris((cfg.redirectUris || []).join('\n'));
          setOidcScopes((cfg.scopes || []).join(' '));
          setOidcPkce(cfg.usePkce ?? true);
        }
      }

      // Map domains
      const rules: DomainRule[] = domainsData.map((d) => ({
        id: d.id,
        domain: d.domain,
        verified: d.status === 'VERIFIED',
        requireSso: d.requireSso,
        allowPasswordFallback: d.allowPasswordFallback,
        defaultRole: d.defaultRole
      }));
      setDomainRules(rules);

    } catch (err: unknown) {
      setSnack({ open: true, severity: "error", msg: "Failed to load SSO data" });
    } finally {
      setLoading(false);
    }
  };

  const pageBg = mode === "dark"
    ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
    : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const orangeContained = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 4px 14px ${alpha(EVZONE.orange, 0.4)}`,
    borderRadius: "4px",
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const orangeOutlined = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    borderRadius: "4px",
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
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
  };

  const parseMetadata = () => {
    // Only parsing logic (mocked)
    setSnack({ open: true, severity: "success", msg: "Metadata parsed (demo)." });
    setSamlEntityId("https://idp.example.com/saml/entity");
    setSamlSsoUrl("https://idp.example.com/saml/sso");
  };

  const onUploadMetadata = () => metadataRef.current?.click();
  const onMetadataFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMetadataFileName(f.name);
    setSnack({ open: true, severity: "success", msg: "Metadata file selected (demo)." });
  };

  // Domain rule management
  const openAddRule = () => {
    if (!canEdit) return;
    setAddDomainOpen(true);
    setNewDomain("");
  };

  const addRule = async () => {
    if (!canEdit || !orgId) return;
    const d = newDomain.trim().toLowerCase();
    if (!d) return;

    try {
      const added = await api.post<DomainRuleResponse>(`/orgs/${orgId}/domains`, { domain: d });
      // Refresh
      loadData();
      setAddDomainOpen(false);
      setSnack({ open: true, severity: "success", msg: "Domain added." });
    } catch (err: unknown) {
      setSnack({ open: true, severity: "error", msg: "Failed to add domain." });
    }
  };

  const toggleRule = async (id: string, patch: Partial<DomainRule>) => {
    if (!canEdit || !orgId) return;

    // Optimistic
    setDomainRules(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

    try {
      await api.patch<void>(`/orgs/${orgId}/domains/${id}`, patch);
      setSnack({ open: true, severity: "success", msg: "Rule updated." });
    } catch (err: unknown) {
      setSnack({ open: true, severity: "error", msg: "Failed to update rule." });
      loadData(); // Revert
    }
  };


  const save = async () => {
    if (!canEdit || !orgId) return;

    setSaving(true);

    // Construct config
    const config: ISsoConfig = {};

    if (ssoType === 'SAML') {
      config.entityId = samlEntityId;
      config.ssoUrl = samlSsoUrl;
      config.sloUrl = samlSloUrl;
      config.cert = samlCertPem;
      config.wantSignedResponse = wantSignedResponse;
    } else {
      config.issuer = oidcIssuer;
      config.authorizationUrl = oidcAuth;
      config.tokenUrl = oidcToken;
      config.jwksUrl = oidcJwks;
      config.clientId = oidcClientId;
      config.clientSecret = oidcClientSecret;
      config.redirectUris = oidcRedirectUris.split('\n').map(x => x.trim()).filter(Boolean);
      config.scopes = oidcScopes.split(' ').map(x => x.trim()).filter(Boolean);
      config.usePkce = oidcPkce;
    }

    try {
      await api.put<void>(`/orgs/${orgId}/sso`, {
        provider: ssoType,
        isEnabled: ssoEnabled,
        config
      });
      setSnack({ open: true, severity: "success", msg: "SSO settings saved." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSnack({ open: true, severity: "error", msg: "Failed to save: " + msg });
    } finally {
      setSaving(false);
    }
  };

  const ssoStatusChip = ssoEnabled ? <Chip size="small" color="success" label="Enabled" /> : <Chip size="small" color="warning" label="Disabled" />;

  if (loading && !domainRules.length && !samlEntityId) { // Basic check for loading
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: EVZONE.green }} />
      </Box>
    );
  }

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
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{orgName}</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Enterprise SSO • {orgId}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField select size="small" label="My role" value={myRole} disabled onChange={() => { }} sx={{ minWidth: 140, display: { xs: "none", md: "block" } }}>
                  <MenuItem value={myRole}>{myRole}</MenuItem>
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
                      {/* Test SSO button removed or simplified */}
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
                            </Stack>

                            {/* Metadata stuff skipped for brevity, keeping manual fields primarily */}
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
                          </Stack>
                        ) : (
                          <Stack spacing={1.2}>
                            <Typography sx={{ fontWeight: 950 }}>OIDC configuration</Typography>
                            <Box className="grid gap-3 md:grid-cols-2">
                              <TextField value={oidcIssuer} onChange={(e) => setOidcIssuer(e.target.value)} label="Issuer URL" fullWidth disabled={!canEdit} />
                              <TextField value={oidcAuth} onChange={(e) => setOidcAuth(e.target.value)} label="Auth URL" fullWidth disabled={!canEdit} />
                              <TextField value={oidcToken} onChange={(e) => setOidcToken(e.target.value)} label="Token URL" fullWidth disabled={!canEdit} />
                              <TextField value={oidcJwks} onChange={(e) => setOidcJwks(e.target.value)} label="JWKS URL" fullWidth disabled={!canEdit} />
                              <TextField value={oidcClientId} onChange={(e) => setOidcClientId(e.target.value)} label="Client ID" fullWidth disabled={!canEdit} />
                              <TextField value={oidcClientSecret} onChange={(e) => setOidcClientSecret(e.target.value)} label="Client Secret" type="password" fullWidth disabled={!canEdit} />
                            </Box>
                            <TextField value={oidcRedirectUris} onChange={(e) => setOidcRedirectUris(e.target.value)} label="Redirect URIs (one per line)" fullWidth multiline disabled={!canEdit} />
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Right: Domain rules */}
                <Box className="md:col-span-5">
                  <Card sx={{ height: "100%" }}>
                    <CardContent className="p-5">
                      <Stack spacing={1.2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="h6">Domain rules</Typography>
                          <Button size="small" startIcon={<Button size="small" onClick={openAddRule}>Add</Button>} />
                        </Stack>

                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Matches user email domains to SSO policies.
                        </Typography>
                        <Divider />

                        <Stack spacing={1.1}>
                          {domainRules.map(d => (
                            <Box key={d.id} sx={{ p: 1.5, borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                              <Stack spacing={1}>
                                <Typography sx={{ fontWeight: 700 }}>{d.domain}</Typography>
                                <Stack direction="row" spacing={1}>
                                  {d.verified ? <Chip size="small" color="success" label="Verified" /> : <Chip size="small" color="warning" label="Unverified" />}
                                </Stack>

                                <Divider />
                                <FormControlLabel
                                  control={<Switch size="small" checked={d.requireSso} onChange={(e) => toggleRule(d.id, { requireSso: e.target.checked })} disabled={!canEdit || !d.verified} />} // require verified to enforce SSO?
                                  label={<Typography variant="caption">Require SSO</Typography>}
                                />
                                <FormControlLabel
                                  control={<Switch size="small" checked={d.allowPasswordFallback} onChange={(e) => toggleRule(d.id, { allowPasswordFallback: e.target.checked })} disabled={!canEdit} />}
                                  label={<Typography variant="caption">Allow password fallback</Typography>}
                                />
                              </Stack>
                            </Box>
                          ))}
                          {domainRules.length === 0 && <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>No domains. Add verifiable domains first.</Typography>}

                          <Button variant="outlined" size="small" onClick={openAddRule} disabled={!canEdit}>Add domain</Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

            </Stack>
          </motion.div>
        </Box>

        {/* Toggle Confirm Dialog */}
        <Dialog open={toggleConfirmOpen} onClose={() => setToggleConfirmOpen(false)}>
          <DialogTitle>Confirm {toggleNextValue ? "Enable" : "Disable"} SSO?</DialogTitle>
          <DialogContent>
            <Typography>
              {toggleNextValue
                ? "Users matching your domain rules will be redirected to the IdP."
                : "SSO will be disabled. Users will sign in with passwords/OTP."}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setToggleConfirmOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={applyToggle}>Confirm</Button>
          </DialogActions>
        </Dialog>

        {/* Add Domain Dialog */}
        <Dialog open={addDomainOpen} onClose={() => setAddDomainOpen(false)}>
          <DialogTitle>Add domain</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Domain (e.g. example.com)" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} fullWidth />
              <Typography variant="caption">This will create a new domain entry which you must verify.</Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDomainOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={addRule}>Add</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
