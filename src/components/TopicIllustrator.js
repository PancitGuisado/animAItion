// Comprehensive Semantic Entity Illustrator
// Dynamically renders the EXACT physical subject typed by the user
export function drawTopicIllustration(ctx, { topicText = '', x, y, size, time, accent, progress }) {
  ctx.save();
  ctx.translate(x, y);

  const t = topicText.toLowerCase();

  // 1. ANIMALS / PETS (Dog, Cat, Wolf, Lion, Bear, Pet)
  if (t.includes('dog') || t.includes('puppy') || t.includes('canine') || t.includes('pet') || t.includes('bark')) {
    // Cute Animated Golden Retriever / Dog with wagging tail and panting tongue
    const floatY = Math.sin(time * 4) * 6;
    ctx.translate(0, floatY);

    // Body
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.32, size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail (Wagging fast at 14 Hz)
    const tailAngle = Math.sin(time * 14) * 0.5;
    ctx.save();
    ctx.translate(-size * 0.28, size * 0.05);
    ctx.rotate(tailAngle);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(-size * 0.12, -size * 0.1, size * 0.16, size * 0.06, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head
    const headX = size * 0.22;
    const headY = -size * 0.12;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(headX, headY, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.14, headY + size * 0.06, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black Nose
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(headX + size * 0.21, headY + size * 0.04, size * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // Tongue (Panting)
    const tongueDrop = Math.sin(time * 8) * 4;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.18, headY + size * 0.12 + tongueDrop, size * 0.035, size * 0.05, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Floppy Ear
    const earFlap = Math.sin(time * 4) * 0.15;
    ctx.save();
    ctx.translate(headX - size * 0.08, headY - size * 0.14);
    ctx.rotate(earFlap);
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.14, size * 0.06, size * 0.14, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(headX + size * 0.08, headY - size * 0.04, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headX + size * 0.09, headY - size * 0.05, size * 0.015, 0, Math.PI * 2);
    ctx.fill();

    // Paws
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(-size * 0.15, size * 0.3, size * 0.06, 0, Math.PI * 2);
    ctx.arc(size * 0.15, size * 0.3, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // 2. CAT / FELINE
  if (t.includes('cat') || t.includes('kitten') || t.includes('meow') || t.includes('feline')) {
    const headX = 0;
    const headY = 0;
    // Head
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(headX, headY, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Pointy Ears
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, -size * 0.15);
    ctx.lineTo(-size * 0.32, -size * 0.45);
    ctx.lineTo(-size * 0.05, -size * 0.28);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(size * 0.25, -size * 0.15);
    ctx.lineTo(size * 0.32, -size * 0.45);
    ctx.lineTo(size * 0.05, -size * 0.28);
    ctx.closePath();
    ctx.fill();

    // Big Green Cat Eyes
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(-size * 0.12, -size * 0.05, size * 0.06, size * 0.09, 0, 0, Math.PI * 2);
    ctx.ellipse(size * 0.12, -size * 0.05, size * 0.06, size * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slit pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(-size * 0.12, -size * 0.05, size * 0.02, size * 0.08, 0, 0, Math.PI * 2);
    ctx.ellipse(size * 0.12, -size * 0.05, size * 0.02, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, size * 0.08); ctx.lineTo(-size * 0.38, size * 0.04);
    ctx.moveTo(-size * 0.1, size * 0.12); ctx.lineTo(-size * 0.38, size * 0.16);
    ctx.moveTo(size * 0.1, size * 0.08); ctx.lineTo(size * 0.38, size * 0.04);
    ctx.moveTo(size * 0.1, size * 0.12); ctx.lineTo(size * 0.38, size * 0.16);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // 3. CARS / VEHICLES
  if (t.includes('car') || t.includes('drive') || t.includes('vehicle') || t.includes('tesla') || t.includes('racing') || t.includes('auto')) {
    const carY = Math.sin(time * 12) * 2;
    ctx.translate(0, carY);

    // Chassis
    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.roundRect(-size * 0.42, -size * 0.05, size * 0.84, size * 0.22, 12);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Roof
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-size * 0.28, -size * 0.05);
    ctx.lineTo(-size * 0.15, -size * 0.26);
    ctx.lineTo(size * 0.18, -size * 0.26);
    ctx.lineTo(size * 0.32, -size * 0.05);
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-size * 0.22, -size * 0.06);
    ctx.lineTo(-size * 0.12, -size * 0.22);
    ctx.lineTo(size * 0.14, -size * 0.22);
    ctx.lineTo(size * 0.26, -size * 0.06);
    ctx.closePath();
    ctx.fill();

    // Spinning Wheels
    const rot = time * 20;
    const drawWheel = (wx) => {
      ctx.save();
      ctx.translate(wx, size * 0.18);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();

      // Rim spokes
      ctx.rotate(rot);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size * 0.07, 0); ctx.lineTo(size * 0.07, 0);
      ctx.moveTo(0, -size * 0.07); ctx.lineTo(0, size * 0.07);
      ctx.stroke();
      ctx.restore();
    };

    drawWheel(-size * 0.25);
    drawWheel(size * 0.25);

    // Headlight beam
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.beginPath();
    ctx.moveTo(size * 0.42, 0);
    ctx.lineTo(size * 0.75, -size * 0.15);
    ctx.lineTo(size * 0.75, size * 0.25);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    return;
  }

  // 4. FINANCE / CRYPTO / MONEY
  if (t.includes('crypto') || t.includes('money') || t.includes('finance') || t.includes('dollar') || t.includes('bitcoin') || t.includes('wealth') || t.includes('cash') || t.includes('invest') || t.includes('rich') || t.includes('stock')) {
    const coinTilt = Math.sin(time * 3);
    ctx.save();
    ctx.scale(Math.abs(coinTilt) * 0.8 + 0.2, 1);
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 30;

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.font = `900 ${size * 0.38}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 4);
    ctx.restore();

    for (let i = 0; i < 3; i++) {
      const arrowProgress = ((time * 0.7 + i * 0.33) % 1);
      const ay = size * 0.4 - arrowProgress * size * 0.9;
      const ax = (i - 1) * (size * 0.45);
      ctx.fillStyle = `rgba(34, 197, 94, ${1 - arrowProgress})`;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 12, ay + 16);
      ctx.lineTo(ax - 4, ay + 16);
      ctx.lineTo(ax - 4, ay + 32);
      ctx.lineTo(ax + 4, ay + 32);
      ctx.lineTo(ax + 4, ay + 16);
      ctx.lineTo(ax + 12, ay + 16);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  // 5. HEALTH / FITNESS / GYM
  if (t.includes('health') || t.includes('gym') || t.includes('fit') || t.includes('body') || t.includes('heart') || t.includes('diet') || t.includes('workout') || t.includes('sleep') || t.includes('muscle')) {
    const heartbeat = 1 + Math.sin(time * 10) * (Math.sin(time * 10) > 0.6 ? 0.18 : 0.04);
    ctx.scale(heartbeat, heartbeat);

    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 35;
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    const s = size * 0.38;
    ctx.moveTo(0, s * 0.6);
    ctx.bezierCurveTo(-s * 0.9, 0, -s * 0.9, -s * 0.7, 0, -s * 0.4);
    ctx.bezierCurveTo(s * 0.9, -s * 0.7, s * 0.9, 0, 0, s * 0.6);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const waveX = (time * 120) % (size * 1.2) - size * 0.6;
    ctx.moveTo(-size * 0.5, 0);
    ctx.lineTo(waveX - 30, 0);
    ctx.lineTo(waveX - 15, -25);
    ctx.lineTo(waveX, 35);
    ctx.lineTo(waveX + 15, -15);
    ctx.lineTo(waveX + 25, 0);
    ctx.lineTo(size * 0.5, 0);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // 6. DEFAULT / CODE / TECH / GENERAL
  const rot = time * 0.5;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 30;

  const s = size * 0.35;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 1.2, -s * 0.3);
  ctx.lineTo(0, s * 0.4);
  ctx.lineTo(-s * 1.2, -s * 0.3);
  ctx.closePath();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(0, -s * 0.3, 14 + Math.sin(time * 5) * 4, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 4; i++) {
    const pY = -s * 0.3 - (((time * 80 + i * 35) % 90));
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, pY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
