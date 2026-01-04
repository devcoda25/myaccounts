import React from "react";

export function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
            {children}
        </svg>
    );
}

export function PhoneIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function ShieldCheckIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export function BrandVisa({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
            <rect x="1" y="1" width="62" height="30" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 23 8 9h4l2 9 2-9h4l-4 14h-4Z" fill="currentColor" />
            <path d="M25 9h4l-2 14h-4l2-14Z" fill="currentColor" />
            <path d="M39 9h-3c-2 0-3 .9-3 2.4 0 3.2 7 2.2 7 7.2 0 2.7-2.3 4.4-5.6 4.4-1.9 0-3.7-.5-4.8-1.1l.6-3c1.1.8 2.7 1.2 4.2 1.2 1.2 0 2-.4 2-1.2 0-2.2-7-2-7-7.1C29.4 10.3 31.6 9 35 9h4l-.1 0Z" fill="currentColor" />
            <path d="M52 23h-4l-.6-2h-5l-1.1 2h-4l7-14h3.7l4 14Zm-5.7-5.1-1.2-4.5-2.2 4.5h3.4Z" fill="currentColor" />
        </svg>
    );
}

export function BrandMastercard({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
            <rect x="1" y="1" width="62" height="30" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="26" cy="16" r="8" fill="currentColor" opacity="0.9" />
            <circle cx="38" cy="16" r="8" fill="currentColor" opacity="0.55" />
            <path d="M32 10a8 8 0 0 0 0 12 8 8 0 0 0 0-12Z" fill="currentColor" opacity="0.35" />
        </svg>
    );
}

export function BankIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21h18M5 21v-7m8 7v-7m6 7v-7M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v0H4v0zm8-8l9 6H3l9-6z" />
        </svg>
    );
}

export function OpenExternalIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
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

export function ArrowLeftIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function CheckCircleIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="m8.5 12 2.3 2.3L15.8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function XCircleIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function KeypadIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M9 7h.01M12 7h.01M15 7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M9 11h.01M12 11h.01M15 11h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M9 15h.01M12 15h.01M15 15h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </IconBase>
    );
}
