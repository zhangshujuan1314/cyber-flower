import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  openId: { type: String, required: true, unique: true, index: true },
  unionId: { type: String, sparse: true },
  nickname: { type: String, default: '新花友', maxlength: 32 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 140 },
  stats: {
    totalFlowers: { type: Number, default: 0 },
    currentFlowers: { type: Number, default: 0 },
    collectionCount: { type: Number, default: 0 },
    gardenLevel: { type: Number, default: 1, min: 1, max: 100 },
    careStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCareDate: { type: Date },
  },
  resources: {
    water: { type: Number, default: 3, min: 0, max: 20 },
    fertilizer: { type: Number, default: 1, min: 0, max: 10 },
    seedSlots: { type: Number, default: 3, min: 1, max: 9 },
    rareSeedCoupon: { type: Number, default: 0 },
  },
  preferences: {
    seasonNotifications: { type: Boolean, default: true },
    dailyReminder: { type: Boolean, default: true },
    dailyReminderTime: { type: String, default: '08:00' },
    darkMode: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
  },
  loginHistory: [{
    loginAt: Date,
    ip: String,
  }],
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'users',
});

// 索引
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'stats.gardenLevel': -1 });
