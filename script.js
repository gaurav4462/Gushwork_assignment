/**
 * MANGALAM HDPE PIPES — script.js
 * Production-quality JavaScript: carousel, zoom, sticky header,
 * FAQ accordion, process tabs, mobile menu, and form handling.
 */

'use strict';


(function initStickyHeader() {
  const header   = document.getElementById('stickyHeader');
  const mainNav  = document.getElementById('mainNav');
  if (!header || !mainNav) return;

  let lastScrollY   = 0;
  let ticking       = false;
  let headerVisible = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  function updateHeader() {
    const currentY = window.scrollY;
    // Determine the bottom of the first fold (main nav bottom)
    const threshold = mainNav.getBoundingClientRect().bottom + currentY;

    const shouldShow = currentY > threshold && currentY > lastScrollY - 50;
    const shouldHide = currentY < threshold || currentY < 80;

    if (shouldHide && headerVisible) {
      header.classList.remove('is-visible');
      headerVisible = false;
    } else if (!shouldHide && currentY > threshold && !headerVisible) {
      header.classList.add('is-visible');
      headerVisible = true;
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* 2. MOBILE MENU (hamburger) */
(function initMobileMenu() {
  const burger = document.getElementById('burgerBtn');
  const menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
    burger.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      menu.style.display = 'flex';
      // Force reflow before adding class for transition
      void menu.offsetHeight;
      menu.classList.add('is-open');
      // Animate burger → ✕
      const spans = burger.querySelectorAll('span');
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      menu.classList.remove('is-open');
      const spans = burger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
      // Hide after transition
      setTimeout(() => { if (!isOpen) menu.style.display = 'none'; }, 300);
    }
  }

  burger.addEventListener('click', toggleMenu);

  // Close menu when a link is clicked
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggleMenu();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) toggleMenu();
  });
})();


/* 
   3. IMAGE CAROUSEL WITH ZOOM
   - Next/Previous navigation
   - Thumbnail navigation
   - Keyboard support (arrow keys)
   - Hover zoom (desktop) with cursor-following lens
   - Tap fallback (mobile) — shows next slide on tap
   */
(function initCarousel() {
  const track        = document.getElementById('carouselTrack');
  const prevBtn      = document.getElementById('prevBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const thumbButtons = document.querySelectorAll('.carousel__thumb');
  const zoomLens     = document.getElementById('zoomLens');
  const zoomPreview  = document.getElementById('zoomPreview');
  const trackWrapper = document.querySelector('.carousel__track-wrapper');

  if (!track || !prevBtn || !nextBtn) return;

  const slides     = track.querySelectorAll('.carousel__slide');
  const totalSlides = slides.length;
  let currentIndex  = 0;
  let isAnimating   = false;

  // Zoom config
  const ZOOM_FACTOR = 3;        // how much to zoom in
  const LENS_W      = 100;      // lens box width (px)
  const LENS_H      = 100;      // lens box height (px)
  let zoomActive    = false;

  /* Navigation  */

  /**
   * Move to a specific slide index.
   * @param {number} index - target slide index
   */
  function goTo(index) {
    if (isAnimating) return;
    const targetIndex = ((index % totalSlides) + totalSlides) % totalSlides;
    const shouldSkipAnimation = targetIndex === currentIndex;

    currentIndex = targetIndex;
    isAnimating  = true;

    // Slide the track
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update thumbnails
    thumbButtons.forEach((thumb, i) => {
      const active = i === currentIndex;
      thumb.classList.toggle('active', active);
      thumb.setAttribute('aria-pressed', String(active));
    });

    // Update ARIA for slides
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', String(i !== currentIndex));
    });

    // If the same slide is already active, there will be no transition event.
    if (shouldSkipAnimation) {
      isAnimating = false;
    } else {
      track.addEventListener('transitionend', function reset() {
        isAnimating = false;
        track.removeEventListener('transitionend', reset);
      }, { once: true });
    }

    // Reinitialise zoom for new active slide
    zoomLeave();
  }

  /** Move to next slide */
  function next() { goTo(currentIndex + 1); }

  /** Move to previous slide */
  function prev() { goTo(currentIndex - 1); }

  // Button listeners
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Thumbnail listeners
  thumbButtons.forEach((thumb) => {
    thumb.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(thumb.dataset.index, 10);
      goTo(index);
    });
  });

  // Keyboard: arrow keys
  document.addEventListener('keydown', e => {
    // Only if carousel area is focused or no input is focused
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  /* Touch / Swipe support  */
  let touchStartX = 0;
  let touchDeltaX = 0;

  trackWrapper.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchDeltaX = 0;
  }, { passive: true });

  trackWrapper.addEventListener('touchmove', e => {
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  trackWrapper.addEventListener('touchend', () => {
    if (Math.abs(touchDeltaX) > 40) {
      touchDeltaX < 0 ? next() : prev();
    }
  });

  /* Auto-play  */
  let autoPlayTimer = setInterval(next, 4500);

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(next, 4500);
  }

  prevBtn.addEventListener('click', resetAutoPlay);
  nextBtn.addEventListener('click', resetAutoPlay);
  thumbButtons.forEach(t => t.addEventListener('click', resetAutoPlay));

  // Pause on hover
  trackWrapper.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
  trackWrapper.addEventListener('mouseleave', () => {
    autoPlayTimer = setInterval(next, 4500);
  });

  /* Zoom: desktop hover  */

  /**
   * Get the active slide's image element.
   */
  function getActiveImg() {
    return slides[currentIndex].querySelector('.carousel__img');
  }

  /**
   * Move the zoom lens and update the preview background position
   * based on cursor position inside the image.
   */
  function zoomMove(e) {
    if (!zoomActive) return;

    const img    = getActiveImg();
    const rect   = img.getBoundingClientRect();

    // Calculate cursor offset within image
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp lens position so it stays inside the image
    let lensX = x - LENS_W / 2;
    let lensY = y - LENS_H / 2;
    lensX = Math.max(0, Math.min(lensX, rect.width  - LENS_W));
    lensY = Math.max(0, Math.min(lensY, rect.height - LENS_H));

    // Position the lens overlay
    zoomLens.style.left   = `${lensX}px`;
    zoomLens.style.top    = `${lensY}px`;
    zoomLens.style.width  = `${LENS_W}px`;
    zoomLens.style.height = `${LENS_H}px`;

    // Calculate background position for preview panel
    // Preview size is 280×280, showing ZOOM_FACTOR × lens area
    const bgW = rect.width  * ZOOM_FACTOR;
    const bgH = rect.height * ZOOM_FACTOR;
    const bgX = -(lensX * ZOOM_FACTOR);
    const bgY = -(lensY * ZOOM_FACTOR);

    zoomPreview.style.backgroundSize     = `${bgW}px ${bgH}px`;
    zoomPreview.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }

  function zoomEnter(e) {
    // Only on desktop (pointer: fine)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const img = getActiveImg();
    if (!img) return;

    zoomActive = true;
    zoomLens.classList.add('active');

    // Set preview image source
    zoomPreview.style.backgroundImage = `url('${img.src}')`;
    zoomPreview.style.display = 'block';

    zoomMove(e);
  }

  function zoomLeave() {
    zoomActive = false;
    zoomLens.classList.remove('active');
    if (zoomPreview) zoomPreview.style.display = 'none';
  }

  if (trackWrapper) {
    trackWrapper.addEventListener('mouseenter', zoomEnter);
    trackWrapper.addEventListener('mousemove',  zoomMove);
    trackWrapper.addEventListener('mouseleave', zoomLeave);
  }

  /*  Initial state */
  goTo(0);
})();


/* 
   4. FAQ ACCORDION
   */
(function initFAQ() {
  const toggles = document.querySelectorAll('.faq-toggle');
  if (!toggles.length) return;

  toggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      const answerId = this.getAttribute('aria-controls');
      const answer   = document.getElementById(answerId);
      if (!answer) return;

      // Collapse all others (accordion behaviour)
      toggles.forEach(t => {
        if (t !== toggle) {
          t.setAttribute('aria-expanded', 'false');
          const a = document.getElementById(t.getAttribute('aria-controls'));
          if (a) {
            a.hidden = true;
            a.style.maxHeight = '';
          }
        }
      });

      // Toggle this one
      const newExpanded = !expanded;
      this.setAttribute('aria-expanded', String(newExpanded));

      if (newExpanded) {
        answer.hidden = false;
        // Animate open: set maxHeight from 0 to scrollHeight
        answer.style.maxHeight = '0';
        answer.style.overflow  = 'hidden';
        answer.style.transition = 'max-height 0.3s ease';
        requestAnimationFrame(() => {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        });
        answer.addEventListener('transitionend', function onEnd() {
          answer.style.maxHeight = 'none';
          answer.style.overflow  = '';
          answer.removeEventListener('transitionend', onEnd);
        }, { once: true });
      } else {
        // Animate close
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.overflow  = 'hidden';
        answer.style.transition = 'max-height 0.3s ease';
        requestAnimationFrame(() => {
          answer.style.maxHeight = '0';
        });
        answer.addEventListener('transitionend', function onEnd() {
          answer.hidden = true;
          answer.style.maxHeight = '';
          answer.style.overflow  = '';
          answer.removeEventListener('transitionend', onEnd);
        }, { once: true });
      }
    });

    // Keyboard support: Enter / Space
    toggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
})();


/* 
   5. MANUFACTURING PROCESS TABS
    */
(function initProcessTabs() {
  const tabs   = document.querySelectorAll('.process-tab');
  const panels = document.querySelectorAll('.process-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Deactivate all
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.add('hidden'));

      // Activate clicked
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      const targetId  = this.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.remove('hidden');
    });

    // Keyboard: arrow keys for tab navigation
    tab.addEventListener('keydown', function(e) {
      const tabArray = Array.from(tabs);
      const idx = tabArray.indexOf(this);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        tabArray[(idx + 1) % tabArray.length].focus();
        tabArray[(idx + 1) % tabArray.length].click();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tabArray[(idx - 1 + tabArray.length) % tabArray.length].focus();
        tabArray[(idx - 1 + tabArray.length) % tabArray.length].click();
      }
    });
  });
})();


/* 
   6. SCROLL REVEAL (Intersection Observer)
   Subtle fade-in as sections enter the viewport.
 */
(function initScrollReveal() {
  // Check for browser support
  if (!('IntersectionObserver' in window)) return;

  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .reveal.revealed {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  const targets = [
    '.feature-card',
    '.testimonial-card',
    '.portfolio-card',
    '.industry-card',
    '.specs-table',
    '.faq-item',
    '.resource-link',
    '.trust-logo',
    '.process-panel',
  ].join(',');

  const elements = document.querySelectorAll(targets);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  elements.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger sibling cards
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    observer.observe(el);
  });
})();


/* 
   7. SMOOTH SCROLLING (polyfill for older browsers)
   */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* 
   8. TOAST NOTIFICATION HELPER
    */
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className   = 'toast' + (type ? ' toast--' + type : '');

  // Force reflow
  void toast.offsetHeight;
  toast.classList.add('is-visible');

  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3500);
}


/* 
   9. FORM HANDLERS
   */

/**
 * Handle catalogue email form submission.
 */
function handleCatalogueSubmit(e) {
  const input = document.getElementById('catalogueEmail');
  if (!input) return;

  const email = input.value.trim();
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address.', '');
    input.focus();
    return;
  }

  // Simulate API call
  showToast('✅ Catalogue sent! Check your inbox.', 'success');
  input.value = '';
}

/**
 * Handle contact / consultation form submission.
 */
function handleContactSubmit(e) {
  const name    = document.getElementById('contactName');
  const email   = document.getElementById('contactEmail');
  const company = document.getElementById('contactCompany');

  if (!name || !email || !company) return;

  if (!name.value.trim()) {
    showToast('Please enter your full name.', '');
    name.focus(); return;
  }
  if (!isValidEmail(email.value)) {
    showToast('Please enter a valid email address.', '');
    email.focus(); return;
  }

  // Simulate API call
  showToast('🎉 Request sent! Our team will contact you within 24 hours.', 'success');
  [name, email, company, document.getElementById('contactPhone')]
    .forEach(f => { if (f) f.value = ''; });
}

/**
 * Simple email validation helper.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* 
   10. STICKY HEADER — Enhanced scroll-up hide behaviour
   Hides when user scrolls up quickly (better UX on mobile).
   */
(function initScrollDirection() {
  const header = document.getElementById('stickyHeader');
  if (!header) return;

  let prevY   = window.scrollY;
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currY = window.scrollY;

        // If scrolled back near the top, always hide
        if (currY < 120) {
          header.classList.remove('is-visible');
          prevY = currY;
          ticking = false;
          return;
        }

        // Scrolling UP → hide header so content is readable
        // Scrolling DOWN → show header
        // (The first initStickyHeader handles the threshold logic;
        //  this refinement adds hide-on-up-scroll for UX)
        if (currY < prevY - 10) {
          // Scrolling up — keep visible (user wants to navigate)
          // intentionally do nothing here — header stays shown
        }

        prevY   = currY;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* 
   11. HERO SECTION — Parallax subtle effect (desktop only)
   */
(function initParallax() {
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight * 1.5) {
      hero.style.backgroundPositionY = `${scrollY * 0.3}px`;
    }
  }, { passive: true });
})();


/* 
   12. ACCESSIBILITY: trap focus in mobile menu when open
   */
(function initFocusTrap() {
  const menu   = document.getElementById('mobileMenu');
  const burger = document.getElementById('burgerBtn');
  if (!menu || !burger) return;

  document.addEventListener('keydown', function(e) {
    if (!menu.classList.contains('is-open')) return;
    if (e.key !== 'Tab') return;

    const focusable = menu.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
