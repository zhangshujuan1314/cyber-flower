import { Schema } from 'mongoose';

export const FlowerSchema = new Schema({
  userId: { type: String, required: true, index: true },
  seedId: { type: String, required: true },
  name: { type: String, required: true },
  genome: { type: Schema.Types.Mixed, required: true },
  stage: {
    type: String,
    enum: ['seed', 'germinating', 'growing', 'budding', 'blooming', 'fruiting', 'dormant'],
    default: 'seed',
  },
  health: { type: Number, default: 80, min: 0, max: 100 },
  happiness: { type: Number, default: 60, min: 0, max: 100 },
  plantedAt: { type: Date, default: Date.now },
  stageTimestamps: { type: Map, of: Date, default: {} },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  personality: { type: Schema.Types.Mixed, required: true },
  visualState: { type: Schema.Types.Mixed, default: {} },
  memo: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
}, {
  timestamps: true,
  collection: 'flowers',
});

FlowerSchema.index({ userId: 1, stage: 1 });
FlowerSchema.index({ species: 1 });
