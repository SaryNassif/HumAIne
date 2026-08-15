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

const headerContainer = document.querySelector('.site-header .container');
const primaryNavigation = document.querySelector('.main-nav');

if (headerContainer && primaryNavigation) {
  primaryNavigation.id = 'primary-navigation';

  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.type = 'button';
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  menuToggle.setAttribute('aria-controls', 'primary-navigation');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.innerHTML = '<span></span><span></span><span></span>';
  headerContainer.insertBefore(menuToggle, primaryNavigation);

  const closeMenu = () => {
    headerContainer.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = headerContainer.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  primaryNavigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
      menuToggle.focus();
    }
  });

  document.addEventListener('click', event => {
    if (!headerContainer.contains(event.target)) closeMenu();
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
  const gridLights = [...document.querySelectorAll('main > section')].map(section => {
    const light = document.createElement('div');
    light.className = 'mouse-grid-light';
    light.setAttribute('aria-hidden', 'true');
    section.prepend(light);
    return { section, light };
  });

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-network';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const context = canvas.getContext('2d');
  const points = [];
  const trailBlockers = 'a, button, p, h1, h2, h3, li, summary, details, figure, figcaption, .btn, .card, .countdown-panel, .registration-box, .registration-callout, .contact-methods, .contact-method, .value-feature, .value-stack, .roadmap-output, .person-photo, .founder-photo, .sponsor-image, .media-placeholder, .empty-media';
  let pixelRatio = 1;
  let pointerBlocked = false;

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
    pointerBlocked = event.target instanceof Element && Boolean(event.target.closest(trailBlockers));
    gridLights.forEach(({ section, light }) => {
      const bounds = section.getBoundingClientRect();
      const isInside = event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      const localY = event.clientY - bounds.top;
      const barriers = [...section.querySelectorAll('.section-head')]
        .map(element => element.getBoundingClientRect())
        .filter(barrier => event.clientX >= barrier.left && event.clientX <= barrier.right)
        .map(barrier => barrier.top - bounds.top)
        .sort((first, second) => first - second);
      const barrierAbove = barriers.filter(position => position <= localY).at(-1);
      const barrierBelow = barriers.find(position => position > localY);

      light.style.setProperty('--mouse-x', `${event.clientX}px`);
      light.style.setProperty('--mouse-y', `${localY}px`);
      light.style.setProperty('--clip-top', `${barrierAbove ?? 0}px`);
      light.style.setProperty('--clip-bottom', `${barrierBelow === undefined ? 0 : bounds.height - barrierBelow}px`);
      light.classList.toggle('is-active', isInside && !pointerBlocked);
    });
    if (pointerBlocked) {
      points.length = 0;
      return;
    }
    points.push({ x: event.clientX, y: event.clientY, life: 1 });
    if (points.length > 22) points.shift();
  }, { passive: true });

  const drawTrail = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (pointerBlocked) {
      requestAnimationFrame(drawTrail);
      return;
    }
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
