/**
 * 赛博养花 — 花朵情绪引擎
 * 多维情绪模型: 愉悦度 × 唤醒度 × 亲和度
 */
import { Injectable } from '@nestjs/common';
import { CareAction } from '../shared/types/models';

export interface EmotionState {
  pleasure: number;      // 愉悦度 0-1 (开心←→不开心)
  arousal: number;       // 唤醒度 0-1 (兴奋←→平静)
  affinity: number;      // 亲和度 0-1 (亲近←→疏远)
}

export interface EmotionLabel {
  primary: string;       // 主情绪: happy/sad/neutral/excited/caring/concerned/playful/sleepy
  intensity: number;     // 强度 0-1
  description: string;   // 诗意描述
}

interface EmotionHistoryEntry {
  timestamp: Date;
  trigger: string;
  pleasureDelta: number;
  arousalDelta: number;
  affinityDelta: number;
}

@Injectable()
export class EmotionEngine {
  private emotionHistory: Map<string, EmotionHistoryEntry[]> = new Map();

  /** 初始化情绪状态 */
  init(personalityBaseline: number): EmotionState {
    return {
      pleasure: 0.5 + (personalityBaseline - 0.5) * 0.4,
      arousal: 0.5,
      affinity: 0.3, // 初始亲和度较低，随时间增长
    };
  }

  /** 照料行为对情绪的影响 */
  applyCare(current: EmotionState, action: CareAction, quality: number): EmotionState {
    const impacts: Record<CareAction, { pleasure: number; arousal: number; affinity: number }> = {
      water:      { pleasure: +0.08, arousal: +0.03, affinity: +0.05 },
      fertilize:  { pleasure: +0.06, arousal: +0.05, affinity: +0.04 },
      prune:      { pleasure: +0.04, arousal: -0.05, affinity: +0.03 },
      adjust_light: { pleasure: +0.05, arousal: +0.02, affinity: +0.02 },
      talk:       { pleasure: +0.10, arousal: +0.08, affinity: +0.12 },
    };

    const impact = impacts[action];
    const q = quality / 100; // 0-1

    return {
      pleasure: this.clamp(current.pleasure + impact.pleasure * q),
      arousal: this.clamp(current.arousal + impact.arousal * q),
      affinity: this.clamp(current.affinity + impact.affinity * q),
    };
  }

  /** 时间流逝对情绪的影响 (每小时调用) */
  applyTimeDecay(current: EmotionState, hoursSinceLastCare: number): EmotionState {
    const decayRate = 0.01 * Math.min(hoursSinceLastCare / 6, 3); // 6小时后加速衰减

    return {
      pleasure: this.clamp(current.pleasure - decayRate),
      arousal: this.clamp(current.arousal - decayRate * 0.5),
      affinity: this.clamp(current.affinity - decayRate * 0.3),
    };
  }

  /** 情绪→标签映射 */
  getEmotionLabel(state: EmotionState): EmotionLabel {
    const { pleasure, arousal, affinity } = state;

    // 二维情绪映射
    if (pleasure > 0.6 && arousal > 0.6) {
      return { primary: 'excited', intensity: 0.8, description: '充满活力，花朵微微颤动' };
    } else if (pleasure > 0.6 && arousal <= 0.6) {
      return { primary: 'happy', intensity: 0.6, description: '安静地开心，花瓣柔和舒展' };
    } else if (pleasure >= 0.4 && arousal > 0.6) {
      return { primary: 'playful', intensity: 0.5, description: '调皮地想引起注意' };
    } else if (pleasure >= 0.4 && arousal <= 0.6) {
      return { primary: 'neutral', intensity: 0.3, description: '平静地享受时光' };
    } else if (pleasure < 0.4 && arousal > 0.6) {
      return { primary: 'concerned', intensity: 0.7, description: '焦虑不安，叶片微微下垂' };
    } else if (pleasure < 0.4 && arousal <= 0.6) {
      return { primary: 'sad', intensity: 0.6, description: '有些低落，花朵低垂' };
    }

    // 高亲和度加成
    if (affinity > 0.7 && pleasure > 0.5) {
      return { primary: 'caring', intensity: 0.7, description: '深深依恋着你' };
    }
    if (affinity < 0.2) {
      return { primary: 'sleepy', intensity: 0.4, description: '还在适应新环境' };
    }

    return { primary: 'neutral', intensity: 0.3, description: '安静地待着' };
  }

  /** 获取情绪对应的视觉表达 */
  getVisualExpression(label: EmotionLabel): {
    petalAngle: number;
    swayAmplitude: number;
    colorShift: { hue: number; saturation: number };
  } {
    const expressions: Record<string, { petalAngle: number; swayAmplitude: number; colorShift: { hue: number; saturation: number } }> = {
      excited: { petalAngle: 5, swayAmplitude: 0.03, colorShift: { hue: 5, saturation: 1.2 } },
      happy: { petalAngle: 2, swayAmplitude: 0.015, colorShift: { hue: 0, saturation: 1.1 } },
      neutral: { petalAngle: 0, swayAmplitude: 0.01, colorShift: { hue: 0, saturation: 1 } },
      playful: { petalAngle: 8, swayAmplitude: 0.04, colorShift: { hue: 10, saturation: 1.15 } },
      concerned: { petalAngle: -5, swayAmplitude: 0.005, colorShift: { hue: -5, saturation: 0.85 } },
      sad: { petalAngle: -10, swayAmplitude: 0.003, colorShift: { hue: -10, saturation: 0.7 } },
      caring: { petalAngle: 3, swayAmplitude: 0.02, colorShift: { hue: 8, saturation: 1.15 } },
      sleepy: { petalAngle: -2, swayAmplitude: 0.002, colorShift: { hue: -3, saturation: 0.9 } },
    };
    return expressions[label.primary] || expressions.neutral;
  }

  private clamp(v: number): number { return Math.max(0, Math.min(1, v)); }
}
