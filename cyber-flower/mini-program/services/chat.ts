/**
 * AI对话服务
 */
import api from './api';

export interface ChatMessage {
  _id: string;
  flowerId: string;
  role: 'user' | 'flower';
  text: string;
  emotion?: string;
  timestamp: string;
}

export const chatService = {
  /** 发送消息 */
  async sendMessage(flowerId: string, message: string): Promise<{
    userMsg: ChatMessage;
    flowerMsg: ChatMessage;
  }> {
    return api.post(`/chat/${flowerId}/send`, { message });
  },

  /** 获取对话历史 */
  async getHistory(flowerId: string, limit = 50): Promise<ChatMessage[]> {
    return api.get(`/chat/${flowerId}/history`, { params: { limit } } as never);
  },

  /** 清除对话历史 */
  async clearHistory(flowerId: string): Promise<void> {
    return api.delete(`/chat/${flowerId}/history`);
  },
};
