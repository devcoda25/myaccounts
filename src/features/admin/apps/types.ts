// Types for apps module

export type AppType = "confidential" | "public" | "dual";

export interface OAuthApp {
    clientId: string;
    name: string;
    redirectUris: string[];
    isFirstParty: boolean;
    isPublic: boolean;
    type: "confidential" | "public" | "dual";
    createdAt: string;
    website?: string;
}

export interface AppFormData {
    name: string;
    clientId: string;
    type: AppType;
    redirectUris: string;
    website: string;
    isFirstParty: boolean;
}

export interface CreatedApp {
    clientId: string;
    clientSecret?: string;
}

export type SnackSeverity = "info" | "success" | "error";
