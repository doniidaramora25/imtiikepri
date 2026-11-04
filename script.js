// IMTII Kepri — navigation, smooth scrolling and interaction effects
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.textContent = open ? "×" : "☰";
});

document.querySelectorAll(".nav-links a").forEach(link => link.addEventListener("click", () => {
  nav?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  if (menuButton) menuButton.textContent = "☰";
}));

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Smooth in-page navigation. CSS scroll-behavior provides a graceful fallback.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", event => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", targetId);
    });
  });
}

// Reading progress and compact header state.
const progressBar = document.getElementById("scroll-progress-bar");
const header = document.querySelector(".site-header");
let scrollTicking = false;
function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
  scrollTicking = false;
}
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollUI);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollUI();

// Reveal content as it enters the viewport. If unsupported, content remains visible.
const revealTargets = document.querySelectorAll(
  ".hero-copy, .hero-visual, .section-heading, .intro-text, .value-card, .program-list article, .news-card, .gallery-tile, .agenda-wrap > div, .join-wrap > div"
);
if (!reduceMotion && "IntersectionObserver" in window) {
  revealTargets.forEach(element => element.classList.add("reveal"));
  document.body.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealTargets.forEach(element => revealObserver.observe(element));
}

// Custom cursor for mouse/trackpad only. Touch devices keep their native interaction.
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (finePointer && !reduceMotion) {
  const dot = document.querySelector(".cursor-dot");
  const outline = document.querySelector(".cursor-outline");
  if (dot && outline) {
    document.body.classList.add("has-custom-cursor");
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;
    window.addEventListener("mousemove", event => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }, { passive: true });
    const followCursor = () => {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      outline.style.left = `${outlineX}px`;
      outline.style.top = `${outlineY}px`;
      window.requestAnimationFrame(followCursor);
    };
    followCursor();
    document.querySelectorAll("a, button, .value-card, .news-card, .gallery-tile").forEach(element => {
      element.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      element.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
    document.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  }
}

// Ganti URL Google Form di index.html pada elemen dengan id="join-link".
// Konten contoh perlu diganti dengan data resmi organisasi sebelum website dipublikasikan.
