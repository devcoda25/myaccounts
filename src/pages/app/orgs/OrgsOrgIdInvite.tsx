import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';
import { useThemeStore } from "../../../stores/themeStore";
import { EVZONE } from "../../../theme/evzone";
import { OrganizationService, OrgRole } from "../../../services/OrganizationService";
import { formatOrgId } from "../../../utils/format";
import { api } from "../../../utils/api";

type Severity = "info" | "warning" | "error" | "success";

type Invite = {
  id: string;
  email: string;
  role: Exclude<OrgRole, "Owner">;
  token: string;
  createdAt: string; // ISO string from backend
  expiresAt: string; // ISO string from backend
  status: "Pending" | "Revoked" | "Accepted";
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
function MailIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>);
}
function UsersIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2" /><path d="M22 21v-2a3 3 0 0 0-2.5-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16.5 3.3a3 3 0 0 1 0 7.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function TicketIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M4 9V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M4 15v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function CopyIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" /></IconBase>);
}
function TrashIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>);
}
function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="m8.5 12 2.3 2.3L15.8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>);
}
function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>);
}
function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (<IconBase size={size}><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>);
}

function initials(email: string) {
  const u = email.split("@")[0] || "user";
  return (u.slice(0, 2) || "EV").toUpperCase();
}

function timeAgo(dateString: string) {
  const ts = new Date(dateString).getTime();
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function buildInviteLink(token: string) {
  return `${window.location.origin}/accept-invite?token=${encodeURIComponent(token)}`;
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

function isValidEmail(email: string) {
  const e = email.trim();
  // Basic validation
  return /.+@.+\..+/.test(e);
}

function uniqueLower(arr: string[]) {
  const set = new Set<string>();
  arr.forEach((x) => set.add(x.trim().toLowerCase()));
  return Array.from(set);
}

export default function InviteMembersPage() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeStore();
  const isDark = mode === "dark";
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orgName, setOrgName] = useState("");

  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<Exclude<OrgRole, "Owner">>("Member");
  const [message, setMessage] = useState("");

  const [invites, setInvites] = useState<Invite[]>([]);

  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError("");
      const [orgData, invitesData] = await Promise.all([
        OrganizationService.getOrg(orgId),
        api.get<Invite[]>(`/orgs/${orgId}/invites`) // Invites might not be in OrganizationService yet, let's keep it or add to service
      ]);
      setOrgName(orgData.name);
      setInvites(invitesData);
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


  const addEmail = (raw: string) => {
    const val = raw.trim().replace(/[,;]$/, "");
    if (!val) return;
    if (!isValidEmail(val)) {
      setSnack({ open: true, severity: "warning", msg: `Invalid email: ${val}` });
      return;
    }
    const next = uniqueLower([...emails, val]);
    setEmails(next);
    setEmailInput("");
  };

  const onEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addEmail(emailInput);
    }
  };

  const removeEmail = (email: string) => setEmails((prev) => prev.filter((e) => e.toLowerCase() !== email.toLowerCase()));

  const sendInvites = async () => {
    const cleaned = uniqueLower(emails);
    if (!cleaned.length) {
      setSnack({ open: true, severity: "warning", msg: "Add at least one email." });
      return;
    }

    if (!orgId) return;

    try {
      await Promise.all(cleaned.map(email =>
        api.post<void>(`/orgs/${orgId}/invites`, { email, role })
      ));

      setSnack({ open: true, severity: "success", msg: `Invites sent: ${cleaned.length}` });
      setEmails([]);
      setEmailInput("");
      setMessage("");
      loadData(); // Reload invites list
    } catch (err: any) {
      setSnack({ open: true, severity: "error", msg: "Failed to send invites: " + err.message });
    }
  };

  const openRevoke = (id: string) => {
    setRevokeId(id);
    setRevokeOpen(true);
  };

  const revoke = async () => {
    if (!revokeId || !orgId) return;
    try {
      await api.delete<void>(`/orgs/${orgId}/invites/${revokeId}`);
      setSnack({ open: true, severity: "success", msg: "Invite revoked." });
      setRevokeOpen(false);
      loadData();
    } catch (err: any) {
      setSnack({ open: true, severity: "error", msg: "Failed to revoke: " + err.message });
      setRevokeOpen(false);
    }
  };

  const copyLink = async (token: string) => {
    const link = buildInviteLink(token);
    const ok = await copyToClipboard(link);
    setSnack({ open: true, severity: ok ? "success" : "warning", msg: ok ? "Invite link copied." : "Copy failed." });
  };

  const pending = invites.filter((i) => i.status === "Pending");

  const statusChip = (s: Invite["status"]) => {
    if (s === "Accepted") return <Chip size="small" color="success" label="Accepted" />;
    if (s === "Revoked") return <Chip size="small" color="error" label="Revoked" />;
    return <Chip size="small" color="warning" label="Pending" />;
  };

  const goMembers = () => navigate(`/app/orgs/${orgId}/members`);

  if (loading && !invites.length) {
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
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>{orgName}</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Invite members • {formatOrgId(orgId || "")}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
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
              {/* Header */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5">Invite members</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Invite people to your organization. Invitations expire automatically.
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip size="small" icon={<TicketIcon size={16} />} label={`${pending.length} pending`} variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                        <Chip size="small" icon={<UsersIcon size={16} />} label="Role assigned before sending" variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                      </Stack>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                      <Button variant="outlined" sx={orangeOutlined} onClick={goMembers}>
                        View members
                      </Button>
                      <Button variant="contained" color="secondary" sx={orangeContained} endIcon={<ArrowRightIcon size={18} />} onClick={() => navigate(`/app/orgs/${orgId}`)}>
                        Org dashboard
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                    Invites and revocations are recorded in audit logs.
                  </Alert>

                </CardContent>
              </Card>

              {/* Invite form */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.6}>
                    <Typography variant="h6">New invitations</Typography>

                    <TextField
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={onEmailKeyDown as any}
                      label="Invite emails"
                      placeholder="Type email then press Enter"
                      fullWidth
                      InputProps={{ startAdornment: (<InputAdornment position="start"><MailIcon size={18} /></InputAdornment>) }}
                      helperText="You can add multiple emails. Use Enter or comma to add."
                    />

                    {emails.length ? (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {emails.map((e) => (
                          <Chip key={e} label={e} onDelete={() => removeEmail(e)} />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>No emails added yet.</Typography>
                    )}

                    <Box className="grid gap-3 md:grid-cols-2">
                      <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value as any)} fullWidth>
                        {(["Admin", "Manager", "Member", "Viewer"] as Array<Exclude<OrgRole, "Owner">>).map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        label="Optional message"
                        fullWidth
                        placeholder="Example: Welcome to the team."
                      />
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                      <Button variant="outlined" sx={orangeOutlined} startIcon={<TicketIcon size={18} />} onClick={() => addEmail(emailInput)}>
                        Add email
                      </Button>
                      <Button variant="contained" color="secondary" sx={orangeContained} endIcon={<ArrowRightIcon size={18} />} onClick={sendInvites}>
                        Send invites
                      </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Tip: Use Roles and Permissions to define what each role can do.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Pending invites */}
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.4}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">Pending invites</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{invites.length} total</Typography>
                      </Box>
                      <Button variant="outlined" sx={orangeOutlined} startIcon={<UsersIcon size={18} />} onClick={goMembers}>
                        Members
                      </Button>
                    </Stack>

                    <Divider />

                    <Box className="grid gap-3 md:grid-cols-2">
                      {invites.map((i) => (
                        <Box key={i.id} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
                          <Stack spacing={1.0}>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                              <Avatar sx={{ bgcolor: alpha(EVZONE.green, 0.18), color: theme.palette.text.primary, fontWeight: 950, borderRadius: "4px" }}>
                                {initials(i.email)}
                              </Avatar>
                              <Box flex={1}>
                                <Typography sx={{ fontWeight: 950, wordBreak: "break-word" }}>{i.email}</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  Role: <b>{i.role}</b>
                                </Typography>
                              </Box>
                              {statusChip(i.status)}
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip size="small" variant="outlined" label={`Sent: ${timeAgo(i.createdAt)}`} />
                              <Chip size="small" variant="outlined" label={`Expires: ${new Date(i.expiresAt).toLocaleDateString()}`} />
                            </Stack>

                            <Divider />

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                              <Button variant="outlined" sx={orangeOutlined} startIcon={<CopyIcon size={18} />} onClick={() => copyLink(i.token || i.id)}>
                                Copy link
                              </Button>
                              <Button variant="outlined" sx={orangeOutlined} startIcon={<TrashIcon size={18} />} disabled={i.status !== "Pending"} onClick={() => openRevoke(i.id)}>
                                Revoke
                              </Button>
                              <Button variant="contained" color="secondary" sx={orangeContained} startIcon={<CheckCircleIcon size={18} />} onClick={() => setSnack({ open: true, severity: "info", msg: "Resend invite (demo)." })} disabled={i.status !== "Pending"}>
                                Resend
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Box>

                    <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                      For security, invites should be short-lived. Default expiry is 7 days.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {/* Mobile sticky actions */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1}>
                      <Button fullWidth variant="outlined" sx={orangeOutlined} onClick={goMembers}>
                        Members
                      </Button>
                      <Button fullWidth variant="contained" color="secondary" sx={orangeContained} endIcon={<ArrowRightIcon size={18} />} onClick={sendInvites}>
                        Send
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

        {/* Revoke dialog */}
        <Dialog open={revokeOpen} onClose={() => setRevokeOpen(false)} PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Revoke invite</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                This will invalidate the invite link immediately.
              </Typography>
              <Alert severity="warning">The person will not be able to accept after revocation.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={orangeOutlined} onClick={() => setRevokeOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" sx={orangeContained} onClick={revoke}>Revoke</Button>
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
