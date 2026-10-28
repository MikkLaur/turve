'use strict';
// Free security check: posts the domain to the API and renders the result as text.
(() => {
  const T = window.Turve;
  const form = document.getElementById('check-form');
  const config = T.json('check-labels');
  if (!form || !config) return;
  const L = config.labels;
  const statusBox = document.getElementById('check-status');
  const resultBox = document.getElementById('check-result');
  const input = form.elements.domain;
  const button = form.querySelector('button[type="submit"]');

  function setStatus(text) {
    if (text) {
      statusBox.textContent = text;
      statusBox.removeAttribute('hidden');
    } else {
      statusBox.setAttribute('hidden', '');
    }
  }

  function finding(item) {
    return T.h(
      'li',
      { class: `finding status-${item.status}` },
      T.h('span', { class: 'badge' }, L.status[item.status] || item.status),
      T.h(
        'div',
        null,
        T.h('strong', null, item.title),
        T.h('p', null, item.message),
        item.evidence ? T.h('p', { class: 'evidence' }, `${L.evidence}: ${item.evidence}`) : null,
        item.fix ? T.h('p', { class: 'fix' }, `${L.fix}: ${item.fix}`) : null,
      ),
    );
  }

  function render(result) {
    const problems = result.findings.filter((f) => f.status === 'fail' || f.status === 'warn');
    const rest = result.findings.filter((f) => f.status === 'pass' || f.status === 'info');
    const checkedAt = new Date(result.checkedAt).toLocaleString(T.lang === 'en' ? 'en-GB' : 'et-EE');
    const contactUrl = `${config.contactPath}?check=${encodeURIComponent(result.publicId)}&domain=${encodeURIComponent(result.domain)}` +
      (result.suggestions.length ? `&p=${encodeURIComponent(result.suggestions.map((s) => s.id).join(','))}` : '');

    resultBox.replaceChildren(
      T.h(
        'div',
        { class: 'check-summary' },
        T.h('p', { class: `grade grade-${result.grade.toLowerCase()}`, 'aria-label': `${L.grade} ${result.grade}` }, T.h('span', { 'aria-hidden': 'true' }, result.grade)),
        T.h(
          'div',
          null,
          T.h('p', { class: 'check-domain' }, `${L.resultFor} ${result.domain}`),
          T.h('p', { class: 'muted' }, `${L.grade} ${result.grade} · ${result.score} ${L.score}`),
          T.h('p', { class: 'muted' }, `${L.checkedAt}: ${checkedAt}`),
        ),
      ),
      T.h('h2', null, L.problemsTitle),
      problems.length ? T.h('ul', { class: 'findings' }, problems.map(finding)) : T.h('p', null, L.noProblems),
      result.suggestions.length
        ? T.h(
            'section',
            { class: 'selection' },
            T.h('h2', null, L.suggestionsTitle),
            T.h('p', null, L.suggestionsText),
            T.h(
              'ul',
              { class: 'selection-lines' },
              result.suggestions.map((s) =>
                T.h('li', null, T.h('span', null, s.name), T.h('span', null, s.cents === null ? L.estimateAfterReview : `${T.hours(s.minutes)} · ${T.euros(s.cents)}`)),
              ),
            ),
            T.h('p', null, T.h('a', { class: 'button', href: contactUrl }, L.askOffer)),
          )
        : null,
      T.h('details', { class: 'findings-ok' }, T.h('summary', null, `${L.okTitle} (${rest.length})`), T.h('ul', { class: 'findings' }, rest.map(finding))),
    );
  }

  async function run(domain) {
    const value = String(domain || '').trim();
    if (!value) return;
    const url = new URL(location.href);
    url.searchParams.set('domain', value);
    history.replaceState(null, '', url);

    resultBox.replaceChildren();
    setStatus(L.running);
    button.disabled = true;
    try {
      const res = await T.api('/api/security-check', { domain: value, lang: T.lang });
      if (res.ok && res.data) {
        setStatus('');
        render(res.data);
        resultBox.querySelector('.check-summary')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        return;
      }
      const code = res.status === 429 ? 'rate_limited' : (res.data && res.data.code) || 'network';
      setStatus(L.errors[code] || L.errors.network);
    } catch {
      setStatus(L.errors.network);
    } finally {
      button.disabled = false;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run(input.value);
  });

  // Arriving from the home page form (?domain=…) starts the check straight away.
  const initial = new URL(location.href).searchParams.get('domain');
  if (initial) {
    input.value = initial.slice(0, 253);
    run(input.value);
  }
})();
