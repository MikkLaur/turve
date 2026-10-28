/**
 * The ONE source of turve.ee rates and packages.
 * - The site build (site/src) imports this file and bakes it into the pricing and contact pages and the estimator.
 * - The API prices inquiries from it; prices sent by the browser are never trusted.
 * Changing anything here: bump CATALOG_VERSION, then deploy the API and the site together (DEPLOY_STATIC='site …').
 * Ids are stored in inquiries and invoices: never reuse an id for a different package.
 */

export type Lang = 'et' | 'en';
export type Localized = Record<Lang, string>;
export type LocalizedList = Record<Lang, readonly string[]>;

export type RateId = 'web' | 'security';
export type GroupId = 'websites' | 'modernising' | 'security' | 'monthly';

export interface Rate {
  id: RateId;
  centsPerHour: number;
  name: Localized;
}

export interface Group {
  id: GroupId;
  name: Localized;
  intro: Localized;
}

export interface Package {
  id: string;
  group: GroupId;
  rate: RateId;
  billing: 'once' | 'monthly';
  /** Work per unit (per month for monthly packages); a multiple of BILLING_STEP_MINUTES. null = set after a review. */
  minutes: number | null;
  /** Highest quantity the estimator offers; 1 = on/off. */
  maxQty: number;
  name: Localized;
  summary: Localized;
  includes: LocalizedList;
  /** Shown next to the price, e.g. costs billed at cost on top. */
  priceNote?: Localized;
}

export const CATALOG_VERSION = '2026-10-28.1';

/** Work is logged and billed in 15-minute steps. */
export const BILLING_STEP_MINUTES = 15;

export const RATES: readonly Rate[] = [
  { id: 'web', centsPerHour: 5500, name: { et: 'Veebitöö', en: 'Web work' } },
  { id: 'security', centsPerHour: 7500, name: { et: 'Turvatöö', en: 'Security work' } },
];

export const GROUPS: readonly Group[] = [
  {
    id: 'websites',
    name: { et: 'Uued veebilehed', en: 'New websites' },
    intro: {
      et: 'Kiired ja turvalised lehed, mis on algusest peale ehitatud nii, et neid oleks raske rünnata.',
      en: 'Fast, secure sites, built from day one to be hard to attack.',
    },
  },
  {
    id: 'modernising',
    name: { et: 'Vanade veebilehtede uuendamine', en: 'Modernising older websites' },
    intro: {
      et: 'Teil on juba leht, mis on vananenud, aeglane või ebaturvaline? Teeme selle korda või lisame uusi võimalusi.',
      en: 'Already have a site that is outdated, slow or insecure? We fix it up or add new features.',
    },
  },
  {
    id: 'security',
    name: { et: 'Turvateenused', en: 'Security services' },
    intro: {
      et: 'Väikeettevõttele jõukohased turvateenused, mida teeb päris turvainsener.',
      en: 'Security services priced for small companies, done by a working security engineer.',
    },
  },
  {
    id: 'monthly',
    name: { et: 'Igakuised paketid', en: 'Monthly plans' },
    intro: {
      et: 'Hooldus teie veebilehele ja püsiv turvatugi ettevõttele. Kasutamata tunnid järgmisse kuusse ei kandu.',
      en: 'Care for your website and ongoing security support for your company. Unused hours do not carry over.',
    },
  },
];

export const PACKAGES: readonly Package[] = [
  // --- New websites
  {
    id: 'web-onepage',
    group: 'websites',
    rate: 'web',
    billing: 'once',
    minutes: 12 * 60,
    maxQty: 1,
    name: { et: 'Ühelehine koduleht', en: 'One-page business site' },
    summary: {
      et: 'Kiire ja turvaline visiitkaart-leht: kes te olete, mida pakute ja kuidas teid leida.',
      en: 'A fast, secure single page: who you are, what you offer and how to reach you.',
    },
    includes: {
      et: [
        'Kujundus teie logo ja värvidega',
        'Kuni 6 sisuplokki (teenused, meist, kontakt jne)',
        'Mobiilisõbralik ja kiire',
        'HTTPS ja turvapäised paigas',
        'Otsingumootorite põhiseaded',
      ],
      en: [
        'Design using your logo and colours',
        'Up to 6 content sections (services, about, contact, …)',
        'Mobile-friendly and fast',
        'HTTPS and security headers set up',
        'Search engine basics',
      ],
    },
  },
  {
    id: 'web-company',
    group: 'websites',
    rate: 'web',
    billing: 'once',
    minutes: 28 * 60,
    maxQty: 1,
    name: { et: 'Ettevõtte koduleht', en: 'Company website' },
    summary: {
      et: 'Kuni 5 alamlehega koduleht eesti ja inglise keeles, koos kontaktivormiga.',
      en: 'A website with up to 5 pages in Estonian and English, with a contact form.',
    },
    includes: {
      et: [
        'Kuni 5 alamlehte',
        'Eesti ja inglise keel',
        'Kontaktivorm rämpspostikaitsega',
        'HTTPS, turvapäised ja range sisuturbepoliitika (CSP)',
        'Otsingumootorite põhiseaded ja sisukaart (sitemap)',
        'Üleandmine koos kogu lähtekoodiga',
      ],
      en: [
        'Up to 5 pages',
        'Estonian and English',
        'Contact form with spam protection',
        'HTTPS, security headers and a strict Content Security Policy',
        'Search engine basics and sitemap',
        'Handover with the full source code',
      ],
    },
  },
  {
    id: 'web-extra-page',
    group: 'websites',
    rate: 'web',
    billing: 'once',
    minutes: 2 * 60,
    maxQty: 20,
    name: { et: 'Lisaleht', en: 'Extra page' },
    summary: {
      et: 'Iga alamleht üle paketis sisalduva.',
      en: 'Each page beyond what the package includes.',
    },
    includes: {
      et: ['Paigutus lehe olemasolevas stiilis', 'Teie antud tekst ja pildid'],
      en: ["Layout in the site's existing style", 'Your text and images'],
    },
  },
  {
    id: 'web-extra-language',
    group: 'websites',
    rate: 'web',
    billing: 'once',
    minutes: 4 * 60,
    maxQty: 3,
    name: { et: 'Lisakeel', en: 'Extra language' },
    summary: {
      et: 'Uus keel kogu lehele, näiteks vene keel. Tõlke annate teie.',
      en: 'A new language for the whole site, for example Russian. You supply the translation.',
    },
    includes: {
      et: ['Keelevahetaja ja eraldi aadressid (nt /ru/)', 'Keeleviited otsingumootoritele (hreflang)'],
      en: ['Language switcher and separate addresses (e.g. /ru/)', 'Language hints for search engines (hreflang)'],
    },
  },
  {
    id: 'web-inquiry-admin',
    group: 'websites',
    rate: 'web',
    billing: 'once',
    minutes: 16 * 60,
    maxQty: 1,
    name: { et: 'Päringuvorm ja halduspaneel', en: 'Inquiry form and admin panel' },
    summary: {
      et: 'Päringud salvestuvad andmebaasi ja te haldate neid oma turvalises halduspaneelis.',
      en: 'Inquiries are saved to a database and you manage them in your own secure admin panel.',
    },
    includes: {
      et: [
        'Vorm rämpspostikaitsega, ilma kolmanda osapoole captchata',
        'Halduspaneel parooli ja kaheastmelise sisselogimisega',
        'Päringute olekud ja märkmed',
        'Andmete kustutamine isikuandmete kaitse nõuete järgi',
      ],
      en: [
        'Form with spam protection and no third-party captcha',
        'Admin panel with password and two-factor sign-in',
        'Inquiry statuses and notes',
        'Data deletion in line with GDPR',
      ],
    },
  },
  {
    id: 'web-booking',
    group: 'websites',
    rate: 'web',
    billing: 'once',
    minutes: 40 * 60,
    maxQty: 1,
    name: { et: 'Broneerimissüsteem', en: 'Booking system' },
    summary: {
      et: 'Kliendid broneerivad aja ise veebis, teie haldate broneeringuid halduspaneelis. Näide: kamblakoda.ee.',
      en: 'Customers book a time online and you manage bookings in your admin panel. Example: kamblakoda.ee.',
    },
    includes: {
      et: [
        'Teenused, kestused ja lahtiolekuajad',
        'Vabad ajad arvestavad puhkepäevi ja puhveraega',
        'Halduspaneel: kinnitamine, ümberbroneerimine, tühistamine',
        'Topeltbroneeringud on välistatud',
      ],
      en: [
        'Services, durations and opening hours',
        'Free slots respect days off and buffer time',
        'Admin panel: confirm, reschedule, cancel',
        'Double bookings are prevented',
      ],
    },
  },

  // --- Modernising older websites
  {
    id: 'mod-review',
    group: 'modernising',
    rate: 'web',
    billing: 'once',
    minutes: 4 * 60,
    maxQty: 1,
    name: { et: 'Vana lehe ülevaatus ja uuendusplaan', en: 'Old site review and modernisation plan' },
    summary: {
      et: 'Vaatame teie praeguse lehe üle ja ütleme täpselt, mida ja mis hinnaga tasub uuendada.',
      en: "We review your current site and tell you exactly what's worth modernising, and at what price.",
    },
    includes: {
      et: [
        'Tehnoloogia, versioonid ja pistikprogrammid',
        'Turvalisus, kiirus ja otsingunähtavus',
        'Kirjalik plaan koos tundide ja hindadega',
        '30-minutiline kõne tulemuste üle',
      ],
      en: [
        'Technology, versions and plugins',
        'Security, speed and search visibility',
        'Written plan with hours and prices',
        '30-minute call about the results',
      ],
    },
  },
  {
    id: 'mod-security-update',
    group: 'modernising',
    rate: 'web',
    billing: 'once',
    minutes: 8 * 60,
    maxQty: 1,
    name: { et: 'Turvauuendus', en: 'Security update' },
    summary: {
      et: 'Vana WordPressi või muu lehe turvaliseks tegemine ilma lehte ümber tegemata.',
      en: 'Make an old WordPress or other site safe again without rebuilding it.',
    },
    includes: {
      et: [
        'Süsteemi ja pistikprogrammide uuendamine, mittevajalike eemaldamine',
        'HTTPS ja turvapäised',
        'Halduskasutajate ülevaatus ja kaheastmeline sisselogimine',
        'Varundus ja taastamise proov',
      ],
      en: [
        'Updating the system and plugins, removing what is not needed',
        'HTTPS and security headers',
        'Review of admin users and two-factor sign-in',
        'Backups and a restore test',
      ],
    },
  },
  {
    id: 'mod-speed-seo',
    group: 'modernising',
    rate: 'web',
    billing: 'once',
    minutes: 6 * 60,
    maxQty: 1,
    name: { et: 'Kiiruse ja otsingunähtavuse korrastus', en: 'Speed and search visibility tidy-up' },
    summary: {
      et: 'Leht laeb kiiremini ja otsingumootorid saavad sellest paremini aru.',
      en: 'The site loads faster and search engines understand it better.',
    },
    includes: {
      et: [
        'Piltide ja laadimise optimeerimine',
        'Pealkirjad, kirjeldused ja struktureeritud andmed',
        'Sisukaart ja Google Search Console',
        'Mõõtmine enne ja pärast',
      ],
      en: [
        'Image and loading optimisation',
        'Titles, descriptions and structured data',
        'Sitemap and Google Search Console',
        'Measured before and after',
      ],
    },
  },
  {
    id: 'mod-new-look',
    group: 'modernising',
    rate: 'web',
    billing: 'once',
    minutes: 24 * 60,
    maxQty: 1,
    name: { et: 'Uus kuub kaasaegsel tehnoloogial', en: 'New look on a modern stack' },
    summary: {
      et: 'Ehitame lehe uuesti kiirel ja turvalisel tehnoloogial. Sisu ja aadressid jäävad, nii et otsingukohad ei kao.',
      en: 'We rebuild the site on fast, secure technology. Content and addresses stay, so search rankings are kept.',
    },
    includes: {
      et: [
        'Kuni 10 olemasolevat lehte üle viidud',
        'Vanad aadressid suunatakse õigesse kohta (301)',
        'Uus kujundus või olemasoleva värskendus',
        'Ilma andmebaasi ja pistikprogrammideta, seega vähem rünnatavat',
      ],
      en: [
        'Up to 10 existing pages moved over',
        'Old addresses redirect to the right place (301)',
        'New design or a refresh of the current one',
        'No database or plugins, so far less to attack',
      ],
    },
  },
  {
    id: 'mod-new-feature',
    group: 'modernising',
    rate: 'web',
    billing: 'once',
    minutes: null,
    maxQty: 1,
    name: { et: 'Uus funktsioon olemasolevale lehele', en: 'New feature for an existing site' },
    summary: {
      et: 'Broneerimine, päringuvorm, uus keel, liidestus vms teie praegusele lehele. Tunnid selguvad ülevaatusel.',
      en: 'Booking, an inquiry form, a new language, an integration or similar, added to your current site. Hours are set in the review.',
    },
    includes: {
      et: ['Hinnang tundides enne töö algust', 'Töö algab ainult teie kinnitusel'],
      en: ['An estimate in hours before work starts', 'Work starts only once you approve'],
    },
  },

  // --- Security services
  {
    id: 'sec-checkup',
    group: 'security',
    rate: 'security',
    billing: 'once',
    minutes: 6 * 60,
    maxQty: 1,
    name: { et: 'Turva-tervisekontroll', en: 'Security health check' },
    summary: {
      et: 'Kiire ja soodne ülevaade väikeettevõtte levinumatest turvaaukudest koos parandusplaaniga.',
      en: "A quick, affordable look at a small company's most common security gaps, with a plan to fix them.",
    },
    includes: {
      et: [
        'Domeen ja e-post: SPF, DKIM ja DMARC võltskirjade vastu',
        'Veebilehe HTTPS ja turvapäised',
        'Microsoft 365 või Google Workspace’i seaded',
        'Paroolid ja kaheastmeline sisselogimine',
        'Varundus: kas ja kui kiiresti saate taastada',
        'Kirjalik aruanne ja 45-minutiline kõne',
      ],
      en: [
        'Domain and e-mail: SPF, DKIM and DMARC against spoofed mail',
        'Website HTTPS and security headers',
        'Microsoft 365 or Google Workspace settings',
        'Passwords and two-factor sign-in',
        'Backups: can you restore, and how fast',
        'Written report and a 45-minute call',
      ],
    },
  },
  {
    id: 'sec-pentest-site',
    group: 'security',
    rate: 'security',
    billing: 'once',
    minutes: 16 * 60,
    maxQty: 1,
    name: { et: 'Veebilehe või e-poe läbistustest', en: 'Website or web shop pentest' },
    summary: {
      et: 'Testime teie lehte nii, nagu teeks ründaja: kokkulepitud ulatuses ja teie kirjalikul loal.',
      en: 'We test your site the way an attacker would: within an agreed scope and with your written permission.',
    },
    includes: {
      et: [
        'Käsitsi testimine OWASP Top 10 põhjal',
        'Sisselogimine, vormid, maksed ja haldusliides',
        'Aruanne: leiud, riskitase ja parandusjuhised',
        'Kokkuvõte juhtkonnale arusaadavas keeles',
      ],
      en: [
        'Manual testing based on the OWASP Top 10',
        'Sign-in, forms, payments and the admin interface',
        'Report: findings, risk level and how to fix them',
        'A plain-language summary for management',
      ],
    },
  },
  {
    id: 'sec-pentest-app',
    group: 'security',
    rate: 'security',
    billing: 'once',
    minutes: 32 * 60,
    maxQty: 1,
    name: { et: 'Veebirakenduse läbistustest', en: 'Web application pentest' },
    summary: {
      et: 'Põhjalikum test kasutajakontodega rakendusele: kliendiportaal, SaaS või ettevõtte siserakendus.',
      en: 'A deeper test for an application with user accounts: a customer portal, SaaS or internal business app.',
    },
    includes: {
      et: [
        'Kuni 3 kasutajarolli',
        'Õiguste ja ligipääsu kontroll (kas üks klient näeb teise andmeid)',
        'Rakenduse API testimine',
        'Aruanne, parandusjuhised ja tulemuste koosolek',
      ],
      en: [
        'Up to 3 user roles',
        "Access control (can one customer see another's data)",
        "Testing the application's API",
        'Report, fix guidance and a results meeting',
      ],
    },
  },
  {
    id: 'sec-retest',
    group: 'security',
    rate: 'security',
    billing: 'once',
    minutes: 4 * 60,
    maxQty: 1,
    name: { et: 'Kordustest', en: 'Re-test after fixes' },
    summary: {
      et: 'Kontrollime, et läbistustesti leiud on päriselt parandatud.',
      en: 'We check that the pentest findings are really fixed.',
    },
    includes: {
      et: ['Iga leiu uuesti testimine', 'Uuendatud aruanne'],
      en: ['Every finding tested again', 'Updated report'],
    },
  },
  {
    id: 'sec-compliance',
    group: 'security',
    rate: 'security',
    billing: 'once',
    minutes: 12 * 60,
    maxQty: 1,
    name: { et: 'Nõuetele vastavuse kaardistus', en: 'Compliance gap analysis' },
    summary: {
      et: 'Kus te täna olete E-ITSi, NIS2, ISO 27001 või isikuandmete kaitse nõuetega ja mida on vaja teha.',
      en: 'Where you stand today against E-ITS, NIS2, ISO 27001 or GDPR, and what needs to be done.',
    },
    includes: {
      et: [
        'Intervjuud ja dokumentide ülevaatus',
        'Puuduste nimekiri prioriteetidega',
        'Tegevuskava koos tundide ja hindadega',
        'Üks standard või nõuete kogum paketi kohta',
      ],
      en: [
        'Interviews and document review',
        'List of gaps by priority',
        'Action plan with hours and prices',
        'One standard or set of requirements per package',
      ],
    },
  },

  // --- Monthly
  {
    id: 'care-s',
    group: 'monthly',
    rate: 'web',
    billing: 'monthly',
    minutes: 60,
    maxQty: 1,
    name: { et: 'Hoolduspakett S', en: 'Care plan S' },
    summary: {
      et: 'Teie leht püsib uuendatud, varundatud ja jälgitud.',
      en: 'Your site stays updated, backed up and monitored.',
    },
    includes: {
      et: [
        'Majutus',
        'Uuendused ja turvaparandused',
        'Igapäevane varundus',
        'Saadavuse ja sertifikaadi jälgimine',
        '1 tund muudatusi kuus',
      ],
      en: ['Hosting', 'Updates and security fixes', 'Daily backups', 'Uptime and certificate monitoring', '1 hour of changes per month'],
    },
    priceNote: { et: '+ majutus omahinnaga', en: '+ hosting at cost' },
  },
  {
    id: 'care-m',
    group: 'monthly',
    rate: 'web',
    billing: 'monthly',
    minutes: 3 * 60,
    maxQty: 1,
    name: { et: 'Hoolduspakett M', en: 'Care plan M' },
    summary: {
      et: 'Kõik, mis paketis S, rohkemate muudatustundide ja igakuise turvaülevaatega.',
      en: 'Everything in plan S, with more hours for changes and a monthly security report.',
    },
    includes: {
      et: ['Kõik paketist S', '3 tundi muudatusi kuus', 'Igakuine turvaülevaade'],
      en: ['Everything in plan S', '3 hours of changes per month', 'Monthly security report'],
    },
    priceNote: { et: '+ majutus omahinnaga', en: '+ hosting at cost' },
  },
  {
    id: 'sec-partner',
    group: 'monthly',
    rate: 'security',
    billing: 'monthly',
    minutes: 4 * 60,
    maxQty: 1,
    name: { et: 'Turvapartner', en: 'Security partner' },
    summary: {
      et: 'Osalise ajaga turvaspetsialist teie ettevõttele: regulaarne kontroll, nõu ja abi, kui midagi juhtub.',
      en: 'A part-time security specialist for your company: regular checks, advice, and help when something happens.',
    },
    includes: {
      et: [
        'Igakuine domeeni, e-posti ja veebilehe kontroll',
        'Nõu turvaküsimustes ja tarnijate valikul',
        'Abi turvaintsidendi korral (tööajal)',
        '4 tundi kuus, lisatunnid tunnihinnaga',
      ],
      en: [
        'Monthly check of domain, e-mail and website',
        'Advice on security questions and choosing suppliers',
        'Help during a security incident (business hours)',
        '4 hours per month, extra hours at the hourly rate',
      ],
    },
  },
];

export function findPackage(id: string): Package | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export function findRate(id: RateId): Rate {
  const rate = RATES.find((r) => r.id === id);
  if (!rate) {
    throw new Error(`Unknown rate ${id}`);
  }
  return rate;
}

/** Price of `minutes` of work at a rate, in cents. Minutes are multiples of 15, so this is exact for whole-euro rates. */
export function priceCents(minutes: number, rate: RateId): number {
  return Math.round((minutes * findRate(rate).centsPerHour) / 60);
}
