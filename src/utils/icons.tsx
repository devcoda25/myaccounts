import React from "react";

// -----------------------------
// Base Icon Component
// -----------------------------
export type IconProps = { size?: number; color?: string };

export function IconBase({ size = 18, color, children }: IconProps & { children: React.ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            style={{ display: "block", color }}
        >
            {children}
        </svg>
    );
}

// -----------------------------
// UI Icons
// -----------------------------
export function SunIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function MoonIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M21 13a8 8 0 0 1-10-10 7.5 7.5 0 1 0 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function GlobeIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function ArrowLeftIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function ArrowRightIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function CheckCircleIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="m8.5 12 2.3 2.3L15.8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function HelpCircleIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.9.3-1.2.8-1.2 1.6v.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </IconBase>
    );
}

export function InfoBadgeIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </IconBase>
    );
}

export function ChevronDownIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function ChevronRightIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

// -----------------------------
// Form Icons
// -----------------------------
export function MailIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function PhoneIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.5-1-17-8.5-18-18A2 2 0 0 1 3.8 2h3a2 2 0 0 1 2 1.7c.2 1.4.6 2.8 1.2 4.1a2 2 0 0 1-.5 2.2L8.4 11.1a16 16 0 0 0 4.5 4.5l1.1-1.1a2 2 0 0 1 2.2-.5c1.3.6 2.7 1 4.1 1.2a2 2 0 0 1 1.7 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function LockIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <rect x="6" y="11" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function KeyIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="M11 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 12v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 12v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function UserIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M4 22a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function EyeIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
        </IconBase>
    );
}

export function EyeOffIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 12s3.5-7 10-7c2 0 3.8.5 5.3 1.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 12s-3.5 7-10 7c-2.2 0-4.2-.5-5.8-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 10a3 3 0 0 0 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function FingerprintIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 10a2 2 0 0 0-2 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 22v-8c0-1.5 1-2.5 3-2.5s3 1 3 2.5v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

// -----------------------------
// Status & Misc Icons
// -----------------------------
export function ShieldIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function ShieldCheckIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function ShieldOffIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-2.1-.3-4-1.4-5.6-3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M5 15c-.7-1.5-1-3.1-1-5V6l8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function PulseIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M3 12h4l2-5 4 10 2-5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function WalletIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M17 11h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M7 7V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function BellIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function PlugIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M9 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 7h10v4a5 5 0 0 1-10 0V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 16v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function WrenchIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M21 7a6 6 0 0 1-8 5.7L6.6 19.1a2 2 0 1 1-2.8-2.8l6.4-6.4A6 6 0 0 1 17 3l-3 3 4 4 3-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

export function TicketIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function PrintIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M7 8V4h10v4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <rect x="6" y="14" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="4" y="8" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        </IconBase>
    );
}

export function LinkIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function FileTextIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M15 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function LogInIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="10 17 15 12 10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function MoreVerticalIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="5" r="1" fill="currentColor" />
            <circle cx="12" cy="19" r="1" fill="currentColor" />
        </IconBase>
    );
}

export function Trash2Icon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function UserPlusIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function BuildingIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M4 21V3h12v18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M16 9h4v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M8 7h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 11h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function CookieIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M21 12a9 9 0 1 1-9-9c.2 2.8 2.5 5 5.3 5 .6 0 1.2-.1 1.7-.3-.2 2.9 2.1 5.3 5 5.3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
            <circle cx="14" cy="11" r="1" fill="currentColor" />
        </IconBase>
    );
}

export function TimerIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M10 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 14l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
        </IconBase>
    );
}

// -----------------------------
// Brand Icons
// -----------------------------
export function GoogleGIcon({ size = 18, color }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block", color }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.23 3.23l6.9-6.9C35.95 2.27 30.33 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.02 6.23C12.58 13.2 17.86 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.1 24.5c0-1.57-.14-3.08-.4-4.54H24v8.6h12.5c-.54 2.9-2.14 5.36-4.54 7.02l6.96 5.4C43.2 36.98 46.1 31.3 46.1 24.5z" />
            <path fill="#FBBC05" d="M10.58 28.45A14.9 14.9 0 0 1 9.8 24c0-1.55.27-3.05.78-4.45l-8.02-6.23A24.02 24.02 0 0 0 0 24c0 3.9.94 7.6 2.56 10.78l8.02-6.33z" />
            <path fill="#34A853" d="M24 48c6.33 0 11.65-2.1 15.54-5.72l-6.96-5.4c-1.94 1.3-4.42 2.07-8.58 2.07-6.14 0-11.42-3.7-13.42-8.95l-8.02 6.33C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

export function AppleIcon({ size = 18, color }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block", color }}>
            <path d="M318.7 268.7c-.2-37.3 16.4-65.6 51.5-87.2-19.2-27.5-48.2-42.6-86.5-45.5-36.5-2.9-76.3 21.3-90.9 21.3-15.4 0-50.5-20.3-78.3-20.3C56.8 137 0 181.7 0 273.4c0 27.1 5 55.1 15 84 13.4 37.3 61.7 128.9 112.1 127.4 26.2-.7 44.8-18.6 78.9-18.6 33.1 0 50.3 18.6 79.5 18.6 50.9-.7 94.6-82.7 107.3-120-58.2-27.7-74.2-79.5-74.1-96.1zM259.1 80.2c28.1-33.3 25.6-63.6 24.8-74.2-24.8 1.4-53.4 16.9-69.7 36-17.9 20.5-28.4 45.9-26.1 73.2 26.9 2.1 50.6-10.8 71-35z" />
        </svg>
    );
}

export function WhatsAppIcon({ size = 18, color }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block", color }}>
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
    );
}

export function KeypadIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M9 7h.01M12 7h.01M15 7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M9 11h.01M12 11h.01M15 11h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M9 15h.01M12 15h.01M15 15h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </IconBase>
    );
}

export function SmsIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path
                d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path d="M8 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function InboxIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function PencilIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m15 5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function SearchIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function UploadIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function LifeBuoyIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="M6.6 6.6l2.1 2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17.4 17.4l-2.1-2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17.4 6.6l-2.1 2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6.6 17.4l2.1-2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

export function PlusIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function EditIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function TrashIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function CheckIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function StarIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function AlertTriangleIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

export function SaveIcon({ size = 18, color }: IconProps) {
    return (
        <IconBase size={size} color={color}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}
