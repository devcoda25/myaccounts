import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Snackbar,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';
import { useThemeStore } from "../../../stores/themeStore";
import { EVZONE } from "../../../theme/evzone";
import { OrganizationService, OrgRole } from "../../../services/OrganizationService";
import {
  Building,
  Users,
  ShieldCheck,
  Key,
  Wallet,
  Activity,
  Plus,
  ArrowRight,
  RefreshCw,
  Globe,
  Sun,
  Moon,
  LayoutGrid
} from 'lucide-react';
import { formatOrgId } from "../../../utils/format";

// Types matching Backend Response
type AuditSeverity = "info" | "warning" | "critical";

type Org = {
  id: string;
  name: string;
  role: string;
  country: string;
  createdAt: number;
  membersCount: number;
  membersByRole: Record<string, number>;
  pendingInvites: number;
  ssoEnabled: boolean;
  ssoDomains: string[];
  walletEnabled: boolean;
  currency: string;
  walletBalance: number;
  walletMonthlyLimit: number;
  auditHighlights: { id: string; when: number; actor: string; action: string; severity: AuditSeverity }[];
};

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

function auditColor(s: AuditSeverity) {
  if (s === "critical") return "error" as const;
  if (s === "warning") return "warning" as const;
  return "info" as const;
}

export default function OrganizationDashboardPage() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeStore();
  const isDark = mode === "dark";
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myOrgs, setMyOrgs] = useState<any[]>([]); // For switcher

  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "error" | "info"; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch Org Details
      if (orgId) {
        const data = await OrganizationService.getOrg(orgId);
        setOrg(data as unknown as Org);
      }

      // Fetch My Orgs for Switcher
      const list = await OrganizationService.listMyOrgs();
      setMyOrgs(list);

    } catch (err: any) {
      setError(err.message || "Failed to load organization");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (newId: string) => {
    navigate(`/app/orgs/${newId}`);
  };

  const enableOrgWallet = async () => {
    if (!org) return;
    try {
      await OrganizationService.createWallet(org.id, org.currency || 'USD');
      setSnack({ open: true, severity: "success", msg: "Organization wallet created successfully." });
      loadData(); // Refresh to update UI
    } catch (err: any) {
      setSnack({ open: true, severity: "error", msg: err.message || "Failed to create wallet." });
    }
  };

  const pageBg = isDark
    ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
    : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  const evOrangeContainedSx = {
    backgroundColor: EVZONE.orange,
    color: "#FFFFFF",
    boxShadow: `0 4px 14px ${alpha(EVZONE.orange, 0.4)}`,
    borderRadius: "4px",
    "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
    "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
  } as const;

  const evOrangeOutlinedSx = {
    borderColor: alpha(EVZONE.orange, 0.65),
    color: EVZONE.orange,
    backgroundColor: alpha(theme.palette.background.paper, 0.20),
    borderRadius: "4px",
    "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
  } as const;

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: EVZONE.green }} />
      </Box>
    );
  }

  if (error || !org) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
        <Alert severity="error">{error || "Organization not found"}</Alert>
        <Button onClick={() => navigate('/app/orgs')} sx={{ mt: 2 }}>Back to Organizations</Button>
      </Container>
    );
  }

  const admin = (org.role === "Owner" || org.role === "Admin");

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
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{org.name}</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Organization dashboard</Typography>
                </Box>
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
                          <Chip size="small" variant="outlined" icon={<Building size={16} />} label={org.country} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip size="small" color={admin ? "success" : "info"} label={org.role} />
                          <Chip size="small" variant="outlined" icon={<Users size={16} />} label={`${org.membersCount} members`} sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <TextField
                        select
                        label="Switch Organization"
                        value={org.id}
                        onChange={(e) => handleSwitch(e.target.value)}
                        sx={{ minWidth: { xs: "100%", sm: 280 } }}
                        size="small"
                      >
                        {myOrgs.map((o) => (
                          <MenuItem key={o.id} value={o.id}>
                            {o.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Alert severity="info" icon={<ShieldCheck size={18} />}>
                    Data is now loaded directly from the backend API.
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
                          <Building size={18} />
                        </Box>
                        <Box flex={1}>
                          <Typography sx={{ fontWeight: 950 }}>Organization profile</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Summary and admin controls.</Typography>
                        </Box>
                      </Stack>
                      <Divider />
                      <Stack spacing={0.8}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Organization ID</Typography>
                        <Typography sx={{ fontWeight: 900, fontFamily: 'monospace' }}>{formatOrgId(org.id)}</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Created</Typography>
                        <Typography sx={{ fontWeight: 900 }}>{new Date(org.createdAt).toLocaleDateString()}</Typography>
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate(`/app/orgs/${org.id}/settings`)}>
                          Edit profile
                        </Button>
                        <Button variant="contained" sx={evOrangeContainedSx} onClick={() => navigate(`/app/orgs/${org.id}/settings`)}>
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
                          <Users size={18} />
                        </Box>
                        <Box flex={1}>
                          <Typography sx={{ fontWeight: 950 }}>Members</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Roles overview and invitations.</Typography>
                        </Box>
                        <Chip size="small" color={org.pendingInvites ? "warning" : "success"} label={`${org.pendingInvites} invite(s)`} />
                      </Stack>
                      <Divider />
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {Object.entries(org.membersByRole || {}).map(([role, count]) => (
                          <Chip key={role} size="small" variant="outlined" label={`${role}: ${count}`} />
                        ))}
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" sx={evOrangeContainedSx} startIcon={<Plus size={18} />} onClick={() => navigate(`/app/orgs/${org.id}/invite`)}>
                          Invite member
                        </Button>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate(`/app/orgs/${org.id}/members`)}>
                          Manage members
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {/* SSO status */}
                <Card>
                  <CardContent className="p-5">
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: 16, display: "grid", placeItems: "center", backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}` }}>
                          <Key size={18} />
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
                        <Alert severity="info" sx={{ py: 0 }}>SSO is optional. Enable for enterprise.</Alert>
                      )}
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="contained" sx={evOrangeContainedSx} startIcon={<Plus size={18} />} onClick={() => navigate(`/app/orgs/${org.id}/domain-verification`)}>
                          Add domain
                        </Button>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate(`/app/orgs/${org.id}/sso`)}>
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
                          <Wallet size={18} />
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
                          <Typography sx={{ fontWeight: 900 }}>{money(org.walletMonthlyLimit || 25000000, org.currency)}</Typography>
                        </Stack>
                      ) : (
                        <Alert severity="info" sx={{ py: 0 }}>Enable org wallet to manage shared spend limits.</Alert>
                      )}

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        {org.walletEnabled ? (
                          <Button variant="contained" sx={evOrangeContainedSx} onClick={() => navigate(`/app/wallet`)}>Open wallet</Button>
                        ) : (
                          <Button variant="contained" sx={evOrangeContainedSx} onClick={enableOrgWallet}>Enable org wallet</Button>
                        )}
                        <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => navigate(`/app/orgs/${org.id}/settings`)}>Policies</Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              {/* Audit highlights details */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">Audit highlights</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Recent admin actions and security events.</Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<Activity size={18} />} onClick={() => navigate(`/app/orgs/${org.id}/audit`)}>
                          View full audit
                        </Button>
                        <Button variant="contained" sx={evOrangeContainedSx} startIcon={<ShieldCheck size={18} />} onClick={() => { }}>
                          Export
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Box className="grid gap-3 md:grid-cols-2">
                      {org.auditHighlights && org.auditHighlights.length > 0 ? (
                        org.auditHighlights.map((log) => (
                          <Box key={log.id} sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                            <Stack spacing={0.8}>
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                {/* Mapping backend severity to reference UI colors if needed, but using chip directly */}
                                <Chip size="small" color={log.severity === 'critical' ? 'critical' as any : log.severity === 'warning' ? 'warning' : 'info'} label={log.severity.toUpperCase()} />
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{timeAgo(log.when)}</Typography>
                              </Stack>
                              <Typography sx={{ fontWeight: 950 }}>{log.action}</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Actor: {log.actor}</Typography>
                            </Stack>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="center">No recent audit events.</Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
            <Snackbar
              open={snack.open}
              autoHideDuration={4000}
              onClose={() => setSnack({ ...snack, open: false })}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity as any} sx={{ width: '100%' }}>
                {snack.msg}
              </Alert>
            </Snackbar>
          </motion.div>
        </Box>
      </Box >
    </>
  );
}
