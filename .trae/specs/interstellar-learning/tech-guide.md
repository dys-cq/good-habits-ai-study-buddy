# 星际学霸 - 技术实现指导

## 一、项目架构概览

### 1.1 技术栈
| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端 | HTML5 + CSS3 + JavaScript | ES6+ | 纯前端H5应用 |
| 后端 | Node.js + Express | 18+ | API代理和AI调用 |
| 数据库 | localStorage | - | 本地数据持久化 |
| AI服务 | 火山引擎ARK | - | minimax-m3模型 |

### 1.2 文件结构
```
good_habits/
├── public/
│   └── index.html          # 主应用页面（所有功能模块）
├── server.js               # 后端API服务
├── .env                    # 环境变量配置
├── package.json            # 依赖配置
├── Dockerfile              # Docker配置
└── .trae/specs/interstellar-learning/
    ├── spec.md             # 产品需求文档
    ├── tasks.md            # 任务分解
    └── checklist.md        # 验证清单
```

### 1.3 数据模型设计

```javascript
// 全局数据结构
const data = {
  // 用户基本信息
  user: {
    name: '小星',
    avatar: '🌟'
  },
  
  // 今日心情（用于影响学习计划）
  mood: {
    today: 'happy',        // happy | normal | sad | angry | terrible
    note: '',              // 用户备注
    history: []            // 历史记录 [{date, mood, note}]
  },
  
  // 学习计划（核心枢纽）
  studyPlan: {
    date: '',              // 计划日期
    tasks: [               // 任务列表
      {
        id: '',
        title: '',         // 任务标题
        subject: '',       // 科目（数学/英语/物理等）
        type: '',          // task_type: pomodoro | habit | free
        duration: 25,      // 预计时长（分钟）
        completed: false,  // 是否完成
        difficulty: 1      // 难度等级 1-5
      }
    ]
  },
  
  // 番茄钟状态
  pomodoro: {
    currentTask: null,     // 当前任务ID
    duration: 25,          // 当前时长设置
    remaining: 0,          // 剩余时间（秒）
    isRunning: false,      // 是否运行中
    completedCount: 0      // 今日完成番茄数
  },
  
  // 习惯列表
  habits: [
    {
      id: '',
      name: '',            // 习惯名称
      subject: '',         // 关联科目
      icon: '',            // 图标emoji
      targetDays: 21,      // 目标天数
      currentStreak: 0,    // 当前连续天数
      history: []          // 打卡记录 [{date, completed}]
    }
  ],
  
  // 知识星球笔记
  notes: [
    {
      id: '',
      content: '',         // 笔记内容
      subject: '',         // 科目分类
      type: '',            // knowledge | concept | method | question
      tags: [],            // 标签
      createdAt: '',       // 创建时间
      related: []          // 关联知识点ID
    }
  ],
  
  // 学习搭子对话历史
  studyMessages: [
    { role: 'user', content: '' },
    { role: 'assistant', content: '' }
  ]
};
```

---

## 二、核心模块实现指南

### 2.1 学习计划模块（核心枢纽）

**API端点**: `POST /api/generate-study-plan`

**请求参数**:
```javascript
{
  goal: "提高数学成绩",      // 学习目标
  duration: 180,           // 总时长（分钟）
  subjects: ["数学", "英语"], // 关注科目
  mood: "happy",           // 当前心情
  userId: "user"           // 用户标识
}
```

**响应格式**:
```javascript
{
  success: true,
  plan: {
    date: "2026-06-21",
    tasks: [
      {
        id: "task-1",
        title: "数学：函数复习",
        subject: "数学",
        type: "pomodoro",
        duration: 25,
        difficulty: 3,
        completed: false
      }
    ]
  }
}
```

**关键逻辑**:
1. 根据心情调整任务难度权重
   - happy: 高难度任务占比 40%
   - normal: 高难度任务占比 30%
   - sad/angry/terrible: 高难度任务占比 15%

2. 任务类型分配
   - 番茄任务（pomodoro）: 60%
   - 习惯任务（habit）: 25%
   - 自由任务（free）: 15%

---

### 2.2 番茄钟模块

**核心状态管理**:
```javascript
// 番茄钟状态机
const POMODORO_STATES = {
  IDLE: 'idle',           // 空闲
  RUNNING: 'running',     // 运行中
  PAUSED: 'paused',       // 暂停
  COMPLETED: 'completed'  // 完成
};
```

**联动逻辑**:
1. **从学习计划获取任务**
   - 过滤未完成的番茄任务
   - 按优先级排序（难度高的优先）

2. **完成后自动更新**
   - 标记任务为已完成
   - 增加完成计数
   - 触发习惯打卡（如果关联了习惯）

3. **边学边问功能**
   - 显示浮动按钮
   - 点击打开学习搭子弹窗
   - 传递当前任务上下文

---

### 2.3 学习搭子模块

**API端点**: `POST /api/chat` (SSE流式)

**请求参数**:
```javascript
{
  messages: [
    { role: 'system', content: '你是一个耐心的学习助手...' },
    { role: 'user', content: '[数学] 这道题怎么做？' }
  ],
  currentTask: { title: '函数复习', subject: '数学' }, // 可选，上下文
  relatedKnowledge: ['导数', '极限'], // 可选，知识星球相关内容
  userId: 'user'
}
```

**流式响应格式**:
```
data: {"content": "好的，"}
data: {"content": "让我来帮你分析这道题"}
data: {"content": "..."}
data: [DONE]
```

**上下文感知**:
1. 如果有currentTask，在prompt中加入：
   ```
   用户正在学习：{currentTask.title}
   科目：{currentTask.subject}
   ```

2. 如果有relatedKnowledge，在prompt中加入：
   ```
   参考知识：{relatedKnowledge.join(', ')}
   ```

---

### 2.4 知识星球模块（Wiki风格）

**关键功能**:

1. **知识点链接语法**:
   ```
   这是[[勾股定理]]的应用，详见[[直角三角形]]。
   ```

2. **链接解析逻辑**:
   ```javascript
   function parseWikiLinks(content) {
     return content.replace(/\[\[([^\]]+)\]\]/g, (match, link) => {
       const noteId = linkToId(link); // 转换为笔记ID
       return `<a href="#note-${noteId}" class="wiki-link">${link}</a>`;
     });
   }
   ```

3. **相关知识点推荐**:
   - 按科目关联
   - 按标签匹配
   - 按创建时间排序

---

### 2.5 习惯养成模块

**打卡逻辑**:
```javascript
function checkHabit(habitId) {
  const habit = data.habits.find(h => h.id === habitId);
  const today = new Date().toDateString();
  
  // 检查今日是否已打卡
  const todayRecord = habit.history.find(h => h.date === today);
  if (todayRecord?.completed) {
    return { success: false, message: '今日已打卡' };
  }
  
  // 更新打卡记录
  habit.currentStreak++;
  habit.history.push({ date: today, completed: true });
  
  // 更新学习计划统计
  updatePlanStats();
  
  return { success: true, message: `连续打卡 ${habit.currentStreak} 天！` };
}
```

**番茄完成自动打卡**:
```javascript
// 在番茄钟完成时调用
function onPomodoroComplete(taskId) {
  const task = data.studyPlan.tasks.find(t => t.id === taskId);
  
  // 查找关联的习惯
  const relatedHabit = data.habits.find(h => h.name === task.title);
  if (relatedHabit) {
    checkHabit(relatedHabit.id);
    showToast(`🎉 已为您自动打卡「${relatedHabit.name}」`);
  }
}
```

---

### 2.6 心情日记模块

**API端点**: `POST /api/mood-analysis`

**请求参数**:
```javascript
{
  mood: "happy",           // 心情状态
  note: "今天考试考得不错", // 用户备注
  userId: "user"
}
```

**响应格式**:
```javascript
{
  success: true,
  analysis: "你今天心情很好，适合挑战高难度任务！",
  suggestion: "推荐学习：数学、物理",
  color: "#FFD700"         // 心情颜色
}
```

**心情影响计划**:
```javascript
function getDifficultyWeight(mood) {
  const weights = {
    happy: { easy: 0.2, medium: 0.4, hard: 0.4 },
    normal: { easy: 0.3, medium: 0.5, hard: 0.2 },
    sad: { easy: 0.5, medium: 0.4, hard: 0.1 },
    angry: { easy: 0.6, medium: 0.3, hard: 0.1 },
    terrible: { easy: 0.7, medium: 0.25, hard: 0.05 }
  };
  return weights[mood] || weights.normal;
}
```

---

## 三、模块联动流程图

### 3.1 完整学习闭环

```
用户打开应用
    │
    ├─► [心情日记] 记录今日心情
    │         │
    │         ▼
    │    心情数据保存
    │         │
    │         ▼
    ├─► [学习计划] 生成今日计划（根据心情调整难度）
    │         │
    │         ▼
    │    任务列表
    │         │
    │    ┌────┴────┐
    │    ▼         ▼
    │ [番茄钟]  [习惯养成]
    │    │         │
    │    │ 选择任务 │ 查看习惯
    │    ▼         │
    │ 开始计时     │
    │    │         │
    │    │ 边学边问 │
    │    ▼         │
    │ [学习搭子] ◄┘
    │    │
    │    │ 一键收藏
    │    ▼
    │ [知识星球]
    │    │
    │    │ 知识点链接
    │    ▼
    │  关联推荐
    │
    │ 番茄完成
    │    │
    │    ▼
    └─► [习惯养成] 自动打卡
              │
              ▼
         完成统计 → 更新学习计划
```

### 3.2 数据流图

| 模块 | 输入数据 | 输出数据 |
|------|----------|----------|
| 心情日记 | 用户选择 | 心情状态、历史记录 |
| 学习计划 | 心情、目标、时长 | 任务列表 |
| 番茄钟 | 任务列表 | 完成记录 |
| 学习搭子 | 用户提问、当前任务、知识星球 | 回答内容 |
| 知识星球 | 学习搭子回答 | 笔记、知识点链接 |
| 习惯养成 | 任务完成、手动打卡 | 打卡记录、连续天数 |

---

## 四、API接口清单

| 端点 | 方法 | 功能 | 文件位置 |
|------|------|------|----------|
| `/api/health` | GET | 健康检查 | server.js#L1 |
| `/api/chat` | POST | AI聊天（SSE） | server.js#L18 |
| `/api/generate-study-plan` | POST | 生成学习计划 | server.js#L98 |
| `/api/mood-analysis` | POST | 心情分析 | server.js#L145 |

---

## 五、关键技术实现

### 5.1 流式响应处理（SSE）

```javascript
// 前端接收流式响应
async function sendChat(message) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [...history, { role: 'user', content: message }] })
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let content = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          // 完成
          break;
        }
        const parsed = JSON.parse(data);
        if (parsed.content) {
          content += parsed.content;
          updateUI(content); // 更新界面
        }
      }
    }
  }
}
```

### 5.2 本地存储管理

```javascript
// 保存数据到localStorage
function save() {
  localStorage.setItem('interstellar-learning', JSON.stringify(data));
}

// 从localStorage加载数据
function load() {
  const saved = localStorage.getItem('interstellar-learning');
  if (saved) {
    Object.assign(data, JSON.parse(saved));
  }
}

// 定时自动保存
setInterval(save, 5000); // 每5秒自动保存
```

### 5.3 响应式设计

```css
/* 移动端适配 */
@media screen and (max-width: 428px) {
  .container {
    padding: 0 16px;
    max-width: 428px;
    margin: 0 auto;
  }
  
  /* 触摸按钮最小44px */
  button, .btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 字体大小适配 */
  body {
    font-size: 14px;
  }
}

@media screen and (max-width: 375px) {
  body {
    font-size: 13px;
  }
}

@media screen and (max-width: 320px) {
  body {
    font-size: 12px;
  }
}
```

---

## 六、任务优先级与实现顺序

### 6.1 P0（核心功能）

| 任务 | 说明 | 依赖 |
|------|------|------|
| 学习计划生成 | AI生成个性化计划 | mood-analysis |
| 番茄钟基础 | 倒计时、完成统计 | 学习计划 |
| 学习搭子基础 | SSE流式聊天 | - |
| 心情日记基础 | 打卡、AI分析 | - |

### 6.2 P1（联动功能）

| 任务 | 说明 | 依赖 |
|------|------|------|
| 心情→计划 | 根据心情调整难度 | 学习计划、心情日记 |
| 计划→番茄钟 | 任务分发 | 学习计划、番茄钟 |
| 番茄钟→习惯 | 自动打卡 | 番茄钟、习惯养成 |
| 学习搭子→知识星球 | 一键收藏 | 学习搭子、知识星球 |

### 6.3 P2（进阶功能）

| 任务 | 说明 | 依赖 |
|------|------|------|
| 知识星球Wiki风格 | 知识点链接 | 知识星球 |
| 学习搭子上下文感知 | 根据当前任务回答 | 学习搭子、学习计划 |
| 首页仪表盘 | 数据汇总展示 | 所有模块 |

---

## 七、测试与验证

### 7.1 单元测试要点

```javascript
// 学习计划生成测试
test('心情影响计划难度', () => {
  const planHappy = generatePlan({ mood: 'happy' });
  const planSad = generatePlan({ mood: 'sad' });
  
  const hardRatioHappy = planHappy.tasks.filter(t => t.difficulty >= 4).length / planHappy.tasks.length;
  const hardRatioSad = planSad.tasks.filter(t => t.difficulty >= 4).length / planSad.tasks.length;
  
  expect(hardRatioHappy).toBeGreaterThan(hardRatioSad);
});

// 番茄钟测试
test('番茄完成自动打卡', () => {
  const habit = { id: 'h1', name: '数学练习', currentStreak: 5, history: [] };
  data.habits.push(habit);
  
  const task = { id: 't1', title: '数学练习', type: 'pomodoro' };
  data.studyPlan.tasks.push(task);
  
  onPomodoroComplete('t1');
  
  expect(habit.currentStreak).toBe(6);
});
```

### 7.2 集成测试要点

1. **完整流程测试**：心情→计划→番茄→习惯→知识星球
2. **数据一致性测试**：刷新页面后数据不丢失
3. **联动测试**：各模块间数据正确传递

### 7.3 用户体验测试

1. **响应式测试**：320px、375px、428px宽度
2. **触摸测试**：按钮点击区域≥44px
3. **流畅度测试**：动画不卡顿、切换流畅

---

## 八、部署与发布

### 8.1 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 访问地址
http://localhost:3000
```

### 8.2 Docker部署

```bash
# 构建镜像
docker build -t interstellar-learning .

# 运行容器
docker run -p 3000:3000 \
  -e ARK_API_URL=https://ark.cn-beijing.volces.com/api/coding/v3 \
  -e ARK_API_KEY=your-api-key \
  interstellar-learning
```

### 8.3 Vercel部署（推荐）

**vercel.json配置**:
```json
{
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/server.js" }
  ],
  "env": {
    "ARK_API_URL": "@ark-api-url",
    "ARK_API_KEY": "@ark-api-key"
  }
}
```

---

## 九、代码规范

### 9.1 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `currentTask`, `studyPlan` |
| 函数 | camelCase | `generatePlan()`, `saveToNotes()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_DURATION`, `API_BASE` |
| 文件 | kebab-case | `server.js`, `tech-guide.md` |
| 类 | PascalCase | `class StudyPlan { }` |

### 9.2 代码注释

```javascript
/**
 * 生成学习计划
 * @param {Object} options - 配置选项
 * @param {string} options.goal - 学习目标
 * @param {number} options.duration - 总时长（分钟）
 * @param {string[]} options.subjects - 科目列表
 * @param {string} options.mood - 心情状态
 * @returns {Object} 学习计划对象
 */
function generatePlan(options) {
  // 实现逻辑
}
```

### 9.3 错误处理

```javascript
try {
  const response = await fetch('/api/chat', options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  // 处理响应
} catch (error) {
  console.error('API Error:', error);
  showError('网络异常，请稍后重试');
}
```

---

## 十、安全注意事项

### 10.1 API Key保护

- 不要在前端代码中硬编码API Key
- 使用环境变量管理敏感信息
- 后端作为代理，前端从不直接调用外部API

### 10.2 输入验证

```javascript
function validateInput(input) {
  // 防止XSS攻击
  const sanitized = DOMPurify.sanitize(input);
  
  // 长度限制
  if (sanitized.length > 1000) {
    throw new Error('输入内容过长');
  }
  
  return sanitized;
}
```

### 10.3 数据隐私

- 所有数据存储在用户本地（localStorage）
- 不收集个人身份信息
- 不向第三方传输用户数据

---

## 附录：工具函数清单

| 函数名 | 功能 | 位置 |
|--------|------|------|
| `save()` | 保存数据到localStorage | index.html |
| `load()` | 从localStorage加载数据 | index.html |
| `formatMarkdown()` | Markdown格式转换 | index.html |
| `fixLatexFormula()` | LaTeX公式修复 | index.html |
| `updateStreamingMessage()` | 更新流式消息显示 | index.html |
| `saveToNotes()` | 保存到知识星球 | index.html |
| `renderNotes()` | 渲染笔记列表 | index.html |
| `checkHabit()` | 打卡习惯 | index.html |
| `generatePlan()` | 生成学习计划 | server.js |
| `analyzeMood()` | 心情分析 | server.js |

---

**文档版本**: v1.0  
**创建日期**: 2026-06-21  
**适用范围**: 星际学霸项目