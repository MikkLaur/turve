import type { Localized } from '../../../server/src/catalog/catalog';

export type GuideKey = 'name' | 'cta' | 'intro' | 'services' | 'about' | 'testimonials' | 'contact' | 'brand' | 'gallery';

export interface GuideEntry {
  key: GuideKey;
  title: Localized;
  text: Localized;
}

/**
 * What the client must provide, shown as the per-section notes in the demos. The list also works as a checklist for the
 * free consultation.
 */
export const GUIDE: readonly GuideEntry[] = [
  {
    key: 'name',
    title: { et: 'Nimi ja lööklause', en: 'Name and tagline' },
    text: { et: 'Ettevõtte nimi ja üks lause, mis ütleb, mida teete.', en: 'Your business name and one sentence on what you do.' },
  },
  {
    key: 'cta',
    title: { et: 'Peamine nupp', en: 'Main button' },
    text: { et: 'Mida peaks külastaja kõigepealt tegema: helistama, kirjutama või aja broneerima?', en: 'What should a visitor do first: call, write, or book a time?' },
  },
  {
    key: 'intro',
    title: { et: 'Tutvustus', en: 'Introduction' },
    text: { et: '2–3 lauset: mida teete, kellele ja mis teeb teid eriliseks.', en: '2–3 sentences: what you do, for whom, and what makes you different.' },
  },
  {
    key: 'services',
    title: { et: 'Teenused', en: 'Services' },
    text: {
      et: '3–6 teenust, igaühe kohta üks-kaks lauset. Hinnad, kui soovite neid näidata.',
      en: '3–6 services with a sentence or two each. Prices, if you want to show them.',
    },
  },
  {
    key: 'about',
    title: { et: 'Teie või meeskond', en: 'You or your team' },
    text: {
      et: 'Foto ja 2–3 lauset teist või meeskonnast. Inimesed ostavad inimestelt.',
      en: 'A photo and 2–3 sentences about you or your team. People buy from people.',
    },
  },
  {
    key: 'testimonials',
    title: { et: 'Klientide tagasiside (valikuline)', en: 'Customer quotes (optional)' },
    text: { et: '2–3 lühikest tsitaati päris klientidelt, nende loal.', en: '2–3 short quotes from real customers, with their permission.' },
  },
  {
    key: 'contact',
    title: { et: 'Kontakt', en: 'Contact' },
    text: { et: 'Telefon, e-post, aadress ja lahtiolekuajad.', en: 'Phone, e-mail, address and opening hours.' },
  },
  {
    key: 'brand',
    title: { et: 'Logo ja värvid', en: 'Logo and colours' },
    text: { et: 'Logo (kui on) ja 1–2 värvi, mis teile sobivad.', en: 'Your logo (if you have one) and 1–2 colours you like.' },
  },
  {
    key: 'gallery',
    title: { et: 'Tehtud tööd', en: 'Your work' },
    text: {
      et: '3–6 pilti teie tööst, ruumidest või toodetest, igaühe juurde lühike allkiri. Telefoniga tehtud pildid sobivad, kui neil on hea valgus.',
      en: '3–6 photos of your work, premises or products, each with a short caption. Phone photos are fine if the light is good.',
    },
  },
];

/** Looks up a guide entry; throws on an unknown key. */
export function guide(key: GuideKey): GuideEntry {
  const entry = GUIDE.find((g) => g.key === key);
  if (!entry) {
    throw new Error(`Unknown guide key: ${key}`);
  }
  return entry;
}
