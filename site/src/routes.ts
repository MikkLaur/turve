import type { Lang } from '../../server/src/catalog/catalog';
import { CONTACT_PATH, THANK_YOU_PATH } from '../../server/src/catalog/sitePaths';

export type { Lang };
export const LANGS: readonly Lang[] = ['et', 'en'];

export type PageId = 'home' | 'websites' | 'security' | 'pricing' | 'check' | 'about' | 'contact' | 'thanks' | 'privacy';

export const ROUTES: Record<PageId, Record<Lang, string>> = {
  home: { et: '/', en: '/en/' },
  websites: { et: '/veebilehed/', en: '/en/websites/' },
  security: { et: '/turvalisus/', en: '/en/security/' },
  pricing: { et: '/hinnad/', en: '/en/pricing/' },
  check: { et: '/turvakontroll/', en: '/en/security-check/' },
  about: { et: '/meist/', en: '/en/about/' },
  contact: CONTACT_PATH,
  thanks: THANK_YOU_PATH,
  privacy: { et: '/privaatsus/', en: '/en/privacy/' },
};

/** Pages left out of the sitemap and marked noindex. */
export const UNLISTED: ReadonlySet<PageId> = new Set(['thanks']);

export const NAV: readonly PageId[] = ['websites', 'security', 'pricing', 'check', 'about'];

export function href(page: PageId, lang: Lang): string {
  return ROUTES[page][lang];
}
