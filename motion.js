// Optional motion enhancement. Core content and navigation do not depend on these libraries.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  try {
    const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
      import('https://esm.sh/gsap@3.13.0'),
      import('https://esm.sh/gsap@3.13.0/ScrollTrigger'),
      import('https://esm.sh/lenis@1.3.11')
    ]);
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9, anchors: { offset: -82 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    gsap.from('.hero-copy > *', { y: 24, autoAlpha: 0, duration: .8, stagger: .1, ease: 'power3.out', delay: .12 });
    gsap.from('.hero-art', { y: 28, autoAlpha: 0, duration: 1, ease: 'power3.out', delay: .25 });
    gsap.to('.art-ring', { rotate: 24, y: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

    const reveal = (selector, trigger = selector, stagger = .1) => {
      const items = gsap.utils.toArray(selector);
      if (!items.length) return;
      gsap.from(items, { y: 30, autoAlpha: 0, duration: .75, stagger, ease: 'power2.out', scrollTrigger: { trigger, start: 'top 88%', once: true } });
    };
    reveal('.about-main, .principle-row > *', '.about-section', .12);
    reveal('.history-feature, .timeline-item', '.history-section', .12);
    reveal('.org-node, .division-grid > div', '.governance-board', .08);
    reveal('.vision-content article', '.vision-content', .12);
    reveal('.program-card', '.program-grid', .12);
    reveal('.feature-story, .story-list article', '.publication-grid', .12);
    reveal('.gallery-item', '.gallery-grid', .12);
    reveal('.contact-card', '.contact-section', .1);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', event => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -82, duration: 1 });
        history.replaceState(null, '', id);
      });
    });
    window.addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts?.ready?.then(() => ScrollTrigger.refresh());
  } catch (error) {
    console.warn('Motion enhancement unavailable; native scrolling remains active.', error);
  }
}
