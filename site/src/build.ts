/**
 * Builds www.turve.ee into site/dist/: both languages, assets with content hashes, sitemap, .htaccess,
 * security.txt. Fails on broken internal links. Usage: npm run build (production) | tsx src/build.ts --dev
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { COMPANY, PERSON, SiteConfig, siteConfig } from './config';
import type { PageContext, PageOutput } from './context';
import { htaccess } from './headers';
import { en } from './i18n/en';
import { et } from './i18n/et';
import { renderPage } from './layout';
import { aboutPage } from './pages/about';
import { checkPage } from './pages/check';
import { contactPage } from './pages/contact';
import { homePage } from './pages/home';
import { pricingPage } from './pages/pricing';
import { securityPage } from './pages/security';
import { notFoundPage, privacyPage, thanksPage } from './pages/simple';
import { styleTilePage } from './pages/styletile';
import { websitesPage } from './pages/websites';
import { LANGS, PageId, ROUTES, UNLISTED } from './routes';

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ASSETS = path.join(ROOT, 'assets');
const FONT_FILES = [
  ['ibm-plex-sans', 'latin', 400], ['ibm-plex-sans', 'latin-ext', 400],
  ['ibm-plex-sans', 'latin', 500], ['ibm-plex-sans', 'latin-ext', 500],
  ['ibm-plex-sans', 'latin', 600], ['ibm-plex-sans', 'latin-ext', 600],
  ['ibm-plex-mono', 'latin', 400], ['ibm-plex-mono', 'latin-ext', 400],
  ['ibm-plex-mono', 'latin', 500], ['ibm-plex-mono', 'latin-ext', 500],
] as const;

const PAGES: [PageId, (ctx: PageContext) => PageOutput][] = [
  ['home', homePage],
  ['websites', websitesPage],
  ['security', securityPage],
  ['pricing', pricingPage],
  ['check', checkPage],
  ['about', aboutPage],
  ['contact', contactPage],
  ['thanks', thanksPage],
  ['privacy', privacyPage],
];

function write(urlPath: string, content: string | Buffer): void {
  const file = path.join(DIST, urlPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function hashed(name: string, content: Buffer): string {
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 10);
  const ext = path.extname(name);
  return `${path.basename(name, ext)}.${hash}${ext}`;
}

/** Copies assets; CSS/JS get a content hash in the name (cached for a year). Returns logical path → URL. */
function copyAssets(): Map<string, string> {
  const map = new Map<string, string>();
  for (const dir of ['css', 'js']) {
    for (const name of fs.readdirSync(path.join(ASSETS, dir))) {
      const content = fs.readFileSync(path.join(ASSETS, dir, name));
      const url = `/assets/${hashed(name, content)}`;
      write(url, content);
      map.set(`${dir}/${name}`, url);
    }
  }
  for (const name of fs.readdirSync(path.join(ASSETS, 'img'))) {
    const content = fs.readFileSync(path.join(ASSETS, 'img', name));
    if (name === 'favicon.svg') {
      write('/favicon.svg', content);
    } else {
      write(`/assets/img/${name}`, content);
      map.set(`img/${name}`, `/assets/img/${name}`);
    }
  }
  for (const [family, subset, weight] of FONT_FILES) {
    const file = `${family}-${subset}-${weight}-normal.woff2`;
    write(`/assets/fonts/${file}`, fs.readFileSync(path.join(ROOT, 'node_modules/@fontsource', family, 'files', file)));
  }
  write('/assets/fonts/OFL.txt', fs.readFileSync(path.join(ROOT, 'node_modules/@fontsource/ibm-plex-sans/LICENSE')));
  return map;
}

function sitemap(cfg: SiteConfig): string {
  const urls = (Object.keys(ROUTES) as PageId[])
    .filter((id) => !UNLISTED.has(id))
    .flatMap((id) =>
      LANGS.map(
        (lang) => `  <url>
    <loc>${cfg.siteOrigin}${ROUTES[id][lang]}</loc>
${LANGS.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${cfg.siteOrigin}${ROUTES[id][alt]}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${cfg.siteOrigin}${ROUTES[id].et}"/>
  </url>`,
      ),
    );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

/** RFC 9116. Expires 6 months after the build: deploy the site at least twice a year. */
function securityTxt(cfg: SiteConfig): string {
  const expires = new Date(Date.now() + 182 * 86_400_000);
  expires.setUTCHours(0, 0, 0, 0);
  return [
    ...(COMPANY.email ? [`Contact: mailto:${COMPANY.email}`] : []),
    `Contact: ${cfg.siteOrigin}${ROUTES.contact.et}`,
    `Expires: ${expires.toISOString().replace('.000Z', 'Z')}`,
    'Preferred-Languages: et, en',
    `Canonical: ${cfg.siteOrigin}/.well-known/security.txt`,
    '',
  ].join('\n');
}

function listHtml(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listHtml(full) : entry.name.endsWith('.html') ? [full] : [];
  });
}

/** Every root-relative href/src/action in the output must point at a built file. */
function checkLinks(): string[] {
  const broken: string[] = [];
  for (const file of listHtml(DIST)) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(/\s(?:href|src|action)="(\/(?!\/)[^"]*)"/g)) {
      const target = decodeURI(match[1]!.split(/[?#]/)[0]!);
      const onDisk = path.join(DIST, target.endsWith('/') ? `${target}index.html` : target);
      if (!fs.existsSync(onDisk)) {
        broken.push(`${path.relative(DIST, file)} → ${match[1]}`);
      }
    }
  }
  return broken;
}

function todos(): string[] {
  const list: string[] = [];
  for (const key of ['legalName', 'regCode', 'address', 'email'] as const) {
    if (!COMPANY[key]) list.push(`COMPANY.${key} is empty (site/src/config.ts)`);
  }
  if (!PERSON.name) list.push('PERSON.name is empty (site/src/config.ts)');
  if (!PERSON.photo) list.push('PERSON.photo is empty (site/src/config.ts)');
  for (const [lang, t] of [['et', et], ['en', en]] as const) {
    if (t.about.personBio.some((p) => p.includes('['))) list.push(`about.personBio (${lang}) still has a [placeholder]`);
  }
  return list;
}

export function build(dev: boolean): void {
  const cfg = siteConfig(dev);
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const assets = copyAssets();
  const asset = (logical: string) => {
    const url = assets.get(logical);
    if (!url) {
      throw new Error(`Unknown asset: ${logical}`);
    }
    return url;
  };

  for (const lang of LANGS) {
    const ctx: PageContext = { lang, t: lang === 'et' ? et : en, cfg, asset };
    for (const [id, builder] of PAGES) {
      const page = builder(ctx);
      if (page.id !== id) {
        throw new Error(`Page builder for ${id} returned id ${page.id}`);
      }
      write(`${ROUTES[id][lang]}index.html`, renderPage(page, ctx));
    }
  }
  const etCtx: PageContext = { lang: 'et', t: et, cfg, asset };
  write('/404.html', renderPage(notFoundPage(etCtx), etCtx));
  if (dev) {
    write('/stiil/index.html', renderPage(styleTilePage(etCtx), etCtx));
  }

  write('/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${cfg.siteOrigin}/sitemap.xml\n`);
  write('/sitemap.xml', sitemap(cfg));
  write('/.htaccess', htaccess(cfg));
  write('/.well-known/security.txt', securityTxt(cfg));

  const broken = checkLinks();
  if (broken.length) {
    throw new Error(`Broken internal links:\n  ${broken.join('\n  ')}`);
  }
  const pending = todos();
  console.log(`Built ${LANGS.length * PAGES.length + 1}${dev ? ' (+ style tile)' : ''} pages into ${path.relative(process.cwd(), DIST) || DIST} for ${cfg.siteOrigin}`);
  if (pending.length) {
    console.log(`TODO before launch:\n  - ${pending.join('\n  - ')}`);
  }
}

if (require.main === module) {
  try {
    build(process.argv.includes('--dev'));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
