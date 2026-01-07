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
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
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

interface OrgDetail {
    id: string;
    name: string;
    domain: string;
    owner: string;
    ownerEmail: string;
    status: OrgStatus;
    plan: OrgPlan;
    members: number;
    createdAt: number;
    billingEmail: string;
    taxId: string;
    memberList: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        joinedAt: number;
        avatarUrl: string | null;
    }>;
    ssoEnabled: boolean;
    ssoDomains: string[];
}

import { api } from "../../../utils/api";

export default function AdminOrgDetailPage() {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState<OrgDetail | null>(null);

    React.useEffect(() => {
        if (!orgId) return;
        setLoading(true);
        api<OrgDetail>(`/admin/orgs/${orgId}`)
            .then(data => setOrg(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [orgId]);

    if (loading) return <Box p={4}>Loading...</Box>;
    if (!org) return <Box p={4}>Organization not found</Box>;

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
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: alpha(theme.palette.background.paper, 0.55) }}>
                                        <TableCell sx={{ fontWeight: 950 }}>User</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Role</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 950 }}>Joined</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {org.memberList.map((m) => (
                                        <TableRow key={m.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar src={m.avatarUrl || undefined} sx={{ width: 32, height: 32 }}>{m.name[0]}</Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{m.email}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={m.role} sx={{ height: 24, fontWeight: 700 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={m.status}
                                                    color={m.status === 'Active' ? 'success' : 'default'}
                                                    sx={{ height: 24, fontWeight: 700 }}
                                                />
                                            </TableCell>
                                            <TableCell>{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    {org.memberList.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>No members found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                )}
                {tab === 2 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ borderRadius: 4, height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Single Sign-On (SSO)</Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon><ShieldIcon /></ListItemIcon>
                                            <ListItemText
                                                primary="SSO Enabled"
                                                secondary={org.ssoEnabled ? "Active" : "Disabled"}
                                            />
                                            <Switch edge="end" checked={org.ssoEnabled} disabled />
                                        </ListItem>
                                    </List>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom>Authorized Domains</Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {org.ssoDomains.length > 0 ? org.ssoDomains.map(d => (
                                            <Chip key={d} label={d} variant="outlined" icon={<GlobeIcon size={14} />} />
                                        )) : (
                                            <Typography variant="body2" color="text.secondary">No domains configured.</Typography>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Stack>
        </Box>
    );
}
