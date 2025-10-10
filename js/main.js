// === Smooth Scroll Navigation ===
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      // Close mobile menu if open
      document.getElementById("navLinks").classList.remove("active");
    }
  });
});

// === Mobile Menu Toggle ===
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
    navLinks.classList.remove("active");
  }
});

// === Navbar Scroll Effect ===
const navbar = document.getElementById("navbar");
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  // Add shadow on scroll
  if (currentScroll > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  lastScroll = currentScroll;
});

// === Intersection Observer for Animations ===
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll("section, .project-card").forEach((el) => {
  observer.observe(el);
});

// === Active Navigation Link ===
const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").slice(1) === current) {
      link.classList.add("active");
    }
  });
});

// === Page Load Animation ===
window.addEventListener("load", () => {
  // Remove loading screen if it exists
  const loader = document.getElementById("loading");
  if (loader) {
    setTimeout(() => {
      loader.classList.remove("active");
    }, 100);
  }

  // Trigger hero animations
  document.querySelector(".hero").style.opacity = "1";
  document.querySelector(".hero").style.transform = "translateY(0)";
});

// === Dynamic Year in Footer ===
const yearElement = document.querySelector("footer p");
if (yearElement) {
  const currentYear = new Date().getFullYear();
  yearElement.innerHTML = `&copy; ${currentYear} Jonathon Harris. All rights reserved.`;
}

// === Console Message ===
console.log(
  "%c👋 Hey there!",
  "font-size: 20px; font-weight: bold; color: #4a5568;"
);
console.log(
  "%cThanks for checking out my portfolio!",
  "font-size: 14px; color: #666;"
);
console.log(
  "%cFeel free to reach out at jonathon@example.com",
  "font-size: 14px; color: #666;"
);
