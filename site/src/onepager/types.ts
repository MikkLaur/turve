/** The one-pager kit's designs: unlisted demos at /naidised/<id>/ and the starting point of every year-end-offer site. */
export type ThemeId = 'betoon' | 'keevitus' | 'manikuur' | 'universaalne';

/**
 * A one-page site's content. Content sections: intro, services, about and contact are required; gallery and
 * testimonials are optional (at most 6 in all, matching the one-pager package).
 * All `photo` fields are file names in the client's img/ folder; without one, a captioned placeholder box is shown.
 */
export interface OnePagerContent {
  lang: 'et' | 'en';
  businessName: string;
  tagline: string;
  /** href must start with tel:, mailto: or https:// */
  cta: { label: string; href: string };
  intro: { title: string; text: string };
  /** 1–6 items */
  services: { title: string; items: { name: string; text: string; price?: string }[] };
  /** 1–6 items */
  gallery?: { title: string; items: { caption: string; photo?: string }[] };
  about: { title: string; text: string; photo?: string; photoAlt: string };
  /** 1–3 items */
  testimonials?: { title: string; items: { quote: string; author: string }[] };
  contact: { title: string; phone?: string; email?: string; address?: string; mapUrl?: string; hours?: { days: string; time: string }[] };
  /** "Kodulehe tegi turve.ee" in the footer (a condition of the launch offer). */
  credit: boolean;
}

/** A client's site.ts default export, read by the client build CLI (cli.ts). */
export interface ClientSite {
  theme: ThemeId;
  content: OnePagerContent;
  /** Optional colour overrides, '#rrggbb' only. */
  colors?: { accent?: string; accentText?: string; link?: string };
}
