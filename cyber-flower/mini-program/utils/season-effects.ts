/**
 * 赛博养花 — 节气花园氛围系统
 * 二十四节气 → 视觉参数映射
 */
import { getCurrentSolarTerm } from './season-utils';

export interface GardenAtmosphere {
  bgGradient: string;          // 背景渐变CSS
  particleType: ParticleType;  // 粒子类型
  particleColor: string;       // 粒子颜色
  particleDensity: number;     // 粒子密度 0-1
  lightAngle: number;          // 光照角度 (度)
  lightIntensity: number;      // 光照强度 0-1
  lightColor: string;          // 光源色温
  ambientSound: string;        // 环境音效 (预留)
  filterOverlay: string;       // CSS滤镜叠加
  description: string;         // 描述
}

export type ParticleType = 'petal' | 'leaf' | 'snow' | 'rain' | 'sparkle' | 'pollen' | 'none';

interface ParticleConfig {
  type: ParticleType;
  colors: string[];
  size: [number, number]; // [min, max]
  speed: [number, number];
  sway: number;
  opacity: number;
  fallRotation: boolean;
}

export const SEASON_ATMOSPHERES: Record<string, GardenAtmosphere> = {
  // 春季节气
  lichun: { bgGradient: 'linear-gradient(180deg, #F5F9F5 0%, #FFF0F5 100%)', particleType: 'petal', particleColor: '#FFB7C5', particleDensity: 0.3, lightAngle: 60, lightIntensity: 0.7, lightColor: '#FFF8E1', ambientSound: 'spring_breeze', filterOverlay: '', description: '东风解冻，冰雪初融' },
  chunfen: { bgGradient: 'linear-gradient(180deg, #F0F9F0 0%, #FFF8F0 100%)', particleType: 'pollen', particleColor: '#FFE082', particleDensity: 0.5, lightAngle: 90, lightIntensity: 0.9, lightColor: '#FFFFFF', ambientSound: 'birds', filterOverlay: 'brightness(1.05)', description: '春分和煦，万物生发' },
  guyu: { bgGradient: 'linear-gradient(180deg, #E8F5E9 0%, #F3E5F5 100%)', particleType: 'rain', particleColor: 'rgba(100,180,255,0.3)', particleDensity: 0.4, lightAngle: 70, lightIntensity: 0.6, lightColor: '#E3F2FD', ambientSound: 'rain', filterOverlay: 'saturate(1.1)', description: '雨生百谷，花苞饱满' },

  // 夏季节气
  lixia: { bgGradient: 'linear-gradient(180deg, #E8F8E0 0%, #FFFDE7 100%)', particleType: 'sparkle', particleColor: '#FFD54F', particleDensity: 0.3, lightAngle: 100, lightIntensity: 1.0, lightColor: '#FFF9C4', ambientSound: 'crickets', filterOverlay: 'contrast(1.05)', description: '日照渐长，绿意满园' },
  xiazhi: { bgGradient: 'linear-gradient(180deg, #FFF8E1 0%, #E0F7FA 100%)', particleType: 'sparkle', particleColor: '#FFAB00', particleDensity: 0.4, lightAngle: 110, lightIntensity: 1.0, lightColor: '#FFECB3', ambientSound: 'cicadas', filterOverlay: 'brightness(1.1) contrast(1.05)', description: '夏至日长，阳光最盛' },

  // 秋季节气
  liqiu: { bgGradient: 'linear-gradient(180deg, #FFF8F0 0%, #FBE9E7 100%)', particleType: 'leaf', particleColor: '#D2691E', particleDensity: 0.4, lightAngle: 80, lightIntensity: 0.8, lightColor: '#FFCC80', ambientSound: 'autumn_wind', filterOverlay: 'saturate(0.9)', description: '凉风渐起，叶色转金' },
  qiufen: { bgGradient: 'linear-gradient(180deg, #FFF3E0 0%, #FCE4EC 100%)', particleType: 'leaf', particleColor: '#FF8A65', particleDensity: 0.6, lightAngle: 70, lightIntensity: 0.7, lightColor: '#FFE0B2', ambientSound: 'leaves', filterOverlay: 'saturate(1.15) contrast(1.05)', description: '秋高气爽，花色浓郁' },

  // 冬季节气
  lidong: { bgGradient: 'linear-gradient(180deg, #F5F5F5 0%, #ECEFF1 100%)', particleType: 'snow', particleColor: 'rgba(255,255,255,0.8)', particleDensity: 0.3, lightAngle: 50, lightIntensity: 0.5, lightColor: '#CFD8DC', ambientSound: 'winter_wind', filterOverlay: 'brightness(0.9) saturate(0.8)', description: '初雪轻覆，花入冬藏' },
  dongzhi: { bgGradient: 'linear-gradient(180deg, #ECEFF1 0%, #E8EAF6 100%)', particleType: 'snow', particleColor: 'rgba(255,255,255,0.9)', particleDensity: 0.7, lightAngle: 40, lightIntensity: 0.4, lightColor: '#B0BEC5', ambientSound: 'silence', filterOverlay: 'brightness(0.85) saturate(0.7)', description: '阴极阳生，静待春归' },
};

/** 粒子配置映射 */
export const PARTICLE_CONFIGS: Record<ParticleType, ParticleConfig> = {
  petal:   { type: 'petal', colors: ['#FFB7C5','#F8BBD0','#FFE0B2'], size: [6,14], speed: [0.2,0.8], sway: 3, opacity: 0.7, fallRotation: true },
  leaf:    { type: 'leaf', colors: ['#D2691E','#FF8A65','#B8860B','#A0522D'], size: [8,18], speed: [0.3,1.0], sway: 4, opacity: 0.8, fallRotation: true },
  snow:    { type: 'snow', colors: ['rgba(255,255,255,0.8)','rgba(255,255,255,0.6)','rgba(240,245,255,0.7)'], size: [3,8], speed: [0.1,0.4], sway: 1, opacity: 0.7, fallRotation: false },
  rain:    { type: 'rain', colors: ['rgba(100,180,255,0.3)','rgba(120,180,230,0.25)'], size: [1,3], speed: [2,5], sway: 0, opacity: 0.4, fallRotation: false },
  sparkle: { type: 'sparkle', colors: ['#FFD54F','#FFF176','#FFE082'], size: [2,6], speed: [0.5,1.5], sway: 1, opacity: 0.6, fallRotation: false },
  pollen:  { type: 'pollen', colors: ['#FFE082','#FFF9C4','#FFCC80'], size: [1,4], speed: [0.1,0.3], sway: 2, opacity: 0.5, fallRotation: false },
  none:    { type: 'none', colors: [], size: [0,0], speed: [0,0], sway: 0, opacity: 0, fallRotation: false },
};

/** 获取当前花园氛围 */
export function getCurrentGardenAtmosphere(): GardenAtmosphere {
  const term = getCurrentSolarTerm();
  const termKey = Object.keys(SEASON_ATMOSPHERES).find((k) =>
    term.name.includes(k) || k.includes(term.name)
  );

  if (termKey) return SEASON_ATMOSPHERES[termKey];

  // 降级：使用季节默认
  const seasonDefaults: Record<string, GardenAtmosphere> = {
    spring: SEASON_ATMOSPHERES.chunfen,
    summer: SEASON_ATMOSPHERES.xiazhi,
    autumn: SEASON_ATMOSPHERES.qiufen,
    winter: SEASON_ATMOSPHERES.dongzhi,
  };
  return seasonDefaults[term.season] || SEASON_ATMOSPHERES.chunfen;
}

/** 获取粒子配置 */
export function getParticleConfig(type: ParticleType): ParticleConfig {
  return PARTICLE_CONFIGS[type] || PARTICLE_CONFIGS.none;
}
