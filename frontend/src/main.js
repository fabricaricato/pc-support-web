/* ========================
   TechFix Pro — Main JS
   ======================== */

import './style.css';

// ---------- Navbar Scroll Effect ----------
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function handleNavbarScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll);
handleNavbarScroll();

// ---------- Active Nav Link on Scroll ----------
function updateActiveLink() {
  const scrollPos = window.scrollY + 120;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveLink);

// ---------- Mobile Menu Toggle ----------
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  navToggle.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

// Close menu on link click
navMenu.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ---------- Scroll Animations (Intersection Observer) ----------
const animatedElements = document.querySelectorAll('.animate-on-scroll');

const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -40px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

animatedElements.forEach((el) => observer.observe(el));

// ---------- Stats Counter Animation ----------
function animateCounters() {
  const counters = document.querySelectorAll('.hero__stat-number[data-count]');

  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-count'));
    const duration = 2000;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

// Observe the stats section
const statsContainer = document.querySelector('.hero__stats');
if (statsContainer) {
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statsObserver.observe(statsContainer);
}

// ---------- EmailJS Init ----------
const EMAILJS_PUBLIC_KEY = '6DZ3EhCHIitreps1X';
const EMAILJS_SERVICE_ID = 'service_bo8rqt6';
const EMAILJS_TEMPLATE_ID = 'template_sm05kpn';

emailjs.init(EMAILJS_PUBLIC_KEY);

// ---------- Contact Form ----------
const contactForm = document.getElementById('contactForm');
const submitBtn = contactForm.querySelector('.form-submit');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Disable button and show loading
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

  // Send email via EmailJS
  emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm)
    .then(() => {
      // Show success message
      contactForm.innerHTML = `
        <div class="form-success">
          <i class="fa-solid fa-circle-check"></i>
          <h3>¡Mensaje enviado!</h3>
          <p>Me pondré en contacto con vos lo antes posible.</p>
        </div>
      `;
    })
    .catch((error) => {
      console.error('EmailJS error:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      alert('Hubo un error al enviar el mensaje. Por favor, intentá de nuevo o escribime por WhatsApp.');
    });
});

// ---------- Smooth anchor scroll for all anchor links ----------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});