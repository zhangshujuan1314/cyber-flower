import { Schema } from 'mongoose';

export const ChatMessageSchema = new Schema({
  flowerId: { type: Schema.Types.ObjectId, ref: 'Flower', required: true, index: true },
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'flower'], required: true },
  text: { type: String, required: true, maxlength: 1000 },
  emotion: { type: String, enum: ['happy', 'sad', 'neutral', 'excited', 'caring', 'concerned', 'playful'] },
  metadata: {
    tokens: Number,
    model: String,
    latency: Number,
  },
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'chat_messages',
});

ChatMessageSchema.index({ flowerId: 1, timestamp: -1 });
ChatMessageSchema.index({ userId: 1, timestamp: -1 });
