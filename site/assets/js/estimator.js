'use strict';
// Price calculator on /hinnad/ and /en/pricing/. Works on top of the static package list.
(() => {
  const T = window.Turve;
  const catalog = T.json('catalog');
  const summary = document.getElementById('estimator-summary');
  if (!catalog || !summary) return;
  const labels = catalog.labels;
  const body = summary.querySelector('[data-summary-body]');
  const link = summary.querySelector('[data-summary-link]');
  const contactPath = link.getAttribute('href');

  document.querySelectorAll('[data-pick]').forEach((el) => el.removeAttribute('hidden'));
  document.querySelector('[data-estimator-hint]')?.removeAttribute('hidden');
  summary.removeAttribute('hidden');

  const checkbox = (id) => document.querySelector(`input[data-pkg="${CSS.escape(id)}"]`);
  const qtyInput = (id) => document.querySelector(`input[data-qty="${CSS.escape(id)}"]`);

  function readState() {
    const items = [];
    for (const pkg of catalog.packages) {
      const box = checkbox(pkg.id);
      if (box && box.checked) {
        const qty = qtyInput(pkg.id);
        const value = qty ? Math.min(Math.max(parseInt(qty.value, 10) || 1, 1), pkg.maxQty) : 1;
        items.push({ id: pkg.id, qty: value });
      }
    }
    return items;
  }

  function render() {
    const items = readState();
    for (const pkg of catalog.packages) {
      document.getElementById(`pkg-${pkg.id}`)?.classList.toggle('selected', !!checkbox(pkg.id)?.checked);
    }
    const selection = T.selectionString(items);
    const url = new URL(location.href);
    if (selection) url.searchParams.set('p', selection);
    else url.searchParams.delete('p');
    history.replaceState(null, '', url);
    link.setAttribute('href', selection ? `${contactPath}?p=${encodeURIComponent(selection)}` : contactPath);

    body.replaceChildren();
    if (!items.length) {
      body.append(T.h('p', { class: 'summary-note' }, labels.summaryEmpty));
      return;
    }
    const priced = T.priceItems(items, catalog);
    body.append(T.h('p', { class: 'summary-note' }, `${labels.selected}: ${priced.lines.map((line) => T.lineText(line, labels).name).join(', ')}`));
    body.append(T.renderTotals(priced, labels));
    if (priced.needsEstimate) body.append(T.h('p', { class: 'summary-note' }, labels.summaryEstimate));
  }

  // Restore a shared or returning selection (?p=web-company,web-extra-page:3).
  for (const item of T.parseSelection(new URL(location.href).searchParams.get('p'), catalog)) {
    const box = checkbox(item.id);
    if (box) box.checked = true;
    const qty = qtyInput(item.id);
    if (qty) qty.value = String(item.qty);
  }

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.dataset.qty) {
      const box = checkbox(target.dataset.qty);
      if (box) box.checked = true;
    }
    if (target.dataset.pkg || target.dataset.qty) render();
  });
  summary.querySelector('[data-summary-clear]').addEventListener('click', () => {
    document.querySelectorAll('input[data-pkg]').forEach((box) => (box.checked = false));
    render();
  });

  render();
})();
