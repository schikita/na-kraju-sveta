// ===== PRELOADER =====
const preloader = document.getElementById("preloader");

// Показываем прелоадер при загрузке страницы
window.addEventListener("load", () => {
  // Скрываем прелоадер после загрузки
  setTimeout(() => {
    preloader.classList.add("hidden");
  }, 500);
});

// На случай если страница уже загружена (кэшированная)
if (document.readyState === "complete") {
  preloader.classList.add("hidden");
}

// ===== BACK TO TOP BUTTON =====
const backToTopBtn = document.getElementById("backToTop");
const header = document.querySelector(".header");
const heroSection = document.getElementById("hero");
const burgerBtn = document.querySelector(".header__burger");

// Показываем/скрываем кнопку при скролле
window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
});

// Скролл к верху при клике на кнопку
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// ===== HAMBURGER MENU =====
if (burgerBtn && header) {
  burgerBtn.addEventListener("click", () => {
    header.classList.toggle("is-open");
  });

  // Закрываем меню по клику на пункт навигации
  document.querySelectorAll(".header__nav .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
    });
  });

  // Убираем класс меню при изменении размера окна
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      header.classList.remove("is-open");
    }
  });
}

// ===== SMOOTH SCROLL NAVIGATION =====
document.querySelectorAll(".js-scroll-to").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const target = document.querySelector(targetId);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const headerHeight = header ? header.offsetHeight : 80;
    const offset = window.scrollY + rect.top - headerHeight;
    
    window.scrollTo({
      top: offset,
      behavior: "smooth"
    });
  });
});

// ===== REVEAL ON SCROLL (IntersectionObserver) =====
const revealElements = document.querySelectorAll(".reveal-on-scroll");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Добавляем случайную задержку для каскадного эффекта
          const delay = Math.random() * 100;
          setTimeout(() => {
            entry.target.classList.add("is-visible");
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Fallback для старых браузеров
  revealElements.forEach((el) => el.classList.add("is-visible"));
}

// ===== PARALLAX EFFECT =====
const parallaxSections = document.querySelectorAll("[data-parallax]");

function handleParallax() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  parallaxSections.forEach((section) => {
    const speed = parseFloat(section.dataset.parallaxSpeed) || 0.3;
    const rect = section.getBoundingClientRect();
    const offsetTop = rect.top + scrollTop;
    const yPos = (scrollTop - offsetTop) * speed;

    section.style.backgroundPosition = `center calc(50% + ${yPos}px)`;
  });
}

if (parallaxSections.length) {
  window.addEventListener("scroll", handleParallax, { passive: true });
  handleParallax();
}

// ===== HEADER BACKGROUND ON SCROLL =====
if (header && heroSection && "IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          header.classList.remove("header--solid");
        } else {
          header.classList.add("header--solid");
        }
      });
    },
    { threshold: 0.4 }
  );

  heroObserver.observe(heroSection);
} else if (header) {
  // Fallback: по скроллу
  const onScrollHeader = () => {
    if (window.scrollY > 80) {
      header.classList.add("header--solid");
    } else {
      header.classList.remove("header--solid");
    }
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();
}

// ===== SMOOTH PAGE LOAD ANIMATION =====
document.documentElement.style.scrollBehavior = "smooth";

// ===== CUSTOM SCROLL PERFORMANCE =====
let ticking = false;

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleParallax();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ===== ACCESSIBILITY: FOCUS VISIBLE =====
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    document.body.classList.add("using-keyboard");
  }
});

document.addEventListener("mousedown", () => {
  document.body.classList.remove("using-keyboard");
});

// ===== MOBILE VIEWPORT HEIGHT FIX =====
function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

setVH();
window.addEventListener("resize", setVH);


// ===============================
// КАРУСЕЛЬ ПРОЕКТОВ
// ===============================
(function setupProjectsCarousel() {
  const viewport = document.querySelector('#projects .projects-viewport');
  if (!viewport) return;

  const stage = viewport.querySelector('.projects-stage');
  const cards = [...stage.querySelectorAll('.project-card')];
  if (!cards.length) return;

  const dotsWrap = viewport.querySelector('.pr-dots');
  const prevBtn = viewport.querySelector('.prev');
  const nextBtn = viewport.querySelector('.next');

  let i = 0, timer = null;
  const interval = +(viewport.dataset.interval || 5000);
  const autoplay = viewport.dataset.autoplay !== 'false';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  dotsWrap.innerHTML = cards.map(() => '<i></i>').join('');
  const dots = [...dotsWrap.children];

  const show = (idx) => {
    i = (idx + cards.length) % cards.length;
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
  };

  const next = () => show(i + 1);
  const prev = () => show(i - 1);
  const stop = () => { if (timer) clearInterval(timer); };
  const play = () => {
    if (reduce || !autoplay) return;
    stop();
    timer = setInterval(next, interval);
  };

  show(0);
  play();

  nextBtn?.addEventListener('click', () => { next(); play(); });
  prevBtn?.addEventListener('click', () => { prev(); play(); });
  dotsWrap.addEventListener('click', (e) => {
    const idx = dots.indexOf(e.target);
    if (idx > -1) { show(idx); play(); }
  });

  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', play);
  viewport.addEventListener('focusin', stop);
  viewport.addEventListener('focusout', play);

  // Авто-пауза, когда секция ушла с экрана
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target !== viewport) return;

      if (entry.isIntersecting) {
        play();
      } else {
        stop();
      }
    });
  }, { threshold: 0.2 });

  sectionObserver.observe(viewport);
})();


// SLIDER

document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.photo-slider');

    sliders.forEach(slider => {
        const track   = slider.querySelector('.slider-track');
        const slides  = Array.from(track.querySelectorAll('img'));
        const prevBtn = slider.querySelector('.slider-btn.prev');
        const nextBtn = slider.querySelector('.slider-btn.next');

        if (!track || slides.length <= 1) return;

        let index = 0;

        function goTo(i) {
            index = (i + slides.length) % slides.length;
            track.style.transform = `translateX(-${index * 100}%)`;
        }

        // Клики по стрелкам
        prevBtn?.addEventListener('click', () => goTo(index - 1));
        nextBtn?.addEventListener('click', () => goTo(index + 1));

        goTo(0);

        // ====== СВАЙП ДЛЯ МОБИЛЬНЫХ / ПЛАНШЕТОВ ======
        let startX = 0;
        let startY = 0;
        let isSwiping = false;

        const SWIPE_THRESHOLD = 50; // минимальное смещение по X для свайпа, px

        function getPoint(e) {
            if (e.touches && e.touches[0]) return e.touches[0];
            if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0];
            return e;
        }

        function onTouchStart(e) {
            // Ограничим свайп на ширинах до 1024px (планшет+мобила)
            if (window.innerWidth > 1024) return;

            const p = getPoint(e);
            startX = p.clientX;
            startY = p.clientY;
            isSwiping = true;
        }

        function onTouchMove(e) {
            if (!isSwiping) return;
            const p = getPoint(e);

            const dx = p.clientX - startX;
            const dy = p.clientY - startY;

            // Если жест больше по вертикали — даём странице скроллиться
            if (Math.abs(dy) > Math.abs(dx)) return;

            // Горизонтальный свайп — можно чуть заблокировать скролл страницы
            if (Math.abs(dx) > 10) {
                e.preventDefault();
            }
        }

        function onTouchEnd(e) {
            if (!isSwiping) return;
            isSwiping = false;

            const p = getPoint(e);
            const dx = p.clientX - startX;

            if (Math.abs(dx) < SWIPE_THRESHOLD) return;

            if (dx < 0) {
                // свайп влево → следующий
                goTo(index + 1);
            } else {
                // свайп вправо → предыдущий
                goTo(index - 1);
            }
        }

        slider.addEventListener('touchstart', onTouchStart, { passive: true });
        slider.addEventListener('touchmove', onTouchMove, { passive: false });
        slider.addEventListener('touchend', onTouchEnd);
        slider.addEventListener('touchcancel', onTouchEnd);
    });
});
