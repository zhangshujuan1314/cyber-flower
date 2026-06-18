import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { SAFETY_CHECK_SYSTEM } from './prompt-templates';

interface SafetyResult {
  safe: boolean;
  reason?: string;
}

@Injectable()
export class ContentSafetyService {
  private readonly logger = new Logger(ContentSafetyService.name);

  // 基础敏感词列表（生产环境应接入腾讯云NLP）
  private readonly bannedWords = [
    // 生产环境替换为完整的敏感词库
  ];

  constructor(private llmService: LlmService) {}

  /**
   * 检查用户输入是否安全
   */
  async checkUserInput(text: string): Promise<SafetyResult> {
    // 1. 快速关键词匹配
    const keywordCheck = this.keywordFilter(text);
    if (!keywordCheck.safe) return keywordCheck;

    // 2. LLM深度检查 (仅在关键词无法判断时)
    // 生产环境: 使用腾讯云NLP替代LLM检查以降低成本
    // return this.llmCheck(text);

    return { safe: true };
  }

  /**
   * 检查AI生成内容是否安全
   */
  async checkAiOutput(text: string, imageUrl?: string): Promise<SafetyResult> {
    // 生产环境: 接入腾讯云内容安全API
    // 图片审核: 腾讯云图片内容安全
    // 文本审核: 腾讯云文本内容安全

    const keywordCheck = this.keywordFilter(text);
    if (!keywordCheck.safe) return keywordCheck;

    return { safe: true };
  }

  /**
   * 关键词过滤
   */
  private keywordFilter(text: string): SafetyResult {
    const lower = text.toLowerCase();

    for (const word of this.bannedWords) {
      if (lower.includes(word)) {
        this.logger.warn(`[Safety] Banned word detected in: "${text.slice(0, 50)}..."`);
        return { safe: false, reason: '内容包含不当词汇' };
      }
    }

    return { safe: true };
  }

  /**
   * LLM深度安全检查 (可选)
   */
  private async llmCheck(text: string): Promise<SafetyResult> {
    try {
      const result = await this.llmService.chatJson<SafetyResult>(
        SAFETY_CHECK_SYSTEM,
        `检查以下内容: "${text}"`,
        { temperature: 0, maxTokens: 256 },
      );
      return result;
    } catch {
      // LLM检查失败时，默认通过（避免误杀）
      return { safe: true };
    }
  }

  /**
   * 脱敏处理 — 移除可能的个人隐私信息
   */
  sanitize(text: string): string {
    return text
      .replace(/\d{11}/g, '***')           // 手机号
      .replace(/\d{17}[\dXx]/g, '***')     // 身份证
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***'); // 邮箱
  }
}
