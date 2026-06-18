/**
 * 赛博养花 — 核心数据模型类型定义
 */

// ============ 枚举 ============

export type GrowthStage = 'seed' | 'germinating' | 'growing' | 'budding' | 'blooming' | 'fruiting' | 'dormant';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type CareAction = 'water' | 'fertilize' | 'prune' | 'adjust_light' | 'talk';
export type SeedOrigin = 'keyword' | 'daily' | 'gift' | 'hybrid' | 'event';
export type SeedStatus = 'idle' | 'planted' | 'expired' | 'gifted';

// ============ 基因 (Genome) ============

export interface RGB {
  r: number; g: number; b: number;
}

export interface GenomeColors {
  petalPrimary: RGB;
  petalSecondary: RGB;
  petalAccent: RGB;
  center: RGB;
  leaf: RGB;
  stem: RGB;
}

export interface GenomeMorphology {
  petalShape: string;
  petalCount: number;
  petalLayers: number;
  bloomSize: number;
  stemHeight: number;
  leafDensity: number;
  leafShape: string;
}

export interface GenomeGrowth {
  germinationDays: number;
  bloomDays: number;
  fullLifeDays: number;
  seasonPreference: Season;
  waterNeed: number;
  lightNeed: number;
  toughness: number;
}

export interface Genome {
  species: string;
  displayName: string;
  parentLineage: string[];
  colors: GenomeColors;
  morphology: GenomeMorphology;
  growth: GenomeGrowth;
  rarity: Rarity;
  tags: string[];
}

// ============ 花朵 (Flower) ============

export interface FlowerVisualState {
  currentImage: string;
  scale: number;
  rotation: number;
  colorAdjust: { hue: number; saturation: number; brightness: number };
}

export interface FlowerPersonality {
  name: string;
  tone: string;
  speakingStyle: string;
  moodBaseline: number;
}

export interface Flower {
  _id: string;
  userId: string;
  seedId: string;
  name: string;
  genome: Genome;
  stage: GrowthStage;
  health: number;
  happiness: number;
  plantedAt: Date;
  stageTimestamps: Record<GrowthStage, Date>;
  position: { x: number; y: number };
  personality: FlowerPersonality;
  visualState: FlowerVisualState;
  memo: string;
  isFavorite: boolean;
}

// ============ 种子 (Seed) ============

export interface SeedOriginData {
  type: SeedOrigin;
  keyword?: string;
  gifterId?: string;
  eventId?: string;
  parentSeeds?: [string, string];
}

export interface Seed {
  _id: string;
  userId: string;
  origin: SeedOriginData;
  genome: Genome;
  rarity: Rarity;
  previewImage: string;
  name: string;
  generatedAt: Date;
  plantedAt?: Date;
  status: SeedStatus;
}

// ============ 用户 (User) ============

export interface UserStats {
  totalFlowers: number;
  currentFlowers: number;
  collectionCount: number;
  gardenLevel: number;
  careStreak: number;
  longestStreak: number;
  lastCareDate?: Date;
}

export interface UserResources {
  water: number;
  fertilizer: number;
  seedSlots: number;
  rareSeedCoupon: number;
}

export interface User {
  _id: string;
  openId: string;
  nickname: string;
  avatar: string;
  createdAt: Date;
  stats: UserStats;
  resources: UserResources;
}

// ============ 照料记录 (CareLog) ============

export interface CareLog {
  _id: string;
  flowerId: string;
  userId: string;
  action: CareAction;
  value: number;
  timestamp: Date;
  effect: {
    healthDelta: number;
    happinessDelta: number;
    growthDelta: number;
  };
}

// ============ 对话消息 (ChatMessage) ============

export interface ChatMessage {
  _id: string;
  flowerId: string;
  userId: string;
  role: 'user' | 'flower';
  text: string;
  emotion?: string;
  timestamp: Date;
}
