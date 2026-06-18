/**
 * 赛博养花 — 字体系统
 */

export interface TypographyScale {
  size: string;
  lineHeight: number;
  weight: 400 | 500 | 600 | 700;
}

export const TYPOGRAPHY: Record<string, TypographyScale> = {
  h1: { size: '36rpx', lineHeight: 1.3, weight: 700 },
  h2: { size: '30rpx', lineHeight: 1.3, weight: 600 },
  h3: { size: '26rpx', lineHeight: 1.4, weight: 500 },
  h4: { size: '22rpx', lineHeight: 1.4, weight: 500 },
  bodyLg: { size: '18rpx', lineHeight: 1.6, weight: 400 },
  body: { size: '16rpx', lineHeight: 1.6, weight: 400 },
  bodySm: { size: '14rpx', lineHeight: 1.5, weight: 400 },
  caption: { size: '12rpx', lineHeight: 1.4, weight: 400 },
  number: { size: '40rpx', lineHeight: 1.2, weight: 700 },
};

export const FONT_FAMILY = {
  display: "'Songti SC', 'Noto Serif CJK SC', 'STSong', serif",
  body: "-apple-system, 'PingFang SC', 'Noto Sans CJK SC', sans-serif",
  number: "SF Pro Text, -apple-system, sans-serif",
};
