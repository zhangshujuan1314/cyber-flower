# 🪴 赛博养花 Cyber Bloom

> **AI 驱动的虚拟养花微信小程序** — 每一朵花都有 AI 赋予的独特灵魂

---

## 🌟 项目简介

赛博养花将 **AI 生成、真实感渲染、二十四节气、社交养成** 融为一体。输入关键词，AI 生成独一无二的花种 DNA；在微信小程序中浇水施肥、对话陪伴，见证它在四季轮回中绽放。

```
🌱 AI育种 → 🌿 养成照料 → 🌸 真实渲染 → 💬 AI对话 → 🎁 社交互赠 → 📖 图鉴收集
     ↑                  ↑                  ↑
  LLM生成基因        规则+节气驱动       情感陪伴
```

---

## ✨ 核心功能

### P0（MVP — 已实现）
| 功能 | 说明 |
|------|------|
| 🧬 **AI 育种** | 输入关键词（如"星空"、"月光"），LLM 生成包含颜色、形态、稀有度、人格的独特花种基因 |
| 🌿 **养成系统** | 浇水、施肥、修剪、光照；7 个生长阶段（种子→发芽→生长→花苞→盛花→结果→休眠） |
| 🎨 **真实感渲染** | Canvas 2D 分层精灵系统，呼吸动画、触摸旋转、粒子特效 |
| 💬 **AI 对话** | 与花朵持续对话，LLM 人格陪伴（降级为预设回复） |
| 🌸 **四季节气** | 四季自动切换调色板，基于二十四节气的生长影响 |
| 🔐 **微信登录** | 一键授权登录 + JWT 认证 |
| 📦 **每日种子** | 每日随机掉落种子，含稀有度系统 |

### P1（部分实现）
- 👥 **好友花园** — 互访、种子赠送
- 📖 **花朵图鉴** — 收集系统
- 🌗 **精确节气** — 天文算法待完善

### P2（规划中）
- 🪦 纪念花园、🎤 语音对话、📸 AR 拍照、🧬 杂交育种

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 📱 前端 | 微信小程序原生 + TypeScript + MobX |
| 🖥️ 后端 | NestJS + MongoDB (Mongoose) + Redis |
| 🤖 AI | Claude API / 通义千问 + Stable Diffusion |
| ☁️ 云服务 | 腾讯云 COS / CDN |
| 📖 API 文档 | Swagger |
| 🔒 认证 | 微信 code2Session + JWT (access + refresh) |
| 🧪 测试 | Jest |
| 🐳 容器化 | Docker + Docker Compose |
| 🔄 CI/CD | GitHub Actions |

---

## 📁 项目结构

```
cyber-flower/
├── mini-program/              # 微信小程序前端
│   ├── app.ts                 # 应用入口（生命周期、季节检测、登录）
│   ├── app.json               # 路由配置 + TabBar
│   ├── pages/                 # 主包页面
│   │   ├── garden/            # 🏡 花园主页（核心页面）
│   │   └── breed/             # 🧬 育种页
│   ├── sub-pkg/               # 分包（延迟加载）
│   │   ├── chat/              # 💬 对话
│   │   ├── collection/        # 📖 图鉴
│   │   ├── social/            # 👥 社交
│   │   ├── friend-garden/     # 🌸 好友花园
│   │   └── memorial/          # 🪦 纪念花园
│   ├── components/            # 可复用组件
│   │   ├── flower-viewer/     # 花朵渲染组件 (Canvas 2D)
│   │   ├── care-panel/        # 照料操作面板
│   │   ├── chat-bubble/       # 对话气泡
│   │   ├── seed-card/         # 种子卡片
│   │   └── season-indicator/  # 节气指示器
│   ├── services/              # API 服务层
│   │   ├── api.ts             # HTTP 客户端 (JWT + 自动刷新)
│   │   ├── auth.ts            # 微信登录
│   │   ├── breed.ts           # 育种 API
│   │   ├── chat.ts            # 对话 API
│   │   └── flower.ts          # 花朵 CRUD
│   ├── stores/                # MobX 状态管理
│   │   ├── gardenStore.ts     # 花园状态
│   │   └── userStore.ts       # 用户状态
│   ├── theme/                 # 设计系统
│   │   ├── colors.ts          # 四季调色板 + 稀有度色彩
│   │   ├── typography.ts      # 字体系统
│   │   └── spacing.ts         # 间距系统
│   └── utils/                 # 工具函数
│       ├── flower-renderer.ts # Canvas 花朵渲染引擎
│       ├── season-utils.ts    # 节气计算
│       └── season-effects.ts  # 季节性粒子特效
│
├── server/                    # NestJS 后端
│   └── src/
│       ├── main.ts            # 应用入口 (Swagger、CORS、/v1 前缀)
│       ├── core/              # 业务领域模块
│       │   ├── auth/          # 认证 (微信登录 + JWT)
│       │   ├── user/          # 用户管理
│       │   ├── flower/        # 花朵养成 (CRUD + 生长引擎)
│       │   ├── breed/         # 育种 (AI 种子生成)
│       │   ├── chat/          # AI 对话
│       │   ├── social/        # 社交系统
│       │   ├── season/        # 节气服务
│       │   └── collection/    # 图鉴系统
│       ├── ai-layer/          # AI 服务层
│       │   ├── llm.service.ts        # LLM 调用 (Claude API)
│       │   ├── image-gen.service.ts  # AI 图像生成
│       │   ├── prompt-templates.ts   # 提示词模板
│       │   ├── content-safety.service.ts # 内容安全
│       │   ├── emotion-engine.ts     # 情感引擎
│       │   ├── memory.service.ts     # 对话记忆
│       │   └── greeting.service.ts   # 主动问候
│       └── shared/            # 共享基础设施
│           ├── types/models.ts       # 核心类型定义
│           ├── guards/jwt-auth.guard.ts
│           ├── filters/http-exception.filter.ts
│           ├── interceptors/transform.interceptor.ts
│           └── cos/cos.service.ts    # 腾讯云 COS
│
├── docs/                      # 产品 & 技术文档
│   ├── PRD.md                 # 产品需求文档
│   ├── tech-architecture.md   # 技术架构设计
│   ├── ui-design.md           # UI/UX 设计系统
│   ├── setup-guide.md         # 环境配置指南
│   ├── task-plan.md           # 分阶段实施计划
│   ├── flow-breed-to-plant.md # 育种→种植调用链
│   └── wx-review-checklist.md # 微信审核清单
│
└── .github/workflows/ci.yml   # CI 流水线
```

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- MongoDB ≥ 6.0
- Redis ≥ 7.0（可选）
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 后端

```bash
cd server
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 WX_APPID、WX_SECRET、MONGODB_URI 等

# 启动 MongoDB 和 Redis
docker-compose up -d

# 启动开发服务器
npm run start:dev
# Swagger 文档: http://localhost:3000/api/docs
```

### 小程序

```bash
cd mini-program
npm install --legacy-peer-deps

# 用微信开发者工具打开 mini-program/ 目录
# 在 project.config.json 中配置你的 AppID
```

### 一键启动 (Docker)

```bash
cd server
docker-compose up -d    # 启动 api + mongo + redis
```

---

## 🔧 环境变量

在 `server/.env` 中配置：

| 变量 | 说明 | 必需 |
|------|------|------|
| `WX_APPID` / `WX_SECRET` | 微信小程序凭证 | ✅ |
| `MONGODB_URI` | MongoDB 连接地址 | ✅ |
| `REDIS_URL` | Redis 连接地址 | 可选 |
| `JWT_SECRET` | JWT 签名密钥 | ✅ |
| `AI_LLM_ENDPOINT` / `AI_LLM_API_KEY` | LLM API 地址与密钥 | 可选 |
| `AI_IMAGE_ENDPOINT` / `AI_IMAGE_API_KEY` | AI 图像 API | 可选 |
| `COS_SECRET_ID` / `COS_SECRET_KEY` | 腾讯云 COS 凭证 | 可选 |

---

## 📊 数据模型

| 实体 | 说明 |
|------|------|
| **Genome** | 花朵 DNA — 品种、颜色 (RGB)、形态、生长参数、稀有度、标签 |
| **Seed** | 种子 — 来源类型（关键词/每日/礼物）、关联 Genome、状态 |
| **Flower** | 花朵 — 生长阶段、健康值 (0-100)、幸福值 (0-100)、人格、视觉效果 |
| **CareLog** | 照料记录 — 操作类型、效果变化 |
| **ChatMessage** | 对话消息 — 用户/花朵角色、文本、情绪 |
| **User** | 用户 — OpenID、资源（水滴/肥料）、统计、花园等级 |

---

## 🧪 测试

```bash
cd server
npm test                 # 单元测试
npm run test:e2e         # E2E 测试
npm run lint             # 代码检查
```

---

## 📋 里程碑

| 阶段 | 目标 |
|------|------|
| **M0** 原型 | 核心闭环 Demo（登录→育种→种植→照料→对话）✅ |
| **M1** MVP | P0 功能完整 |
| **M2** 内测 | P1 功能 + 性能优化 |
| **M3** 上线 | 微信正式发布 |

---

## 📄 License

MIT

---

> 🌸 *让每一朵数字花，都有自己的生命故事*
