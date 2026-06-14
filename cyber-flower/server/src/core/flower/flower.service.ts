import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flower, CareAction, GrowthStage } from '../../shared/types/models';
import { GrowthEngine } from './growth.engine';

@Injectable()
export class FlowerService {
  constructor(
    @InjectModel('Flower') private flowerModel: Model<Flower>,
    @InjectModel('CareLog') private careLogModel: Model<Record<string, unknown>>,
    private growthEngine: GrowthEngine,
  ) {}

  async create(data: Partial<Flower>): Promise<Flower> {
    const flower = new this.flowerModel({
      ...data,
      stage: 'seed',
      health: 80,
      happiness: 60,
      stageTimestamps: { seed: new Date() },
    });
    return (await flower.save()).toObject();
  }

  async findById(id: string): Promise<Flower> {
    const flower = await this.flowerModel.findById(id);
    if (!flower) throw new NotFoundException('花朵不存在');
    return flower.toObject();
  }

  async findByUser(userId: string): Promise<Flower[]> {
    return this.flowerModel.find({ userId }).sort({ plantedAt: -1 }).lean();
  }

  async update(id: string, userId: string, updates: Partial<Flower>): Promise<Flower> {
    const flower = await this.flowerModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true },
    );
    if (!flower) throw new NotFoundException('花朵不存在');
    return flower.toObject();
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.flowerModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) throw new NotFoundException('花朵不存在');
  }

  async care(
    flowerId: string,
    userId: string,
    action: CareAction,
    value: number,
  ) {
    const flower = await this.findById(flowerId);
    if (flower.userId !== userId) throw new ForbiddenException('无权操作此花朵');

    // 生长引擎计算
    const result = this.growthEngine.calculate({
      flower,
      careHistory: [{ action, value, timestamp: new Date() }],
      seasonContext: { season: 'spring', solarTerm: 'guyu' },
    });

    // 保存照料日志
    await this.careLogModel.create({
      flowerId: flower._id,
      userId,
      action,
      value,
      effect: {
        healthDelta: result.healthDelta,
        happinessDelta: result.happinessDelta,
        growthDelta: result.growthDelta,
      },
      timestamp: new Date(),
    });

    // 更新花朵状态
    const updates: Record<string, unknown> = {
      health: Math.min(100, Math.max(0, flower.health + result.healthDelta)),
      happiness: Math.min(100, Math.max(0, flower.happiness + result.happinessDelta)),
    };

    if (result.shouldAdvanceStage) {
      updates.stage = result.newStage;
      updates['stageTimestamps.' + result.newStage] = new Date();
    }

    const updated = await this.flowerModel.findByIdAndUpdate(
      flowerId,
      { $set: updates },
      { new: true },
    );

    return {
      flower: updated!.toObject(),
      effect: {
        healthDelta: result.healthDelta,
        happinessDelta: result.happinessDelta,
        growthDelta: result.growthDelta,
      },
      animation: {
        type: action === 'water' ? 'water_drop' : action === 'fertilize' ? 'particle_spread' : 'gentle_sway',
      },
    };
  }

  async getTimeline(flowerId: string) {
    const flower = await this.findById(flowerId);
    return Object.entries(flower.stageTimestamps || {}).map(([stage, date]) => ({
      stage: stage as GrowthStage,
      date,
    }));
  }

  async getCareHistory(flowerId: string, limit = 20) {
    return this.careLogModel.find({ flowerId }).sort({ timestamp: -1 }).limit(limit).lean();
  }
}
