const header = document.querySelector("#site-header");
const panels = Array.from(document.querySelectorAll("[data-panel]"));
const progressDots = Array.from(document.querySelectorAll(".progress-dot"));
const counters = Array.from(document.querySelectorAll("[data-count]"));
const parallaxNodes = Array.from(document.querySelectorAll("[data-parallax]"));
const menuToggle = document.querySelector(".menu-toggle");
const mobileNavShell = document.querySelector("#mobile-nav");
const menuCloseTriggers = document.querySelectorAll("[data-close-menu]");
const drawer = document.querySelector("#upload-drawer");
const uploadTriggers = document.querySelectorAll("[data-open-upload]");
const closeTriggers = document.querySelectorAll("[data-close-upload]");
const uploadForm = document.querySelector("#upload-form");
const evidenceGrid = document.querySelector("#evidence-grid");
const uploadFeedback = document.querySelector("#upload-feedback");
const lightbox = document.querySelector("#lightbox");
const lightboxMedia = document.querySelector("#lightbox-media");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxDescription = document.querySelector("#lightbox-description");
const resumeLinks = Array.from(document.querySelectorAll("#resume-download, #resume-download-footer"));
const projectJumpLinks = Array.from(document.querySelectorAll(".project-jump-list a"));
const defaultResumePath = "./assets/Liang-Jiyun-Resume.pdf";

let resumeUrl = "";

const syncOverlayState = () => {
  const hasOverlayOpen = mobileNavShell?.classList.contains("is-open") || drawer?.classList.contains("is-open") || lightbox?.open;
  document.body.classList.toggle("has-overlay-open", Boolean(hasOverlayOpen));
};

const formatCount = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M+`;
  if (value >= 10000) return `${Math.round(value / 1000) / 10}万+`;
  return `${value}+`;
};

const animateCounter = (node) => {
  if (node.dataset.animated === "true") return;

  const target = Number(node.dataset.count || "0");
  const start = performance.now();
  const duration = 1300;

  node.dataset.animated = "true";

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);

    node.textContent = formatCount(value);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const activePanelObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;
      if (id) {
        panels.forEach((panel) => panel.classList.toggle("active-panel", panel.id === id));

        progressDots.forEach((dot) => {
          const dotTarget = dot.getAttribute("href");
          const active = dotTarget === `#${id}` || (id.startsWith("project-") && dotTarget === "#projects");
          dot.classList.toggle("is-active", active);
        });

        projectJumpLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("is-active", active);
        });
      }

      entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
    });
  },
  { threshold: 0.55 }
);

panels.forEach((panel) => activePanelObserver.observe(panel));

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);

  parallaxNodes.forEach((node) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = node.parentElement.getBoundingClientRect();
    const offset = rect.top * Number(node.dataset.parallax || "0");
    node.style.transform = `translateY(${offset}px) scale(1.04)`;
  });
});

const openMenu = () => {
  mobileNavShell?.classList.add("is-open");
  mobileNavShell?.setAttribute("aria-hidden", "false");
  menuToggle?.setAttribute("aria-expanded", "true");
  syncOverlayState();
};

const closeMenu = () => {
  mobileNavShell?.classList.remove("is-open");
  mobileNavShell?.setAttribute("aria-hidden", "true");
  menuToggle?.setAttribute("aria-expanded", "false");
  syncOverlayState();
};

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileNavShell?.classList.contains("is-open");
  if (isOpen) closeMenu();
  else openMenu();
});

menuCloseTriggers.forEach((trigger) => trigger.addEventListener("click", closeMenu));

const openUpload = () => {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  closeMenu();
  syncOverlayState();
};

const closeUpload = () => {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  syncOverlayState();
};

uploadTriggers.forEach((trigger) => trigger.addEventListener("click", openUpload));
closeTriggers.forEach((trigger) => trigger.addEventListener("click", closeUpload));

const updateResumeLinks = (url) => {
  resumeLinks.forEach((link) => {
    link.href = url || "#";
    link.download = url ? "梁继匀-简历.pdf" : "";
    link.onclick = url
      ? null
      : (event) => {
          event.preventDefault();
          openUpload();
        };
  });
};

updateResumeLinks("");
updateResumeLinks(defaultResumePath);

const setHeroImage = (src) => {
  document.body.style.setProperty(
    "--hero-image-layer",
    `linear-gradient(125deg, rgba(0, 0, 0, 0.46), rgba(0, 0, 0, 0.2)), url("${src}")`
  );
};

const createUploadedEvidenceCard = ({ src, title, description, type }) => {
  const button = document.createElement("button");
  button.type = "button";
  const layoutClass = type === "article" || type === "cover" ? " evidence-card-wide" : "";
  const typeClass = type === "qr" ? " evidence-card-qr" : "";
  button.className = `evidence-card uploaded-evidence${layoutClass}${typeClass}`;
  button.dataset.lightboxTitle = title;
  button.dataset.lightboxDescription = description;
  button.dataset.imageSrc = src;

  button.innerHTML = `
    <span class="evidence-bg" style="background-image: linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.4)), url('${src}'); background-size: cover; background-position: center;"></span>
    <span class="evidence-caption">
      <strong>${title}</strong>
      <em>${description}</em>
    </span>
  `;

  evidenceGrid.prepend(button);
};

uploadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const materialType = document.querySelector("#upload-type").value;
  const project = document.querySelector("#upload-project").value;
  const imageInput = document.querySelector("#image-upload");
  const pdfInput = document.querySelector("#pdf-upload");

  let imageCount = 0;

  if (imageInput.files?.length) {
    for (const file of imageInput.files) {
      const src = URL.createObjectURL(file);

      if (materialType === "avatar") {
        setHeroImage(src);
      }

      createUploadedEvidenceCard({
        src,
        title: `${project} / ${file.name}`,
        description:
          materialType === "qr"
            ? "扫码查看作品 · 已自动加入 Evidence 作品证据墙"
            : materialType === "data"
              ? "数据证据截图 · 已自动加入 Evidence 作品证据墙"
              : materialType === "article"
                ? "推文截图 / 图文内容 · 已自动加入 Evidence 作品证据墙"
              : materialType === "avatar"
                ? "头像 / Hero 背景图 · 同时已替换首屏视觉"
                : materialType === "cover"
                  ? "作品封面 / 视觉概念图 · 已自动加入 Evidence 作品证据墙"
                : "用户新上传材料 · 已自动加入 Evidence 作品证据墙",
        type: materialType,
      });
      imageCount += 1;
    }
  }

  if (pdfInput.files?.[0]) {
    if (resumeUrl) URL.revokeObjectURL(resumeUrl);
    resumeUrl = URL.createObjectURL(pdfInput.files[0]);
    updateResumeLinks(resumeUrl);
  }

  uploadFeedback.textContent = `已加入 ${imageCount} 张图片${pdfInput.files?.[0] ? "，并更新 PDF 简历下载按钮" : ""}。`;

  uploadForm.reset();
  closeUpload();
});

const openLightbox = (card) => {
  const imageSrc = card.dataset.imageSrc;
  const title = card.dataset.lightboxTitle || "作品预览";
  const description = card.dataset.lightboxDescription || "点击查看详情";

  lightboxTitle.textContent = title;
  lightboxDescription.textContent = description;

  if (imageSrc) {
    lightboxMedia.innerHTML = `<img src="${imageSrc}" alt="${title}" />`;
  } else {
    const bgNode = card.querySelector(".evidence-bg");
    const backgroundImage = bgNode ? getComputedStyle(bgNode).backgroundImage : "";
    lightboxMedia.innerHTML = `
      <div
        style="
          width:100%;
          height:100%;
          background-image:${backgroundImage};
          background-size:cover;
          background-position:center;
        "
      ></div>
    `;
  }

  if (!lightbox.open) lightbox.showModal();
};

document.addEventListener("click", (event) => {
  const card = event.target.closest(".evidence-card");
  if (card) {
    openLightbox(card);
  }

  if (event.target.matches(".lightbox-close")) {
    lightbox.close();
  }
});

lightbox?.addEventListener("click", (event) => {
  const rect = lightbox.getBoundingClientRect();
  const clickedOutside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (clickedOutside) lightbox.close();
});

lightbox?.addEventListener("close", syncOverlayState);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (lightbox?.open) lightbox.close();
    closeUpload();
    closeMenu();
  }
});
