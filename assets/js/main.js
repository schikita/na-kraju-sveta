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

console.log("✨ Polar Journal Scripts Loaded Successfully");