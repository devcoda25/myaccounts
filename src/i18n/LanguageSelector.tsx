import React from 'react';
import i18n from 'i18next';
import { supportedLocales, isRTL, type LocaleCode } from './settings';

export const LanguageSelector: React.FC<{
    variant?: 'dropdown' | 'buttons' | 'minimal';
    onLanguageChange?: (language: string) => void;
    className?: string;
}> = ({ variant = 'dropdown', onLanguageChange, className = '' }) => {
    const language = i18n.language || 'en';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        onLanguageChange?.(newLang);
        // Update document direction for RTL languages
        const isRTL = newLang === 'ar';
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    const currentIsRTL = language === 'ar';
    const availableLanguages = supportedLocales.map(l => ({
        code: l.code,
        name: l.name,
        nativeName: l.nativeName,
    }));

    if (variant === 'buttons') {
        return (
            <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label="Language selector">
                {availableLanguages.slice(0, 4).map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${language === lang.code
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        aria-pressed={language === lang.code}
                        aria-label={`Switch to ${lang.name}`}
                    >
                        {supportedLocales.find(l => l.code === lang.code)?.flag} {lang.nativeName}
                    </button>
                ))}
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <select
                value={language}
                onChange={handleChange}
                className={`text-sm bg-transparent border-0 p-0 focus:ring-0 ${className}`}
                dir={currentIsRTL ? 'rtl' : 'ltr'}
                aria-label="Select language"
            >
                {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {supportedLocales.find(l => l.code === lang.code)?.flag} {lang.name}
                    </option>
                ))}
            </select>
        );
    }

    // Default: dropdown variant
    return (
        <div className={`relative ${className}`}>
            <label htmlFor="language-select" className="sr-only">
                Select Language
            </label>
            <select
                id="language-select"
                value={language}
                onChange={handleChange}
                className={`appearance-none w-full px-3 py-2 pr-8 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${currentIsRTL ? 'text-right' : 'text-left'
                    }`}
                dir={currentIsRTL ? 'rtl' : 'ltr'}
                aria-label="Select language"
            >
                {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {supportedLocales.find(l => l.code === lang.code)?.flag} {lang.nativeName}
                    </option>
                ))}
            </select>
            <div
                className={`absolute inset-y-0 flex items-center pointer-events-none ${currentIsRTL ? 'left-0 pl-2' : 'right-0 pr-2'
                    }`}
            >
                <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={currentIsRTL
                            ? "M15 19l-7-7 7-7"
                            : "M9 5l7 7-7 7"
                        }
                    />
                </svg>
            </div>
        </div>
    );
};

export default LanguageSelector;
