// Preserve clean production URLs while making navigation work when pages are
// opened directly from the local filesystem.
if (location.protocol === 'file:') {
  const localPages = {
    '/': 'index.html',
    '/about/': 'pages/about.html',
    '/hackathon/': 'pages/hackathon.html',
    '/blitz-hackathon-2026/': 'pages/blitz-hackathon-2026.html',
    '/contact/': 'pages/contact.html',
    '/privacy/': 'pages/privacy.html',
    '/terms/': 'pages/terms.html'
  };

  document.querySelectorAll('a[href^="/"]').forEach(link => {
    const destination = new URL(link.getAttribute('href'), 'https://humaine.ae');
    const localPage = localPages[destination.pathname];
    if (localPage) link.href = `${localPage}${destination.search}${destination.hash}`;
  });
}

const headerContainer = document.querySelector('.site-header .container');
const primaryNavigation = document.querySelector('.main-nav');

if (primaryNavigation) {
  const hackathonsLink = [...primaryNavigation.querySelectorAll(':scope > a')]
    .find(link => link.textContent.trim() === 'Hackathons');

  if (hackathonsLink) {
    const onLocalFile = location.protocol === 'file:';
    const group = document.createElement('div');
    group.className = 'nav-menu-group';
    const toggle = document.createElement('button');
    toggle.className = 'nav-submenu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Show Hackathons menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span aria-hidden="true"></span>';
    const submenu = document.createElement('div');
    submenu.className = 'nav-submenu';
    submenu.innerHTML = `
      <a href="${onLocalFile ? 'pages/hackathon.html' : '/hackathon/'}">All hackathons</a>
      <a href="${onLocalFile ? 'pages/blitz-hackathon-2026.html' : '/blitz-hackathon-2026/'}">AMIC Blitz 2026</a>
    `;

    hackathonsLink.before(group);
    group.append(hackathonsLink, toggle, submenu);

    const currentPath = location.pathname.toLowerCase();
    const onBlitzPage = currentPath.includes('blitz-hackathon-2026');
    const onHackathonsPage = !onBlitzPage && (currentPath.endsWith('/hackathon/') || currentPath.endsWith('/hackathon.html'));
    if (onBlitzPage || onHackathonsPage) group.classList.add('is-current-section');
    if (onBlitzPage) {
      hackathonsLink.removeAttribute('aria-current');
      submenu.lastElementChild.setAttribute('aria-current', 'page');
    } else if (onHackathonsPage) {
      submenu.firstElementChild.setAttribute('aria-current', 'page');
    }

    const setSubmenu = open => {
      group.classList.toggle('submenu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', `${open ? 'Hide' : 'Show'} Hackathons menu`);
    };
    toggle.addEventListener('click', event => {
      event.stopPropagation();
      setSubmenu(!group.classList.contains('submenu-open'));
    });
    group.addEventListener('focusout', event => {
      if (!group.contains(event.relatedTarget)) setSubmenu(false);
    });
    document.addEventListener('click', event => {
      if (!group.contains(event.target)) setSubmenu(false);
    });
  }
}

document.querySelectorAll('.legal-footer').forEach(footer => {
  const footerBrand = document.createElement('a');
  footerBrand.className = 'footer-brand';
  footerBrand.href = location.protocol === 'file:' ? 'index.html' : '/';
  footerBrand.setAttribute('aria-label', 'HumAIne.ae home');
  footerBrand.innerHTML = '<img src="assets/images/logoextended.png" alt="HumAIne.ae" width="2048" height="970" loading="lazy">';
  footer.prepend(footerBrand);
});

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

  const menuLinks = [...primaryNavigation.querySelectorAll('a, button.nav-submenu-toggle')];
  const menuIsOpen = () => headerContainer.classList.contains('menu-open');

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuIsOpen()) return;
    headerContainer.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = headerContainer.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    if (isOpen) menuLinks[0]?.focus();
  });

  primaryNavigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (!menuIsOpen()) return;

    if (event.key === 'Escape') {
      closeMenu({ restoreFocus: true });
      return;
    }

    if (event.key === 'Tab') {
      const focusableItems = [menuToggle, ...menuLinks];
      const firstItem = focusableItems[0];
      const lastItem = focusableItems.at(-1);

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }
  });

  document.addEventListener('click', event => {
    if (!headerContainer.contains(event.target)) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  }, { passive: true });
}

document.querySelectorAll('img').forEach(image => {
  const showImageFallback = () => {
    const container = image.closest('figure, .carousel-slide, .hackathon-hero-image') || image.parentElement;
    container?.classList.add('image-load-failed');
    image.hidden = true;
    if (container && !container.querySelector('.image-fallback')) {
      const fallback = document.createElement('span');
      fallback.className = 'image-fallback';
      fallback.textContent = 'HumAIne event photo';
      container.appendChild(fallback);
    }
  };
  image.addEventListener('error', showImageFallback, { once: true });
  if (image.complete && image.naturalWidth === 0) showImageFallback();
});

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
      status.textContent = 'The hackathon has begun.';
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

document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
  const previousButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const toggleButton = carousel.querySelector('[data-carousel-toggle]');
  const dotsContainer = carousel.querySelector('[data-carousel-dots]');
  const status = carousel.querySelector('[data-carousel-status]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const autoOnly = carousel.hasAttribute('data-carousel-auto-only');
  const autoplayInterval = Math.max(2000, Number(carousel.dataset.carouselInterval) || 5500);
  let activeIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
  let autoplayTimer = null;
  let userPaused = reduceMotion;
  let touchStartX = null;

  if (slides.length < 2) return;

  const dots = dotsContainer ? slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show photo ${index + 1}`);
    dot.addEventListener('click', () => showSlide(index, true));
    dotsContainer.appendChild(dot);
    return dot;
  }) : [];

  const stopAutoplay = () => {
    if (!autoplayTimer) return;
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (reduceMotion || userPaused || document.hidden) return;
    autoplayTimer = setInterval(() => showSlide(activeIndex + 1), autoplayInterval);
  };

  function showSlide(index, restart = false) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
    if (status) status.textContent = `Photo ${activeIndex + 1} of ${slides.length}`;
    if (restart) startAutoplay();
  }

  previousButton?.addEventListener('click', () => showSlide(activeIndex - 1, true));
  nextButton?.addEventListener('click', () => showSlide(activeIndex + 1, true));
  toggleButton?.addEventListener('click', () => {
    userPaused = !userPaused;
    toggleButton.textContent = userPaused ? 'Play' : 'Pause';
    toggleButton.setAttribute('aria-label', userPaused ? 'Play automatic slideshow' : 'Pause automatic slideshow');
    if (userPaused) stopAutoplay();
    else startAutoplay();
  });
  if (!autoOnly) {
    carousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') showSlide(activeIndex - 1, true);
      if (event.key === 'ArrowRight') showSlide(activeIndex + 1, true);
    });
    carousel.addEventListener('touchstart', event => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
      stopAutoplay();
    }, { passive: true });
    carousel.addEventListener('touchend', event => {
      const touchEndX = event.changedTouches[0]?.clientX;
      if (touchStartX !== null && touchEndX !== undefined) {
        const distance = touchEndX - touchStartX;
        if (Math.abs(distance) > 45) showSlide(activeIndex + (distance < 0 ? 1 : -1));
      }
      touchStartX = null;
      startAutoplay();
    }, { passive: true });
  }
  if (!autoOnly) {
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', event => {
      if (!carousel.contains(event.relatedTarget)) startAutoplay();
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  if (reduceMotion && toggleButton) {
    toggleButton.textContent = 'Motion off';
    toggleButton.setAttribute('aria-label', 'Automatic slideshow disabled by reduced motion preference');
    toggleButton.disabled = true;
  }

  showSlide(activeIndex);
  startAutoplay();
});

const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const isLegalPage = Boolean(document.querySelector('.legal-page'));

if (isLegalPage) document.documentElement.classList.add('legal-document');

if (motionAllowed && finePointer && !isLegalPage) {
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
      const isInside = event.clientY >= bounds.top - 145 && event.clientY <= bounds.bottom + 145;
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

if (motionAllowed && 'IntersectionObserver' in window && !isLegalPage) {
  document.documentElement.classList.add('motion-ready');

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -7% 0px' });

  document.querySelectorAll('main > section').forEach(section => {
    const items = section.querySelectorAll('.lede, .section-head > p, .intro-copy, .about-copy, .registration-box, .contact-methods, .sponsor-contact-card, .legal-date, .legal-copy > p');
    items.forEach((item, index) => {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 70}ms`);
      revealObserver.observe(item);
    });
  });

  const sequenceObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('sequence-visible');
      sequenceObserver.unobserve(entry.target);
    });
  }, { threshold: .18 });

  document.querySelectorAll('.roadmap-steps, .event-timeline').forEach(element => sequenceObserver.observe(element));
}
