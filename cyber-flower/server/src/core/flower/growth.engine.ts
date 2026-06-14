import { Injectable } from '@nestjs/common';
import { Flower, GrowthStage, CareAction, Season } from '../../shared/types/models';
import { EmotionEngine, EmotionState } from '../../ai-layer/emotion-engine';

interface GrowthInput {
  flower: Flower;
  careHistory: Array<{ action: CareAction; value: number; timestamp: Date }>;
  seasonContext: { season: Season; solarTerm: string };
  emotionState?: EmotionState;
}

interface GrowthOutput {
  newStage: GrowthStage;
  healthDelta: number;
  happinessDelta: number;
  growthDelta: number;
  visualChanges: string[];
  shouldAdvanceStage: boolean;
  stageDescription: string;
}

@Injectable()
export class GrowthEngine {
  constructor(private emotionEngine: EmotionEngine) {}

  /** AI增强生长计算 */
  calculate(input: GrowthInput): GrowthOutput {
    const { flower, careHistory, seasonContext, emotionState } = input;

    // 1. 基础规则计算
    const baseHealth = this.calcBaseHealth(flower, careHistory);
    const baseHappiness = this.calcBaseHappiness(flower, careHistory, emotionState);
    const baseGrowth = this.calcBaseGrowth(flower, seasonContext);

    // 2. 季节修正
    const seasonModifier = this.getSeasonModifier(
      flower.genome.growth.seasonPreference,
      seasonContext.season,
    );

    // 3. 情绪对生长的影响
    const emotionModifier = emotionState
      ? 0.8 + emotionState.pleasure * 0.4 // 0.8~1.2
      : 1.0;

    // 4. 阶段推进判断
    const shouldAdvance = this.shouldAdvanceStage(flower, baseGrowth * seasonModifier * emotionModifier);

    // 5. 生成阶段描述
    const stageDescription = this.generateStageDescription(
      flower.stage,
      shouldAdvance ? this.getNextStage(flower.stage) : flower.stage,
      shouldAdvance,
      seasonContext,
    );

    return {
      newStage: shouldAdvance ? this.getNextStage(flower.stage) : flower.stage,
      healthDelta: baseHealth * seasonModifier,
      happinessDelta: baseHappiness * emotionModifier,
      growthDelta: baseGrowth * seasonModifier * emotionModifier,
      visualChanges: this.getVisualChanges(flower.stage, shouldAdvance),
      shouldAdvanceStage: shouldAdvance,
      stageDescription,
    };
  }

  private calcBaseHealth(flower: Flower, careHistory: GrowthInput['careHistory']): number {
    const recentCare = careHistory.filter(
      (c) => Date.now() - c.timestamp.getTime() < 86400000,
    );
    const waterCount = recentCare.filter((c) => c.action === 'water').length;
    const fertilizeCount = recentCare.filter((c) => c.action === 'fertilize').length;

    let health = 0;
    // 理想照料: 1-2次水/天, 0-1次施肥/天
    if (waterCount >= 1 && waterCount <= 2) health += 5;
    else if (waterCount === 0) health -= 3;
    else health += 2;

    if (fertilizeCount === 1) health += 3;
    else if (fertilizeCount > 1) health -= 2;

    // 品种抗逆性影响
    health *= 0.5 + flower.genome.growth.toughness * 0.5;

    return Math.round(health * 10) / 10;
  }

  private calcBaseHappiness(
    flower: Flower,
    careHistory: GrowthInput['careHistory'],
    emotionState?: EmotionState,
  ): number {
    let happiness = 0;

    // 互动频率
    const recentInteractions = careHistory.filter(
      (c) => Date.now() - c.timestamp.getTime() < 86400000,
    );
    if (recentInteractions.length >= 3) happiness += 5;
    else if (recentInteractions.length >= 1) happiness += 3;
    else happiness -= 2;

    // 对话加分
    const talkCount = recentInteractions.filter((c) => c.action === 'talk').length;
    happiness += talkCount * 2;

    // 情绪状态影响
    if (emotionState) {
      happiness += (emotionState.pleasure - 0.5) * 5;
      happiness += (emotionState.affinity - 0.5) * 3;
    }

    return Math.round(happiness * 10) / 10;
  }

  private calcBaseGrowth(flower: Flower, season: { season: Season }): number {
    const daysSincePlant = (Date.now() - flower.plantedAt.getTime()) / 86400000;
    const totalDays = flower.genome.growth.fullLifeDays;

    // 生长曲线: 前期加速 → 中期平稳 → 后期减速
    const progress = Math.min(daysSincePlant / totalDays, 1);
    const growthRate = Math.sin(progress * Math.PI) * 5;

    // 健康度影响生长速度
    const healthModifier = 0.3 + (flower.health / 100) * 0.7;

    return Math.round(growthRate * healthModifier * 10) / 10;
  }

  private getSeasonModifier(preference: Season, current: Season): number {
    if (preference === current) return 1.3;
    const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
    const dist = Math.abs(seasons.indexOf(preference) - seasons.indexOf(current));
    const circularDist = Math.min(dist, 4 - dist);
    const modifiers = [1.3, 0.9, 0.5, 0.2]; // 0=最佳 1=尚可 2=不利 3=休眠
    return modifiers[circularDist] || 0.5;
  }

  private shouldAdvanceStage(flower: Flower, growth: number): boolean {
    if (flower.stage === 'dormant') return false;
    if (growth <= 0) return false;
    if (flower.health < 30) return false; // 健康度太低不推进

    const stageDays = (
      Date.now() -
      (flower.stageTimestamps[flower.stage]?.getTime() || flower.plantedAt.getTime())
    ) / 86400000;

    const thresholds: Record<string, number> = {
      seed: flower.genome.growth.germinationDays,
      germinating: 4,
      growing: 7,
      budding: 4,
      blooming: flower.genome.growth.bloomDays - flower.genome.growth.germinationDays - 4 - 7 - 4,
      fruiting: 10,
    };

    const threshold = thresholds[flower.stage] || 7;

    // 生长值越高，越容易提前推进
    const growthBoost = growth > 3 ? 0.8 : growth > 1 ? 1.0 : 1.3;
    return stageDays >= threshold * growthBoost;
  }

  private getNextStage(stage: GrowthStage): GrowthStage {
    const order: GrowthStage[] = [
      'seed', 'germinating', 'growing', 'budding', 'blooming', 'fruiting', 'dormant',
    ];
    const idx = order.indexOf(stage);
    return idx < order.length - 1 ? order[idx + 1] : stage;
  }

  private getVisualChanges(stage: GrowthStage, advancing: boolean): string[] {
    if (!advancing) return [];
    const map: Record<string, string[]> = {
      seed: ['sprout_animation', 'soil_crack'],
      germinating: ['stem_emerging', 'cotyledon_unfold'],
      growing: ['true_leaf_growth', 'stem_thickening'],
      budding: ['bud_formation', 'color_hint'],
      blooming: ['petal_unfold_sequence', 'full_glory'],
      fruiting: ['seed_pod_develop', 'petal_fade'],
      dormant: ['leaf_drop', 'energy_conserve'],
    };
    return map[stage] || [];
  }

  /** 生成诗意的阶段描述 */
  private generateStageDescription(
    currentStage: GrowthStage,
    nextStage: GrowthStage,
    isAdvancing: boolean,
    season: { season: Season; solarTerm: string },
  ): string {
    if (!isAdvancing) {
      const resting: Record<string, string> = {
        seed: '种子在土壤中静静沉睡，等待萌发的时机',
        germinating: '嫩芽努力向上生长，每一天都在变强',
        growing: '叶片舒展开来，在阳光下进行光合作用',
        budding: '花苞紧闭着，里面藏着即将绽放的秘密',
        blooming: '花朵在最美的时刻停留，尽情展示色彩',
        fruiting: '花瓣渐渐收起，把能量留给下一代种子',
        dormant: '在冬日的宁静中休养生息，等待春天的召唤',
      };
      return resting[currentStage] || '安静地生长着';
    }

    const advancing: Record<string, string> = {
      seed: '种子裂开了！嫩绿的芽尖探出土壤，生命开始了 ✨',
      germinating: '第一片真叶舒展开来，茎秆变得更加挺拔 🌿',
      growing: '枝叶繁茂，植物的形态日渐丰满，充满力量 💪',
      budding: '花苞出现了！紧紧包裹的花瓣隐约透出色彩 🎨',
      blooming: '花朵盛开了！最美的时刻终于到来，整个花园都为之倾倒 🌸',
      fruiting: '花谢了，但新的种子正在孕育，生命的循环永不停歇 🔄',
      dormant: `${season.solarTerm}已至，花进入冬藏，在寂静中积蓄来年的力量 💤`,
    };
    return advancing[currentStage] || '正在发生变化...';
  }
}
