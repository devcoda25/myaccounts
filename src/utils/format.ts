export function formatOrgId(id: string) {
    if (!id) return "";
    if (id.startsWith("org_")) return id;
    return `org_${id.substring(0, 8).toUpperCase()}`;
}

export function formatWalletId(id: string) {
    if (!id) return "";
    if (id.startsWith("w_")) return id;
    return `w_${id.substring(0, 8)}`;
}

export function formatTransactionId(id: string) {
    if (!id) return "";
    if (id.startsWith("TX-")) return id;
    return `TX-${id.substring(0, 8).toUpperCase()}`;
}

export function formatUserId(id: string) {
    if (!id) return "";
    if (id.startsWith("u_")) return id;
    return `u_${id.substring(0, 8).toUpperCase()}`;
}
