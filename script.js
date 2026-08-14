// Preserve clean production URLs while making navigation work when pages are
// opened directly from the local filesystem.
if (location.protocol === 'file:') {
  const localPages = {
    '/': 'index.html',
    '/about/': 'about.html',
    '/hackathon/': 'hackathon.html',
    '/contact/': 'contact.html',
    '/privacy/': 'privacy.html',
    '/terms/': 'terms.html'
  };

  document.querySelectorAll('a[href^="/"]').forEach(link => {
    const destination = new URL(link.getAttribute('href'), 'https://humaine.ae');
    const localPage = localPages[destination.pathname];
    if (localPage) link.href = `${localPage}${destination.search}${destination.hash}`;
  });
}

const countdown = document.querySelector('[data-countdown]');

if (countdown) {
  const target = new Date(countdown.dataset.countdown).getTime();
  const fields = {
    days: countdown.querySelector('[data-days]'),
    hours: countdown.querySelector('[data-hours]'),
    minutes: countdown.querySelector('[data-minutes]'),
    seconds: countdown.querySelector('[data-seconds]')
  };
  const status = countdown.querySelector('[data-countdown-status]');
  const pad = value => String(value).padStart(2, '0');

  const updateCountdown = () => {
    const remaining = target - Date.now();
    if (remaining <= 0) {
      Object.values(fields).forEach(field => { field.textContent = '00'; });
      status.textContent = 'Registration has closed.';
      return false;
    }
    fields.days.textContent = pad(Math.floor(remaining / 86400000));
    fields.hours.textContent = pad(Math.floor(remaining / 3600000) % 24);
    fields.minutes.textContent = pad(Math.floor(remaining / 60000) % 60);
    fields.seconds.textContent = pad(Math.floor(remaining / 1000) % 60);
    return true;
  };

  updateCountdown();
  const timer = setInterval(() => {
    if (!updateCountdown()) clearInterval(timer);
  }, 1000);
}

const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

if (motionAllowed && finePointer) {
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-network';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const context = canvas.getContext('2d');
  const points = [];
  let pixelRatio = 1;

  const resizeCanvas = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('pointermove', event => {
    points.push({ x: event.clientX, y: event.clientY, life: 1 });
    if (points.length > 22) points.shift();
  }, { passive: true });

  const drawTrail = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      point.life -= 0.028;
      if (index > 0) {
        const previous = points[index - 1];
        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = `rgba(201,255,85,${Math.max(0, point.life * .34)})`;
        context.lineWidth = 1;
        context.stroke();
      }
      context.fillStyle = `rgba(201,255,85,${Math.max(0, point.life * .75)})`;
      context.fillRect(point.x - 2, point.y - 2, 4, 4);
    }
    while (points.length && points[0].life <= 0) points.shift();
    requestAnimationFrame(drawTrail);
  };

  resizeCanvas();
  drawTrail();
}
