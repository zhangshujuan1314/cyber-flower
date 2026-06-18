# 🔧 赛博养花 配置指南

## 环境要求

| 工具 | 用途 | 安装 |
|------|------|------|
| Node.js ≥ 18 | 后端运行时 | https://nodejs.org |
| MongoDB | 数据库 | Atlas免费版 或本地安装 |
| 微信开发者工具 | 小程序预览调试 | https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html |

## 第一步：安装依赖

```bash
# 后端
cd server
npm install

# 小程序
cd mini-program
npm install --legacy-peer-deps
```

## 第二步：获取 API Keys

### 微信小程序 AppID（必须）

1. 打开 https://mp.weixin.qq.com
2. 注册小程序账号（个人即可）
3. 开发管理 → 开发设置 → 获取 **AppID** 和 **AppSecret**

### AI 大模型 API Key（三选一）

| 选项 | 申请地址 | 特点 |
|------|----------|------|
| **Claude API** | https://console.anthropic.com | 中文能力强，推荐 |
| **通义千问** | https://dashscope.aliyun.com | 国内访问快，免费额度 |
| **DeepSeek** | https://platform.deepseek.com | 极低成本 |

### AI 图像生成 API（可选）

| 选项 | 申请地址 |
|------|----------|
| Stability AI | https://platform.stability.ai |
| Replicate | https://replicate.com (托管 FLUX/SD) |

### 数据库（二选一）

| 方案 | 说明 |
|------|------|
| **MongoDB Atlas** | https://cloud.mongodb.com，512MB 免费 |
| **本地 MongoDB** | https://www.mongodb.com/try/download/community |

## 第三步：填写配置

编辑 `server/.env` 文件（已从 `.env.example` 创建了模板）：

```bash
# ========== 必填 — 微信小程序 ==========
WX_APPID=wx1234567890abcdef     # 改成你自己的 AppID
WX_SECRET=abc123def456           # 改成你自己的 Secret

# ========== 必填 — 数据库 ==========
# 本地 MongoDB:
MONGODB_URI=mongodb://localhost:27017/cyber-bloom
# 或 MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.xxx.mongodb.net/cyber-bloom

# ========== 必填 — AI 大模型（选一个）==========
# Claude API:
AI_LLM_ENDPOINT=https://api.anthropic.com/v1/messages
AI_LLM_API_KEY=sk-ant-xxxxx
AI_LLM_MODEL=claude-sonnet-4-6

# 或 通义千问:
# AI_LLM_ENDPOINT=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
# AI_LLM_API_KEY=sk-xxxxx

# 或 DeepSeek:
# AI_LLM_ENDPOINT=https://api.deepseek.com/v1/chat/completions
# AI_LLM_API_KEY=sk-xxxxx

# ========== 可选 — AI 图像生成 ==========
AI_IMAGE_ENDPOINT=https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image
AI_IMAGE_API_KEY=sk-xxxxx

# ========== 可选 — JWT 密钥 ==========
JWT_SECRET=随便写一串复杂字符串即可

# ========== 可选 — 腾讯云 COS 图片存储 ==========
COS_SECRET_ID=
COS_SECRET_KEY=
COS_BUCKET=cyber-bloom-images
COS_REGION=ap-guangzhou
```

> **提示**：如果暂未获取 AI API Key，后端会自动降级为模拟回复，核心流程仍可完整跑通。

## 第四步：启动

### 启动后端

```bash
cd server

# 确保 MongoDB 已启动，然后：
npm run start:dev

# 看到以下输出表示成功：
# [CyberBloom] Server running on port 3000
# [CyberBloom] Swagger docs: http://localhost:3000/api/docs
```

### 启动小程序

1. 下载安装 微信开发者工具
2. 打开工具 → 导入项目
3. 项目目录选择 `mini-program/`
4. 填入你的 AppID
5. 点击「编译」即可预览

## 第五步：验证

```bash
# 测试健康检查
curl http://localhost:3000/health
# → {"status":"ok","service":"cyber-bloom-api","version":"1.0.0"}

# 浏览 API 文档
# 打开 http://localhost:3000/api/docs
```

## 常见问题

**Q: 没有 AI API Key 能跑吗？**
A: 可以。种子生成会使用规则引擎生成模拟花种，对话会使用内置的模拟回复。

**Q: 没有 MongoDB 能跑吗？**
A: 暂时不行。可以去 https://cloud.mongodb.com 免费注册 Atlas 账号，5分钟就能拿到连接地址。

**Q: 小程序真机预览需要做什么？**
A: 微信开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名」。正式上线前需在微信后台配置服务器域名白名单。

**Q: 项目用的是哪个端口？**
A: 后端 3000，Swagger 文档在 `http://localhost:3000/api/docs`。

---

> 📦 项目打包日期: 2026-06-13 | 总计 164 个源文件
