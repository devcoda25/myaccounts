import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  CssBaseline,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { api } from "@/utils/api";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileForm } from "./components/ProfileForm";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { ProfileFooter } from "./components/ProfileFooter";
import ContactSettings from "./ProfileContact";
import { useNotification } from "@/context/NotificationContext";
import { COUNTRIES } from "../auth/sign-up/constants";

export default function PersonalProfilePage() {
  const { t } = useTranslation("common");
  {
    const { mode } = useThemeStore();
    const theme = useTheme();
    const { user, refreshUser } = useAuthStore();
    const { showNotification } = useNotification();

    const [fullName, setFullName] = useState("");
    const [country, setCountry] = useState<string>("");
    const [dob, setDob] = useState<Date | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const pageBg = mode === "dark" ? theme.palette.background.default : theme.palette.grey[50];
    const countries: string[] = COUNTRIES.map((c) => c.label);

    useEffect(() => {
      if (user) {
        setFullName([user.firstName, user.otherNames].filter(Boolean).join(" "));
        setAvatarUrl(user.avatarUrl || null);
        setCountry(user.country || "");
        setDob(user.dob ? new Date(user.dob) : null);
        // Reset pending avatar state when user data loads
        setPendingAvatarFile(null);
        setAvatarPreview(null);
      }
    }, [user]);

    // Handle avatar file selection - show preview immediately
    const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;

      // Create local preview URL
      const previewUrl = URL.createObjectURL(f);
      setAvatarPreview(previewUrl);
      setPendingAvatarFile(f);
    };

    // Upload avatar to backend (called when Save is clicked)
    const uploadAvatar = async (): Promise<string | null> => {
      if (!pendingAvatarFile) return null;

      try {
        const formData = new FormData();
        formData.append("file", pendingAvatarFile);

        const res = await api<{ url: string }>("/users/me/avatar", {
          method: "POST",
          body: formData,
        });

        // Clean up preview URL
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
        }

        setPendingAvatarFile(null);
        setAvatarPreview(null);

        return res.url;
      } catch (err: any) {
        console.error(err);
        throw new Error(err.message || "Failed to upload avatar");
      }
    };

    const onSave = async () => {
      if (!fullName.trim()) {
        showNotification({
          type: "warning",
          title: "Required Information",
          message: "Full name is required."
        });
        return;
      }

      setSaving(true);

      // Timeout to prevent hanging requests
      const timeoutId = setTimeout(() => {
        setSaving(false);
        showNotification({
          type: "error",
          title: "Request Timeout",
          message: "The request took too long. Please try again."
        });
      }, 10000);

      try {
        // Upload avatar first if there's a pending file
        let newAvatarUrl = null;
        if (pendingAvatarFile) {
          showNotification({
            type: "info",
            title: "Uploading...",
            message: "Your profile picture is being updated."
          });
          newAvatarUrl = await uploadAvatar();
        }

        const names = fullName.trim().split(' ');
        const firstName = names[0];
        const otherNames = names.slice(1).join(' ');

        await api("/users/me", {
          method: "PATCH",
          body: JSON.stringify({
            firstName,
            otherNames,
            country,
            dob: dob ? new Date(dob).toISOString() : null,
          }),
        });

        clearTimeout(timeoutId);
        setSaving(false);

        showNotification({
          type: "success",
          title: "Profile Saved",
          message: "Your profile information has been updated successfully."
        });

        // Update avatar URL with newly uploaded one, or keep existing
        if (newAvatarUrl) {
          setAvatarUrl(newAvatarUrl);
        } else if (avatarPreview) {
          // If avatar was changed but not uploaded, use the preview
          setAvatarUrl(avatarPreview);
        }

        await refreshUser();
      } catch (err: any) {
        clearTimeout(timeoutId);
        setSaving(false);
        console.error(err);
        showNotification({
          type: "error",
          title: "Save Failed",
          message: err.message || "Failed to save profile."
        });
      }
    };

    return (
      <>
        <CssBaseline />

        <Box className="min-h-screen" sx={{ background: pageBg }}>
          <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
            <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
              <Box className="hidden md:col-span-3 md:block">
                <ProfileSidebar />
              </Box>

              <Box className="md:col-span-9">
                <Stack spacing={4}>
                  <ProfileHeader />

                  <Stack spacing={2.2}>
                    <ProfileForm
                      fullName={fullName}
                      setFullName={setFullName}
                      country={country || ""}
                      setCountry={setCountry}
                      dob={dob}
                      setDob={setDob}
                      avatarUrl={avatarPreview || avatarUrl || ""}
                      onAvatarChange={onAvatarChange}
                      saving={saving}
                      onSave={onSave}
                      countries={countries}
                      userId={user?.id}
                    />
                    <ContactSettings />
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Box>

          <ProfileFooter />
        </Box >
      </>
    );
  }
}
