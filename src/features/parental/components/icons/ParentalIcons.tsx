import React from 'react';
import { useTranslation } from "react-i18next";

// -----------------------------
// Assets (Inline SVGs)
// -----------------------------
export function IconBase({ children, size = 24, color = "currentColor" }: { children: React.ReactNode; size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    );
}

export function SunIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </IconBase>
    );
}

export function MoonIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </IconBase>
    );
}

export function GlobeIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </IconBase>
    );
}

export function ShieldIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </IconBase>
    );
}

export function UsersIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </IconBase>
    );
}

export function UserIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </IconBase>
    );
}

export function WalletIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
        </IconBase>
    );
}

export function CalendarIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </IconBase>
    );
}

export function LayoutIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
        </IconBase>
    );
}

export function XCircleIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </IconBase>
    );
}

export function CheckCircleIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </IconBase>
    );
}

export function LockIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function ClockIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function BellIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function SchoolIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 3 2 8l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M6 10v6c0 1.7 2.7 3 6 3s6-1.3 6-3v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function ShoppingBagIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M6 7h12l1 14H5L6 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M9 7a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function PinIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
        </IconBase>
    );
}

export function ZapIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function PlusIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function LinkIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function KeypadIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="8" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="16" cy="10" r="1" fill="currentColor" />
            <circle cx="8" cy="14" r="1" fill="currentColor" />
            <circle cx="12" cy="14" r="1" fill="currentColor" />
            <circle cx="16" cy="14" r="1" fill="currentColor" />
        </IconBase>
    );
}

export function SmsIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" />
        </IconBase>
    );
}

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M17.498 14.382c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.463 1.065 2.876 1.213 3.075.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.084 1.758-.717 2.006-1.41.248-.693.248-1.288.173-1.41-.074-.124-.272-.198-.569-.347z" fill="currentColor" />
            <path d="M11.999 21.056c-1.621 0-3.197-.43-4.606-1.25l-.33-.195-3.414.896.912-3.328-.216-.342A9.03 9.03 0 0 1 2.97 12.01c0-4.966 4.043-9.01 9.029-9.01 2.413 0 4.68 0.941 6.386 2.648 1.706 1.708 2.646 3.977 2.646 6.389 0 4.965-4.045 9.019-9.032 9.019zm0-19.998C5.38 1.058 0 6.44 0 13.06c0 1.956.51 3.822 1.47 5.485L.305 23.36l4.908-1.288c1.597.87 3.398 1.328 5.215 1.332h.005c6.618 0 12-5.382 12-12.002.001-3.206-1.248-6.22-3.518-8.489C16.745 2.643 13.73 1.393 12 1.393z" fill="currentColor" />
        </IconBase>
    );
}
