// ============================================================
// weatherRenderer.js — 天气场景渲染器
// 根据 6 种天气场景切换全屏天气动画
// 场景：sunny / calm / rainstorm / fog / thunder / heavyfog
// ============================================================

const WeatherRenderer = {
  sceneCanvas: null,

  // 场景配置：背景色 + 天气类型 + 描述 + 明暗模式
  // light: true 表示亮色背景（需深色字体），false 表示暗色背景（需白色字体）
  scenes: {
    sunny:     { bg: 'linear-gradient(180deg, #2a6fb8 0%, #5fa3d6 35%, #9fc8e8 70%, #d4e8f5 100%)', name: '晴朗',   icon: '☀', light: true },
    calm:      { bg: 'linear-gradient(180deg, #3d82bf 0%, #62a8db 30%, #95cce8 65%, #c4e2f4 100%)', name: '多云',   icon: '☁', light: true },
    rainstorm: { bg: 'linear-gradient(180deg, #0d1421 0%, #1a2535 100%)',             name: '暴雨',   icon: '🌧', light: false },
    fog:       { bg: 'linear-gradient(180deg, #2a2a2a 0%, #3a3a3a 100%)',             name: '阴雾',   icon: '🌫', light: false },
    thunder:   { bg: 'linear-gradient(180deg, #1a0d0d 0%, #3a1515 100%)',             name: '雷雨',   icon: '⚡', light: false },
    heavyfog:  { bg: 'linear-gradient(180deg, #1f1f2a 0%, #2f2f3a 100%)',             name: '大雾',   icon: '🌫', light: false }
  },

  // 切换天气场景
  setScene(sceneName) {
    const scene = this.scenes[sceneName] || this.scenes.calm;
    const canvas = document.getElementById('weather-canvas');
    const bg = document.getElementById('weather-bg');
    if (!canvas) return;

    // 更新背景
    if (bg) bg.style.background = scene.bg;

    // 根据场景明暗切换字体主题（亮色背景用深色字体，暗色背景用白色字体）
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(scene.light ? 'theme-light' : 'theme-dark');

    // 清空并重新生成天气动画元素
    canvas.innerHTML = '';
    canvas.className = `weather-canvas scene-${sceneName}`;

    // 根据场景生成动画元素
    switch (sceneName) {
      case 'sunny':     this.renderSunny(canvas); break;
      case 'calm':      this.renderCalm(canvas); break;
      case 'rainstorm': this.renderRainstorm(canvas); break;
      case 'fog':       this.renderFog(canvas); break;
      case 'thunder':   this.renderThunder(canvas); break;
      case 'heavyfog':  this.renderHeavyFog(canvas); break;
    }

    // 更新场景标签
    const label = document.getElementById('scene-label');
    if (label) label.textContent = scene.name;
  },

  // 晴朗：蔚蓝天空 + 真实感太阳（白热中心 + 多层柔和光晕 + 镜头光晕 + 薄云）
  renderSunny(canvas) {
    // 飘动的光粒子（阳光散射感）
    let particles = '';
    for (let i = 0; i < 15; i++) {
      particles += `<div class="light-mote" style="
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation-delay:${Math.random() * 8}s;
        animation-duration:${6 + Math.random() * 6}s;
      "></div>`;
    }

    // 几朵薄云点缀（真实晴朗天空常有）
    let clouds = '';
    for (let i = 0; i < 3; i++) {
      clouds += `<div class="thin-cloud thin-cloud-${i}" style="
        top:${8 + i * 18}%;
        animation-delay:${i * 6}s;
        animation-duration:${50 + i * 15}s;
        opacity:${0.5 + Math.random() * 0.3};
      "></div>`;
    }

    canvas.innerHTML = `
      <div class="sunny-sky-haze"></div>
      <div class="sun">
        <div class="sun-halo-outer"></div>
        <div class="sun-halo-mid"></div>
        <div class="sun-halo-inner"></div>
        <div class="sun-disk"></div>
        <div class="sun-core-bright"></div>
      </div>
      <div class="lens-flare">
        <div class="flare-spot flare-1"></div>
        <div class="flare-spot flare-2"></div>
        <div class="flare-spot flare-3"></div>
        <div class="flare-line"></div>
      </div>
      ${clouds}
      <div class="light-particles"></div>
      ${particles}
    `;
  },

  // 多云：碧蓝天空 + 棉花状真实云朵飘移（SVG feTurbulence 湍流滤镜实现不规则边缘）
  renderCalm(canvas) {
    // 3 种云朵形状模板（不同椭圆组合，增加多样性）
    const cloudShapes = [
      // 宽散型
      [{cx:50,cy:78,rx:45,ry:18},{cx:100,cy:60,rx:40,ry:26},{cx:150,cy:50,rx:42,ry:28},{cx:200,cy:58,rx:38,ry:25},{cx:245,cy:72,rx:35,ry:18},{cx:75,cy:65,rx:30,ry:20},{cx:125,cy:48,rx:32,ry:22},{cx:175,cy:52,rx:28,ry:20}],
      // 紧凑型
      [{cx:60,cy:75,rx:40,ry:20},{cx:110,cy:55,rx:38,ry:28},{cx:160,cy:48,rx:40,ry:30},{cx:210,cy:60,rx:35,ry:24},{cx:85,cy:62,rx:28,ry:22},{cx:140,cy:42,rx:30,ry:24},{cx:190,cy:52,rx:25,ry:18}],
      // 长条型
      [{cx:40,cy:78,rx:38,ry:16},{cx:90,cy:62,rx:35,ry:24},{cx:140,cy:52,rx:38,ry:26},{cx:190,cy:55,rx:35,ry:24},{cx:240,cy:68,rx:38,ry:18},{cx:265,cy:75,rx:28,ry:14},{cx:115,cy:48,rx:30,ry:20},{cx:170,cy:45,rx:28,ry:22}]
    ];

    const cloudLayers = [
      { count: 2, scaleMin: 1.3, scaleMax: 1.6, topBase: 5,  step: 14, opacity: 0.82, duration: 140, cls: 'cloud-far' },
      { count: 3, scaleMin: 0.9, scaleMax: 1.2, topBase: 20, step: 16, opacity: 0.92, duration: 110, cls: 'cloud-mid' },
      { count: 2, scaleMin: 0.6, scaleMax: 0.9, topBase: 50, step: 18, opacity: 1.0,  duration: 80,  cls: 'cloud-near' }
    ];

    // 共享渐变定义（隐藏 SVG）
    let defs = '<svg style="position:absolute;width:0;height:0;"><defs>' +
      '<radialGradient id="cloud-grad" cx="50%" cy="28%" r="62%">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>' +
      '<stop offset="50%" stop-color="#ffffff" stop-opacity="0.95"/>' +
      '<stop offset="82%" stop-color="#f0f5fa" stop-opacity="0.65"/>' +
      '<stop offset="100%" stop-color="#e8eff5" stop-opacity="0.15"/>' +
      '</radialGradient>';

    let clouds = '';
    let idx = 0;

    cloudLayers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const scale = (layer.scaleMin + Math.random() * (layer.scaleMax - layer.scaleMin)).toFixed(2);
        const top = layer.topBase + i * layer.step + Math.random() * 4;
        const delay = -(Math.random() * layer.duration);
        const duration = layer.duration + Math.random() * 30;
        const seed = Math.floor(Math.random() * 9999);
        const shape = cloudShapes[idx % cloudShapes.length];
        const freqX = (0.015 + Math.random() * 0.01).toFixed(4);
        const freqY = (0.025 + Math.random() * 0.015).toFixed(4);
        const dispScale = 26 + Math.floor(Math.random() * 12);

        // 为每朵云生成唯一的湍流滤镜（不同 seed 产生不同噪声图案）
        defs += `<filter id="cturb-${idx}" x="-20%" y="-20%" width="140%" height="140%">` +
          `<feTurbulence type="fractalNoise" baseFrequency="${freqX} ${freqY}" numOctaves="2" seed="${seed}" result="noise"/>` +
          `<feDisplacementMap in="SourceGraphic" in2="noise" scale="${dispScale}" xChannelSelector="R" yChannelSelector="G"/>` +
          `<feGaussianBlur stdDeviation="0.6"/>` +
          `</filter>`;

        // 生成云朵的椭圆组合
        const ellipses = shape.map(e =>
          `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" fill="url(#cloud-grad)"/>`
        ).join('');

        clouds += `<svg class="cloud-svg ${layer.cls}" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet" style="
          --cloud-scale:${scale};
          top:${top}%;
          animation-delay:${delay}s;
          animation-duration:${duration}s;
          opacity:${layer.opacity};
        "><g filter="url(#cturb-${idx})">${ellipses}</g></svg>`;

        idx++;
      }
    });

    defs += '</defs></svg>';
    canvas.innerHTML = defs + clouds;
  },

  // 暴雨：雨滴 + 闪电 + 水汽
  renderRainstorm(canvas) {
    let rain = '<div class="rain-container">';
    for (let i = 0; i < 120; i++) {
      rain += `<div class="raindrop" style="
        left:${Math.random() * 100}%;
        animation-delay:${Math.random() * 2}s;
        animation-duration:${0.4 + Math.random() * 0.6}s;
        height:${15 + Math.random() * 25}px;
      "></div>`;
    }
    rain += '</div>';
    // 多条闪电，错开时间
    rain += '<div class="lightning lightning-1"></div>';
    rain += '<div class="lightning lightning-2"></div>';
    canvas.innerHTML = rain;
  },

  // 阴雾：灰雾弥漫 + 慢飘
  renderFog(canvas) {
    let fog = '<div class="fog-container">';
    for (let i = 0; i < 8; i++) {
      fog += `<div class="fog-layer fog-layer-${i % 3}" style="
        animation-delay:${i * 2.5}s;
        animation-duration:${18 + i * 4}s;
        opacity:${0.2 + i * 0.08};
      "></div>`;
    }
    fog += '</div>';
    canvas.innerHTML = fog;
  },

  // 雷雨：暗红云层 + 频繁分叉闪电 + 暴雨 + 全屏闪光 + 画面震动
  renderThunder(canvas) {
    // 1. 暴雨（180 个雨滴，更密集）
    let rain = '<div class="rain-container thunder-rain">';
    for (let i = 0; i < 180; i++) {
      rain += `<div class="raindrop thunder-drop" style="
        left:${Math.random() * 100}%;
        animation-delay:${Math.random() * 1.5}s;
        animation-duration:${0.3 + Math.random() * 0.4}s;
        height:${15 + Math.random() * 20}px;
      "></div>`;
    }
    rain += '</div>';

    // 2. 暗云层（雷雨云背景）
    let darkClouds = '<div class="thunder-clouds">';
    for (let i = 0; i < 5; i++) {
      darkClouds += `<div class="thunder-cloud cloud-${i}" style="
        top:${-5 + i * 4}%;
        left:${i * 22 - 10}%;
        animation-duration:${40 + i * 10}s;
        animation-delay:-${i * 6}s;
        opacity:${0.5 + i * 0.08};
      "></div>`;
    }
    darkClouds += '</div>';

    // 3. SVG 分叉闪电生成器（6 条，不同形状/位置/延迟/周期）
    const boltPaths = [
      // 主干 + 多分叉，锯齿状从顶到底
      { d: 'M50,0 L42,55 L58,62 L36,120 L54,128 L28,200 L46,208 L22,300 L40,308 L15,400', branches: ['M42,55 L20,90 L32,98', 'M36,120 L62,150 L50,158', 'M28,200 L55,232 L42,240'] },
      { d: 'M50,0 L56,50 L44,58 L60,110 L40,118 L58,180 L36,190 L52,260 L30,270 L48,400', branches: ['M56,50 L78,82 L66,90', 'M40,118 L18,150 L28,158', 'M36,190 L62,225 L48,232'] },
      { d: 'M50,0 L44,60 L56,68 L38,130 L52,138 L30,210 L48,218 L24,310 L42,318 L20,400', branches: ['M44,60 L24,95 L34,102', 'M38,130 L60,160 L48,168', 'M30,210 L52,245 L40,252'] },
      { d: 'M50,0 L52,45 L40,52 L58,100 L36,108 L54,165 L32,175 L50,230 L28,240 L46,400', branches: ['M40,52 L18,82 L28,90', 'M36,108 L60,140 L48,148', 'M32,175 L56,210 L44,218'] },
      { d: 'M50,0 L46,55 L54,62 L34,115 L48,122 L26,190 L44,198 L22,280 L38,288 L18,400', branches: ['M46,55 L22,88 L34,95', 'M34,115 L58,148 L46,155', 'M26,190 L52,225 L38,232'] },
      { d: 'M50,0 L54,50 L42,57 L56,108 L36,116 L52,170 L30,180 L46,250 L24,260 L40,400', branches: ['M42,57 L20,87 L30,95', 'M36,116 L60,148 L48,155', 'M30,180 L54,215 L42,222'] }
    ];
    // 每条闪电的水平位置、动画周期、延迟
    const boltConfigs = [
      { left: 12, duration: 4.2, delay: 0.0, scale: 0.85 },
      { left: 28, duration: 3.5, delay: 0.8, scale: 1.0 },
      { left: 44, duration: 4.8, delay: 1.6, scale: 0.9 },
      { left: 60, duration: 3.2, delay: 0.4, scale: 1.1 },
      { left: 76, duration: 4.5, delay: 2.2, scale: 0.95 },
      { left: 88, duration: 3.8, delay: 1.2, scale: 0.85 }
    ];

    let lightnings = '<div class="lightning-group">';
    boltPaths.forEach((bolt, i) => {
      const cfg = boltConfigs[i];
      const branchSvg = bolt.branches.map(b => `<path d="${b}" stroke="rgba(220,235,255,0.85)" stroke-width="1.2" fill="none" stroke-linecap="round"/>`).join('');
      lightnings += `<svg class="lightning-bolt bolt-${i}" style="left:${cfg.left}%; animation-duration:${cfg.duration}s; animation-delay:${cfg.delay}s; transform: scale(${cfg.scale});" viewBox="0 0 100 400" preserveAspectRatio="none">
        <defs>
          <filter id="glow-${i}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path d="${bolt.d}" stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linecap="round" filter="url(#glow-${i})"/>
        ${branchSvg}
      </svg>`;
    });
    lightnings += '</div>';

    // 4. 全屏闪光层（与最频繁的闪电同步）
    const flash = '<div class="thunder-flash"></div><div class="thunder-bg-flash"></div>';

    canvas.innerHTML = rain + darkClouds + lightnings + flash;
  },

  // 大雾：浓雾缭绕 — 多层飘动雾团 + 旋转雾气漩涡 + 上下漂浮
  renderHeavyFog(canvas) {
    let fog = '<div class="heavy-fog-container">';

    // 1. 底层：8 层水平飘动的大雾带（不同速度、高度、不透明度）
    for (let i = 0; i < 8; i++) {
      const direction = i % 2 === 0 ? 'normal' : 'reverse';
      fog += `<div class="fog-band fog-band-${i % 4}" style="
        --drift-dir:${direction === 'reverse' ? -1 : 1};
        top:${i * 12}%;
        animation-delay:-${i * 3.5}s;
        animation-duration:${30 + i * 4}s;
        animation-direction:${direction};
        opacity:${0.25 + (i % 3) * 0.1};
      "></div>`;
    }

    // 2. 中层：12 团飘移的蓬松雾团（不同大小、位置、速度）
    for (let i = 0; i < 12; i++) {
      const size = 200 + Math.random() * 300;
      const top = Math.random() * 90;
      const left = Math.random() * 100;
      const duration = 25 + Math.random() * 20;
      const delay = -Math.random() * duration;
      const direction = i % 2 === 0 ? 'normal' : 'reverse';
      fog += `<div class="fog-puff" style="
        width:${size}px;
        height:${size * 0.6}px;
        top:${top}%;
        left:${left}%;
        animation-delay:${delay}s;
        animation-duration:${duration}s;
        animation-direction:${direction};
        opacity:${0.3 + Math.random() * 0.3};
      "></div>`;
    }

    // 3. 上层：4 个缓慢旋转的雾气漩涡（缭绕感核心）
    const swirlPositions = [
      { x: 20, y: 25, size: 380, dur: 45 },
      { x: 70, y: 35, size: 320, dur: 55 },
      { x: 35, y: 65, size: 420, dur: 50 },
      { x: 80, y: 70, size: 300, dur: 60 }
    ];
    swirlPositions.forEach((p, i) => {
      fog += `<div class="fog-swirl swirl-${i}" style="
        left:${p.x}%;
        top:${p.y}%;
        width:${p.size}px;
        height:${p.size}px;
        animation-duration:${p.dur}s, ${p.dur * 0.7}s;
        animation-delay:-${i * 8}s, -${i * 5}s;
      "></div>`;
    });

    // 4. 漂浮的微小雾粒（增加层次感）
    for (let i = 0; i < 20; i++) {
      fog += `<div class="fog-mote" style="
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation-delay:-${Math.random() * 20}s;
        animation-duration:${15 + Math.random() * 20}s;
      "></div>`;
    }

    fog += '</div>';
    canvas.innerHTML = fog;
  }
};
