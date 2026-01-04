import React, { useState } from 'react';
import { Box, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Alert, useTheme } from '@mui/material';
import { Link as LinkIcon, Shield as ShieldIcon } from 'lucide-react';
import { useThemeStore } from "../../../../../stores/themeStore";
import { getStyles } from '../../styles';
import { makeInviteCode } from '../../utils';

interface LinkChildDialogProps {
    open: boolean;
    setOpen: (o: boolean) => void;
    // If we want to move logic here, we can, but for refactoring, we keep logic in parent or duplicate simple logic.
    // The parent used `linkCode`, `setLinkCode`.
    // I will make the component handle the code input state internally if possible, but the parent "submitLink" uses it.
    // So I need to pass `linkCode` and `setLinkCode` or `onSubmit(code)`.
    // Refactoring to `onSubmit` is better.
    onSubmit: (code: string) => void;
}

export default function LinkChildDialog({ open, setOpen, onSubmit }: LinkChildDialogProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, dialogPaperSx } = getStyles(theme, mode);
    const [linkCode, setLinkCode] = useState("");

    const handleSubmit = () => {
        onSubmit(linkCode);
        setLinkCode(""); // Reset?
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={{ fontWeight: 950 }}>Link child account</DialogTitle>
            <DialogContent>
                <Stack spacing={1.2}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Ask the child to generate an invite code in their module account settings.
                    </Typography>
                    <TextField
                        value={linkCode}
                        onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                        label="Invite code"
                        placeholder={makeInviteCode()}
                        fullWidth
                        InputProps={{ startAdornment: (<InputAdornment position="start"><LinkIcon size={18} /></InputAdornment>) }}
                    />
                    <Alert severity="info" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                        Linking enables parental controls and supervision.
                    </Alert>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button variant="contained" sx={evOrangeContainedSx} onClick={handleSubmit}>
                    Link
                </Button>
            </DialogActions>
        </Dialog>
    );
}
