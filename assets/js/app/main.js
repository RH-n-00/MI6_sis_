(function(){
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroStage = document.getElementById('heroStage');
  const heroButtons = document.querySelectorAll('.glass-button');
  const navLinks = document.querySelectorAll('.nav-link');
  const revealBlocks = document.querySelectorAll('.reveal');
  const counterEls = document.querySelectorAll('[data-counter]');
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const topClock = document.getElementById('topClock');
  const accessModal = document.getElementById('accessModal');
  const accessForm = document.getElementById('accessForm');
  const modalResponse = document.getElementById('modalResponse');
  const sections = Array.from(document.querySelectorAll('section[id]'));

  const isMobileLike = () => window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900;
  const isLowPowerDevice = () => isMobileLike() || (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4);

  const syncResponsiveFlags = () => {
    document.documentElement.classList.toggle('is-mobile-like', isMobileLike());
  };
  syncResponsiveFlags();

  const rafThrottle = (callback) => {
    let rafId = 0;
    let latestArgs = null;

    return (...args) => {
      latestArgs = args;
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        callback(...latestArgs);
      });
    };
  };

  const debounce = (callback, wait = 120) => {
    let timeoutId = 0;
    return () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(callback, wait);
    };
  };

  const setClock = () => {
    if (!topClock) return;
    const now = new Date();
    const london = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);
    topClock.textContent = `London ${london}`;
  };
  setClock();
  window.setInterval(setClock, 1000);

  heroButtons.forEach((button) => {
    const handlePointerMove = rafThrottle((event) => {
      const rect = button.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      button.style.setProperty('--x', `${x}%`);
      button.style.setProperty('--y', `${y}%`);
    });

    button.addEventListener('pointermove', handlePointerMove, { passive: true });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--x', '50%');
      button.style.setProperty('--y', '50%');
    }, { passive: true });
  });

  const scrollToTarget = (selector) => {
    const target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', () => scrollToTarget(el.getAttribute('data-scroll')));
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(href);
    });
  });

  const updateActiveNav = () => {
    const current = sections
      .map((section) => ({
        id: section.id,
        top: Math.abs(section.getBoundingClientRect().top)
      }))
      .sort((a, b) => a.top - b.top)[0];

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${current?.id || 'overview'}`);
    });
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    revealBlocks.forEach((block) => revealObserver.observe(block));
  } else {
    revealBlocks.forEach((block) => block.classList.add('is-visible'));
  }

  const animateCounter = (el) => {
    const raw = el.getAttribute('data-counter') || '0';
    const target = parseInt(raw, 10);
    const duration = 1100;
    const start = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      const padded = String(value).padStart(raw.length, '0');
      el.textContent = padded;
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  if (counterEls.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counterEls.forEach((el) => {
          if (!el.dataset.animated) {
            el.dataset.animated = 'true';
            animateCounter(el);
          }
        });
        counterObserver.disconnect();
      });
    }, { threshold: 0.35 });

    const profileSection = document.getElementById('profile');
    if (profileSection) counterObserver.observe(profileSection);
  }

  const setHeroLight = (x = 50, y = 50, alpha = 0) => {
    if (!heroStage) return;
    heroStage.style.setProperty('--light-x', `${x}%`);
    heroStage.style.setProperty('--light-y', `${y}%`);
    heroStage.style.setProperty('--light-alpha', `${alpha}`);
  };

  const resetParallax = () => {
    parallaxEls.forEach((el) => {
      el.style.transform = '';
    });
    setHeroLight(50, 50, 0);
  };

  const applyHeroInteractivity = (clientX, clientY, pointerType = 'mouse') => {
    if (!heroStage) return;
    const rect = heroStage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    const px = x / 100 - 0.5;
    const py = y / 100 - 0.5;
    const mobile = isMobileLike();
    const lightAlpha = mobile ? 0.58 : 1;
    const parallaxFactor = mobile || pointerType === 'touch' ? 0.3 : 1;

    setHeroLight(x, y, lightAlpha);

    if (prefersReducedMotion) return;

    parallaxEls.forEach((el) => {
      const depth = Number(el.dataset.parallax || 0.8);
      const tx = px * 22 * depth * parallaxFactor;
      const ty = py * 14 * depth * parallaxFactor;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
  };

  if (heroStage && !prefersReducedMotion) {
    const handleHeroPointerMove = rafThrottle((event) => {
      applyHeroInteractivity(event.clientX, event.clientY, event.pointerType || 'mouse');
    });

    heroStage.addEventListener('pointermove', handleHeroPointerMove, { passive: true });
    heroStage.addEventListener('pointerdown', (event) => {
      applyHeroInteractivity(event.clientX, event.clientY, event.pointerType || 'mouse');
    }, { passive: true });
    heroStage.addEventListener('pointerleave', resetParallax, { passive: true });
    heroStage.addEventListener('pointercancel', resetParallax, { passive: true });
  }

  const openModal = (selector) => {
    const modal = document.querySelector(selector);
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('input')?.focus();
  };

  const closeModal = () => {
    if (!accessModal) return;
    accessModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (modalResponse) modalResponse.textContent = '';
    accessForm?.reset();
  };

  document.querySelectorAll('[data-modal-open]').forEach((el) => {
    el.addEventListener('click', () => openModal(el.getAttribute('data-modal-open')));
  });

  accessModal?.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && accessModal && !accessModal.hidden) closeModal();
  });

  accessForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const operator = accessForm.operator?.value?.trim() || 'Operator';
    if (modalResponse) modalResponse.textContent = 'Authenticating secure tunnel…';

    window.setTimeout(() => {
      if (modalResponse) {
        modalResponse.textContent = `${operator} verified. Replace this cinematic layer with your real routing, lore gate, or external auth flow.`;
      }
    }, 900);
  });

  let instancedEffect = null;
  const syncInstancedQuality = () => {
    if (!instancedEffect?.rendering?.renderer || !instancedEffect?.rendering?.canvas) return;
    const canvas = instancedEffect.rendering.canvas;
    const dprCap = isLowPowerDevice() ? 1 : 1.35;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, dprCap);

    instancedEffect.rendering.vp.canvas.dpr = pixelRatio;
    instancedEffect.rendering.renderer.setPixelRatio(pixelRatio);
    instancedEffect.rendering.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
  };

  if (window.InstancedMouseEffect) {
    const mobile = isMobileLike();
    instancedEffect = new InstancedMouseEffect({
      speed: mobile ? 0.5 : 0.58,
      frequency: mobile ? 0.76 : 0.82,
      mouseSize: mobile ? 0.76 : 0.9,
      rotationSpeed: 0,
      rotationAmmount: 0,
      mouseScaling: mobile ? 0.028 : 0.04,
      mouseIndent: mobile ? 0.54 : 0.62,
      color: '#060708',
      colorDegrade: 1.18,
      shape: 'square'
    });
    syncInstancedQuality();
  }

  const handleViewportChange = debounce(() => {
    syncResponsiveFlags();
    updateActiveNav();
    syncInstancedQuality();
    if (prefersReducedMotion) return;
    resetParallax();
  }, 140);

  window.addEventListener('resize', handleViewportChange, { passive: true });
  window.addEventListener('orientationchange', handleViewportChange, { passive: true });
})();
