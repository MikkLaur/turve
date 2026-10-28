'use strict';
// Contact form: shows the estimator selection and attached check, posts JSON to the API.
(() => {
  const T = window.Turve;
  const form = document.getElementById('contact-form');
  const catalog = T.json('catalog');
  const labels = T.json('contact-labels');
  if (!form || !catalog || !labels) return;
  const errorBox = document.getElementById('contact-error');
  const params = new URL(location.href).searchParams;

  // Selection from the price calculator (?p=…)
  const items = T.parseSelection(params.get('p'), catalog);
  if (items.length) {
    const priced = T.priceItems(items, catalog);
    const box = document.getElementById('contact-selection');
    const list = T.h(
      'ul',
      { class: 'selection-lines' },
      priced.lines.map((line) => {
        const text = T.lineText(line, catalog.labels);
        return T.h('li', null, T.h('span', null, text.name), T.h('span', null, text.value));
      }),
    );
    box.querySelector('[data-selection-body]').append(list, T.renderTotals(priced, catalog.labels));
    const change = box.querySelector('[data-selection-change]');
    change.setAttribute('href', `${change.getAttribute('href')}?p=${encodeURIComponent(T.selectionString(items))}`);
    box.removeAttribute('hidden');
    form.elements.packages.value = T.selectionString(items);
  }

  // Result of the free security check (?check=<id>&domain=…)
  const check = params.get('check');
  if (check && /^[A-Za-z0-9_-]{22}$/.test(check)) {
    form.elements.check.value = check;
    const notice = document.getElementById('contact-check');
    notice.querySelector('[data-check-domain]').textContent = (params.get('domain') || '').slice(0, 253);
    notice.removeAttribute('hidden');
    const website = form.elements.website;
    if (!website.value && params.get('domain')) website.value = params.get('domain').slice(0, 255);
  }

  // Signed timestamp: lets the API tell people from instant bot posts.
  T.api('/api/form-token')
    .then((res) => {
      if (res.ok && res.data && res.data.token) form.elements.token.value = res.data.token;
    })
    .catch(() => {});

  function showError(text) {
    errorBox.textContent = text;
    errorBox.removeAttribute('hidden');
    errorBox.focus?.();
    errorBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function markInvalid(names) {
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    for (const name of names) {
      const field = form.elements[name];
      if (field && field.setAttribute) field.setAttribute('aria-invalid', 'true');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.setAttribute('hidden', '');
    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.elements.consent.checked;

    const invalid = [];
    if (String(data.name || '').trim().length < 2) invalid.push('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || '').trim())) invalid.push('email');
    if (!data.consent) invalid.push('consent');
    markInvalid(invalid);
    if (invalid.length) {
      showError(labels.errors.fields);
      return;
    }
    if (!String(data.message || '').trim() && !data.packages && !data.check) {
      markInvalid(['message']);
      showError(labels.errors.message);
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = button.dataset.sending;
    try {
      const res = await T.api('/api/inquiries', data);
      if (res.ok) {
        location.assign(labels.thanksPath);
        return;
      }
      if (res.status === 429) {
        showError(labels.errors.rate_limited);
      } else if (res.status === 400) {
        const fields = (res.data && res.data.fields) || [];
        markInvalid(fields);
        showError(fields.includes('message') ? labels.errors.message : labels.errors.fields);
      } else {
        showError(labels.errors.network);
      }
    } catch {
      showError(labels.errors.network);
    } finally {
      button.disabled = false;
      button.textContent = button.dataset.label;
    }
  });
})();
