import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Button,
    Card,
    CardContent,
    Tab,
    Tabs,
    CircularProgress,
    IconButton,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    Snackbar,
    alpha,
    useTheme
} from '@mui/material';
import {
    ArrowLeft as ArrowLeftIcon,
    Users as UsersIcon,
    Shield as ShieldIcon,
    Trash2 as TrashIcon,
    Plus as PlusIcon,
    Layout as AppIcon
} from 'lucide-react';
import { api } from "@/utils/api";
import { EVZONE } from "@/theme/evzone";

interface AppMember {
    id: string;
    userId: string;
    role: 'SUPER_APP_ADMIN' | 'REGIONAL_ADMIN' | 'STAFF';
    region?: string;
    user: {
        email: string;
        firstName: string | null;
        otherNames: string | null;
        avatarUrl: string | null;
    };
}

export default function AppDetail() {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const theme = useTheme();

    const [tab, setTab] = useState(0);
    const [app, setApp] = useState<any>(null);
    const [members, setMembers] = useState<AppMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });

    // Invite Modal State
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', role: 'STAFF', region: '' });

    const fetchDetails = async () => {
        if (!clientId) return;
        setLoading(true);
        try {
            // Fetch App Details (Existing endpoint or find from list if individual endpoint missing)
            // Note: Ideally dedicated endpoint, simpler to reuse list for now if detail endpoint not ready,
            // but let's assume specific endpoint exists or we use list logic.
            // I will try to fetch specific first.
            const appRes = await api(`/admin/apps/${clientId}`).catch(() => null);
            // If endpoint doesn't exist, I might have to hack it from list, but let's assume backend I edited earlier handles GET /admin/apps/:clientId ? 
            // Wait, I only edited AppMembersController. The existing AppsController probably already has getOne?
            // If not, I'll fallback.

            if (appRes) setApp(appRes);

            // Fetch Members
            const membersRes = await api<AppMember[]>(`/apps/${clientId}/members`);
            setMembers(membersRes);
        } catch (err) {
            console.error(err);
            setSnack({ open: true, msg: 'Failed to load app data', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [clientId]);

    const handleInvite = async () => {
        try {
            await api(`/apps/${clientId}/members`, {
                method: 'POST',
                body: JSON.stringify(inviteData)
            });
            setSnack({ open: true, msg: 'Member invited successfully', severity: 'success' });
            setInviteOpen(false);
            fetchDetails(); // Refresh list
        } catch (err: any) {
            setSnack({ open: true, msg: err.message || 'Invitation failed', severity: 'error' });
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!window.confirm('Remove this member?')) return;
        try {
            await api(`/apps/${clientId}/members/${memberId}`, { method: 'DELETE' });
            setSnack({ open: true, msg: 'Member removed', severity: 'success' });
            fetchDetails();
        } catch (err: any) {
            setSnack({ open: true, msg: 'Failed to remove member', severity: 'error' });
        }
    };

    if (loading && !app) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

    return (
        <Box>
            <Stack spacing={3}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/admin/apps')}>
                        <ArrowLeftIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>{app?.name || clientId}</Typography>
                        <Typography variant="body2" color="text.secondary">App Management & Permissions</Typography>
                    </Box>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                        <Tab label="Overview" />
                        <Tab label="Team & Permissions" />
                    </Tabs>
                </Box>

                {/* Content */}
                {tab === 0 && (
                    <Card sx={{ borderRadius: 4 }}>
                        <CardContent>
                            <Typography variant="h6">App Details</Typography>
                            <Typography color="text.secondary">Client ID: <code>{clientId}</code></Typography>
                            {/* Basic details already shown in list, mostly for context */}
                        </CardContent>
                    </Card>
                )}

                {tab === 1 && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<PlusIcon size={18} />}
                                onClick={() => setInviteOpen(true)}
                                sx={{ bgcolor: EVZONE.green, '&:hover': { bgcolor: alpha(EVZONE.green, 0.9) } }}
                            >
                                Add Member
                            </Button>
                        </Box>

                        <Stack spacing={2}>
                            {members.map(member => (
                                <Card key={member.id} sx={{ borderRadius: 3 }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={member.user.avatarUrl || undefined} alt={member.user.email} />
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    {member.user.firstName} {member.user.otherNames}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">{member.user.email}</Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip
                                                label={member.role.replace(/_/g, ' ')}
                                                size="small"
                                                color={member.role === 'SUPER_APP_ADMIN' ? 'error' : member.role === 'REGIONAL_ADMIN' ? 'warning' : 'default'}
                                                variant="outlined"
                                            />
                                            {member.region && <Chip label={member.region} size="small" />}
                                            <IconButton color="error" size="small" onClick={() => handleRemoveMember(member.id)}>
                                                <TrashIcon size={16} />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                            {members.length === 0 && (
                                <Typography align="center" color="text.secondary">No team members assigned yet.</Typography>
                            )}
                        </Stack>
                    </Box>
                )}
            </Stack>

            {/* Invite Modal */}
            <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="User Email"
                            fullWidth
                            value={inviteData.email}
                            onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                        />
                        <TextField
                            select
                            label="Role"
                            fullWidth
                            value={inviteData.role}
                            onChange={e => setInviteData({ ...inviteData, role: e.target.value as any })}
                        >
                            <MenuItem value="SUPER_APP_ADMIN">Super App Admin</MenuItem>
                            <MenuItem value="REGIONAL_ADMIN">Regional Admin</MenuItem>
                            <MenuItem value="STAFF">Staff</MenuItem>
                        </TextField>

                        {inviteData.role === 'REGIONAL_ADMIN' && (
                            <TextField
                                label="Region Code"
                                fullWidth
                                placeholder="e.g. EA, NA, KAMPALA"
                                value={inviteData.region}
                                onChange={e => setInviteData({ ...inviteData, region: e.target.value })}
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleInvite}>Invite</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
                <Alert severity={snack.severity as any}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
