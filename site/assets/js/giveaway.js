'use strict';
// Giveaway page /loos/ and /en/giveaway/ (TURVE-014), on the visitor's own clock (a wrong device clock shows wrong
// numbers; the text lines stay the truth):
//   entries  → countdown to the deadline, with the "enter on Facebook" buttons
//   waiting  → countdown to the reveal (drawAt); the buttons go
//   drawing  → polls /loos/voitja.json, which exists once the owner has published the winner
//   winner   → live reveal if the page was open before the winner came out, else a "Näita võitjat" button
// Without JS the build's text line (or the <details> winner) stays. textContent only.
(() => {
  const T = window.Turve;
  const data = T && T.json('giveaway-data');
  const draw = document.querySelector('[data-draw]');
  if (!data || !draw) return;
  const endsAt = Date.parse(data.endsAt);
  const drawAt = Date.parse(data.drawAt);
  const when = draw.querySelector('[data-countdown-when]');
  const digits = draw.querySelector('[data-countdown-digits]');
  const revealBox = draw.querySelector('[data-reveal]');
  const announcer = draw.querySelector('[data-reveal-announce]');
  const template = draw.querySelector('[data-winner-template]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const unit = (name) => draw.querySelector(`[data-unit="${name}"]`);
  const fields = { days: unit('days'), hours: unit('hours'), minutes: unit('minutes'), seconds: unit('seconds') };
  const pad = (n) => String(n).padStart(2, '0');
  // Someone who had the page open before the reveal time is watching: they get the reveal without a click.
  const watching = Date.now() < drawAt;
  let timer = 0;

  function setState(state) {
    draw.dataset.state = state;
    if (state !== 'entries') document.querySelectorAll('[data-giveaway-enter]').forEach((el) => el.remove());
    if (state === 'waiting') when.textContent = data.closed;
    if (state === 'drawing') {
      when.textContent = data.drawing;
      digits.hidden = true;
    }
  }

  // Whole seconds left, rounded up: the last second shows 00 00 00 01, then the next state.
  function showLeft(left) {
    const total = Math.ceil(left / 1000);
    fields.days.textContent = pad(Math.floor(total / 86400));
    fields.hours.textContent = pad(Math.floor(total / 3600) % 24);
    fields.minutes.textContent = pad(Math.floor(total / 60) % 60);
    fields.seconds.textContent = pad(total % 60);
    digits.hidden = false;
  }

  function tick() {
    clearTimeout(timer);
    const now = Date.now();
    const target = now < endsAt ? endsAt : drawAt;
    const state = now < endsAt ? 'entries' : now < drawAt ? 'waiting' : 'drawing';
    if (draw.dataset.state !== state) setState(state);
    if (state === 'drawing') {
      poll(watching);
      return;
    }
    const left = target - now;
    showLeft(left);
    // Wake just after the shown second runs out, so the digits change with the clock's seconds.
    timer = setTimeout(tick, (left % 1000 || 1000) + 15);
  }

  async function fetchWinner() {
    try {
      const response = await fetch(data.winnerUrl, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) return null;
      const winner = await response.json();
      return winner && typeof winner.company === 'string' && typeof winner.business === 'string' ? winner : null;
    } catch {
      return null;
    }
  }

  let polling = false;
  async function poll(live) {
    if (polling) return;
    polling = true;
    const winner = await fetchWinner();
    polling = false;
    if (winner) {
      showWinner(winner, live);
      return;
    }
    // Not published yet: whoever is still here when it comes out is watching.
    timer = setTimeout(() => poll(true), 15000);
  }

  // ---- the reveal: the command line, then the company name decodes letter by letter in gold

  const SCRAMBLE = 'ABCDEFGHIJKLMNOPRSTUVZÕÄÖÜ0123456789#%&*';
  const randomChar = () => SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];

  function announce(company, business) {
    announcer.textContent = data.announce.replace('{company}', company).replace('{business}', business);
  }

  function play(details) {
    const card = details.querySelector('.winner-card');
    const nameEl = details.querySelector('[data-winner-company]');
    const company = nameEl.textContent;
    const business = details.querySelector('[data-winner-business]').textContent;
    if (reduceMotion) {
      card.classList.add('revealed');
      announce(company, business);
      return;
    }
    card.classList.add('revealing');
    const startAt = performance.now();
    const drumroll = 1100; // all letters spin
    const resolve = Math.min(Math.max(company.length * 90, 1400), 2800); // then settle left to right
    let last = 0;
    function frame(now) {
      const elapsed = now - startAt;
      if (elapsed >= drumroll + resolve) {
        nameEl.textContent = company;
        card.classList.remove('revealing');
        card.classList.add('revealed');
        announce(company, business);
        return;
      }
      if (now - last > 45) {
        last = now;
        const settled = elapsed < drumroll ? 0 : Math.floor(((elapsed - drumroll) / resolve) * company.length);
        let text = company.slice(0, settled);
        for (const ch of company.slice(settled)) text += ch === ' ' ? ' ' : randomChar();
        nameEl.textContent = text;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // A <details> winner: the button opens it and plays the reveal once.
  function arm(details) {
    details.addEventListener('toggle', () => {
      if (details.open && !details.dataset.played) {
        details.dataset.played = 'yes';
        play(details);
      }
    });
  }

  function showWinner(winner, live) {
    clearTimeout(timer);
    const details = template.content.firstElementChild.cloneNode(true);
    details.querySelector('[data-winner-company]').textContent = winner.company;
    details.querySelector('[data-winner-business]').textContent = winner.business;
    draw.querySelector('[data-countdown]')?.remove();
    draw.dataset.state = 'winner';
    arm(details);
    revealBox.replaceChildren(details);
    if (live) details.open = true; // fires toggle → play
  }

  // A build that already has the winner: just the button.
  const built = draw.querySelector('[data-reveal] > details[data-winner]');
  if (built) {
    arm(built);
    return;
  }

  // Background tabs get throttled timers: catch up as soon as the page is visible again.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && draw.dataset.state !== 'winner' && draw.dataset.state !== 'drawing') tick();
  });
  tick();
})();
