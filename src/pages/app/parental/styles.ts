import { alpha, Theme } from '@mui/material';

export const EVZONE = { green: "#03cd8c", orange: "#f77f00" };

export const getStyles = (theme: Theme, mode: 'light' | 'dark') => {

    const evOrangeContainedSx = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
        "&:active": { backgroundColor: alpha(EVZONE.orange, 0.86), color: "#FFFFFF" },
        borderRadius: "4px",
        textTransform: "none",
        fontWeight: 700
    } as const;

    const evOrangeOutlinedSx = {
        borderColor: alpha(EVZONE.orange, 0.65),
        color: EVZONE.orange,
        backgroundColor: alpha(theme.palette.background.paper, 0.20),
        "&:hover": { borderColor: EVZONE.orange, backgroundColor: EVZONE.orange, color: "#FFFFFF" },
        borderRadius: "4px",
        textTransform: "none",
        fontWeight: 700
    } as const;

    const cardSx = {
        borderRadius: "4px",
        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.45),
        backdropFilter: 'blur(20px)',
        boxShadow: mode === 'dark' ? 'none' : '0 4px 20px -4px rgba(0,0,0,0.05)'
    } as const;

    // Wallet Match: 20px for dialogs
    const dialogPaperSx = {
        borderRadius: "4px"
    };

    return { evOrangeContainedSx, evOrangeOutlinedSx, cardSx, dialogPaperSx, EVZONE };
};
