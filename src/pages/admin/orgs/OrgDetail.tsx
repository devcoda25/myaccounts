import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Tab,
    Tabs,
    Typography,
    useTheme,
    Avatar,
    Grid
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    ArrowLeft as ArrowLeftIcon,
    Building2 as OrgIcon,
    Calendar as CalendarIcon,
    Globe as GlobeIcon,
    Shield as ShieldIcon,
    Users as UsersIcon,
    CreditCard as CardIcon,
    Activity as ActivityIcon
} from "lucide-react";

type OrgStatus = "Active" | "Suspended" | "Pending";
type OrgPlan = "Free" | "Pro" | "Enterprise";

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;

export default function AdminOrgDetailPage() {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [tab, setTab] = useState(0);

    // Mock data based on ID
    const org = {
        id: orgId,
        name: "EV World Africa",
        domain: "evworld.africa",
        owner: "Ronald Isabirye",
        ownerEmail: "ronald@evworld.africa",
        status: "Active" as OrgStatus,
        plan: "Enterprise" as OrgPlan,
        members: 12,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 365,
        billingEmail: "billing@evworld.africa",
        taxId: "UG-123456789"
    };

    const orangeOutlined = {
        borderColor: alpha(EVZONE.orange, 0.70),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.35),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
        borderRadius: 3
    } as const;

    const DetailItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ color: theme.palette.text.secondary }}>{icon}</Box>
            <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>{label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
            </Box>
        </Stack>
    );

    return (
        <Box className="min-h-screen">
            <Stack spacing={2.2}>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button variant="outlined" sx={orangeOutlined} onClick={() => navigate("/admin/orgs")}>
                        <ArrowLeftIcon size={18} />
                    </Button>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar variant="rounded" sx={{ bgcolor: alpha(EVZONE.green, 0.15), color: EVZONE.green }}>
                                <OrgIcon size={24} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>{org.name}</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <GlobeIcon size={14} className="text-gray-500" />
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{org.domain}</Typography>
                                    <Chip size="small" label={org.status} color={org.status === "Active" ? "success" : "warning"} sx={{ height: 20, fontSize: "0.7rem" }} />
                                    <Chip size="small" label={org.plan} variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>

                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{ borderBottom: 1, borderColor: "divider", "& .MuiTabs-indicator": { backgroundColor: EVZONE.orange } }}
                >
                    <Tab label="Overview" sx={{ fontWeight: 700 }} />
                    <Tab label="Members" sx={{ fontWeight: 700 }} />
                    <Tab label="Settings" sx={{ fontWeight: 700 }} />
                </Tabs>

                {tab === 0 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Card sx={{ borderRadius: 4, height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Organization Details</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem label="Owner" value={org.owner} icon={<ShieldIcon size={18} />} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem label="Owner Email" value={org.ownerEmail} icon={<UsersIcon size={18} />} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem label="Created At" value={new Date(org.createdAt).toLocaleDateString()} icon={<CalendarIcon size={18} />} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem label="Members Count" value={org.members} icon={<UsersIcon size={18} />} />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: 4, height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Billing Info</Typography>
                                    <Stack spacing={2}>
                                        <DetailItem label="Plan" value={org.plan} icon={<ActivityIcon size={18} />} />
                                        <DetailItem label="Billing Email" value={org.billingEmail} icon={<CardIcon size={18} />} />
                                        <DetailItem label="Tax ID" value={org.taxId} icon={<CardIcon size={18} />} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {tab === 1 && (
                    <Card sx={{ borderRadius: 4 }}>
                        <CardContent>
                            <Box sx={{ p: 4, textAlign: "center", color: theme.palette.text.secondary }}>
                                <UsersIcon size={48} className="mx-auto mb-2 opacity-50" />
                                <Typography>Members list will be displayed here.</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}
                {tab === 2 && (
                    <Card sx={{ borderRadius: 4 }}>
                        <CardContent>
                            <Box sx={{ p: 4, textAlign: "center", color: theme.palette.text.secondary }}>
                                <OrgIcon size={48} className="mx-auto mb-2 opacity-50" />
                                <Typography>Organization settings (SSO, Domains, etc) will be displayed here.</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </Box>
    );
}
