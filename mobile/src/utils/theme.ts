// Theme màu giống web - xanh lá
export const Colors = {
  // Primary - xanh lá như web (#71bc00)
  primary: '#71bc00',
  primaryLight: '#90d020',
  primaryDark: '#046106',
  primaryGradient: ['#71bc00', '#046106'],

  // Background - sáng như web
  bg: '#eeeeee',
  bgCard: '#ffffff',
  bgSurface: '#f5f5f5',
  bgHeader: '#71bc00',     // navbar xanh lá

  // Text
  textPrimary: '#220f03',   // màu chữ web
  textSecondary: '#555555',
  textMuted: '#888888',
  textAccent: '#008000',    // link web
  textOnGreen: '#ffffff',   // chữ trắng trên nền xanh

  // Borders
  border: '#cccccc',
  borderLight: '#e0e0e0',
  borderGreen: '#71bc00',

  // Status
  success: '#71bc00',
  warning: '#ff6702',       // hover color web
  error: '#cc0000',

  // Reader specific (giữ dark mode cho reader)
  readerBg: '#1a1a1a',
  readerText: '#D1D5DB',
  readerBgLight: '#f8f6f0',
  readerTextLight: '#220f03',
  readerBgSepia: '#F5E6C8',
  readerTextSepia: '#3D2B1F',

  // Tab bar
  tabActive: '#046106',
  tabInactive: '#888888',
  tabBarBg: '#71bc00',

  // Tags/badges
  tagBg: '#e8f5d0',
  tagText: '#046106',
  tagBorder: '#71bc00',

  // Pagination
  pageBg: '#71bc00',
  pageText: '#ffffff',
  pageInactive: '#dddddd',
  pageInactiveText: '#666666',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  size12: 12,
  sizeSmall: 13,
  sizeBase: 14,
  sizeMedium: 15,
  sizeLarge: 16,
  sizeXL: 18,
  sizeXXL: 20,
  readerDefault: 17,
};

export const Spacing = {
  xs: 3,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 3,
  md: 6,
  lg: 10,
  full: 999,
};

export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
};
