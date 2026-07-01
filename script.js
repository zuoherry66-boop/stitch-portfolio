const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = [...document.querySelectorAll("[data-reveal]")];
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".site-nav a")];
const progressRoot = document.documentElement;
const backdropLayers = [...document.querySelectorAll("[data-speed]")];

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealTargets.forEach((target, index) => {
    target.style.transitionDelay = `${Math.min(index * 40, 180)}ms`;
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
};

let rafScheduled = false;
let lastY = window.scrollY;

const updateScene = () => {
  const scrollTop = lastY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
  progressRoot.style.setProperty("--progress", progress.toFixed(4));

  if (!prefersReducedMotion) {
    const viewportCenter = window.innerHeight / 2;
    backdropLayers.forEach((layer) => {
      const host = layer.parentElement;
      const rect = host.getBoundingClientRect();
      const speed = Number(layer.dataset.speed || 0);
      const delta = (rect.top + rect.height / 2 - viewportCenter) * speed;
      layer.style.transform = `translate3d(0, ${delta.toFixed(2)}px, 0)`;
    });
  }

  let activeSectionId = sections[0]?.id;
  let smallestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const anchorDistance = Math.abs(rect.top - 120);
    if (anchorDistance < smallestDistance) {
      smallestDistance = anchorDistance;
      activeSectionId = section.id;
    }
  });

  if (activeSectionId) {
    setActiveNav(activeSectionId);
  }

  rafScheduled = false;
};

const onScroll = () => {
  lastY = window.scrollY;
  if (!rafScheduled) {
    rafScheduled = true;
    window.requestAnimationFrame(updateScene);
  }
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
updateScene();
