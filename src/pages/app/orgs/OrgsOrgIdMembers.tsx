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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeContext } from "../../../theme/ThemeContext";
import { EVZONE } from "../../../theme/evzone";

/**
 * EVzone My Accounts - Org Members
 * Route: /app/orgs/:orgId/members
 *
 * Features:
 * - Members table (name, email, role, status)
 * - Search + filter
 * - Change role (admin only)
 * - Remove member (admin only)
 */

type ThemeMode = "light" | "dark";

type Severity = "info" | "warning" | "error" | "success";

type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer";

type MemberStatus = "Active" | "Pending" | "Suspended";

type Member = {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  status: MemberStatus;
  joinedAt: number;
};

// Local EVZONE and THEME_KEY removed

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

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 22a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function PencilIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

// -----------------------------
// Theme helpers
// -----------------------------
// Local theme logic removed

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || "U";
  const b = parts[1]?.[0] || parts[0]?.[1] || "X";
  return (a + b).toUpperCase();
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

function statusChip(status: MemberStatus) {
  if (status === "Active") return { label: "Active", color: "success" as const };
  if (status === "Suspended") return { label: "Suspended", color: "error" as const };
  return { label: "Pending", color: "warning" as const };
}

function roleChipColor(role: OrgRole) {
  if (role === "Owner") return "success" as const;
  if (role === "Admin") return "info" as const;
  if (role === "Manager") return "secondary" as const;
  return "default" as const;
}

function isAdminRole(role: OrgRole) {
  return role === "Owner" || role === "Admin";
}

// Self-tests removed

export default function OrgMembersPage() {
  // const [mode, setMode] = useState<ThemeMode>(() => getStoredMode());
  // const theme = useMemo(() => buildTheme(mode), [mode]);
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isDark = mode === "dark";

  // Demo role
  const [myRole, setMyRole] = useState<OrgRole>("Admin");
  const canAdmin = isAdminRole(myRole);

  const [orgName] = useState("EV World");

  const [members, setMembers] = useState<Member[]>(() => {
    const now = Date.now();
    return [
      { id: "m1", name: "Ronald Isabirye", email: "ronald@evworld.africa", role: "Owner", status: "Active", joinedAt: now - 1000 * 60 * 60 * 24 * 200 },
      { id: "m2", name: "Dacy Dong", email: "dacy@evworld.africa", role: "Admin", status: "Active", joinedAt: now - 1000 * 60 * 60 * 24 * 120 },
      { id: "m3", name: "Support Agent", email: "support@evworld.africa", role: "Manager", status: "Active", joinedAt: now - 1000 * 60 * 60 * 24 * 40 },
      { id: "m4", name: "Finance Team", email: "finance@evworld.africa", role: "Member", status: "Pending", joinedAt: now - 1000 * 60 * 60 * 22 },
      { id: "m5", name: "Temporary Contractor", email: "temp.contractor@example.com", role: "Viewer", status: "Suspended", joinedAt: now - 1000 * 60 * 60 * 24 * 18 },
    ];
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | OrgRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus>("all");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<OrgRole>("Member");

  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members
      .filter((m) => (!q ? true : [m.name, m.email, m.role, m.status].some((x) => x.toLowerCase().includes(q))))
      .filter((m) => (roleFilter === "all" ? true : m.role === roleFilter))
      .filter((m) => (statusFilter === "all" ? true : m.status === statusFilter))
      .sort((a, b) => a.role.localeCompare(b.role));
  }, [members, search, roleFilter, statusFilter]);

  const openEdit = (id: string) => {
    if (!canAdmin) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can change roles." });
      return;
    }
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setEditId(id);
    setEditRole(m.role);
    setEditOpen(true);
  };

  const saveRole = () => {
    if (!editId) return;
    const target = members.find((x) => x.id === editId);
    if (!target) return;
    if (target.role === "Owner") {
      setSnack({ open: true, severity: "warning", msg: "Owner role cannot be changed here." });
      setEditOpen(false);
      return;
    }

    setMembers((prev) => prev.map((m) => (m.id === editId ? { ...m, role: editRole } : m)));
    setEditOpen(false);
    setSnack({ open: true, severity: "success", msg: "Role updated (demo)." });
  };

  const openRemove = (id: string) => {
    if (!canAdmin) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can remove members." });
      return;
    }
    setRemoveId(id);
    setRemoveOpen(true);
  };

  const confirmRemove = () => {
    if (!removeId) return;
    const target = members.find((x) => x.id === removeId);
    if (!target) return;
    if (target.role === "Owner") {
      setSnack({ open: true, severity: "warning", msg: "Owners cannot be removed. Transfer ownership first." });
      setRemoveOpen(false);
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== removeId));
    setRemoveOpen(false);
    setSnack({ open: true, severity: "success", msg: "Member removed (demo)." });
  };

  const goInvite = () => setSnack({ open: true, severity: "info", msg: "Navigate to /app/orgs/:orgId/invite (demo)." });
  const goRoles = () => setSnack({ open: true, severity: "info", msg: "Navigate to /app/orgs/:orgId/roles-permissions (demo)." });

  const membersCount = members.length;
  const pendingCount = members.filter((m) => m.status === "Pending").length;

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
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>My Accounts</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {orgName} members
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {/* Demo role selector */}
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
                      <Typography variant="h5">Org members</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Manage member access, roles, and invitations.
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip size="small" icon={<UsersIcon size={16} />} label={`${membersCount} member(s)`} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        <Chip size="small" color={pendingCount ? "warning" : "success"} label={`${pendingCount} pending`} />
                        <Chip size="small" label={`My role: ${myRole}`} color={canAdmin ? "success" : "info"} />
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="outlined" sx={orangeOutlined} startIcon={<ShieldCheckIcon size={18} />} onClick={goRoles}>
                        Roles and permissions
                      </Button>
                      <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<PlusIcon size={18} />} onClick={goInvite}>
                        Invite members
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box className="grid gap-3 md:grid-cols-3">
                    <TextField
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      label="Search"
                      placeholder="Search by name or email"
                      fullWidth
                      InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={18} /></InputAdornment>) }}
                    />
                    <TextField select label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} fullWidth>
                      <MenuItem value="all">All roles</MenuItem>
                      {(["Owner", "Admin", "Manager", "Member", "Viewer"] as OrgRole[]).map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} fullWidth>
                      <MenuItem value="all">All statuses</MenuItem>
                      {(["Active", "Pending", "Suspended"] as MemberStatus[]).map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {!canAdmin ? (
                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />} sx={{ mt: 2 }}>
                      You can view members. Only "Owner" and "Admin" can change roles or remove members.
                    </Alert>
                  ) : (
                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />} sx={{ mt: 2 }}>
                      Role changes and removals are audited and may require re-authentication in production.
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Desktop table */}
              <Card sx={{ display: { xs: "none", md: "block" } }}>
                <CardContent className="p-5 md:p-7">
                  <Typography variant="h6">Members</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {filtered.length} result(s)
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <TableContainer sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, overflow: "hidden" }}>
                    <Table size="small" sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                          <TableCell sx={{ fontWeight: 950 }}>Member</TableCell>
                          <TableCell sx={{ fontWeight: 950 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 950 }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 950 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 950 }}>Joined</TableCell>
                          <TableCell sx={{ fontWeight: 950, textAlign: "right" }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filtered.map((m) => {
                          const sc = statusChip(m.status);
                          return (
                            <TableRow key={m.id} hover>
                              <TableCell>
                                <Stack direction="row" spacing={1.1} alignItems="center">
                                  <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, fontWeight: 950 }}>
                                    {initials(m.name)}
                                  </Avatar>
                                  <Box>
                                    <Typography sx={{ fontWeight: 950 }}>{m.name}</Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{m.id}</Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontWeight: 700 }}>{m.email}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={m.role} color={roleChipColor(m.role)} variant={m.role === "Owner" ? "filled" : "outlined"} />
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={sc.label} color={sc.color} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{timeAgo(m.joinedAt)}</Typography>
                              </TableCell>
                              <TableCell sx={{ textAlign: "right" }}>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Button size="small" variant="outlined" sx={orangeOutlined} startIcon={<PencilIcon size={16} />} disabled={!canAdmin || m.role === "Owner"} onClick={() => openEdit(m.id)}>
                                    Change role
                                  </Button>
                                  <Button size="small" variant="outlined" sx={orangeOutlined} startIcon={<TrashIcon size={16} />} disabled={!canAdmin || m.role === "Owner"} onClick={() => openRemove(m.id)}>
                                    Remove
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Mobile cards */}
              <Box sx={{ display: { xs: "grid", md: "none" }, gap: 2 }}>
                {filtered.map((m) => {
                  const sc = statusChip(m.status);
                  return (
                    <Card key={m.id}>
                      <CardContent className="p-5">
                        <Stack spacing={1.1}>
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, fontWeight: 950, width: 44, height: 44, borderRadius: "4px" }}>
                              {initials(m.name)}
                            </Avatar>
                            <Box flex={1}>
                              <Typography sx={{ fontWeight: 950 }}>{m.name}</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{m.email}</Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={m.role} color={roleChipColor(m.role)} variant={m.role === "Owner" ? "filled" : "outlined"} />
                            <Chip size="small" label={sc.label} color={sc.color} />
                            <Chip size="small" variant="outlined" icon={<UserIcon size={16} />} label={timeAgo(m.joinedAt)} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          </Stack>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="outlined" sx={orangeOutlined} startIcon={<PencilIcon size={18} />} disabled={!canAdmin || m.role === "Owner"} onClick={() => openEdit(m.id)}>
                              Change role
                            </Button>
                            <Button variant="outlined" sx={orangeOutlined} startIcon={<TrashIcon size={18} />} disabled={!canAdmin || m.role === "Owner"} onClick={() => openRemove(m.id)}>
                              Remove
                            </Button>
                          </Stack>

                          {m.role === "Owner" ? (
                            <Alert severity="info">Owners cannot be removed or downgraded here.</Alert>
                          ) : null}
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>

              {/* Mobile footer actions */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={goRoles}>
                        Roles
                      </Button>
                      <Button fullWidth variant="contained" color="secondary" sx={orangeContained} endIcon={<ArrowRightIcon size={18} />} onClick={goInvite}>
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

        {/* Change role dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Change role</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Role changes affect access across the organization.
              </Typography>
              <TextField select label="Role" value={editRole} onChange={(e) => setEditRole(e.target.value as OrgRole)} fullWidth>
                {(["Admin", "Manager", "Member", "Viewer"] as OrgRole[]).map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
              <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                This action is audited.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" sx={orangeContained} onClick={saveRole}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Remove member dialog */}
        <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)} PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Remove member</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                This will remove access immediately.
              </Typography>
              <Alert severity="warning">Removed members can be re-invited later.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setRemoveOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" sx={orangeContained} onClick={confirmRemove}>Remove</Button>
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
