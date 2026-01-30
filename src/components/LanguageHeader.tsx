import React from 'react';
import { LanguageSelector, useLanguage } from '../i18n';

interface HeaderProps {
    onMenuToggle?: () => void;
}

export const LanguageHeader: React.FC<HeaderProps> = ({ onMenuToggle }) => {
    const { t } = useLanguage();

    return (
        <header className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                {/* Left side - Menu toggle and title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                        aria-label={t('navigation.menu')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {t('app.name')}
                    </h1>
                </div>

                {/* Right side - Language selector and actions */}
                <div className="flex items-center gap-4">
                    {/* Language Selector */}
                    <div className="w-40">
                        <LanguageSelector variant="dropdown" />
                    </div>

                    {/* Notifications */}
                    <button
                        className="p-2 rounded-full hover:bg-gray-100 relative"
                        aria-label={t('navigation.notifications')}
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                            U
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default LanguageHeader;
