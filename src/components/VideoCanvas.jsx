import React, { useRef, useEffect } from 'react';
import { 
  renderStickmanCartoon, 
  renderDemoHowTo, 
  renderExplainer, 
  renderBrandPromo, 
  renderLiveVsAnim, 
  renderUGC, 
  renderScreencast 
} from './RenderEngines';
import { drawTopicIllustration } from './TopicIllustrator';
import { getIconComponent } from './LucideIconsRegistry';

export const ASPECT_RATIOS = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok & Shorts',
    sub: '9:16 Vertical',
    width: 1080,
    height: 1920,
    cssAspect: '9 / 16'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube & Desktop',
    sub: '16:9 Landscape',
    width: 1920,
    height: 1080,
    cssAspect: '16 / 9'
  },
  instagram: {
    id: 'instagram',
    name: 'Feed Square',
    sub: '1:1 Square',
    width: 1080,
    height: 1080,
    cssAspect: '1 / 1'
  },
  portrait: {
    id: 'portrait',
    name: 'Instagram Portrait',
    sub: '4:5 Feed',
    width: 1080,
    height: 1350,
    cssAspect: '4 / 5'
  }
};

// Automatic entity detector
function detectEntity(text = '') {
  const t = text.toLowerCase();
  if (t.includes('dog') || t.includes('puppy') || t.includes('canine') || t.includes('bark') || t.includes('pet')) return 'dog';
  if (t.includes('cat') || t.includes('kitten') || t.includes('meow') || t.includes('feline')) return 'cat';
  if (t.includes('car') || t.includes('tesla') || t.includes('drive') || t.includes('racing') || t.includes('auto')) return 'car';
  if (t.includes('bitcoin') || t.includes('crypto') || t.includes('money') || t.includes('dollar') || t.includes('finance') || t.includes('wealth') || t.includes('cash')) return 'coins';
  if (t.includes('heart') || t.includes('love') || t.includes('health') || t.includes('cardio') || t.includes('fit') || t.includes('gym')) return 'heart';
  if (t.includes('brain') || t.includes('mind') || t.includes('focus') || t.includes('habit') || t.includes('study') || t.includes('think') || t.includes('memory')) return 'brain';
  if (t.includes('code') || t.includes('developer') || t.includes('software') || t.includes('programming') || t.includes('app') || t.includes('dev')) return 'code';
  if (t.includes('ai') || t.includes('fast') || t.includes('speed') || t.includes('quick') || t.includes('electric') || t.includes('power')) return 'zap';
  if (t.includes('rocket') || t.includes('space') || t.includes('launch') || t.includes('grow') || t.includes('scale')) return 'rocket';
  if (t.includes('fire') || t.includes('flame') || t.includes('hot') || t.includes('burn') || t.includes('streak')) return 'flame';
  if (t.includes('coffee') || t.includes('morning') || t.includes('caffeine')) return 'coffee';
  if (t.includes('apple') || t.includes('food') || t.includes('nutrition') || t.includes('eat')) return 'apple';
  if (t.includes('laptop') || t.includes('computer') || t.includes('work') || t.includes('desk')) return 'laptop';
  if (t.includes('workout') || t.includes('gym') || t.includes('dumbbell') || t.includes('weights')) return 'dumbbell';
  return null;
}

export const VideoCanvas = React.forwardRef(function VideoCanvas(
  {
    currentScene,
    progress,
    format = 'tiktok',
    totalProgress = 0,
    isPlaying = false,
    activeAesthetic = 'minimal',
    videoType = 'explainer',
    spokenWordIndex = 0
  },
  ref
) {
  const canvasRef = useRef(null);

  React.useImperativeHandle(ref, () => canvasRef.current);

  const selectedFormat = ASPECT_RATIOS[format] || ASPECT_RATIOS.tiktok;
  const { width, height } = selectedFormat;

  // Detect matching icon component
  const fullContext = `${currentScene?.hookText || ''} ${currentScene?.voiceover || ''} ${currentScene?.topic || ''}`;
  const detectedEntityKey = detectEntity(fullContext);
  const IconComponent = detectedEntityKey ? getIconComponent(detectedEntityKey) : null;
  const accent = currentScene?.visualTheme?.accentColor || '#38bdf8';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let t = 0;

    const render = () => {
      t += 0.025;

      const fallbackAccents = {
        minimal: '#38bdf8',
        dynamic: '#f43f5e',
        cyberpunk: '#10b981'
      };
      const curAccent = currentScene?.visualTheme?.accentColor || fallbackAccents[activeAesthetic] || '#38bdf8';

      // 1. RENDER FORMAT-SPECIFIC VISUAL BASE WORLD
      const renderParams = { width, height, time: t, progress, scene: currentScene, accent: curAccent };

      switch (videoType) {
        case 'stickman_cartoon':
          renderStickmanCartoon(ctx, renderParams);
          break;
        case 'demo_howto':
          renderDemoHowTo(ctx, renderParams);
          break;
        case 'brand_promo':
          renderBrandPromo(ctx, renderParams);
          break;
        case 'live_vs_anim':
          renderLiveVsAnim(ctx, renderParams);
          break;
        case 'ugc':
          renderUGC(ctx, renderParams);
          break;
        case 'screencast':
          renderScreencast(ctx, renderParams);
          break;
        case 'explainer':
        default:
          renderExplainer(ctx, renderParams);
          break;
      }

      // 2. PROCEDURAL HIGH-RESOLUTION ENTITY ILLUSTRATION (Dogs, Cats, Cars, Money, Heart)
      drawTopicIllustration(ctx, {
        topicText: fullContext,
        x: width * 0.50,
        y: height * 0.38,
        size: Math.min(width, height) * 0.42,
        time: t,
        accent: curAccent,
        progress
      });

      // 3. KINETIC HOOK HEADLINE
      const hookText = currentScene?.hookText || 'AUTOMATE YOUR VIDEOS';
      ctx.save();
      const titleFontSize = Math.max(34, Math.floor(width * 0.062));
      ctx.font = `900 ${titleFontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Montserrat", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const punchScale = 1 + Math.max(0, (1 - progress * 4)) * 0.12;
      const titleCenterY = height * 0.70;

      ctx.translate(width / 2, titleCenterY);
      ctx.scale(punchScale, punchScale);

      ctx.fillStyle = '#000000';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 6;

      const maxWidth = width * 0.86;
      const words = hookText.split(' ');
      let currentLine = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const test = currentLine + words[n] + ' ';
        if (ctx.measureText(test).width > maxWidth && n > 0) {
          lines.push(currentLine.trim());
          currentLine = words[n] + ' ';
        } else {
          currentLine = test;
        }
      }
      lines.push(currentLine.trim());

      const lHeight = titleFontSize * 1.25;
      lines.forEach((l, i) => {
        const yOff = (i - (lines.length - 1) / 2) * lHeight;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.strokeText(l, 0, yOff);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(l, 0, yOff);
      });
      ctx.restore();

      // 4. PRECISE KARAOKE CAPTIONS
      const voiceoverText = currentScene?.voiceover || '';
      if (voiceoverText) {
        ctx.save();
        const capFontSize = Math.max(28, Math.floor(width * 0.048));
        ctx.font = `900 ${capFontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const capY = height * 0.84;
        const allWords = voiceoverText.trim().split(/\s+/);
        
        const chunkSize = 4;
        const currentChunkIdx = Math.floor(spokenWordIndex / chunkSize);
        const chunkStart = currentChunkIdx * chunkSize;
        const currentChunkWords = allWords.slice(chunkStart, chunkStart + chunkSize);
        const activeWordOffsetInChunk = spokenWordIndex - chunkStart;

        const widths = currentChunkWords.map((w) => ctx.measureText(w + ' ').width);
        const totalW = widths.reduce((a, b) => a + b, 0);
        let currX = (width - totalW) / 2;

        currentChunkWords.forEach((word, idx) => {
          const w = widths[idx];
          const isSpokenNow = idx === activeWordOffsetInChunk;

          if (isSpokenNow) {
            ctx.beginPath();
            ctx.roundRect(
              currX - 8,
              capY - capFontSize * 0.8,
              w + 16,
              capFontSize * 1.6,
              12
            );
            ctx.fillStyle = '#facc15';
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 24;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#000000';
            ctx.fillText(word, currX + w / 2 - 4, capY);
          } else {
            ctx.beginPath();
            ctx.roundRect(
              currX - 4,
              capY - capFontSize * 0.7,
              w + 8,
              capFontSize * 1.4,
              8
            );
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fill();

            ctx.fillStyle = idx < activeWordOffsetInChunk ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
            ctx.fillText(word, currX + w / 2 - 4, capY);
          }

          currX += w;
        });
        ctx.restore();
      }

      // 5. TOP PROGRESS SCRUBBER
      ctx.save();
      const barH = 6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, 0, width, barH);

      const activeBarW = width * Math.max(0, Math.min(1, totalProgress));
      ctx.fillStyle = curAccent;
      ctx.shadowColor = curAccent;
      ctx.shadowBlur = 12;
      ctx.fillRect(0, 0, activeBarW, barH);
      ctx.restore();

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [currentScene, progress, totalProgress, isPlaying, width, height, activeAesthetic, videoType, spokenWordIndex, fullContext]);

  return (
    <div
      className="relative flex items-center justify-center bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] max-h-[72vh] max-w-full ring-1 ring-white/5"
      style={{ aspectRatio: selectedFormat.cssAspect }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain"
      />

      {/* Verified Open-Source Vector SVG Badge in corner (from Lucide React repository) */}
      {IconComponent && (
        <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 shadow-xl pointer-events-none animate-pulse">
          <IconComponent className="w-4 h-4" style={{ color: accent }} />
          <span className="text-[11px] font-bold text-white capitalize">
            {detectedEntityKey}
          </span>
        </div>
      )}
    </div>
  );
});
