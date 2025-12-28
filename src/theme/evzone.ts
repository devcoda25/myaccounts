import { alpha } from '@mui/material';

export const EVZONE = {
  green: '#03cd8c',
  orange: '#f77f00',
  divider: {
    light: 'rgba(11, 26, 23, 0.1)',
    dark: 'rgba(233, 255, 247, 0.12)',
  },
  shadows: {
    light: {
      card: '0 4px 20px rgba(0,0,0,0.05)',
    },
    dark: {
      card: '0 4px 20px rgba(0,0,0,0.4)',
    }
  }
} as const

export type EvzoneColor = keyof typeof EVZONE
