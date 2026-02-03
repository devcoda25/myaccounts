import React from "react";

// Base icon component
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
            {children}
        </svg>
    );
}

export function GlobeIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export function ShieldIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function MailIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function SmsIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M8 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function PhoneIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function SparklesIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 2l1.5 5L19 8.5l-5.5 1.5L12 15l-1.5-5L5 8.5 10.5 7 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M20 14l.8 2.6L23 17.4l-2.2.8L20 21l-.8-2.8L17 17.4l2.2-.8L20 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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
