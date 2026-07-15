// ============================================================
// poetryMatcher.js — 白话 → 古诗文匹配引擎
// 三级匹配：精确 → 语义匹配（同义词扩展） → 主题内随机
// ============================================================

const PoetryMatcher = {
  // 所有诗词数据
  data: [],

  // 同义词词典相关
  synonymGroups: [],     // 同义词组列表
  wordToGroups: {},       // 词 → 同义词组索引列表（一词多义）
  stopwords: null,        // 停用词集合

  // 初始化：加载诗词数据 + 构建同义词索引
  init() {
    if (window.POETRY_DATA && window.POETRY_DATA.records) {
      this.data = window.POETRY_DATA.records;
    }

    if (window.SYNONYM_DATA) {
      this.synonymGroups = window.SYNONYM_DATA.groups || [];
      this.stopwords = window.SYNONYM_DATA.stopwords || new Set();

      // 构建反向索引：词 → 所属的同义词组索引列表
      // 同一个词可能属于多个组（一词多义）
      this.wordToGroups = {};
      this.synonymGroups.forEach((group, idx) => {
        group.forEach(word => {
          if (!this.wordToGroups[word]) {
            this.wordToGroups[word] = [];
          }
          this.wordToGroups[word].push(idx);
        });
      });
    }
  },

  // 主匹配函数
  match(baihua, theme) {
    if (this.data.length === 0) this.init();
    if (!baihua || !baihua.trim()) return null;

    const input = baihua.trim();

    // 第一级：精确匹配（用户输入完全等于某条 baihua）
    let result = this.exactMatch(input);
    if (result) return { ...result, matchType: 'exact' };

    // 第二级：语义匹配（基于同义词扩展 + 评分）
    result = this.semanticMatch(input, theme);
    if (result) return { ...result, matchType: 'similar' };

    // 第三级：主题内随机
    result = this.themeRandom(theme);
    if (result) return { ...result, matchType: 'random' };

    // 兜底：全库随机
    result = this.randomMatch();
    return result ? { ...result, matchType: 'fallback' } : null;
  },

  // 第一级：精确匹配
  exactMatch(input) {
    return this.data.find(r => r.baihua === input) || null;
  },

  // ============================================================
  // 第二级：语义匹配（核心改进）
  // 算法：
  // 1. 从用户输入中提取命中的同义词组
  // 2. 收集这些组的所有同义词作为扩展词集合
  // 3. 对候选记录的 baihua 字段评分：
  //    - 同义词命中（长词加分多）
  //    - 字面字符重合
  //    - 包含关系
  //    - 长度相似度
  // 4. 双池策略：同时计算主题内最佳 + 全库最佳，取较高者
  //    （主题内略有加权优势，全库有 0.92 系数）
  // ============================================================
  semanticMatch(input, theme) {
    if (this.synonymGroups.length === 0) {
      // 同义词词典未加载，降级为旧版相似度匹配
      return this.legacySimilarityMatch(input, theme);
    }

    // 1. 提取并扩展输入关键词
    const expanded = this.expandInput(input);

    // 2. 候选池
    const themeCandidates = theme
      ? this.data.filter(r => r.theme === theme)
      : [];
    const allCandidates = this.data;

    // 3. 双池策略：同时找主题内和全库的最佳记录
    let themeBest = null;
    let themeBestScore = 0;
    if (themeCandidates.length > 0) {
      for (const record of themeCandidates) {
        const score = this.scoreRecord(record, input, expanded);
        if (score > themeBestScore) {
          themeBestScore = score;
          themeBest = record;
        }
      }
    }

    let allBest = null;
    let allBestScore = 0;
    for (const record of allCandidates) {
      const score = this.scoreRecord(record, input, expanded);
      if (score > allBestScore) {
        allBestScore = score;
        allBest = record;
      }
    }

    // 4. 比较：主题内 × 1.0 vs 全库 × 0.92，取较高者
    const themeWeighted = themeBestScore;
    const allWeighted = allBestScore * 0.92;

    let winner = null;
    if (themeWeighted >= allWeighted && themeBest) {
      winner = themeBest;
    } else {
      winner = allBest;
    }

    // 阈值：必须达到最低分才返回（避免低质量匹配）
    const winnerScore = Math.max(themeWeighted, allWeighted);
    if (winnerScore < 4) return null;

    return winner;
  },

  // 提取并扩展输入关键词
  // 返回：{ groupsHit: Set<number>, expandedTerms: Set<string>, literalChars: Set<string> }
  expandInput(input) {
    const groupsHit = new Set();      // 命中的同义词组索引
    const literalChars = new Set();   // 输入中的字面字符（去停用词）

    // 滑窗扫描：先匹配长词（4字→1字），避免短词命中导致长词被忽略
    // 这里采用：对每个子串查 wordToGroups
    const len = input.length;
    for (let wlen = 4; wlen >= 1; wlen--) {
      for (let i = 0; i <= len - wlen; i++) {
        const word = input.substr(i, wlen);
        const groupList = this.wordToGroups[word];
        if (groupList) {
          groupList.forEach(g => groupsHit.add(g));
        }
      }
    }

    // 收集所有字面字符（去停用词）
    for (const ch of input) {
      if (!this.stopwords.has(ch)) {
        literalChars.add(ch);
      }
    }

    // 收集所有扩展词
    const expandedTerms = new Set();
    groupsHit.forEach(gIdx => {
      const group = this.synonymGroups[gIdx];
      if (group) {
        group.forEach(w => expandedTerms.add(w));
      }
    });

    return { groupsHit, expandedTerms, literalChars };
  },

  // 在候选池中找评分最高的记录
  findBest(candidates, input, expanded, weight) {
    let bestScore = 0;
    let bestRecord = null;

    for (const record of candidates) {
      const score = this.scoreRecord(record, input, expanded) * weight;
      if (score > bestScore) {
        bestScore = score;
        bestRecord = record;
      }
    }

    // 阈值：避免低分匹配（同义词命中太少）
    if (bestScore < 4) return null;
    return bestRecord;
  },

  // 评分单条记录
  scoreRecord(record, input, expanded) {
    const baihua = record.baihua || '';
    if (!baihua) return 0;

    let score = 0;

    // 1. 同义词命中（最重要）
    // 检查扩展词中每个词是否出现在 baihua 中
    let synonymHits = 0;
    for (const term of expanded.expandedTerms) {
      if (baihua.includes(term)) {
        synonymHits++;
        // 长词加分多（4字+8分，3字+6分，2字+4分，1字+2分）
        score += term.length * 2;
      }
    }

    // 2. 字面字符重合（次要）
    let charHits = 0;
    for (const ch of expanded.literalChars) {
      if (baihua.includes(ch)) {
        charHits++;
      }
    }
    score += charHits * 0.5;

    // 3. 包含关系加分
    if (input.includes(baihua) || baihua.includes(input)) {
      score += 5;
    }

    // 4. 长度相似度（避免长短悬殊导致的偶然命中）
    const lenRatio = Math.min(input.length, baihua.length) /
                     Math.max(input.length, baihua.length);
    score += lenRatio * 2;

    // 5. 同义词命中数加权（命中越多越好）
    if (synonymHits > 0) {
      score += Math.min(synonymHits, 5) * 1.5;
    }

    return score;
  },

  // 旧版相似度匹配（兜底，仅在 synonyms.js 未加载时使用）
  legacySimilarityMatch(input, theme) {
    const candidates = theme
      ? this.data.filter(r => r.theme === theme)
      : this.data;

    if (candidates.length === 0) return null;

    let bestScore = 0;
    let bestRecord = null;

    for (const record of candidates) {
      let score = 0;

      if (input.includes(record.baihua) || record.baihua.includes(input)) {
        score += 10;
      }

      const inputChars = new Set(input);
      const baihuaChars = new Set(record.baihua);
      let overlap = 0;
      for (const ch of inputChars) {
        if (baihuaChars.has(ch)) overlap++;
      }
      score += overlap * 2;

      const maxLen = Math.max(input.length, record.baihua.length);
      score += (overlap / maxLen) * 5;

      if (score > bestScore) {
        bestScore = score;
        bestRecord = record;
      }
    }

    if (bestScore < 3) return null;
    return bestRecord;
  },

  // 第三级：主题内随机
  themeRandom(theme) {
    if (!theme) return null;
    const candidates = this.data.filter(r => r.theme === theme);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  },

  // 兜底：全库随机
  randomMatch() {
    if (this.data.length === 0) return null;
    return this.data[Math.floor(Math.random() * this.data.length)];
  },

  // 获取"今日一题"引导提示（随机选 N 条白话作为 placeholder）
  getPrompts(count = 5) {
    if (this.data.length === 0) this.init();
    const prompts = [];
    const used = new Set();
    while (prompts.length < count && used.size < this.data.length) {
      const idx = Math.floor(Math.random() * this.data.length);
      if (!used.has(idx)) {
        used.add(idx);
        prompts.push(this.data[idx].baihua);
      }
    }
    return prompts;
  },

  // ============================================================
  // 调试用：给定输入，返回 Top N 候选及评分
  // ============================================================
  debug(input, theme, topN = 5) {
    if (this.data.length === 0) this.init();
    const expanded = this.expandInput(input);

    const candidates = theme
      ? this.data.filter(r => r.theme === theme)
      : this.data;

    const scored = candidates.map(r => ({
      baihua: r.baihua,
      poetry: r.poetry,
      score: this.scoreRecord(r, input, expanded)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN);
  }
};
