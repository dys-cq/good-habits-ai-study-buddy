// ============================================================
// emotionAnalyzer.js — 白话 → 主题 + 天气场景推断
// 1. analyze：基于主题关键词词典推断属于 13 个主题中的哪一个
// 2. analyzeScene：基于情绪强度规则（emotionSceneRules）推断更精确的天气场景
// ============================================================

const EmotionAnalyzer = {
  // 分析用户输入的白话，返回推断的主题（用于诗句匹配）
  analyze(baihua) {
    if (!baihua || !baihua.trim()) return null;

    const text = baihua.trim();
    const keywords = window.EMOTION_DATA.themeKeywords;

    // 统计每个主题的命中关键词
    const scores = {};
    for (const [theme, words] of Object.entries(keywords)) {
      let score = 0;
      for (const word of words) {
        if (text.includes(word)) {
          // 长关键词权重更高
          score += word.length;
        }
      }
      if (score > 0) {
        scores[theme] = score;
      }
    }

    // 找到分数最高的主题
    let bestTheme = null;
    let bestScore = 0;
    for (const [theme, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestTheme = theme;
      }
    }

    return bestTheme;
  },

  // 基于情绪强度规则推断天气场景（比 themeToScene 更精确）
  // 优先级：emotionSceneRules（顺序敏感，先命中先返回）> themeToScene > 默认 calm
  analyzeScene(baihua, theme) {
    if (!baihua || !baihua.trim()) {
      return this.themeToScene(theme);
    }

    const text = baihua.trim();
    const rules = window.EMOTION_DATA.emotionSceneRules || [];

    // 按顺序检查每条规则，命中即返回（前面的规则更具体/强烈）
    for (const rule of rules) {
      for (const keyword of rule.keywords) {
        if (text.includes(keyword)) {
          return rule.scene;
        }
      }
    }

    // 未命中任何情绪规则，降级到主题级映射
    return this.themeToScene(theme);
  },

  // 获取主题对应的天气场景（主题级兜底）
  themeToScene(theme) {
    if (!theme) return 'calm';
    return window.EMOTION_DATA.themeToScene[theme] || 'calm';
  },

  // 获取主题的显示名
  themeDisplayName(theme) {
    if (!theme) return '日常';
    return window.EMOTION_DATA.themeNames[theme] || '日常';
  }
};
