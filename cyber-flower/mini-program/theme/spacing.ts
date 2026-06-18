/**
 * 赛博养花 — 间距与尺寸系统
 */

export const SPACING = {
  xs: '4rpx',
  sm: '8rpx',
  md: '16rpx',
  lg: '24rpx',
  xl: '32rpx',
  '2xl': '48rpx',
  '3xl': '64rpx',
} as const;

export const RADIUS = {
  sm: '8rpx',
  md: '12rpx',
  lg: '16rpx',
  xl: '20rpx',
  '2xl': '24rpx',
  full: '9999rpx',
} as const;

export const SHADOW = {
  sm: '0 2rpx 8rpx rgba(26, 58, 42, 0.04)',
  md: '0 4rpx 20rpx rgba(26, 58, 42, 0.08)',
  lg: '0 8rpx 32rpx rgba(26, 58, 42, 0.12)',
  xl: '0 16rpx 48rpx rgba(26, 58, 42, 0.16)',
} as const;

/** 按钮高度 */
export const BUTTON_HEIGHT = '88rpx';

/** 底部导航高度 */
export const TAB_BAR_HEIGHT = '100rpx';

/** 卡片内边距 */
export const CARD_PADDING = '24rpx';

/** 页面水平边距 */
export const PAGE_HORIZONTAL_PADDING = '32rpx';
