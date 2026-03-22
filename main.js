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
    button.addEventListener('pointermove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      button.style.setProperty('--x', `${x}%`);
      button.style.setProperty('--y', `${y}%`);
    });
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
    }, { threshold: 0.18 });

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
    }, { threshold: 0.4 });

    const profileSection = document.getElementById('profile');
    if (profileSection) counterObserver.observe(profileSection);
  }

  const resetParallax = () => {
    parallaxEls.forEach((el) => {
      el.style.transform = '';
    });
  };

  if (heroStage && !prefersReducedMotion) {
    heroStage.addEventListener('pointermove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      parallaxEls.forEach((el) => {
        const depth = Number(el.dataset.parallax || 0.8);
        const tx = px * 22 * depth;
        const ty = py * 14 * depth;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    });

    heroStage.addEventListener('pointerleave', resetParallax);
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
    modalResponse.textContent = '';
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
    modalResponse.textContent = 'Authenticating secure tunnel…';

    window.setTimeout(() => {
      modalResponse.textContent = `${operator} verified. Replace this cinematic layer with your real routing, lore gate, or external auth flow.`;
    }, 900);
  });

  if (window.InstancedMouseEffect) {
    new InstancedMouseEffect({
      speed: 0.58,
      frequency: 0.82,
      mouseSize: 0.9,
      rotationSpeed: 0.18,
      rotationAmmount: 0.34,
      mouseScaling: 0.05,
      mouseIndent: 0.66,
      color: '#060708',
      colorDegrade: 1.18,
      shape: 'square'
    });
  }
})();
