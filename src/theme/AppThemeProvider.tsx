import React, { useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline, alpha } from '@mui/material';
import { ThemeProviderWrapper, useThemeContext } from './ThemeContext';
import { EVZONE } from './evzone';

const AppTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { mode } = useThemeContext();

    const theme = useMemo(() => {
        const isDark = mode === 'dark';
        const bg = isDark ? "#07110F" : "#F4FFFB";
        const paper = isDark ? "#0B1A17" : "#FFFFFF";
        const textPrimary = isDark ? "#E9FFF7" : "#0B1A17";
        const textSecondary = isDark ? alpha("#E9FFF7", 0.74) : alpha("#0B1A17", 0.70);

        return createTheme({
            palette: {
                mode,
                primary: { main: EVZONE.green },
                secondary: { main: EVZONE.orange },
                background: { default: bg, paper },
                text: { primary: textPrimary, secondary: textSecondary },
                divider: isDark ? alpha("#E9FFF7", 0.12) : alpha("#0B1A17", 0.10),
            },
            shape: { borderRadius: 1 }, // 4px essentially (1 * 4)
            typography: {
                fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
                h5: { fontWeight: 950, letterSpacing: -0.5 },
                h6: { fontWeight: 900, letterSpacing: -0.28 },
                button: { fontWeight: 900, textTransform: "none" },
            },
            components: {
                MuiCard: {
                    styleOverrides: {
                        root: {
                            borderRadius: "4px",
                            border: `1px solid ${isDark ? alpha("#E9FFF7", 0.10) : alpha("#0B1A17", 0.10)}`,
                            backgroundImage: "radial-gradient(900px 420px at 10% 0%, rgba(3,205,140,0.12), transparent 60%), radial-gradient(900px 420px at 90% 0%, rgba(3,205,140,0.10), transparent 55%)",
                        },
                    },
                },
                MuiButton: {
                    styleOverrides: {
                        root: { borderRadius: "4px", textTransform: "none", boxShadow: "none" },
                    },
                },
                MuiAlert: {
                    styleOverrides: {
                        root: { borderRadius: "4px" }
                    }
                },
                MuiPaper: {
                    styleOverrides: {
                        root: { borderRadius: "4px" }
                    }
                }
            },
        });
    }, [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ThemeProviderWrapper>
            <AppTheme>
                {children}
            </AppTheme>
        </ThemeProviderWrapper>
    );
};
