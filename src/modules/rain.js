/**
 * Rain animation module - creates ambient rain effect on canvas
 * @module rain
 */

/**
 * Initialize the rain animation on the given canvas element.
 * @param {HTMLCanvasElement} canvas
 * @returns {{start: Function, stop: Function, setIntensity: Function}}
 */
export function initRainAnimation(canvas) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  const drops = [];
  let intensity = 100;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createDrop() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 4 + 3,
      opacity: Math.random() * 0.3 + 0.1,
      width: Math.random() * 1.5 + 0.5,
    };
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    while (drops.length < intensity) {
      drops.push(createDrop());
    }
    while (drops.length > intensity) {
      drops.pop();
    }

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + 0.5, drop.y + drop.length);
      ctx.strokeStyle = `rgba(174, 214, 241, ${drop.opacity})`;
      ctx.lineWidth = drop.width;
      ctx.lineCap = 'round';
      ctx.stroke();

      drop.y += drop.speed;
      drop.x += 0.2;

      if (drop.y > canvas.height) {
        drops[i] = createDrop();
      }
    }

    animationId = requestAnimationFrame(update);
  }

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function start() {
    if (prefersReducedMotion) return;
    resize();
    window.addEventListener('resize', resize);
    if (!animationId) update();
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    window.removeEventListener('resize', resize);
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Set rain intensity based on weather conditions.
   * @param {string} level - 'none', 'light', 'moderate', 'heavy', 'storm'
   */
  function setIntensity(level) {
    const levels = {
      none: 0,
      light: 40,
      moderate: 100,
      heavy: 200,
      storm: 350,
    };
    intensity = levels[level] || 100;
    if (intensity === 0) stop();
    else if (!animationId && !prefersReducedMotion) start();
  }

  return { start, stop, setIntensity };
}
