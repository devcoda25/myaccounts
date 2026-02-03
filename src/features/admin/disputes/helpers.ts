import { ReactNode } from "react";
import { EVZONE } from "./constants";
import { DisputeStatus } from "./types";

// Get status configuration for a dispute
export function statusConfig(s: DisputeStatus): {
    color: string;
    icon: ReactNode;
    label: string;
} {
    if (s === "WON") return { color: EVZONE.green, icon: null, label: "Resolved (Won)" };
    if (s === "LOST") return { color: EVZONE.red, icon: null, label: "Resolved (Lost)" };
    if (s === "CLOSED") return { color: "#667085", icon: null, label: "Closed" };
    if (s === "UNDER_REVIEW") return { color: EVZONE.blue, icon: null, label: "Under Review" };
    return { color: EVZONE.orange, icon: null, label: "Open" };
}

// Format currency amount
export function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// Format date string
export function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
}
