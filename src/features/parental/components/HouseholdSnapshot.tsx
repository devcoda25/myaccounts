import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Button, Chip, Divider, Alert, useTheme, alpha } from '@mui/material';
import { Plus as PlusIcon, Shield as ShieldIcon } from 'lucide-react';
import { useThemeStore } from "@/stores/themeStore";
import { getStyles } from '../styles';

// Types (mirrored from Index.tsx for now)
export type HouseholdRole = "Guardian" | "Co-guardian" | "Emergency contact";
export type HouseholdStatus = "Active" | "Pending";
export type ApprovalMode = "Any guardian" | "Both guardians";

export interface HouseholdMember {
    id: string;
    name: string;
    role: HouseholdRole;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
    status: HouseholdStatus;
}

interface HouseholdSnapshotProps {
    householdCounts: { co: number; em: number; pending: number };
    approvalMode: ApprovalMode;
    householdMembers: HouseholdMember[];
    openInvite: (role: HouseholdRole) => void;
    updateApprovalMode: (mode: ApprovalMode) => void;
}

export default function HouseholdSnapshot({
    householdCounts,
    approvalMode,
    householdMembers,
    openInvite,
    updateApprovalMode
}: HouseholdSnapshotProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, cardSx } = getStyles(theme, mode);

    return (
        <Card sx={cardSx}>
            <CardContent className="p-5 md:p-7">
                <Stack spacing={1.2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>Household</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Co-guardians can approve requests. Emergency contacts receive urgent alerts only.
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                <Chip size="small" variant="outlined" label={`Co - guardians: ${householdCounts.co} `} sx={{ borderRadius: "4px" }} />
                                <Chip size="small" variant="outlined" label={`Emergency: ${householdCounts.em} `} sx={{ borderRadius: "4px" }} />
                                <Chip size="small" variant="outlined" label={`Pending invites: ${householdCounts.pending} `} sx={{ borderRadius: "4px" }} />
                                <Chip size="small" variant="outlined" label={`Approval mode: ${approvalMode} `} sx={{ borderRadius: "4px" }} />
                            </Stack>
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ width: { xs: "100%", md: "auto" } }}>
                            <Button variant="outlined" sx={evOrangeOutlinedSx} startIcon={<PlusIcon size={18} />} onClick={() => openInvite("Co-guardian")}>
                                Invite co-guardian
                            </Button>
                            <Button variant="contained" sx={evOrangeContainedSx} startIcon={<PlusIcon size={18} />} onClick={() => openInvite("Emergency contact")}>
                                Add emergency
                            </Button>
                        </Stack>
                    </Stack>

                    <Divider />

                    <Box className="grid gap-2 md:grid-cols-2">
                        <Box sx={{
                            borderRadius: "4px", // Wallet Match: 4px
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)} `,
                            backgroundColor: alpha(theme.palette.background.paper, 0.40),
                            p: 1.2
                        }}>
                            <Typography sx={{ fontWeight: 950 }}>Approval rule</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Choose whether one guardian is enough or both must approve.
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 1 }}>
                                <Button
                                    variant={approvalMode === "Any guardian" ? "contained" : "outlined"}
                                    sx={approvalMode === "Any guardian" ? evOrangeContainedSx : evOrangeOutlinedSx}
                                    onClick={() => updateApprovalMode("Any guardian")}
                                >
                                    Any guardian
                                </Button>
                                <Button
                                    variant={approvalMode === "Both guardians" ? "contained" : "outlined"}
                                    sx={approvalMode === "Both guardians" ? evOrangeContainedSx : evOrangeOutlinedSx}
                                    onClick={() => updateApprovalMode("Both guardians")}
                                >
                                    Both guardians
                                </Button>
                            </Stack>
                        </Box>

                        <Box sx={{
                            borderRadius: "4px", // Wallet Match: 4px
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)} `,
                            backgroundColor: alpha(theme.palette.background.paper, 0.40),
                            p: 1.2
                        }}>
                            <Typography sx={{ fontWeight: 950 }}>Members</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Quick overview. Full controls are inside the Household tab.
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                {householdMembers.slice(0, 4).map((m) => (
                                    <Chip key={m.id} size="small" variant="outlined" label={`${m.name}${m.isPrimary ? " (Primary)" : ""} `} sx={{ borderRadius: "4px" }} />
                                ))}
                                {householdMembers.length > 4 ? <Chip size="small" variant="outlined" label={`+ ${householdMembers.length - 4} `} sx={{ borderRadius: "4px" }} /> : null}
                            </Stack>
                        </Box>
                    </Box>

                    <Alert severity="info" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                        Household changes are step-up protected.
                    </Alert>
                </Stack>
            </CardContent>
        </Card>
    );
}
