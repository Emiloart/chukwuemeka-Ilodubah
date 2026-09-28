(() => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const backToTop = document.querySelector(".back-to-top");
  const year = document.querySelector("#year");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = new Date().getFullYear();

  const updateScrollState = () => {
    const y = window.scrollY || 0;
    header?.classList.toggle("is-scrolled", y > 12);
    backToTop?.classList.toggle("visible", y > 520);
  };
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  const closeMenu = () => {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
    nav?.classList.remove("is-open");
  };

  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav?.classList.toggle("is-open", open);
  });

  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", event => {
    if (!nav?.classList.contains("is-open")) return;
    if (!nav.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Low-contrast ambient canvas. It stays decorative and avoids competing with the content.
  const canvas = document.querySelector(".field-canvas");
  const context = canvas?.getContext("2d", { alpha: true });
  if (!canvas || !context || reducedMotion) return;

  let width = 0;
  let height = 0;
  let points = [];
  let frame = 0;
  let pointer = { x: -1000, y: -1000 };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const spacing = width < 700 ? 88 : 112;
    points = [];
    for (let x = 24; x < width; x += spacing) {
      for (let y = 30; y < height; y += spacing) {
        points.push({ x: x + (Math.random() - .5) * 20, y: y + (Math.random() - .5) * 20 });
      }
    }
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    const maxDistance = width < 700 ? 105 : 138;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const dx = pointer.x - a.x;
      const dy = pointer.y - a.y;
      const distanceToPointer = Math.hypot(dx, dy);
      const influence = Math.max(0, 1 - distanceToPointer / 210);
      const px = a.x + (distanceToPointer < 210 ? dx * influence * .035 : 0);
      const py = a.y + (distanceToPointer < 210 ? dy * influence * .035 : 0);
      context.beginPath();
      context.arc(px, py, 1 + influence * 1.1, 0, Math.PI * 2);
      context.fillStyle = `rgba(110,126,112,${.17 + influence * .2})`;
      context.fill();
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j];
        const distance = Math.hypot(px - b.x, py - b.y);
        if (distance < maxDistance) {
          context.beginPath();
          context.moveTo(px, py);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(110,126,112,${(1 - distance / maxDistance) * .075})`;
          context.lineWidth = .7;
          context.stroke();
        }
      }
    }
    frame = requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", event => {
    pointer = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  window.addEventListener("pointerleave", () => { pointer = { x: -1000, y: -1000 }; });
  resize();
  draw();
  window.addEventListener("pagehide", () => cancelAnimationFrame(frame), { once: true });
})();