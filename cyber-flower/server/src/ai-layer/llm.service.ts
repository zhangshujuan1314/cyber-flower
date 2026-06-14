import { Injectable, Logger } from '@nestjs/common';

interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LlmResponse {
  text: string;
  json?: Record<string, unknown>;
  usage: { promptTokens: number; completionTokens: number };
  latency: number;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor() {
    this.endpoint = process.env.AI_LLM_ENDPOINT || 'https://api.anthropic.com/v1/messages';
    this.apiKey = process.env.AI_LLM_API_KEY || '';
    this.model = process.env.AI_LLM_MODEL || 'claude-sonnet-4-6';
  }

  /**
   * 通用LLM调用
   */
  async chat(
    systemPrompt: string,
    userMessage: string,
    options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {},
  ): Promise<LlmResponse> {
    const startTime = Date.now();
    const { temperature = 0.8, maxTokens = 1024, jsonMode = false } = options;

    try {
      // Claude API 格式
      const body: Record<string, unknown> = {
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      };

      if (jsonMode) {
        // 请求JSON格式输出
        body.response_format = { type: 'json_object' };
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as {
        content: Array<{ type: string; text: string }>;
        usage: { input_tokens: number; output_tokens: number };
      };

      const text = data.content[0]?.text || '';

      // 尝试解析JSON
      let json: Record<string, unknown> | undefined;
      if (jsonMode) {
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) json = JSON.parse(jsonMatch[0]);
        } catch { /* ignore parse error */ }
      }

      const latency = Date.now() - startTime;
      this.logger.log(`[LLM] ${this.model} | ${latency}ms | ${data.usage.input_tokens}+${data.usage.output_tokens} tokens`);

      return {
        text,
        json,
        usage: { promptTokens: data.usage.input_tokens, completionTokens: data.usage.output_tokens },
        latency,
      };
    } catch (error) {
      this.logger.error(`[LLM] Error: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * 生成结构化JSON输出
   */
  async chatJson<T = Record<string, unknown>>(
    systemPrompt: string,
    userMessage: string,
    options: { temperature?: number; maxTokens?: number } = {},
  ): Promise<T> {
    const result = await this.chat(systemPrompt, userMessage, {
      ...options,
      jsonMode: true,
    });
    return (result.json || {}) as T;
  }
}
