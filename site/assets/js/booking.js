'use strict';
// Free 20-minute consultation (/konsultatsioon/): pick a day and a time from the API, fill in the form, book.
// The DOM is built with createElement/textContent only. The calendar file is made in the browser; nothing is mailed.
(() => {
  const T = window.Turve;
  const labels = T && T.json('booking-labels');
  const picker = document.getElementById('booking');
  const form = document.getElementById('booking-form');
  const done = document.getElementById('booking-done');
  if (!labels || !picker || !form || !done) return;

  const statusText = picker.querySelector('[data-booking-status]');
  const fallback = picker.querySelector('[data-booking-fallback]');
  const pickerError = picker.querySelector('[data-picker-error]');
  const daysBox = picker.querySelector('[data-days]');
  const timesBox = picker.querySelector('[data-times]');
  const timesTitle = picker.querySelector('[data-times-title]');
  const timesNote = picker.querySelector('[data-times-note]');
  const chosenText = form.querySelector('[data-chosen]');
  const errorBox = document.getElementById('booking-error');
  const submitButton = form.querySelector('button[type="submit"]');

  const locale = T.lang === 'en' ? 'en-IE' : 'et-EE';
  const zone = { timeZone: 'Europe/Tallinn' };
  const dayFormat = new Intl.DateTimeFormat(locale, { ...zone, weekday: 'short', day: 'numeric', month: 'numeric' });
  const timeFormat = new Intl.DateTimeFormat(locale, { ...zone, hour: '2-digit', minute: '2-digit' });
  const longFormat = new Intl.DateTimeFormat(locale, { ...zone, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

  let callMinutes = 20;
  let chosenLabel = '';

  picker.removeAttribute('hidden');

  // Signed timestamp: lets the API tell people from instant bot posts.
  T.api('/api/form-token')
    .then((res) => {
      if (res.ok && res.data && res.data.token) form.elements.token.value = res.data.token;
    })
    .catch(() => {});

  function show(el, visible) {
    if (visible) el.removeAttribute('hidden');
    else el.setAttribute('hidden', '');
  }

  function press(box, button) {
    box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  }

  function slotButton(text, onClick) {
    const button = T.h('button', { type: 'button', class: 'slot', 'aria-pressed': 'false' }, text);
    button.addEventListener('click', () => onClick(button));
    return button;
  }

  function showTimes(day) {
    show(timesTitle, true);
    timesBox.replaceChildren(...day.slots.map((iso) => slotButton(timeFormat.format(new Date(iso)), () => choose(iso))));
  }

  function choose(iso) {
    // The ISO string is sent back exactly as the API gave it: the API accepts only its own free slots.
    form.elements.startsAt.value = iso;
    chosenLabel = longFormat.format(new Date(iso));
    chosenText.textContent = chosenLabel;
    show(errorBox, false);
    show(pickerError, false);
    show(picker, false);
    show(form, true);
    form.elements.name.focus();
  }

  async function loadSlots() {
    statusText.textContent = labels.loading;
    show(statusText, true);
    show(fallback, false);
    show(timesTitle, false);
    show(timesNote, false);
    daysBox.replaceChildren();
    timesBox.replaceChildren();
    let res = null;
    try {
      res = await T.api('/api/consultations/slots');
    } catch {
      res = null;
    }
    if (!res || !res.ok || !res.data) {
      statusText.textContent = labels.loadError;
      show(fallback, true);
      return;
    }
    callMinutes = Number(res.data.callMinutes) || callMinutes;
    const days = Array.isArray(res.data.days) ? res.data.days.filter((day) => day && Array.isArray(day.slots) && day.slots.length) : [];
    if (!days.length) {
      statusText.textContent = labels.noSlots;
      show(fallback, true);
      return;
    }
    show(statusText, false);
    show(timesNote, true);
    daysBox.replaceChildren(
      ...days.map((day) =>
        slotButton(dayFormat.format(new Date(day.slots[0])), (button) => {
          press(daysBox, button);
          showTimes(day);
        }),
      ),
    );
  }

  form.querySelector('[data-change]').addEventListener('click', () => {
    show(form, false);
    show(picker, true);
  });

  function showError(box, text) {
    box.textContent = text;
    show(box, true);
    box.focus?.();
    box.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function markInvalid(names) {
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    for (const name of names) {
      const field = form.elements[name];
      if (field && field.setAttribute) field.setAttribute('aria-invalid', 'true');
    }
  }

  /** An iCalendar file for the visitor's own calendar app. */
  function icsFile(iso) {
    const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const escape = (text) => String(text).replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
    const start = new Date(iso);
    const end = new Date(start.getTime() + callMinutes * 60_000);
    const uid = `${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}@turve.ee`;
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Turve//Konsultatsioon//ET',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escape(labels.icsSummary)}`,
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');
  }

  function showDone(phone, iso) {
    done.querySelector('[data-done-text]').textContent = labels.doneText
      .replace('{time}', chosenLabel)
      .replace('{phone}', phone)
      .replace('{email}', labels.email);
    done.querySelector('[data-ics]').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([icsFile(iso)], { type: 'text/calendar' }));
      const link = T.h('a', { href: url, download: 'turve-konsultatsioon.ics' });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    show(form, false);
    show(done, true);
    done.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    show(errorBox, false);
    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.elements.consent.checked;

    const phone = String(data.phone || '').trim();
    const invalid = [];
    if (String(data.name || '').trim().length < 2) invalid.push('name');
    if (phone.length < 5 || !/^[0-9+()\-.\s]*$/.test(phone)) invalid.push('phone');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || '').trim())) invalid.push('email');
    if (!data.consent) invalid.push('consent');
    markInvalid(invalid);
    if (invalid.length) {
      showError(errorBox, labels.errors.fields);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = submitButton.dataset.sending;
    try {
      const res = await T.api('/api/consultations', data);
      const code = res.data && res.data.code;
      if (res.ok) {
        showDone(phone, data.startsAt);
      } else if (res.status === 409 && code === 'slot_taken') {
        // Back to the picker with fresh times.
        show(form, false);
        show(picker, true);
        await loadSlots();
        showError(pickerError, labels.errors.slot_taken);
      } else if (res.status === 409 && code === 'already_booked') {
        showError(errorBox, labels.errors.already_booked);
      } else if (res.status === 429) {
        showError(errorBox, labels.errors.rate_limited);
      } else if (res.status === 400) {
        markInvalid((res.data && res.data.fields) || []);
        showError(errorBox, labels.errors.fields);
      } else {
        showError(errorBox, labels.errors.network);
      }
    } catch {
      showError(errorBox, labels.errors.network);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.label;
    }
  });

  loadSlots();
})();
