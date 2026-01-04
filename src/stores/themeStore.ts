import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
    toggleMode: () => void;
    setMode: (mode: ThemeMode) => void;
}

const THEME_KEY = "evzone_myaccounts_theme_v2";

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'light',
            toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
            setMode: (mode: ThemeMode) => set({ mode }),
        }),
        {
            name: THEME_KEY,
        }
    )
);
