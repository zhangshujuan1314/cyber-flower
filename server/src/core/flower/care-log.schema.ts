import { Schema } from 'mongoose';

export const CareLogSchema = new Schema({
  flowerId: { type: Schema.Types.ObjectId, ref: 'Flower', required: true, index: true },
  userId: { type: String, required: true, index: true },
  action: {
    type: String,
    enum: ['water', 'fertilize', 'prune', 'adjust_light', 'talk'],
    required: true,
  },
  value: { type: Number, required: true, min: 0, max: 100 },
  timestamp: { type: Date, default: Date.now, index: true },
  effect: {
    healthDelta: { type: Number, default: 0 },
    happinessDelta: { type: Number, default: 0 },
    growthDelta: { type: Number, default: 0 },
  },
  note: String,
}, {
  timestamps: true,
  collection: 'care_logs',
});

CareLogSchema.index({ flowerId: 1, timestamp: -1 });
CareLogSchema.index({ userId: 1, timestamp: -1 });
