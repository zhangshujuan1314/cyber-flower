/**
 * 赛博养花 — 色彩系统
 * 支持四季切换的动态配色方案
 */

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  bg: string;
  bgAlt: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

export interface SeasonPalettes {
  spring: ColorPalette;
  summer: ColorPalette;
  autumn: ColorPalette;
  winter: ColorPalette;
}

export const SEASON_PALETTES: SeasonPalettes = {
  spring: {
    primary: '#3E7B52',
    primaryLight: '#A3D9B1',
    primaryDark: '#1A3A2A',
    secondary: '#C4A265',
    accent: '#FFB7C5',
    bg: '#F5F9F5',
    bgAlt: '#FDF2F5',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B6B7B',
    border: 'rgba(62, 123, 82, 0.10)',
    shadow: 'rgba(26, 58, 42, 0.06)',
  },

  summer: {
    primary: '#2E7D32',
    primaryLight: '#81C784',
    primaryDark: '#1B5E20',
    secondary: '#FFD54F',
    accent: '#FFD700',
    bg: '#F0F8F0',
    bgAlt: '#FFFDF0',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B6B7B',
    border: 'rgba(46, 125, 50, 0.10)',
    shadow: 'rgba(27, 94, 32, 0.06)',
  },

  autumn: {
    primary: '#8B6914',
    primaryLight: '#D4A853',
    primaryDark: '#5C3D2E',
    secondary: '#D2691E',
    accent: '#E75480',
    bg: '#FFF8F0',
    bgAlt: '#FFF5EE',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B6B7B',
    border: 'rgba(139, 105, 20, 0.10)',
    shadow: 'rgba(92, 61, 46, 0.06)',
  },

  winter: {
    primary: '#2D5A3D',
    primaryLight: '#8FBC8F',
    primaryDark: '#1A3A2A',
    secondary: '#B0C4DE',
    accent: '#E75480',
    bg: '#F8FAFB',
    bgAlt: '#F0F4F8',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B6B7B',
    border: 'rgba(45, 90, 61, 0.10)',
    shadow: 'rgba(26, 58, 42, 0.06)',
  },
};

/**
 * 稀有度色彩映射
 */
export const RARITY_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  common: {
    bg: '#F5F0EB',
    text: '#6B6B7B',
    glow: 'rgba(107, 107, 123, 0.3)',
  },
  uncommon: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    glow: 'rgba(76, 175, 80, 0.3)',
  },
  rare: {
    bg: '#EDE7F6',
    text: '#7C4DFF',
    glow: 'rgba(124, 77, 255, 0.3)',
  },
  epic: {
    bg: '#FFF3E0',
    text: '#FF6D00',
    glow: 'rgba(255, 109, 0, 0.3)',
  },
  legendary: {
    bg: '#FCE4EC',
    text: '#C71585',
    glow: 'rgba(199, 21, 133, 0.3)',
  },
};

/**
 * 花朵健康度色彩映射
 */
export const HEALTH_COLORS = {
  excellent: '#4CAF50',  // 90-100
  good: '#8BC34A',       // 70-89
  fair: '#FFC107',       // 40-69
  poor: '#FF9800',       // 20-39
  critical: '#E57373',   // 0-19
};

/**
 * 获取当前季节调色板
 */
export function getSeasonPalette(season?: string): ColorPalette {
  if (!season) {
    // 自动检测
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();

    if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
      season = 'spring';
    } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 23)) {
      season = 'summer';
    } else if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day < 21)) {
      season = 'autumn';
    } else {
      season = 'winter';
    }
  }

  return SEASON_PALETTES[season as keyof SeasonPalettes] || SEASON_PALETTES.spring;
}
