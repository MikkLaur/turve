'use strict';
// Shared helpers for the turve.ee pages. No framework, no innerHTML: everything is built with
// createElement/textContent, so nothing from the API or the URL can inject markup.
window.Turve = (() => {
  const apiOrigin = document.querySelector('meta[name="turve-api"]')?.getAttribute('content') || '';
  const lang = document.documentElement.lang === 'en' ? 'en' : 'et';
  const locale = lang === 'en' ? 'en-IE' : 'et-EE';

  function json(id) {
    const el = document.getElementById(id);
    return el ? JSON.parse(el.textContent) : null;
  }

  function euros(cents) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  }

  function hours(minutes) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(minutes / 60)} h`;
  }

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'class') el.className = value;
      else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value === true ? '' : String(value));
    }
    for (const child of children.flat()) {
      if (child === null || child === undefined || child === false) continue;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return el;
  }

  async function api(path, body) {
    const response = await fetch(apiOrigin + path, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'omit',
      mode: 'cors',
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    return { status: response.status, ok: response.ok, data };
  }

  /** "id:qty,id" → [{id, qty}], keeping only packages that exist, with quantities clamped. */
  function parseSelection(text, catalog) {
    const seen = new Set();
    const items = [];
    for (const part of String(text || '').split(',')) {
      const [id, rawQty] = part.trim().split(':');
      const pkg = catalog.packages.find((p) => p.id === id);
      if (!pkg || seen.has(id)) continue;
      seen.add(id);
      const qty = Math.min(Math.max(parseInt(rawQty || '1', 10) || 1, 1), pkg.maxQty);
      items.push({ id, qty });
    }
    return items;
  }

  function selectionString(items) {
    return items.map((item) => (item.qty > 1 ? `${item.id}:${item.qty}` : item.id)).join(',');
  }

  /** Display totals only; the API prices the selection again from its own catalog. */
  function priceItems(items, catalog) {
    const result = { lines: [], onceMinutes: 0, onceCents: 0, monthlyMinutes: 0, monthlyCents: 0, needsEstimate: false };
    for (const item of items) {
      const pkg = catalog.packages.find((p) => p.id === item.id);
      if (!pkg) continue;
      const minutes = pkg.minutes === null ? 0 : pkg.minutes * item.qty;
      const cents = pkg.cents === null ? 0 : pkg.cents * item.qty;
      result.lines.push({ pkg, qty: item.qty, minutes, cents });
      if (pkg.minutes === null) result.needsEstimate = true;
      if (pkg.billing === 'monthly') {
        result.monthlyMinutes += minutes;
        result.monthlyCents += cents;
      } else {
        result.onceMinutes += minutes;
        result.onceCents += cents;
      }
    }
    return result;
  }

  /** Summary lines + totals, shared by the estimator and the contact page. */
  function renderTotals(priced, labels) {
    const totals = h('p', { class: 'summary-totals' });
    if (priced.onceMinutes || !priced.monthlyMinutes) {
      totals.append(h('span', null, `${labels.summaryOnce}: `, h('strong', null, `${hours(priced.onceMinutes)} · ${euros(priced.onceCents)}`)));
    }
    if (priced.monthlyMinutes) {
      totals.append(
        h('span', null, `${labels.summaryMonthly}: `, h('strong', null, `${hours(priced.monthlyMinutes)} · ${euros(priced.monthlyCents)} ${labels.perMonth}`)),
      );
    }
    return totals;
  }

  function lineText(line, labels) {
    const qty = line.qty > 1 ? ` × ${line.qty}` : '';
    if (line.pkg.minutes === null) return { name: `${line.pkg.name}${qty}`, value: labels.estimateAfterReview };
    const monthly = line.pkg.billing === 'monthly' ? ` ${labels.perMonth}` : '';
    return { name: `${line.pkg.name}${qty}`, value: `${hours(line.minutes)} · ${euros(line.cents)}${monthly}` };
  }

  return { apiOrigin, lang, json, euros, hours, h, api, parseSelection, selectionString, priceItems, renderTotals, lineText };
})();
