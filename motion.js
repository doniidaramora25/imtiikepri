import { gsap } from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import Lenis from "https://esm.sh/lenis@1.3.11";

// Respect reduced-motion preferences: no smooth-scroll hijacking or animated reveals.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.15,
    anchors: { offset: -88 }
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Keep ScrollTrigger measurements correct after images/fonts/layout settle.
  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready?.then(() => ScrollTrigger.refresh());

  // Hero entrance animation.
  gsap.fromTo(".hero-copy > *", { autoAlpha: 0, y: 28 }, {
    autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.12, ease: "power3.out", delay: 0.12
  });
  gsap.fromTo(".hero-visual", { autoAlpha: 0, y: 35, rotate: -2 }, {
    autoAlpha: 1, y: 0, rotate: 0, duration: 1.1, ease: "power3.out", delay: 0.28
  });

  // Reveal all meaningful content groups as they enter the viewport.
  const reveal = (selector, trigger = selector, options = {}) => {
    const elements = gsap.utils.toArray(selector);
    if (!elements.length) return;
    gsap.fromTo(elements, { autoAlpha: 0, y: options.y ?? 38 }, {
      autoAlpha: 1, y: 0, duration: options.duration ?? 0.8,
      stagger: options.stagger ?? 0.1, ease: "power3.out",
      scrollTrigger: { trigger, start: "top 88%", once: true, invalidateOnRefresh: true }
    });
  };
  reveal(".intro .two-col > *", ".intro .two-col", { y: 30, stagger: 0.12 });
  reveal(".section-heading", ".section-heading", { y: 28 });
  reveal(".value-card", ".value-grid", { y: 46, stagger: 0.13 });
  reveal(".program-list article", ".program-list", { y: 32, stagger: 0.12 });
  reveal(".news-card", ".news-grid", { y: 48, stagger: 0.15 });
  reveal(".gallery-tile", ".gallery-grid", { y: 45, stagger: 0.14 });
  reveal(".agenda-wrap > *", ".agenda-wrap", { y: 38, stagger: 0.16 });
  reveal(".join-wrap > *", ".join-wrap", { y: 38, stagger: 0.16 });
  reveal(".footer-top > *, .footer-bottom > *", ".footer", { y: 18, stagger: 0.08, duration: 0.65 });

  // Parallax depth on hero ornaments.
  gsap.to(".orbit-one", { y: -24, rotate: 18, ease: "none", scrollTrigger: {
    trigger: ".hero", start: "top top", end: "bottom top", scrub: 1
  }});
  gsap.to(".orbit-two", { y: 20, rotate: -14, ease: "none", scrollTrigger: {
    trigger: ".hero", start: "top top", end: "bottom top", scrub: 1
  }});

  // Smooth in-page navigation with Lenis; leave external links untouched.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -88, duration: 1.1 });
      history.replaceState?.(null, "", href);
    });
  });
}
