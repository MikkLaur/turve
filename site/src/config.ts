/** Build-time settings. `dev` builds point at the local API and include the style tile. */
export interface SiteConfig {
  dev: boolean;
  siteOrigin: string;
  apiOrigin: string;
}

export function siteConfig(dev: boolean): SiteConfig {
  return dev
    ? { dev, siteOrigin: 'http://localhost:8080', apiOrigin: 'http://localhost:3000' }
    : { dev, siteOrigin: 'https://www.turve.ee', apiOrigin: 'https://api.turve.ee' };
}

/**
 * Company details for the footer, privacy policy, security.txt and structured data.
 * Turve is a brand of Lõvikonserv OÜ. The address is left out on purpose (it is the owner's home address);
 * the footer links the company to the e-Business Register, which shows the official one.
 */
export const COMPANY = {
  brand: 'Turve',
  legalName: 'Lõvikonserv OÜ',
  regCode: '16869757',
  email: 'info@turve.ee',
  phone: '+372 5192 8421',
};

/** The company's public entry in the Estonian e-Business Register. */
export function registerUrl(lang: 'et' | 'en'): string {
  return `https://ariregister.rik.ee/${lang === 'et' ? 'est' : 'eng'}/company/${COMPANY.regCode}`;
}

/** Fills {legalName}, {regCode} and {email} in a text; a missing value stays visible as [key] so it gets noticed. */
export function fillCompany(text: string): string {
  return text.replace(/\{(legalName|regCode|email)\}/g, (_m, key: 'legalName' | 'regCode' | 'email') => COMPANY[key] || `[${key}]`);
}

/** A tel: link for a displayed phone number such as '+372 5192 8421'. */
export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** The person behind Turve (about page). The build lists empty fields as TODO. */
export const PERSON = {
  name: 'Mikk Laur',
  role: { et: 'Turvainsener · Turve asutaja', en: 'Security engineer · founder of Turve' },
  // 640×640 WebP made from the original with metadata stripped (magick … -resize 640x640 -strip).
  photo: 'img/person.webp',
  linkedin: 'https://www.linkedin.com/in/mikk-laur/',
};
