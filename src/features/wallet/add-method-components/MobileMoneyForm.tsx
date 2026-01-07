import React from "react";
import { Box, Stack, Typography, TextField, MenuItem, InputAdornment, Alert } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { PhoneIcon, ShieldCheckIcon } from "./Icons";

type MomoProvider = "MTN MoMo" | "Airtel Money" | "Africell";

interface MobileMoneyFormProps {
    provider: MomoProvider;
    setProvider: (p: MomoProvider) => void;
    phone: string;
    setPhone: (p: string) => void;
}

export default function MobileMoneyForm({ provider, setProvider, phone, setPhone }: MobileMoneyFormProps) {
    const theme = useTheme();

    return (
        <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 1.4 }}>
            <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 950 }}>Mobile money</Typography>
                <Box className="grid gap-3 md:grid-cols-2">
                    <TextField select label="Provider" value={provider} onChange={(e) => setProvider(e.target.value as MomoProvider)} fullWidth>
                        <MenuItem value="MTN MoMo">MTN MoMo</MenuItem>
                        <MenuItem value="Airtel Money">Airtel Money</MenuItem>
                        <MenuItem value="Africell">Africell</MenuItem>
                    </TextField>
                    <TextField
                        label="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PhoneIcon size={18} />
                                </InputAdornment>
                            ),
                        }}
                        helperText="Use the phone that will approve the payment request."
                    />
                </Box>
                <Alert severity="info" icon={<ShieldCheckIcon size={18} />}>
                    For your security, mobile money may require an OTP or an approval on your phone.
                </Alert>
            </Stack>
        </Box>
    );
}
