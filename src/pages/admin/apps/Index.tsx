import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography,
    useTheme,
    alpha,
    Alert,
    Snackbar,
    FormControlLabel,
    Switch,
    Tooltip,
} from "@mui/material";
import {
    Plus as PlusIcon,
    Edit2 as EditIcon,
    Trash2 as TrashIcon,
    ShieldCheck as ShieldIcon,
    Globe as GlobeIcon,
    Eye as EyeIcon,
    Copy as CopyIcon,
    Layout as AppIcon,
    ExternalLink as LinkIcon,
} from "lucide-react";
import { api } from "../../../utils/api";
import { motion } from "framer-motion";

const EVZONE = { green: "#03cd8c", orange: "#f77f00" } as const;

interface OAuthApp {
    clientId: string;
    name: string;
    redirectUris: string[];
    isFirstParty: boolean;
    isPublic: boolean;
    createdAt: string;
}

export default function AdminApps() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [apps, setApps] = useState<OAuthApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" as "info" | "success" | "error" });

    const [modalOpen, setModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<OAuthApp | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        clientId: "",
        type: "confidential" as "confidential" | "public",
        redirectUris: "",
        isFirstParty: false,
    });

    const [secretModalOpen, setSecretModalOpen] = useState(false);
    const [createdApp, setCreatedApp] = useState<{ clientId: string; clientSecret?: string } | null>(null);

    const fetchApps = async () => {
        setLoading(true);
        try {
            const res = await api('/admin/apps');
            setApps(res.apps);
        } catch (err) {
            setSnack({ open: true, msg: "Failed to load apps", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    const handleOpenModal = (app?: OAuthApp) => {
        if (app) {
            setEditingApp(app);
            setFormData({
                name: app.name,
                clientId: app.clientId,
                type: app.isPublic ? "public" : "confidential",
                redirectUris: app.redirectUris.join(", "),
                isFirstParty: app.isFirstParty,
            });
        } else {
            setEditingApp(null);
            setFormData({
                name: "",
                clientId: "",
                type: "confidential",
                redirectUris: "",
                isFirstParty: false,
            });
        }
        setModalOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            redirectUris: formData.redirectUris.split(",").map(u => u.trim()).filter(Boolean),
        };

        try {
            if (editingApp) {
                await api(`/admin/apps/${editingApp.clientId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
                setSnack({ open: true, msg: "App updated successfully", severity: "success" });
            } else {
                const res = await api('/admin/apps', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                if (res.clientSecret) {
                    setCreatedApp({ clientId: res.clientId, clientSecret: res.clientSecret });
                    setSecretModalOpen(true);
                }
                setSnack({ open: true, msg: "App created successfully", severity: "success" });
            }
            setModalOpen(false);
            fetchApps();
        } catch (err: any) {
            setSnack({ open: true, msg: err.message || "Failed to save app", severity: "error" });
        }
    };

    const handleDelete = async (clientId: string) => {
        if (!window.confirm("Are you sure you want to delete this app? This will revoke access for all users.")) return;
        try {
            await api(`/admin/apps/${clientId}`, { method: 'DELETE' });
            setSnack({ open: true, msg: "App deleted", severity: "success" });
            fetchApps();
        } catch (err) {
            setSnack({ open: true, msg: "Failed to delete app", severity: "error" });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSnack({ open: true, msg: "Copied to clipboard", severity: "success" });
    };

    const orangeContained = {
        backgroundColor: EVZONE.orange,
        color: "#FFFFFF",
        "&:hover": { backgroundColor: alpha(EVZONE.orange, 0.92) },
        borderRadius: 3,
        textTransform: 'none',
        fontWeight: 600,
    } as const;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>Apps & Integrations</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage OIDC clients and system integration credentials.</Typography>
                    </Box>
                    <Button variant="contained" sx={orangeContained} startIcon={<PlusIcon size={18} />} onClick={() => handleOpenModal()}>
                        Create App
                    </Button>
                </Box>

                <Box className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => (
                        <Card key={app.clientId} sx={{ borderRadius: 5, border: `1px solid ${theme.palette.divider}`, background: isDark ? alpha(theme.palette.background.paper, 0.6) : '#fff' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: alpha(EVZONE.green, 0.1), color: EVZONE.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AppIcon size={20} />
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{app.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>ID: {app.clientId}</Typography>
                                            </Box>
                                        </Box>
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton size="small" onClick={() => handleOpenModal(app)}><EditIcon size={16} /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(app.clientId)}><TrashIcon size={16} /></IconButton>
                                        </Stack>
                                    </Box>

                                    <Stack direction="row" spacing={1}>
                                        <Chip label={app.isPublic ? "Public" : "Confidential"} size="small" variant="outlined" sx={{ borderRadius: 2 }} />
                                        {app.isFirstParty && <Chip label="First Party" size="small" color="success" sx={{ borderRadius: 2, bgcolor: alpha(EVZONE.green, 0.1), color: EVZONE.green, border: 'none', fontWeight: 700 }} />}
                                    </Stack>

                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Redirect URIs</Typography>
                                        {app.redirectUris.map(uri => (
                                            <Typography key={uri} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
                                                <GlobeIcon size={12} /> {uri}
                                            </Typography>
                                        ))}
                                    </Box>

                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Created {new Date(app.createdAt).toLocaleDateString()}</Typography>
                                        <Button size="small" variant="text" sx={{ color: EVZONE.orange, fontWeight: 700 }} startIcon={<LinkIcon size={14} />}>View Details</Button>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Stack>

            {/* Create/Edit Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 5 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>{editingApp ? "Edit App" : "Create New OIDC App"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField label="App Name" fullWidth value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. EVzone Marketplace" />

                        {!editingApp && (
                            <>
                                <TextField label="Custom Client ID (Optional)" fullWidth value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })} placeholder="Leave blank to auto-generate" />
                                <TextField select label="App Type" fullWidth value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} SelectProps={{ native: true }}>
                                    <option value="confidential">Confidential (Server-side app)</option>
                                    <option value="public">Public (Single Page App / Mobile)</option>
                                </TextField>
                            </>
                        )}

                        <TextField label="Redirect URIs (comma separated)" fullWidth multiline rows={2} value={formData.redirectUris} onChange={e => setFormData({ ...formData, redirectUris: e.target.value })} placeholder="https://app.com/callback, http://localhost:3000/auth" />

                        <FormControlLabel control={<Switch checked={formData.isFirstParty} onChange={e => setFormData({ ...formData, isFirstParty: e.target.checked })} color="success" />} label="First Party App (Skips user consent screen)" />

                        {!editingApp && formData.type === 'confidential' && (
                            <Alert severity="info" sx={{ borderRadius: 3 }}>A client secret will be generated and shown only once after creation.</Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setModalOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" sx={orangeContained} onClick={handleSave}>Save App</Button>
                </DialogActions>
            </Dialog>

            {/* Secret Reveal Modal */}
            <Dialog open={secretModalOpen} onClose={() => setSecretModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 5 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>App Credentials</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="error" sx={{ fontWeight: 700 }}>
                            WARNING: Copy the client secret now. You will not be able to see it again!
                        </Typography>

                        <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Client ID</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: alpha(theme.palette.text.primary, 0.05), borderRadius: 2 }}>
                                <Typography sx={{ flex: 1, fontFamily: 'monospace' }}>{createdApp?.clientId}</Typography>
                                <IconButton size="small" onClick={() => copyToClipboard(createdApp?.clientId || "")}><CopyIcon size={16} /></IconButton>
                            </Box>
                        </Box>

                        {createdApp?.clientSecret && (
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Client Secret</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: alpha(EVZONE.orange, 0.1), borderRadius: 2 }}>
                                    <Typography sx={{ flex: 1, fontFamily: 'monospace', color: EVZONE.orange, fontWeight: 700 }}>{createdApp.clientSecret}</Typography>
                                    <IconButton size="small" sx={{ color: EVZONE.orange }} onClick={() => copyToClipboard(createdApp?.clientSecret || "")}><CopyIcon size={16} /></IconButton>
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button variant="contained" fullWidth sx={orangeContained} onClick={() => setSecretModalOpen(false)}>I have saved the credentials</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
                <Alert severity={snack.severity} sx={{ borderRadius: 3, width: '100%' }}>{snack.msg}</Alert>
            </Snackbar>
        </motion.div>
    );
}
