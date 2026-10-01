export const Colors = {
  // Primary palette - deep indigo/dark purple for a premium reader feel
  primary: '#7C3AED',        // violet-600
  primaryLight: '#A78BFA',   // violet-400
  primaryDark: '#5B21B6',    // violet-800

  // Background
  bg: '#0F0F1A',             // near-black with blue tint
  bgCard: '#1A1A2E',         // card background
  bgSurface: '#16213E',      // surface

  // Text
  textPrimary: '#F0F0FF',
  textSecondary: '#A0A0C0',
  textMuted: '#60607A',
  textAccent: '#A78BFA',

  // Borders
  border: '#2A2A4A',
  borderLight: '#3A3A5A',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Reader specific
  readerBg: '#0D1117',
  readerText: '#D1D5DB',
  readerBgSepia: '#F5E6C8',
  readerTextSepia: '#3D2B1F',

  // Tab bar
  tabActive: '#7C3AED',
  tabInactive: '#4A4A6A',

  // Genre tag
  tagBg: '#1E1B4B',
  tagText: '#818CF8',
  tagBorder: '#3730A3',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',

  // Reading sizes
  sizeSmall: 14,
  sizeBase: 16,
  sizeMedium: 18,
  sizeLarge: 20,
  sizeXL: 22,
  sizeXXL: 28,

  // Default reader font size
  readerDefault: 17,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};

export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};
