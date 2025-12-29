import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UserSessions() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId } = useParams();

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowLeftIcon size={18} />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    Back
                </Button>
                <Typography variant="h4" fontWeight={800}>
                    User Sessions
                </Typography>
                <Typography color="text.secondary">
                    Manage active sessions for user ID: {userId}
                </Typography>
            </Box>

            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                <Typography variant="body1" color="text.secondary">
                    No active sessions found for this user.
                </Typography>
            </Paper>
        </Box>
    );
}
