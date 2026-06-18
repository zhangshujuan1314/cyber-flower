import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FlowerService } from '../flower/flower.service';
import { BreedService } from '../breed/breed.service';

export interface FriendRelation {
  _id: string;
  userId: string;
  friendId: string;
  status: 'active' | 'blocked';
  createdAt: Date;
  lastVisitedAt?: Date;
}

export interface GardenVisit {
  _id: string;
  visitorId: string;
  hostId: string;
  visitedAt: Date;
  liked: boolean;
  comment?: string;
}

@Injectable()
export class SocialService {
  constructor(
    @InjectModel('FriendRelation') private friendModel: Model<FriendRelation>,
    @InjectModel('GardenVisit') private visitModel: Model<GardenVisit>,
    private flowerService: FlowerService,
  ) {}

  // ============ 好友管理 ============

  /** 获取好友列表 */
  async getFriends(userId: string) {
    const relations = await this.friendModel.find({ userId, status: 'active' }).lean();

    const friends = [];
    for (const rel of relations) {
      const flowers = await this.flowerService.findByUser(rel.friendId);
      const blooming = flowers.filter((f) => f.stage === 'blooming');

      friends.push({
        _id: rel.friendId,
        flowerCount: flowers.length,
        bloomingCount: blooming.length,
        gardenLevel: 1, // TODO: 从UserService获取
        lastVisitedAt: rel.lastVisitedAt,
      });
    }

    return friends;
  }

  /** 添加好友 */
  async addFriend(userId: string, friendId: string) {
    const existing = await this.friendModel.findOne({ userId, friendId });
    if (existing) return existing;

    return this.friendModel.create({
      userId, friendId, status: 'active', createdAt: new Date(),
    });
  }

  /** 移除好友 */
  async removeFriend(userId: string, friendId: string) {
    await this.friendModel.deleteOne({ userId, friendId });
  }

  // ============ 花园互访 ============

  /** 访问好友花园 */
  async visitGarden(visitorId: string, hostId: string) {
    // 记录访问
    await this.visitModel.create({
      visitorId, hostId, visitedAt: new Date(), liked: false,
    });

    // 更新最近访问时间
    await this.friendModel.updateOne(
      { userId: visitorId, friendId: hostId },
      { $set: { lastVisitedAt: new Date() } },
    );

    // 获取主人花园的花朵
    const flowers = await this.flowerService.findByUser(hostId);

    // 获取访客的花朵 (用于对比/赠予)
    const visitorFlowers = await this.flowerService.findByUser(visitorId);

    return {
      hostFlowers: flowers,
      visitorHasGift: visitorFlowers.length > 0, // 有花才能送种子
      visitCount: await this.visitModel.countDocuments({ hostId }),
    };
  }

  /** 点赞花园 */
  async likeGarden(visitorId: string, hostId: string) {
    const visit = await this.visitModel.findOneAndUpdate(
      { visitorId, hostId },
      { $set: { liked: true } },
      { sort: { visitedAt: -1 }, new: true },
    );
    return { liked: !!visit?.liked };
  }

  /** 留言 */
  async commentGarden(visitorId: string, hostId: string, text: string) {
    return this.visitModel.findOneAndUpdate(
      { visitorId, hostId },
      { $set: { comment: text } },
      { sort: { visitedAt: -1 }, new: true },
    );
  }

  // ============ 通知 ============

  /** 获取未读通知 */
  async getNotifications(userId: string) {
    // 获取最近的访客
    const recentVisits = await this.visitModel
      .find({ hostId: userId, visitorId: { $ne: userId } })
      .sort({ visitedAt: -1 })
      .limit(10)
      .lean();

    // 获取礼物通知 (礼物是特殊的种子)
    // TODO: 从Seed Model查询gifted状态的种子

    return {
      visits: recentVisits.map((v) => ({
        type: 'visit',
        userId: v.visitorId,
        liked: v.liked,
        comment: v.comment,
        timestamp: v.visitedAt,
      })),
      gifts: [], // TODO
    };
  }
}
