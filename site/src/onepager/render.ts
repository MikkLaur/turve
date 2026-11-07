/**
 * Renders a one-page site from OnePagerContent: the demos at /naidised/<id>/ and every client's site (cli.ts).
 * Everything goes through the escaping html tag; no scripts, no inline styles, no third-party content.
 * Demo mode adds the example bar, the dashed section outlines with label chips and the ✎ guide notes; client sites
 * carry none of that markup.
 */
import { html, Raw, toString } from '../html';
import { guide, GuideKey } from './guide';
import type { OnePagerContent } from './types';

export interface RenderOptions {
  /** Stylesheet URLs, in order: base, design, optional client colours. */
  css: string[];
  /** URL prefix for content photos, e.g. 'img/'. */
  imgBase: string;
  demo?: { themeName: string; chooseHref: string; examplesHref: string };
}

const HREF = /^(tel:\+?[0-9 ]+|mailto:[^\s"<>]+|https:\/\/[^\s"<>]+)$/;
const PHOTO = /^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/;

const UI = {
  et: { menu: 'Menüü', phone: 'Telefon', email: 'E-post', address: 'Aadress', hours: 'Lahtiolekuajad', map: 'Vaata kaardil', photo: 'Foto', credit: 'Kodulehe tegi' },
  en: { menu: 'Menu', phone: 'Phone', email: 'E-mail', address: 'Address', hours: 'Opening hours', map: 'View on map', photo: 'Photo', credit: 'Website by' },
} as const;

function fail(message: string): never {
  throw new Error(`One-pager content: ${message}`);
}

function validate(c: OnePagerContent): void {
  if (!HREF.test(c.cta.href)) fail(`cta.href must start with tel:, mailto: or https:// (got "${c.cta.href}")`);
  if (c.contact.mapUrl !== undefined && !HREF.test(c.contact.mapUrl)) fail(`contact.mapUrl must be a tel:, mailto: or https:// link (got "${c.contact.mapUrl}")`);
  const count = (name: string, n: number, max: number) => {
    if (n < 1 || n > max) fail(`${name} must have 1–${max} items (has ${n})`);
  };
  count('services.items', c.services.items.length, 6);
  if (c.gallery) count('gallery.items', c.gallery.items.length, 6);
  if (c.testimonials) count('testimonials.items', c.testimonials.items.length, 3);
  const photos = [c.about.photo, ...(c.gallery?.items.map((item) => item.photo) ?? [])];
  for (const photo of photos) {
    if (photo !== undefined && !PHOTO.test(photo)) fail(`photo "${photo}" must be a lower-case file name like team-1.jpg (jpg, jpeg, png or webp)`);
  }
}

/** Every photo file name the content refers to (for the client build, which copies them). */
export function photosOf(c: OnePagerContent): string[] {
  return [c.about.photo, ...(c.gallery?.items.map((item) => item.photo) ?? [])].filter((p): p is string => p !== undefined);
}

export function renderOnePager(c: OnePagerContent, opts: RenderOptions): string {
  validate(c);
  const ui = UI[c.lang];
  const demo = opts.demo;
  // Demo-only markup: a label chip (data-guide, shown by CSS) and a ✎ note under the section heading.
  const guideAttr = (key: GuideKey): Raw | string => (demo ? html` data-guide="${guide(key).title[c.lang]}"` : '');
  const note = (text: string): Raw | string => (demo ? html`<p class="op-guide">✎ ${text}</p>` : '');
  const noteFor = (key: GuideKey) => note(guide(key).text[c.lang]);
  const photo = (file: string | undefined, label: string, placeholder: string): Raw =>
    file
      ? html`<img src="${opts.imgBase}${file}" alt="${label}" loading="lazy">`
      : html`<div class="op-photo-placeholder" role="img" aria-label="${label}">${placeholder}</div>`;

  const nav = [
    { id: 'intro', title: c.intro.title },
    { id: 'services', title: c.services.title },
    ...(c.gallery ? [{ id: 'work', title: c.gallery.title }] : []),
    { id: 'about', title: c.about.title },
    { id: 'contact', title: c.contact.title },
  ];
  const { contact } = c;
  const year = new Date().getUTCFullYear();

  const doc = html`<!doctype html>
<html lang="${c.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${demo ? `Näidis: ${demo.themeName} | Turve` : c.businessName}</title>
  <meta name="description" content="${c.tagline}">
  ${demo ? html`<meta name="robots" content="noindex">` : ''}
  ${opts.css.map((href) => html`<link rel="stylesheet" href="${href}">`)}
</head>
<body class="op${demo ? ' op-demo' : ''}">
  ${demo
    ? html`<div class="op-demobar">Näidis · kujundus „${demo.themeName}” · <a href="${demo.chooseHref}">Vali see kujundus →</a> · <a href="${demo.examplesHref}">Kõik näidised</a></div>`
    : ''}
  <header class="op-header">
    <div class="op-wrap op-header-inner">
      <p class="op-brand">${c.businessName}</p>
      <nav class="op-nav" aria-label="${ui.menu}">
        <ul>${nav.map((item) => html`<li><a href="#${item.id}">${item.title}</a></li>`)}</ul>
      </nav>
    </div>
  </header>
  <main>
    <section class="op-hero"${guideAttr('name')}>
      <div class="op-wrap">
        <h1>${c.businessName}</h1>
        ${note(`${guide('name').text[c.lang]} ${guide('cta').text[c.lang]}`)}
        <p class="op-tagline">${c.tagline}</p>
        <p><a class="op-cta" href="${c.cta.href}">${c.cta.label}</a></p>
      </div>
    </section>

    <section class="op-section" id="intro"${guideAttr('intro')}>
      <div class="op-wrap">
        <h2>${c.intro.title}</h2>
        ${noteFor('intro')}
        <p class="op-lead">${c.intro.text}</p>
      </div>
    </section>

    <section class="op-section" id="services"${guideAttr('services')}>
      <div class="op-wrap">
        <h2>${c.services.title}</h2>
        ${noteFor('services')}
        <div class="op-grid">
          ${c.services.items.map(
            (item) => html`<article class="op-card">
            <h3>${item.name}</h3>
            <p>${item.text}</p>
            ${item.price ? html`<p class="op-price">${item.price}</p>` : ''}
          </article>`,
          )}
        </div>
      </div>
    </section>

    ${c.gallery
      ? html`<section class="op-section" id="work"${guideAttr('gallery')}>
      <div class="op-wrap">
        <h2>${c.gallery.title}</h2>
        ${noteFor('gallery')}
        <div class="op-grid">
          ${c.gallery.items.map(
            (item) => html`<figure class="op-figure">
            ${photo(item.photo, item.caption, ui.photo)}
            <figcaption>${item.caption}</figcaption>
          </figure>`,
          )}
        </div>
      </div>
    </section>`
      : ''}

    <section class="op-section" id="about"${guideAttr('about')}>
      <div class="op-wrap op-about">
        <div class="op-about-photo">${photo(c.about.photo, c.about.photoAlt, c.about.photoAlt)}</div>
        <div>
          <h2>${c.about.title}</h2>
          ${noteFor('about')}
          <p>${c.about.text}</p>
        </div>
      </div>
    </section>

    ${c.testimonials
      ? html`<section class="op-section" id="reviews"${guideAttr('testimonials')}>
      <div class="op-wrap">
        <h2>${c.testimonials.title}</h2>
        ${noteFor('testimonials')}
        <div class="op-grid">
          ${c.testimonials.items.map(
            (item) => html`<blockquote class="op-quote">
            <p>${item.quote}</p>
            <footer>${item.author}</footer>
          </blockquote>`,
          )}
        </div>
      </div>
    </section>`
      : ''}

    <section class="op-section" id="contact"${guideAttr('contact')}>
      <div class="op-wrap">
        <h2>${contact.title}</h2>
        ${noteFor('contact')}
        <div class="op-contact">
          <dl>
            ${contact.phone ? html`<dt>${ui.phone}</dt><dd><a href="tel:${contact.phone.replace(/[^0-9+]/g, '')}">${contact.phone}</a></dd>` : ''}
            ${contact.email ? html`<dt>${ui.email}</dt><dd><a href="mailto:${contact.email}">${contact.email}</a></dd>` : ''}
            ${contact.address ? html`<dt>${ui.address}</dt><dd>${contact.address}${contact.mapUrl ? html`<br><a href="${contact.mapUrl}">${ui.map}</a>` : ''}</dd>` : ''}
          </dl>
          ${contact.hours && contact.hours.length
            ? html`<table class="op-hours">
            <caption>${ui.hours}</caption>
            <tbody>${contact.hours.map((row) => html`<tr><th scope="row">${row.days}</th><td>${row.time}</td></tr>`)}</tbody>
          </table>`
            : ''}
        </div>
      </div>
    </section>
  </main>
  <footer class="op-footer">
    <div class="op-wrap">
      <p>© ${year} ${c.businessName}${c.credit ? html` · ${ui.credit} <a href="https://www.turve.ee/">turve.ee</a>` : ''}</p>
    </div>
  </footer>
</body>
</html>
`;
  return toString(doc);
}
