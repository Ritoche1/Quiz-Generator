export const theme = {
  colors: {
    // Electric Blue (Primary)
    electricBlue: '#00D4FF',
    electricBlueDark: '#0099CC',
    electricBlueLight: '#33DDFF',
    
    // Dark Mode Background
    backgroundDark: '#0A0A0B',
    backgroundMedium: '#1A1A1B',
    backgroundLight: '#2A2A2B',
    
    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#B8B8B8',
    textMuted: '#888888',
    
    // Status Colors
    success: '#00FF88',
    warning: '#FFB800',
    error: '#FF4444',
    
    // Glass Effect
    glassBackground: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    
    // Font Sizes
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    
    // Font Weights
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  spacing: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
  },
  
  effects: {
    glassMorphism: `
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `,
    electricGlow: `
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
      border: 1px solid #00D4FF;
    `,
    insetShadow: `
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
    `,
  },
}

export type Theme = typeof theme