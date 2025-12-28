import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "evzone_myaccounts_theme_v2";

export const ThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            return (saved === 'light' || saved === 'dark') ? (saved as ThemeMode) : 'light';
        } catch {
            return 'light';
        }
    });

    const toggleMode = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        try {
            localStorage.setItem(THEME_KEY, mode);
        } catch {
            // ignore
        }
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProviderWrapper');
    }
    return context;
};
