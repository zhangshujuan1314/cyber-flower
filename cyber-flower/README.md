# 🪴 赛博养花 (Cyber Bloom)

> AI驱动的真实感虚拟养花微信小程序 — 每一朵花都有AI赋予的独特灵魂

---

## 产品概念

赛博养花将 **AI生成、真实感渲染、二十四节气、社交养成** 融为一体。用户通过输入关键词让AI生成独一无二的花种，在微信小程序中照料它成长，与它对话，见证它在四季轮回中绽放。

```
🌱 种子 → 🌿 生长 → 🌸 绽放 → 💬 对话 → 🎁 社交 → 📖 图鉴 → 🔄 轮回
        ↑ AI生成基因      ↑ AI驱动生长      ↑ AI人格陪伴
```

## 文档索引

| 文档 | 内容 | 受众 |
|------|------|------|
| [📋 PRD](./docs/PRD.md) | 产品需求文档：用户画像、功能规格、交互流程 | 全员 |
| [🏗️ 技术架构](./docs/tech-architecture.md) | 技术架构设计：系统架构、数据模型、API设计 | 开发者 |
| [🎨 UI设计](./docs/ui-design.md) | UI/UX设计系统：色彩、组件、页面、动效 | 设计师+前端 |
| [📋 实施计划](./docs/task-plan.md) | 分阶段实施计划：里程碑、任务、风险 | 项目管理 |

## 技术栈

```
📱 前端: 微信小程序原生 + TypeScript + MobX
🖥️ 后端: NestJS + MongoDB + Redis
🤖 AI:   Stable Diffusion + LLM (Claude/GPT)
☁️ 云:   腾讯云 (COS/CDN/云开发)
```

## 里程碑

| 里程碑 | 时间 | 目标 |
|--------|------|------|
| **M0** 原型 | Week 4 | 核心闭环Demo |
| **M1** MVP | Week 8 | P0功能完整 |
| **M2** 内测 | Week 16 | P1功能+性能达标 |
| **M3** 上线 | Week 20 | 微信正式发布 |

## 快速开始

```bash
# 克隆项目
git clone <repo-url> cyber-flower
cd cyber-flower

# 后端
cd server
npm install
npm run start:dev

# 小程序
cd mini-program
npm install
# 用微信开发者工具打开 mini-program/ 目录
```

---

> 🌸 *让每一朵数字花，都有自己的生命故事*
