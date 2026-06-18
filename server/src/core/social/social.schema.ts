import { Schema } from 'mongoose';

export const FriendRelationSchema = new Schema({
  userId: { type: String, required: true, index: true },
  friendId: { type: String, required: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  lastVisitedAt: Date,
}, { collection: 'friend_relations' });

FriendRelationSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const GardenVisitSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  hostId: { type: String, required: true, index: true },
  visitedAt: { type: Date, default: Date.now },
  liked: { type: Boolean, default: false },
  comment: { type: String, maxlength: 200 },
}, { collection: 'garden_visits' });

GardenVisitSchema.index({ hostId: 1, visitedAt: -1 });
