import { COMPANY } from './config';
import type { PageContext, PageOutput } from './context';
import { html, jsonBlock, raw, toString } from './html';
import { href, LANGS, NAV, ROUTES } from './routes';

function alternates(page: PageOutput, ctx: PageContext) {
  if (!page.id) {
    return '';
  }
  const id = page.id;
  return html`${LANGS.map((lang) => html`<link rel="alternate" hreflang="${lang}" href="${ctx.cfg.siteOrigin}${ROUTES[id][lang]}">`)}
    <link rel="alternate" hreflang="x-default" href="${ctx.cfg.siteOrigin}${ROUTES[id].et}">`;
}

function header(page: PageOutput, ctx: PageContext) {
  const { t, lang } = ctx;
  const other = lang === 'et' ? 'en' : 'et';
  const switchHref = page.id ? href(page.id, other) : href('home', other);
  return html`<header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="${href('home', lang)}" aria-label="Turve – ${t.nav.label}"><span class="brand-word">turve</span><span class="brand-cursor" aria-hidden="true"></span></a>
      <nav class="site-nav" aria-label="${t.nav.label}">
        <ul>
          ${NAV.map(
            (id) => html`<li><a href="${href(id, lang)}"${page.id === id ? raw(' aria-current="page"') : ''}>${t.nav[id as keyof typeof t.nav]}</a></li>`,
          )}
        </ul>
      </nav>
      <div class="header-actions">
        <a class="lang-switch" href="${switchHref}" hreflang="${other}" lang="${other}" title="${t.nav.switchLangLabel}">${t.nav.switchLang}</a>
        <a class="button small" href="${href('contact', lang)}">${t.nav.cta}</a>
      </div>
    </div>
  </header>`;
}

function footer(ctx: PageContext) {
  const { t, lang } = ctx;
  const legal = [COMPANY.legalName, COMPANY.regCode && `${t.footer.regCode} ${COMPANY.regCode}`, COMPANY.address].filter(Boolean);
  return html`<footer class="site-footer">
    <div class="wrap footer-inner">
      <div>
        <a class="brand brand-small" href="${href('home', lang)}"><span class="brand-word">turve</span><span class="brand-cursor" aria-hidden="true"></span></a>
        <p>${t.footer.tagline}</p>
        ${legal.length ? html`<p class="muted">${legal.join(' · ')}</p>` : ''}
        ${COMPANY.email ? html`<p><a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>` : ''}
      </div>
      <ul class="footer-links">
        ${NAV.map((id) => html`<li><a href="${href(id, lang)}">${t.nav[id as keyof typeof t.nav]}</a></li>`)}
        <li><a href="${href('contact', lang)}">${t.footer.contact}</a></li>
        <li><a href="${href('privacy', lang)}">${t.footer.privacy}</a></li>
        <li><a href="/.well-known/security.txt">${t.footer.securityTxt}</a></li>
      </ul>
    </div>
    <div class="wrap"><p class="no-tracking">${t.footer.noTracking}</p></div>
  </footer>`;
}

export function renderPage(page: PageOutput, ctx: PageContext): string {
  const { t, cfg, asset } = ctx;
  const canonical = page.id ? `${cfg.siteOrigin}${ROUTES[page.id][ctx.lang]}` : null;
  const doc = html`<!doctype html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  ${page.noindex ? raw('<meta name="robots" content="noindex">') : ''}
  ${canonical ? html`<link rel="canonical" href="${canonical}">` : ''}
  ${alternates(page, ctx)}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Turve">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:locale" content="${t.ogLocale}">
  ${canonical ? html`<meta property="og:url" content="${canonical}">` : ''}
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#0d1b2a">
  <meta name="turve-api" content="${cfg.apiOrigin}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/assets/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/ibm-plex-sans-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${asset('css/site.css')}">
  ${(page.scripts ?? []).map((script) => html`<script src="${asset(script)}" defer></script>`)}
  ${page.jsonLd ? jsonBlock(null, page.jsonLd, 'application/ld+json') : ''}
</head>
<body>
  <a class="skip-link" href="#main">${t.nav.skip}</a>
  ${header(page, ctx)}
  <main id="main" tabindex="-1">
${page.body}
  </main>
  ${footer(ctx)}
</body>
</html>
`;
  return toString(doc);
}
