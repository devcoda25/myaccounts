import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CssBaseline,
  Snackbar,
  Stack,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { api } from "../../../utils/api";
import { useAuthStore } from "../../../stores/authStore";
import { useThemeStore } from "../../../stores/themeStore";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileForm } from "./components/ProfileForm";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { ProfileFooter } from "./components/ProfileFooter";
import ContactSettings from "./ProfileContact";

// ...

export default function PersonalProfilePage() {
  const { mode } = useThemeStore();
  const theme = useTheme();
  const { user, refreshUser } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState<string>("");
  const [dob, setDob] = useState<Date | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "info" | "warning" | "error"; msg: string }>({
    open: false,
    severity: "info",
    msg: "",
  });

  // Derived state
  const pageBg = mode === "dark" ? theme.palette.background.default : theme.palette.grey[50];
  const countries = ["United States", "China", "United Kingdom", "Germany", "France", "Japan", "Canada", "Australia"]; // Basic list

  useEffect(() => {
    if (user) {
      setFullName([user.firstName, user.otherNames].filter(Boolean).join(" "));
      setAvatarUrl(user.avatarUrl || null);
      // Note: country and dob are now in IUser
      setCountry(user.country || "");
      setDob(user.dob ? new Date(user.dob) : null);
    }
  }, [user]);

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Upload immediately
    const formData = new FormData();
    formData.append("file", f);

    try {
      setSnack({ open: true, severity: "info", msg: "Uploading..." });
      const res = await api<{ url: string }>("/users/me/avatar", {
        method: "POST",
        body: formData, // api utility should handle FormData and remove Content-Type header to let browser set boundary
      });
      setAvatarUrl(res.url);
      setSnack({ open: true, severity: "success", msg: "Avatar updated." });
      await refreshUser(); // Update global state (Header avatar)
    } catch (err: unknown) {
      console.error(err);
      setSnack({ open: true, severity: "error", msg: (err as Error).message || "Failed to upload avatar." });
    }
  };

  const onSave = async () => {
    if (!fullName.trim()) {
      setSnack({ open: true, severity: "warning", msg: "Full name is required." });
      return;
    }
    setSaving(true);
    try {
      // Split name for simple implementation
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
      setSnack({ open: true, severity: "success", msg: "Profile saved successfully." });
      await refreshUser(); // Update global state
    } catch (err: unknown) {
      console.error(err);
      setSnack({ open: true, severity: "error", msg: (err as Error).message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CssBaseline />

      <Box className="min-h-screen" sx={{ background: pageBg }}>
        {/* Body */}
        <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
            {/* Sidebar */}
            <Box className="hidden md:col-span-3 md:block">
              <ProfileSidebar />
            </Box>

            {/* Main Content */}
            <Box className="md:col-span-9">
              <Stack spacing={4}>
                {/* Header / Intro */}
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

        <Snackbar
          open={snack.open}
          autoHideDuration={3200}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant={mode === "dark" ? "filled" : "standard"}
            sx={{
              borderRadius: 16,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
              backgroundColor:
                mode === "dark" ? alpha(theme.palette.background.paper, 0.94) : alpha(theme.palette.background.paper, 0.96),
              color: theme.palette.text.primary,
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box >
    </>
  );
}
