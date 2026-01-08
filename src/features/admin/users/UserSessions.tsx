import React, { useEffect, useState } from 'react';
import { formatUserId } from "@/utils/format";
import { Box, Typography, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Monitor as MonitorIcon, Smartphone as PhoneIcon, Globe as GlobeIcon, Clock as ClockIcon } from 'lucide-react';
import { api } from "@/utils/api";
import { BackendUser } from '@/types';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Extend BackendUser locally to include full session details as returned by Prisma
interface Session {
    id: string;
    createdAt: string;
    lastUsedAt: string;
    expiresAt: string;
    deviceInfo?: {
        ip?: string;
        userAgent?: string;
        browser?: string;
        os?: string;
        device?: string;
    };
}

interface ExtendedBackendUser extends Omit<BackendUser, 'sessions'> {
    sessions?: Session[];
}

function timeAgo(ts?: string | number) {
    if (!ts) return "Never";
    const date = new Date(ts);
    const diff = Date.now() - date.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const d = Math.floor(hr / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
}

function parseDevice(userAgent?: string) {
    if (!userAgent) return { type: 'Unknown', name: 'Unknown Device' };

    // Simple heuristic
    const isMobile = /mobile|iphone|android/i.test(userAgent);
    let name = 'Unknown';
    if (userAgent.includes('Chrome')) name = 'Chrome';
    else if (userAgent.includes('Firefox')) name = 'Firefox';
    else if (userAgent.includes('Safari')) name = 'Safari';
    else if (userAgent.includes('Edge')) name = 'Edge';

    if (userAgent.includes('Windows')) name += ' on Windows';
    else if (userAgent.includes('Mac')) name += ' on Mac';
    else if (userAgent.includes('Linux')) name += ' on Linux';
    else if (userAgent.includes('Android')) name += ' on Android';
    else if (userAgent.includes('iPhone')) name += ' on iPhone';

    return {
        type: isMobile ? 'Mobile' : 'Desktop',
        name
    };
}

export default function UserSessions() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        // Fetch full profile which includes sessions
        api<ExtendedBackendUser>(`/users/${userId}`)
            .then((u) => {
                const sorted = (u.sessions || []).sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime());
                setSessions(sorted);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load user sessions.");
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const isActive = (expiresAt: string) => {
        return new Date(expiresAt).getTime() > Date.now();
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowLeftIcon size={18} />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    Back
                </Button>
                <Typography variant="h4" fontWeight={800}>
                    User Sessions
                </Typography>
                <Typography color="text.secondary">
                    Manage active sessions for user ID: {formatUserId(userId || '')}
                </Typography>
            </Box>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                {sessions.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            No sessions found for this user in the history.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                <TableRow>
                                    <TableCell>Device / IP</TableCell>
                                    <TableCell>Last Active</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Expires In</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sessions.map((session) => {
                                    // Handle both object and string format for deviceInfo if legacy data exists
                                    // But schema says Json?
                                    // SessionRepository saves it as passed.
                                    // Assuming backend serialization keeps it as object.

                                    // If deviceInfo is inside session directly as fields or nested
                                    const devInfo = session.deviceInfo || {};
                                    const userAgent = (devInfo as any).userAgent || (typeof devInfo === 'string' ? devInfo : '');
                                    const ip = (devInfo as any).ip || (devInfo as any).ipAddress || 'Unknown IP';

                                    const { type, name } = parseDevice(userAgent);
                                    const active = isActive(session.expiresAt);
                                    const statusColor = active ? 'success' : 'default';

                                    return (
                                        <TableRow key={session.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Box sx={{ color: 'text.secondary' }}>
                                                        {type === 'Mobile' ? <PhoneIcon size={20} /> : <MonitorIcon size={20} />}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>{name}</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <GlobeIcon size={12} /> {ip}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{timeAgo(session.lastUsedAt)}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(session.lastUsedAt).toLocaleTimeString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{new Date(session.createdAt).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(session.createdAt).toLocaleTimeString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={active ? "Active" : "Expired"}
                                                    size="small"
                                                    color={statusColor as any}
                                                    variant={active ? "filled" : "outlined"}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {active ? (
                                                    <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                                                        <ClockIcon size={14} />
                                                        <Typography variant="body2">
                                                            {timeAgo(new Date(session.expiresAt).getTime() + (Date.now() - new Date(session.expiresAt).getTime()) * 2).replace('ago', '')}
                                                            {/* Approximate remaining time by reversing timeAgo logic or just simple math */}
                                                            {Math.ceil((new Date(session.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">Expired</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
}
