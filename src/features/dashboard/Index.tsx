import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  useTheme,
  Avatar,
  CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ShieldCheck,
  CreditCard,
  Users,
  Code,
  ExternalLink,
  Settings,
  HelpCircle
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { EVZONE } from "@/theme/evzone";
import { api } from "@/utils/api";
import { sanitizeUrl } from "@/sanitizers/url";

interface IApp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

export default function Dashboard() {
  const { t } = useTranslation("common");
  {
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode } = useThemeStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false); // Can be used for fetching sessions later

    const containerVars = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    };

    const itemVars = {
      hidden: { y: 20, opacity: 0 },
      show: { y: 0, opacity: 1 }
    };

    const greeting = () => {
      const hr = new Date().getHours();
      if (hr < 12) return "Good morning";
      if (hr < 18) return "Good afternoon";
      return "Good evening";
    };

    /* Static list removed - fetched from backend */
    const [apps, setApps] = useState<IApp[]>([]);

    useEffect(() => {
      const fetchApps = async () => {
        try {
          const res = await api.get<any[]>("/apps/system");
          const mapped = res.map((app) => {
            // Dynamically load Lucide icon
            // @ts-ignore
            const IconCmp = Icons[app.icon] || Icons.HelpCircle;
            return {
              ...app,
              icon: <IconCmp size={24} />
            };
          });
          setApps(mapped);
        } catch (e) {
          console.error("Failed to load apps", e);
        }
      };
      fetchApps();
    }, []);

    const APPS = apps;

    const pageBg = mode === 'dark'
      ? 'radial-gradient(circle at 50% 0%, #1a2e29 0%, #07110F 100%)'
      : 'radial-gradient(circle at 50% 0%, #e8fbf4 0%, #ffffff 100%)';

    return (
      <Box sx={{
        minHeight: '100%',
        position: 'relative',
        background: pageBg,
        pb: { xs: 12, md: 8 }
      }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, position: 'relative', zIndex: 1 }}>
          <motion.div variants={containerVars} initial="hidden" animate="show">

            {/* Header */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <motion.div variants={itemVars}>
                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1, color: 'text.primary' }}>
                  {greeting()}, {user?.firstName}
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                  Access your applications and manage your EVZone identity.
                </Typography>
              </motion.div>
            </Box>

            {/* Apps Grid */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {APPS.map((app) => (
                <Grid item xs={12} md={4} key={app.id}>
                  <motion.div variants={itemVars}>
                    <Paper
                      component="a"
                      href={sanitizeUrl(app.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        textDecoration: 'none',
                        height: '100%',
                        borderRadius: '20px',
                        background: alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px -10px ${alpha(app.color, 0.3)}`,
                          borderColor: alpha(app.color, 0.5)
                        }
                      }}
                    >
                      <Box sx={{
                        width: 64, height: 64,
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(app.color, 0.1),
                        color: app.color,
                        mb: 2
                      }}>
                        {app.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {app.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                        {app.description}
                      </Typography>
                      <Button
                        variant="outlined"
                        endIcon={<ExternalLink size={16} />}
                        sx={{
                          mt: 'auto',
                          borderRadius: '10px',
                          borderColor: alpha(app.color, 0.3),
                          color: app.color,
                          '&:hover': {
                            borderColor: app.color,
                            bgcolor: alpha(app.color, 0.05)
                          }
                        }}
                      >
                        Launch App
                      </Button>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Account & Security Quick Links */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                Account & Security
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVars}>
                    <Paper
                      onClick={() => navigate('/app/security')}
                      sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) }
                      }}
                    >
                      <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6' }}>
                        <ShieldCheck size={24} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Security Settings</Typography>
                        <Typography variant="caption" color="text.secondary">2FA, Password, Sessions</Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVars}>
                    <Paper
                      onClick={() => navigate('/app/profile')}
                      sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) }
                      }}
                    >
                      <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(EVZONE.orange, 0.1), color: EVZONE.orange }}>
                        <Settings size={24} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Profile & Preferences</Typography>
                        <Typography variant="caption" color="text.secondary">Personal info, Language, Theme</Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>

            {/* Organizations Section */}
            {user?.orgMemberships && user.orgMemberships.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                  My Organizations
                </Typography>
                <Grid container spacing={2}>
                  {user.orgMemberships.map((m) => (
                    <Grid item xs={12} sm={6} key={m.id}>
                      <motion.div variants={itemVars}>
                        <Paper
                          sx={{
                            p: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            borderRadius: '16px',
                            border: `1px solid ${theme.palette.divider}`,
                            background: alpha(theme.palette.background.paper, 0.4),
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(EVZONE.green, 0.1), color: EVZONE.green }}>
                            <Icons.Building2 size={24} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={700}>{m.organization.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{m.role}</Typography>
                          </Box>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

          </motion.div>
        </Container>
      </Box>
    );
  }
}

