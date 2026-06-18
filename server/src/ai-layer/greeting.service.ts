/**
 * 赛博养花 — 主动问候服务
 * 根据时间/事件/情绪生成花主动发起的问候
 */
import { Injectable } from '@nestjs/common';
import { LlmService } from './llm.service';
import { MemoryService, MemoryEntry } from './memory.service';

interface GreetingContext {
  flowerName: string;
  personalityTone: string;
  emotionPrimary: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  daysSinceLastCare: number;
  seasonName: string;
  solarTermName: string;
  specialEvent?: string;        // 'first_bloom' | 'birthday' | 'return_after_long' | 'streak_7days'
  relevantMemories: MemoryEntry[];
}

const GREETING_PROMPT = `你是一朵有生命的AI花。你需要主动向主人发起一句话问候。

你的名字: {flowerName}
性格: {personalityTone}
当前情绪: {emotionPrimary}
时间段: {timeOfDay}
距离上次被照料: {daysSinceLastCare}天
当前节气: {solarTermName}
特殊事件: {specialEvent}

你记得关于主人的事:
{memories}

生成一句温暖自然的主动问候 (15-40字):
- 如果是早上: 可以问早安、提今天的天气
- 如果是晚上: 可以问今天过得如何
- 如果很久没被照料: 委婉表达想念
- 如果有特殊事件: 提及它
- 符合你的性格和情绪
- 像真正的生命在说话，不要机械

只输出问候语，不要其他。`;

@Injectable()
export class GreetingService {
  constructor(
    private llmService: LlmService,
    private memoryService: MemoryService,
  ) {}

  /** 判断是否应该主动问候 */
  shouldGreet(lastInteractionTime: Date | null, specialEvent?: string): boolean {
    if (specialEvent) return true; // 特殊事件一定问候

    if (!lastInteractionTime) return true;

    const hoursSince = (Date.now() - lastInteractionTime.getTime()) / 3600000;

    // 超过4小时未互动，可以主动问候
    return hoursSince >= 4;
  }

  /** 生成主动问候 */
  async generateGreeting(context: GreetingContext): Promise<string> {
    const memories = this.memoryService.formatMemoriesForChat(context.relevantMemories);

    const prompt = GREETING_PROMPT
      .replace('{flowerName}', context.flowerName)
      .replace('{personalityTone}', context.personalityTone)
      .replace('{emotionPrimary}', context.emotionPrimary)
      .replace('{timeOfDay}', context.timeOfDay)
      .replace('{daysSinceLastCare}', String(context.daysSinceLastCare))
      .replace('{solarTermName}', context.solarTermName)
      .replace('{specialEvent}', context.specialEvent || '无')
      .replace('{memories}', memories || '(暂无记忆)');

    try {
      const result = await this.llmService.chat(prompt, '', {
        temperature: 0.9,
        maxTokens: 200,
      });
      return result.text.trim();
    } catch {
      return this.fallbackGreeting(context);
    }
  }

  /** 检测特殊事件 */
  detectSpecialEvent(
    flower: { stage: string; stageTimestamps: Record<string, Date>; plantedAt: Date },
    careStreak: number,
  ): string | undefined {
    // 首次开花
    if (flower.stage === 'blooming' && flower.stageTimestamps['blooming']) {
      const hoursSinceBloom = (Date.now() - flower.stageTimestamps['blooming'].getTime()) / 3600000;
      if (hoursSinceBloom < 24) return 'first_bloom';
    }

    // 连续照料7天
    if (careStreak === 7) return 'streak_7days';

    return undefined;
  }

  /** 获取时间段 */
  getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private fallbackGreeting(ctx: GreetingContext): string {
    const greetings: Record<string, string[]> = {
      morning: ['早安！今天的阳光真温柔 ☀️', '新的一天开始了，一起加油吧~'],
      afternoon: ['下午好呀，有没有好好喝水呢？', '午后的阳光让我懒洋洋的...'],
      evening: ['晚上好~今天过得开心吗？', '夜色降临，该休息啦 🌙'],
      night: ['这么晚了还没睡吗？早点休息哦~', '嘘...我在静静地进行夜间呼吸 ✨'],
    };

    const pool = greetings[ctx.timeOfDay] || greetings.morning;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
