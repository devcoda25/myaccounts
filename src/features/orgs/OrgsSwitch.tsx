import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  TextField,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";
import { OrganizationService, OrganizationDto, OrgType } from "@/services/OrganizationService";
import { formatOrgId } from "@/utils/format";

/**
 * EVzone My Accounts - Organization Switcher
 * Route: /app/orgs/switch
 *
 * Features:
 * - List orgs + roles
 * - Create new organization
 * - Join via invite code
 * - Remember last selection
 */

type Severity = "info" | "warning" | "error" | "success";

// Local EVZONE removed

const STORAGE_LAST_ORG = "evzone_myaccounts_last_org";
const STORAGE_REMEMBER_ORG = "evzone_myaccounts_remember_org";

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

function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m8.5 12 2.3 2.3L15.8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
// Theme
// -----------------------------
// Local theme storage removed

function getStoredRemember(): boolean {
  try {
    const v = window.localStorage.getItem(STORAGE_REMEMBER_ORG);
    if (v === null) return true;
    return v === "true";
  } catch {
    return true;
  }
}

function setStoredRemember(v: boolean) {
  try {
    window.localStorage.setItem(STORAGE_REMEMBER_ORG, String(v));
  } catch {
    // ignore
  }
}

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

export default function SwitchOrgPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const [remember, setRemember] = useState<boolean>(() => getStoredRemember());

  const [orgs, setOrgs] = useState<OrganizationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<string>(() => {
    const stored = getStoredLastOrg();
    return stored || "";
  });

  const loadOrgs = async () => {
    try {
      setLoading(true);
      const data = await OrganizationService.listMyOrgs();
      setOrgs(data);
      if (data.length > 0 && !selected) {
        setSelected(data[0].id);
      }
    } catch (err) {
      setSnack({ open: true, severity: "error", msg: "Failed to load organizations." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState<OrgType>("Company");
  const [createCountry, setCreateCountry] = useState("Uganda");
  const [createSso, setCreateSso] = useState(false);

  const [inviteCode, setInviteCode] = useState("");

  const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

  // Self-tests effect removed

  useEffect(() => {
    setStoredRemember(remember);
    if (!remember) setStoredLastOrg(null);
    else setStoredLastOrg(selected);
  }, [remember, selected]);

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

  const currentOrg = useMemo(() => orgs.find((o) => o.id === selected) || orgs[0], [orgs, selected]);

  const createOrg = async () => {
    const name = createName.trim();
    if (!name) {
      setSnack({ open: true, severity: "warning", msg: "Enter an organization name." });
      return;
    }
    try {
      setLoading(true);
      const newOrg = await OrganizationService.createOrg({ name, country: createCountry });
      setOrgs((prev) => [newOrg, ...prev]);
      setSelected(newOrg.id);
      setCreateOpen(false);
      setCreateName("");
      setCreateType("Company");
      setCreateCountry("Uganda");
      setCreateSso(false);
      setSnack({ open: true, severity: "success", msg: `Organization created: ${name}` });
    } catch (err) {
      setSnack({ open: true, severity: "error", msg: "Failed to create organization." });
    } finally {
      setLoading(false);
    }
  };

  const joinOrg = async () => {
    const id = inviteCode.trim(); // Assume for now it's the ID or use a dedicated join code endpoint if later developed
    if (!id) {
      setSnack({ open: true, severity: "warning", msg: "Enter a valid organization ID/invite code." });
      return;
    }

    try {
      setLoading(true);
      const joined = await OrganizationService.joinOrg(id);
      setOrgs((prev) => {
        if (prev.some((o) => o.id === joined.id)) return prev;
        return [joined, ...prev];
      });
      setSelected(joined.id);
      setJoinOpen(false);
      setInviteCode("");
      setSnack({ open: true, severity: "success", msg: "Joined organization successfully." });
    } catch (err) {
      setSnack({ open: true, severity: "error", msg: "Failed to join organization. Check the code." });
    } finally {
      setLoading(false);
    }
  };

  const continueToOrg = () => {
    const org = orgs.find((o) => o.id === selected);
    setSnack({ open: true, severity: "success", msg: `Switched to ${org?.name || "organization"}.` });
    setTimeout(() => navigate("/app"), 500);
  };

  return (
    <>
      <CssBaseline />
      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Top bar */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)", backgroundColor: alpha(theme.palette.background.default, 0.72) }}>
          <Box className="mx-auto max-w-6xl px-4 py-3 md:px-6">
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(3,205,140,1) 0%, rgba(3,205,140,0.75) 100%)", boxShadow: `0 14px 40px ${alpha(isDark ? "#000" : "#0B1A17", 0.20)}` }}>
                  <Typography sx={{ color: "white", fontWeight: 950, letterSpacing: -0.4 }}>EV</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>My Accounts</Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Organization switcher</Typography>
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

        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={2.2}>
              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.2}>
                    <Typography variant="h5">Switch organization</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Your role and access depend on the organization you select.
                    </Typography>

                    <Divider />

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography sx={{ fontWeight: 950 }}>Current selection</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.4 }}>
                          <Chip icon={<BuildingIcon size={16} />} label={currentOrg?.name || "-"} variant="outlined" sx={{ fontWeight: 900, "& .MuiChip-icon": { color: "inherit" } }} />
                          <Chip label={currentOrg?.role || "-"} color="info" size="small" />
                          <Chip icon={<UsersIcon size={16} />} label={`${currentOrg?.membersCount ?? 0} members`} size="small" variant="outlined" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />
                          {currentOrg?.ssoEnabled ? <Chip size="small" color="success" label="SSO enabled" /> : <Chip size="small" variant="outlined" label="SSO not enabled" />}
                        </Stack>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<PlusIcon size={18} />} onClick={() => setCreateOpen(true)}>
                          Create org
                        </Button>
                        <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<TicketIcon size={18} />} onClick={() => setJoinOpen(true)}>
                          Join via invite
                        </Button>
                        <Button variant="contained" color="secondary" sx={evOrangeContainedSx} endIcon={<ArrowRightIcon size={18} />} onClick={continueToOrg}>
                          Continue
                        </Button>
                      </Stack>
                    </Stack>

                    <Alert severity="info" icon={<CheckCircleIcon size={18} />}>
                      Tip: If you manage multiple orgs, use "Remember selection" for faster switching.
                    </Alert>

                    <FormControlLabel
                      control={<Switch checked={remember} onChange={(e) => setRemember(e.target.checked)} color="secondary" />}
                      label={<Typography sx={{ fontWeight: 900 }}>Remember last selection on this device</Typography>}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 md:p-7">
                  <Stack spacing={1.4}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">Your organizations</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Select an organization to switch context.
                        </Typography>
                      </Box>
                      <Button variant="text" sx={{ color: EVZONE.orange, fontWeight: 900, "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) } }} onClick={() => setSnack({ open: true, severity: "info", msg: "Navigate to /app/orgs (demo)." })}>
                        Manage organizations
                      </Button>
                    </Stack>

                    <Divider />

                    <Box className="grid gap-3 sm:grid-cols-2">
                      {orgs.map((o) => {
                        const isSelected = o.id === selected;
                        return (
                          <Box
                            key={o.id}
                            onClick={() => setSelected(o.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") setSelected(o.id);
                            }}
                            sx={{
                              borderRadius: "4px",
                              border: `1px solid ${alpha(theme.palette.text.primary, isSelected ? 0.22 : 0.10)}`,
                              backgroundColor: isSelected ? alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.10) : alpha(theme.palette.background.paper, 0.45),
                              p: 1.4,
                              cursor: "pointer",
                              outline: "none",
                              transition: "all 160ms ease",
                              "&:hover": { borderColor: alpha(EVZONE.orange, 0.75), transform: "translateY(-1px)" },
                            }}
                          >
                            <Stack direction="row" spacing={1.2} alignItems="center">
                              <Box
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: "4px",
                                  display: "grid",
                                  placeItems: "center",
                                  backgroundColor: alpha(EVZONE.green, mode === "dark" ? 0.18 : 0.12),
                                  border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                  color: theme.palette.text.primary,
                                  fontWeight: 950,
                                }}
                              >
                                {initials(o.name)}
                              </Box>
                              <Box flex={1}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                  <Typography sx={{ fontWeight: 950 }}>{o.name}</Typography>
                                  {isSelected ? <Chip size="small" color="success" label="Selected" /> : null}
                                  <Chip size="small" variant="outlined" label={o.role} />
                                </Stack>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                  {formatOrgId(o.id)} • {o.country} • {o.membersCount} member(s)
                                </Typography>
                              </Box>
                              <Box>
                                <CheckCircleIcon size={18} />
                              </Box>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Mobile sticky action */}
              <Box className="md:hidden" sx={{ position: "sticky", bottom: 12 }}>
                <Card sx={{ borderRadius: 999, backgroundColor: alpha(theme.palette.background.paper, 0.85), border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backdropFilter: "blur(10px)" }}>
                  <CardContent sx={{ py: 1.1, px: 1.2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button fullWidth variant="outlined" sx={evOrangeOutlinedSx} startIcon={<TicketIcon size={18} />} onClick={() => setJoinOpen(true)}>
                        Invite
                      </Button>
                      <Button fullWidth variant="contained" color="secondary" sx={evOrangeContainedSx} endIcon={<ArrowRightIcon size={18} />} onClick={continueToOrg}>
                        Continue
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

        {/* Create org dialog */}
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Create new organization</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Create an organization to manage teams, policies, and billing.
              </Typography>
              <TextField value={createName} onChange={(e) => setCreateName(e.target.value)} label="Organization name" fullWidth />
              <TextField select label="Organization type" value={createType} onChange={(e) => setCreateType(e.target.value as OrgType)} fullWidth>
                {(["Company", "School", "Fleet", "Government", "Other"] as OrgType[]).map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
              <TextField value={createCountry} onChange={(e) => setCreateCountry(e.target.value)} label="Country/region" fullWidth />
              <FormControlLabel control={<Switch checked={createSso} onChange={(e) => setCreateSso(e.target.checked)} color="secondary" />} label={<Typography sx={{ fontWeight: 900 }}>Enable enterprise SSO (optional)</Typography>} />
              <Alert severity="info">You can configure SSO domains after creation.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={createOrg}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* Join org dialog */}
        <Dialog open={joinOpen} onClose={() => setJoinOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "4px", border: `1px solid ${theme.palette.divider}`, backgroundImage: "none" } }}>
          <DialogTitle sx={{ fontWeight: 950 }}>Join via invite code</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Enter the invite code you received from your organization admin.
              </Typography>
              <TextField value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} label="Invite code" placeholder="EVZ-INVITE-123" fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><TicketIcon size={18} /></InputAdornment>) }} />
              <Alert severity="info">Demo: Any code with 6+ characters will join a sample org.</Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setJoinOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={joinOrg}>Join</Button>
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
