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
 * Company details for the footer, privacy policy and structured data.
 * Estonian law (InfoTS § 4) wants name, registry code and contact on the site: fill these before launch.
 * Empty values are left out of the page; the build lists them as TODO.
 */
export const COMPANY = {
  brand: 'Turve',
  legalName: '',
  regCode: '',
  address: '',
  email: '',
  phone: '',
};

/** The person behind Turve (about page). The build lists empty fields as TODO. */
export const PERSON = {
  name: '',
  role: { et: 'Turvainsener ja arendaja', en: 'Security engineer and developer' },
  photo: '', // e.g. 'img/person.webp' in assets/
  linkedin: '',
};
