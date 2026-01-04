import React, { useEffect, useMemo, useState } from "react";
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
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';
import { useThemeStore } from "../../../stores/themeStore";
import { EVZONE } from "../../../theme/evzone";
import { api } from "../../../utils/api";

type Severity = "info" | "warning" | "error" | "success";
type OrgRole = "Owner" | "Admin" | "Manager" | "Member" | "Viewer";
type DomainStatus = "Not started" | "Pending" | "Verified" | "Failed";

type DomainItem = {
  id: string;
  domain: string;
  token: string;
  recordName: string;
  recordValue: string;
  status: DomainStatus;
  lastCheckedAt?: number;
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
function CopyIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" /></IconBase>);
}
function RefreshIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M20 6v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 18v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 12a8 8 0 0 0-14.7-4.7L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M4 12a8 8 0 0 0 14.7 4.7L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>);
}
function AlertTriangleIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M12 3l10 18H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></IconBase>);
}
function PlusIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function TrashIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}

// -----------------------------
// Utils
// -----------------------------
function isAdminRole(role: OrgRole) {
  return role === "Owner" || role === "Admin";
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

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

function statusChip(status: DomainStatus) {
  if (status === "Verified") return <Chip size="small" color="success" label="Verified" />;
  if (status === "Failed") return <Chip size="small" color="error" label="Failed" />;
  if (status === "Pending") return <Chip size="small" color="warning" label="Pending" />;
  return <Chip size="small" variant="outlined" label="Not started" />;
}

export default function DomainVerificationPage() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeStore();
  const isDark = mode === "dark";
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orgName, setOrgName] = useState("");
  const [myRole, setMyRole] = useState<OrgRole>("Viewer");

  const canEdit = isAdminRole(myRole);

  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const active = useMemo(() => domains.find((d) => d.id === activeId) || domains[0], [domains, activeId]);

  const [addOpen, setAddOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [step, setStep] = useState(0);
  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    loadData();
  }, [orgId]);

  useEffect(() => {
    // Update step based on active status
    if (!active) return;
    if (active.status === "Not started") setStep(0);
    else if (active.status === "Pending") setStep(2);
    else if (active.status === "Verified") setStep(3);
    else setStep(2);
  }, [active]);

  const loadData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError("");
      const [orgData, domainsData] = await Promise.all([
        api(`/orgs/${orgId}`),
        api(`/orgs/${orgId}/domains`)
      ]);
      setOrgName(orgData.name);
      setMyRole(orgData.role);
      setDomains(domainsData);
      if (domainsData.length > 0) {
        setActiveId(domainsData[0].id);
      }
    } catch (err: any) {
      setError(err.message);
      setSnack({ open: true, severity: "error", msg: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const pageBg =
    mode === "dark"
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

  const openAdd = () => {
    if (!canEdit) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can add domains." });
      return;
    }
    setNewDomain("");
    setAddOpen(true);
  };

  const addDomain = async () => {
    const d = newDomain.trim().toLowerCase();
    if (!d || !d.includes(".")) {
      setSnack({ open: true, severity: "warning", msg: "Enter a valid domain." });
      return;
    }
    if (!orgId) return;

    try {
      const added = await api.post(`/orgs/${orgId}/domains`, { domain: d });
      setDomains((prev) => [added, ...prev]);
      setActiveId(added.id);
      setAddOpen(false);
      setSnack({ open: true, severity: "success", msg: "Domain added. Create the DNS record next." });
      loadData(); // Reload safely
    } catch (err: any) {
      setSnack({ open: true, severity: "error", msg: "Failed to add domain" });
    }
  };

  const startVerification = () => {
    if (!canEdit) return;
    setDomains((prev) => prev.map((d) => (d.id === active.id ? { ...d, status: "Pending" } : d)));
    setSnack({ open: true, severity: "info", msg: "Set TXT record, then click Verify." });
  };

  const verifyNow = async () => {
    if (!canEdit) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can verify domains." });
      return;
    }
    if (!orgId || !active) return;

    setSnack({ open: true, severity: "info", msg: "Checking DNS..." });

    try {
      const res = await api.post(`/orgs/${orgId}/domains/${active.id}/verify`);
      // res should be the updated domain object or { status: FAILED }
      if (res.status === 'FAILED') {
        setDomains(prev => prev.map(d => d.id === active.id ? { ...d, status: 'Failed', lastCheckedAt: Date.now() } : d));
        setSnack({ open: true, severity: "error", msg: "DNS record not found yet. Try again." });
      } else {
        setDomains(prev => prev.map(d => d.id === active.id ? { ...res, lastCheckedAt: Date.now() } : d));
        setSnack({ open: true, severity: "success", msg: "Domain verified." });
      }
    } catch (err: any) {
      setSnack({ open: true, severity: "error", msg: "Verification failed." });
    }
  };

  const removeDomain = async (id: string) => {
    if (!canEdit) {
      setSnack({ open: true, severity: "warning", msg: "Only admins can remove domains." });
      return;
    }
    if (!orgId) return;

    try {
      await api.delete(`/orgs/${orgId}/domains/${id}`);
      setDomains((prev) => prev.filter((d) => d.id !== id));
      if (activeId === id) {
        const next = domains.find((d) => d.id !== id)?.id;
        if (next) setActiveId(next);
        else setActiveId("");
      }
      setSnack({ open: true, severity: "success", msg: "Domain removed." });
    } catch (err: any) {
      setSnack({ open: true, severity: "error", msg: "Failed to remove domain" });
    }
  };

  const copy = async (text: string) => {
    const ok = await copyToClipboard(text);
    setSnack({ open: true, severity: ok ? "success" : "warning", msg: ok ? "Copied." : "Copy failed." });
  };

  const goSso = () => navigate(`/app/orgs/${orgId}/sso`);

  const steps = ["Add domain", "Create DNS TXT", "Verify", "Done"];

  if (loading && !domains.length) {
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
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: "4px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.75) 100%)", boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.20)}` }}>
                  <Typography sx={{ color: "white", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>My Accounts</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{orgName} • Domain verification</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField select size="small" label="My role" value={canEdit ? "Admin" : "Member"} disabled onChange={() => { }} sx={{ minWidth: 140, display: { xs: "none", md: "block" } }}>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Member">Member</MenuItem>
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.4}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h5">Domain verification</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Verify email domains to safely enforce enterprise SSO.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          <Chip size="small" label={`Domains: ${domains.length}`} variant="outlined" />
                          <Chip size="small" label={canEdit ? "Editable" : "Read-only"} color={canEdit ? "success" : "warning"} />
                          {active && statusChip(active.status)}
                        </Stack>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                        <Button variant="outlined" sx={orangeOutlined} startIcon={<PlusIcon size={18} />} onClick={openAdd}>
                          Add domain
                        </Button>
                        <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<ShieldCheckIcon size={18} />} onClick={goSso}>
                          Go to SSO
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stepper activeStep={step} alternativeLabel>
                      {steps.map((s) => (
                        <Step key={s}>
                          <StepLabel>{s}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>

                    <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
                      Only verify domains you control. Verified domains can be used to enforce SSO.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {active ? (
                <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                  {/* Left: domains list */}
                  <Box className="md:col-span-5">
                    <Card>
                      <CardContent className="p-5">
                        <Stack spacing={1.2}>
                          <Typography variant="h6">Domains</Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Select a domain to view DNS instructions.
                          </Typography>
                          <Divider />

                          <Stack spacing={1.1}>
                            {domains.map((d) => (
                              <Box
                                key={d.id}
                                sx={{
                                  borderRadius: "4px",
                                  border: `1px solid ${alpha(theme.palette.text.primary, d.id === activeId ? 0.22 : 0.10)}`,
                                  backgroundColor: d.id === activeId ? alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.10) : alpha(theme.palette.background.paper, 0.45),
                                  p: 1.2,
                                  cursor: "pointer",
                                  transition: "all 160ms ease",
                                  "&:hover": { borderColor: alpha(EVZONE.orange, 0.75), transform: "translateY(-1px)" },
                                }}
                                onClick={() => setActiveId(d.id)}
                              >
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
                                  <Box>
                                    <Typography sx={{ fontWeight: 950 }}>{d.domain}</Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                      Last checked: {timeAgo(d.lastCheckedAt)}
                                    </Typography>
                                  </Box>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {statusChip(d.status)}
                                    <Button variant="text" sx={{ color: EVZONE.orange, fontWeight: 900 }} onClick={(e) => { e.stopPropagation(); verifyNow(); }}>
                                      Check
                                    </Button>
                                  </Stack>
                                </Stack>

                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                  <Button variant="outlined" sx={orangeOutlined} size="small" startIcon={<RefreshIcon size={16} />} onClick={(e) => { e.stopPropagation(); verifyNow(); }}>
                                    Verify
                                  </Button>
                                  <Button variant="outlined" sx={orangeOutlined} size="small" startIcon={<TrashIcon size={16} />} onClick={(e) => { e.stopPropagation(); removeDomain(d.id); }} disabled={!canEdit}>
                                    Remove
                                  </Button>
                                </Stack>
                              </Box>
                            ))}
                          </Stack>

                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Tip: DNS changes can take time to propagate.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Right: DNS record instructions */}
                  <Box className="md:col-span-7">
                    <Card>
                      <CardContent className="p-5 md:p-7">
                        <Stack spacing={1.2}>
                          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                            <Box>
                              <Typography variant="h6">DNS TXT record</Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Add this record to verify ownership of <b>{active.domain}</b>.
                              </Typography>
                            </Box>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="outlined" sx={orangeOutlined} startIcon={<CopyIcon size={18} />} onClick={() => copy(active.recordName)}>
                                Copy name
                              </Button>
                              <Button variant="outlined" sx={orangeOutlined} startIcon={<CopyIcon size={18} />} onClick={() => copy(active.recordValue)}>
                                Copy value
                              </Button>
                            </Stack>
                          </Stack>

                          <Divider />

                          <Box sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                            <Stack spacing={1.0}>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Record type</Typography>
                              <Typography sx={{ fontWeight: 950 }}>TXT</Typography>

                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Name</Typography>
                              <Typography sx={{ fontWeight: 900, wordBreak: "break-word" }}>{active.recordName}</Typography>

                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Value</Typography>
                              <Typography sx={{ fontWeight: 900, wordBreak: "break-word" }}>{active.recordValue}</Typography>

                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                TTL: recommended 300 seconds (or default).
                              </Typography>
                            </Stack>
                          </Box>

                          <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                            Once verified, this domain can be used for SSO enforcement and auto-role rules.
                          </Alert>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                            <Button variant="outlined" sx={orangeOutlined} startIcon={<RefreshIcon size={18} />} onClick={verifyNow}>
                              Verify status check
                            </Button>
                            <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<ShieldCheckIcon size={18} />} onClick={startVerification}>
                              Mark as pending
                            </Button>
                          </Stack>

                          {active.status === "Verified" ? (
                            <Alert severity="success">Domain verified. You can enforce SSO for this domain.</Alert>
                          ) : active.status === "Failed" ? (
                            <Alert severity="error">DNS record not found. Confirm the record and try again.</Alert>
                          ) : (
                            <Alert severity="warning">DNS propagation may take minutes or hours depending on your provider.</Alert>
                          )}

                          <Divider />

                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Security warning: attackers may attempt to trick admins into verifying a domain they do not control.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>No domains added. Add a domain to get started.</Alert>
              )}


              {/* Mobile sticky actions */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={verifyNow}>
                        Verify
                      </Button>
                      <Button fullWidth variant="contained" color="secondary" sx={orangeContained} onClick={goSso}>
                        SSO
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

        {/* Add domain dialog */}
        <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Add domain</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Add a domain you control. We will generate a DNS TXT record for verification.
              </Typography>
              <TextField value={newDomain} onChange={(e) => setNewDomain(e.target.value)} label="Domain" placeholder="example.com" fullWidth />
              <Alert severity="warning" icon={<AlertTriangleIcon size={18} />}>
                Do not add domains you do not control.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" sx={orangeContained} onClick={addDomain}>Add</Button>
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
