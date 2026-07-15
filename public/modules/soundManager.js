// ============================================================
// soundManager.js - 天气音效管理器
// 使用真实音效文件（Mixkit 免费商用，无需署名）
// 支持：晴天鸟鸣、暴雨雨声、雷雨雷鸣
// ============================================================

const SoundManager = {
  currentScene: null,
  muted: false,
  currentAudio: null,      // 当前播放的 Audio 对象
  fadeOutTimers: [],       // 正在渐隐的 Audio 列表（独立计时器，不被 fadeIn 打断）
  fadeInTimer: null,       // 当前渐入计时器

  // 音效文件映射
  sceneSounds: {
    sunny:     'audio/birds.mp3',
    rainstorm: 'audio/rain.mp3',
    thunder:   'audio/thunder.mp3',
    // calm / fog / heavyfog 无音效
  },

  // 切换场景音效
  setScene(sceneName) {
    if (this.currentScene === sceneName) return;
    this.currentScene = sceneName;

    // 停止当前音效（渐隐，用独立计时器不干扰新音效）
    this.fadeOutAndStop();

    if (this.muted) return;

    const soundUrl = this.sceneSounds[sceneName];
    if (!soundUrl) {
      this.currentAudio = null;
      return;
    }

    // 创建新 Audio 对象
    const audio = new Audio(soundUrl);
    audio.loop = true;
    audio.volume = 0;
    audio.play().catch(e => {
      console.warn('⚠️ 音效播放失败（需要用户交互后才能播放）:', e.message);
    });

    this.currentAudio = audio;

    // 渐入（用独立的计时器，不影响正在渐隐的旧音效）
    this.fadeIn(audio);
  },

  // 渐入（仅管理 fadeInTimer，不碰 fadeOutTimers）
  fadeIn(audio) {
    if (!audio) return;
    clearInterval(this.fadeInTimer);
    let vol = 0;
    const target = 0.4;
    this.fadeInTimer = setInterval(() => {
      vol += 0.03;
      if (vol >= target) {
        audio.volume = target;
        clearInterval(this.fadeInTimer);
      } else {
        audio.volume = vol;
      }
    }, 50);
  },

  // 渐隐并停止（每个旧 Audio 用独立计时器，不被 fadeIn 打断）
  fadeOutAndStop() {
    if (!this.currentAudio) return;

    const audio = this.currentAudio;
    this.currentAudio = null;

    // 立即降低并开始渐隐
    let vol = audio.volume;
    const timer = setInterval(() => {
      vol -= 0.05;
      if (vol <= 0) {
        audio.pause();
        audio.currentTime = 0;
        clearInterval(timer);
        // 从活跃列表中移除
        const idx = this.fadeOutTimers.indexOf(timer);
        if (idx > -1) this.fadeOutTimers.splice(idx, 1);
      } else {
        audio.volume = vol;
      }
    }, 40);

    // 记录这个渐隐计时器，防止被清除
    this.fadeOutTimers.push(timer);
  },

  // 静音切换
  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.fadeOutAndStop();
    } else {
      // 恢复播放当前场景音效
      const scene = this.currentScene;
      this.currentScene = null; // 强制重新触发
      this.setScene(scene);
    }
    return this.muted;
  },
};
