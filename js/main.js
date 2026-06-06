const GOOGLE_SHEET_URL = "YOUR_APPS_SCRIPT_URL_HERE";

/* ==========================================================================
   ACTIVE PAGE NAV — highlight current page in navbar
   ========================================================================== */
function initActivePageNav() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) return;

  document.querySelectorAll(".nav-link[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === currentPage);
  });
}

/* ==========================================================================
   SMOOTH SCROLL — same-page anchor links only
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navbar = document.getElementById("navbar");
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* ==========================================================================
   NAVBAR SCROLL BEHAVIOR
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const isInnerPage = document.body.classList.contains("page-inner");

  const updateNavbar = () => {
    if (isInnerPage || window.scrollY > 60) {
      navbar.classList.add("navbar--scrolled");
    } else {
      navbar.classList.remove("navbar--scrolled");
    }
  };

  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });
}

/* ==========================================================================
   HAMBURGER MENU
   ========================================================================== */
function initHamburgerMenu() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  if (!hamburger || !navMenu) return;

  const navLinks = navMenu.querySelectorAll(".nav-link, .navbar__cta-mobile");

  const closeMenu = () => {
    hamburger.classList.remove("hamburger--open");
    navMenu.classList.remove("navbar__nav--open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("hamburger--open");
    navMenu.classList.toggle("navbar__nav--open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
}

/* ==========================================================================
   INTERSECTION OBSERVER — scroll reveal
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   STATS COUNTER ANIMATION
   ========================================================================== */
function initStatsCounter() {
  const statsBar = document.getElementById("stats");
  if (!statsBar) return;

  const counters = statsBar.querySelectorAll(".stat-item__number");
  let animated = false;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-target"), 10);
    const duration = 1500;
    const startTime = performance.now();

    const tick = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString("en-US");

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString("en-US");
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          counters.forEach(animateCounter);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(statsBar);
}

/* ==========================================================================
   MODAL — package booking
   ========================================================================== */
function initModal() {
  const modal = document.getElementById("booking-modal");
  if (!modal) return;

  const backdrop = document.getElementById("modal-backdrop");
  const closeBtn = document.getElementById("modal-close");
  const interestField = document.getElementById("modal-interest");
  const interestDisplay = document.getElementById("modal-interest-display");
  const packageNameEl = document.getElementById("modal-package-name");
  const bookButtons = document.querySelectorAll(".book-package-btn");

  let lastFocusedElement = null;

  const focusableSelector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const trapFocus = (e) => {
    if (e.key !== "Tab") return;

    const focusable = modal.querySelectorAll(focusableSelector);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const openModal = (packageName) => {
    lastFocusedElement = document.activeElement;
    interestField.value = packageName;
    interestDisplay.value = packageName;
    packageNameEl.textContent = packageName;

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("modal--open"));

    document.body.classList.add("modal-open");
    closeBtn.focus();
    document.addEventListener("keydown", handleKeydown);
    modal.addEventListener("keydown", trapFocus);
  };

  const closeModal = () => {
    modal.classList.remove("modal--open");
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", handleKeydown);
    modal.removeEventListener("keydown", trapFocus);

    setTimeout(() => {
      modal.hidden = true;
      if (lastFocusedElement) lastFocusedElement.focus();
    }, 300);
  };

  const handleKeydown = (e) => {
    if (e.key === "Escape") closeModal();
  };

  bookButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.getAttribute("data-package"));
    });
  });

  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
}

/* ==========================================================================
   FORM SUBMISSION — shared handler for all inquiry forms
   ========================================================================== */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formType = form.getAttribute("data-form-type");
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = form.querySelector(".form-error");
  const originalBtnText = submitBtn.textContent;

  errorEl.hidden = true;

  const formData = new FormData(form);
  const fullName = formData.get("fullName")?.trim();
  const phone = formData.get("phone")?.trim();
  const email = formData.get("email")?.trim();
  const travelers = formData.get("travelers");
  const interest = formData.get("interest")?.trim();
  const message = formData.get("message")?.trim() || "";

  if (!fullName || !phone || !email || !travelers || !interest) {
    errorEl.textContent = "Please fill in all required fields.";
    errorEl.hidden = false;
    return;
  }

  if (!validateEmail(email)) {
    errorEl.textContent = "Please enter a valid email address.";
    errorEl.hidden = false;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  const payload = {
    formType,
    fullName,
    phone,
    email,
    travelers: parseInt(travelers, 10),
    interest,
    message,
    timestamp: new Date().toISOString(),
  };

  try {
    if (GOOGLE_SHEET_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
      await new Promise((resolve) => setTimeout(resolve, 800));
    } else {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.type !== "opaque" && !response.ok) {
        throw new Error("Request failed");
      }
    }

    form.innerHTML =
      '<div class="form-success"><span class="material-icons" aria-hidden="true">check_circle</span><p>Thank you! We\'ll reach out within 24 hours.</p></div>';
  } catch {
    errorEl.textContent = "Something went wrong. Please WhatsApp us directly.";
    errorEl.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
}

function initForms() {
  document.querySelectorAll(".inquiry-form").forEach((form) => {
    form.addEventListener("submit", handleFormSubmit);
  });
}

/* ==========================================================================
   DESTINATION TILE — pre-fill form on click
   ========================================================================== */
function initDestinationTiles() {
  document.querySelectorAll(".destination-tile[data-destination]").forEach((tile) => {
    tile.addEventListener("click", (e) => {
      const destination = tile.dataset.destination;
      const form = document.querySelector(".inquiry-form");
      const interestInput = form?.querySelector('input[name="interest"]');

      if (interestInput && destination) {
        interestInput.value = destination;
      }

      if (form) {
        e.preventDefault();
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        interestInput?.focus();
      }
    });
  });
}

/* ==========================================================================
   SCROLL TO TOP BUTTON
   ========================================================================== */
function initScrollToTop() {
  const scrollTopBtn = document.getElementById("scroll-top");
  if (!scrollTopBtn) return;

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 400) {
        scrollTopBtn.hidden = false;
        scrollTopBtn.classList.add("scroll-top--visible");
      } else {
        scrollTopBtn.classList.remove("scroll-top--visible");
        scrollTopBtn.hidden = true;
      }
    },
    { passive: true }
  );

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ==========================================================================
   INIT
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initActivePageNav();
  initSmoothScroll();
  initNavbarScroll();
  initHamburgerMenu();
  initScrollReveal();
  initStatsCounter();
  initModal();
  initForms();
  initDestinationTiles();
  initScrollToTop();
});
