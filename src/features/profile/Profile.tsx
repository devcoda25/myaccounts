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
    const [saving, setSaving] = useState(false);

    const pageBg = mode === "dark" ? theme.palette.background.default : theme.palette.grey[50];
    const countries = ["United States", "China", "United Kingdom", "Germany", "France", "Japan", "Canada", "Australia"];

    useEffect(() => {
      if (user) {
        setFullName([user.firstName, user.otherNames].filter(Boolean).join(" "));
        setAvatarUrl(user.avatarUrl || null);
        setCountry(user.country || "");
        setDob(user.dob ? new Date(user.dob) : null);
      }
    }, [user]);

    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;

      const formData = new FormData();
      formData.append("file", f);

      try {
        showNotification({
          type: "success",
          title: "Uploading...",
          message: "Your profile picture is being updated."
        });
        const res = await api<{ url: string }>("/users/me/avatar", {
          method: "POST",
          body: formData,
        });
        setAvatarUrl(res.url);
        showNotification({
          type: "success",
          title: "Avatar Updated",
          message: "Your profile picture has been updated successfully."
        });
        await refreshUser();
      } catch (err: any) {
        console.error(err);
        showNotification({
          type: "error",
          title: "Upload Failed",
          message: err.message || "Failed to upload avatar."
        });
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
      try {
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
        showNotification({
          type: "success",
          title: "Profile Saved",
          message: "Your profile information has been updated successfully."
        });
        await refreshUser();
      } catch (err: any) {
        console.error(err);
        showNotification({
          type: "error",
          title: "Save Failed",
          message: err.message || "Failed to save profile."
        });
      } finally {
        setSaving(false);
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
                      avatarUrl={avatarUrl || ""}
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
