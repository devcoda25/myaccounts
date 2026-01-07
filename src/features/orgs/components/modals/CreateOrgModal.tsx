import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Typography,
    TextField,
    MenuItem,
    Alert,
    Button,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

interface CreateOrgModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string, type: string, country: string) => void;
}

const EVZONE = {
    green: "#03cd8c",
    orange: "#f77f00",
} as const;

export default function CreateOrgModal({ open, onClose, onCreate }: CreateOrgModalProps) {
    const theme = useTheme();
    const [createName, setCreateName] = React.useState("");
    const [createType, setCreateType] = React.useState("Company");
    const [createCountry, setCreateCountry] = React.useState("Uganda");

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

    const handleCreate = () => {
        onCreate(createName, createType, createCountry);
        setCreateName("");
        setCreateType("Company");
        setCreateCountry("Uganda");
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
            <DialogTitle sx={{ fontWeight: 950 }}>Create new organization</DialogTitle>
            <DialogContent>
                <Stack spacing={1.2}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Create an organization to manage teams and billing.
                    </Typography>
                    <TextField
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        label="Organization name"
                        fullWidth
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        select
                        label="Organization type"
                        value={createType}
                        onChange={(e) => setCreateType(e.target.value)}
                        fullWidth
                    >
                        {["Company", "School", "Fleet", "Government", "Other"].map((t) => (
                            <MenuItem key={t} value={t}>
                                {t}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        value={createCountry}
                        onChange={(e) => setCreateCountry(e.target.value)}
                        label="Country/region"
                        fullWidth
                    />
                    <Alert severity="info">You can invite members after creation.</Alert>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="secondary" sx={evOrangeContainedSx} onClick={handleCreate}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
