/**
 * AI对话页 — 与花朵深度交流
 */

import api from '../../services/api';
import { getFlowerImage } from '../../utils/flowerImage';

interface Message {
  id: string;
  role: 'user' | 'flower';
  text: string;
  emotion?: string;
  timestamp: number;
}

interface ChatData {
  flowerId: string;
  flowerName: string;
  flowerImage: string;
  messages: Message[];
  inputText: string;
  isSending: boolean;
  scrollToView: string;
}

Page<ChatData>({
  data: {
    flowerId: '',
    flowerName: '',
    flowerImage: '',
    messages: [],
    inputText: '',
    isSending: false,
    scrollToView: '',
  },

  onLoad(options: Record<string, string>) {
    const flowerId = options.flowerId || '';
    this.setData({ flowerId });
    this.loadFlowerInfo(flowerId);
    this.loadHistory(flowerId);
  },

  async loadFlowerInfo(flowerId: string) {
    try {
      const flower = await api.get<{ name: string; genome: Record<string, unknown> }>(`/flowers/${flowerId}`);
      const species = (flower.genome as Record<string, unknown>)?.species as string || flower.name;
      this.setData({
        flowerName: flower.name,
        flowerImage: getFlowerImage(species),
      });
      wx.setNavigationBarTitle({ title: flower.name });
    } catch (_) {}
  },

  async loadHistory(flowerId: string) {
    try {
      const messages = await api.get<Message[]>(`/chat/${flowerId}/history`);
      this.setData({ messages }, () => this.scrollToBottom());
    } catch (_) {}
  },

  onInput(e: WechatMiniprogram.Input) {
    this.setData({ inputText: e.detail.value });
  },

  async sendMessage() {
    const text = this.data.inputText.trim();
    if (!text || this.data.isSending) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const messages = [...this.data.messages, userMsg];
    this.setData({ messages, inputText: '', isSending: true }, () => this.scrollToBottom());

    try {
      const result = await api.post<{ text: string; emotion: string }>(`/chat/${this.data.flowerId}/send`, {
        message: text,
      });

      const flowerMsg: Message = {
        id: `f_${Date.now()}`,
        role: 'flower',
        text: result.text,
        emotion: result.emotion,
        timestamp: Date.now(),
      };

      this.setData({
        messages: [...this.data.messages, flowerMsg],
        isSending: false,
      }, () => this.scrollToBottom());
    } catch (error) {
      wx.showToast({ title: '发送失败', icon: 'none' });
      this.setData({ isSending: false });
    }
  },

  scrollToBottom() {
    const msgs = this.data.messages;
    if (msgs.length > 0) {
      this.setData({ scrollToView: `msg-${msgs[msgs.length - 1].id}` });
    }
  },
});
