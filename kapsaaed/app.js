'use strict';
// Turve admin panel. Plain JS, no build step. All data is rendered as text, never as HTML.

const API = location.hostname === 'localhost' ? 'http://localhost:3000/api/admin' : 'https://api.turve.ee/api/admin';
const TZ = 'Europe/Tallinn';

const STATUS = {
  new: 'Uus',
  in_progress: 'Pooleli',
  won: 'Võidetud',
  lost: 'Kaotatud',
  spam: 'Rämps',
};
const FLAGS = {
  honeypot: 'lõksväli täidetud (robot?)',
  'token-missing': 'vormi märk puudus',
  'token-invalid': 'vormi märk vigane',
  'token-fast': 'saadeti liiga kiiresti',
  'token-expired': 'vormi märk aegunud',
  'no-js': 'ilma JavaScriptita',
};
const FINDING_STATUS = { pass: 'korras', warn: 'hoiatus', fail: 'probleem', info: 'teave' };
const AUDIT = {
  'login.password_ok': 'Parool õige',
  'login.password_failed': 'Vale kasutajanimi või parool',
  'login.totp_ok': 'Sisselogimine õnnestus',
  'login.totp_failed': 'Vale kood',
  'login.totp_locked': 'Liiga palju valesid koode',
  logout: 'Välja logitud',
  'inquiry.status': 'Päringu olek',
  'inquiry.notes': 'Päringu märkmed',
  'inquiry.delete': 'Päring kustutatud',
  'admin.created': 'Kasutaja loodud',
  'admin.password_set': 'Parool muudetud',
  'admin.totp_enrolled': 'Autentimisrakendus seadistatud',
};

const main = document.getElementById('main');
const banner = document.getElementById('banner');
const nav = document.getElementById('nav');
const logoutButton = document.getElementById('logout');

/* ---------- settings ---------- */

function applyTheme() {
  const theme = localStorage.getItem('turve-theme') || 'dark';
  document.documentElement.dataset.theme = theme;
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? 'Hele' : 'Tume';
}
document.getElementById('theme-toggle').addEventListener('click', () => {
  localStorage.setItem('turve-theme', (localStorage.getItem('turve-theme') || 'dark') === 'dark' ? 'light' : 'dark');
  applyTheme();
});
logoutButton.addEventListener('click', async () => {
  await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' }).catch(() => undefined);
  showLogin();
});
applyTheme();

/* ---------- DOM helpers ---------- */

function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (key === 'class') el.className = value;
    else if (key in el && key !== 'list') el[key] = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

function render(title, ...nodes) {
  document.title = `${title} – Turve haldus`;
  main.replaceChildren(h('h1', { tabindex: '-1' }, title), ...nodes.flat(Infinity).filter((n) => n != null && n !== false));
  main.querySelector('h1').focus();
  const hash = location.hash || '#/';
  for (const link of nav.querySelectorAll('a')) {
    const target = link.getAttribute('href');
    const current = target === '#/' ? hash === '#/' || hash === '#' || hash.startsWith('#/paring') : hash.startsWith(target);
    if (current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

function showMessage(text, kind = 'ok') {
  banner.textContent = text;
  banner.className = `banner ${kind}`;
  banner.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  banner.hidden = false;
  if (kind === 'error') banner.scrollIntoView({ block: 'start' });
}

function clearMessage() {
  banner.hidden = true;
  banner.textContent = '';
}

/** Runs an action with the button disabled; shows errors in the banner. */
function action(fn) {
  return async (event) => {
    const button = event && event.currentTarget;
    if (event && event.type === 'submit') event.preventDefault();
    if (button && 'disabled' in button) button.disabled = true;
    clearMessage();
    try {
      await fn(event);
    } catch (error) {
      if (!error.authRequired) showMessage(error.message, 'error');
    } finally {
      if (button && 'disabled' in button) button.disabled = false;
    }
  };
}

/* ---------- API ---------- */

async function api(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(API + path, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Ühendus serveriga ebaõnnestus. Kontrolli internetti ja proovi uuesti.');
  }
  if (response.status === 401 && !path.startsWith('/login')) {
    showLogin();
    throw Object.assign(new Error('Sisselogimine aegus.'), { authRequired: true });
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((data && data.message) || `Viga (${response.status}).`);
  }
  return data;
}

/* ---------- formatting (Tallinn time, euros) ---------- */

const dateTimeFmt = new Intl.DateTimeFormat('et-EE', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtDateTime = (value) => dateTimeFmt.format(new Date(value));
const euroFmt = new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' });
const euros = (cents) => euroFmt.format(Number(cents) / 100);
const hours = (minutes) => `${new Intl.NumberFormat('et-EE', { maximumFractionDigits: 2 }).format(Number(minutes) / 60)} h`;

function flagTags(flags) {
  return String(flags || '')
    .split(',')
    .filter(Boolean)
    .map((flag) => h('span', { class: 'tag flag' }, FLAGS[flag] || flag));
}

function estimateText(inquiry) {
  const parts = [];
  if (Number(inquiry.onceCents)) parts.push(euros(inquiry.onceCents));
  if (Number(inquiry.monthlyCents)) parts.push(`${euros(inquiry.monthlyCents)} kuus`);
  return parts.join(' + ');
}

/* ---------- login (password, then TOTP) ---------- */

function showLogin() {
  nav.hidden = true;
  logoutButton.hidden = true;
  const username = h('input', { id: 'username', name: 'username', autocomplete: 'username', required: true });
  const password = h('input', { id: 'password', name: 'password', type: 'password', autocomplete: 'current-password', required: true });
  render(
    'Logi sisse',
    h(
      'form',
      {
        class: 'login',
        onsubmit: action(async () => {
          await api('/login', { method: 'POST', body: { username: username.value.trim(), password: password.value } });
          password.value = '';
          showTotp();
        }),
      },
      h('label', { for: 'username' }, 'Kasutajanimi'),
      username,
      h('label', { for: 'password' }, 'Parool'),
      password,
      h('div', { class: 'row' }, h('button', { type: 'submit', class: 'primary' }, 'Edasi')),
    ),
  );
}

function showTotp() {
  const code = h('input', {
    id: 'code',
    name: 'code',
    class: 'code-input',
    inputMode: 'numeric',
    autocomplete: 'one-time-code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    required: true,
  });
  render(
    'Kinnituskood',
    h('p', null, 'Sisesta autentimisrakenduse 6-kohaline kood.'),
    h(
      'form',
      {
        class: 'login',
        onsubmit: action(async () => {
          await api('/login/totp', { method: 'POST', body: { code: code.value.replace(/\s/g, '') } });
          route();
        }),
      },
      h('label', { for: 'code' }, 'Kood'),
      code,
      h('div', { class: 'row' }, h('button', { type: 'submit', class: 'primary' }, 'Logi sisse'), h('button', { type: 'button', onclick: showLogin }, 'Tagasi')),
    ),
  );
  code.focus();
}

/* ---------- views ---------- */

function inquiryCard(inquiry) {
  return h(
    'li',
    null,
    h(
      'a',
      { class: `card status-${inquiry.status}`, href: `#/paring/${Number(inquiry.id)}` },
      h(
        'div',
        { class: 'line1' },
        h('span', null, inquiry.company ? `${inquiry.name} · ${inquiry.company}` : inquiry.name),
        h('span', null, STATUS[inquiry.status] || inquiry.status),
      ),
      h(
        'div',
        { class: 'line2' },
        `#${Number(inquiry.id)} · ${fmtDateTime(inquiry.createdAt)} · ${inquiry.email}`,
        estimateText(inquiry) ? ` · ${estimateText(inquiry)}` : '',
        inquiry.securityCheckId ? ' · turvakontroll lisatud' : '',
        inquiry.lang === 'en' ? ' · EN' : '',
        flagTags(inquiry.flags),
      ),
    ),
  );
}

async function viewList(status) {
  const [{ counts }, { inquiries }] = await Promise.all([api('/overview'), api(`/inquiries?status=${encodeURIComponent(status)}&limit=100`)]);
  const filters = [
    ['open', 'Uued ja pooleli', counts.new + counts.in_progress],
    ...Object.keys(STATUS).map((key) => [key, STATUS[key], counts[key]]),
    ['all', 'Kõik', Object.values(counts).reduce((a, b) => a + b, 0)],
  ];
  render(
    status === 'open' ? 'Päringud' : 'Kõik päringud',
    h(
      'div',
      { class: 'counts' },
      filters.map(([key, label, n]) =>
        h('a', { class: 'count', href: key === 'open' ? '#/' : `#/koik/${key}`, 'aria-current': key === status ? 'true' : null }, label, h('strong', null, String(n))),
      ),
    ),
    inquiries.length ? h('ul', { class: 'cards' }, inquiries.map(inquiryCard)) : h('p', { class: 'muted' }, 'Päringuid pole.'),
  );
}

function selectionTable(selection) {
  const rows = selection.lines.map((line) =>
    h(
      'tr',
      null,
      h('td', null, line.name.et, line.qty > 1 ? ` × ${line.qty}` : ''),
      h('td', null, line.billing === 'monthly' ? 'kuus' : 'ühekordne'),
      h('td', { class: 'num' }, line.unitMinutes === null ? 'hinnata' : hours(line.minutes)),
      h('td', { class: 'num' }, line.unitMinutes === null ? '–' : euros(line.cents)),
    ),
  );
  const foot = [];
  if (selection.onceMinutes) foot.push(h('tr', null, h('td', { colSpan: 2 }, 'Ühekordne kokku'), h('td', { class: 'num' }, hours(selection.onceMinutes)), h('td', { class: 'num' }, euros(selection.onceCents))));
  if (selection.monthlyMinutes) foot.push(h('tr', null, h('td', { colSpan: 2 }, 'Kuus kokku'), h('td', { class: 'num' }, hours(selection.monthlyMinutes)), h('td', { class: 'num' }, euros(selection.monthlyCents))));
  return h(
    'table',
    null,
    h('thead', null, h('tr', null, h('th', null, 'Pakett'), h('th', null, 'Arveldus'), h('th', { class: 'num' }, 'Tunnid'), h('th', { class: 'num' }, 'Summa'))),
    h('tbody', null, rows),
    h('tfoot', null, foot),
  );
}

function checkSection(check) {
  const problems = check.findings.filter((f) => f.status === 'fail' || f.status === 'warn');
  return [
    h('p', null, `${check.domain}: hinne ${check.grade}, ${check.score}/100, kontrollitud ${fmtDateTime(check.checkedAt)}`),
    problems.length
      ? h(
          'ul',
          { class: 'findings' },
          problems.map((f) =>
            h('li', { class: `f-${f.status}` }, h('span', { class: 'st' }, FINDING_STATUS[f.status]), h('strong', null, f.title), ' – ', f.message, f.evidence ? h('div', { class: 'evidence' }, f.evidence) : null),
          ),
        )
      : h('p', null, 'Probleeme ei leitud.'),
    check.suggestions.length ? h('p', { class: 'muted' }, `Soovitatud: ${check.suggestions.map((s) => s.name).join(', ')}`) : null,
  ];
}

async function viewInquiry(id) {
  const { inquiry, check } = await api(`/inquiries/${id}`);
  const notes = h('textarea', { id: 'notes', value: inquiry.adminNotes || '' });
  const refresh = () => viewInquiry(id);

  const statusButtons = Object.keys(STATUS).map((key) =>
    h(
      'button',
      {
        type: 'button',
        'aria-pressed': String(inquiry.status === key),
        onclick: action(async () => {
          await api(`/inquiries/${id}/status`, { method: 'POST', body: { status: key } });
          await refresh();
          showMessage(`Olek: ${STATUS[key]}`);
        }),
      },
      STATUS[key],
    ),
  );

  render(
    `Päring #${Number(inquiry.id)}`,
    h('p', null, h('a', { href: '#/' }, '← Päringud')),
    h('div', { class: 'row', role: 'group', 'aria-label': 'Olek' }, statusButtons),
    h(
      'dl',
      { class: 'facts' },
      h('dt', null, 'Saabunud'),
      h('dd', null, fmtDateTime(inquiry.createdAt), inquiry.lang === 'en' ? ' (inglise keeles)' : ''),
      h('dt', null, 'Nimi'),
      h('dd', null, inquiry.name),
      inquiry.company ? [h('dt', null, 'Ettevõte'), h('dd', null, inquiry.company)] : null,
      h('dt', null, 'E-post'),
      h('dd', null, h('a', { href: `mailto:${inquiry.email}` }, inquiry.email)),
      inquiry.phone ? [h('dt', null, 'Telefon'), h('dd', null, h('a', { href: `tel:${inquiry.phone.replace(/[^0-9+]/g, '')}` }, inquiry.phone))] : null,
      // Shown as text, not a link: it was typed by the visitor.
      inquiry.website ? [h('dt', null, 'Veebileht'), h('dd', { class: 'mono' }, inquiry.website)] : null,
      inquiry.flags ? [h('dt', null, 'Märkused'), h('dd', null, flagTags(inquiry.flags))] : null,
      h('dt', null, 'Nõusolek'),
      h('dd', null, fmtDateTime(inquiry.consentAt)),
    ),
    inquiry.message ? [h('h2', null, 'Sõnum'), h('div', { class: 'message' }, inquiry.message)] : null,
    inquiry.selection
      ? [h('h2', null, 'Valitud paketid'), selectionTable(inquiry.selection), h('p', { class: 'muted' }, `Hinnad hinnakirja versioonist ${inquiry.catalogVersion}.`)]
      : null,
    check ? [h('h2', null, 'Turvakontroll'), checkSection(check)] : null,
    h('h2', null, 'Märkmed'),
    h('label', { for: 'notes' }, 'Ainult sinule nähtavad'),
    notes,
    h(
      'div',
      { class: 'row' },
      h(
        'button',
        {
          type: 'button',
          class: 'primary',
          onclick: action(async () => {
            await api(`/inquiries/${id}/notes`, { method: 'POST', body: { notes: notes.value } });
            showMessage('Märkmed salvestatud.');
          }),
        },
        'Salvesta märkmed',
      ),
    ),
    h('h2', null, 'Kustutamine'),
    h('p', { class: 'muted' }, 'Kustutab päringu jäädavalt (nt isikuandmete kustutamise soovi korral).'),
    h(
      'div',
      { class: 'row' },
      h(
        'button',
        {
          type: 'button',
          class: 'danger',
          onclick: action(async () => {
            if (!confirm(`Kustutan päringu #${id} jäädavalt?`)) return;
            await api(`/inquiries/${id}`, { method: 'DELETE' });
            flash = `Päring #${id} kustutatud.`;
            location.hash = '#/';
          }),
        },
        'Kustuta päring',
      ),
    ),
  );
}

async function viewChecks() {
  const { checks } = await api('/security-checks?limit=100');
  render(
    'Turvakontrollid',
    h('p', { class: 'muted' }, 'Viimased avalikud kontrollid. Külastaja IP-aadressi ei salvestata.'),
    checks.length
      ? h(
          'table',
          null,
          h('thead', null, h('tr', null, h('th', null, 'Domeen'), h('th', null, 'Hinne'), h('th', null, 'Aeg'), h('th', null, 'Päring'))),
          h(
            'tbody',
            null,
            checks.map((c) =>
              h(
                'tr',
                null,
                h('td', null, h('a', { href: `#/kontroll/${Number(c.id)}`, class: 'mono' }, c.domain)),
                h('td', null, `${c.grade} (${c.score})`),
                h('td', null, fmtDateTime(c.createdAt)),
                h('td', null, c.inquiryId ? h('a', { href: `#/paring/${Number(c.inquiryId)}` }, `#${Number(c.inquiryId)}`) : '–'),
              ),
            ),
          ),
        )
      : h('p', { class: 'muted' }, 'Kontrolle pole veel tehtud.'),
  );
}

async function viewCheck(id) {
  const { check } = await api(`/security-checks/${id}`);
  render(
    `Turvakontroll: ${check.domain}`,
    h('p', null, h('a', { href: '#/kontrollid' }, '← Turvakontrollid')),
    h('p', null, `Hinne ${check.grade}, ${check.score}/100, kontrollitud ${fmtDateTime(check.checkedAt)}`),
    h(
      'ul',
      { class: 'findings' },
      check.findings.map((f) =>
        h('li', { class: `f-${f.status}` }, h('span', { class: 'st' }, FINDING_STATUS[f.status]), h('strong', null, f.title), ' – ', f.message, f.evidence ? h('div', { class: 'evidence' }, f.evidence) : null),
      ),
    ),
  );
}

async function viewAudit() {
  const { entries } = await api('/audit?limit=100');
  render(
    'Logi',
    h('p', { class: 'muted' }, 'Sisselogimised ja muudatused, uuemad eespool.'),
    h(
      'table',
      null,
      h('thead', null, h('tr', null, h('th', null, 'Aeg'), h('th', null, 'Tegevus'), h('th', null, 'Kasutaja'), h('th', null, 'Lisa'), h('th', null, 'IP'))),
      h(
        'tbody',
        null,
        entries.map((e) =>
          h('tr', null, h('td', null, fmtDateTime(e.at)), h('td', null, AUDIT[e.action] || e.action), h('td', null, e.username || '–'), h('td', null, e.detail || ''), h('td', { class: 'mono' }, e.ip || '')),
        ),
      ),
    ),
  );
}

/* ---------- router ---------- */

async function route() {
  const [view, param] = (location.hash.replace(/^#\/?/, '') || '').split('/');
  nav.hidden = false;
  logoutButton.hidden = false;
  try {
    if (view === 'paring' && Number(param) > 0) await viewInquiry(Number(param));
    else if (view === 'koik') await viewList(param && (param in STATUS || param === 'all') ? param : 'all');
    else if (view === 'kontrollid') await viewChecks();
    else if (view === 'kontroll' && Number(param) > 0) await viewCheck(Number(param));
    else if (view === 'logi') await viewAudit();
    else await viewList('open');
  } catch (error) {
    if (!error.authRequired) {
      render('Viga', h('p', null, error.message), h('div', { class: 'row' }, h('a', { class: 'button', href: '#/' }, 'Päringutesse')));
    }
  }
}

let flash = null;
window.addEventListener('hashchange', async () => {
  const message = flash;
  flash = null;
  clearMessage();
  await route();
  if (message) showMessage(message);
});
route();
