import { useTranslation } from "react-i18next";
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const { t } = useTranslation("common"); {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    textAlign: 'center',
                    gap: 2,
                }}
            >
                <Typography variant="h1" sx={{ fontWeight: 900, fontSize: '6rem', color: theme.palette.primary.main }}>
                    404
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Page not found
                </Typography>
                <Typography color="text.secondary">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                    Go to Home
                </Button>
            </Box>
        </Container>
    );
}
