import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, useTheme } from "@mui/material";

export const ProfileHeader = () => {
    const theme = useTheme();

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>My Profile</Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                Manage your personal details and contact preferences.
            </Typography>
        </Box>
    );
};
