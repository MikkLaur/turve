import type { Localized } from '../../../server/src/catalog/catalog';
import type { ThemeId } from './types';

/** Each design has its own CSS file: site/assets/css/onepager-<id>.css (on top of onepager-base.css). */
export const THEMES: readonly { id: ThemeId; name: Localized; description: Localized }[] = [
  {
    id: 'betoon',
    name: { et: 'Betoonitööd', en: 'Concrete works' },
    description: {
      et: 'Tugev ja selge, ehitusvärvides. Sobib ka teistele ehitus- ja välitöödele: katused, haljastus, teedeehitus.',
      en: 'Strong and clear, in construction colours. Also suits other building and outdoor trades: roofing, landscaping, paving.',
    },
  },
  {
    id: 'keevitus',
    name: { et: 'Keevitustöökoda', en: 'Welding workshop' },
    description: {
      et: 'Tume ja kontrastne, sädemeoranžiga. Sobib ka teistele töökodadele: autoremont, puusepad, metallitööd.',
      en: 'Dark and high-contrast, with spark orange. Also suits other workshops: car repair, carpentry, metalwork.',
    },
  },
  {
    id: 'manikuur',
    name: { et: 'Maniküürisalong', en: 'Manicure salon' },
    description: {
      et: 'Pehme ja hubane. Sobib ka teistele ilu- ja heaoluteenustele: juuksur, kosmeetik, massaaž.',
      en: 'Soft and cosy. Also suits other beauty and wellbeing services: hair, skincare, massage.',
    },
  },
  {
    id: 'universaalne',
    name: { et: 'Universaalne', en: 'Universal' },
    description: {
      et: 'Rahulik ja neutraalne. Sobib igale valdkonnale, kui ükski teine ei tundu õige.',
      en: 'Calm and neutral. Suits any line of business when none of the others feels right.',
    },
  },
];
