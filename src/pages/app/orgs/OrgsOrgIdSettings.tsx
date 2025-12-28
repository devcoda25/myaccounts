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
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";
import { EVZONE } from "../../../theme/evzone";

/**
 * EVzone My Accounts - Org Settings
 * Route: /app/orgs/:orgId/settings
 *
 * Features:
 * - Org name
 * - Logo upload
 * - Address (optional)
 * - Default roles policy (optional)
 */

type ThemeMode = "light" | "dark";

type Severity = "info" | "warning" | "error" | "success";

type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer";

type DefaultInviteRole = Exclude<OrgRole, "Owner">;

type Org = {
  id: string;
  name: string;
  country: string;
  logoDataUrl?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    region?: string;
    postal?: string;
  };
  defaultRolePolicy?: {
    defaultInviteRole: DefaultInviteRole;
    requireAdminApproval: boolean;
    domainAutoRoleEnabled: boolean;
    domain?: string;
    domainRole: DefaultInviteRole;
  };
};

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

function BuildingIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 21V3h12v18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 9h4v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 7h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 11h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function CameraIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 7h4l2-2h4l2 2h4v12H4V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function SaveIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 4h12l4 4v12H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 4v6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="14" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
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

function MapPinIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 21s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function UsersIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M22 21v-2a3 3 0 0 0-2.5-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 3.3a3 3 0 0 1 0 7.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// -----------------------------
// Theme helpers
// -----------------------------
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || "O";
  const b = parts[1]?.[0] || parts[0]?.[1] || "R";
  return (a + b).toUpperCase();
}

function readOrgIdFromUrl(defaultId: string) {
  try {
    const qs = new URLSearchParams(window.location.search);
    return qs.get("orgId") || defaultId;
  } catch {
    return defaultId;
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Self-tests removed

export default function OrgSettingsPage() {
  // const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  // const theme = useMemo(() => buildTheme(mode), [mode]);
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  // Demo context
  const [myRole, setMyRole] = useState<OrgRole>("Admin");
  const isAdmin = myRole === "Owner" || myRole === "Admin";

  const [org] = useState<Org>(() => {
    const id = readOrgIdFromUrl("org_evworld");
    return {
      id,
      name: id === "org_evzone_group" ? "EVzone Group" : id === "org_partner" ? "Partner Organization" : "EV World",
      country: "Uganda",
      logoDataUrl: undefined,
      address: {
        line1: "Millennium House, Nsambya Road 472",
        line2: "",
        city: "Kampala",
        region: "Central",
        postal: "",
      },
      defaultRolePolicy: {
        defaultInviteRole: "Member",
        requireAdminApproval: true,
        domainAutoRoleEnabled: true,
        domain: "evworld.africa",
        domainRole: "Manager",
      },
    };
  });

  const [name, setName] = useState(org.name);
  const [country, setCountry] = useState(org.country);

  const [logo, setLogo] = useState<string | undefined>(org.logoDataUrl);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Address
  const [addrEnabled, setAddrEnabled] = useState(true);
  const [line1, setLine1] = useState(org.address?.line1 || "");
  const [line2, setLine2] = useState(org.address?.line2 || "");
  const [city, setCity] = useState(org.address?.city || "");
  const [region, setRegion] = useState(org.address?.region || "");
  const [postal, setPostal] = useState(org.address?.postal || "");

  // Default role policy
  const [policyEnabled, setPolicyEnabled] = useState(true);
  const [defaultInviteRole, setDefaultInviteRole] = useState<DefaultInviteRole>(org.defaultRolePolicy?.defaultInviteRole || "Member");
  const [requireApproval, setRequireApproval] = useState(org.defaultRolePolicy?.requireAdminApproval ?? true);
  const [domainAutoRoleEnabled, setDomainAutoRoleEnabled] = useState(org.defaultRolePolicy?.domainAutoRoleEnabled ?? false);
  const [domain, setDomain] = useState(org.defaultRolePolicy?.domain || "");
  const [domainRole, setDomainRole] = useState<DefaultInviteRole>(org.defaultRolePolicy?.domainRole || "Member");

  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  // Self-tests effect removed

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

  const toggleMode = () => {
    // Mode toggling handled by ContextSwitcher or outside
  };

  const pickLogo = () => fileRef.current?.click();

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await fileToDataUrl(f);
    setLogo(url);
    setSnack({ open: true, severity: "success", msg: "Logo selected (demo)." });
  };

  const onSave = async () => {
    if (!isAdmin) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can update organization settings." });
      return;
    }
    if (!name.trim()) {
      setSnack({ open: true, severity: "warning", msg: "Organization name is required." });
      return;
    }
    if (policyEnabled && domainAutoRoleEnabled && domain.trim() && !domain.includes(".")) {
      setSnack({ open: true, severity: "warning", msg: "Enter a valid domain for the auto-role policy." });
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 650));
    setSaving(false);

    setSnack({ open: true, severity: "success", msg: "Organization settings saved (demo)." });
  };

  const onReset = () => {
    setName(org.name);
    setCountry(org.country);
    setLogo(org.logoDataUrl);

    setAddrEnabled(true);
    setLine1(org.address?.line1 || "");
    setLine2(org.address?.line2 || "");
    setCity(org.address?.city || "");
    setRegion(org.address?.region || "");
    setPostal(org.address?.postal || "");

    setPolicyEnabled(true);
    setDefaultInviteRole(org.defaultRolePolicy?.defaultInviteRole || "Member");
    setRequireApproval(org.defaultRolePolicy?.requireAdminApproval ?? true);
    setDomainAutoRoleEnabled(org.defaultRolePolicy?.domainAutoRoleEnabled ?? false);
    setDomain(org.defaultRolePolicy?.domain || "");
    setDomainRole(org.defaultRolePolicy?.domainRole || "Member");

    setSnack({ open: true, severity: "info", msg: "Reset to defaults (demo)." });
  };

  return (
    <>
      <CssBaseline />
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top bar */}
        <Box
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            position: "sticky",
            top: 0,
            zIndex: 10,
            backdropFilter: "blur(10px)",
            backgroundColor: alpha(theme.palette.background.default, 0.72),
          }}
        >
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "4px",
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.75) 100%)",
                    boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.20)}`,
                  }}
                >
                  <Typography sx={{ color: "white", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>My Accounts</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Org settings
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {/* Demo: role switch */}
                <TextField
                  select
                  size="small"
                  value={myRole}
                  onChange={(e) => setMyRole(e.target.value as OrgRole)}
                  sx={{ minWidth: 140, display: { xs: "none", md: "block" } }}
                  label="My role"
                >
                  {(["Owner", "Admin", "Manager", "Member", "Viewer"] as OrgRole[]).map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>

                <Tooltip title="Switch to Light/Dark Mode">
                  <IconButton
                    size="small"
                    onClick={toggleMode}
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: "4px", color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}
                  >
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Language">
                  <IconButton
                    size="small"
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: "4px", color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}
                  >
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
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">Organization settings</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Update your organization profile and policies.
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip icon={<BuildingIcon size={16} />} label={org.id} size="small" variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" label={`Role: ${myRole}`} color={isAdmin ? "success" : "info"} />
                          {!isAdmin ? <Chip size="small" color="warning" label="Read-only" /> : null}
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                        <Button variant="outlined" sx={orangeOutlined} onClick={onReset}>
                          Reset
                        </Button>
                        <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<SaveIcon size={18} />} onClick={onSave} disabled={saving}>
                          {saving ? "Saving..." : "Save"}
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    {!isAdmin ? (
                      <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                        Only "Owner" and "Admin" can edit these settings.
                      </Alert>
                    ) : (
                      <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                        Changes may require re-authentication in production.
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Left: org identity */}
                <Box className="md:col-span-5">
                  <Card>
                    <CardContent className="p-5">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Organization identity</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Name, logo, and basic organization details.
                        </Typography>
                        <Divider />

                        <Stack direction="row" spacing={1.4} alignItems="center">
                          <Avatar
                            src={logo}
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: "4px",
                              bgcolor: alpha(EVZONE.green, 0.16),
                              color: theme.palette.text.primary,
                              fontWeight: 950,
                              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                            }}
                          >
                            {initials(name || org.name)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography sx={{ fontWeight: 950 }}>Logo</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Recommended: 1:1 square, at least 256px.
                            </Typography>
                          </Box>
                          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onLogoChange} />
                          <Button variant="outlined" sx={orangeOutlined} startIcon={<CameraIcon size={18} />} onClick={pickLogo} disabled={!isAdmin}>
                            Upload
                          </Button>
                        </Stack>

                        <TextField value={name} onChange={(e) => setName(e.target.value)} label="Organization name" fullWidth disabled={!isAdmin} InputProps={{ startAdornment: (<InputAdornment position="start"><BuildingIcon size={18} /></InputAdornment>) }} />
                        <TextField value={country} onChange={(e) => setCountry(e.target.value)} label="Country/region" fullWidth disabled={!isAdmin} InputProps={{ startAdornment: (<InputAdornment position="start"><GlobeIcon size={18} /></InputAdornment>) }} />

                        <Alert severity="info">
                          Use your legal organization name where required for billing.
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Right: address + policies */}
                <Box className="md:col-span-7">
                  <Stack spacing={2.2}>
                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                            <Box>
                              <Typography variant="h6">Address</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Optional. Useful for invoices and compliance.
                              </Typography>
                            </Box>
                            <FormControlLabel
                              control={<Switch checked={addrEnabled} onChange={(e) => setAddrEnabled(e.target.checked)} color="secondary" />}
                              label={<Typography sx={{ fontWeight: 900 }}>Enabled</Typography>}
                              disabled={!isAdmin}
                            />
                          </Stack>
                          <Divider />
                          <Box className="grid gap-3 md:grid-cols-2">
                            <TextField value={line1} onChange={(e) => setLine1(e.target.value)} label="Address line 1" fullWidth disabled={!isAdmin || !addrEnabled} InputProps={{ startAdornment: (<InputAdornment position="start"><MapPinIcon size={18} /></InputAdornment>) }} />
                            <TextField value={line2} onChange={(e) => setLine2(e.target.value)} label="Address line 2" fullWidth disabled={!isAdmin || !addrEnabled} />
                            <TextField value={city} onChange={(e) => setCity(e.target.value)} label="City" fullWidth disabled={!isAdmin || !addrEnabled} />
                            <TextField value={region} onChange={(e) => setRegion(e.target.value)} label="Region" fullWidth disabled={!isAdmin || !addrEnabled} />
                            <TextField value={postal} onChange={(e) => setPostal(e.target.value)} label="Postal code" fullWidth disabled={!isAdmin || !addrEnabled} />
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                            <Box>
                              <Typography variant="h6">Default roles policy</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Control defaults for invites and new members.
                              </Typography>
                            </Box>
                            <FormControlLabel
                              control={<Switch checked={policyEnabled} onChange={(e) => setPolicyEnabled(e.target.checked)} color="secondary" />}
                              label={<Typography sx={{ fontWeight: 900 }}>Enabled</Typography>}
                              disabled={!isAdmin}
                            />
                          </Stack>

                          <Divider />

                          <Box className="grid gap-3 md:grid-cols-2">
                            <TextField
                              select
                              label="Default invited role"
                              value={defaultInviteRole}
                              onChange={(e) => setDefaultInviteRole(e.target.value as DefaultInviteRole)}
                              fullWidth
                              disabled={!isAdmin || !policyEnabled}
                              InputProps={{ startAdornment: (<InputAdornment position="start"><UsersIcon size={18} /></InputAdornment>) }}
                            >
                              {(["Admin", "Manager", "Member", "Viewer"] as DefaultInviteRole[]).map((r) => (
                                <MenuItem key={r} value={r}>
                                  {r}
                                </MenuItem>
                              ))}
                            </TextField>

                            <FormControlLabel
                              control={<Switch checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} color="secondary" />}
                              label={<Typography sx={{ fontWeight: 900 }}>Require admin approval</Typography>}
                              disabled={!isAdmin || !policyEnabled}
                            />
                          </Box>

                          <Divider />

                          <Stack spacing={1.1}>
                            <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                              <Typography sx={{ fontWeight: 950 }}>Auto-assign role by email domain</Typography>
                              <Switch checked={domainAutoRoleEnabled} onChange={(e) => setDomainAutoRoleEnabled(e.target.checked)} color="secondary" disabled={!isAdmin || !policyEnabled} />
                            </Stack>

                            <Box className="grid gap-3 md:grid-cols-2">
                              <TextField value={domain} onChange={(e) => setDomain(e.target.value)} label="Domain" placeholder="example.com" fullWidth disabled={!isAdmin || !policyEnabled || !domainAutoRoleEnabled} InputProps={{ startAdornment: (<InputAdornment position="start"><GlobeIcon size={18} /></InputAdornment>) }} />
                              <TextField select label="Role for domain" value={domainRole} onChange={(e) => setDomainRole(e.target.value as DefaultInviteRole)} fullWidth disabled={!isAdmin || !policyEnabled || !domainAutoRoleEnabled}>
                                {(["Admin", "Manager", "Member", "Viewer"] as DefaultInviteRole[]).map((r) => (
                                  <MenuItem key={r} value={r}>
                                    {r}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Box>

                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              Example: all users with email ending in "@{domain || "example.com"}" become "{domainRole}".
                            </Typography>
                          </Stack>

                          <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                            Tip: Combine domain policies with SSO to secure enterprise accounts.
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
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={onReset}>
                        Reset
                      </Button>
                      <Button fullWidth variant="contained" color="secondary" sx={orangeContained} startIcon={<SaveIcon size={18} />} onClick={onSave} disabled={saving}>
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

        <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
