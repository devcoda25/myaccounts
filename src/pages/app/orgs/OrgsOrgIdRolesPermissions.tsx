import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Divider,
  FormControlLabel,
  IconButton,
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
import { useThemeStore } from "../../../stores/themeStore";
import { useNavigate, useParams } from "react-router-dom";
import { OrganizationService } from "../../../services/OrganizationService";
import { OrgRole, Severity } from "../../../utils/types";
import { formatOrgId } from "../../../utils/format";

type PermissionKey =
  | "members.view"
  | "members.invite"
  | "members.remove"
  | "members.roles"
  | "wallet.view"
  | "wallet.spend"
  | "wallet.payouts"
  | "security.view"
  | "security.mfa"
  | "sso.manage"
  | "audit.view"
  | "audit.export"
  | "apps.manage";

type Permission = {
  key: PermissionKey;
  label: string;
  description: string;
  category: "Members" | "Wallet" | "Security" | "SSO" | "Audit" | "Apps";
};

type RoleModel = {
  id: string;
  name: OrgRole;
  builtIn: boolean;
  membersCount: number;
};

type RolePolicy = {
  defaultInviteRole: Exclude<OrgRole, "Owner">;
  requireAdminApproval: boolean;
  requireMfaForAdmins: boolean;
};

// Local EVZONE and THEME_KEY removed

// -----------------------------
// Icons
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

function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function CogIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.5-2.3.7a7.7 7.7 0 0 0-1.7-1L15 4h-6l-.5 2.7c-.6.3-1.2.6-1.7 1L4.5 7 2.5 10.5 4.5 12l-.1 2L2.5 15.5 4.5 19l2.3-.7c.5.4 1.1.7 1.7 1L9 22h6l.5-2.7c.6-.3 1.2-.6 1.7-1l2.3.7 2-3.5-2-1.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

// -----------------------------
// Theme helpers
// -----------------------------
// Local theme logic removed

function isAdminRole(role: OrgRole) {
  return role === "Owner" || role === "Admin";
}

function prettyCategory(cat: Permission["category"]) {
  return cat;
}

function groupByCategory(perms: Permission[]) {
  const map = new Map<Permission["category"], Permission[]>();
  perms.forEach((p) => {
    const arr = map.get(p.category) || [];
    arr.push(p);
    map.set(p.category, arr);
  });
  return Array.from(map.entries());
}

// Self-tests removed

export default function OrgRolesPermissionsPage() {
  // const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  // const theme = useMemo(() => buildTheme(mode), [mode]);
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<OrgRole>("Member");
  const canEdit = isAdminRole(myRole);

  const [orgName, setOrgName] = useState("");

  const permissions: Permission[] = useMemo(
    () => [
      { key: "members.view", label: "View members", description: "See member list and statuses.", category: "Members" },
      { key: "members.invite", label: "Invite members", description: "Send and revoke invites.", category: "Members" },
      { key: "members.remove", label: "Remove members", description: "Remove members from the org.", category: "Members" },
      { key: "members.roles", label: "Change roles", description: "Assign roles and permissions.", category: "Members" },

      { key: "wallet.view", label: "View org wallet", description: "See balances, limits, and transactions.", category: "Wallet" },
      { key: "wallet.spend", label: "Spend from org wallet", description: "Make payments using org funds.", category: "Wallet" },
      { key: "wallet.payouts", label: "Manage payouts", description: "Approve and manage payout requests.", category: "Wallet" },

      { key: "security.view", label: "View security settings", description: "View org security posture.", category: "Security" },
      { key: "security.mfa", label: "Manage MFA policies", description: "Require MFA for roles or actions.", category: "Security" },

      { key: "sso.manage", label: "Manage SSO", description: "Configure SAML/OIDC SSO domains.", category: "SSO" },

      { key: "audit.view", label: "View audit logs", description: "Access audit events and highlights.", category: "Audit" },
      { key: "audit.export", label: "Export audit logs", description: "Download audit reports.", category: "Audit" },

      { key: "apps.manage", label: "Manage apps", description: "Configure integrations and allowed apps.", category: "Apps" },
    ],
    []
  );

  const [roles] = useState<RoleModel[]>(() => [
    { id: "r_owner", name: "Owner" as OrgRole, builtIn: true, membersCount: 1 },
    { id: "r_admin", name: "Admin" as OrgRole, builtIn: true, membersCount: 2 },
    { id: "r_manager", name: "Manager" as OrgRole, builtIn: true, membersCount: 3 },
    { id: "r_member", name: "Member" as OrgRole, builtIn: true, membersCount: 6 },
    { id: "r_viewer", name: "Viewer" as OrgRole, builtIn: true, membersCount: 0 },
    { id: "r_support", name: "Support" as OrgRole, builtIn: false, membersCount: 2 },
  ]);

  const [selectedRole, setSelectedRole] = useState<OrgRole>("Admin");

  // Role permissions model
  const [grants, setGrants] = useState<Record<OrgRole, Record<PermissionKey, boolean>>>(() => {
    const base = {} as Record<OrgRole, Record<PermissionKey, boolean>>;

    (["Owner", "Admin", "Manager", "Member", "Viewer", "Support"] as OrgRole[]).forEach((r) => {
      base[r] = {} as Record<PermissionKey, boolean>;
    });

    (Object.keys(base) as OrgRole[]).forEach((r) => {
      permissions.forEach((p) => {
        base[r][p.key] = false;
      });
    });

    // Opinionated defaults
    permissions.forEach((p) => {
      base.Owner[p.key] = true;
    });

    // Admin
    [
      "members.view",
      "members.invite",
      "members.remove",
      "members.roles",
      "wallet.view",
      "wallet.spend",
      "wallet.payouts",
      "security.view",
      "security.mfa",
      "sso.manage",
      "audit.view",
      "audit.export",
      "apps.manage",
    ].forEach((k) => (base.Admin[k as PermissionKey] = true));

    // Manager
    ["members.view", "members.invite", "wallet.view", "wallet.spend", "security.view", "audit.view"].forEach((k) => (base.Manager[k as PermissionKey] = true));

    // Member
    ["members.view", "wallet.view", "security.view"].forEach((k) => (base.Member[k as PermissionKey] = true));

    // Viewer
    ["members.view", "audit.view"].forEach((k) => (base.Viewer[k as PermissionKey] = true));

    // Support
    ["members.view", "security.view", "audit.view"].forEach((k) => (base.Support[k as PermissionKey] = true));

    return base;
  });

  const [policy, setPolicy] = useState<RolePolicy>({
    defaultInviteRole: "Member",
    requireAdminApproval: true,
    requireMfaForAdmins: true,
  });

  const loadData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const [orgData, permData] = await Promise.all([
        OrganizationService.getOrg(orgId),
        OrganizationService.getPermissions(orgId)
      ]);

      setOrgName(orgData.name);
      setMyRole(orgData.role);

      if (permData.grants && Object.keys(permData.grants).length > 0) {
        setGrants(permData.grants as Record<OrgRole, Record<PermissionKey, boolean>>);
      }
      if (permData.policy) {
        setPolicy(permData.policy as RolePolicy);
      }

    } catch (err) {
      setSnack({ open: true, severity: "error", msg: "Failed to load permissions." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

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

  const isRoleLocked = selectedRole === "Owner";

  const updatePermission = (key: PermissionKey, value: boolean) => {
    if (!canEdit) return;
    if (isRoleLocked) return;

    setGrants((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [key]: value,
      },
    }));
  };

  const resetRole = () => {
    setSnack({ open: true, severity: "info", msg: "Reset not implemented in demo. Use Save to persist in production." });
  };

  const saveAll = async () => {
    if (!canEdit || !orgId) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can edit roles and permissions." });
      return;
    }
    try {
      setSaving(true);
      await OrganizationService.updatePermissions(orgId, { grants, policy });
      setSnack({ open: true, severity: "success", msg: "Roles and permissions saved successfully." });
    } catch (err: unknown) {
      setSnack({ open: true, severity: "error", msg: (err as Error).message || "Failed to save permissions." });
    } finally {
      setSaving(false);
    }
  };

  const grouped = useMemo(() => groupByCategory(permissions), [permissions]);

  const selectedRoleMeta = roles.find((r) => r.name === selectedRole);

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
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>{orgName}</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Roles and permissions • {formatOrgId(orgId || "")}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField select size="small" label="My role" value={myRole} onChange={(e) => setMyRole(e.target.value as OrgRole)} sx={{ minWidth: 150, display: { xs: "none", md: "block" } }}>
                  {(["Owner", "Admin", "Manager", "Member", "Viewer", "Support"] as OrgRole[]).map((r) => (
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

        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5">{orgName} roles and permissions</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Configure who can manage members, security, SSO, wallet, and audits.
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip size="small" icon={<UsersIcon size={16} />} label={`${roles.reduce((a, r) => a + r.membersCount, 0)} users`} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        <Chip size="small" icon={<ShieldCheckIcon size={16} />} label={canEdit ? "Editable" : "Read-only"} color={canEdit ? "success" : "warning"} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        <Chip size="small" label={`Default invite role: ${policy.defaultInviteRole}`} variant="outlined" />
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="outlined" sx={orangeOutlined} onClick={resetRole} disabled={!canEdit}>
                        Reset
                      </Button>
                      <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<SaveIcon size={18} />} onClick={saveAll} disabled={!canEdit || saving}>
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {!canEdit ? (
                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                      Only "Owner" and "Admin" can update this page.
                    </Alert>
                  ) : (
                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                      In production, changing roles is a sensitive action and should require re-authentication.
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                {/* Roles list */}
                <Box className="md:col-span-4">
                  <Card>
                    <CardContent className="p-5">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Roles</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Select a role to review permissions.</Typography>
                        <Divider />
                        <Stack spacing={1}>
                          {roles.map((r) => {
                            const selected = r.name === selectedRole;
                            return (
                              <Box
                                key={r.id}
                                onClick={() => setSelectedRole(r.name)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") setSelectedRole(r.name);
                                }}
                                sx={{
                                  borderRadius: "4px",
                                  border: `1px solid ${alpha(theme.palette.text.primary, selected ? 0.22 : 0.10)}`,
                                  backgroundColor: selected ? alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.10) : alpha(theme.palette.background.paper, 0.45),
                                  p: 1.2,
                                  cursor: "pointer",
                                  transition: "all 160ms ease",
                                  "&:hover": { borderColor: alpha(EVZONE.orange, 0.70), transform: "translateY(-1px)" },
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                  <Stack spacing={0.2}>
                                    <Typography sx={{ fontWeight: 950 }}>{r.name}</Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{r.builtIn ? "Built-in" : "Custom"}</Typography>
                                  </Stack>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip size="small" variant="outlined" label={`${r.membersCount}`} />
                                    {selected ? <Chip size="small" color="success" label="Selected" /> : null}
                                  </Stack>
                                </Stack>
                              </Box>
                            );
                          })}
                        </Stack>

                        <Divider />

                        <Button variant="outlined" sx={orangeOutlined} startIcon={<CogIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Create custom role (demo)." })} disabled={!canEdit}>
                          Create custom role
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Permissions */}
                <Box className="md:col-span-8">
                  <Card>
                    <CardContent className="p-5 md:p-7">
                      <Stack spacing={1.4}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                          <Box>
                            <Typography variant="h6">Permissions</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Role: <b>{selectedRole}</b> {selectedRoleMeta ? `(${selectedRoleMeta.membersCount} member(s))` : ""}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {selectedRole === "Owner" ? <Chip size="small" color="success" label="Locked" /> : null}
                            <Chip size="small" variant="outlined" icon={<ShieldCheckIcon size={16} />} label={canEdit ? "Editable" : "Read-only"} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          </Stack>
                        </Stack>

                        <Divider />

                        {grouped.map(([cat, perms]) => (
                          <Box key={cat} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                            <Stack spacing={1.0}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {cat === "Members" ? <UsersIcon size={18} /> : cat === "Wallet" ? <WalletIcon size={18} /> : cat === "Security" ? <ShieldCheckIcon size={18} /> : cat === "SSO" ? <KeyIcon size={18} /> : cat === "Apps" ? <CogIcon size={18} /> : <ShieldCheckIcon size={18} />}
                                <Typography sx={{ fontWeight: 950 }}>{prettyCategory(cat)}</Typography>
                              </Stack>

                              <Divider />

                              <Stack spacing={1.1}>
                                {perms.map((p) => {
                                  const value = grants[selectedRole][p.key];
                                  const disabled = !canEdit || isRoleLocked;
                                  return (
                                    <Box key={p.key} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`, backgroundColor: alpha(theme.palette.background.paper, 0.35), p: 1.1 }}>
                                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                                        <Box>
                                          <Typography sx={{ fontWeight: 950 }}>{p.label}</Typography>
                                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{p.description}</Typography>
                                        </Box>
                                        <FormControlLabel
                                          control={<Switch checked={value} onChange={(e) => updatePermission(p.key, e.target.checked)} color="secondary" />}
                                          label={<Typography sx={{ fontWeight: 900 }}>{value ? "Allowed" : "Denied"}</Typography>}
                                          disabled={disabled}
                                        />
                                      </Stack>
                                    </Box>
                                  );
                                })}
                              </Stack>
                            </Stack>
                          </Box>
                        ))}

                        <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                          Tip: For finance roles, enable "View org wallet" and restrict "Manage payouts".
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card sx={{ mt: 2 }}>
                    <CardContent className="p-5">
                      <Stack spacing={1.2}>
                        <Typography variant="h6">Default policy</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Organization-wide defaults for invites and admin security.
                        </Typography>

                        <Divider />

                        <Box className="grid gap-3 md:grid-cols-2">
                          <TextField
                            select
                            label="Default invite role"
                            value={policy.defaultInviteRole}
                            onChange={(e) => setPolicy((p) => ({ ...p, defaultInviteRole: e.target.value as Exclude<OrgRole, "Owner"> }))}
                            fullWidth
                            disabled={!canEdit}
                          >
                            {(["Admin", "Manager", "Member", "Viewer", "Support"] as Array<Exclude<OrgRole, "Owner">>).map((r) => (
                              <MenuItem key={r} value={r}>
                                {r}
                              </MenuItem>
                            ))}
                          </TextField>

                          <Stack spacing={0.6}>
                            <FormControlLabel
                              control={<Switch checked={policy.requireAdminApproval} onChange={(e) => setPolicy((p) => ({ ...p, requireAdminApproval: e.target.checked }))} color="secondary" />}
                              label={<Typography sx={{ fontWeight: 900 }}>Require admin approval</Typography>}
                              disabled={!canEdit}
                            />
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              If enabled, invites are reviewed before activation.
                            </Typography>
                          </Stack>

                          <Stack spacing={0.6}>
                            <FormControlLabel
                              control={<Switch checked={policy.requireMfaForAdmins} onChange={(e) => setPolicy((p) => ({ ...p, requireMfaForAdmins: e.target.checked }))} color="secondary" />}
                              label={<Typography sx={{ fontWeight: 900 }}>Require MFA for admins</Typography>}
                              disabled={!canEdit}
                            />
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              Recommended for wallet and security-sensitive actions.
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Mobile sticky actions */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={resetRole} disabled={!canEdit}>
                        Reset
                      </Button>
                      <Button fullWidth variant="contained" color="secondary" sx={orangeContained} startIcon={<SaveIcon size={18} />} onClick={saveAll} disabled={!canEdit || saving}>
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
