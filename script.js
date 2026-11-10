(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  const progress = document.getElementById('scroll-progress-bar');
  const year = document.getElementById('year');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (year) year.textContent = new Date().getFullYear();

  // Smooth Cursor Follower: one spring-smoothed red ring on desktop pointers.
  const cursor = document.querySelector('.custom-cursor');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (cursor && finePointer && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    cursor.innerHTML = '<span class="smooth-cursor-follower" aria-hidden="true"><i></i></span>';
    const follower = cursor.querySelector('.smooth-cursor-follower');
    let targetX = -100, targetY = -100, currentX = -100, currentY = -100;
    let active = false, raf = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      follower.style.transform = `translate3d(${currentX}px,${currentY}px,0) translate(-50%,-50%)`;
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        raf = requestAnimationFrame(render);
      } else {
        active = false;
      }
    };

    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add('is-visible');
      if (!active) { active = true; raf = requestAnimationFrame(render); }
    }, { passive: true });

    document.addEventListener('pointerover', event => {
      const target = event.target instanceof Element ? event.target : null;
      cursor.classList.toggle('is-hover', Boolean(target?.closest('a, button, .feature-story, .story-list article, .program-card')));
    });
    document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'));
    document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'));
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    window.addEventListener('blur', () => {
      active = false;
      cancelAnimationFrame(raf);
      cursor.classList.remove('is-visible', 'is-pressed');
    });
  }

  const closeMenu = () => {
    nav?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Buka menu navigasi');
  };
  menuButton?.addEventListener('click', () => {
    const isOpen = nav?.classList.toggle('open') ?? false;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  let ticking = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    header?.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateScroll); ticking = true; }
  }, { passive: true });
  updateScroll();

  // Progressive enhancement: if animation libraries fail to load, all content remains visible.
  if (reduceMotion) document.documentElement.classList.add('reduced-motion');
})();
