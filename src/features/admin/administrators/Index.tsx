import React, { useState } from 'react';
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

const MOCK_ADMINS: AdminMember[] = [
    { id: '1', name: 'System Admin', email: 'admin@evzone.com', role: 'SuperAdmin', lastActive: '2 mins ago', status: 'Active' },
    { id: '2', name: 'Staff Member', email: 'staff@evzone.com', role: 'Admin', lastActive: '1 day ago', status: 'Active' },
    { id: '3', name: 'New Guy', email: 'new.guy@evzone.com', role: 'Admin', lastActive: '-', status: 'Invited' },
];

export default function Administrators() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [admins, setAdmins] = useState(MOCK_ADMINS);
    const [openInvite, setOpenInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<AdminRole>('Admin');

    const handleInvite = () => {
        const newAdmin: AdminMember = {
            id: String(Date.now()),
            name: inviteEmail.split('@')[0], // Mock name
            email: inviteEmail,
            role: inviteRole,
            lastActive: '-',
            status: 'Invited'
        };
        setAdmins([...admins, newAdmin]);
        setOpenInvite(false);
        setInviteEmail('');
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to remove this admin?")) {
            setAdmins(admins.filter(a => a.id !== id));
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
