/* Kurva Nokitseb demo: scroll reveal only. No network requests; the page works without this file. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    var rows = document.querySelectorAll('.reveal');
    var show = function (el) { el.classList.add('is-in'); };

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(rows, show);
      return;
    }

    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); seen.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    Array.prototype.forEach.call(rows, function (el) { seen.observe(el); });
  });
}());
