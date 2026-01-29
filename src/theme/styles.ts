/**
 * Shared Theme Styles
 * Common style constants used across components
 */

import { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const EVZONE = {
  green: '#03cd8c',
  orange: '#f77f00',
  red: '#dc2626',
  blue: '#2563eb',
} as const;

/**
 * Orange contained button style
 */
export const orangeContainedSx: SxProps<Theme> = {
  backgroundColor: EVZONE.orange,
  color: '#ffffff',
  '&:hover': {
    backgroundColor: alpha(EVZONE.orange, 0.85),
    color: '#ffffff',
  },
};

/**
 * Orange outlined button style
 */
export const orangeOutlinedSx: SxProps<Theme> = {
  borderColor: alpha(EVZONE.orange, 0.65),
  color: EVZONE.orange,
  '&:hover': {
    borderColor: EVZONE.orange,
    backgroundColor: alpha(EVZONE.orange, 0.08),
  },
};

/**
 * Green contained button style
 */
export const greenContainedSx: SxProps<Theme> = {
  backgroundColor: EVZONE.green,
  color: '#ffffff',
  '&:hover': {
    backgroundColor: alpha(EVZONE.green, 0.85),
    color: '#ffffff',
  },
};

/**
 * Card base style
 */
export const cardSx: SxProps<Theme> = {
  borderRadius: '4px',
};

/**
 * Background gradient for dark mode
 */
export const getDarkBg = () =>
  `radial-gradient(1200px 600px at 12% 2%, rgba(3,205,140,0.22), transparent 52%), radial-gradient(1000px 520px at 92% 6%, rgba(3,205,140,0.14), transparent 56%), linear-gradient(180deg, #04110D 0%, #07110F 60%, #07110F 100%)`;

/**
 * Background gradient for light mode
 */
export const getLightBg = () =>
  `radial-gradient(1100px 560px at 10% 0%, rgba(3,205,140,0.16), transparent 56%), radial-gradient(1000px 520px at 90% 0%, rgba(3,205,140,0.10), transparent 58%), linear-gradient(180deg, #FFFFFF 0%, #F4FFFB 60%, #ECFFF7 100%)`;

/**
 * Form field base style
 */
export const formFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: alpha('#000000', 0.1),
    },
    '&:hover fieldset': {
      borderColor: alpha(EVZONE.orange, 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: EVZONE.orange,
    },
  },
};

/**
 * Password strength indicator colors
 */
export const getStrengthColor = (score: number): string => {
  if (score <= 1) return EVZONE.red;
  if (score === 2) return '#f59e0b';
  if (score === 3) return '#eab308';
  if (score === 4) return EVZONE.green;
  return EVZONE.green;
};

/**
 * Status chip colors
 */
export const statusColors = {
  success: EVZONE.green,
  warning: '#f59e0b',
  error: EVZONE.red,
  info: EVZONE.blue,
  neutral: '#6b7280',
} as const;
