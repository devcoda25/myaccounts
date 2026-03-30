import { safeRandomBytes } from "@/utils/helpers";
import { EVZONE } from "./constants";
import { Risk, UserStatus } from "./types";

// Generate a temporary password with EVZ-XXXX-XXXX format
export function mkTempPassword(): string {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = safeRandomBytes(10);
    const s = Array.from(bytes)
        .map((b) => alphabet[b % alphabet.length])
        .join("");
    return `EVZ-${s.slice(0, 4)}-${s.slice(4, 8)}`;
}

// Generate a unique ID with a prefix
export function uid(prefix: string): string {
    return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

// Get the color tone for a risk level
export function riskTone(r: Risk): string {
    if (r === "High") return "#B42318";
    if (r === "Medium") return EVZONE.orange;
    return EVZONE.green;
}

// Get the color tone for a user status
export function statusTone(s: UserStatus): string {
    if (s === "Active") return EVZONE.green;
    if (s === "Locked") return EVZONE.orange;
    return "#667085";
}

// Get the title for an action
export function actionTitle(k: string): string {
    if (k === "LOCK") return "Lock account";
    if (k === "UNLOCK") return "Unlock account";
    if (k === "RESET_PASSWORD") return "Reset password";
    if (k === "RESET_MFA") return "Reset MFA";
    if (k === "DELETE_USER") return "Delete User";
    return "Force sign out";
}

// Get the severity level for an action
export function actionSeverity(k: string): "info" | "warning" | "error" {
    if (k === "LOCK") return "warning";
    if (k === "UNLOCK") return "info";
    if (k === "RESET_PASSWORD") return "warning";
    if (k === "RESET_MFA") return "warning";
    if (k === "DELETE_USER") return "error";
    return "warning";
}
