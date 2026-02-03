import { AppFormData, OAuthApp } from "./types";

// Initialize form data for a new app
export function initFormData(): AppFormData {
    return {
        name: "",
        clientId: "",
        type: "confidential",
        redirectUris: "",
        website: "",
        isFirstParty: false,
    };
}

// Populate form data from an existing app
export function populateFormData(app: OAuthApp): AppFormData {
    return {
        name: app.name,
        clientId: app.clientId,
        type: app.isPublic ? "public" : "confidential",
        redirectUris: app.redirectUris.join(", "),
        website: app.website || "",
        isFirstParty: app.isFirstParty,
    };
}

// Build payload from form data
export function buildPayload(formData: AppFormData): Omit<AppFormData, 'redirectUris'> & { redirectUris: string[] } {
    return {
        name: formData.name,
        clientId: formData.clientId,
        type: formData.type,
        website: formData.website,
        isFirstParty: formData.isFirstParty,
        redirectUris: formData.redirectUris.split(",").map(u => u.trim()).filter(Boolean),
    };
}

// Copy text to clipboard
export function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
}
