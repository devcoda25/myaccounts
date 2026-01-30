import React from 'react';
import { useLanguage } from './LanguageProvider';
import { getDateFormatByLocale, type LocaleCode } from './settings';

interface LocaleDateProps {
    date: Date | string | number;
    format?: 'short' | 'medium' | 'long' | 'full';
    className?: string;
}

export const LocaleDate: React.FC<LocaleDateProps> = ({
    date,
    format = 'medium',
    className = ''
}) => {
    const { language } = useLanguage();
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    const formatDate = (): string => {
        const locale = language as LocaleCode;
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: format === 'short' ? 'numeric' : format === 'medium' ? 'short' : 'long',
            day: 'numeric',
        };

        if (format === 'full') {
            options.weekday = 'long';
        }

        try {
            return new Intl.DateTimeFormat(locale, options).format(dateObj);
        } catch {
            return new Intl.DateTimeFormat('en', options).format(dateObj);
        }
    };

    return (
        <time dateTime={dateObj.toISOString()} className={className}>
            {formatDate()}
        </time>
    );
};

interface LocaleTimeProps {
    date: Date | string | number;
    format?: 'short' | 'medium';
    className?: string;
}

export const LocaleTime: React.FC<LocaleTimeProps> = ({
    date,
    format = 'short',
    className = ''
}) => {
    const { language } = useLanguage();
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    const formatTime = (): string => {
        const locale = language as LocaleCode;
        const options: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: format === 'medium' ? '2-digit' : 'numeric',
            hour12: true,
        };

        try {
            return new Intl.DateTimeFormat(locale, options).format(dateObj);
        } catch {
            return new Intl.DateTimeFormat('en', options).format(dateObj);
        }
    };

    return (
        <time dateTime={dateObj.toISOString()} className={className}>
            {formatTime()}
        </time>
    );
};

interface LocaleDateTimeProps {
    date: Date | string | number;
    dateFormat?: 'short' | 'medium' | 'long' | 'full';
    timeFormat?: 'short' | 'medium';
    separator?: string;
    className?: string;
}

export const LocaleDateTime: React.FC<LocaleDateTimeProps> = ({
    date,
    dateFormat = 'medium',
    timeFormat = 'short',
    separator = ' ',
    className = ''
}) => {
    const { language } = useLanguage();
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    const formatDateTime = (): string => {
        const locale = language as LocaleCode;

        const dateOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: dateFormat === 'short' ? 'numeric' : dateFormat === 'medium' ? 'short' : 'long',
            day: 'numeric',
        };

        if (dateFormat === 'full') {
            dateOptions.weekday = 'long';
        }

        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: timeFormat === 'medium' ? '2-digit' : 'numeric',
            hour12: true,
        };

        try {
            const dateStr = new Intl.DateTimeFormat(locale, dateOptions).format(dateObj);
            const timeStr = new Intl.DateTimeFormat(locale, timeOptions).format(dateObj);
            return `${dateStr}${separator}${timeStr}`;
        } catch {
            const dateStr = new Intl.DateTimeFormat('en', dateOptions).format(dateObj);
            const timeStr = new Intl.DateTimeFormat('en', timeOptions).format(dateObj);
            return `${dateStr}${separator}${timeStr}`;
        }
    };

    return (
        <time dateTime={dateObj.toISOString()} className={className}>
            {formatDateTime()}
        </time>
    );
};

interface RelativeTimeProps {
    date: Date | string | number;
    className?: string;
}

export const RelativeTime: React.FC<RelativeTimeProps> = ({
    date,
    className = ''
}) => {
    const { language, t } = useLanguage();
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const formatRelative = (): string => {
        if (diffSecs < 60) {
            return t('common.dateTime.justNow');
        }

        const locale = language as LocaleCode;

        try {
            return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-diffSecs, 'second');
        } catch {
            // Fallback to simple calculation
            if (diffMins < 60) {
                return diffMins === 1
                    ? t('common.dateTime.minutesAgo_one', { count: 1 })
                    : t('common.dateTime.minutesAgo_other', { count: diffMins });
            }
            if (diffHours < 24) {
                return diffHours === 1
                    ? t('common.dateTime.hoursAgo_one', { count: 1 })
                    : t('common.dateTime.hoursAgo_other', { count: diffHours });
            }
            return diffDays === 1
                ? t('common.dateTime.daysAgo_one', { count: 1 })
                : t('common.dateTime.daysAgo_other', { count: diffDays });
        }
    };

    return (
        <time dateTime={dateObj.toISOString()} className={className}>
            {formatRelative()}
        </time>
    );
};

export default LocaleDate;
