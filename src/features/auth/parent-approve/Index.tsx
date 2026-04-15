import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';

import AuthHeader from '@/components/layout/AuthHeader';
import { api } from '@/utils/api';
import { useAuthStore } from '@/stores/authStore';

export default function ParentApprovePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuthStore();

  const childId = searchParams.get('child') || '';
  const token = searchParams.get('token') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidLink = useMemo(() => !!childId && !!token, [childId, token]);

  useEffect(() => {
    // Attempt to refresh the API user if the session already exists.
    refreshUser().catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goSignIn = () => {
    navigate('/auth/sign-in', {
      state: {
        from: {
          pathname: location.pathname,
          search: location.search,
        },
      },
    });
  };

  const approve = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await api('/auth/minor-approval/approve', {
        method: 'POST',
        body: { childId, token },
      });
      setDone(true);
    } catch (e: any) {
      setError(e?.message || 'Approval failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="min-h-screen" sx={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)' }}>
      <AuthHeader title="EVzone" subtitle="Parent / Guardian Approval" />

      <Box className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
        <Card>
          <CardContent className="p-5 md:p-7">
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Approve Minor Account
              </Typography>

              {!isValidLink && (
                <Alert severity="error">
                  Invalid approval link. Please open the latest email and try again.
                </Alert>
              )}

              {isValidLink && !user && (
                <Alert severity="info">
                  Please sign in with the parent/guardian account ({`the email that received the approval link`}) to continue.
                </Alert>
              )}

              {error && <Alert severity="error">{error}</Alert>}

              {done ? (
                <Alert severity="success">
                  Approved. The child account can now access EVzone apps.
                </Alert>
              ) : (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                  {!user ? (
                    <Button variant="contained" onClick={goSignIn} disabled={!isValidLink}>
                      Sign In
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={approve}
                      disabled={!isValidLink || isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
                    >
                      {isSubmitting ? 'Approving…' : 'Approve'}
                    </Button>
                  )}

                  <Button variant="outlined" onClick={() => navigate('/')}>
                    Back to Home
                  </Button>
                </Stack>
              )}

              {isValidLink && (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Child ID: {childId}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}