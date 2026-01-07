import React, { useState, useEffect } from 'react';
import { Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Slider, Alert, useTheme } from '@mui/material';
import { Shield as ShieldIcon } from 'lucide-react';
import { useThemeStore } from "../../../../stores/themeStore";
import { getStyles } from '../../styles';
import { Place } from "../../types";

interface PlaceEditorDialogProps {
    open: boolean;
    setOpen: (o: boolean) => void;
    target: "Home" | "School";
    currentPlace?: Place;
    onSave: (p: Place) => void;
}

export default function PlaceEditorDialog({ open, setOpen, target, currentPlace, onSave }: PlaceEditorDialogProps) {
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { evOrangeContainedSx, evOrangeOutlinedSx, dialogPaperSx } = getStyles(theme, mode);

    const [address, setAddress] = useState("");
    const [radius, setRadius] = useState(1);

    // Sync state when opening
    useEffect(() => {
        if (open && currentPlace) {
            setAddress(currentPlace.address);
            setRadius(currentPlace.radiusKm);
        } else if (open) {
            setAddress("");
            setRadius(1);
        }
    }, [open, currentPlace]);

    const handleSave = () => {
        onSave({ label: target, address, radiusKm: radius });
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={{ fontWeight: 950 }}>Set {target} geofence</DialogTitle>
            <DialogContent>
                <Stack spacing={1.2}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Enter a location label/address (demo) and radius.
                    </Typography>
                    <TextField value={address} onChange={(e) => setAddress(e.target.value)} label={`${target} address`} fullWidth />
                    <Typography sx={{ fontWeight: 950 }}>Radius (km)</Typography>
                    <Slider value={radius} min={1} max={10} step={1} valueLabelDisplay="auto" onChange={(_, v) => setRadius(Array.isArray(v) ? v[0] : v)} />
                    <Alert severity="info" icon={<ShieldIcon size={18} />} sx={{ borderRadius: "4px" }}>
                        In production, geofence radius uses GPS accuracy rules.
                    </Alert>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button variant="outlined" sx={evOrangeOutlinedSx} onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button variant="contained" sx={evOrangeContainedSx} onClick={handleSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
