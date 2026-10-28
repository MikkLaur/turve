import type { Lang } from './catalog';

/**
 * Public site paths the API needs to know (no-JS form redirects). The site build imports these too,
 * and fails if a page with this path doesn't exist, so the two can't drift apart.
 */
export const THANK_YOU_PATH: Record<Lang, string> = { et: '/aitah/', en: '/en/thank-you/' };
export const CONTACT_PATH: Record<Lang, string> = { et: '/kontakt/', en: '/en/contact/' };
