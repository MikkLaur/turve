/**
 * Builds a client's one-page site into <client-dir>/dist/ (wiped first), ready to upload to the client's hosting.
 * Usage (from site/): npm run onepager -- <client-dir> --origin https://www.client.ee
 *
 * <client-dir>/site.ts: `export default { theme, content, colors } satisfies ClientSite` (see types.ts)
 * <client-dir>/img/:     the photos the content names (lower-case file names: jpg, jpeg, png or webp)
 * Client folders live in clients/ at the repo root, which git ignores.
 */
import fs from 'node:fs';
import path from 'node:path';
import { clientHtaccess } from './htaccess';
import { photosOf, renderOnePager } from './render';
import { THEMES } from './themes';
import type { ClientSite } from './types';

const CSS_DIR = path.resolve(__dirname, '../../assets/css');
const COLOR = /^#[0-9a-fA-F]{6}$/;
const PHOTO = /^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/;

function parseArgs(argv: string[]): { dir: string; origin: string } {
  const originAt = argv.indexOf('--origin');
  const origin = originAt >= 0 ? argv[originAt + 1] : undefined;
  const dir = argv.find((arg, i) => !arg.startsWith('--') && i !== originAt + 1);
  if (!dir || !origin) {
    throw new Error('Usage: npm run onepager -- <client-dir> --origin https://www.client.ee');
  }
  return { dir: path.resolve(dir), origin };
}

function colorsCss(colors: ClientSite['colors']): string {
  const vars: [string, string | undefined][] = [
    ['--op-accent', colors?.accent],
    ['--op-accent-text', colors?.accentText],
    ['--op-link', colors?.link],
  ];
  const lines = vars.flatMap(([name, value]) => {
    if (value === undefined) return [];
    if (!COLOR.test(value)) throw new Error(`colors: ${name} must be '#rrggbb' (got "${value}")`);
    return [`  ${name}: ${value};`];
  });
  return lines.length ? `/* The client's own colours. */\n:root {\n${lines.join('\n')}\n}\n` : '';
}

function build(dir: string, origin: string): void {
  const siteFile = path.join(dir, 'site.ts');
  if (!fs.existsSync(siteFile)) {
    throw new Error(`No site.ts in ${dir}`);
  }
  // tsx's require hook loads the client's TypeScript file.
  const site = (require(siteFile) as { default?: ClientSite }).default;
  if (!site || !site.content) {
    throw new Error(`${siteFile} must export default { theme, content, colors? }`);
  }
  if (!THEMES.some((theme) => theme.id === site.theme)) {
    throw new Error(`Unknown theme "${String(site.theme)}"; use one of: ${THEMES.map((t) => t.id).join(', ')}`);
  }
  const htaccess = clientHtaccess(origin);
  const colors = colorsCss(site.colors);
  const html = renderOnePager(site.content, { css: ['assets/base.css', 'assets/theme.css', 'assets/colors.css'], imgBase: 'img/' });

  const imgDir = path.join(dir, 'img');
  const photos = photosOf(site.content);
  for (const photo of photos) {
    if (!fs.existsSync(path.join(imgDir, photo))) {
      throw new Error(`Photo ${photo} is named in site.ts but missing from ${imgDir}`);
    }
  }

  const out = path.join(dir, 'dist');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  fs.copyFileSync(path.join(CSS_DIR, 'onepager-base.css'), path.join(out, 'assets/base.css'));
  fs.copyFileSync(path.join(CSS_DIR, `onepager-${site.theme}.css`), path.join(out, 'assets/theme.css'));
  fs.writeFileSync(path.join(out, 'assets/colors.css'), colors);
  fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  fs.writeFileSync(path.join(out, '.htaccess'), htaccess);

  let copied = 0;
  if (fs.existsSync(imgDir)) {
    fs.mkdirSync(path.join(out, 'img'));
    for (const name of fs.readdirSync(imgDir)) {
      if (PHOTO.test(name) && fs.statSync(path.join(imgDir, name)).isFile()) {
        fs.copyFileSync(path.join(imgDir, name), path.join(out, 'img', name));
        copied++;
      } else {
        console.warn(`Skipped img/${name}: not a lower-case jpg, jpeg, png or webp file name`);
      }
    }
  }
  console.log(`Built ${out} for ${origin} (design ${site.theme}, ${copied} photo(s)).`);
}

if (require.main === module) {
  try {
    const { dir, origin } = parseArgs(process.argv.slice(2));
    build(dir, origin);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
