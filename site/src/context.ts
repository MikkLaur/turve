import type { SiteConfig } from './config';
import type { Raw } from './html';
import type { Messages } from './i18n/et';
import type { Lang, PageId } from './routes';

export interface PageContext {
  lang: Lang;
  t: Messages;
  cfg: SiteConfig;
  /** Public URL of a built asset, e.g. asset('js/check.js') → /assets/check.3f2a1c9e01.js */
  asset: (path: string) => string;
}

export interface PageOutput {
  /** null for pages that exist in one form only (404, style tile). */
  id: PageId | null;
  title: string;
  description: string;
  body: Raw;
  scripts?: string[];
  noindex?: boolean;
  jsonLd?: unknown;
}
