import React, { useState, useEffect } from 'react';
import { api } from "@/utils/api";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
    Avatar,
    MenuItem,
    InputAdornment
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    UserPlus as UserPlusIcon,
    Shield as ShieldIcon,
    Trash2 as TrashIcon,
    MoreVertical as MoreVerticalIcon,
    Mail as MailIcon
} from 'lucide-react';
import { EVZONE } from "@/theme/evzone";
import { AdminRole } from '@/types';

interface AdminMember {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    lastActive: string;
    status: 'Active' | 'Invited';
}

// MOCK_ADMINS removed

export default function Administrators() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [admins, setAdmins] = useState<AdminMember[]>([]);
    const [openInvite, setOpenInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<AdminRole>('Admin');

    const fetchAdmins = async () => {
        try {
            const data = await api<AdminMember[]>('/admin/members');
            setAdmins(data);
        } catch (error) {
            console.error("Failed to fetch admins", error);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleInvite = async () => {
        try {
            await api.post('/admin/members', { email: inviteEmail, role: inviteRole });
            setOpenInvite(false);
            setInviteEmail('');
            fetchAdmins();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            alert("Failed to invite admin: " + msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to remove this admin?")) {
            try {
                await api.delete(`/admin/members/${id}`);
                fetchAdmins();
            } catch (error) {
                const msg = error instanceof Error ? error.message : "Unknown error";
                alert("Failed to remove admin: " + msg);
            }
        }
    };

    const orangeContained = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92) },
        borderRadius: 3
    };

    return (
        <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>Administrators</Typography>
                    <Typography variant="body2" color="text.secondary">Manage access to the admin portal.</Typography>
                </Box>
                <Button variant="contained" startIcon={<UserPlusIcon size={18} />} sx={orangeContained} onClick={() => setOpenInvite(true)}>
                    Invite Administrator
                </Button>
            </Stack>

            <Card sx={{ borderRadius: 6 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                                <TableCell>Name</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Active</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {admins.map((admin) => (
                                <TableRow key={admin.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(EVZONE.orange, 0.1), color: EVZONE.orange, fontSize: 14 }}>
                                                {admin.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600}>{admin.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{admin.email}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={admin.role}
                                            size="small"
                                            icon={<ShieldIcon size={12} />}
                                            sx={{
                                                bgcolor: admin.role === 'SuperAdmin' ? alpha('#7F39FB', 0.1) : alpha(EVZONE.orange, 0.1),
                                                color: admin.role === 'SuperAdmin' ? '#7F39FB' : EVZONE.orange,
                                                fontWeight: 700,
                                                borderColor: admin.role === 'SuperAdmin' ? alpha('#7F39FB', 0.2) : alpha(EVZONE.orange, 0.2),
                                                border: '1px solid'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={admin.status}
                                            size="small"
                                            color={admin.status === 'Active' ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{admin.lastActive}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleDelete(admin.id)} disabled={admin.role === 'SuperAdmin'}>
                                            <TrashIcon size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={openInvite} onClose={() => setOpenInvite(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle fontWeight={700}>Invite Administrator</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Email Address"
                            fullWidth
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><MailIcon size={18} /></InputAdornment> as any }}
                        />
                        <TextField
                            select
                            label="Role"
                            fullWidth
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                        >
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenInvite(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleInvite} sx={orangeContained}>Send Invite</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
