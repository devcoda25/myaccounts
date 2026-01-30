import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, useTheme } from '@mui/material';
import { useThemeStore } from "../../../../stores/themeStore";
import { Zap as ZapIcon } from 'lucide-react';
import { getStyles } from '../../styles';

interface AddStationDialogProps {
    open: boolean;
    setOpen: (o: boolean) => void;
    onSubmit: (name: string) => void;
}

export default function AddStationDialog({ open, setOpen, onSubmit }: AddStationDialogProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, dialogPaperSx } = getStyles(theme, mode);
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit(name);
        setName("");
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={{ fontWeight: 950 }}>Add charging station</DialogTitle>
            <DialogContent>
                <Stack spacing={1.2}>
                    <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        label="Station Name"
                        placeholder="e.g. Home Charger, Office Point"
                        fullWidth
                        autoFocus
                        InputProps={{ startAdornment: (<InputAdornment position="start"><ZapIcon size={18} /></InputAdornment>) }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button variant="contained" sx={evOrangeContainedSx} onClick={handleSubmit} disabled={!name.trim()}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}
