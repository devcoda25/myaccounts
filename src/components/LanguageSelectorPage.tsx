import React from 'react';
import { useLanguage } from '../i18n';
import { supportedLocales, isRTL, type LocaleCode } from '../i18n/settings';

export const LanguageSelectorPage: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();

    const handleLanguageSelect = (code: string) => {
        setLanguage(code);
    };

    const currentLocale = supportedLocales.find(l => l.code === language);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('settings.language')}
            </h1>
            <p className="text-gray-600 mb-6">
                {t('settings.selectLanguage')}
            </p>

            {/* Current selection */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{currentLocale?.flag}</span>
                    <div>
                        <p className="font-medium text-primary-900">
                            {currentLocale?.nativeName}
                        </p>
                        <p className="text-sm text-primary-700">
                            {currentLocale?.name}
                        </p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                        {t('common.status.active')}
                    </span>
                </div>
            </div>

            {/* Language grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {supportedLocales.map((locale) => (
                    <button
                        key={locale.code}
                        onClick={() => handleLanguageSelect(locale.code)}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${language === locale.code
                                ? 'border-primary-500 bg-primary-50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        aria-pressed={language === locale.code}
                    >
                        <span className="text-2xl">{locale.flag}</span>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">
                                {locale.nativeName}
                            </p>
                            <p className="text-sm text-gray-500">
                                {locale.name}
                            </p>
                        </div>
                        {language === locale.code && (
                            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {locale.dir === 'rtl' && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                RTL
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* RTL notice */}
            {currentLocale?.dir === 'rtl' && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium text-amber-800">
                                RTL Mode Active
                            </p>
                            <p className="text-sm text-amber-700 mt-1">
                                Arabic is a right-to-left language. The interface will appear mirrored
                                with text and elements flowing from right to left.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelectorPage;
