'use strict';
// Launch offer counter: fills [data-offer-status] from the API. Without JS or on an error the static text stays.
(() => {
  const T = window.Turve;
  const labels = T && T.json('offer-labels');
  const targets = document.querySelectorAll('[data-offer-status]');
  if (!labels || !targets.length) return;
  T.api('/api/launch-offer')
    .then((res) => {
      if (!res.ok || !res.data) return;
      const { left, spots, open } = res.data;
      const text = open
        ? labels.left.replace('{left}', String(left)).replace('{spots}', String(spots))
        : left === 0
          ? labels.full
          : labels.ended;
      targets.forEach((el) => {
        el.textContent = text;
        el.classList.toggle('closed', !open);
      });
      // A closed offer can't be added in the price calculator any more.
      if (!open) document.querySelectorAll('[data-offer-card] [data-pick]').forEach((el) => el.remove());
    })
    .catch(() => {});
})();
