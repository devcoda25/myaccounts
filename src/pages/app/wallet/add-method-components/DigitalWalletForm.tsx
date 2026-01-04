import React from "react";
import { Box, Stack, Typography, Button, Alert } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { OpenExternalIcon } from "./Icons";
import { getProviderIcon } from "../../../../assets/paymentIcons";

interface DigitalWalletFormProps {
    providerId: string;
    providerLabel: string;
    onConnect: () => void;
}

const EVZONE_ORANGE = "#f77f00";

export default function DigitalWalletForm({ providerId, providerLabel, onConnect }: DigitalWalletFormProps) {
    const theme = useTheme();

    const orangeContained = {
        backgroundColor: EVZONE_ORANGE,
        color: "#FFFFFF",
        "&:hover": { backgroundColor: alpha(EVZONE_ORANGE, 0.92), color: "#FFFFFF" },
    } as const;

    return (
        <Box sx={{ borderRadius: 18, border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`, backgroundColor: alpha(theme.palette.background.paper, 0.45), p: 2 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
                <Box sx={{ fontSize: 48, color: theme.palette.text.secondary }}>
                    {getProviderIcon(providerId, 48)}
                </Box>

                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Connect {providerLabel}</Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        You will be redirected to {providerLabel} to authorize the connection.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    size="large"
                    sx={orangeContained}
                    startIcon={<OpenExternalIcon size={18} />}
                    onClick={onConnect}
                    fullWidth
                    style={{ maxWidth: 300 }}
                >
                    Connect {providerLabel}
                </Button>

                <Alert severity="info" sx={{ width: '100%' }}>
                    This is a simulation. In production, this would open a popup or redirect you.
                </Alert>
            </Stack>
        </Box>
    );
}
