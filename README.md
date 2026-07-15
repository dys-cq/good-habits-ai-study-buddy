# 星际学习联盟

🚀 **新一代智能协同学习系统**

一个基于 AI 的青少年学习陪伴平台，融合了学习习惯培养、心理健康守护、AI 智能辅导等创新功能。

## ✨ 核心功能

- 📚 **AI 学习搭子** - 真实大模型对话，不直接给答案，陪你拆思路
- 💭 **心理健康守护** - 情绪追踪、AI 心理陪伴
- ⏱️ **智能番茄钟** - 个性化专注时间管理
- 🎯 **AI 学习规划师** - 生成个性化学习计划
- ✨ **好习惯养成** - 追踪和培养学习习惯
- 📝 **知识星球** - AI 辅助的学习笔记管理

## 🚀 快速开始

### 本地运行

```bash
# 安装依赖
npm install

# 复制环境配置
cp .env.production .env

# 启动服务
npm start
```

访问 http://localhost:3000

### Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 🐳 Docker Desktop 部署指南

### 1. 确保 Docker Desktop 已安装

```bash
docker --version
docker-compose --version
```

### 2. 构建并运行

```bash
# 进入项目目录
cd good_habits

# 启动服务
docker-compose up -d --build

# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f galaxy-learning
```

### 3. 访问应用

服务启动后，访问：http://localhost:3000

### 4. 停止服务

```bash
docker-compose down
```

## 🎯 技术栈

- **前端**: HTML5 + TailwindCSS + Vanilla JS
- **后端**: Node.js + Express
- **AI 引擎**: 字节豆包大模型 API
- **容器化**: Docker + Docker Compose
- **数据存储**: 浏览器 LocalStorage

## 📝 参赛信息

- **赛事**: TRAE AI 创造力大赛
- **赛道**: 青少年身心健康（公益叠加）
- **奖金**: 单作品最高 35 万元现金
- **特点**: 0 技术背景也能参赛

## 🎨 设计理念

1. **温暖治愈** - 星空主题，舒缓的视觉效果
2. **AI 赋能** - 真实大模型驱动，智能陪伴
3. **青少年友好** - 符合 13-18 岁群体审美
4. **功能完整** - 从心情到学习到习惯的全方位支持

## 📄 License

MIT
