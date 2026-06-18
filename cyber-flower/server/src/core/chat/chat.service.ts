import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from '../../shared/types/models';
import { LlmService } from '../../ai-layer/llm.service';
import { ContentSafetyService } from '../../ai-layer/content-safety.service';
import { CHAT_SYSTEM } from '../../ai-layer/prompt-templates';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel('ChatMessage') private chatMessageModel: Model<ChatMessage>,
    private llmService: LlmService,
    private safetyService: ContentSafetyService,
  ) {}

  /**
   * 发送消息并获取AI回复 — 真实LLM驱动
   */
  async sendMessage(flowerId: string, userId: string, text: string) {
    // 1. 安全检查
    const safety = await this.safetyService.checkUserInput(text);
    if (!safety.safe) {
      throw new Error(`消息不符合规范: ${safety.reason}`);
    }

    // 2. 保存用户消息
    const userMsg = await this.chatMessageModel.create({
      flowerId, userId, role: 'user',
      text: this.safetyService.sanitize(text),
      timestamp: new Date(),
    });

    // 3. 获取对话历史（最近20轮）
    const history = await this.getHistory(flowerId, 20);
    const historyText = history
      .map((m) => `${m.role === 'user' ? '主人' : '花'}: ${m.text}`)
      .join('\n');

    // 4. 构建System Prompt (需要花的上下文)
    // TODO: 从FlowerService获取花的当前状态
    const systemPrompt = CHAT_SYSTEM
      .replace('{flowerName}', '小花')
      .replace('{speciesName}', '未知品种')
      .replace('{personalityTone}', '温柔')
      .replace('{speakingStyle}', '诗意')
      .replace('{currentMood}', '开心')
      .replace('{growthStage}', 'blooming')
      .replace('{health}', '85')
      .replace('{happiness}', '72')
      .replace('{chatHistory}', historyText || '(这是你们第一次对话)');

    // 5. 调用LLM生成回复
    try {
      const reply = await this.llmService.chat(
        systemPrompt,
        text,
        { temperature: 0.85, maxTokens: 300 },
      );

      const flowerMsg = await this.chatMessageModel.create({
        flowerId, userId, role: 'flower',
        text: reply.text,
        emotion: 'happy',
        metadata: {
          tokens: reply.usage.completionTokens,
          model: process.env.AI_LLM_MODEL,
          latency: reply.latency,
        },
        timestamp: new Date(),
      });

      return {
        userMsg: userMsg.toObject(),
        flowerMsg: flowerMsg.toObject(),
      };
    } catch (error) {
      this.logger.error(`[Chat] LLM error: ${(error as Error).message}`);

      // 降级: 使用模拟回复
      const fallbackText = this.generateFallbackReply(text);
      const flowerMsg = await this.chatMessageModel.create({
        flowerId, userId, role: 'flower',
        text: fallbackText,
        emotion: 'neutral',
        timestamp: new Date(),
      });

      return {
        userMsg: userMsg.toObject(),
        flowerMsg: flowerMsg.toObject(),
      };
    }
  }

  async getHistory(flowerId: string, limit = 50): Promise<ChatMessage[]> {
    return this.chatMessageModel
      .find({ flowerId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .then((msgs) => msgs.reverse());
  }

  async clearHistory(flowerId: string): Promise<void> {
    await this.chatMessageModel.deleteMany({ flowerId });
  }

  /** LLM不可用时的降级回复 */
  private generateFallbackReply(userText: string): string {
    const replies = [
      '今天的水真甜呀~感觉花瓣更有光泽了 ✨',
      '你来了！我一直在等你呢 🌸',
      '今天的阳光好好，我进行了好多光合作用！',
      '听到你的声音真好，今天过得好吗？',
      '我觉得我的花苞又长大了一点，你要看看吗？',
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
}
