# 星际学霸 - 实现计划（强调模块联动）

## 阶段一：基础设施（P0）

### [x] Task 1: 项目初始化与H5适配基础
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 初始化Node.js项目
  - 配置H5移动端适配（viewport、rem、媒体查询）
  - 星空主题样式系统（移动端友好）
  - Docker配置
- **Acceptance Criteria Addressed**: [NFR-3, NFR-4]
- **Test Requirements**:
  - `programmatic` TR-1.1: 320px-428px屏幕适配正常
  - `human-judgment` TR-1.2: 触摸按钮大小 ≥ 44px
  - `programmatic` TR-1.3: Docker构建成功

### [x] Task 2: 数据层设计（统一状态管理）
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 设计统一的数据模型（心情、计划、任务、习惯、笔记）
  - 实现localStorage持久化
  - 设计模块间数据共享机制
- **Acceptance Criteria Addressed**: [NFR-5]
- **Test Requirements**:
  - `programmatic` TR-2.1: 所有模块数据正确存储
  - `programmatic` TR-2.2: 刷新页面数据不丢失

## 阶段二：核心枢纽实现（P0）

### [x] Task 3: 学习计划生成器
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现POST /api/generate-study-plan接口
  - **接收心情数据**：根据情绪调整任务难度
  - **输出结构化任务**：便于分发到番茄钟和习惯养成
  - 支持任务标记（番茄钟任务/习惯任务/自由任务）
- **Acceptance Criteria Addressed**: [FR-1, AC-5]
- **Test Requirements**:
  - `programmatic` TR-3.1: 不同心情生成不同难度计划
  - `programmatic` TR-3.2: 任务可分类（番茄/习惯）

### [x] Task 4: 番茄钟 → 学习计划联动
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 番茄钟启动时自动读取今日计划
  - 显示计划中的番茄任务列表
  - 用户可选择任务或跳过
  - 完成后标记任务为"已完成"
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-4.1: 番茄钟显示今日计划任务 ✓
  - `programmatic` TR-4.2: 完成番茄后计划状态更新 ✓

## 阶段三：学习搭子增强（P0）

### [x] Task 5: AI学习搭子（基础）
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 实现POST /api/chat接口（SSE流式）
  - 多科目支持
  - Markdown渲染
- **Acceptance Criteria Addressed**: [FR-2]
- **Test Requirements**:
  - `programmatic` TR-5.1: 流式输出正常
  - `programmatic` TR-5.2: Markdown格式正确

### [x] Task 6: 学习搭子 → 学习计划联动（上下文感知）
- **Priority**: P0
- **Depends On**: Task 5, Task 3
- **Description**: 
  - 学习搭子读取当前学习计划 ✓
  - 构建上下文感知的prompt（包含当前任务）✓
  - AI回答时考虑用户正在学习的知识点 ✓
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-6.1: API接收当前任务参数 ✓
  - `programmatic` TR-6.2: 回复内容与当前任务相关 ✓

### [x] Task 7: 学习搭子 → 知识星球联动（一键收藏）
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 聊天界面添加"保存到知识星球"按钮 ✓
  - 选择性保存对话片段 ✓
  - 自动关联当前科目 ✓
  - 存入知识星球 ✓
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `programmatic` TR-7.1: 可保存对话到知识星球 ✓
  - `programmatic` TR-7.2: 知识星球正确显示保存内容 ✓

### [x] Task 8: 学习搭子 → 番茄钟联动（边学边问）
- **Priority**: P1
- **Depends On**: Task 5, Task 4
- **Description**: 
  - 番茄钟期间显示"呼叫学习搭子"按钮 ✓
  - 点击弹出学习搭子对话（不中断番茄钟）✓
  - 回答时了解当前番茄任务背景 ✓
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-8.1: 番茄钟期间可调用学习搭子 ✓
  - `human-judgment` TR-8.2: 不中断番茄钟计时 ✓

## 阶段四：习惯养成与番茄钟联动（P1）

### [x] Task 9: 习惯养成基础
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 习惯创建（名称、科目、图标）✓
  - 每日打卡功能 ✓
  - 连续天数统计 ✓
  - 打卡历史记录 ✓
- **Acceptance Criteria Addressed**: [FR-4]
- **Test Requirements**:
  - `programmatic` TR-9.1: 习惯创建和打卡正常 ✓
  - `programmatic` TR-9.2: 连续天数正确计算 ✓

### [x] Task 10: 番茄钟 → 习惯养成联动
- **Priority**: P1
- **Depends On**: Task 4, Task 9
- **Description**: 
  - 番茄任务自动关联习惯 ✓
  - 番茄完成时自动打卡关联习惯 ✓
  - 显示"已为您打卡"提示 ✓
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-10.1: 番茄完成自动打卡 ✓
  - `programmatic` TR-10.2: 打卡记录正确关联 ✓

### [x] Task 11: 学习计划 → 习惯养成联动
- **Priority**: P1
- **Depends On**: Task 3, Task 9
- **Description**: 
  - 计划任务可识别为习惯任务 ✓
  - 计划中标记习惯类型 ✓
  - 根据计划推荐每日习惯 ✓
- **Acceptance Criteria Addressed**: [FR-4]
- **Test Requirements**:
  - `programmatic` TR-11.1: 计划任务可转化为习惯 ✓
  - `programmatic` TR-11.2: 习惯打卡计入计划完成度 ✓

## 阶段五：心情日记与计划联动（P1）

### [x] Task 12: 心情日记基础
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 心情选择器（5种情绪）
  - 日记输入和保存
  - 7天心情轨迹图表
  - AI情绪分析
- **Acceptance Criteria Addressed**: [FR-5]
- **Test Requirements**:
  - `programmatic` TR-12.1: 心情记录保存正常
  - `programmatic` TR-12.2: 轨迹图表正确显示

### [x] Task 13: 心情日记 → 学习计划联动
- **Priority**: P1
- **Depends On**: Task 12, Task 3
- **Description**: 
  - 生成计划时读取今日心情 ✓
  - 根据情绪调整任务难度权重 ✓
  - 心情差时自动减少高难度任务 ✓
  - AI生成计划时考虑心情因素 ✓
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-13.1: 不同心情生成不同计划 ✓
  - `programmatic` TR-13.2: API正确接收心情参数 ✓

## 阶段六：知识星球（Wiki风格）（P1）

### [x] Task 14: 知识星球基础
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 笔记创建、编辑、删除 ✓
  - 按科目分类 ✓
  - 按类型分类（概念/方法/题目）✓
  - 本地搜索 ✓
  - 笔记详情查看 ✓
- **Acceptance Criteria Addressed**: [FR-6]
- **Test Requirements**:
  - `programmatic` TR-14.1: 笔记CRUD正常 ✓
  - `programmatic` TR-14.2: 按科目/类型筛选正常 ✓

### [x] Task 15: 知识星球Wiki风格实现
- **Priority**: P1
- **Depends On**: Task 14
- **Description**: 
  - 实现`[[知识点链接]]`语法 ✓
  - 点击链接跳转知识点详情 ✓
  - 建立知识点关联图谱 ✓
  - 相关知识点推荐 ✓
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `programmatic` TR-15.1: 链接语法正确解析 ✓
  - `programmatic` TR-15.2: 点击链接跳转正确 ✓
  - `programmatic` TR-15.3: 显示相关知识点推荐 ✓

### [x] Task 16: 学习搭子 → 知识星球联动
- **Priority**: P1
- **Depends On**: Task 7, Task 15
- **Description**: 
  - 从对话一键保存到知识星球 ✓
  - 自动提取知识点 ✓
  - 自动建立学科和类型关联 ✓
  - 支持创建Wiki风格链接 ✓
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `programmatic` TR-16.1: 保存时自动分类 ✓
  - `programmatic` TR-16.2: 支持链接相关知识点 ✓

### [ ] Task 17: 学习搭子回答时参考知识星球
- **Priority**: P2
- **Depends On**: Task 6, Task 15
- **Description**: 
  - 学习搭子接收知识星球数据
  - 优先基于已有知识回答
  - 引用知识星球内容时标注来源
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-17.1: API可接收相关知识
  - `programmatic` TR-17.2: 回复引用知识星球内容

## 阶段七：整体集成与优化（P0）

### [ ] Task 18: 首页仪表盘（任务分发中心）
- **Priority**: P0
- **Depends On**: All previous
- **Description**: 
  - 显示今日心情和状态
  - 显示今日学习任务列表
  - 快速入口到各模块
  - 今日完成统计
  - 任务完成进度环形图
- **Acceptance Criteria Addressed**: [AC-8]
- **Test Requirements**:
  - `programmatic` TR-18.1: 显示所有模块数据汇总
  - `human-judgment` TR-18.2: 界面清晰，操作便捷

### [ ] Task 19: 学习闭环验证
- **Priority**: P0
- **Depends On**: All previous
- **Description**: 
  - 验证完整数据流：
    心情 → 计划 → 番茄钟 → 习惯 → 知识沉淀
  - 确保各模块数据互通
  - 优化用户体验
- **Acceptance Criteria Addressed**: [AC-8]
- **Test Requirements**:
  - `programmatic` TR-19.1: 完整流程数据流通
  - `human-judgment` TR-19.2: 各模块切换流畅

### [ ] Task 20: 响应式与性能优化
- **Priority**: P1
- **Depends On**: Task 18
- **Description**: 
  - 移动端全面适配测试
  - 触摸交互优化
  - 性能优化（首屏加载、交互响应）
- **Acceptance Criteria Addressed**: [AC-7]
- **Test Requirements**:
  - `human-judgment` TR-20.1: 多设备体验良好
  - `programmatic` TR-20.2: 首屏加载 < 2s

### [ ] Task 21: Docker部署测试
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 构建Docker镜像
  - 容器运行测试
  - 验证环境变量配置
- **Acceptance Criteria Addressed**: [NFR-3]
- **Test Requirements**:
  - `programmatic` TR-21.1: Docker构建成功
  - `programmatic` TR-21.2: 容器运行正常

## 任务依赖关系图

```
Task 1 ──┬── Task 2 ──┬── Task 3 ──┬── Task 4 ──┬── Task 18 ──┬── Task 19
         │            │            │            │              │
         │            │            │            │              │
         │            │            │            └──────┬───────┘
         │            │            │                   │
         │            │            │                   │
         │            │            ├────── Task 9 ─────┼────── Task 10
         │            │            │                   │
         │            │            │                   │
         │            │            ├────── Task 12 ────┴────── Task 13
         │            │            │
         │            │            │
         │            ├──── Task 5 ├──── Task 6 ──────┬── Task 7 ──┬── Task 16
         │            │            │                  │            │
         │            │            │                  │            │
         │            │            │                  ├──── Task 8 ─┤
         │            │            │                  │            │
         │            │            │                  │            │
         │            │            ├──── Task 14 ─────┴──── Task 15 ┴── Task 17
         │            │            │
         │            │            │
         │            └────────────┴─────────────────────────── Task 18
         │
         └─────────────────────────────────────────────────────── Task 21
```
