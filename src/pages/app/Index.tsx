import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Avatar,
  Divider,
  useTheme,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Wallet as WalletIcon,
  ShieldCheck,
  Users,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  CreditCard,
  Settings,
  ChevronRight,
  Zap,
  LayoutDashboard,
  Shield,
  ArrowDown,
  ArrowUp,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { EVZONE } from '../../theme/evzone';
import { api } from '../../utils/api';
import { Wallet, Transaction } from '../../utils/types';

// Helpers
function money(amount: number, currency = "UGX") {
  const sign = amount < 0 ? "-" : "";
  const v = Math.abs(Math.round(amount));
  return `${sign}${currency} ${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h`;
  const d = Math.floor(hr / 24);
  return `${d} d`;
}

function txIcon(type: string) {
  if (type === "Top up" || type === "Refund") return <ArrowDownLeft size={18} />;
  if (type === "Payment" || type === "Withdrawal") return <ArrowUpRight size={18} />;
  return <Zap size={18} />;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeStore();
  const { user } = useAuthStore();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [stats, setStats] = useState({ inflow: 0, outflow: 0 });
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [w, s, t] = await Promise.all([
          api<Wallet>('/wallets/me'),
          api<{ inflow: number; outflow: number }>('/wallets/me/stats?days=30'), // Monthly stats for dashboard
          api<{ data: Transaction[] }>('/wallets/me/transactions?take=3')
        ]);
        setWallet(w);
        setStats(s);
        setRecentTxns(t.data || []);
      } catch (err) {
        console.error("Dashboard load failed", err);
        setRecentTxns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const balance = wallet ? Number(wallet.balance) : 0;
  const currency = wallet?.currency || "UGX";

  // Calculate percentage change (mock logic as API might not return period comparison yet)
  const percentChange = stats.inflow > 0 ? "+12.4%" : "0%";

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

  return (
    <Box sx={{
      minHeight: '100%',
      position: 'relative',
      pb: { xs: 12, md: 8 }
    }}>
      {/* Background Mesh Gradient */}
      <Box sx={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '400px',
        zIndex: 0,
        background: `radial-gradient(circle at 15% 10%, ${alpha(EVZONE.green, 0.08)}, transparent 40%)`
      }} />

      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 6 }, position: 'relative', zIndex: 1 }}>
        <motion.div variants={containerVars} initial="hidden" animate="show">

          {/* Dashboard Content Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <motion.div variants={itemVars}>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: 'text.primary' }}>
                Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {greeting()}, {user?.firstName || 'User'}
              </Typography>
            </motion.div>
          </Box>

          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} lg={8}>
              {/* Wallet Hero Card */}
              <motion.div variants={itemVars}>
                <Paper sx={{
                  p: 0,
                  mb: 3,
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${mode === 'dark' ? '#0B1A17' : '#FFFFFF'} 0%, ${mode === 'dark' ? '#07110F' : '#F4FFFB'} 100%)`,
                  border: `1px solid ${EVZONE.divider[mode]}`,
                  boxShadow: EVZONE.shadows[mode].card
                }}>
                  <Box sx={{
                    position: 'absolute', top: -80, right: -20, width: 250, height: 250,
                    borderRadius: '50%', background: `radial-gradient(circle, ${alpha(EVZONE.green, 0.15)} 0%, transparent 70%)`, filter: 'blur(50px)'
                  }} />

                  <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-end' }, position: 'relative', zIndex: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WalletIcon size={16} /> Total Balance
                      </Typography>
                      {loading ? (
                        <Box sx={{ height: 60, display: 'flex', alignItems: 'center' }}><CircularProgress size={24} color="inherit" /></Box>
                      ) : (
                        <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.02em', color: 'text.primary' }}>
                          <span style={{ color: EVZONE.green }}>{currency}</span> {balance.toLocaleString()}
                        </Typography>
                      )}

                      <Chip label={`${percentChange} this month`} size="small" sx={{
                        bgcolor: alpha('#03cd8c', 0.1),
                        color: '#03cd8c',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: `1px solid ${alpha('#03cd8c', 0.2)}`
                      }} />
                    </Box>

                    <Box sx={{ mt: { xs: 3, md: 0 }, display: 'flex', gap: 2 }}>
                      <Button variant="contained" size="large" startIcon={<Plus size={18} />} onClick={() => navigate('/app/wallet/add-funds')} sx={{
                        borderRadius: '12px',
                        px: 3,
                        bgcolor: EVZONE.green,
                        color: '#fff',
                        fontWeight: 700,
                        boxShadow: `0 8px 16px ${alpha(EVZONE.green, 0.25)}`,
                        '&:hover': { bgcolor: alpha(EVZONE.green, 0.9) }
                      }}>
                        Add Funds
                      </Button>
                      <Button variant="outlined" size="large" startIcon={<ArrowUpRight size={18} />} onClick={() => navigate('/app/wallet/withdraw')} sx={{
                        borderRadius: '12px',
                        px: 3,
                        borderColor: alpha(theme.palette.text.primary, 0.2),
                        color: 'text.primary',
                        '&:hover': { borderColor: theme.palette.text.primary, bgcolor: alpha(theme.palette.text.primary, 0.05) }
                      }}>
                        Send
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>

              {/* Quick Actions Grid */}
              <motion.div variants={itemVars}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>Quick Actions</Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {[
                    { label: "Pay Bills", icon: <CreditCard size={20} />, color: EVZONE.orange, path: "/app/wallet" },
                    { label: "Security", icon: <ShieldCheck size={20} />, color: EVZONE.green, path: "/app/security" },
                    { label: "Orgs", icon: <Users size={20} />, color: EVZONE.green, path: "/app/orgs" },
                    { label: "Settings", icon: <Settings size={20} />, color: EVZONE.orange, path: "/app/profile" },
                  ].map((action, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                      <Paper onClick={() => navigate(action.path)} sx={{
                        borderRadius: '16px',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        border: `1px solid ${theme.palette.divider}`,
                        backdropFilter: 'blur(12px)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4],
                          borderColor: alpha(action.color, 0.5)
                        }
                      }}>
                        <Box sx={{
                          width: 44, height: 44,
                          borderRadius: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: alpha(action.color, 0.1),
                          border: `1px solid ${alpha(action.color, 0.2)}`,
                          color: action.color
                        }}>
                          {action.icon}
                        </Box>
                        <Typography variant="subtitle2" fontWeight={600} color="text.primary">{action.label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </Grid>

            {/* Right Column: Recent Activity */}
            <Grid item xs={12} lg={4}>
              <motion.div variants={itemVars}>
                <Paper sx={{
                  p: 3,
                  position: 'relative',
                  borderRadius: '16px',
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${theme.palette.divider}`,
                  backdropFilter: 'blur(12px)'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary">Recent Activity</Typography>
                    <IconButton size="small"><ArrowUpRight size={16} /></IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={20} /></Box>
                    ) : recentTxns.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>No recent transactions</Typography>
                    ) : (
                      recentTxns.map((txn) => {
                        const isCredit = txn.type === 'Top up' || txn.type === 'Refund';
                        return (
                          <Box key={txn.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                              width: 40, height: 40, borderRadius: '12px',
                              bgcolor: alpha(theme.palette.text.primary, 0.05),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'text.secondary'
                            }}>
                              {txIcon(txn.type)}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                                {txn.type}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {timeAgo(new Date(txn.createdAt).getTime())} • {txn.counterparty || (isCredit ? 'Deposit' : 'Transfer')}
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600} sx={{
                              color: isCredit ? EVZONE.green : 'text.primary'
                            }}>
                              {isCredit ? '+' : ''}{money(Number(txn.amount), txn.currency).replace(txn.currency, '')}
                            </Typography>
                          </Box>
                        );
                      })
                    )}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Button fullWidth endIcon={<ChevronRight size={16} />} onClick={() => navigate('/app/wallet/transactions')} sx={{
                    justifyContent: 'space-between',
                    color: 'text.secondary',
                    textTransform: 'none',
                    '&:hover': { color: 'text.primary', bgcolor: 'transparent' }
                  }}>
                    View all transactions
                  </Button>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
