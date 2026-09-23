// Confirmed wedding names and venue pin.
const wedding = {
  groom: 'Mohamed Arafath', bride: 'Fathima Hafsa',
  groomFull: 'Mohamed Arafath', brideFull: 'Fathima Hafsa',
  date: '2026-10-04T19:00:00+05:30',
  venue: 'EASCCA Conference Centre, Eravur, Sri Lanka',
  mapsUrl: 'https://maps.app.goo.gl/Lh6AbxdXu4Udp48Q9'
};
document.documentElement.classList.add('js');
const envelopeScreen = document.getElementById('envelope-screen');
const weddingPage = document.getElementById('wedding-page');
const openEnvelopeButton = document.getElementById('open-envelope');
const replayEnvelope = document.getElementById('replay-envelope');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const playAnimationButton = document.getElementById('play-envelope-animation');
const reduceMotion = () => motionPreference.matches && !document.documentElement.classList.contains('motion-requested');
let openingEnvelope = false;
function fitEnvelopeToScreen() {
  // visualViewport follows browser toolbars on mobile, including older Safari.
  if (window.visualViewport && window.visualViewport.scale !== 1) return;
  envelopeScreen.style.setProperty('--envelope-height', `${window.visualViewport?.height || window.innerHeight}px`);
}
fitEnvelopeToScreen();
window.addEventListener('resize', fitEnvelopeToScreen, { passive: true });
window.visualViewport?.addEventListener('resize', fitEnvelopeToScreen, { passive: true });
function showEnvelope() {
  openingEnvelope = false;
  envelopeScreen.classList.remove('opening', 'departing');
  openEnvelopeButton.disabled = false;
  envelopeScreen.hidden = false;
  weddingPage.hidden = true;
  weddingPage.inert = true;
  document.body.classList.add('envelope-closed');
  document.documentElement.classList.add('envelope-closed');
  playAnimationButton.hidden = !reduceMotion();
  fitEnvelopeToScreen();
  openEnvelopeButton.style.removeProperty('--tilt-x');
  openEnvelopeButton.style.removeProperty('--tilt-y');
  const action = window.matchMedia('(hover: hover) and (pointer: fine)').matches ? 'Click' : 'Tap';
  document.getElementById('envelope-hint').innerHTML = `<button class="envelope-open-prompt" type="button"><strong>${action} the envelope to open your invitation</strong><small>A little surprise awaits inside ✧</small></button>`;
  openEnvelopeButton.focus({ preventScroll: true });
}
function celebrateReveal() {
  if (reduceMotion()) return;
  const container = document.getElementById('reveal-confetti');
  container.replaceChildren();
  for (let i = 0; i < 42; i++) {
    const petal = document.createElement('i');
    petal.style.setProperty('--x', `${Math.random() * 100}vw`);
    petal.style.setProperty('--drift', `${Math.random() * 200 - 100}px`);
    petal.style.setProperty('--delay', `${Math.random() * .6}s`);
    petal.style.setProperty('--duration', `${2.2 + Math.random() * 1.8}s`);
    petal.style.background = ['#b9818b', '#d5bc85', '#ecd0c2', '#9aab86'][i % 4];
    container.append(petal);
  }
  setTimeout(() => container.replaceChildren(), 5000);
}
openEnvelopeButton.addEventListener('click', () => {
  if (openingEnvelope) return;
  openingEnvelope = true;
  openEnvelopeButton.disabled = true;
  envelopeScreen.classList.add('opening');
  playAnimationButton.hidden = true;
  document.getElementById('envelope-hint').textContent = 'With love, we invite you…';
  const reducedMotion = reduceMotion();
  setTimeout(() => {
    envelopeScreen.classList.add('departing');
    weddingPage.hidden = false;
    weddingPage.inert = false;
    document.body.classList.remove('envelope-closed');
    document.documentElement.classList.remove('envelope-closed');
    const target = document.getElementById(location.hash.slice(1)) || document.getElementById('home');
    target.scrollIntoView({ behavior: 'instant' });
    celebrateReveal();
    setTimeout(() => {
      envelopeScreen.hidden = true;
      const heading = document.getElementById('hero-title');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      replayEnvelope.hidden = false;
    }, reducedMotion ? 0 : 850);
  }, reducedMotion ? 0 : 2900);
});
replayEnvelope.addEventListener('click', showEnvelope);
playAnimationButton.addEventListener('click', () => {
  document.documentElement.classList.add('motion-requested');
  // Allow the browser to apply motion styles before starting the opening.
  requestAnimationFrame(() => requestAnimationFrame(() => openEnvelopeButton.click()));
});
motionPreference.addEventListener('change', () => {
  if (!openingEnvelope) playAnimationButton.hidden = !reduceMotion();
});
document.getElementById('envelope-hint').addEventListener('click', event => {
  if (event.target.closest('.envelope-open-prompt')) openEnvelopeButton.click();
});
// Bounded pointer tilt adds depth without moving the target on touch devices.
openEnvelopeButton.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || openingEnvelope || reduceMotion()) return;
  const bounds = openEnvelopeButton.getBoundingClientRect();
  openEnvelopeButton.style.setProperty('--tilt-x', `${(event.clientX - bounds.left - bounds.width / 2) / bounds.width * 7}deg`);
  openEnvelopeButton.style.setProperty('--tilt-y', `${-(event.clientY - bounds.top - bounds.height / 2) / bounds.height * 6}deg`);
});
openEnvelopeButton.addEventListener('pointerleave', () => {
  openEnvelopeButton.style.removeProperty('--tilt-x');
  openEnvelopeButton.style.removeProperty('--tilt-y');
});
const sparkleField = document.querySelector('.envelope-sparkles');
for (let i = 0; i < 16; i++) {
  const sparkle = document.createElement('span');
  sparkle.textContent = i % 3 === 0 ? '✧' : '·';
  sparkle.style.setProperty('--left', `${6 + (i * 29) % 88}%`);
  sparkle.style.setProperty('--top', `${8 + (i * 17) % 80}%`);
  sparkle.style.setProperty('--delay', `${-i * .71}s`);
  sparkle.style.setProperty('--duration', `${4 + i % 4}s`);
  sparkleField.append(sparkle);
}
showEnvelope();
for (const [selector, value] of Object.entries({ '[data-groom-short]': wedding.groom, '[data-bride-short]': wedding.bride, '[data-groom-full]': wedding.groomFull, '[data-bride-full]': wedding.brideFull })) document.querySelectorAll(selector).forEach(el => el.textContent = value);
document.querySelector('#directions-link').href = wedding.mapsUrl;
// Display the supplied hall photograph, retaining the illustration if loading fails.
const venuePhoto = new Image();
venuePhoto.alt = 'Front entrance of EASCCA Conference Centre, with palm trees and a lawn';
venuePhoto.className = 'venue-photo';
venuePhoto.width = 548;
venuePhoto.height = 364;
venuePhoto.onload = () => document.querySelector('.venue-illustration').replaceWith(venuePhoto);
venuePhoto.src = 'assets/Escall-hall-photo.jpeg';
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
function updateCountdown() {
  const remaining = Math.max(0, new Date(wedding.date).getTime() - Date.now());
  const seconds = Math.floor(remaining / 1000);
  const values = { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
  Object.entries(values).forEach(([key, value]) => document.getElementById(key).textContent = String(value).padStart(2, '0'));
  if (!remaining) document.getElementById('countdown-caption').textContent = 'Our beautiful beginning · October 4, 2026';
}
updateCountdown(); setInterval(updateCountdown, 1000);
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motion.matches) for (let i = 0; i < 10; i++) { const petal = document.createElement('span'); petal.className = 'petal'; petal.style.left = `${8 + Math.random() * 80}%`; petal.style.animationDuration = `${12 + Math.random() * 12}s`; petal.style.animationDelay = `${-Math.random() * 24}s`; document.querySelector('.petals').append(petal); }
let scrollPending = false;
window.addEventListener('scroll', () => { if (scrollPending) return; scrollPending = true; requestAnimationFrame(() => { const max = document.documentElement.scrollHeight - innerHeight; document.querySelector('.scroll-progress').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`; scrollPending = false; }); }, { passive: true });
function download(content, type, filename) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function escapeICS(value) { return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
document.getElementById('calendar-button').addEventListener('click', () => {
  const date = new Date(wedding.date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arafath and Hafsa//Wedding//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:arafath-hafsa-20261004@wedding', `DTSTAMP:${stamp}`, `DTSTART:${date}`, `SUMMARY:${escapeICS(`${wedding.groom} & ${wedding.bride} — Wedding`)}`, `LOCATION:${escapeICS(wedding.venue)}`, 'DESCRIPTION:Join us to celebrate our wedding. Your presence and prayers mean the world to us.', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
  download(calendar, 'text/calendar;charset=utf-8', 'Arafath-and-Hafsa-Wedding.ics');
});
document.getElementById('share-button').addEventListener('click', async () => {
  const status = document.getElementById('share-status');
  const local = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const text = `You’re invited to the wedding of ${wedding.groom} & ${wedding.bride}! Sunday, October 4, 2026 at 7:00 PM (Sri Lanka time). ${wedding.venue}.`;
  const data = { title: `${wedding.groom} & ${wedding.bride} — Wedding invitation`, text, ...(!local && { url: location.href.split('#')[0] }) };
  try { if (navigator.share) { await navigator.share(data); status.textContent = 'Thank you for sharing our special day.'; } else { await navigator.clipboard.writeText(text + (local ? '' : ` ${data.url}`)); status.textContent = local ? 'Wedding details copied. The website link will be included once hosted.' : 'Invitation copied. Share it with someone you love.'; } } catch (error) { if (error.name !== 'AbortError') { download(text, 'text/plain;charset=utf-8', 'Wedding-invitation.txt'); status.textContent = 'Invitation details downloaded for you to share.'; } }
});
