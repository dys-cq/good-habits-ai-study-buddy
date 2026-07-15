## 0. 目标与边界

&#x20;

### 核心目标

维护 `wiki/` 目录，将其打造为可复制的知识层。

- **目标**：你负责维护本仓库中的 `wiki/` 目录，使其成为结构化的研究知识库。
- **边界**：
  - 原始资料（`raw/`）是唯一事实来源，**只读不改**。
  - 只在 `wiki/` 里创建、修改 Markdown 页面。
  - 不要改动其它目录。

### 不可变原则

- `raw/` 目录中的原始素材**绝对不可修改**。如果发现 `raw/` 中的内容有错误，不得直接修改 raw 文件。应在对应的 wiki 页面中明确标注说明，例如：
  > ⚠️ Source contains error: ……

### 设计理念

维护知识库最繁重的工作不是阅读或思考——而是**记账**。更新交叉引用、保持摘要最新、标注新旧数据矛盾、维护数十个页面之间的一致性。人会因为维护负担增长速度快于价值增长速度而放弃 wiki。**LLM 不会厌倦，不会忘记更新交叉引用，可以在一次操作中触及 15 个文件。** 维护成本趋近于零，wiki 因此能持续增长。

人的职责是筛选资料、引导分析、提出好问题、思考意义。**除此之外的所有事情交给 LLM。**

> 原始理念来自 Andrej Karpathy 的 [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)，其精神可追溯至 Vannevar Bush（1945）的 Memex 构想——一个私人的、主动维护的、文档间关联与文档本身同等重要的知识库。

### 0.1 快速开始（5 分钟）

**首次使用流程**：

1. 对 AI 说 `init wiki` 或 `初始化 wiki`
2. 将一个 PDF、网页截图或文本文件放到 `raw/` 目录
3. 对 AI 说 `ingest raw/文件名`
4. 查看 `wiki/index.md` 看生成了哪些页面
5. 向 AI 提问测试 query 功能，如"这篇文章的核心观点是什么？"

完成后你就拥有了一个可持续增长的个人知识库。

***

## 1. 目录结构约定

### 原始资料层

- `raw/`：原始资料（PDF、网页 Markdown、图片等），只读。
- `raw/assets/`：存放图片、视频等附件资源（通过 Obsidian Web Clipper 或手动保存）。

### Wiki 维护层

`wiki/` 由你维护，按以下类型分子目录：

类型

目录

用途

entity

`wiki/entities/`

命名实体（人物、工具、组织、数据集）

concept

`wiki/concepts/`

思想、技术、现象、框架

source

`wiki/sources/`

论文、文章、演讲、书籍、博客

query

`wiki/queries/`

正在积极研究的开放问题

comparison

`wiki/comparisons/`

2-5 个明确实体的**结构化对比**，按维度逐项列出差异

synthesis

`wiki/synthesis/`

跨来源的**主题综述**，整合观点，不限于对比

overview

`wiki/`（根目录）

高级项目/领域摘要，作为顶层入口（直接放在 `wiki/` 根目录，不入子目录）

thesis

`wiki/thesis/`

工作假设及其演化

methodology

`wiki/methodology/`

研究方法、协议、研究设计

finding

`wiki/findings/`

单个实证结果或观察

**类型区分要点**：

- **Comparison vs Synthesis**：
  - Comparison：**结构化对比** 2-5 个明确的实体，按维度（如性能、成本、易用性）逐项列出差异。
  - Synthesis：**主题综述**，跨来源整合观点、总结趋势、提炼结论，不限于对比。

**子目录深度不限**：例如 `wiki/一人企业/agent teams/xxx.md` 完全合法（除 overview 外，其他类型可以有多层子目录）。

**首次使用时自动初始化**：在 vault 根目录下读取本手册后，应立即检查以下目录和文件是否存在，缺失则主动创建：

- `raw/`（含 `raw/assets/`）
- `wiki/` 下的所有子目录（`entities/`、`concepts/`、`sources/`、`queries/`、`comparisons/`、`synthesis/`、`thesis/`、`methodology/`、`findings/`）
- `wiki/index.md`，初始内容为：

```
# Wiki Index

## Entities

## Concepts

## Sources

## Queries

## Comparisons

## Synthesis

## Overview

## Thesis

## Methodology

## Findings

```

- `wiki/log.md`，初始内容为：

```
# Wiki Log

## YYYY-MM-DD
- init | Wiki structure initialized

```

（将 `YYYY-MM-DD` 替换为当天日期）

### 根目录文件

- `wiki/index.md`：按类型分组的所有页面索引。
- `wiki/log.md`：操作日志（逆序时间，append-only）。

***

## 2. 页面类型与基本格式

所有 wiki 页面使用 Markdown，**推荐**包含 YAML frontmatter（但非强制，见"可放宽的约束"）。

### 2.1 命名规范

- 文件：`kebab-case.md`（推荐，跨平台兼容）
- 实体：尽量使用官方名称（如 `openai.md`、`gpt-4.md`）
- 概念：描述性名词短语（如 `chain-of-thought.md`）
- 来源：`author-year-slug.md`（如 `wei-2022-cot.md`）
- 查询：问题作为 slug（如 `does-scale-improve-reasoning.md`）
- 论点：假设作为 slug（如 `scaling-improves-reasoning.md`）
- 方法：方法名称（如 `systematic-review.md`、`ablation-study.md`）
- 发现：描述性 slug（如 `larger-models-better-few-shot.md`）
- 对比：比较对象作为 slug（如 `gpt-4-vs-claude-3.md`、`transformer-vs-mamba.md`）
- 综合：主题或研究问题作为 slug（如 `llm-scaling-laws.md`、`rlhf-alignment.md`）
- 概览：项目或领域名称作为 slug（如 `agent-project.md`、`llm-safety.md`）

> 可放宽：不强制 `kebab-case`，可用中文、空格等描述性名称，但推荐保持简单以兼容工具。

### 2.2 通用 Frontmatter（推荐）

所有页面建议包含：

```
---
type: entity | concept | source | query | comparison | synthesis | overview | thesis | methodology | finding
title: Human-readable title
tags: []
related: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

```

### 2.3 特定类型的 Frontmatter 扩展

**Source 页面** 额外包含：

```
authors: []
year: YYYY
url: ""
venue: ""

```

**Thesis 页面** 额外包含：

```
confidence: low | medium | high
status: speculative | supported | refuted | settled

```

**Finding 页面** 额外包含：

```
source: "[[source-slug]]"
confidence: low | medium | high
replicated: true | false | null

```

**Comparison 页面** 额外包含：

```
dimensions: []  # 比较维度，如 ["性能", "成本", "易用性"]
compared: []    # 被比较的实体或概念 wiki 链接，如 ["[[gpt-4]]", "[[claude-3]]"]

```

**Overview 页面** 额外包含：

```
scope: ""       # 覆盖范围，如 "agent 团队项目"、"LLM 安全领域"
key_pages: []   # 关键子页面链接，如 ["[[chain-of-thought]]", "[[rlhf-alignment]]"]

```

> 可放宽：frontmatter 可选，不加也可以。但缺少 `updated` 字段时，`lint` 的级联更新将无法自动维护日期。推荐至少保留 `updated`。

### 2.4 内容编写规则

- 使用 `[[page-slug]]` 语法进行内部链接。
- **所有类型的页面**都应出现在 `wiki/index.md` 的对应分类下。
- 查询页面（query）需链接到它所依赖的来源和概念。
- 综合页面（synthesis）通过 `related:` 字段引用所有贡献的来源。
- 发现页面（finding）通过 `source:` 字段链接回其来源。
- 论点页面（thesis）通过 `related:` 字段引用支持和反驳的发现。
- 方法页面（methodology）被使用它的发现页面所引用。
- 对比页面（comparison）通过 `compared:` 字段引用被比较的实体或概念，正文中逐项列出差异。
- 概览页面（overview）作为项目/领域的高级入口，`key_pages:` 字段列出关键子页面，**直接存放在** **`wiki/`** **根目录**。

### 2.5 引用路径约定

- **Wiki 内部链接**：使用 **相对于当前文件的路径**。例如在 `wiki/concepts/chain-of-thought.md` 中引用 `wiki/sources/wei-2022-cot.md`，应写为 `[[../sources/wei-2022-cot]]` 或使用 Obsidian 支持的 `[[完整路径]]`。
- **对话中引用 wiki 文章**：使用 **相对于 vault 根目录的路径**，例如 `wiki/concepts/chain-of-thought.md`。
- 所有日期（`created`、`updated`、log 中的日期）使用当天的实际日期，不依赖文件系统时间戳。

***

## 3. 工作流：Ingest / Query / Lint

### 3.1 Ingest（导入新资料）

当收到指令"请基于 `raw/xxx` 进行 Ingest"时：

**前置步骤——资料不在** **`raw/`** **时**：如果用户直接提供了 URL、粘贴的文本或其他非文件形式的资料，应先将其保存到 `raw/<最合适的主题>/` 下（自动创建目录），再执行以下 Ingest 流程。例如用户说"Ingest 这篇文章：[https://example.com/article"，AI](https://example.com/article%22%EF%BC%8CAI) 应先抓取网页内容存为 Markdown，再进入正式流程。

> **一篇新资料可能影响 10-15 个 wiki 页面**——这正是 wiki "复利"效应的体现。不要只写一篇摘要就结束，要扫描并更新所有受影响的实体页、概念页、综合页和索引。

#### Ingest 执行步骤

1. 阅读 `raw/xxx`，提炼要点，与用户简短确认重点。
2. 将素材存进 `raw/<最合适的主题>/`（主题不存在就新建），文件名保持原样（PDF/视频/图片）或起描述性名（md 笔记）。
3. **根据内容类型创建对应 wiki 页面**：
   - **Source 页面**（`wiki/sources/`）：为原始资料本身创建摘要页（论文、书籍、文章、演讲等）。
   - **Entity 页面**（`wiki/entities/`）：提到的命名实体（人物、组织、工具、数据集）。
   - **Concept 页面**（`wiki/concepts/`）：引入或详细解释的思想、技术、现象、框架。
   - **Finding 页面**（`wiki/findings/`）：文献中有明确的实证结果或观察（如"GPT-3 在 few-shot 场景优于 GPT-2"），需在 frontmatter 中通过 `source:` 字段链接回来源页面。
   - **Methodology 页面**（`wiki/methodology/`）：文献描述了某种研究方法、实验协议或研究设计，且该方法具有通用性。
   - **Thesis 页面**（`wiki/thesis/`）：作者提出了明确的工作假设或理论猜想（如"规模扩大会改善推理能力"）。
   - **Comparison 页面**（`wiki/comparisons/`）：素材中对 2-5 个实体进行了结构化对比。
   - **Synthesis 页面**（`wiki/synthesis/`）：当新素材让你能够跨来源整合观点时创建（通常不在单次 Ingest 时立即创建，而是积累多个来源后）。
   - **Overview 页面**（`wiki/` 根目录）：当素材是某个项目或领域的顶层介绍时，创建高级摘要页（**直接放在** **`wiki/`** **根目录，不入子目录**）。
4. **判断是否合并到现有页面**：
   - 和现有页面描述**完全相同的实体/概念** → 合并进去，更新 Sources 和受影响的小节。
   - **同一论文/来源的不同版本**（如 arXiv 预印本 vs 正式发表版）→ 合并到同一个 source 页面。
   - **同一作者同一年的相关工作**（系列论文） → 根据主题相关性决定是否合并。
   - **全新概念/实体** → 新建页面，按概念命名，不按 raw 文件名。
   - **跨多个主题** → 落在最相关的主题下，在文章末尾加"See Also"交叉引用。
5. **检查事实冲突**：新素材和已有内容矛盾时，在文章里标注分歧和来源归属，必要时创建或更新 `wiki/queries/` 中的开放问题页面。
6. **级联更新**：如果新素材影响了同一主题或相关主题下的其他 wiki 页面（例如更新了某个概念的定义，导致其他引用该概念的文章需要重新审视），应：
   - 扫描关联页面，必要时更新它们的内容。
   - **更新规则**：如果页面**内容被修改**则更新 `updated` 日期；如果仅是**被动关联**（如添加反向链接、在 `related` 字段中被提及）则不更新 `updated` 日期。
   - 在 `wiki/log.md` 的 ingest 记录中列出所有受影响的页面。
7. **更新** **`wiki/index.md`**：给每篇改动过或新建的文章补/改条目，确保所有类型的页面都出现在对应分类下。
8. **追加** **`wiki/log.md`**：

```
## YYYY-MM-DD
- ingest | raw/xxx → wiki/sources/xxx.md (+ entities/openai.md, concepts/chain-of-thought.md, synthesis/reasoning-methods.md)

```

### 3.2 Query（基于 wiki 回答问题）

当收到提问时：

1. 先读 `wiki/index.md` 定位相关文章。
2. 读取页面内容，综合回答。优先引用 wiki 内容，其次才用 AI 自己的训练知识。
3. 引用时使用 Markdown 链接：`[文章标题](wiki/主题/文章.md)`。
4. **默认只在对话里答，不写文件**。

**例外——用户要求将查询结果存档**（触发词如"存下来"、"归档到 wiki"）：

1. 将本次回答作为新文章写入最相关的 `wiki/<主题>/` 目录。
2. 不合并到已有文章（因为合成答案不是原始素材）。
3. 在 `wiki/index.md` 中添加条目，摘要前加 `[Archived]` 前缀。
4. 在 `wiki/log.md` 中追加：

```
## YYYY-MM-DD
- query | Archived: <页面标题>

```

### 3.3 Lint（定期检查与建议）

执行 lint 时，分为两类检查：

#### 确定性检查（尽量自动修复）

- `wiki/index.md` ↔ 实际文件一致性：
  - 文件存在但索引缺 → 补条目
  - 索引指向死文件 → 标 `[MISSING]`
- wiki 内部 Markdown 链接失效：
  - 如果同名文件存在于其他路径 → 修正链接路径
  - 如果完全找不到 → 报告
- See Also 链接：
  - 同主题明显缺失的交叉引用 → 补上
  - 链接指向已删除文件 → 删除该链接

#### 启发式检查（只报告，不自动修改）

- 跨文章事实矛盾
- 新素材让旧论点过时
- 源头分歧没有标注
- 孤立页面（没有入链）
- 跨主题应当链接但没有链接的概念
- 反复被提及但未独立成页的概念

完成 lint 后，在 `wiki/log.md` 追加：

```
## YYYY-MM-DD
- lint | <N> issues found, <M> auto-fixed

```

### 3.4 矛盾处理

当来源之间出现矛盾时：

1. 在相关的概念或实体页中记录矛盾。
2. 创建或更新查询页面（`wiki/queries/`）以跟踪开放问题。
3. 从查询页面链接双方来源。
4. 一旦有足够证据，在综合页面（`wiki/synthesis/`）中尝试解决矛盾。

***

## 4. 约定与风格

### 操作原则

- **执行边界**：
  - **直接执行**：单个文件的增删改、对 index 和 log 的常规更新。
  - **先提议再执行**：批量重命名、大规模重构、删除 10+ 个页面。
- 命名推荐遵循 2.1 的 kebab-case 规范（保证跨平台兼容性）。
- 内部链接使用 `[[page-slug]]` Obsidian wikilink 语法。
- 每个发现应评估复制状态（`replicated` 字段）。
- 方法页面解释 **为什么**（原理），而不仅仅是 **怎么做**。
- 区分直接证据和推论：在发现页面中明确标注。

### 日志格式

`wiki/log.md` 逆序记录所有操作，示例：

```
## 2026-06-07
- ingest | raw/wei2022cot.pdf → wiki/sources/wei-2022-cot.md (+ entities/openai.md, concepts/chain-of-thought.md, synthesis/reasoning-methods.md)
- query | 新建 wiki/comparisons/gpt4-vs-gpt35.md
- lint | merge concept_old v1 v2

## 2026-06-06
- ingest | raw/brown2020fewshot.pdf → wiki/sources/brown-2020-fewshot.md

```

### 索引格式

`wiki/index.md` 按类型分组，每组列出页面链接和一行描述：

```
# Wiki Index

## Entities
- [[openai]] — AI research organization
- [[gpt-4]] — Large language model from OpenAI

## Concepts
- [[chain-of-thought]] — Reasoning technique via intermediate steps

## Sources
- [[wei-2022-cot]] — Chain-of-Thought paper from Google

```

### 可放宽的约束

以下规则在个人使用或非正式研究场景下可以放松，但建议在团队或正式项目中仍遵循上述严格规范：

- **子目录深度不限**：`wiki/主题/子主题/.../页面.md` 完全合法（除 overview 外）。
- **文件命名自由**：不强制 `kebab-case`，可以用中文、空格等描述性名称（但推荐保持跨平台兼容性，避免特殊字符）。
- **Frontmatter 可选**：可以不加 YAML frontmatter，但缺少 `updated` 字段时，`lint` 的级联更新将无法自动维护日期。推荐至少保留 `updated`。
- **不强制** **`summary`** **字段**：如果索引 `wiki/index.md` 中已有一句话描述，可以不写在 frontmatter 中。

***

## 5. 异常情况处理

### 5.1 文件损坏或无法解析

- **Raw 文件损坏**：在 `wiki/log.md` 记录错误，通知用户，跳过该文件。
- **PDF 无法提取文本**：尝试 OCR 或请用户提供可读版本。
- **网页抓取失败**：记录 URL 和错误信息，请用户手动保存或提供替代来源。

### 5.2 Wiki 页面格式错误

- **Frontmatter 解析失败**：尝试修复常见错误（如缺少 `---`、YAML 语法错误），无法修复则报告用户。
- **内部链接大量失效**：运行 `lint` 批量检测，能自动修正的修正，不能的生成报告列表。

### 5.3 已删除 Raw 文件对应的 Wiki 页面

**处理策略**：

- **保留 wiki 页面**：raw 文件是来源，wiki 是提炼的知识，删除 raw 不应删除 wiki。
- **标记来源失效**：在对应的 source 页面顶部添加：
  > ⚠️ Original source file has been removed: `raw/xxx`
- **不影响引用**：其他页面对该 source 的引用保持不变。

### 5.4 重构 Wiki 结构

**拆分过大的页面**：

1. 识别可独立成页的小节（通常是子概念或子实体）。
2. 为每个小节创建新页面，在原页面中替换为 `[[新页面]]` 链接。
3. 更新 `wiki/index.md` 和所有反向链接。
4. 在 `wiki/log.md` 记录拆分操作。

**合并重复页面**：

1. 确认两个页面描述同一实体/概念。
2. 合并内容到其中一个，删除另一个。
3. 更新所有指向被删除页面的链接。
4. 在 `wiki/log.md` 记录合并操作。

***

## 6. 版本控制建议

### Git 版本控制（强烈推荐）

Wiki 本质上是一组 Markdown 文件，用 Git 管理即可获得：

- **版本历史**：回溯任何时间点的内容。
- **回滚能力**：AI 出错或误删时轻松恢复。
- **分支实验**：在分支中尝试大规模重构，满意后再合并。
- **协作能力**：多人维护同一 wiki（通过 GitHub/GitLab 等）。

**推荐工作流**：

1. 将整个 vault（含 `raw/` 和 `wiki/`）初始化为 Git 仓库。
2. 每次 Ingest、Lint 或重大更新后提交一次。
3. Commit message 可直接复用 `wiki/log.md` 的对应条目。

***

## 7. 工具选择

当需要查找笔记间的关系时，优先使用 **obsidian-cli skill**：

- Wiki links（双向链接）查询
- Tags 或带特定 tags 的笔记搜索
- Frontmatter 信息提取
- 笔记之间的相互关系梳理与分析

**调用方式**：在对话中使用 `/obsidian` 命令或直接描述需求（如"找出所有引用 chain-of-thought 的页面"）。

### 为什么用 obsidian-cli

obsidian-cli 专门针对 Obsidian 的元数据和链接结构优化，比通用的文本搜索更精确高效。

### Obsidian 生态工具推荐

以下工具配合本手册使用可显著提升效率：

- **Obsidian Web Clipper**：浏览器扩展，将网页文章一键转为 Markdown 放入 `raw/`，是 Ingest 的最佳前端入口。
- **图片本地化**：
  - 在 Obsidian 设置 → 文件与链接中，将"附件文件夹路径"设为 `raw/assets/`。
  - 网页剪藏后，在 Obsidian 命令面板中搜索"Download images"或设置快捷键，将所有图片下载到本地，使 AI 能直接查看图片而非依赖可能失效的 URL。
- **Graph View**：Obsidian 内置的知识图谱视图，可视化 wiki 页面间的链接关系，快速发现核心枢纽页面和孤立页面。
- **Dataview 插件**：基于 YAML frontmatter 运行动态查询。如果 wiki 页面包含 `type`、`tags`、`updated` 等字段，Dataview 可自动生成分类列表和最近更新视图，是 `wiki/index.md` 的有力补充。
- **Marp 插件**：Markdown 演示文稿格式。可直接从 wiki 内容生成演示文稿，适合将 Query 结果快速输出为幻灯片。

***

## 8. 常见问题（FAQ）

### Q1: 一篇文章提到多个概念，都要创建独立页面吗？

**A**: 不一定。遵循"最少惊讶原则"：

- **核心概念**（文章重点解释、占据大量篇幅）→ 创建独立页面。
- **顺带提及**（一两句话带过）→ 在 source 页面中简要记录，不单独成页。
- **判断标准**：如果未来可能有其他资料讨论该概念，或该概念值得交叉引用，就创建独立页面。

### Q2: Raw 文件可以删除吗？

**A**: 可以，但需注意：

- **删除 raw 不应删除对应的 wiki 页面**（知识已提炼，可独立存在）。
- **在对应 source 页面标记来源失效**（见 5.3 节）。
- **适用场景**：释放存储空间、移除过时资料、清理重复文件。

### Q3: 如何重构 Wiki 结构？

**A**: 见第 5.4 节"重构 Wiki 结构"。关键原则：

- 拆分过大页面时，保持原子性（一个页面一个核心概念）。
- 合并重复页面时，确保不丢失信息。
- 所有重构操作都要更新 `wiki/index.md` 和反向链接。

### Q4: Comparison 和 Synthesis 如何选择？

**A**:

- 如果是 **2-5 个明确实体的逐项对比**（如"GPT-4 vs Claude 3：性能/成本/API"）→ `wiki/comparisons/`
- 如果是 **跨来源的主题综述**（如"LLM Scaling Laws 的演进"）→ `wiki/synthesis/`

### Q5: 如何处理多语言资料？

**A**:

- **Raw 保持原语言**：PDF、网页等原样保存。
- **Wiki 统一语言**（通常是中文或英文）：在 source 页面中翻译关键内容，其他页面用统一语言编写。
- **双语 frontmatter**：可在 `title` 中使用"中文标题 (English Title)"格式。

### Q6: Overview 页面一定要放在根目录吗？

**A**: 是的。Overview 类型的设计意图是作为**顶层入口**，直接放在 `wiki/` 根目录便于快速访问。如果需要多级概览（如"AI 安全 → 对齐研究 → RLHF"），考虑：

- 顶层用 overview（`wiki/ai-safety.md`）
- 子层用 synthesis（`wiki/synthesis/rlhf-overview.md`）

***

## 9. 常用指令速查表

操作

触发词

AI 执行的动作

**初始化目录**

`init wiki` / `初始化 wiki`

创建 raw/、wiki/ 及所有子目录、index.md、log.md

**Ingest（文件已在 raw/）**

`请基于 raw/xxx 进行 Ingest`

读取资料 → 创建 wiki 页面 → 级联更新 → 写索引和日志

**Ingest（直接给 URL）**

`Ingest 这篇文章：https://...`

抓取网页 → 存入 raw/ → 执行 Ingest 流程

**Ingest（直接粘贴内容）**

`帮我把这段内容 ingest 到 wiki`

存入 raw/ → 执行 Ingest 流程

**Query**

任何问题（无需特殊前缀）

读 wiki index → 定位相关页面 → 综合回答（默认不写文件）

**存档查询结果**

`存下来` / `归档到 wiki`

将查询回答写成 wiki 页面，index 标 `[Archived]`

**Lint**

`请对 wiki 做一次 Lint` / `lint 一下 wiki`

确定性检查 + 启发式检查 → 自动修复 → 写日志

**查看索引**

`wiki 里有哪些文章？` / `帮我看看 index`

读取 wiki/index.md 并列出

**查看日志**

`最近做了哪些改动？`

读取 wiki/log.md 并摘要

**查看某类型页面**

`列出所有概念页` / `有哪些来源？`

遍历对应子目录并列出

**查找关联页面**

`哪些页面引用了 chain-of-thought？`

使用 obsidian-cli 或文本搜索查找反向链接

**重构页面**

`拆分 xxx 页面` / `合并 xxx 和 yyy`

按 5.4 节流程执行拆分/合并 → 更新链接 → 写日志

***

## 10. 完整示例演练

### 场景：Ingest 一篇论文

**用户操作**：

1. 将 `wei2022cot.pdf` 放入 `raw/papers/` 目录。
2. 对 AI 说："请基于 raw/papers/wei2022cot.pdf 进行 Ingest"。

**AI 执行流程**：

1. **读取 PDF**：提炼关键信息（标题、作者、核心观点、实验结果）。
2. **创建 Source 页面**：`wiki/sources/wei-2022-cot.md`

```
---
type: source
title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"
authors: ["Jason Wei", "Xuezhi Wang", "Dale Schuurmans", "et al."]
year: 2022
url: "https://arxiv.org/abs/2201.11903"
venue: "NeurIPS 2022"
tags: ["reasoning", "prompting", "few-shot"]
created: 2026-06-07
updated: 2026-06-07
---

## Summary
本文提出 Chain-of-Thought (CoT) prompting……

## Key Findings
- [[larger-models-benefit-more-from-cot]]
- ……

## Related Concepts
- [[chain-of-thought]]
- [[few-shot-learning]]

```

1. **创建/更新 Entity 页面**：`wiki/entities/openai.md`（如果论文提到 GPT-3）
2. **创建/更新 Concept 页面**：`wiki/concepts/chain-of-thought.md`

```
---
type: concept
title: "Chain-of-Thought (CoT)"
tags: ["reasoning", "prompting"]
related: ["[[wei-2022-cot]]", "[[few-shot-learning]]"]
created: 2026-06-07
updated: 2026-06-07
---

## Definition
CoT 是一种提示技术……

## Sources
- [[wei-2022-cot]] — 首次提出

```

1. **创建 Finding 页面**：`wiki/findings/larger-models-benefit-more-from-cot.md`

```
---
type: finding
title: "Larger Models Benefit More from CoT"
source: "[[wei-2022-cot]]"
confidence: high
replicated: true
created: 2026-06-07
updated: 2026-06-07
---

Wei et al. (2022) 发现……

```

1. **更新** **`wiki/index.md`**：

```
## Entities
- [[openai]] — AI research organization

## Concepts
- [[chain-of-thought]] — Reasoning technique via intermediate steps

## Sources
- [[wei-2022-cot]] — Chain-of-Thought paper from Google

## Findings
- [[larger-models-benefit-more-from-cot]] — CoT scaling effect

```

1. **追加** **`wiki/log.md`**：

```
## 2026-06-07
- ingest | raw/papers/wei2022cot.pdf → wiki/sources/wei-2022-cot.md (+ entities/openai.md, concepts/chain-of-thought.md, findings/larger-models-benefit-more-from-cot.md)

```

**最终文件树**：

```
raw/
├── papers/
│   └── wei2022cot.pdf
wiki/
├── entities/
│   └── openai.md
├── concepts/
│   └── chain-of-thought.md
├── sources/
│   └── wei-2022-cot.md
├── findings/
│   └── larger-models-benefit-more-from-cot.md
├── index.md
└── log.md

```

***

## 附录：设计原则回顾

1. **Raw 不可变**：原始资料是唯一事实来源。
2. **Wiki 可塑**：知识层持续演化，交叉引用自动维护。
3. **类型驱动**：9 种页面类型覆盖研究全生命周期。
4. **级联更新**：一篇新资料可能影响 10-15 个页面，AI 自动完成。
5. **人机分工**：人负责筛选和提问，AI 负责记账和维护。

***

