const weddingDate = new Date('2026-11-17T14:00:00+08:00');
const fields = Object.fromEntries(
  ['days', 'hours', 'minutes', 'seconds'].map((id) => [id, document.getElementById(id)])
);

let countdownTimer;

function updateCountdown() {
  let remaining = Math.max(0, weddingDate.getTime() - Date.now());
  const days = Math.floor(remaining / 86400000);
  remaining %= 86400000;
  const hours = Math.floor(remaining / 3600000);
  remaining %= 3600000;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  fields.days.textContent = String(days).padStart(3, '0');
  fields.hours.textContent = String(hours).padStart(2, '0');
  fields.minutes.textContent = String(minutes).padStart(2, '0');
  fields.seconds.textContent = String(seconds).padStart(2, '0');
}

function startCountdown() {
  window.clearInterval(countdownTimer);
  updateCountdown();
  countdownTimer = window.setInterval(updateCountdown, 1000);
}

startCountdown();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) window.clearInterval(countdownTimer);
  else startCountdown();
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = [...document.querySelectorAll('.reveal')];
let revealObserver;
let revealFallback;

function showAllContent() {
  window.clearTimeout(revealFallback);
  revealObserver?.disconnect();
  document.documentElement.classList.remove('motion-ready');
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

function configureMotion() {
  showAllContent();
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('motion-ready');
  revealElements.forEach((element) => element.classList.remove('is-visible'));
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
  revealFallback = window.setTimeout(showAllContent, 4000);
}

configureMotion();
motionPreference.addEventListener?.('change', configureMotion);

const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress span');
let scrollFrame;

function updateScrollUI() {
  const maximum = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maximum > 0 ? Math.min(1, window.scrollY / maximum) : 0;
  header.classList.toggle('scrolled', window.scrollY > 16);
  progress.style.transform = `scaleX(${ratio})`;
  scrollFrame = undefined;
}

window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUI);
}, { passive: true });
updateScrollUI();

const toggle = document.querySelector('.menu-toggle');
const menuLabel = toggle.querySelector('.menu-label');
const nav = document.getElementById('navigation');

function setMenu(open, returnFocus = false) {
  nav.classList.toggle('open', open);
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'Close' : 'Menu';
  if (returnFocus) toggle.focus();
}

toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true);
});
document.addEventListener('click', (event) => {
  if (nav.classList.contains('open') && !header.contains(event.target)) setMenu(false);
});

const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sectionLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionObserver.observe(section);
  });
}

const rsvpForm = document.getElementById('rsvp-form');
const formStatus = document.getElementById('form-status');
const formFallback = document.getElementById('form-fallback');
const submitButton = rsvpForm.querySelector('.submit-button');
const buttonLabel = submitButton.querySelector('.button-label');
const attendanceInputs = [...rsvpForm.querySelectorAll('input[name="Attendance"]')];

const errorMap = new Map([
  ['guest-name', document.getElementById('guest-name-error')]
]);

attendanceInputs.forEach((input) => input.addEventListener('change', validateAttendance));
attendanceInputs.forEach((input) => input.addEventListener('change', validateAttendance));

function validationMessage(input) {
  if (input.validity.valueMissing) {
    if (input.id === 'guest-name') return 'Please enter the name printed on your invitation.';
  }
  return '';
}

function validateField(input) {
  const error = errorMap.get(input.id);
  if (!error) return input.checkValidity();
  input.setCustomValidity('');
  const message = validationMessage(input);
  input.setCustomValidity(message);
  error.textContent = message;
  input.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}

[...errorMap.keys()].forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    input.setCustomValidity('');
    if (input.getAttribute('aria-invalid') === 'true') validateField(input);
  });
});

function validateAttendance() {
  const attendanceError = document.getElementById('attendance-error');
  const valid = attendanceInputs.some((input) => input.checked);
  attendanceError.textContent = valid ? '' : 'Please let us know whether you can attend.';
  attendanceInputs.forEach((input) => input.setAttribute('aria-invalid', String(!valid)));
  return valid;
}

function setSubmitting(submitting) {
  rsvpForm.setAttribute('aria-busy', String(submitting));
  submitButton.disabled = submitting;
  buttonLabel.textContent = submitting ? 'Sending RSVP…' : 'Send RSVP';
}

rsvpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.className = 'form-status';
  formStatus.textContent = '';
  formFallback.hidden = true;
  const fieldValidity = [...errorMap.keys()].map((id) => validateField(document.getElementById(id)));
  const attendanceValid = validateAttendance();
  if (fieldValidity.includes(false) || !attendanceValid || !rsvpForm.checkValidity()) {
    rsvpForm.querySelector(':invalid')?.focus();
    return;
  }

  setSubmitting(true);
  formStatus.textContent = 'Sending your response securely…';

  try {
    const formData = new FormData(rsvpForm);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(rsvpForm.dataset.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false || result.success === 'false') {
      throw new Error(result.message || 'The RSVP service could not accept the response.');
    }

    rsvpForm.reset();
    formStatus.classList.add('success');
    formStatus.textContent = 'Thank you — your RSVP has been sent to Julius Nico and Reyna Beth.';
    formStatus.focus();
  } catch (error) {
    formStatus.classList.add('error');
    formStatus.textContent = 'We could not send your RSVP right now. Please try again or use the email option below.';
    formFallback.hidden = false;
  } finally {
    setSubmitting(false);
  }
});
