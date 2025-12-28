import React, { useState } from 'react';
import { Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, FormControlLabel, Switch, Alert, useTheme } from '@mui/material';
import { Shield as ShieldIcon } from 'lucide-react';
import { useThemeContext } from '../../../../../theme/ThemeContext';
import { getStyles } from '../../styles';
import { HouseholdRole, Channel } from '../../types';

interface InviteHouseholdMemberDialogProps {
    open: boolean;
    setOpen: (o: boolean) => void;
    role: HouseholdRole;
    onSend: (name: string, email: string, phone: string, channels: Record<Channel, boolean>) => void;
}

export default function InviteHouseholdMemberDialog({ open, setOpen, role, onSend }: InviteHouseholdMemberDialogProps) {
    const theme = useTheme();
    const { mode } = useThemeContext();
    const { evOrangeContainedSx, evOrangeOutlinedSx, dialogPaperSx } = getStyles(theme, mode);

    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [invitePhone, setInvitePhone] = useState("");
    const [inviteChannels, setInviteChannels] = useState<Record<Channel, boolean>>({ Email: true, SMS: true, WhatsApp: false });

    const handleSend = () => {
        onSend(inviteName, inviteEmail, invitePhone, inviteChannels);
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={{ fontWeight: 950 }}>{role === "Co-guardian" ? "Invite co-guardian" : "Add emergency contact"}</DialogTitle>
            <DialogContent>
                <Stack spacing={1.2}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {role === "Co-guardian"
                            ? "Co-guardians can approve requests and view safety alerts."
                            : "Emergency contacts receive urgent alerts only."}
                    </Typography>

                    <TextField value={inviteName} onChange={(e) => setInviteName(e.target.value)} label="Full name" fullWidth />
                    <TextField value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} label="Email (optional)" fullWidth />
                    <TextField value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)} label="Phone (optional)" fullWidth />

                    <Divider />

                    <Typography sx={{ fontWeight: 950 }}>Notification channels</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                        <FormControlLabel
                            control={<Switch checked={inviteChannels.Email} onChange={(e) => setInviteChannels((p) => ({ ...p, Email: e.target.checked }))} />}
                            label={<Typography sx={{ fontWeight: 900 }}>Email</Typography>}
                        />
                        <FormControlLabel
                            control={<Switch checked={inviteChannels.SMS} onChange={(e) => setInviteChannels((p) => ({ ...p, SMS: e.target.checked }))} />}
                            label={<Typography sx={{ fontWeight: 900 }}>SMS</Typography>}
                        />
                        <FormControlLabel
                            control={<Switch checked={inviteChannels.WhatsApp} onChange={(e) => setInviteChannels((p) => ({ ...p, WhatsApp: e.target.checked }))} />}
                            label={<Typography sx={{ fontWeight: 900 }}>WhatsApp</Typography>}
                        />
                    </Stack>

                    <Alert severity="info" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                        This action is step-up protected.
                    </Alert>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button variant="contained" sx={evOrangeContainedSx} onClick={handleSend}>
                    Send
                </Button>
            </DialogActions>
        </Dialog>
    );
}
