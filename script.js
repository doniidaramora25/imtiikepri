(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  const progress = document.getElementById('scroll-progress-bar');
  const year = document.getElementById('year');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (year) year.textContent = new Date().getFullYear();

  // Custom pointer for desktop; native cursor remains on touch and reduced-motion devices.
  const cursor = document.querySelector('.custom-cursor');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (cursor && finePointer && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    let pointerFrame = 0;
    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        cursor.style.left = event.clientX + 'px';
        cursor.style.top = event.clientY + 'px';
        cursor.style.opacity = '1';
      });
    }, { passive: true });
    document.addEventListener('pointerover', event => {
      if (event.target.closest('a, button, .feature-story, .story-list article, .program-card')) cursor.classList.add('is-hover');
      else cursor.classList.remove('is-hover');
    });
    document.addEventListener('pointerdown', () => cursor.classList.add('is-hover'));
    document.addEventListener('pointerup', () => cursor.classList.remove('is-hover'));
    document.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('pointerenter', () => { cursor.style.opacity = '1'; });
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
