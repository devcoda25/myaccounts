import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Typography,
    Alert,
    Button,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

interface LeaveOrgModalProps {
    open: boolean;
    onClose: () => void;
    onLeave: () => void;
}

const EVZONE = {
    green: "#03cd8c",
    orange: "#f77f00",
} as const;

export default function LeaveOrgModal({ open, onClose, onLeave }: LeaveOrgModalProps) {
    const theme = useTheme();

    const evOrangeContainedSx = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.orange, 0.18)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
        "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
    } as const;

    const evOrangeOutlinedSx = {
        borderColor: alpha(EVZONE.orange, 0.65),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.20),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
    } as const;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 2, // No roundness
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundImage: "none",
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 950 }}>Leave organization</DialogTitle>
            <DialogContent>
                <Stack spacing={1.2}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        This will remove your access to the organization.
                    </Typography>
                    <Alert severity="warning">If you are an owner, you must transfer ownership first.</Alert>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={onLeave}>
                    Leave
                </Button>
            </DialogActions>
        </Dialog>
    );
}
