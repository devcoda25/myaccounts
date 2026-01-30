import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, useTheme } from '@mui/material';
import { Shield as ShieldIcon } from 'lucide-react';
import { useThemeStore } from "../../../../stores/themeStore";
import { getStyles } from '../../styles';

interface CreateChildDialogProps {
    open: boolean;
    setOpen: (o: boolean) => void;
    onSubmit: (name: string, dob: string, school: string) => void;
}

export default function CreateChildDialog({ open, setOpen, onSubmit }: CreateChildDialogProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, dialogPaperSx } = getStyles(theme, mode);

    const [newChildName, setNewChildName] = useState("");
    const [newChildDob, setNewChildDob] = useState("");
    const [newChildSchool, setNewChildSchool] = useState("");

    const handleSubmit = () => {
        onSubmit(newChildName, newChildDob, newChildSchool);
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={{ fontWeight: 950 }}>Create supervised child</DialogTitle>
            <DialogContent>
                <Stack spacing={1.2}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        This creates a child account and sets you as the guardian.
                    </Typography>
                    <TextField value={newChildName} onChange={(e) => setNewChildName(e.target.value)} label="Child name" fullWidth />
                    <TextField value={newChildDob} onChange={(e) => setNewChildDob(e.target.value)} label="Date of birth" type="date" InputLabelProps={{ shrink: true }} fullWidth />
                    <TextField value={newChildSchool} onChange={(e) => setNewChildSchool(e.target.value)} label="School name" placeholder="EVzone School" fullWidth />
                    <Alert severity="warning" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                        Underage accounts should not have withdrawals or peer transfers.
                    </Alert>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button variant="contained" sx={evOrangeContainedSx} onClick={handleSubmit}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
