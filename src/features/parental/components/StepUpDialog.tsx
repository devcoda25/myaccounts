import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, TextField, MenuItem, InputAdornment, Box, alpha, Alert, IconButton } from '@mui/material';
import { getStyles } from '../styles';
import { useThemeStore } from "@/stores/themeStore";
import { api } from "@/utils/api";
import { ReAuthMode, MfaChannel } from "@/types";
import {
    Lock as LockIcon,
    Grip as KeypadIcon,
    MessageSquare as SmsIcon,
    Mail as MailIcon,
    Phone as WhatsAppIcon,
    Shield as ShieldIcon
} from 'lucide-react';

interface StepUpDialogProps {
    open: boolean;
    title: string;
    subtitle: string;
    onCancel: () => void;
    onVerified: () => void;
}

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;

export default function StepUpDialog({ open, title, subtitle, onCancel, onVerified }: StepUpDialogProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, dialogPaperSx } = getStyles(theme, mode);

    const [reauthMode, setReauthMode] = useState<ReAuthMode>("password");
    const [password, setPassword] = useState("");
    const [mfaChannel, setMfaChannel] = useState<MfaChannel>("Authenticator");
    const [otp, setOtp] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) {
            setPassword("");
            setOtp("");
            setError("");
            setCodeSent(false);
            setLoading(false);
        }
    }, [open]);

    useEffect(() => {
        if (cooldown > 0) {
            const t = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(t);
        }
    }, [cooldown]);

    const handleSendCode = async () => {
        setLoading(true);
        setError("");
        try {
            const channelMap: Record<MfaChannel, string> = {
                'Authenticator': 'authenticator',
                'SMS': 'sms',
                'WhatsApp': 'whatsapp',
                'Email': 'email'
            };
            await api('/auth/mfa/challenge/send', {
                method: 'POST',
                body: JSON.stringify({ channel: channelMap[mfaChannel] })
            });
            setCodeSent(true);
            setCooldown(60);
        } catch (err: any) {
            setError(err.message || "Failed to send code");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        try {
            if (reauthMode === "password") {
                await api('/auth/verify-password', {
                    method: 'POST',
                    body: JSON.stringify({ password })
                });
            } else {
                const channelMap: Record<MfaChannel, string> = {
                    'Authenticator': 'authenticator',
                    'SMS': 'sms',
                    'WhatsApp': 'whatsapp',
                    'Email': 'email'
                };
                await api('/auth/mfa/challenge/verify', {
                    method: 'POST',
                    body: JSON.stringify({ code: otp, channel: channelMap[mfaChannel] })
                });
            }
            onVerified();
        } catch (err: any) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={{ fontWeight: 950 }}>{title}</DialogTitle>
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>

                    {error && <Alert severity="error" sx={{ borderRadius: "4px" }}>{error}</Alert>}

                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Verification method"
                        value={reauthMode}
                        onChange={(e) => setReauthMode(e.target.value as ReAuthMode)}
                    >
                        <MenuItem value="password">Password</MenuItem>
                        <MenuItem value="mfa">Two-factor authentication (MFA)</MenuItem>
                    </TextField>

                    {reauthMode === "password" ? (
                        <TextField
                            fullWidth
                            type="password"
                            label="Your password"
                            placeholder="Enter password to confirm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LockIcon size={18} /></InputAdornment>
                            }}
                        />
                    ) : (
                        <Stack spacing={2}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="MFA Channel"
                                value={mfaChannel}
                                onChange={(e) => {
                                    setMfaChannel(e.target.value as MfaChannel);
                                    setCodeSent(false);
                                    setOtp("");
                                }}
                            >
                                <MenuItem value="Authenticator"><Stack direction="row" spacing={1}><KeypadIcon size={16} /> <Typography variant="body2">Authenticator App</Typography></Stack></MenuItem>
                                <MenuItem value="Email"><Stack direction="row" spacing={1}><MailIcon size={16} /> <Typography variant="body2">Email</Typography></Stack></MenuItem>
                                <MenuItem value="SMS"><Stack direction="row" spacing={1}><SmsIcon size={16} /> <Typography variant="body2">SMS</Typography></Stack></MenuItem>
                                <MenuItem value="WhatsApp"><Stack direction="row" spacing={1}><WhatsAppIcon size={16} /> <Typography variant="body2">WhatsApp</Typography></Stack></MenuItem>
                            </TextField>

                            {mfaChannel !== "Authenticator" && (
                                <Button
                                    size="small"
                                    onClick={handleSendCode}
                                    disabled={loading || cooldown > 0}
                                    variant="outlined"
                                    sx={{ alignSelf: 'flex-start', ...evOrangeOutlinedSx }}
                                >
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : codeSent ? "Resend code" : "Send code"}
                                </Button>
                            )}

                            <TextField
                                fullWidth
                                label="Verification code"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><ShieldIcon size={18} /></InputAdornment>
                                }}
                            />
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    sx={evOrangeContainedSx}
                    onClick={handleConfirm}
                    disabled={loading || (reauthMode === "password" ? !password : !otp)}
                >
                    {loading ? "Verifying..." : "Confirm"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
