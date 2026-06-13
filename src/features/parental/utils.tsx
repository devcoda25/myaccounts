import React from 'react';
import { useTranslation } from "react-i18next";
import { Chip } from '@mui/material';
import { safeRandomBytes } from '@/utils/helpers';
import { ChildStatus } from './types';

export function timeAgo(ts?: number) {
    if (!ts) return "Never";
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

export function money(v: number, ccy: string) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: ccy }).format(v);
}

export function calcAge(dobISO: string) {
    const diff = Date.now() - new Date(dobISO).getTime();
    return Math.floor(diff / (31557600000));
}

// Aliases for compatibility
export const displayMoney = money;
export const displayTimeAgo = timeAgo;

// UI Helpers
export const statusChip = (s: ChildStatus) => (
    <Chip
        size="small"
        label={s}
        variant="outlined"
        color={s === "Active" ? "success" : "default"}
        sx={{ fontWeight: 900, borderRadius: 8 }}
    />
);

export const consentChip = (verified: boolean) => (
    <Chip
        size="small"
        label={verified ? "Guardian Verified" : "Unverified"}
        variant={verified ? "filled" : "outlined"}
        color={verified ? "success" : "warning"}
        sx={{ fontWeight: 900, borderRadius: 8 }}
    />
);

export const approvalKindChip = (kind: string) => {
    let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
    if (kind === "Purchase") color = "warning";
    if (kind.includes("Updated")) color = "info";
    return <Chip size="small" variant="outlined" label={kind} color={color} sx={{ borderRadius: 8 }} />;
};

export const makeInviteCode = () => {
    const bytes = safeRandomBytes(8);
    let s = "";
    let idx = 0;
    for (let i = 0; i < 9; i++) {
        if (i === 4) {
            s += "-";
        } else {
            // Use modulo to pick a letter from A-Z (ASCII 65-90)
            const randomVal = bytes[idx++] % 26;
            s += String.fromCharCode(65 + randomVal);
        }
    }
    return s;
};
