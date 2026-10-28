import type { Messages } from './et';

// English texts. Typed as Messages, so every key in et.ts must exist here too.

export const en: Messages = {
  htmlLang: 'en',
  ogLocale: 'en_GB',

  nav: {
    skip: 'Skip to content',
    label: 'Main menu',
    websites: 'Websites',
    security: 'Security',
    pricing: 'Pricing',
    check: 'Security check',
    about: 'About',
    cta: 'Get a quote',
    switchLang: 'Eesti keeles',
    switchLangLabel: 'Loe seda lehte eesti keeles',
  },

  footer: {
    tagline: 'Secure websites and affordable cyber security for small businesses.',
    noTracking: 'This site has no tracking, no cookies and no third-party scripts.',
    privacy: 'Privacy',
    contact: 'Contact',
    regCode: 'Registry code',
    securityTxt: 'Report a security issue',
  },

  common: {
    perUnit: 'each',
    perMonth: 'per month',
    estimateAfterReview: 'hours set after review',
    hourlyRate: 'hourly rate',
    includes: 'Includes',
    readMore: 'Read more',
    seePrices: 'See prices',
    askOffer: 'Get a quote',
    freeCheck: 'Free security check',
    finalPrices: 'Prices are final: we are not VAT registered.',
  },

  home: {
    title: 'Turve – secure websites and cyber security for small businesses',
    description:
      'We build secure websites, modernise old ones and run affordable security checks and pentests for small businesses. You see every hour before you order.',
    eyebrow: 'Websites · Cyber security · For small businesses',
    heroTitle: 'Secure websites and affordable cyber security',
    heroLead:
      "We build new websites and bring old ones up to date, so they're hard to attack. We run security checks and pentests at prices that work for a small company. You see every hour before you order.",
    heroCheckLabel: 'Check your website for free',
    heroCheckPlaceholder: 'yourcompany.ee',
    heroCheckButton: 'Check',
    terminalCommand: 'turve check yourcompany.ee',
    terminalLines: [
      { status: 'ok', name: 'HTTPS', value: 'ok' },
      { status: 'ok', name: 'Certificate', value: '87 days' },
      { status: 'bad', name: 'HSTS', value: 'missing' },
      { status: 'bad', name: 'CSP', value: 'missing' },
      { status: 'warn', name: 'DMARC', value: 'p=none' },
    ],
    terminalGrade: 'Grade: C',
    servicesTitle: 'What we do',
    services: [
      {
        title: 'New websites',
        text: 'Fast, simple sites with few moving parts, so there is little to attack. In Estonian and English, as good on a phone as on a laptop.',
      },
      {
        title: 'Modernising older websites',
        text: "Your old website doesn't have to go. We update it, make it secure and fast, and add new features such as booking or another language.",
      },
      {
        title: 'Security services',
        text: 'Security health check, website or application pentest and compliance gap analysis. Reports are written so that management understands them too.',
      },
      {
        title: 'Care and security partner',
        text: "Monthly care keeps your site updated and backed up. A security partner is your company's part-time security specialist.",
      },
    ],
    modernTitle: "An old website? Don't throw it away.",
    modernText:
      "Many small-business websites were built years ago and haven't been updated since. An outdated WordPress or plugin is one of the most common ways attackers get in. We take such a site over, fix it, and build what you need today.",
    modernPoints: [
      'Review and a written plan with hours',
      'Security update without rebuilding the site',
      'A new look that keeps your content and search rankings',
      'New features for your existing site',
    ],
    whyTitle: 'Why Turve',
    why: [
      {
        title: 'A security engineer, not just a developer',
        text: 'Security is our day job. So we build sites the way an attacker looks at them, and test them the same way.',
      },
      {
        title: 'Every hour is visible',
        text: 'Every package is listed in hours and euros. You know what you pay for before you order, and the invoice comes with a time log.',
      },
      {
        title: 'No tracking',
        text: 'The sites we build carry no needless tracking scripts or third-party code. Neither does this one.',
      },
      {
        title: 'Check us yourself',
        text: 'Run turve.ee through our own security check. We aim for an A, and expect the same of the sites we build for you.',
      },
    ],
    processTitle: 'How it works',
    process: [
      { title: 'Pick packages', text: 'In the price calculator, or just describe what you need.' },
      { title: 'Get an exact quote', text: 'In hours and euros, within two working days.' },
      { title: 'Work starts when you approve', text: 'Extra work only if you have approved it first.' },
      { title: 'Invoice with a time log', text: 'You see exactly where the time went, to the quarter hour.' },
    ],
    referenceTitle: 'Our work',
    referenceName: 'Kämblakoda massage studio',
    referenceText:
      'Website in Estonian and English, a booking system that respects opening hours and days off, and an admin panel for confirming bookings.',
    referenceLink: 'kamblakoda.ee',
    finalTitle: "Let's talk about your website",
    finalText: 'Describe what you need, or pick packages from the price list. We reply within two working days.',
  },

  websites: {
    title: 'Websites – new and modernised | Turve',
    description:
      'Secure, fast websites for small businesses, and modernising older sites: security updates, a new look and new features. Prices in hours.',
    heading: 'Websites that are hard to attack',
    lead: 'We build new sites and bring old ones up to date. Either way, security is built in from the start, not bolted on later.',
    secureTitle: 'How we build securely',
    secure: [
      {
        title: 'Fewer moving parts',
        text: 'Where possible we build a static site: no database and no plugins to attack or keep updating.',
      },
      {
        title: 'Security headers and a strict CSP',
        text: 'HTTPS, HSTS and a Content Security Policy that allows only your own code. We verify the result with our own security check.',
      },
      {
        title: 'Minimal dependencies',
        text: 'Every outside library is a possible weak spot. We use them only when they are really needed.',
      },
      {
        title: 'The source code is yours',
        text: "You get the site with all of its code and a guide. You're never locked in.",
      },
    ],
    modernHeading: 'Modernising older websites',
    careHeading: 'Care plans',
    ctaTitle: 'Does your current site need modernising?',
    ctaText: 'Run the free security check. You see right away where the main problems are and which package fixes them.',
  },

  security: {
    title: 'Security services for small businesses | Turve',
    description:
      'Security health check, website and application pentests, E-ITS, NIS2 and ISO 27001 gap analysis, and a monthly security partner. Prices in hours.',
    heading: 'Cyber security a small business can afford',
    lead: 'Large security firms are often too expensive and too complex for a small company. We do the same work as clearly scoped packages, with the price visible up front.',
    partnerHeading: 'Ongoing security support',
    processTitle: 'How a pentest works',
    process: [
      { title: 'Scope', text: 'We agree what, when and how we test.' },
      { title: 'Written permission', text: 'We test only with your signed permission. Without it we do nothing.' },
      { title: 'Testing', text: "By hand and with tools, without disrupting your day-to-day work." },
      { title: 'Report', text: 'Findings by risk level, fix guidance and a summary for management.' },
      { title: 'Re-test', text: 'If you want, we check that the fixes work.' },
    ],
    complianceTitle: 'Requirements in plain language',
    compliance: [
      { name: 'E-ITS', text: 'The Estonian information security standard. Mandatory for the public sector and many of its partners.' },
      { name: 'NIS2', text: 'The EU cyber security directive, which covers many medium-sized companies and their suppliers.' },
      { name: 'ISO 27001', text: 'The international standard for information security management, often requested by larger customers.' },
      { name: 'GDPR', text: 'The General Data Protection Regulation requires appropriate security measures to protect personal data.' },
    ],
    principlesTitle: 'Principles',
    principles: [
      'We test only with written permission and within the agreed scope.',
      'Findings stay between you and us.',
      "We don't sell fear: we tell you honestly what really matters.",
    ],
    ctaTitle: 'Start with the free check',
    ctaText: 'The security check shows in a minute how your website and e-mail look to an attacker.',
  },

  pricing: {
    title: 'Pricing and calculator | Turve',
    description: 'Every package with exact hours and prices. Pick what you need and ask for a quote straight from the calculator.',
    heading: 'Pricing',
    lead: "Every package is listed in hours. Pick what you need and see the total straight away. Asking for a quote doesn't commit you to anything.",
    ratesTitle: 'Hourly rates',
    estimatorHint: 'Tick the packages you need. The summary is at the bottom of the page.',
    addLabel: 'Add',
    qtyLabel: 'Quantity',
    summaryTitle: 'Your selection',
    summaryEmpty: "You haven't picked any packages yet.",
    summaryOnce: 'One-off work',
    summaryMonthly: 'Monthly',
    summaryEstimate: 'Some work is estimated after a review.',
    summaryButton: 'Get a quote for this selection',
    summaryClear: 'Clear selection',
    noScript: 'The calculator needs JavaScript. Prices are visible without it; you can ask for a quote on the contact form.',
    termsTitle: 'How billing works',
    terms: [
      'Time is logged to the quarter hour and the invoice comes with a time log.',
      'Package hours are an agreed maximum. If the work takes less time, you pay less.',
      'Work outside a package is done only with your prior consent, at the hourly rate.',
      'Unused hours in monthly plans do not carry over to the next month.',
      'Hosting and other third-party costs are billed at cost.',
      'Invoices are payable within 14 days.',
      'A pentest starts only after written permission and an agreed scope.',
    ],
  },

  estimatorJs: {
    selected: 'Selected',
    remove: 'Remove',
    total: 'Total',
    hoursShort: 'h',
  },

  check: {
    title: 'Free website security check | Turve',
    description:
      "Check your website's HTTPS, security headers, certificate and e-mail protection (SPF, DKIM, DMARC) for free. Results and advice straight away.",
    heading: 'Free security check',
    lead: 'Enter your website address. In a minute you see how your site and e-mail domain look to an attacker.',
    label: 'Website address',
    placeholder: 'yourcompany.ee',
    button: 'Check',
    running: 'Checking… this usually takes less than 15 seconds.',
    noScript: 'The security check needs JavaScript.',
    whatTitle: 'What the check does',
    what: [
      'Opens your page once, like an ordinary visitor, and reads the security headers.',
      'Checks HTTPS, the certificate and TLS versions.',
      'Looks up e-mail protection (SPF, DKIM, DMARC) in public DNS records.',
    ],
    notTitle: "What the check doesn't do",
    not: [
      "It doesn't scan ports or probe for vulnerabilities.",
      "It doesn't store your IP address. We keep only the domain and the result.",
      "It's no substitute for a pentest: it's a first overview.",
    ],
    errors: {
      invalid_domain: "That's not a public web address. Enter something like yourcompany.ee.",
      not_found: "That domain wasn't found. Check the spelling.",
      not_public: "This address can't be checked because it isn't on the public internet.",
      busy: 'Lots of checks are running right now. Please try again in a minute.',
      rate_limited: 'Too many checks in a row. Please try again in an hour.',
      network: 'The connection dropped. Please try again.',
    },
    resultFor: 'Result for',
    grade: 'Grade',
    score: 'points out of 100',
    status: { pass: 'OK', warn: 'Warning', fail: 'Problem', info: 'Note' },
    fix: 'Fix',
    evidence: 'Found',
    problemsTitle: 'Problems found',
    okTitle: 'OK',
    noProblems: 'No major problems found. Well done!',
    suggestionsTitle: 'What would help',
    suggestionsText: 'These packages fix the problems found:',
    askOffer: 'Get a quote with this result attached',
    checkedAt: 'Checked',
    cachedNote: 'Each domain is checked at most once an hour; you are seeing the latest result.',
  },

  about: {
    title: 'About | Turve',
    description: 'Who is behind Turve: a security engineer who builds websites the way an attacker looks at them.',
    heading: 'Who is behind Turve',
    lead: 'Turve is a small company with one clear idea: a small business should be able to get a secure website and real security expertise at a price it can afford.',
    personTitle: 'The person',
    personBio: [
      'I work as a security engineer. [Add your background here: experience, areas, certifications.]',
      'Turve started when I saw how often small-business websites are outdated and unprotected, even though fixing them does not have to be expensive.',
    ],
    photoAlt: 'Portrait of the founder of Turve',
    valuesTitle: 'What we promise',
    values: [
      { title: 'Honesty', text: "We tell you when something doesn't need doing, even if that means a smaller invoice." },
      { title: 'Precision', text: 'Every hour is logged and justified.' },
      { title: 'Confidentiality', text: 'Your data and security findings go to no one else.' },
    ],
  },

  contact: {
    title: 'Get a quote | Turve',
    description: 'Ask for a quote for a website or security service. We reply within two working days.',
    heading: 'Get a quote',
    lead: 'Describe what you need. If you picked packages from the price list, they are listed below. We reply within two working days.',
    selectionTitle: 'Selected packages',
    selectionChange: 'Change selection',
    checkAttached: 'Security check result attached:',
    name: 'Name',
    company: 'Company',
    email: 'E-mail',
    phone: 'Phone',
    website: 'Current website',
    websiteHint: 'If you already have a site you want modernised or tested.',
    message: 'Message',
    messageHint: "What would you like done? What's the deadline?",
    optional: 'optional',
    consentBefore: 'I agree that Turve uses this data to answer my inquiry. Read more: ',
    consentLink: 'privacy',
    honeypot: 'Leave this field empty',
    submit: 'Send inquiry',
    sending: 'Sending…',
    errors: {
      fields: 'Please check the marked fields.',
      message: 'Write a message or pick at least one package from the price list.',
      rate_limited: 'Too many inquiries in a row. Please try again in an hour.',
      network: "The inquiry couldn't be sent. Please try again.",
    },
  },

  thanks: {
    title: 'Thank you! | Turve',
    description: 'Inquiry received.',
    heading: 'Thank you, your inquiry arrived',
    text: "We'll look at it and reply within two working days.",
    back: 'Back to the home page',
  },

  privacy: {
    title: 'Privacy | Turve',
    description: 'How Turve collects, uses and protects personal data.',
    heading: 'Privacy policy',
    sections: [
      {
        title: 'Who is responsible',
        paragraphs: ['The controller of personal data is {legalName} (registry code {regCode}, {address}). For questions, write to {email}.'],
      },
      {
        title: 'What data we collect',
        paragraphs: [
          'Quote requests: name, company, e-mail, phone, website, message and chosen packages. We use them only to answer your inquiry and make an offer (steps prior to a contract, GDPR Art. 6(1)(b)).',
          'Security check: the domain checked and the result. We do not store your IP address with it.',
          'Web server logs: our hosting provider briefly stores the IP address, time and page opened, for technical and security reasons (legitimate interest, Art. 6(1)(f)).',
        ],
      },
      {
        title: 'Cookies and tracking',
        paragraphs: ['The public website uses no cookies, analytics or third-party scripts. That is why there is no cookie banner either.'],
      },
      {
        title: 'How long we keep data',
        paragraphs: [
          'Inquiries that do not lead to a contract are deleted within 12 months at the latest. If we sign a contract, invoices and related data are kept for 7 years as the Estonian Accounting Act requires.',
        ],
      },
      {
        title: 'Who sees the data',
        paragraphs: ['Only Turve. The data is stored in Estonia on servers of Zone Media OÜ. We do not sell or pass on data to anyone.'],
      },
      {
        title: 'Your rights',
        paragraphs: [
          'You have the right to see, correct and delete your data and to object. Write to us and we will reply within one month. You can lodge a complaint with the Estonian Data Protection Inspectorate (www.aki.ee).',
        ],
      },
    ],
  },

  notFound: {
    title: 'Page not found | Turve',
    heading: "This page doesn't exist",
    text: 'The address may be wrong, or the page has moved.',
    back: 'Home page',
  },
};
