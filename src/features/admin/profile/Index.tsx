import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Avatar,
    Button,
    Grid,
    Divider,
    Tabs,
    Tab,
    TextField,
    Switch,
    FormControlLabel,
    Chip,
    IconButton,
    InputAdornment,
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Shield,
    Key,
    Smartphone,
    History,
    Bell,
    Moon,
    Globe,
    Camera,
    CheckCircle,
    AlertTriangle,
    LogOut,
    Eye,
    EyeOff
} from 'lucide-react';

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    if (value !== index) return null;
    return (
        <Box role="tabpanel" hidden={value !== index} {...other} sx={{ py: 3 }}>
            {children}
        </Box>
    );
}

export default function AdminProfile() {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const isDark = theme.palette.mode === 'dark';

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box>
            {/* Header / Cover */}
            <Paper sx={{
                borderRadius: '24px',
                overflow: 'hidden',
                mb: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.divider}`
            }}>
                <Box sx={{
                    height: 200,
                    background: `linear-gradient(135deg, ${alpha(EVZONE.green, 0.8)} 0%, ${alpha('#0B4F3F', 0.9)} 100%)`,
                    position: 'relative'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        bottom: -50,
                        left: 40,
                        p: 1,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: '50%'
                    }}>
                        <Avatar sx={{
                            width: 100,
                            height: 100,
                            border: `4px solid ${theme.palette.background.paper}`,
                            bgcolor: alpha(EVZONE.green, 0.2),
                            color: EVZONE.green,
                            fontSize: '2.5rem',
                            fontWeight: 800
                        }}>
                            A
                        </Avatar>
                        <IconButton
                            size="small"
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                bgcolor: theme.palette.background.paper,
                                boxShadow: theme.shadows[2],
                                '&:hover': { bgcolor: theme.palette.background.default }
                            }}
                        >
                            <Camera size={16} />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ pt: 8, px: 5, pb: 4 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box>
                            <Typography variant="h4" fontWeight={800} gutterBottom>Admin User</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label="Super Admin" size="small" sx={{ bgcolor: alpha(EVZONE.green, 0.1), color: EVZONE.green, fontWeight: 700 }} />
                                <Typography variant="body2" color="text.secondary">admin@evzone.com</Typography>
                            </Stack>
                        </Box>
                        <Box>
                            <Button variant="outlined" color="error" startIcon={<LogOut size={16} />} sx={{ borderRadius: '10px' }}>
                                Sign out all sessions
                            </Button>
                        </Box>
                    </Stack>

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            mt: 4,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                minHeight: 48,
                                px: 0,
                                mr: 4
                            }
                        }}
                    >
                        <Tab icon={<Shield size={18} />} iconPosition="start" label="Security" />
                        <Tab icon={<Bell size={18} />} iconPosition="start" label="Notifications" />
                        <Tab icon={<History size={18} />} iconPosition="start" label="Activity Log" />
                    </Tabs>
                </Box>
            </Paper>

            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 4, borderRadius: '20px', mb: 3, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Ensure your account is using a long, random password to stay secure.
                            </Typography>

                            <Stack spacing={3} maxWidth={500}>
                                <TextField
                                    label="Current Password"
                                    type="password"
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{ sx: { borderRadius: '12px' } }}
                                />
                                <TextField
                                    label="New Password"
                                    type={showPassword ? "text" : "password"}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        sx: { borderRadius: '12px' },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Button variant="contained" size="large" sx={{
                                    borderRadius: '12px',
                                    bgcolor: theme.palette.text.primary,
                                    color: theme.palette.background.paper,
                                    width: 'fit-content'
                                }}>
                                    Update Password
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper sx={{ p: 4, borderRadius: '20px', border: `1px solid ${theme.palette.divider}` }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>2-Step Verification</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Add an extra layer of security to your account.
                                    </Typography>
                                </Box>
                                <Switch defaultChecked />
                            </Stack>
                            <Stack spacing={2} sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.action.hover, 0.05), borderRadius: '12px' }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ p: 1, bgcolor: theme.palette.background.paper, borderRadius: '8px', boxShadow: theme.shadows[1] }}>
                                            <Smartphone size={20} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>Authenticator App</Typography>
                                            <Typography variant="caption" color="text.secondary">Google Authenticator</Typography>
                                        </Box>
                                    </Stack>
                                    <Chip label="Configured" size="small" color="success" variant="outlined" icon={<CheckCircle size={14} />} />
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 4, borderRadius: '20px', border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Active Sessions</Typography>
                            <Stack spacing={3} sx={{ mt: 3 }}>
                                <Stack direction="row" spacing={2}>
                                    <Smartphone size={24} color={theme.palette.text.secondary} />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600}>Chrome on Windows</Typography>
                                        <Typography variant="caption" color="text.secondary">192.168.1.1 • Current Session</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={2}>
                                    <Smartphone size={24} color={theme.palette.text.secondary} />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600}>Safari on iPhone 15</Typography>
                                        <Typography variant="caption" color="text.secondary">203.111.x.x • 2 hours ago</Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Paper sx={{ p: 4, borderRadius: '20px', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Email Notifications</Typography>

                    <Stack spacing={2}>
                        {['Security Alerts', 'New User Registrations', 'Weekly System Reports', 'Wallet Disputes'].map((item) => (
                            <Stack key={item} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
                                <Typography variant="body1">{item}</Typography>
                                <Switch defaultChecked />
                            </Stack>
                        ))}
                    </Stack>
                </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Paper sx={{ borderRadius: '20px', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                            Recent Activity for admin@evzone.com
                        </Typography>
                    </Box>
                    <Stack>
                        {[
                            { action: "Updated security settings", time: "2 mins ago", icon: <Shield size={16} /> },
                            { action: "Accessed User List", time: "15 mins ago", icon: <Eye size={16} /> },
                            { action: "Logged in", time: "1 hour ago", icon: <Key size={16} /> },
                        ].map((log, i) => (
                            <Box key={i} sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box sx={{ p: 1, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                        {log.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600}>{log.action}</Typography>
                                        <Typography variant="caption" color="text.secondary">{log.time}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Paper>
            </TabPanel>
        </Box>
    );
}
