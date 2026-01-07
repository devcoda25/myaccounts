import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, Button, Chip, Avatar, Tabs, Tab, TextField, MenuItem, Divider, Switch, FormControlLabel, Slider, InputAdornment, Alert, useTheme, alpha } from '@mui/material';
import { useThemeStore } from "@/stores/themeStore";
import { getStyles } from '../styles';
import {
    Plus as PlusIcon, Link as LinkIcon, Users as UsersIcon, ArrowRight as ArrowRightIcon,
    Wallet as WalletIcon, Lock as LockIcon, Shield as ShieldIcon, Bell as BellIcon,
    School as SchoolIcon, Globe as GlobeIcon, Clock as ClockIcon, MapPin as PinIcon,
    Zap as ZapIcon, User as UserIcon
} from 'lucide-react';
import { displayMoney, displayTimeAgo, calcAge, statusChip, consentChip } from "../utils";
import { ChildProfile, PendingApproval, ActivityEvent, HouseholdMember, AgeTemplate, ApprovalMode, SchedulePreset, Channel, ChargingControls, GeoFences, Place, AppKey } from "../types";
import AppsTab from './tabs/AppsTab';
import OverviewTab from './tabs/OverviewTab';

// Helper proxies
function money(v: number, c: string) { return displayMoney(v, c); }
function timeAgo(t?: number) { return displayTimeAgo(t); }

interface FamilySupervisionProps {
    children: ChildProfile[];
    selectedChildId: string;
    setSelectedChildId: (id: string) => void;
    selectedChild: ChildProfile | null;
    approvals: PendingApproval[];
    activity: ActivityEvent[];
    householdMembers: HouseholdMember[];
    updateChild: (id: string, patch: Partial<ChildProfile>, audit?: any) => void;
    requestStepUp: (title: string, subtitle: string, onVerified: () => void) => void;
    setSnack: (s: any) => void;
    openLink: () => void;
    openCreate: () => void;
    approveRequest: (id: string, approve: boolean) => void;
    updateCharging: (patch: Partial<ChargingControls>) => void;
    addAllowedStation: () => void;
    openPlaceEditor: (target: "Home" | "School") => void;
    removeMember: (id: string) => void;
    openInvite: (role: any) => void;
    applyTemplate: (t: AgeTemplate) => void;
}

export default function FamilySupervision({
    children, selectedChildId, setSelectedChildId, selectedChild,
    approvals, activity, householdMembers,
    updateChild, requestStepUp, setSnack,
    openLink, openCreate, approveRequest,
    updateCharging, addAllowedStation, openPlaceEditor,
    removeMember, openInvite, applyTemplate
}: FamilySupervisionProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, cardSx, EVZONE } = getStyles(theme, mode);
    const [tab, setTab] = useState(0);

    const ChildChip = ({ c }: { c: ChildProfile }) => {
        const age = calcAge(c.dob);
        const tone = c.status === "Active" ? EVZONE.green : EVZONE.orange;
        return (
            <Chip
                onClick={() => { setSelectedChildId(c.id); setTab(0); }}
                clickable
                label={`${c.name} (${age})`}
                variant={c.id === selectedChildId ? "filled" : "outlined"}
                sx={
                    c.id === selectedChildId
                        ? { fontWeight: 950, backgroundColor: EVZONE.orange, color: "#FFFFFF", borderRadius: "4px", "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92) } }
                        : {
                            fontWeight: 900,
                            borderRadius: "4px",
                            borderColor: alpha(tone, 0.35),
                            color: theme.palette.text.primary,
                            backgroundColor: alpha(theme.palette.background.paper, 0.25),
                            "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.10) },
                        }
                }
            />
        );
    };

    return (
        <Stack spacing={2.2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Managed accounts</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Select a child to view details and controls.
                    </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<LinkIcon size={18} />} onClick={openLink}>
                        Link child
                    </Button>
                    <Button variant="contained" sx={evOrangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={openCreate}>
                        Create child
                    </Button>
                </Stack>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {children.map((c) => (
                    <ChildChip key={c.id} c={c} />
                ))}
            </Stack>

            {selectedChild ? (
                <Box sx={{
                    mt: 1.2,
                    borderRadius: "4px", // User requested 4px
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.45),
                    p: 2
                }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                        <Stack direction="row" spacing={1.2} alignItems="center">
                            <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(EVZONE.green, 0.16), color: theme.palette.text.primary, borderRadius: "4px" }}>
                                <UserIcon size={24} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 950 }}>{selectedChild.name}</Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    Age {calcAge(selectedChild.dob)} • {selectedChild.school || "School"}{selectedChild.grade ? ` • ${selectedChild.grade}` : ""}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                                    {statusChip(selectedChild.status)}
                                    {consentChip(selectedChild.guardianVerified)}
                                    <Chip size="small" variant="outlined" label={`Template: ${selectedChild.template}`} sx={{ borderRadius: "4px" }} />
                                    <Chip size="small" variant="outlined" label={`Daily limit: ${money(selectedChild.dailyLimit, selectedChild.currency)}`} sx={{ borderRadius: "4px" }} />
                                </Stack>
                            </Box>
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                            <TextField
                                select
                                size="small"
                                value={selectedChild.template}
                                onChange={(e) => applyTemplate(e.target.value as AgeTemplate)}
                                label="Age template"
                                sx={{ minWidth: 200 }}
                            >
                                {(["Child (6-12)", "Teen (13-17)", "Young adult (18+)", "Custom"] as AgeTemplate[]).map((t) => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </TextField>

                            <Button
                                variant="outlined"
                                sx={evOrangeOutlinedSx}
                                onClick={() => {
                                    requestStepUp(
                                        selectedChild.status === "Active" ? "Pause child account" : "Resume child account",
                                        "This affects access across all EVzone modules.",
                                        () => {
                                            const nextStatus = selectedChild.status === "Active" ? "Paused" : "Active";
                                            updateChild(selectedChild.id, { status: nextStatus }, { kind: "App Access Updated", summary: `Set status to ${nextStatus}`, severity: "warning" });
                                            setSnack({ open: true, severity: "success", msg: `Status updated: ${nextStatus}.` });
                                        }
                                    );
                                }}
                            >
                                {selectedChild.status === "Active" ? "Pause" : "Resume"}
                            </Button>
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        allowScrollButtonsMobile
                        sx={{
                            borderRadius: "4px",
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                            overflow: "hidden",
                            minHeight: 44,
                            "& .MuiTab-root": { minHeight: 44, fontWeight: 800, textTransform: 'none', borderRadius: "4px", mx: 0.5 },
                            "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange, height: 3, borderRadius: 1.5 },
                        }}
                    >
                        <Tab label="Overview" />
                        <Tab label="Spending" />
                        <Tab label="Apps" />
                        <Tab label="Comms" />
                        <Tab label="Schedule" />
                        <Tab label="Safety" />
                        <Tab label="Activity" />
                        <Tab label="Consent" />
                        <Tab label="Household" />
                    </Tabs>

                    <Box sx={{ mt: 2 }}>
                        {tab === 0 && <OverviewTab approvals={approvals} selectedChild={selectedChild} updateChild={updateChild} requestStepUp={requestStepUp} setSnack={setSnack} approveRequest={approveRequest} />}

                        {tab === 1 && (
                            <Box className="grid gap-4 md:grid-cols-12">
                                <Box className="md:col-span-7">
                                    <Card sx={cardSx}>
                                        <CardContent className="p-5">
                                            <Stack spacing={1.2}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <WalletIcon size={20} />
                                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Spending limits</Typography>
                                                </Stack>
                                                <Divider />

                                                <Typography sx={{ fontWeight: 950 }}>Daily limit</Typography>
                                                <Slider
                                                    value={selectedChild.dailyLimit}
                                                    min={0} max={200000} step={1000}
                                                    valueLabelDisplay="auto"
                                                    valueLabelFormat={(v) => money(Number(v), selectedChild.currency)}
                                                    onChange={(_, v) => {
                                                        const next = Array.isArray(v) ? v[0] : v;
                                                        updateChild(selectedChild.id, { dailyLimit: Number(next) }, { kind: "Limit Updated", summary: `Daily limit updated`, severity: "info" });
                                                    }}
                                                />

                                                <Typography sx={{ fontWeight: 950 }}>Weekly limit</Typography>
                                                <TextField
                                                    value={selectedChild.weeklyLimit}
                                                    onChange={(e) => updateChild(selectedChild.id, { weeklyLimit: Number(e.target.value) })}
                                                    fullWidth size="small"
                                                    InputProps={{ startAdornment: <InputAdornment position="start"><WalletIcon size={16} /></InputAdornment> }}
                                                />

                                                <Divider />
                                                <FormControlLabel control={<Switch checked={!selectedChild.allowWithdrawals} onChange={(e) => updateChild(selectedChild.id, { allowWithdrawals: !e.target.checked })} />} label="Block withdrawals" />
                                                <FormControlLabel control={<Switch checked={!selectedChild.allowPeerTransfers} onChange={(e) => updateChild(selectedChild.id, { allowPeerTransfers: !e.target.checked })} />} label="Block peer transfers" />
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Box>
                                <Box className="md:col-span-5">
                                    <Card sx={cardSx}>
                                        <CardContent className="p-5">
                                            <Stack spacing={1.2}>
                                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Charging</Typography>
                                                <Divider />
                                                <FormControlLabel control={<Switch checked={selectedChild.apps["EVzone Charging"]} onChange={(e) => updateChild(selectedChild.id, { apps: { ...selectedChild.apps, "EVzone Charging": e.target.checked } })} />} label="Allow EVzone Charging" />
                                                {selectedChild.apps["EVzone Charging"] && (
                                                    <Stack spacing={1} sx={{ mt: 1 }}>
                                                        <Typography variant="body2">Daily kWh Cap: {selectedChild.charging.dailyKwhCap}</Typography>
                                                        <Slider value={selectedChild.charging.dailyKwhCap} max={60} onChange={(_, v) => updateCharging({ dailyKwhCap: v as number })} />
                                                    </Stack>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Box>
                        )}

                        {tab === 2 && <AppsTab selectedChild={selectedChild} updateChild={updateChild} requestStepUp={requestStepUp} setSnack={setSnack} />}

                        {tab === 3 && (
                            <Card sx={cardSx}>
                                <CardContent className="p-5">
                                    <Stack spacing={1.2}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Communication</Typography>
                                        <Divider />
                                        <FormControlLabel control={<Switch checked={selectedChild.allowTeacherMentorChat} onChange={(e) => updateChild(selectedChild.id, { allowTeacherMentorChat: e.target.checked })} />} label="Allow teacher chat" />
                                        <FormControlLabel control={<Switch checked={selectedChild.allowUnknownContacts} onChange={(e) => updateChild(selectedChild.id, { allowUnknownContacts: e.target.checked })} />} label="Allow unknown contacts" />
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {tab === 4 && (
                            <Card sx={cardSx}>
                                <CardContent className="p-5">
                                    <Stack spacing={1.2}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Schedule</Typography>
                                        <Divider />
                                        <Box className="grid gap-3 md:grid-cols-2">
                                            <TextField label="Start" type="time" value={selectedChild.dailyWindow.start} onChange={(e) => updateChild(selectedChild.id, { dailyWindow: { ...selectedChild.dailyWindow, start: e.target.value } })} InputLabelProps={{ shrink: true }} />
                                            <TextField label="End" type="time" value={selectedChild.dailyWindow.end} onChange={(e) => updateChild(selectedChild.id, { dailyWindow: { ...selectedChild.dailyWindow, end: e.target.value } })} InputLabelProps={{ shrink: true }} />
                                        </Box>
                                        <FormControlLabel control={<Switch checked={selectedChild.bedtimeLock} onChange={(e) => updateChild(selectedChild.id, { bedtimeLock: e.target.checked })} />} label="Bedtime lock" />
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {tab === 5 && (
                            <Card sx={cardSx}>
                                <CardContent className="p-5">
                                    <Stack spacing={1.2}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Safety & Geofences</Typography>
                                        <Divider />
                                        <FormControlLabel control={<Switch checked={selectedChild.geofences.enabled} onChange={(e) => updateChild(selectedChild.id, { geofences: { ...selectedChild.geofences, enabled: e.target.checked } })} />} label="Enable geofences" />
                                        <Box className="grid gap-3 md:grid-cols-2">
                                            <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => openPlaceEditor("Home")}>Set Home: {selectedChild.geofences.home?.address || "Not set"}</Button>
                                            <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => openPlaceEditor("School")}>Set School: {selectedChild.geofences.school?.address || "Not set"}</Button>
                                        </Box>
                                        <Divider />
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Curfew</Typography>
                                        <FormControlLabel control={<Switch checked={selectedChild.curfew.enabled} onChange={(e) => updateChild(selectedChild.id, { curfew: { ...selectedChild.curfew, enabled: e.target.checked } })} />} label="Enable curfew" />
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {tab === 6 && (
                            <Card sx={cardSx}>
                                <CardContent className="p-5">
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Activity Log</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Stack spacing={1}>
                                        {activity.filter(e => e.childId === selectedChild.id).slice(0, 10).map(e => (
                                            <Box key={e.id} sx={{ p: 1.5, borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}` }}>
                                                <Typography sx={{ fontWeight: 700 }}>{e.kind}</Typography>
                                                <Typography variant="body2">{e.summary}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{timeAgo(e.at)}</Typography>
                                            </Box>
                                        ))}
                                        {!activity.some(e => e.childId === selectedChild.id) && <Alert severity="info">No recent activity.</Alert>}
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {tab === 7 && (
                            <Card sx={cardSx}>
                                <CardContent className="p-5">
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Consent</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Stack spacing={1}>
                                        <Alert severity={selectedChild.guardianVerified ? "success" : "warning"}>
                                            Guardian Verification: {selectedChild.guardianVerified ? "Verified" : "Pending"}
                                        </Alert>
                                        <Button variant="contained" sx={evOrangeContainedSx} onClick={() => updateChild(selectedChild.id, { guardianVerified: true })}>Verify now (Demo)</Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {tab === 8 && (
                            <Card sx={cardSx}>
                                <CardContent className="p-5">
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Household Members</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Stack spacing={1}>
                                        {householdMembers.map(m => (
                                            <Box key={m.id} sx={{ p: 1.5, borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 700 }}>{m.name}</Typography>
                                                    <Typography variant="body2">{m.role}</Typography>
                                                </Box>
                                                <Button variant="outlined" color="error" size="small" onClick={() => removeMember(m.id)}>Remove</Button>
                                            </Box>
                                        ))}
                                        <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<PlusIcon size={16} />} onClick={() => openInvite("Co-guardian")}>Invite Co-guardian</Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                    </Box>
                </Box>
            ) : (
                <Alert severity="info" sx={{ borderRadius: "4px" }}>Select a child to manage.</Alert>
            )}
        </Stack>
    );
}
