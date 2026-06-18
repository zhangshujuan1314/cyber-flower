/**
 * 赛博养花 — 对话长期记忆服务
 * 关键事件提取 + 记忆衰减 + 上下文检索
 */
import { Injectable } from '@nestjs/common';
import { LlmService } from './llm.service';

export interface MemoryEntry {
  id: string;
  flowerId: string;
  userId: string;
  type: 'event' | 'fact' | 'preference' | 'milestone';
  content: string;
  importance: number;    // 0-1
  createdAt: Date;
  lastRecalledAt: Date;
  recallCount: number;
}

const MEMORY_EXTRACTION_PROMPT = `你是一个记忆提取器。从对话中提取值得长期记住的信息。

输出JSON数组:
[{
  "type": "event|fact|preference|milestone",
  "content": "简洁的事实描述 (不超过30字)",
  "importance": 0-1之间的重要度评分
}]

规则:
- event: 发生了什么事 (如: "主人今天升职了")
- fact: 关于主人的事实 (如: "主人喜欢雨天")
- preference: 主人的偏好 (如: "主人更喜欢早上浇水")
- milestone: 花的成长里程碑 (如: "第一次开花")
- importance: 0.3=日常小事, 0.6=值得记住, 0.9=非常重要
- 忽略无意义的寒暄
- 如果没有值得记住的内容，返回空数组[]`;

@Injectable()
export class MemoryService {
  private memories: Map<string, MemoryEntry[]> = new Map();

  constructor(private llmService: LlmService) {}

  /** 从对话中提取记忆 */
  async extractMemories(
    flowerId: string,
    userId: string,
    userMessage: string,
    flowerReply: string,
  ): Promise<MemoryEntry[]> {
    try {
      const result = await this.llmService.chatJson<Array<{
        type: string; content: string; importance: number;
      }>>(
        MEMORY_EXTRACTION_PROMPT,
        `主人说: "${userMessage}"\n花回复: "${flowerReply}"`,
        { temperature: 0.3, maxTokens: 512 },
      );

      if (!Array.isArray(result) || result.length === 0) return [];

      const entries: MemoryEntry[] = result.map((item) => ({
        id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        flowerId,
        userId,
        type: item.type as MemoryEntry['type'],
        content: item.content,
        importance: item.importance,
        createdAt: new Date(),
        lastRecalledAt: new Date(),
        recallCount: 0,
      }));

      // 存储
      const existing = this.memories.get(flowerId) || [];
      this.memories.set(flowerId, [...existing, ...entries]);

      // 限制每个花的记忆数量 (保留最重要的50条)
      const all = this.memories.get(flowerId) || [];
      if (all.length > 50) {
        all.sort((a, b) => b.importance - a.importance);
        this.memories.set(flowerId, all.slice(0, 50));
      }

      return entries;
    } catch {
      return [];
    }
  }

  /** 检索相关记忆 */
  getRelevantMemories(flowerId: string, context?: string, limit = 5): MemoryEntry[] {
    const all = this.memories.get(flowerId) || [];

    // 更新回忆记录
    const selected = all
      .sort((a, b) => b.importance * (b.recallCount + 1) - a.importance * (a.recallCount + 1))
      .slice(0, limit);

    for (const m of selected) {
      m.lastRecalledAt = new Date();
      m.recallCount++;
    }

    return selected;
  }

  /** 格式化记忆为对话上下文 */
  formatMemoriesForChat(memories: MemoryEntry[]): string {
    if (memories.length === 0) return '';

    return memories
      .map((m) => {
        const typeLabel = { event: '发生过', fact: '知道', preference: '偏好', milestone: '里程碑' };
        return `- [${typeLabel[m.type]}] ${m.content}`;
      })
      .join('\n');
  }

  /** 添加系统记忆 (生长里程碑等，不需要LLM提取) */
  addSystemMemory(flowerId: string, userId: string, type: MemoryEntry['type'], content: string, importance: number): void {
    const existing = this.memories.get(flowerId) || [];
    existing.push({
      id: `sys_${Date.now()}`,
      flowerId, userId, type, content, importance,
      createdAt: new Date(), lastRecalledAt: new Date(), recallCount: 0,
    });
    this.memories.set(flowerId, existing);
  }
}
