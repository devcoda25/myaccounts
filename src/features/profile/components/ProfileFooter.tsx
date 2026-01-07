import React from "react";
import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { EVZONE } from "@/theme/evzone";
import { useThemeStore } from "@/stores/themeStore";

export const ProfileFooter = () => {
    const theme = useTheme();
    const { mode } = useThemeStore();

    const orangeTextSx = {
        color: EVZONE.orange,
        fontWeight: 900,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, mode === "dark" ? 0.14 : 0.10) },
    } as const;

    return (
        <Box className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
            <Box
                sx={{
                    borderTop: `1px solid ${theme.palette.divider}`,
                    pt: 3,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    © 2026 EVzone. All rights reserved.
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button
                        size="small"
                        variant="text"
                        sx={orangeTextSx}
                        onClick={() => window.open('/legal/terms', '_blank')}
                    >
                        Terms
                    </Button>
                    <Button
                        size="small"
                        variant="text"
                        sx={orangeTextSx}
                        onClick={() => window.open('/legal/privacy', '_blank')}
                    >
                        Privacy
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};
