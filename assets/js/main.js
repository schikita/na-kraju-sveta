// assets/js/main.js
(function () {
  'use strict';

  const preloader    = document.getElementById('preloader');
  const backToTopBtn = document.getElementById('backToTop');
  const header       = document.querySelector('.header');
  const heroSection  = document.getElementById('hero');
  const burgerBtn    = document.querySelector('.header__burger');
  const supportsIO   = 'IntersectionObserver' in window;

  // ============================
  // PRELOADER: скрываем, когда готов hero-bg
  // ============================
  (function initPreloader() {
    if (!preloader || !heroSection) return;

    const heroBg = heroSection.dataset.heroBg;

    const hidePreloader = () => {
      if (!preloader) return;
      preloader.classList.add('preloader--hidden');
      setTimeout(() => {
        if (preloader && preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 400); // синхронно с transition в CSS
    };

    if (!heroBg) {
      hidePreloader();
      return;
    }

    const img = new Image();
    img.onload = hidePreloader;
    img.onerror = hidePreloader;
    img.src = heroBg;

    // если картинка уже в кэше
    if (img.complete) {
      hidePreloader();
    }

    // возврат из bfcache
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) hidePreloader();
    });
  })();

  // ============================
  // BACK TO TOP
  // ============================
  (function initBackToTop() {
    if (!backToTopBtn) return;
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  // ============================
  // HAMBURGER MENU
  // ============================
  (function initHamburger() {
    if (!burgerBtn || !header) return;

    burgerBtn.addEventListener('click', () => {
      header.classList.toggle('is-open');
    });

    document.querySelectorAll('.header__nav .nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        header.classList.remove('is-open');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        header.classList.remove('is-open');
      }
    });
  })();

  // ============================
  // SMOOTH SCROLL NAVIGATION
  // ============================
  (function initSmoothScrollNav() {
    const navButtons = document.querySelectorAll('.js-scroll-to');
    if (!navButtons.length) return;

    const headerHeight = header ? header.offsetHeight : 80;

    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        if (!targetId) return;
        const target = document.querySelector(targetId);
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const offset = window.scrollY + rect.top - headerHeight;

        window.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
      });
    });
  })();

  // ============================
  // REVEAL ON SCROLL
  // ============================
  (function initRevealOnScroll() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!elements.length) return;

    if (supportsIO) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const delay = Math.random() * 100;
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, delay);
            obs.unobserve(entry.target);
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      elements.forEach((el) => observer.observe(el));
    } else {
      elements.forEach((el) => el.classList.add('is-visible'));
    }
  })();

  // ============================
  // PARALLAX
  // ============================
  const parallaxSections = document.querySelectorAll('[data-parallax]');
  const parallaxItems = [];

  (function initParallax() {
    if (!parallaxSections.length) return;

    parallaxSections.forEach((section) => {
      const speed = parseFloat(section.dataset.parallaxSpeed) || 0.3;
      parallaxItems.push({
        el: section,
        speed,
        offsetTop: section.offsetTop,
      });
    });

    window.addEventListener('resize', () => {
      parallaxItems.forEach((item) => {
        item.offsetTop = item.el.offsetTop;
      });
      onScrollFrame(lastScrollY);
    });
  })();

  function updateParallax(scrollY) {
    if (!parallaxItems.length) return;
    for (let i = 0; i < parallaxItems.length; i++) {
      const item = parallaxItems[i];
      const yPos = (scrollY - item.offsetTop) * item.speed;
      item.el.style.backgroundPosition = `center calc(50% + ${yPos}px)`;
    }
  }

  // ============================
  // HEADER BACKGROUND (solid на скролле)
  // ============================
  let useHeaderScrollFallback = false;

  (function initHeaderBackground() {
    if (!header || !heroSection) return;

    if (supportsIO) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              header.classList.remove('header--solid');
            } else {
              header.classList.add('header--solid');
            }
          });
        },
        { threshold: 0.4 }
      );
      heroObserver.observe(heroSection);
    } else {
      useHeaderScrollFallback = true;
    }
  })();

  // ============================
  // ГЛОБАЛЬНЫЙ SCROLL (RAF-оптимизация)
  // ============================
  document.documentElement.style.scrollBehavior = 'smooth';

  let ticking = false;
  let lastScrollY =
    window.pageYOffset || document.documentElement.scrollTop || 0;

  function onScrollFrame(scrollY) {
    // back-to-top visibility
    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }

    // header fallback, если нет IntersectionObserver
    if (useHeaderScrollFallback && header) {
      if (scrollY > 80) {
        header.classList.add('header--solid');
      } else {
        header.classList.remove('header--solid');
      }
    }

    // parallax
    updateParallax(scrollY);
  }

  window.addEventListener(
    'scroll',
    () => {
      lastScrollY =
        window.pageYOffset || document.documentElement.scrollTop || 0;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          onScrollFrame(lastScrollY);
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // начальное состояние
  onScrollFrame(lastScrollY);

  // ============================
  // ACCESSIBILITY: FOCUS VISIBLE
  // ============================
  (function initFocusVisible() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard');
    });
  })();

  // ============================
  // MOBILE VH FIX
  // ============================
  (function initVH() {
    function setVH() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setVH();
    window.addEventListener('resize', setVH);
  })();

  // ============================
  // КАРУСЕЛЬ ПРОЕКТОВ
  // ============================
  (function setupProjectsCarousel() {
    const viewport = document.querySelector('#projects .projects-viewport');
    if (!viewport) return;

    const stage = viewport.querySelector('.projects-stage');
    if (!stage) return;

    const cards = Array.from(stage.querySelectorAll('.project-card'));
    if (!cards.length) return;

    const dotsWrap = viewport.querySelector('.pr-dots');
    const prevBtn = viewport.querySelector('.prev');
    const nextBtn = viewport.querySelector('.next');

    let i = 0;
    let timer = null;
    const interval = +(viewport.dataset.interval || 5000);
    const autoplay = viewport.dataset.autoplay !== 'false';
    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    dotsWrap.innerHTML = cards.map(() => '<i></i>').join('');
    const dots = Array.from(dotsWrap.children);

    const show = (idx) => {
      i = (idx + cards.length) % cards.length;
      cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    };

    const next = () => show(i + 1);
    const prev = () => show(i - 1);

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const play = () => {
      if (reduce || !autoplay) return;
      stop();
      timer = setInterval(next, interval);
    };

    show(0);
    play();

    nextBtn &&
      nextBtn.addEventListener('click', () => {
        next();
        play();
      });
    prevBtn &&
      prevBtn.addEventListener('click', () => {
        prev();
        play();
      });

    dotsWrap.addEventListener('click', (e) => {
      const idx = dots.indexOf(e.target);
      if (idx > -1) {
        show(idx);
        play();
      }
    });

    viewport.addEventListener('mouseenter', stop);
    viewport.addEventListener('mouseleave', play);
    viewport.addEventListener('focusin', stop);
    viewport.addEventListener('focusout', play);

    if (supportsIO) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target !== viewport) return;
            if (entry.isIntersecting) {
              play();
            } else {
              stop();
            }
          });
        },
        { threshold: 0.2 }
      );
      sectionObserver.observe(viewport);
    }
  })();

  // ============================
  // PHOTO SLIDERS (3 секции)
  // ============================
  (function initPhotoSliders() {
    const sliders = document.querySelectorAll('.photo-slider');
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const track = slider.querySelector('.slider-track');
      if (!track) return;

      const slides = Array.from(track.querySelectorAll('img'));
      if (slides.length <= 1) return;

      const prevBtn = slider.querySelector('.slider-btn.prev');
      const nextBtn = slider.querySelector('.slider-btn.next');

      let index = 0;

      const goTo = (i) => {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
      };

      prevBtn &&
        prevBtn.addEventListener('click', () => {
          goTo(index - 1);
        });
      nextBtn &&
        nextBtn.addEventListener('click', () => {
          goTo(index + 1);
        });

      goTo(0);

      // Свайпы для мобилки/планшета
      let startX = 0;
      let startY = 0;
      let isSwiping = false;
      const SWIPE_THRESHOLD = 50;

      const getPoint = (e) => {
        if (e.touches && e.touches[0]) return e.touches[0];
        if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0];
        return e;
      };

      const onTouchStart = (e) => {
        if (window.innerWidth > 1024) return;
        const p = getPoint(e);
        startX = p.clientX;
        startY = p.clientY;
        isSwiping = true;
      };

      const onTouchMove = (e) => {
        if (!isSwiping) return;
        const p = getPoint(e);
        const dx = p.clientX - startX;
        const dy = p.clientY - startY;

        if (Math.abs(dy) > Math.abs(dx)) return;
        if (Math.abs(dx) > 10) {
          e.preventDefault();
        }
      };

      const onTouchEnd = (e) => {
        if (!isSwiping) return;
        isSwiping = false;

        const p = getPoint(e);
        const dx = p.clientX - startX;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;

        if (dx < 0) {
          goTo(index + 1);
        } else {
          goTo(index - 1);
        }
      };

      slider.addEventListener('touchstart', onTouchStart, { passive: true });
      slider.addEventListener('touchmove', onTouchMove, { passive: false });
      slider.addEventListener('touchend', onTouchEnd);
      slider.addEventListener('touchcancel', onTouchEnd);
    });
  })();

  // ============================
  // LAZY BACKGROUNDS + IMG POLYFILL
  // ============================
  (function initLazyMedia() {
    const lazyBgElems = document.querySelectorAll('[data-bg-src]');
    if (supportsIO && lazyBgElems.length) {
      const bgObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const src = el.dataset.bgSrc;
            if (!src) return;
            el.style.backgroundImage = `url("${src}")`;
            el.removeAttribute('data-bg-src');
            obs.unobserve(el);
          });
        },
        {
          root: null,
          rootMargin: '200px 0px',
          threshold: 0.01,
        }
      );
      lazyBgElems.forEach((el) => bgObserver.observe(el));
    } else {
      lazyBgElems.forEach((el) => {
        const src = el.dataset.bgSrc;
        if (!src) return;
        el.style.backgroundImage = `url("${src}")`;
        el.removeAttribute('data-bg-src');
      });
    }

    // Полифилл для loading="lazy" в <img>
    if (!('loading' in HTMLImageElement.prototype)) {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      if (supportsIO && lazyImages.length) {
        const imgObserver = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const img = entry.target;
              if (img.dataset.src && !img.src) {
                img.src = img.dataset.src;
              }
              img.removeAttribute('loading');
              obs.unobserve(img);
            });
          },
          {
            root: null,
            rootMargin: '200px 0px',
            threshold: 0.01,
          }
        );
        lazyImages.forEach((img) => imgObserver.observe(img));
      } else {
        lazyImages.forEach((img) => {
          if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
          }
          img.removeAttribute('loading');
        });
      }
    }
  })();
})();
