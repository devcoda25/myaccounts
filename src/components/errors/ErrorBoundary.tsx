import React from 'react'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: unknown }

const EVZONE = { green: '#03cd8c', orange: '#f77f00' } as const

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('EVzone ErrorBoundary:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Box
        className="min-h-screen"
        sx={{
          display: 'grid',
          placeItems: 'center',
          backgroundColor: EVZONE.green,
          padding: 2,
        }}
      >
        <Card sx={{ maxWidth: 680, width: '100%', borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              Something went wrong
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.85 }}>
              The page crashed unexpectedly. You can refresh to try again.
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{
                  backgroundColor: EVZONE.orange,
                  color: '#fff',
                  fontWeight: 800,
                  borderRadius: 999,
                  px: 2.4,
                  '&:hover': { backgroundColor: EVZONE.orange },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                onClick={() => this.setState({ hasError: false, error: undefined })}
                sx={{
                  borderColor: EVZONE.orange,
                  color: EVZONE.orange,
                  fontWeight: 800,
                  borderRadius: 999,
                  px: 2.4,
                  '&:hover': { borderColor: EVZONE.orange, backgroundColor: 'rgba(247,127,0,0.08)' },
                }}
              >
                Try again
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }
}
