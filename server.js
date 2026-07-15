require('dotenv').config({ path: '.env.server' });
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
// 禁用浏览器缓存，防止服务器重启后页面不更新
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false
}));

// API 路由
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // 调用字节豆包 API（流式）
    const response = await fetch(`${process.env.ARK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'minimax-m3',
        messages: messages,
        max_tokens: 2048,
        temperature: 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', response.status, errorData);
      res.write(`data: ${JSON.stringify({ error: 'AI service error', details: errorData })}\n\n`);
      res.end();
      return;
    }

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
          } else {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Server Error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// 心理健康分析路由
app.post('/api/mood-analysis', async (req, res) => {
  try {
    const { mood, note, userId } = req.body;

    // 调用 AI 进行情绪分析
    const messages = [
      {
        role: 'system',
        content: `你是一个温暖的心理陪伴AI助手。用户刚刚记录了心情：
- 心情状态: ${mood}
- 用户备注: ${note || '无'}

请给出温暖、有同理心的回应，帮助用户梳理情绪，给予支持和鼓励。
回复要求：
1. 简短温暖（50-100字）
2. 有同理心
3. 给予积极引导
4. 如果检测到负面情绪严重，给出关怀建议`
      },
      {
        role: 'user',
        content: `我的心情是 ${mood}，${note || '没有特别想说的'}`
      }
    ];

    const response = await fetch(`${process.env.ARK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'minimax-m3',
        messages: messages,
        max_tokens: 500,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // 简单情感分析
    const sentimentScore = analyzeSentiment(mood, note);

    res.json({
      success: true,
      reply: reply,
      sentiment: sentimentScore,
      suggestions: getSuggestions(sentimentScore)
    });

  } catch (error) {
    console.error('Mood Analysis Error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

// AI 学习辅导路由
app.post('/api/study辅导', async (req, res) => {
  try {
    const { subject, question, context } = req.body;

    const messages = [
      {
        role: 'system',
        content: `你是一个专为13-18岁中学生服务的AI学习搭子"小星"。
你的特点是：
1. 不直接给答案，而是引导思考
2. 用青少年能理解的语言
3. 幽默有趣，拉近距离
4. 善于拆解复杂问题
5. 鼓励为主，建立自信

请用对话的方式，帮助学生理解知识点，学会解题思路。`
      },
      {
        role: 'user',
        content: `科目: ${subject}\n问题: ${question}\n上下文: ${context || '无'}`
      }
    ];

    const response = await fetch(`${process.env.ARK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'minimax-m3',
        messages: messages,
        max_tokens: 1024,
        temperature: 0.8
      })
    });

    const data = await response.json();

    res.json({
      success: true,
      reply: data.choices[0].message.content,
      hints: generateHints(question, subject)
    });

  } catch (error) {
    console.error('Study辅导 Error:', error);
    res.status(500).json({
      error: 'Study辅导 failed',
      message: error.message
    });
  }
});

// AI 学习计划生成
app.post('/api/generate-study-plan', async (req, res) => {
  try {
    const { goals, availableTime, subjects, mood, moodDescription, difficultyWeights } = req.body;

    // 根据心情调整提示
    let moodAdjustment = '';
    if (mood && difficultyWeights) {
      const moodInt = parseInt(mood) || 3;
      if (moodInt <= 2) {
        moodAdjustment = `\n\n【重要】用户当前心情较差（${moodDescription}），请调整计划：
- 减少高难度任务比例（不超过${Math.round(difficultyWeights.hard * 100)}%）
- 增加轻松有趣的学习内容
- 可以安排一些娱乐休息时间
- 语气要温暖鼓励，不要给压力`;
      } else if (moodInt >= 4) {
        moodAdjustment = `\n\n【重要】用户当前心情很好（${moodDescription}），请调整计划：
- 可以安排一些有挑战性的任务（高难度任务可达${Math.round(difficultyWeights.hard * 100)}%）
- 适当增加学习时长
- 语气可以积极鼓励，激励用户趁热打铁`;
      } else {
        moodAdjustment = `\n\n【重要】用户心情一般（${moodDescription}），请安排适中难度的学习任务。`;
      }
    }

    const messages = [
      {
        role: 'system',
        content: `你是一个专业的学习规划师。请根据用户的情况，生成一份个性化的学习计划。
要求：
1. 结构清晰，分时间段
2. 劳逸结合，包含休息和运动
3. 重点突出，提分效率高
4. 可执行性强
5. 语气鼓励积极
6. 每天学习内容要具体，便于执行${moodAdjustment}`
      },
      {
        role: 'user',
        content: `学习目标: ${goals}\n每天可用时间: ${availableTime}小时\n科目优先级: ${subjects.join(', ')}\n\n请生成详细的学习计划，包括：
- 具体的每日任务（如：数学函数复习30分钟，英语单词背诵20个）
- 任务难度标注
- 番茄钟任务和习惯任务的区分`
      }
    ];

    const response = await fetch(`${process.env.ARK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'minimax-m3',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    const data = await response.json();

    res.json({
      success: true,
      plan: data.choices[0].message.content
    });

  } catch (error) {
    console.error('Plan Generation Error:', error);
    res.status(500).json({
      error: 'Plan generation failed',
      message: error.message
    });
  }
});

// 辅助函数
function analyzeSentiment(mood, note) {
  // 简单的情感评分
  const moodScores = {
    'great': 5,
    'good': 4,
    'okay': 3,
    'bad': 2,
    'terrible': 1
  };

  let score = moodScores[mood] || 3;

  // 分析备注中的情感词
  if (note) {
    const positiveWords = ['开心', '高兴', '棒', '成功', '进步', '喜欢'];
    const negativeWords = ['难过', '烦恼', '压力', '累', '怕', '担心'];

    positiveWords.forEach(word => {
      if (note.includes(word)) score += 0.5;
    });

    negativeWords.forEach(word => {
      if (note.includes(word)) score -= 0.5;
    });
  }

  return Math.max(1, Math.min(5, score));
}

function getSuggestions(score) {
  if (score >= 4) {
    return ['保持好状态，今天可以挑战一些难题', '适合做需要创造力的任务'];
  } else if (score >= 3) {
    return ['做些轻松的任务，循序渐进', '记得适时休息'];
  } else {
    return ['先休息一下，不要勉强自己', '可以试试深呼吸放松', '找信任的人聊聊'];
  }
}

function generateHints(question, subject) {
  // 根据科目和问题类型生成提示
  const hints = {
    '数学': [
      '先把已知条件列出来',
      '看看问题在问什么',
      '试着画出图形或示意图'
    ],
    '英语': [
      '先理解文章主旨',
      '注意关键词和上下文',
      '语法分析主谓宾'
    ],
    '物理': [
      '分析受力情况',
      '画运动过程图',
      '列出已知量和未知量'
    ]
  };

  return hints[subject] || ['仔细读题', '梳理思路', '分步解决'];
}

// 心情聊天路由 - 以心情为切入点，进行情绪引导和心理疏导
app.post('/api/mood-chat', async (req, res) => {
  console.log('📝 收到心情聊天请求:', req.body.moodLevel, req.body.moodText);
  try {
    const { moodLevel, moodEmoji, moodText, note, messages, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      console.log('❌ 消息格式无效');
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // 根据心情等级调整系统提示词
    const isBadMood = moodLevel <= 2;
    const isMediumMood = moodLevel === 3;

    let moodContext = '';
    if (isBadMood) {
      moodContext = `用户当前心情状态较差（${moodText}），需要重点进行心理疏导。
你的核心任务：
1. 先倾听和共情，不要急于给建议
2. 用温暖、不评判的语气让用户感到被理解
3. 帮助用户识别和表达情绪，而不是压抑情绪
4. 温和地引导用户看到希望，但不盲目乐观
5. 如果用户提到严重的心理困扰（如自伤倾向），要温和地建议寻求专业帮助
6. 对话节奏要慢，一次只聊一个点，给用户思考空间`;
    } else if (isMediumMood) {
      moodContext = `用户心情一般（${moodText}），需要适度引导。
你的核心任务：
1. 询问是否有具体的事情影响了心情
2. 帮助用户找到小小的动力点
3. 不要过度解读，保持轻松的对话氛围`;
    } else {
      moodContext = `用户心情不错（${moodText}），要顺势强化积极情绪。
你的核心任务：
1. 分享用户的快乐，让积极情绪被看见和肯定
2. 探讨如何保持好状态
3. 可以聊聊今天有什么开心的事`;
    }

    // 构建系统提示 - 专为15-18岁中学生设计的心理陪伴
    const systemPrompt = `你是小星，一个温暖、有同理心的AI心理陪伴伙伴，专门服务15-18岁的中学生。

【当前用户心情】
心情等级：${moodLevel}/5（1最差，5最好）
心情表情：${moodEmoji}
心情描述：${moodText}
用户备注：${note || '无'}

${moodContext}

【你的沟通风格】
1. 像一个懂你的学长/学姐，不是高高在上的说教者
2. 用中学生能听懂的语言，避免过于专业的心理学术语
3. 真诚、自然，偶尔可以轻松幽默（但心情差时慎用）
4. 善用"我听到你说…""这种感觉确实…"等共情句式
5. 每次回复控制在80-150字，不要长篇大论
6. 用问句结尾，引导用户继续表达

【心理引导原则】
1. 先接纳情绪，再探讨原因，最后才是建议
2. 不说"别想太多""这没什么大不了的"这类否定感受的话
3. 帮助用户区分"事实"和"感受"
4. 引导用户发现自身资源（过去怎么度过类似时刻的）
5. 对学业压力：帮助拆解，而不是说"努力就好"
6. 对人际困扰：引导换位思考，但站在用户这边
7. 对自我否定：用具体事实帮用户看到自己的价值

请以用户当前心情为切入点，自然地开始对话。`;

    // 在消息前插入系统提示
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // 调用字节豆包 API（流式）
    const response = await fetch(`${process.env.ARK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'minimax-m3',
        messages: fullMessages,
        max_tokens: 500,
        temperature: 0.85,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mood Chat API Error:', response.status, errorData);
      res.write(`data: ${JSON.stringify({ error: 'AI service error', details: errorData })}\n\n`);
      res.end();
      return;
    }

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
          } else {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Mood Chat Error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// 知识提取路由 - 从AI对话中提取结构化知识卡片
app.post('/api/extract-knowledge', async (req, res) => {
  try {
    const { content, subject, existingTitles } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '内容为空' });
    }

    const systemPrompt = `你是一个知识提取助手。请从以下AI对话内容中提取结构化的知识卡片。

要求：
1. 提取核心知识点，不要照搬原文
2. 用简洁的语言概括，适合中学生复习用
3. 如果内容是纯情绪对话（非学科知识），提取"情绪应对策略"作为知识卡片
4. 返回严格的 JSON 格式，不要有多余文字

返回格式：
{
  "title": "知识点的标题（10-20字）",
  "summary": "一句话概括这个知识点（30字内）",
  "keyPoints": ["要点1", "要点2", "要点3"],
  "commonMistakes": ["常见错误1", "常见错误2"],
  "relatedConcepts": ["相关概念1", "相关概念2"]
}

如果内容确实没有可提取的知识，返回：
{"title": "", "summary": "", "keyPoints": [], "commonMistakes": [], "relatedConcepts": []}`;

    const userMessage = `科目：${subject || '未指定'}
已有知识卡片标题（可用于发现关联）：${(existingTitles || []).join('、') || '无'}

对话内容：
${content.slice(0, 2000)}`;

    const response = await fetch(`${process.env.ARK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'minimax-m3',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 600,
        temperature: 0.3,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Extract Knowledge API Error:', response.status, errorData);
      return res.status(500).json({ error: 'AI service error' });
    }

    const result = await response.json();
    let aiContent = result.choices?.[0]?.message?.content || '';

    // 清理可能的 markdown 代码块包裹
    aiContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let card;
    try {
      card = JSON.parse(aiContent);
    } catch (e) {
      // 尝试提取 JSON 部分
      const match = aiContent.match(/\{[\s\S]*\}/);
      if (match) {
        card = JSON.parse(match[0]);
      } else {
        // 降级：返回原始内容作为摘要
        card = {
          title: content.slice(0, 15) + '...',
          summary: content.slice(0, 50),
          keyPoints: [],
          commonMistakes: [],
          relatedConcepts: []
        };
      }
    }

    res.json({ success: true, card });

  } catch (error) {
    console.error('Extract Knowledge Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// SPA 路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 星际学习联盟服务运行在 http://localhost:${PORT}`);
  console.log(`📚 AI 学习搭子已就绪`);
  console.log(`💪 青少年身心健康支持已开启`);
});
