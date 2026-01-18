import React from 'react';
import { Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, useTheme } from '@mui/material';
import { getStyles } from '../styles';
import { useThemeStore } from "@/stores/themeStore";

interface StepUpDialogProps {
    open: boolean;
    title: string;
    subtitle: string;
    onCancel: () => void;
    onVerified: () => void;
}

export default function StepUpDialog({ open, title, subtitle, onCancel, onVerified }: StepUpDialogProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, dialogPaperSx } = getStyles(theme, mode);

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={{ fontWeight: 950 }}>{title}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>

                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="contained" sx={evOrangeContainedSx} onClick={onVerified}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}
