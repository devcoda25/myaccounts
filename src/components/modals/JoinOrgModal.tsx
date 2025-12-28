import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Typography,
    TextField,
    Alert,
    Button,
    InputAdornment,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

// Simple TicketIcon inline since we don't have a shared icons file yet, 
// or I can import Lucide if available. Orgs.tsx used inline SVG.
// Using Lucide-react which is installed.
import { Ticket } from "lucide-react";

interface JoinOrgModalProps {
    open: boolean;
    onClose: () => void;
    onJoin: (code: string) => void;
}

const EVZONE = {
    green: "#03cd8c",
    orange: "#f77f00",
} as const;

export default function JoinOrgModal({ open, onClose, onJoin }: JoinOrgModalProps) {
    const theme = useTheme();
    const [inviteCode, setInviteCode] = React.useState("");

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

    const handleJoin = () => {
        onJoin(inviteCode);
        setInviteCode("");
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 2, // No roundness
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundImage: "none",
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 950 }}>Join via invite code</DialogTitle>
            <DialogContent>
                <Stack spacing={1.2}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Enter the invite code you received.
                    </Typography>
                    <TextField
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        label="Invite code"
                        placeholder="EVZ-INVITE-123"
                        fullWidth
                        sx={{ mt: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Ticket size={18} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Alert severity="info">Demo: Any code with 6+ characters will join a sample org.</Alert>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={handleJoin}>
                    Join
                </Button>
            </DialogActions>
        </Dialog>
    );
}
