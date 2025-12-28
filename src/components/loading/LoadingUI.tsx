import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

interface LoadingUIProps {
    message?: string;
}

export default function LoadingUI({ message = "Loading..." }: LoadingUIProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                bgcolor: "background.default",
                gap: 2,
            }}
        >
            <CircularProgress
                size={40}
                thickness={4}
                sx={{
                    color: theme.palette.secondary.main, // EVzone Orange
                }}
            />
            <Typography
                variant="body1"
                sx={{
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                }}
            >
                {message}
            </Typography>
        </Box>
    );
}
