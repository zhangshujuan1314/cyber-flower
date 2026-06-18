import { Schema } from 'mongoose';

export const SeedSchema = new Schema({
  userId: { type: String, required: true, index: true },
  origin: {
    type: { type: String, enum: ['keyword', 'daily', 'gift', 'hybrid', 'event'], required: true },
    keyword: String,
    gifterId: String,
    eventId: String,
    parentSeeds: [String],
  },
  genome: { type: Schema.Types.Mixed, required: true },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common',
    index: true,
  },
  previewImage: { type: String, default: '' },
  growthStageImages: {
    seed: String,
    germinating: String,
    growing: String,
    budding: String,
    blooming: String,
    fruiting: String,
    dormant: String,
  },
  name: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  plantedAt: Date,
  status: {
    type: String,
    enum: ['idle', 'planted', 'expired', 'gifted'],
    default: 'idle',
    index: true,
  },
  giftedTo: String,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 86400000), // 30天后过期
  },
  metadata: Schema.Types.Mixed,
}, {
  timestamps: true,
  collection: 'seeds',
});

SeedSchema.index({ userId: 1, status: 1 });
SeedSchema.index({ rarity: 1, status: 1 });
