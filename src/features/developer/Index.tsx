import React from "react";
import { Box, Button, Card, CardContent, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { ExternalLink as LinkIcon, Code2 as CodeIcon } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { EVZONE } from "@/theme/evzone";

export default function DeveloperAccessPage() {
  const theme = useTheme();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const pageBg =
    isDark
      ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
      : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

  return (
    <Box className="min-h-screen" sx={{ background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card sx={{ maxWidth: 480, width: "100%", borderRadius: 4, textAlign: "center", border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}` }}>
          <CardContent sx={{ p: 6 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.text.primary, 0.1),
                color: theme.palette.text.primary,
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <CodeIcon size={32} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Developer Console
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
              API Keys and OAuth Client management have moved to the EVZone Developer Portal.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="https://developers.evzone.app" // Placeholder URL
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              sx={{
                bgcolor: theme.palette.text.primary,
                color: theme.palette.background.paper,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 700,
                "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.9) },
              }}
              endIcon={<LinkIcon size={18} />}
            >
              Launch Developer Portal
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
