(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  const progress = document.getElementById('scroll-progress-bar');
  const year = document.getElementById('year');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (year) year.textContent = new Date().getFullYear();

  // Basic red cursor follower: tracks the mouse directly without easing or trailing.
  const cursor = document.querySelector('.custom-cursor');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (cursor && finePointer && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    cursor.innerHTML = '<span class="cursor-follower-dot" aria-hidden="true"></span>';
    const follower = cursor.querySelector('.cursor-follower-dot');

    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      follower.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0) translate(-50%,-50%)`;
      cursor.classList.add('is-visible');
    }, { passive: true });

    document.addEventListener('pointerover', event => {
      const target = event.target instanceof Element ? event.target : null;
      cursor.classList.toggle('is-hover', Boolean(target?.closest('a, button, .feature-story, .story-list article, .program-card')));
    });
    document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'));
    document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'));
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    window.addEventListener('blur', () => cursor.classList.remove('is-visible', 'is-pressed'));
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
