import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";
import { EVZONE } from "../../../theme/evzone";

/**
 * EVzone My Accounts - Organization Dashboard
 * Route: /app/orgs/:orgId
 *
 * Features:
 * - Org profile summary
 * - Members snapshot
 * - SSO status
 * - Wallet scope (org wallet if enabled)
 * - Audit highlights (admin actions)
 */

type ThemeMode = "light" | "dark";

type Severity = "info" | "warning" | "error" | "success";

type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer";

type AuditSeverity = "info" | "warning" | "critical";

type Org = {
  id: string;
  name: string;
  role: OrgRole;
  country: string;
  createdAt: number;
  membersCount: number;
  membersByRole: Record<OrgRole, number>;
  pendingInvites: number;
  ssoEnabled: boolean;
  ssoDomains: string[];
  walletEnabled: boolean;
  currency: string;
  walletBalance: number;
  walletMonthlyLimit: number;
  auditHighlights: { id: string; when: number; actor: string; action: string; severity: AuditSeverity }[];
};

// Local EVZONE removed

const STORAGE_LAST_ORG = "evzone_myaccounts_last_org";

// -----------------------------
// Inline icons
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

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function ActivityIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function SwitchIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M16 3h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 3l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 21H3v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

// -----------------------------
// Theme
// -----------------------------
// Local theme storage removed

function getStoredLastOrg(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_LAST_ORG);
  } catch {
    return null;
  }
}

function setStoredLastOrg(id: string | null) {
  try {
    if (!id) window.localStorage.removeItem(STORAGE_LAST_ORG);
    else window.localStorage.setItem(STORAGE_LAST_ORG, id);
  } catch {
    // ignore
  }
}

// Local buildTheme removed

// -----------------------------
// Helpers
// -----------------------------
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || "O";
  const b = parts[1]?.[0] || parts[0]?.[1] || "R";
  return (a + b).toUpperCase();
}

function money(n: number, currency: string) {
  const v = Math.round(n);
  return `${currency} ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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

function isAdminRole(r: OrgRole) {
  return r === "Owner" || r === "Admin";
}

function auditColor(s: AuditSeverity) {
  if (s === "critical") return "error" as const;
  if (s === "warning") return "warning" as const;
  return "info" as const;
}

// Self-tests removed

function seedOrgs(): Org[] {
  const now = Date.now();
  return [
    {
      id: "org_evworld",
      name: "EV World",
      role: "Owner",
      country: "Uganda",
      createdAt: now - 1000 * 60 * 60 * 24 * 420,
      membersCount: 12,
      membersByRole: { Owner: 1, Admin: 2, Manager: 3, Member: 6, Viewer: 0 },
      pendingInvites: 2,
      ssoEnabled: true,
      ssoDomains: ["evworld.co", "evworld.africa"],
      walletEnabled: true,
      currency: "UGX",
      walletBalance: 3498000,
      walletMonthlyLimit: 25000000,
      auditHighlights: [
        { id: "a1", when: now - 1000 * 60 * 20, actor: "Ronald", action: "Invited 2 members", severity: "info" },
        { id: "a2", when: now - 1000 * 60 * 60 * 4, actor: "Admin", action: "Enabled SSO", severity: "warning" },
        { id: "a3", when: now - 1000 * 60 * 60 * 26, actor: "System", action: "Blocked suspicious login", severity: "critical" },
      ],
    },
    {
      id: "org_evzone_group",
      name: "EVzone Group",
      role: "Admin",
      country: "Uganda",
      createdAt: now - 1000 * 60 * 60 * 24 * 260,
      membersCount: 38,
      membersByRole: { Owner: 1, Admin: 4, Manager: 6, Member: 24, Viewer: 3 },
      pendingInvites: 1,
      ssoEnabled: false,
      ssoDomains: [],
      walletEnabled: false,
      currency: "UGX",
      walletBalance: 0,
      walletMonthlyLimit: 0,
      auditHighlights: [
        { id: "b1", when: now - 1000 * 60 * 18, actor: "Admin", action: "Changed member role", severity: "info" },
        { id: "b2", when: now - 1000 * 60 * 60 * 9, actor: "Admin", action: "Updated org profile", severity: "info" },
      ],
    },
    {
      id: "org_partner",
      name: "Partner Organization",
      role: "Member",
      country: "Kenya",
      createdAt: now - 1000 * 60 * 60 * 24 * 90,
      membersCount: 9,
      membersByRole: { Owner: 1, Admin: 1, Manager: 1, Member: 6, Viewer: 0 },
      pendingInvites: 0,
      ssoEnabled: false,
      ssoDomains: [],
      walletEnabled: false,
      currency: "KES",
      walletBalance: 0,
      walletMonthlyLimit: 0,
      auditHighlights: [{ id: "c1", when: now - 1000 * 60 * 60 * 2, actor: "Admin", action: "Invited a member", severity: "info" }],
    },
  ];
}

export default function OrganizationDashboardPage() {
  // const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  // const theme = useMemo(() => buildTheme(mode), [mode]);
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  const [orgs, setOrgs] = useState<Org[]>(() => seedOrgs());

  const [orgId, setOrgId] = useState<string>(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const q = qs.get("orgId");
      const stored = getStoredLastOrg();
      return q || stored || "org_evworld";
    } catch {
      return getStoredLastOrg() || "org_evworld";
    }
  });

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("Member");

  const [domainOpen, setDomainOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  // Self-tests effect removed

  useEffect(() => {
    setStoredLastOrg(orgId);
  }, [orgId]);

  const org = useMemo(() => orgs.find((o) => o.id === orgId) || orgs[0], [orgs, orgId]);

  const pageBg =
    mode === "dark"
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const evOrangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 4px 14px ${alpha(EVZONE.orange, 0.4)}`, // Standardized
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const evOrangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    borderRadius: "4px", // Standardized to 4px
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  const toggleMode = () => {
    // Mode toggling handled by ContextSwitcher or global settings now
  };

  const admin = isAdminRole(org.role);

  const openInvite = () => {
    if (!admin) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can invite members." });
      return;
    }
    setInviteEmail("");
    setInviteRole("Member");
    setInviteOpen(true);
  };

  const submitInvite = () => {
    if (!inviteEmail.trim().includes("@")) {
      setSnack({ open: true, severity: "warning", msg: "Enter a valid email address." });
      return;
    }
    setInviteOpen(false);
    setSnack({ open: true, severity: "success", msg: "Invite sent (demo)." });
    setOrgs((prev) =>
      prev.map((o) => (o.id === org.id ? { ...o, pendingInvites: o.pendingInvites + 1 } : o))
    );
  };

  const openAddDomain = () => {
    if (!admin) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can manage SSO domains." });
      return;
    }
    setNewDomain("");
    setDomainOpen(true);
  };

  const addDomain = () => {
    const d = newDomain.trim().toLowerCase();
    if (!d || !d.includes(".")) {
      setSnack({ open: true, severity: "warning", msg: "Enter a valid domain." });
      return;
    }
    setOrgs((prev) =>
      prev.map((o) => {
        if (o.id !== org.id) return o;
        if (o.ssoDomains.includes(d)) return o;
        return { ...o, ssoDomains: [...o.ssoDomains, d], ssoEnabled: true };
      })
    );
    setDomainOpen(false);
    setSnack({ open: true, severity: "success", msg: "Domain added. SSO enabled (demo)." });
  };

  const enableOrgWallet = () => {
    if (!admin) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can enable org wallet." });
      return;
    }
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === org.id
          ? { ...o, walletEnabled: true, currency: o.currency || "UGX", walletBalance: 0, walletMonthlyLimit: 25000000 }
          : o
      )
    );
    setSnack({ open: true, severity: "success", msg: "Org wallet enabled (demo)." });
  };

  const openFullAudit = () => {
    setSnack({ open: true, severity: "info", msg: "Navigate to /app/orgs/audit (demo)." });
  };

  const openSsoSettings = () => {
    setSnack({ open: true, severity: "info", msg: "Open SSO settings (demo)." });
  };

  const openMembers = () => {
    setSnack({ open: true, severity: "info", msg: "Open members page (demo)." });
  };

  const openOrgWallet = () => {
    setSnack({ open: true, severity: "info", msg: "Open org wallet (demo)." });
  };

  return (
    <>
      <CssBaseline />
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top bar */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.75) 100%)", boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.20)}` }}>
                  <Typography sx={{ color: "white", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>My Accounts</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Organization dashboard</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Switch org">
                  <IconButton
                    size="small"
                    onClick={() => setSnack({ open: true, severity: "info", msg: "Open org switcher modal or /app/orgs/switch (demo)." })}
                    sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}
                  >
                    <SwitchIcon size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Switch to Light/Dark Mode">
                  <IconButton size="small" onClick={toggleMode} sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: "4px", color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Language">
                  <IconButton size="small" sx={{ border: `1px solid ${alpha(EVZONE.orange, 0.30)}`, borderRadius: 12, color: EVZONE.orange, backgroundColor: alpha(theme.palette.background.paper, 0.60) }}>
                    <GlobeIcon size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              {/* Org header */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, width: 52, height: 52, borderRadius: 18, fontWeight: 950 }}>
                        {initials(org.name)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h5" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{org.name}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Chip size="small" variant="outlined" icon={<BuildingIcon size={16} />} label={org.country} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" color={admin ? "success" : "info"} label={org.role} />
                          <Chip size="small" variant="outlined" icon={<UsersIcon size={16} />} label={`${org.membersCount} members`} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <TextField
                        select
                        label="Organization"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        sx={{ minWidth: { xs: "100%", sm: 280 } }}
                      >
                        {orgs.map((o) => (
                          <MenuItem key={o.id} value={o.id}>
                            {o.name} ({o.role})
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<SwitchIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Open /app/orgs/switch (demo)." })}>
                        Switcher
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                    Admin actions are audited. Sensitive settings may require re-authentication.
                  </Alert>
                </CardContent>
              </Card>

              <Box className="grid gap-4 md:grid-cols-2">
                {/* Org profile summary */}
                <Card>
                  <CardContent className="p-5">
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <BuildingIcon size={18} />
                        </Box>
                        <Box flex={1}>
                          <Typography sx={{ fontWeight: 950 }}>Organization profile</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Summary and admin controls.</Typography>
                        </Box>
                      </Stack>

                      <Divider />

                      <Stack spacing={0.8}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Organization ID</Typography>
                        <Typography sx={{ fontWeight: 900 }}>{org.id}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Created</Typography>
                        <Typography sx={{ fontWeight: 900 }}>{new Date(org.createdAt).toLocaleDateString()}</Typography>
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={{ borderColor: alpha(EVZONE.orange, 0.65), color: EVZONE.orange, "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" } }} onClick={() => setSnack({ open: true, severity: "info", msg: "Edit org profile (demo)." })}>
                          Edit profile
                        </Button>
                        <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open org settings (demo)." })}>
                          Settings
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Members snapshot */}
                <Card>
                  <CardContent className="p-5">
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <UsersIcon size={18} />
                        </Box>
                        <Box flex={1}>
                          <Typography sx={{ fontWeight: 950 }}>Members</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Roles overview and invitations.</Typography>
                        </Box>
                        <Chip size="small" color={org.pendingInvites ? "warning" : "success"} label={`${org.pendingInvites} invite(s)`} />
                      </Stack>

                      <Divider />

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(["Owner", "Admin", "Manager", "Member", "Viewer"] as OrgRole[]).map((r) => (
                          <Chip key={r} size="small" variant="outlined" label={`${r}: ${org.membersByRole[r] || 0}`} />
                        ))}
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={openInvite}>
                          Invite member
                        </Button>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={openMembers}>
                          Manage members
                        </Button>
                      </Stack>

                      {!admin ? (
                        <Alert severity="info">You can view members, but only admins can manage roles and invitations.</Alert>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>

                {/* SSO status */}
                <Card>
                  <CardContent className="p-5">
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <KeyIcon size={18} />
                        </Box>
                        <Box flex={1}>
                          <Typography sx={{ fontWeight: 950 }}>Enterprise SSO</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>SAML or OIDC federation.</Typography>
                        </Box>
                        {org.ssoEnabled ? <Chip size="small" color="success" label="Enabled" /> : <Chip size="small" variant="outlined" label="Disabled" />}
                      </Stack>

                      <Divider />

                      {org.ssoEnabled ? (
                        <Stack spacing={1}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Domains</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {org.ssoDomains.length ? org.ssoDomains.map((d) => <Chip key={d} size="small" variant="outlined" label={d} />) : <Chip size="small" variant="outlined" label="No domains" />}
                          </Stack>
                        </Stack>
                      ) : (
                        <Alert severity="info">SSO is optional. Enable it for enterprise customers and staff accounts.</Alert>
                      )}

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={openAddDomain}>
                          Add domain
                        </Button>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={openSsoSettings}>
                          Configure
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Wallet scope */}
                <Card>
                  <CardContent className="p-5">
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <WalletIcon size={18} />
                        </Box>
                        <Box flex={1}>
                          <Typography sx={{ fontWeight: 950 }}>Org wallet</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Shared billing and payouts.</Typography>
                        </Box>
                        {org.walletEnabled ? <Chip size="small" color="info" label="Enabled" /> : <Chip size="small" variant="outlined" label="Disabled" />}
                      </Stack>

                      <Divider />

                      {org.walletEnabled ? (
                        <Stack spacing={1.0}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Balance</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 950 }}>{money(org.walletBalance, org.currency)}</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Monthly limit</Typography>
                          <Typography sx={{ fontWeight: 900 }}>{money(org.walletMonthlyLimit, org.currency)}</Typography>
                        </Stack>
                      ) : (
                        <Alert severity="info">Enable org wallet to manage shared spend limits and payouts.</Alert>
                      )}

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        {org.walletEnabled ? (
                          <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={openOrgWallet}>
                            Open wallet
                          </Button>
                        ) : (
                          <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={enableOrgWallet}>
                            Enable org wallet
                          </Button>
                        )}
                        <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setSnack({ open: true, severity: "info", msg: "Open wallet policies (demo)." })}>
                          Policies
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              {/* Audit highlights */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">Audit highlights</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Recent admin actions and security events.</Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<ActivityIcon size={18} />} onClick={openFullAudit}>
                          View full audit
                        </Button>
                        <Button variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<ShieldCheckIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Export audit report (demo)." })}>
                          Export
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Box className="grid gap-3 md:grid-cols-2">
                      {org.auditHighlights.map((a) => (
                        <Box key={a.id} sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                          <Stack spacing={0.8}>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                              <Chip size="small" color={auditColor(a.severity)} label={a.severity.toUpperCase()} />
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{timeAgo(a.when)}</Typography>
                            </Stack>
                            <Typography sx={{ fontWeight: 950 }}>{a.action}</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Actor: {a.actor}</Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Box>

                    {admin ? (
                      <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                        Tip: Review audit events weekly for compliance and fraud prevention.
                      </Alert>
                    ) : (
                      <Alert severity="info">Only admins can view full audit logs.</Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Mobile footer actions */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={evOrangeOutlinedSx} onClick={openMembers} startIcon={<UsersIcon size={18} />}>
                        Members
                      </Button>
                      <Button fullWidth variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={openInvite} startIcon={<PlusIcon size={18} />}>
                        Invite
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

        {/* Invite dialog */}
        <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 20, border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Invite member</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Invite a new member to this organization.</Typography>
              <TextField value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} label="Email" placeholder="name@company.com" fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><UsersIcon size={18} /></InputAdornment>) }} />
              <TextField select label="Role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as OrgRole)} fullWidth>
                {(["Admin", "Manager", "Member", "Viewer"] as OrgRole[]).map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
              <Alert severity="info">Invites and role changes are recorded in audit logs.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={submitInvite}>Send invite</Button>
          </DialogActions>
        </Dialog>

        {/* Add domain dialog */}
        <Dialog open={domainOpen} onClose={() => setDomainOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Add SSO domain</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Add a domain for enterprise sign-in.</Typography>
              <TextField value={newDomain} onChange={(e) => setNewDomain(e.target.value)} label="Domain" placeholder="example.com" fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><KeyIcon size={18} /></InputAdornment>) }} />
              <Alert severity="info">After adding a domain, you can configure SAML or OIDC settings.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setDomainOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={addDomain}>Add</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={mode === "dark" ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ >
  );
}
