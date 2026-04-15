import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import type { LocaleCode } from './settings';
import {
    getDefaultLanguage,
    getSavedLanguage,
    saveLanguage,
    supportedLocales
} from './settings';

const DEFAULT_NS = 'common';

let i18nInitStarted = false;
function ensureI18nInitialized() {
    if (i18nInitStarted) return;
    i18nInitStarted = true;

    i18n
        .use(Backend)
        .use(initReactI18next)
        .init({
            lng: getDefaultLanguage(),
            fallbackLng: 'en',
            supportedLngs: supportedLocales.map(l => l.code),
            ns: [DEFAULT_NS],
            defaultNS: DEFAULT_NS,
            debug: import.meta.env.DEV,
            interpolation: {
                escapeValue: false,
            },
            backend: {
                // Vite serves `public/` at the site root.
                loadPath: '/locales/{{lng}}/{{ns}}.json',
            },
            react: {
                // Keep this disabled to avoid suspending the whole app on initial translation fetch.
                useSuspense: false,
            },
        });
}

// Ensure i18n is wired up before any components call `useTranslation()`
ensureI18nInitialized();

// Update document direction for RTL languages
const updateDirection = (language: string): void => {
    const locale = supportedLocales.find(l => l.code === language);
    const dir = locale?.dir || 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
};

// Create context
interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: typeof i18n.t;
    isRTL: boolean;
    availableLanguages: Array<{ code: string; name: string; nativeName: string }>;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<string>(() => {
        return getSavedLanguage() || getDefaultLanguage();
    });

    useEffect(() => {
        ensureI18nInitialized();
        i18n.changeLanguage(language);
        updateDirection(language);
    }, [language]);

    const setLanguage = useCallback((lang: string) => {
        setLanguageState(lang);
        i18n.changeLanguage(lang);
        if (supportedLocales.some(l => l.code === lang)) {
            saveLanguage(lang as LocaleCode);
        }
        updateDirection(lang);
    }, []);

    const availableLanguages = supportedLocales.map(l => ({
        code: l.code,
        name: l.name,
        nativeName: l.nativeName,
    }));

    const value = {
        language,
        setLanguage,
        t: i18n.t,
        isRTL: (supportedLocales.find(l => l.code === language)?.dir || 'ltr') === 'rtl',
        availableLanguages,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Hook for simple translations (for components that don't want full context)
export const useTranslation = () => {
    const { t, language, isRTL } = useLanguage();
    return { t, language, isRTL };
};

export default LanguageProvider;
