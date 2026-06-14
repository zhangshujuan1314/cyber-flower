import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../shared/types/models';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async findOrCreate(openId: string, unionId?: string): Promise<User> {
    let user = await this.userModel.findOne({ openId });
    if (!user) {
      user = await this.userModel.create({
        openId,
        unionId,
        nickname: '新花友',
        avatar: '',
        stats: {
          totalFlowers: 0, currentFlowers: 0, collectionCount: 0,
          gardenLevel: 1, careStreak: 0, longestStreak: 0,
        },
        resources: { water: 3, fertilizer: 1, seedSlots: 3, rareSeedCoupon: 0 },
      });
    }
    // 更新登录记录
    await this.userModel.updateOne(
      { _id: user._id },
      { $push: { loginHistory: { loginAt: new Date() } }, $set: { lastLoginAt: new Date() } },
    );
    return user.toObject();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('用户不存在');
    return user.toObject();
  }

  async findByOpenId(openId: string): Promise<User | null> {
    return this.userModel.findOne({ openId });
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!user) throw new NotFoundException('用户不存在');
    return user.toObject();
  }

  async updateStats(id: string, stats: Partial<User['stats']>): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { $set: { stats } });
  }

  async updateResources(id: string, resources: Partial<User['resources']>): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { $set: { resources } });
  }

  /** 更新连续照料天数 */
  async updateCareStreak(userId: string): Promise<number> {
    const user = await this.userModel.findById(userId);
    if (!user) return 0;

    const lastCare = user.stats.lastCareDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = user.stats.careStreak;
    if (lastCare) {
      const lastDate = new Date(lastCare);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);

      if (diffDays === 0) {
        // 今天已照料过
      } else if (diffDays === 1) {
        streak += 1; // 连续
      } else {
        streak = 1; // 断了
      }
    } else {
      streak = 1;
    }

    const longestStreak = Math.max(streak, user.stats.longestStreak);

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { 'stats.careStreak': streak, 'stats.longestStreak': longestStreak, 'stats.lastCareDate': new Date() } },
    );

    return streak;
  }
}
