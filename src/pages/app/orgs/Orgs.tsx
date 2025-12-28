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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";
import { EVZONE } from "../../../theme/evzone";

import CreateOrgModal from "../../../components/modals/CreateOrgModal";
import JoinOrgModal from "../../../components/modals/JoinOrgModal";
import LeaveOrgModal from "../../../components/modals/LeaveOrgModal";

/**
 * EVzone My Accounts - Organizations List
 * Route: /app/orgs
 */

const STORAGE_LAST_ORG = "evzone_myaccounts_last_org";

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

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function TicketIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M4 9V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 15v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function LogOutIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M10 17l-1 1a4 4 0 0 1-6 0V6a4 4 0 0 1 6 0l1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 9l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || "O";
  const b = parts[1]?.[0] || parts[0]?.[1] || "R";
  return (a + b).toUpperCase();
}

function makeOrgId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return `org_${slug}_${Math.random().toString(16).slice(2, 6)}`;
}

// Self-tests removed

type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer";

type Org = {
  id: string;
  name: string;
  role: OrgRole;
  membersCount: number;
  country: string;
  ssoEnabled: boolean;
  walletEnabled: boolean;
};

type Severity = "info" | "warning" | "error" | "success";

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

export default function OrganizationsListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  const [orgs, setOrgs] = useState<Org[]>(() => [
    { id: "org_evworld", name: "EV World", role: "Owner", membersCount: 12, country: "Uganda", ssoEnabled: true, walletEnabled: true },
    { id: "org_evzone_group", name: "EVzone Group", role: "Admin", membersCount: 38, country: "Uganda", ssoEnabled: false, walletEnabled: false },
    { id: "org_partner", name: "Partner Organization", role: "Member", membersCount: 9, country: "Kenya", ssoEnabled: false, walletEnabled: false },
  ]);

  const [currentOrgId, setCurrentOrgId] = useState<string>(() => getStoredLastOrg() || "org_evworld");

  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  // Self-tests effect removed

  useEffect(() => {
    setStoredLastOrg(currentOrgId);
  }, [currentOrgId]);

  const pageBg =
    isDark
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

  const currentOrg = useMemo(() => orgs.find((o) => o.id === currentOrgId) || orgs[0], [orgs, currentOrgId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orgs
      .filter((o) => (!q ? true : [o.name, o.role, o.country].some((x) => x.toLowerCase().includes(q))))
      .sort((a, b) => (a.id === currentOrgId ? -1 : b.id === currentOrgId ? 1 : a.name.localeCompare(b.name)));
  }, [orgs, search, currentOrgId]);

  const isAdminRole = (r: OrgRole) => r === "Owner" || r === "Admin";

  const openOrg = (id: string) => {
    setCurrentOrgId(id);
    setSnack({ open: true, severity: "success", msg: "Organization selected." });
  };

  const openDashboard = (id: string) => {
    setCurrentOrgId(id);
    navigate(`/app/orgs/${id}`);
  };

  const openManage = (id: string) => {
    setCurrentOrgId(id);
    navigate(`/app/orgs/${id}/settings`);
  };

  const openLeave = (id: string) => {
    setLeaveTarget(id);
    setLeaveOpen(true);
  };

  const doLeave = () => {
    if (!leaveTarget) return;
    const org = orgs.find((o) => o.id === leaveTarget);
    if (!org) return;

    if (org.role === "Owner") {
      setSnack({ open: true, severity: "warning", msg: "Owners cannot leave. Transfer ownership first." });
      setLeaveOpen(false);
      return;
    }

    setOrgs((prev) => prev.filter((o) => o.id !== leaveTarget));
    setLeaveOpen(false);

    if (currentOrgId === leaveTarget) {
      const next = orgs.find((o) => o.id !== leaveTarget)?.id;
      if (next) setCurrentOrgId(next);
    }

    setSnack({ open: true, severity: "success", msg: `Left organization: ${org.name}` });
  };

  const createOrg = (name: string, _type: string, country: string) => {
    const id = makeOrgId(name);
    const newOrg: Org = {
      id,
      name,
      role: "Owner",
      membersCount: 1,
      country: country,
      ssoEnabled: false,
      walletEnabled: false,
    };
    setOrgs((prev) => [newOrg, ...prev]);
    setCurrentOrgId(id);
    setCreateOpen(false);
    setSnack({ open: true, severity: "success", msg: `Organization created: ${name}` });
  };

  const joinOrg = (code: string) => {
    if (code.length < 6) {
      setSnack({ open: true, severity: "warning", msg: "Enter a valid invite code." });
      return;
    }

    const joined: Org = {
      id: `org_join_${code.toLowerCase()}`,
      name: `Joined Org (${code.slice(0, 4)})`,
      role: "Member",
      membersCount: 5,
      country: "Uganda",
      ssoEnabled: false,
      walletEnabled: false,
    };

    setOrgs((prev) => {
      if (prev.some((o) => o.id === joined.id)) return prev;
      return [joined, ...prev];
    });
    setCurrentOrgId(joined.id);
    setJoinOpen(false);
    setSnack({ open: true, severity: "success", msg: "Joined organization successfully." });
  };

  const OrgCard = ({ org }: { org: Org }) => {
    const isCurrent = org.id === currentOrgId;
    const admin = isAdminRole(org.role);
    const canLeave = org.role !== "Owner";

    return (
      <Card
        sx={{
          borderRadius: "4px",
          border: `1px solid ${alpha(theme.palette.text.primary, isCurrent ? 0.22 : 0.10)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.45),
        }}
      >
        <CardContent className="p-5">
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, width: 44, height: 44, borderRadius: "4px", fontWeight: 950 }}>
                {initials(org.name)}
              </Avatar>
              <Box flex={1}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography sx={{ fontWeight: 950 }}>{org.name}</Typography>
                  {isCurrent ? <Chip size="small" color="success" label="Current" /> : null}
                  <Chip size="small" variant="outlined" label={org.role} />
                </Stack>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {org.country}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" icon={<UsersIcon size={16} />} label={`${org.membersCount} members`} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
              {org.ssoEnabled ? <Chip size="small" color="success" label="SSO" /> : <Chip size="small" variant="outlined" label="No SSO" />}
              {org.walletEnabled ? <Chip size="small" icon={<WalletIcon size={16} />} label="Org wallet" color="info" sx={{ "& .MuiChip-icon": { color: "inherit" } }} /> : <Chip size="small" variant="outlined" label="No org wallet" />}
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button variant="contained" color="secondary" sx={evOrangeContainedSx} endIcon={<ArrowRightIcon size={18} />} onClick={() => openDashboard(org.id)}>
                Open
              </Button>
              {admin ? (
                <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<ShieldCheckIcon size={18} />} onClick={() => openManage(org.id)}>
                  Manage
                </Button>
              ) : (
                <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<BuildingIcon size={18} />} onClick={() => openOrg(org.id)}>
                  Switch
                </Button>
              )}
              <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<LogOutIcon size={18} />} disabled={!canLeave} onClick={() => openLeave(org.id)}>
                Leave
              </Button>
            </Stack>

            {!canLeave ? <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Owners must transfer ownership before leaving.</Typography> : null}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box className="min-h-screen" sx={{ background: pageBg }}>
      {/* Body */}
      <Box className="mx-auto max-w-6xl px-4" sx={{ py: { xs: 3, md: 6 }, pb: { xs: 12, md: 6 } }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Stack spacing={2.2}>
            <Card>
              <CardContent className="p-5 md:p-7">
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                  <Box>
                    <Typography variant="h5">Organizations</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      You can be a member of multiple organizations. Switch to access different roles.
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      <Chip icon={<BuildingIcon size={16} />} label={`Current: ${currentOrg?.name || "-"}`} variant="outlined" sx={{ fontWeight: 900, "& .MuiChip-icon": { color: "inherit" } }} />
                      <Chip size="small" label={currentOrg?.role || "-"} color="info" />
                    </Stack>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<TicketIcon size={18} />} onClick={() => setJoinOpen(true)}>
                      Join
                    </Button>
                    <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<PlusIcon size={18} />} onClick={() => setCreateOpen(true)}>
                      Create
                    </Button>
                    <Button variant="contained" color="secondary" sx={evOrangeContainedSx} endIcon={<ArrowRightIcon size={18} />} onClick={() => navigate("/app/orgs/switch")}>
                      Switcher
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <TextField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  label="Search organizations"
                  placeholder="Search by name, role, country"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon size={18} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Alert severity="info" icon={<ShieldCheckIcon size={18} />} sx={{ mt: 2 }}>
                  Admins can manage members, roles, policies, and SSO.
                </Alert>
              </CardContent>
            </Card>

            <Box className="grid gap-4 md:grid-cols-2">
              {filtered.map((o) => (
                <OrgCard key={o.id} org={o} />
              ))}
            </Box>

            {/* Mobile footer actions */}
            <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
              <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                <CardContent sx={{ py: 1.1, px: 1.2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button fullWidth variant="outlined" sx={evOrangeOutlinedSx} startIcon={<TicketIcon size={18} />} onClick={() => setJoinOpen(true)}>
                      Join
                    </Button>
                    <Button fullWidth variant="contained" color="secondary" sx={evOrangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={() => setCreateOpen(true)}>
                      Create
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

      {/* Modals */}
      <CreateOrgModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createOrg} />
      <JoinOrgModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoin={joinOrg} />
      <LeaveOrgModal open={leaveOpen} onClose={() => setLeaveOpen(false)} onLeave={doLeave} />

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3200} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant={isDark ? "filled" : "standard"} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`, backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96), color: theme.palette.text.primary }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
