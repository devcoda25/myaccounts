import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Divider, Button, Chip, Alert, Switch, FormControlLabel, useTheme, alpha } from '@mui/material';
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { getStyles } from '../../styles';
import { Bell as BellIcon, Shield as ShieldIcon, School as SchoolIcon, Globe as GlobeIcon, Clock as ClockIcon, Lock as LockIcon } from 'lucide-react';
import { displayMoney, displayTimeAgo, approvalKindChip } from "../../utils";
import { PendingApproval, ChildProfile, ActivityEvent } from "../../types";

// Helper re-imports if needed, or just use from utils
function money(v: number, c: string) { return displayMoney(v, c); }
function timeAgo(t?: number) { return displayTimeAgo(t); }

interface OverviewTabProps {
    approvals: PendingApproval[];
    selectedChild: ChildProfile;
    updateChild: (id: string, patch: Partial<ChildProfile>, audit?: any) => void;
    requestStepUp: (title: string, subtitle: string, onVerified: () => void) => void;
    setSnack: (s: any) => void;
    approveRequest: (id: string, approve: boolean) => void;
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.1} alignItems="center">
                <Box sx={{ width: 38, height: 38, borderRadius: "4px", display: "grid", placeItems: "center", backgroundColor: "rgba(3,205,140,0.12)", border: "1px solid rgba(0,0,0,0.08)" }}>
                    {icon}
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 950, textAlign: "right" }}>{value}</Typography>
        </Stack>
    );
}

export default function OverviewTab({ approvals, selectedChild, updateChild, requestStepUp, setSnack, approveRequest }: OverviewTabProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { user } = useAuthStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, cardSx } = getStyles(theme, mode);
    const userId = user?.id; // Fixed: IUser has 'id', not 'profile.sub'

    return (
        <Box className="grid gap-4 md:grid-cols-12">
            <Box className="md:col-span-7">
                <Card sx={cardSx}>
                    <CardContent className="p-5">
                        <Stack spacing={1.2}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Approvals</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Requests from the child account that need your permission.
                            </Typography>
                            <Divider />

                            <Stack spacing={1.1}>
                                {approvals
                                    .filter((a) => a.childId === selectedChild.id)
                                    .filter((a) => a.status === "Pending")
                                    .slice(0, 6)
                                    .map((a) => {
                                        const hasVoted = a.votes?.includes(userId || "");

                                        return (
                                            <Box key={a.id} sx={{
                                                borderRadius: "4px", // Wallet Match
                                                border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                                                backgroundColor: alpha(theme.palette.background.paper, 0.45),
                                                p: 1.2
                                            }}>
                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                                                    <Box>
                                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                                            {approvalKindChip(a.kind)}
                                                            <Chip size="small" variant="outlined" label={a.app} sx={{ borderRadius: "4px" }} />
                                                            <Chip size="small" variant="outlined" label={timeAgo(a.at)} sx={{ borderRadius: "4px" }} />
                                                            {hasVoted && <Chip size="small" color="info" label="Waiting for other guardian" sx={{ borderRadius: "4px" }} />}
                                                        </Stack>
                                                        <Typography sx={{ fontWeight: 950, mt: 0.6 }}>{a.title}</Typography>
                                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                            {money(a.amount, a.currency)} • {a.vendor || ""}
                                                        </Typography>
                                                        {a.details ? <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{a.details}</Typography> : null}
                                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", marginTop: 0.5 }}>{a.reason}</Typography>
                                                    </Box>

                                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                                        <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => approveRequest(a.id, false)}>
                                                            Decline
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            sx={evOrangeContainedSx}
                                                            onClick={() => approveRequest(a.id, true)}
                                                            disabled={hasVoted}
                                                        >
                                                            {hasVoted ? "Approved" : "Approve"}
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        );
                                    })}

                                {!approvals.some((a) => a.childId === selectedChild.id && a.status === "Pending") ? (
                                    <Alert severity="info" icon={<BellIcon size={18} />} sx={{ borderRadius: "4px" }}>No pending approvals.</Alert>
                                ) : null}
                            </Stack>

                            <Alert severity="info" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                                Approvals can be required for purchases, rides, services, and trips.
                            </Alert>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            <Box className="md:col-span-5">
                <Stack spacing={2.0}>
                    <Card sx={cardSx}>
                        <CardContent className="p-5">
                            <Stack spacing={1.0}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Quick restrictions</Typography>
                                <Divider />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={selectedChild.requireApprovalForAllPurchases}
                                            onChange={(e) =>
                                                requestStepUp(
                                                    "Update approvals",
                                                    "This affects purchases and paid requests.",
                                                    () => {
                                                        updateChild(
                                                            selectedChild.id,
                                                            { requireApprovalForAllPurchases: e.target.checked },
                                                            { kind: "Limit Updated", summary: `Require approval for all: ${e.target.checked ? "On" : "Off"}`, severity: "info" }
                                                        );
                                                        setSnack({ open: true, severity: "success", msg: "Updated." });
                                                    }
                                                )
                                            }
                                        />
                                    }
                                    label={<Typography sx={{ fontWeight: 900 }}>Require approval for all purchases</Typography>}
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!selectedChild.allowUnknownContacts}
                                            onChange={(e) =>
                                                requestStepUp(
                                                    "Update contacts",
                                                    "Unknown contacts can expose minors to risk.",
                                                    () => {
                                                        updateChild(
                                                            selectedChild.id,
                                                            { allowUnknownContacts: !e.target.checked },
                                                            { kind: "App Access Updated", summary: `Unknown contacts: ${!e.target.checked ? "Allowed" : "Blocked"}`, severity: "warning" }
                                                        );
                                                        setSnack({ open: true, severity: "success", msg: "Updated." });
                                                    }
                                                )
                                            }
                                        />
                                    }
                                    label={<Typography sx={{ fontWeight: 900 }}>Block unknown contacts</Typography>}
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={selectedChild.bedtimeLock}
                                            onChange={(e) =>
                                                requestStepUp(
                                                    "Update bedtime lock",
                                                    "This restricts access outside the allowed schedule.",
                                                    () => {
                                                        updateChild(
                                                            selectedChild.id,
                                                            { bedtimeLock: e.target.checked },
                                                            { kind: "Schedule Updated", summary: `Bedtime lock: ${e.target.checked ? "On" : "Off"}`, severity: "info" }
                                                        );
                                                        setSnack({ open: true, severity: "success", msg: "Updated." });
                                                    }
                                                )
                                            }
                                        />
                                    }
                                    label={<Typography sx={{ fontWeight: 900 }}>Bedtime lock</Typography>}
                                />

                                <Divider />

                                <Alert severity="info" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                                    Use templates to quickly apply best-practice settings.
                                </Alert>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card sx={cardSx}>
                        <CardContent className="p-5">
                            <Stack spacing={1.0}>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Child summary</Typography>
                                <Divider />
                                <InfoRow label="School" value={selectedChild.school || "-"} icon={<SchoolIcon size={18} />} />
                                <InfoRow label="Country" value={selectedChild.country} icon={<GlobeIcon size={18} />} />
                                <InfoRow label="Daily window" value={`${selectedChild.dailyWindow.start} to ${selectedChild.dailyWindow.end}`} icon={<ClockIcon size={18} />} />
                                <InfoRow label="Curfew" value={selectedChild.curfew.enabled ? `${selectedChild.curfew.start} to ${selectedChild.curfew.end}` : "Off"} icon={<LockIcon size={18} />} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>
        </Box>
    );
}
