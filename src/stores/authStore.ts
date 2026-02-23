import { create } from "zustand";
import { IUser } from "@/types";
import { api } from "../utils/api";

interface AuthState {
  user: IUser | null;
  isLoading: boolean;

  refreshUser: (token?: string) => Promise<void>;

  login: (identifier: string, password: string) => Promise<void>;
  socialLogin: (provider: "google" | "apple", token: string, uid?: string) => Promise<void>;

  register: (data: Record<string, unknown>) => Promise<unknown>;

  verifyEmail: (email: string, code: string) => Promise<void>;
  requestEmailVerification: (email: string) => Promise<unknown>;

  requestPhoneVerification: (
    identifier: string,
    deliveryMethod: "sms_code" | "whatsapp_code"
  ) => Promise<unknown>;

  verifyPhone: (identifier: string, code: string) => Promise<void>;

  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  refreshUser: async (token?: string) => {
    set({ isLoading: true });
    try {
      const options = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const data = await api<IUser>("/users/me", options);
      set({ user: data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  login: async (identifier: string, password: string) => {
    set({ isLoading: true });
    try {
      await api("/auth/login", {
        method: "POST",
        body: { identifier, password }, // ✅ object, not JSON.stringify
      });
      await get().refreshUser();
    } finally {
      set({ isLoading: false });
    }
  },

  socialLogin: async (provider: "google" | "apple", token: string, uid?: string) => {
    set({ isLoading: true });
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";
      const response = await fetch(`${baseUrl}/auth/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, uid }),
        credentials: "include",
        redirect: "manual",
      });

      // If we got a redirect (from provider.interactionFinished), follow it
      if (response.status === 302 || response.status === 303 || response.type === "opaqueredirect") {
        const locationHeader = response.headers.get("Location");
        // Only redirect if we have a valid uid - don't redirect to /oidc/auth/undefined
        let nextUrl = locationHeader || (uid ? `/oidc/auth/${uid}` : "");

        if (nextUrl) {
          window.location.assign(nextUrl);
          return;
        }
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Social login failed");
      }

      await get().refreshUser();
    } catch (err) {
      set({ user: null });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data: Record<string, unknown>) => {
    // ✅ return server response (user created / verification info etc.)
    return await api("/users", {
      method: "POST",
      body: data, // ✅ object
    });
  },

  verifyEmail: async (email: string, code: string) => {
    set({ isLoading: true });
    try {
      await api("/auth/verify-email", {
        method: "POST",
        body: { identifier: email, code }, // ✅ object
      });
      await get().refreshUser();
    } finally {
      set({ isLoading: false });
    }
  },

  requestEmailVerification: async (email: string) => {
    return await api("/auth/request-email-verification", {
      method: "POST",
      body: { email }, // ✅ object
    });
  },

  requestPhoneVerification: async (
    identifier: string,
    deliveryMethod: "sms_code" | "whatsapp_code"
  ) => {
    return await api("/auth/request-phone-verification", {
      method: "POST",
      body: { identifier, deliveryMethod }, // ✅ object
    });
  },

  verifyPhone: async (identifier: string, code: string) => {
    set({ isLoading: true });
    try {
      await api("/auth/verify-phone", {
        method: "POST",
        body: { identifier, code }, // ✅ object
      });
      await get().refreshUser();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // ignore errors on logout (session may already be gone)
      await api("/auth/logout", { method: "POST" }).catch(() => { });
    } finally {
      set({ user: null, isLoading: false });
    }
  },
}));
