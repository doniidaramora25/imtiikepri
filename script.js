(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  const progress = document.getElementById('scroll-progress-bar');
  const year = document.getElementById('year');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (year) year.textContent = new Date().getFullYear();

  // Fluid cursor: spring-like trailing blobs on fine-pointer desktop devices.
  const cursor = document.querySelector('.custom-cursor');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (cursor && finePointer && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    cursor.innerHTML = Array.from({ length: 6 }, (_, i) =>
      `<i class="fluid-cursor-blob blob-${i}" aria-hidden="true"></i>`
    ).join('');
    const blobs = [...cursor.querySelectorAll('.fluid-cursor-blob')];
    const points = blobs.map(() => ({ x: -100, y: -100 }));
    let targetX = -100, targetY = -100, active = false, raf = 0;
    const render = () => {
      points.forEach((point, i) => {
        const ease = i === 0 ? 0.42 : 0.19 - i * 0.018;
        point.x += (targetX - point.x) * ease;
        point.y += (targetY - point.y) * ease;
        blobs[i].style.transform = `translate3d(${point.x}px,${point.y}px,0) translate(-50%,-50%)`;
      });
      if (active) raf = requestAnimationFrame(render);
    };
    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!active) { active = true; raf = requestAnimationFrame(render); }
      cursor.classList.add('is-visible');
    }, { passive: true });
    document.addEventListener('pointerover', event => {
      cursor.classList.toggle('is-hover', Boolean(event.target.closest('a, button, .feature-story, .story-list article, .program-card')));
    });
    document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'));
    document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'));
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    document.addEventListener('pointerenter', () => cursor.classList.add('is-visible'));
    window.addEventListener('blur', () => { active = false; cancelAnimationFrame(raf); cursor.classList.remove('is-visible'); });
    window.addEventListener('focus', () => { if (targetX >= 0) { active = true; raf = requestAnimationFrame(render); } });
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
