import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CssBaseline,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useThemeStore } from "@/stores/themeStore";

/**
 * EVzone My Accounts - Developer Documentation
 * Route: /app/developer/docs
 *
 * Features:
 * - Interactive API reference sidebar
 * - Code examples (CURL, JS, Python)
 * - Basic getting started guide
 */

type Severity = "info" | "warning" | "error" | "success";

const EVZONE = {
    green: "#03cd8c",
    orange: "#f77f00",
} as const;

// -----------------------------
// Inline icons
// -----------------------------
function IconBase({ size = 18, children }: { size?: number; children: React.ReactNode }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ display: "block" }}>
            {children}
        </svg>
    );
}

function SunIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </IconBase>
    );
}

function MoonIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M21 13a8 8 0 0 1-10-10 7.5 7.5 0 1 0 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </IconBase>
    );
}

function ArrowLeftIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

function BookIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

function CodeIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

function CopyIcon({ size = 18 }: { size?: number }) {
    return (
        <IconBase size={size}>
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </IconBase>
    );
}

// -----------------------------
// Code Snippet Helper
// -----------------------------
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Box sx={{ position: "relative", my: 2 }}>
            <Box sx={{ p: 2, borderRadius: 1, backgroundColor: "#1e1e1e", border: "1px solid #333", overflow: "auto" }}>
                <Typography variant="caption" sx={{ color: "#888", display: "block", mb: 1, textTransform: "uppercase", fontSize: "10px", fontWeight: "bold" }}>
                    {language}
                </Typography>
                <Typography component="pre" sx={{ color: "#dcdcdc", fontFamily: "monospace", fontSize: "13px", whiteSpace: "pre-wrap" }}>
                    {code}
                </Typography>
            </Box>
            <IconButton size="small" sx={{ position: "absolute", top: 8, right: 8, color: "#888", "&:hover": { color: "#fff" } }} onClick={handleCopy}>
                {copied ? <Chip label="Copied" size="small" color="success" /> : <CopyIcon size={16} />}
            </IconButton>
        </Box>
    );
};

// -----------------------------
// Component
// -----------------------------
export default function DeveloperDocsPage() {
    const navigate = useNavigate();
    const { mode } = useThemeStore();
    const theme = useTheme();

    const [activeSection, setActiveSection] = useState("Introduction");
    const [langTab, setLangTab] = useState(0);

    const [snack, setSnack] = useState<{ open: boolean; severity: Severity; msg: string }>({ open: false, severity: "info", msg: "" });

    const sections = [
        { title: "Introduction", icon: <BookIcon size={18} /> },
        { title: "Authentication", icon: <BookIcon size={18} /> },
        { title: "Endpoints", icon: <CodeIcon size={18} /> },
        { title: "Error Codes", icon: <BookIcon size={18} /> },
        { title: "Rate Limits", icon: <BookIcon size={18} /> },
    ];

    const languages = ["CURL", "Javascript", "Python"];

    const getCode = () => {
        if (activeSection === "Authentication") {
            if (langTab === 0) return `curl -X GET "https://api.evzone.com/v1/profile" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;
            if (langTab === 1) return `const response = await fetch("https://api.evzone.com/v1/profile", {
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});
const data = await response.json();`;
            return `import requests

headers = { "Authorization": "Bearer YOUR_API_KEY" }
r = requests.get("https://api.evzone.com/v1/profile", headers=headers)
print(r.json())`;
        }
        return "// Example implementation coming soon...";
    };

    const pageBg =
        mode === "dark"
            ? "radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)"
            : "radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)";

    const orangeContained = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        boxShadow: `0 18px 48px ${alpha(EVZONE.orange, mode === "dark" ? 0.28 : 0.18)}`,
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92), color: "#FFFFFF" },
        borderRadius: "4px",
    } as const;

    return (
        <>
            <Box className="min-h-screen" sx={{ background: pageBg }}>
                <Box className="mx-auto max-w-6xl px-4 py-6 md:px-6">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        <Stack spacing={2.2}>
                            <Card>
                                <CardContent className="p-5 md:p-7">
                                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Stack direction="row" spacing={1.2} alignItems="center">
                                                <IconButton size="small" sx={{ color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}` }} onClick={() => navigate("/app/developer")}>
                                                    <ArrowLeftIcon size={18} />
                                                </IconButton>
                                                <Typography variant="h5">API Documentation</Typography>
                                            </Stack>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, ml: { md: 5 } }}>
                                                Build powerful integrations using our robust API.
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Chip label="v1.0" color="primary" sx={{ fontWeight: 900 }} />
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Box className="grid gap-4 md:grid-cols-12 md:gap-6">
                                <Box className="md:col-span-3">
                                    <Card>
                                        <CardContent className="p-2">
                                            <List dense>
                                                {sections.map((s) => (
                                                    <ListItem key={s.title} disablePadding>
                                                        <ListItemButton
                                                            selected={activeSection === s.title}
                                                            onClick={() => setActiveSection(s.title)}
                                                            sx={{
                                                                borderRadius: 1,
                                                                m: 0.5,
                                                                "&.Mui-selected": { backgroundColor: alpha(EVZONE.green, 0.1), color: EVZONE.green, "&:hover": { backgroundColor: alpha(EVZONE.green, 0.15) } },
                                                            }}
                                                        >
                                                            <ListItemIcon sx={{ minWidth: 32, color: activeSection === s.title ? "inherit" : theme.palette.text.secondary }}>{s.icon}</ListItemIcon>
                                                            <ListItemText primary={<Typography sx={{ fontWeight: activeSection === s.title ? 950 : 500, fontSize: "14px" }}>{s.title}</Typography>} />
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))}
                                            </List>
                                            <Divider sx={{ my: 1 }} />
                                            <Box sx={{ p: 2 }}>
                                                <Button variant="outlined" fullWidth size="small" onClick={() => navigate("/app/support")}>
                                                    Contact support
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Box>

                                <Box className="md:col-span-9">
                                    <Card>
                                        <CardContent className="p-5 md:p-8">
                                            <motion.div key={activeSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                                                <Typography variant="h4" sx={{ fontWeight: 950, mb: 2 }}>
                                                    {activeSection}
                                                </Typography>

                                                {activeSection === "Introduction" && (
                                                    <Stack spacing={2}>
                                                        <Typography variant="body1">
                                                            Welcome to the EVzone developer portal. Our API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
                                                        </Typography>
                                                        <Alert severity="info">
                                                            To get started with our API, you must first create an API key from the Developer dashboard.
                                                        </Alert>
                                                        <Typography variant="h6" sx={{ mt: 2 }}>
                                                            Base URL
                                                        </Typography>
                                                        <Box sx={{ p: 1.5, borderRadius: 1, backgroundColor: alpha(theme.palette.text.primary, 0.05), border: `1px solid ${theme.palette.divider}` }}>
                                                            <Typography component="code" sx={{ fontFamily: "monospace", fontSize: "14px" }}>
                                                                https://api.evzone.com/v1
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                )}

                                                {activeSection === "Authentication" && (
                                                    <Stack spacing={2}>
                                                        <Typography variant="body1">
                                                            EVzone uses API keys to allow access to the API. You can register a new API key at our developer dashboard.
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Your API keys carry many privileges, so please be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
                                                        </Typography>
                                                        <Tabs value={langTab} onChange={(_, v) => setLangTab(v)} sx={{ mb: -1 }}>
                                                            {languages.map((l, i) => (
                                                                <Tab key={l} label={l} sx={{ fontWeight: 900, textTransform: "none" }} />
                                                            ))}
                                                        </Tabs>
                                                        <CodeBlock code={getCode()} language={languages[langTab]} />
                                                    </Stack>
                                                )}

                                                {activeSection === "Rate Limits" && (
                                                    <Stack spacing={2}>
                                                        <Typography variant="body1">
                                                            We limit the number of requests you can make to our API to ensure platform stability. Limits vary based on your authentication method and organization tier.
                                                        </Typography>
                                                        <Box className="grid gap-3 sm:grid-cols-2">
                                                            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.text.primary, 0.02) }}>
                                                                <Typography sx={{ fontWeight: 950 }}>Standard Tier</Typography>
                                                                <Typography variant="h4">1,000</Typography>
                                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>requests per hour</Typography>
                                                            </Box>
                                                            <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.text.primary, 0.02) }}>
                                                                <Typography sx={{ fontWeight: 950 }}>Enterprise Tier</Typography>
                                                                <Typography variant="h4">10,000</Typography>
                                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>requests per hour</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Stack>
                                                )}

                                                {["Endpoints", "Error Codes"].includes(activeSection) && (
                                                    <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
                                                        <CodeIcon size={48} />
                                                        <Typography variant="h6">Detailed {activeSection.toLowerCase()} reference</Typography>
                                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: "center", maxWidth: "400px" }}>
                                                            This section of the documentation is currently being updated. In a production environment, this would contain a complete Swagger/OpenAPI interactive reference.
                                                        </Typography>
                                                        <Button variant="contained" sx={orangeContained} onClick={() => setSnack({ open: true, msg: "Docs update pending.", severity: "info" })}>
                                                            Check updates
                                                        </Button>
                                                    </Stack>
                                                )}
                                            </motion.div>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Box>

                            <Box sx={{ opacity: 0.92 }}>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>© {new Date().getFullYear()} EVzone Group.</Typography>
                            </Box>
                        </Stack>
                    </motion.div>
                </Box>
            </Box>

            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: "100px" }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </>
    );
}
