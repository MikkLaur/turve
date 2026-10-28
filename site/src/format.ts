import type { Lang } from './routes';

const LOCALE: Record<Lang, string> = { et: 'et-EE', en: 'en-IE' };

export function euros(cents: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function hours(minutes: number, lang: Lang): string {
  return `${new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 2 }).format(minutes / 60)} h`;
}
