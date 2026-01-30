import React from 'react';
import { useTranslation } from "react-i18next";
import { Box, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Alert, useTheme, alpha } from '@mui/material';
import { Shield as ShieldIcon } from 'lucide-react';
import { useThemeStore } from "@/stores/themeStore";
import { GuardianContext } from "../../types";
import { getStyles } from '../../styles';

interface ContextSwitcherProps {
    open: boolean;
    setOpen: (o: boolean) => void;
    contexts: GuardianContext[];
    activeContextId: string;
    setActiveContextId: (id: string) => void;
    setSnack: (s: any) => void;
}

export default function ContextSwitcher({ open, setOpen, contexts, activeContextId, setActiveContextId, setSnack }: ContextSwitcherProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, dialogPaperSx, EVZONE } = getStyles(theme, mode);

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={{ fontWeight: 950 }}>Switch context</DialogTitle>
            <DialogContent>
                <Stack spacing={1.2}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Choose which guardian profile context you are managing.
                    </Typography>
                    <Divider />
                    <Stack spacing={1.0}>
                        {contexts.map((c) => {
                            const active = c.id === activeContextId;
                            return (
                                <Box key={c.id} sx={{ borderRadius: "4px", border: `1px solid ${alpha(theme.palette.text.primary, 0.10)} `, backgroundColor: active ? alpha(EVZONE.orange, 0.10) : alpha(theme.palette.background.paper, 0.45), p: 1.2 }}>
                                    <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography sx={{ fontWeight: 950 }}>{c.label}</Typography>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{c.subtitle}</Typography>
                                        </Box>
                                        <Button
                                            variant={active ? "contained" : "outlined"}
                                            sx={active ? evOrangeContainedSx : evOrangeOutlinedSx}
                                            onClick={() => {
                                                setActiveContextId(c.id);
                                                setOpen(false);
                                                setSnack({ open: true, severity: "success", msg: `Context switched to ${c.label}.` });
                                            }}
                                        >
                                            {active ? "Active" : "Use"}
                                        </Button>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                    <Alert severity="info" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                        Context affects which household and children you can manage.
                    </Alert>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setOpen(false)}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
