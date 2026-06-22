const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzWKY8PQfMShp0xp_c51S2uUk1KaGX1KLcLxTwOYxsVywemxcL7isFHXKW09_0fVsqfQA/exec";

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
   HAMBURGER MENU
   ========================================================================== */
function initHamburgerMenu() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  if (!hamburger || !navMenu) return;

  const navLinks = navMenu.querySelectorAll(".nav-link, .navbar__cta-mobile");

  const closeMenu = () => {
    hamburger.classList.remove("hamburger--open");
    navMenu.classList.remove("navbar__island--open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("hamburger--open");
    navMenu.classList.toggle("navbar__island--open", isOpen);
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
  const isBannerForm = form.getAttribute("data-form-variant") === "banner";
  const formType = form.getAttribute("data-form-type");
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = form.querySelector(".form-error");
  const originalBtnHTML = submitBtn.innerHTML;

  errorEl.hidden = true;

  const formData = new FormData(form);
  const fullName = formData.get("fullName")?.trim();
  const phone = formData.get("phone")?.trim();
  const email = formData.get("email")?.trim() || "";
  const travelers = formData.get("travelers");
  const interest = formData.get("interest")?.trim() || formType;
  const message = formData.get("message")?.trim() || "";

  if (!fullName || !phone || !travelers) {
    errorEl.textContent = "Please fill in all required fields.";
    errorEl.hidden = false;
    return;
  }

  if (!isBannerForm) {
    if (!email || !formData.get("interest")?.trim()) {
      errorEl.textContent = "Please fill in all required fields.";
      errorEl.hidden = false;
      return;
    }
    if (!validateEmail(email)) {
      errorEl.textContent = "Please enter a valid email address.";
      errorEl.hidden = false;
      return;
    }
  }

  submitBtn.disabled = true;
  if (isBannerForm) {
    submitBtn.innerHTML = 'Sending...';
  } else {
    submitBtn.textContent = "Sending...";
  }

  const travelersValue = isBannerForm
    ? String(travelers)
    : parseInt(travelers, 10);

  const payload = {
    formType,
    fullName,
    phone,
    email: email || "—",
    travelers: travelersValue,
    interest,
    message: message || (isBannerForm ? "Hero banner inquiry" : ""),
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
    submitBtn.innerHTML = originalBtnHTML;
  }
}

function initForms() {
  document.querySelectorAll(".inquiry-form").forEach((form) => {
    form.addEventListener("submit", handleFormSubmit);
  });
}

/* ==========================================================================
   HERO BANNER — inquiry tabs (home page)
   ========================================================================== */
function initHeroInquiryTabs() {
  const form = document.getElementById("hero-inquiry-form");
  const tabs = document.querySelectorAll(".hero-inquiry__tab");
  if (!form || !tabs.length) return;

  const formTypeInput = form.querySelector('input[name="formType"]');

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const type = tab.getAttribute("data-form-type");

      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      form.setAttribute("data-form-type", type);
      if (formTypeInput) formTypeInput.value = type;
    });
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
   TRAVEL PARTNER SLIDER
   ========================================================================== */
function initTravelPartnerSlider() {
  const track = document.getElementById("travel-partner-track");
  const prevBtn = document.getElementById("travel-partner-prev");
  const nextBtn = document.getElementById("travel-partner-next");
  if (!track || !prevBtn || !nextBtn) return;

  const cards = track.querySelectorAll(".travel-card");
  if (cards.length === 0) return;

  let index = 0;

  const getVisibleCount = () => (window.innerWidth <= 767 ? 1 : 2);

  const getMaxIndex = () => Math.max(0, cards.length - getVisibleCount());

  const updateSlider = () => {
    const maxIndex = getMaxIndex();
    if (index > maxIndex) index = maxIndex;

    const card = cards[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    const offset = index * (card.offsetWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= maxIndex;
  };

  prevBtn.addEventListener("click", () => {
    if (index > 0) {
      index -= 1;
      updateSlider();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (index < getMaxIndex()) {
      index += 1;
      updateSlider();
    }
  });

  window.addEventListener("resize", updateSlider, { passive: true });
  updateSlider();
}

(() => {
  // ── DOM refs ────────────────────────────────────────────────────────────
  const track = document.getElementById('tcarousel-track');
  const prevBtn = document.getElementById('tcarousel-prev');
  const nextBtn = document.getElementById('tcarousel-next');
  const dotsWrap = document.getElementById('tcarousel-dots');

  if (!track || !prevBtn || !nextBtn) return; // guard: section not on page

  const cards = Array.from(track.querySelectorAll('.tcarousel__card'));
  const total = cards.length;

  // Active index = the card currently in the CENTER position
  let active = 0;

  // ── Build dot indicators ─────────────────────────────────────────────────
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'tcarousel__dot';
    dot.setAttribute('aria-label', `Go to review ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll('.tcarousel__dot'));

  // ── Core render function ─────────────────────────────────────────────────
  /**
   * Assigns position classes to each card based on the current `active` index.
   *
   * Position map (wraps around using modulo):
   * active - 1  → left
   * active      → center
   * active + 1  → right
   * everything else → hidden (no position class)
   */
  function render() {
    const leftIdx = (active - 1 + total) % total;
    const rightIdx = (active + 1) % total;

    cards.forEach((card, i) => {
      // Remove all position classes first
      card.classList.remove(
        'tcarousel__card--left',
        'tcarousel__card--center',
        'tcarousel__card--right'
      );

      if (i === active) card.classList.add('tcarousel__card--center');
      else if (i === leftIdx) card.classList.add('tcarousel__card--left');
      else if (i === rightIdx) card.classList.add('tcarousel__card--right');
      // Cards not in these three slots remain in the default hidden state
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('tcarousel__dot--active', i === active);
    });

    // Update ARIA live region (optional — announces to screen readers)
    track.setAttribute('aria-label', `Review ${active + 1} of ${total}`);
  }

  // ── Navigate ─────────────────────────────────────────────────────────────
  function goTo(index) {
    active = (index + total) % total; // always wrap
    render();
  }

  function next() { goTo(active + 1); }
  function prev() { goTo(active - 1); }

  // ── Event listeners ──────────────────────────────────────────────────────
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Clicking a side card navigates to it
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i !== active) goTo(i);
    });
  });

  // Keyboard: left/right arrow keys when carousel is focused
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Optional: auto-advance every 6 seconds, pauses on hover
  let autoTimer = setInterval(next, 6000);

  const carousel = document.querySelector('.tcarousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', () => {
      autoTimer = setInterval(next, 6000);
    });
  }

  // Touch / swipe support for mobile
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {   // 40 px threshold
      diff > 0 ? next() : prev();
    }
  }, { passive: true });

  // ── Init ─────────────────────────────────────────────────────────────────
  render();

})();



/* ==========================================================================
   INIT
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initActivePageNav();
  initSmoothScroll();
  initHamburgerMenu();
  initScrollReveal();
  initStatsCounter();
  initModal();
  initForms();
  initHeroInquiryTabs();
  initDestinationTiles();
  initTravelPartnerSlider();
  initScrollToTop();
});
