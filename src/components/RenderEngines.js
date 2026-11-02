// Robust Responsive Layout Engine that adapts any video style cleanly to ANY aspect ratio
// (TikTok 9:16 Vertical, YouTube 16:9 Landscape, Instagram 1:1 Square, Portrait 4:5)

function getLayoutMetrics(width, height) {
  const isLandscape = width > height; // YouTube 16:9
  const isSquare = Math.abs(width - height) < 50; // Instagram 1:1
  const isVertical = height > width && !isSquare; // TikTok 9:16 or 4:5

  return {
    isLandscape,
    isSquare,
    isVertical,
    topY: height * 0.08,
    // In landscape, we place visual hero on left and typography/captions on right; in vertical, stack top-to-bottom
    contentCenterY: isLandscape ? height * 0.48 : height * 0.38,
    titleY: isLandscape ? height * 0.72 : height * 0.68,
    captionsY: isLandscape ? height * 0.86 : height * 0.84,
    scaleFactor: Math.min(width, height) / 1080
  };
}

// 1. STICKMAN / CARTOON: Fully adaptive to Landscape, Square, and Vertical
export function renderStickmanCartoon(ctx, { width, height, time, progress, scene, accent }) {
  const { isLandscape } = getLayoutMetrics(width, height);
  const vis = scene?.customVisuals || {};
  const speechText = vis.speech || 'AHA! 💡';
  const action = vis.action || 'excited';
  const phaseName = vis.phaseName || `PHASE ${vis.phaseNumber || 1}`;

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, width, height);

  // Sketch paper grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const grid = Math.max(30, Math.floor(width * 0.035));
  for (let x = 0; x < width; x += grid) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += grid) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  // Top Phase Indicator Banner
  ctx.save();
  ctx.fillStyle = '#27272a';
  const bannerW = width * (isLandscape ? 0.7 : 0.86);
  const bannerX = (width - bannerW) / 2;
  const bannerY = height * 0.06;
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, 38, 10);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🎬 ${phaseName}`, bannerX + 18, bannerY + 19);

  ctx.fillStyle = '#a1a1aa';
  ctx.textAlign = 'right';
  ctx.fillText(`SCENE ${scene?.id || 1}`, bannerX + bannerW - 18, bannerY + 19);
  ctx.restore();

  // Ground line
  const groundY = isLandscape ? height * 0.60 : height * 0.60;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width * 0.08, groundY);
  ctx.lineTo(width * 0.92, groundY);
  ctx.stroke();

  // Character positioning
  const charBaseX = isLandscape ? width * 0.35 : width * 0.30;
  const charX = action === 'running' 
    ? (charBaseX - width * 0.15 + (progress * width * 0.35)) 
    : (charBaseX + Math.sin(time * 2) * 18);
  const charY = groundY - 140;

  ctx.save();
  ctx.translate(charX, charY);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const headR = 36;
  ctx.beginPath();
  ctx.arc(0, -headR, headR, 0, Math.PI * 2);
  ctx.stroke();

  // Face Expression
  ctx.fillStyle = '#ffffff';
  if (action === 'shocked') {
    ctx.beginPath();
    ctx.arc(-12, -headR - 4, 6, 0, Math.PI * 2);
    ctx.arc(12, -headR - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -headR + 16, 12, 0, Math.PI * 2);
    ctx.stroke();
  } else if (action === 'celebrating') {
    ctx.beginPath();
    ctx.arc(-12, -headR - 2, 8, Math.PI, 0);
    ctx.arc(12, -headR - 2, 8, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -headR + 12, 14, 0, Math.PI);
    ctx.stroke();
  } else {
    const isBlink = (Math.sin(time * 3) > 0.95);
    if (!isBlink) {
      ctx.beginPath();
      ctx.arc(-12, -headR - 4, 4, 0, Math.PI * 2);
      ctx.arc(12, -headR - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-16, -headR - 4); ctx.lineTo(-8, -headR - 4);
      ctx.moveTo(8, -headR - 4); ctx.lineTo(16, -headR - 4);
      ctx.stroke();
    }
    const mouthOpen = Math.abs(Math.sin(time * 12)) * 12;
    ctx.beginPath();
    ctx.ellipse(0, -headR + 14, 10, Math.max(2, mouthOpen), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Torso
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 70);
  ctx.stroke();

  // Arms
  if (action === 'celebrating') {
    const armJitter = Math.sin(time * 12) * 10;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(-45, -35 + armJitter);
    ctx.moveTo(0, 20);
    ctx.lineTo(45, -35 - armJitter);
    ctx.stroke();
  } else if (action === 'running') {
    const runArm = Math.sin(time * 10) * 35;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(-45, 20 + runArm);
    ctx.moveTo(0, 20);
    ctx.lineTo(45, 20 - runArm);
    ctx.stroke();
  } else if (action === 'thinking') {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(-20, 30);
    ctx.lineTo(-5, -headR + 15);
    ctx.moveTo(0, 20);
    ctx.lineTo(35, 45);
    ctx.stroke();
  } else {
    const armWave = Math.sin(time * 6) * 25;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(-45, 10 + armWave);
    ctx.moveTo(0, 20);
    ctx.lineTo(45, 10 - armWave);
    ctx.stroke();
  }

  // Legs
  if (action === 'running') {
    const runLeg = Math.sin(time * 10) * 45;
    ctx.beginPath();
    ctx.moveTo(0, 70);
    ctx.lineTo(-35 + runLeg, 135);
    ctx.moveTo(0, 70);
    ctx.lineTo(35 - runLeg, 135);
    ctx.stroke();
  } else {
    const legCycle = Math.sin(time * 6) * 20;
    ctx.beginPath();
    ctx.moveTo(0, 70);
    ctx.lineTo(-25 + legCycle, 140);
    ctx.moveTo(0, 70);
    ctx.lineTo(25 - legCycle, 140);
    ctx.stroke();
  }

  // Props
  if (action === 'celebrating') {
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(0, -headR * 2.4, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    const ideaY = -headR * 2.2 + Math.sin(time * 4) * 8;
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(35, ideaY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Comic Speech Bubble (Positioned intelligently beside stickman)
  const bubbleX = isLandscape ? width * 0.62 : width * 0.65;
  const bubbleY = isLandscape ? height * 0.32 : height * 0.28;

  ctx.save();
  ctx.font = 'bold 22px sans-serif';
  const textMetrics = ctx.measureText(speechText);
  const bubbleW = Math.max(160, textMetrics.width + 48);
  const bubbleH = 76;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(bubbleX - bubbleW / 2, bubbleY - bubbleH / 2, bubbleW, bubbleH, 20);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(bubbleX - 30, bubbleY + bubbleH / 2);
  ctx.lineTo(bubbleX - 60, bubbleY + bubbleH / 2 + 25);
  ctx.lineTo(bubbleX - 10, bubbleY + bubbleH / 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(speechText, bubbleX, bubbleY);
  ctx.restore();
}

// 2. DEMO / HOW-TO: Adapts window and checklist cleanly across orientations
export function renderDemoHowTo(ctx, { width, height, time, progress, scene, accent }) {
  const { isLandscape } = getLayoutMetrics(width, height);
  const vis = scene?.customVisuals || {};
  const screenTitle = vis.screenTitle || scene?.hookText || 'HOW-TO GUIDE';
  const phaseName = vis.phaseName || `STEP ${vis.phaseNumber || 1}`;
  const steps = (vis.steps && vis.steps.length > 0) ? vis.steps : ['Step 1: Setup', 'Step 2: Automate', 'Step 3: Export'];

  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, width, height);

  // Top Phase Badge
  const bannerW = width * (isLandscape ? 0.65 : 0.86);
  const bannerX = (width - bannerW) / 2;
  const bannerY = height * 0.06;

  ctx.save();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, 36, 10);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`⚡ ${phaseName}: ${screenTitle}`, bannerX + 16, bannerY + 18);
  ctx.restore();

  // App Window Frame
  const winW = width * (isLandscape ? 0.62 : 0.88);
  const winH = height * (isLandscape ? 0.44 : 0.40);
  const winX = (width - winW) / 2;
  const winY = height * 0.17;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 15;

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(winX, winY, winW, winH, 16);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Titlebar
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(winX, winY, winW, 42, [16, 16, 0, 0]);
  ctx.fill();

  const btns = ['#ef4444', '#f59e0b', '#10b981'];
  btns.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(winX + 22 + i * 18, winY + 21, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  // Steps
  const activeStepIdx = Math.min(steps.length - 1, Math.floor(progress * steps.length));
  const stepH = Math.min(46, (winH - 64) / steps.length);

  steps.forEach((step, idx) => {
    const isStepActive = idx === activeStepIdx;
    const sy = winY + 54 + idx * (stepH + 8);

    ctx.fillStyle = isStepActive ? '#334155' : '#1e293b';
    ctx.strokeStyle = isStepActive ? accent : '#475569';
    ctx.lineWidth = isStepActive ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(winX + 20, sy, winW - 40, stepH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isStepActive ? accent : '#64748b';
    ctx.beginPath();
    ctx.arc(winX + 44, sy + stepH / 2, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${idx + 1}`, winX + 44, sy + stepH / 2 + 4);

    ctx.fillStyle = isStepActive ? '#ffffff' : '#94a3b8';
    ctx.font = isStepActive ? 'bold 14px sans-serif' : '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(step, winX + 66, sy + stepH / 2 + 4);
  });

  // Animated Cursor
  const cursorTargetY = winY + 54 + activeStepIdx * (stepH + 8) + stepH / 2;
  const cursorX = winX + winW * 0.72 + Math.sin(time * 3) * 15;
  const cursorY = cursorTargetY + Math.cos(time * 2) * 5;

  if (Math.sin(time * 4) > 0.8) {
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, 18, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cursorX, cursorY);
  ctx.lineTo(cursorX + 14, cursorY + 11);
  ctx.lineTo(cursorX + 7, cursorY + 13);
  ctx.lineTo(cursorX + 11, cursorY + 22);
  ctx.lineTo(cursorX + 5, cursorY + 24);
  ctx.lineTo(cursorX + 2, cursorY + 15);
  ctx.lineTo(cursorX - 4, cursorY + 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// 3. EXPLAINER: Orbiting Concept Mind-Map
export function renderExplainer(ctx, { width, height, time, progress, scene, accent }) {
  const { isLandscape } = getLayoutMetrics(width, height);
  const vis = scene?.customVisuals || {};
  const coreConcept = vis.coreConcept || scene?.hookText || 'CONCEPT';
  const phaseName = vis.phaseName || `STAGE ${vis.phaseNumber || 1}`;
  const nodes = (vis.nodes && vis.nodes.length > 0) ? vis.nodes : ['Insight A', 'Insight B', 'Insight C'];

  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, width, height);

  // Top Phase Indicator
  const bannerW = width * (isLandscape ? 0.65 : 0.86);
  const bannerX = (width - bannerW) / 2;
  const bannerY = height * 0.06;

  ctx.save();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, 36, 10);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🧠 ${phaseName}: ${coreConcept}`, bannerX + 16, bannerY + 18);
  ctx.restore();

  const cx = width / 2;
  const cy = isLandscape ? height * 0.38 : height * 0.36;
  const orbitDist = Math.min(width, height) * (isLandscape ? 0.24 : 0.28);

  const nodeObjects = nodes.map((nText, i) => ({
    label: nText,
    angle: time * 0.5 + (Math.PI * 2 * i) / nodes.length,
    dist: orbitDist
  }));

  // Connecting laser lines
  ctx.save();
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.lineDashOffset = -time * 30;
  ctx.strokeStyle = `${accent}88`;

  nodeObjects.forEach(n => {
    const nx = cx + Math.cos(n.angle) * n.dist;
    const ny = cy + Math.sin(n.angle) * n.dist;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();
  });
  ctx.restore();

  // Central Core Node
  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 40;
  ctx.fillStyle = accent;
  const coreR = Math.min(width, height) * 0.065;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR + Math.sin(time * 3) * 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const coreWords = coreConcept.split(' ');
  if (coreWords.length > 2) {
    ctx.fillText(coreWords.slice(0, 2).join(' '), cx, cy - 8);
    ctx.fillText(coreWords.slice(2).join(' '), cx, cy + 10);
  } else {
    ctx.fillText(coreConcept, cx, cy);
  }

  // Satellite Nodes
  nodeObjects.forEach((n) => {
    const nx = cx + Math.cos(n.angle) * n.dist;
    const ny = cy + Math.sin(n.angle) * n.dist;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(nx - 55, ny - 25, 110, 50, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(n.label, nx, ny);
  });
  ctx.restore();
}

// 4. BRAND & PROMO
export function renderBrandPromo(ctx, { width, height, time, progress, scene, accent }) {
  const { isLandscape } = getLayoutMetrics(width, height);
  const vis = scene?.customVisuals || {};
  const headlineMetric = vis.headlineMetric || '10X FASTER';
  const subMetric = vis.subMetric || scene?.hookText || 'VIRAL REACH';
  const phaseName = vis.phaseName || `HIGHLIGHT ${vis.phaseNumber || 1}`;

  const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
  grad.addColorStop(0, '#3b0764');
  grad.addColorStop(0.7, '#1e1b4b');
  grad.addColorStop(1, '#09090b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Phase Banner
  const bannerW = width * (isLandscape ? 0.65 : 0.86);
  const bannerX = (width - bannerW) / 2;
  const bannerY = height * 0.06;

  ctx.save();
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, 36, 10);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🚀 ${phaseName}`, bannerX + 16, bannerY + 18);
  ctx.restore();

  // Speed streaks
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 6; i++) {
    const y = ((time * 800 + i * 240) % height);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y - 50);
    ctx.stroke();
  }
  ctx.restore();

  // Showcase Card
  const cardW = width * (isLandscape ? 0.62 : 0.82);
  const cardH = height * (isLandscape ? 0.36 : 0.30);
  const cardX = (width - cardW) / 2;
  const cardY = isLandscape ? height * 0.20 : height * 0.22 + Math.sin(time * 3) * 12;

  ctx.save();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 50;

  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  cardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 22);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${Math.floor(width * 0.048)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(headlineMetric, width / 2, cardY + cardH * 0.42);

  ctx.fillStyle = accent;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(subMetric, width / 2, cardY + cardH * 0.72);
  ctx.restore();
}

// 5. LIVE-ACTION VS ANIMATION
export function renderLiveVsAnim(ctx, { width, height, time, progress, scene, accent }) {
  const { isLandscape } = getLayoutMetrics(width, height);
  const vis = scene?.customVisuals || {};
  const leftTitle = vis.leftTitle || 'THE OBSTACLE';
  const leftPoints = vis.leftPoints || ['Manual Friction', 'High Costs'];
  const rightTitle = vis.rightTitle || 'THE ADVANTAGE';
  const rightPoints = vis.rightPoints || ['Instant 1-Click', 'Infinite Scale'];
  const phaseName = vis.phaseName || `COMPARISON ${vis.phaseNumber || 1}`;

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, width / 2, height);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(width / 2, 0, width / 2, height);

  // Phase Banner
  const bannerW = width * (isLandscape ? 0.65 : 0.86);
  const bannerX = (width - bannerW) / 2;
  const bannerY = height * 0.06;

  ctx.save();
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, 36, 10);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`⚖️ ${phaseName}`, bannerX + 16, bannerY + 18);
  ctx.restore();

  // Split line
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(width / 2, height * 0.14);
  ctx.lineTo(width / 2, height * 0.62);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Left
  ctx.fillStyle = '#94a3b8';
  ctx.font = '900 22px sans-serif';
  ctx.fillText(leftTitle, width * 0.25, height * 0.24);
  leftPoints.forEach((pt, i) => {
    ctx.font = 'bold 13.5px sans-serif';
    ctx.fillText(`❌ ${pt}`, width * 0.25, height * 0.33 + i * 34);
  });

  // VS Emblem
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(width / 2, height * 0.37, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = '900 20px sans-serif';
  ctx.fillText('VS', width / 2, height * 0.37);

  // Right
  ctx.font = '900 22px sans-serif';
  ctx.fillStyle = accent;
  ctx.fillText(rightTitle, width * 0.75, height * 0.24);
  rightPoints.forEach((pt, i) => {
    ctx.font = 'bold 13.5px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`✅ ${pt}`, width * 0.75, height * 0.33 + i * 34);
  });
  ctx.restore();
}

// 6. UGC
export function renderUGC(ctx, { width, height, time, progress, scene, accent }) {
  const { isLandscape } = getLayoutMetrics(width, height);
  const vis = scene?.customVisuals || {};
  const creatorName = vis.creatorName || '@VerifiedCreator';
  const stage = vis.stage || 'The Journey';
  const phaseName = vis.phaseName || `JOURNEY ${vis.phaseNumber || 1}`;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  const bannerW = width * (isLandscape ? 0.65 : 0.86);
  const bannerX = (width - bannerW) / 2;
  const bannerY = height * 0.06;

  ctx.save();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, 36, 10);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`📱 ${phaseName}: ${stage}`, bannerX + 16, bannerY + 18);
  ctx.restore();

  const avX = width / 2;
  const avY = isLandscape ? height * 0.32 : height * 0.30;
  const avR = Math.min(width, height) * 0.065;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avX, avY, avR, 0, Math.PI * 2);
  ctx.fillStyle = '#334155';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = accent;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(avX, avY - avR * 0.22, avR * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(avX, avY + avR * 0.75, avR * 0.65, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(avX + avR * 0.7, avY + avR * 0.7, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', avX + avR * 0.7, avY + avR * 0.7);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(creatorName, width / 2, avY + avR + 26);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('★★★★★', width / 2, avY + avR + 52);

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`(${stage})`, width / 2, avY + avR + 74);

  // Floating hearts
  for (let i = 0; i < 5; i++) {
    const heartProgress = ((time * 0.8 + i * 0.35) % 2) / 2;
    const hx = width * 0.75 + Math.sin(time * 3 + i) * 25;
    const hy = height * 0.5 - heartProgress * 240;
    const hAlpha = 1 - heartProgress;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.fillStyle = `rgba(244, 63, 94, ${hAlpha})`;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-15, 0, -15, -15, 0, -8);
    ctx.bezierCurveTo(15, -15, 15, 0, 0, 10);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// 7. SCREENCAST
export function renderScreencast(ctx, { width, height, time, progress, scene, accent }) {
  const { isLandscape } = getLayoutMetrics(width, height);
  const vis = scene?.customVisuals || {};
  const fileName = vis.fileName || `step_${scene?.id || 1}.ts`;
  const phaseName = vis.phaseName || `STEP ${vis.phaseNumber || 1}`;
  const codeLines = (vis.codeLines && vis.codeLines.length > 0) ? vis.codeLines : [
    '// Step Progress',
    'const result = await process();',
    'console.log("Success!");'
  ];

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  const bannerW = width * (isLandscape ? 0.65 : 0.86);
  const bannerX = (width - bannerW) / 2;
  const bannerY = height * 0.06;

  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, 36, 10);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`💻 ${phaseName}: ${fileName}`, bannerX + 16, bannerY + 18);
  ctx.restore();

  const termW = width * (isLandscape ? 0.62 : 0.88);
  const termH = height * (isLandscape ? 0.42 : 0.38);
  const termX = (width - termW) / 2;
  const termY = height * 0.17;

  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(termX, termY, termW, termH, 14);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(termX, termY, termW, 36, [14, 14, 0, 0]);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(termX + 70, termY + 7, 130, 28, [8, 8, 0, 0]);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.fillText(fileName, termX + 90, termY + 24);

  const visibleCount = Math.min(codeLines.length, Math.floor(time * 2.5) % (codeLines.length + 2));

  ctx.font = '13px monospace';
  codeLines.slice(0, visibleCount).forEach((line, i) => {
    ctx.fillStyle = i === 0 ? '#4ade80' : i === 1 ? '#c084fc' : '#38bdf8';
    ctx.fillText(line, termX + 22, termY + 68 + i * 26);
  });

  if (Math.sin(time * 6) > 0) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(termX + 22 + (visibleCount > 0 ? 120 : 0), termY + 56 + visibleCount * 26, 8, 16);
  }
  ctx.restore();
}
