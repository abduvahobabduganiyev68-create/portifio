const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const navPanel = document.querySelector('.nav-panel');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];
const backToTop = document.querySelector('.back-to-top');
const copyButton = document.querySelector('.copy-button');
const copyFeedback = document.querySelector('.copy-feedback');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  try {
    localStorage.setItem('portfolio-theme', theme);
  } catch (error) {
    console.warn('Theme preference could not be saved.', error);
  }
}

let initialTheme = 'dark';
try {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') initialTheme = savedTheme;
} catch (error) {
  console.warn('Saved theme preference could not be read.', error);
}
setTheme(initialTheme);

themeToggle.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

function closeMenu() {
  navPanel.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  navPanel.classList.toggle('is-open', !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

// These percentages are editable placeholders; adjust them to match actual knowledge.
document.querySelectorAll('.skill-fill').forEach((fill) => {
  const value = Number(fill.dataset.value);
  if (!Number.isFinite(value)) return;
  const clampedValue = Math.min(100, Math.max(0, value));
  fill.style.setProperty('--skill-level', String(clampedValue));
  fill.closest('.skill-card').querySelector('.skill-value').textContent = `${clampedValue}%`;
  fill.closest('.skill-track').setAttribute('aria-valuenow', String(clampedValue));
});

const revealElements = document.querySelectorAll('.reveal, .skill-card');
if ('IntersectionObserver' in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

if ('IntersectionObserver' in window) {
  const activeSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  sections.forEach((section) => activeSectionObserver.observe(section));
}

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

async function copyEmail(email) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(email);
    return;
  }
  const temporaryInput = document.createElement('textarea');
  temporaryInput.value = email;
  temporaryInput.setAttribute('readonly', '');
  temporaryInput.style.position = 'fixed';
  temporaryInput.style.opacity = '0';
  document.body.append(temporaryInput);
  temporaryInput.select();
  const copied = document.execCommand('copy');
  temporaryInput.remove();
  if (!copied) throw new Error('The browser did not allow copying to the clipboard.');
}

copyButton.addEventListener('click', async () => {
  copyFeedback.textContent = '';
  try {
    await copyEmail(copyButton.dataset.email);
    copyFeedback.textContent = 'Email copied!';
  } catch (error) {
    copyFeedback.textContent = 'Copy failed. Please select the email above.';
    console.error('Unable to copy email address.', error);
  }
});

document.querySelector('#current-year').textContent = String(new Date().getFullYear());
