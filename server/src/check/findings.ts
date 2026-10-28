import type { Lang, Localized } from '../catalog/catalog';
import type { Finding, FindingId, FindingStatus } from './types';

export type Area = 'web' | 'tls' | 'mail' | 'dns';

interface FindingDefinition {
  area: Area;
  /** Points lost on 'fail'; 'warn' loses half. 'pass' and 'info' lose nothing. */
  weight: number;
  title: Localized;
  messages: Partial<Record<FindingStatus, Localized>>;
  /** Shown for warn/fail. */
  fix?: Localized;
}

export const FINDINGS: Record<FindingId, FindingDefinition> = {
  'https.available': {
    area: 'tls',
    weight: 30,
    title: { et: 'HTTPS', en: 'HTTPS' },
    messages: {
      pass: { et: 'Leht avaneb turvalise HTTPS-ühendusega.', en: 'The site opens over a secure HTTPS connection.' },
      fail: {
        et: 'Leht ei avane HTTPS-iga. Külastajate andmed liiguvad krüpteerimata ja brauserid märgivad lehe ebaturvaliseks.',
        en: 'The site does not open over HTTPS. Visitor data travels unencrypted and browsers mark the site as not secure.',
      },
    },
    fix: { et: 'Paigaldage tasuta Let’s Encrypti sertifikaat ja suunake kõik päringud HTTPS-ile.', en: 'Install a free Let’s Encrypt certificate and redirect everything to HTTPS.' },
  },
  'tls.certificate': {
    area: 'tls',
    weight: 25,
    title: { et: 'Sertifikaat', en: 'Certificate' },
    messages: {
      pass: { et: 'Sertifikaat kehtib ja vastab domeenile.', en: 'The certificate is valid and matches the domain.' },
      warn: { et: 'Sertifikaat aegub peagi.', en: 'The certificate expires soon.' },
      fail: { et: 'Sertifikaat ei kehti. Brauserid näitavad külastajatele hoiatust.', en: 'The certificate is not valid. Browsers show visitors a warning.' },
    },
    fix: { et: 'Seadistage sertifikaadi automaatne uuendamine.', en: 'Set the certificate to renew automatically.' },
  },
  'tls.version': {
    area: 'tls',
    weight: 10,
    title: { et: 'TLS-i versioon', en: 'TLS version' },
    messages: {
      pass: { et: 'Ühendus kasutab kaasaegset TLS-i versiooni.', en: 'The connection uses a modern TLS version.' },
      fail: { et: 'Ühendus kasutab vananenud TLS-i versiooni.', en: 'The connection uses an outdated TLS version.' },
    },
    fix: { et: 'Lubage serveris TLS 1.2 ja 1.3.', en: 'Enable TLS 1.2 and 1.3 on the server.' },
  },
  'tls.legacy': {
    area: 'tls',
    weight: 8,
    title: { et: 'Vanad TLS-i versioonid', en: 'Old TLS versions' },
    messages: {
      pass: { et: 'Server keeldub vananenud TLS 1.0 ja 1.1 ühendustest.', en: 'The server refuses outdated TLS 1.0 and 1.1 connections.' },
      warn: { et: 'Server lubab endiselt vananenud TLS 1.0 või 1.1 ühendusi.', en: 'The server still accepts outdated TLS 1.0 or 1.1 connections.' },
    },
    fix: { et: 'Keelake serveris TLS 1.0 ja 1.1.', en: 'Disable TLS 1.0 and 1.1 on the server.' },
  },
  'http.redirect': {
    area: 'web',
    weight: 12,
    title: { et: 'Suunamine HTTPS-ile', en: 'Redirect to HTTPS' },
    messages: {
      pass: { et: 'Krüpteerimata http:// aadress suunab HTTPS-ile.', en: 'The unencrypted http:// address redirects to HTTPS.' },
      info: { et: 'Krüpteerimata http:// ühendusi ei võeta vastu.', en: 'Unencrypted http:// connections are not accepted.' },
      fail: { et: 'Leht on kättesaadav ka krüpteerimata http:// aadressil ilma suunamiseta.', en: 'The site is also served over unencrypted http:// without a redirect.' },
    },
    fix: { et: 'Suunake kõik http:// päringud püsisuunamisega (301) HTTPS-ile.', en: 'Redirect every http:// request to HTTPS with a permanent (301) redirect.' },
  },
  'header.hsts': {
    area: 'web',
    weight: 10,
    title: { et: 'HSTS', en: 'HSTS' },
    messages: {
      pass: { et: 'Brauserid on kohustatud kasutama ainult HTTPS-i (Strict-Transport-Security).', en: 'Browsers are told to use HTTPS only (Strict-Transport-Security).' },
      warn: { et: 'Strict-Transport-Security on olemas, kuid kehtib liiga lühikest aega.', en: 'Strict-Transport-Security is set, but for too short a time.' },
      fail: { et: 'Strict-Transport-Security puudub, ühenduse saab rünnates krüpteerimata ühenduseks pöörata.', en: 'Strict-Transport-Security is missing, so an attacker can downgrade the connection to unencrypted.' },
    },
    fix: { et: 'Lisage päis Strict-Transport-Security: max-age=31536000.', en: 'Add the header Strict-Transport-Security: max-age=31536000.' },
  },
  'header.csp': {
    area: 'web',
    weight: 8,
    title: { et: 'Sisuturbepoliitika (CSP)', en: 'Content Security Policy' },
    messages: {
      pass: { et: 'Content-Security-Policy piirab, milliseid skripte leht käivitada tohib.', en: 'Content-Security-Policy limits which scripts the page may run.' },
      warn: { et: 'Content-Security-Policy on olemas, kuid lubab tekstisiseseid skripte (unsafe-inline).', en: "Content-Security-Policy is set but allows inline scripts ('unsafe-inline')." },
      fail: { et: 'Content-Security-Policy puudub. Kui lehele satub pahatahtlik skript, ei takista seda miski.', en: 'Content-Security-Policy is missing. If a malicious script gets onto the page, nothing stops it.' },
    },
    fix: { et: 'Lisage range Content-Security-Policy, mis lubab skripte ainult teie enda domeenilt.', en: 'Add a strict Content-Security-Policy that allows scripts from your own domain only.' },
  },
  'header.nosniff': {
    area: 'web',
    weight: 4,
    title: { et: 'X-Content-Type-Options', en: 'X-Content-Type-Options' },
    messages: {
      pass: { et: 'Brauser ei arva failitüüpe ise (nosniff).', en: 'The browser does not guess file types (nosniff).' },
      fail: { et: 'Päis X-Content-Type-Options: nosniff puudub.', en: 'The header X-Content-Type-Options: nosniff is missing.' },
    },
    fix: { et: 'Lisage päis X-Content-Type-Options: nosniff.', en: 'Add the header X-Content-Type-Options: nosniff.' },
  },
  'header.framing': {
    area: 'web',
    weight: 5,
    title: { et: 'Kaitse raamimise vastu', en: 'Framing protection' },
    messages: {
      pass: { et: 'Teised lehed ei saa teie lehte nähtamatult raamida (clickjacking).', en: 'Other sites cannot frame your page invisibly (clickjacking).' },
      fail: { et: 'Teie lehte saab raamida võõrale lehele ja kasutajat petta (clickjacking).', en: 'Your page can be framed on a foreign site to trick users (clickjacking).' },
    },
    fix: { et: "Lisage CSP-sse frame-ancestors 'self' või päis X-Frame-Options: DENY.", en: "Add frame-ancestors 'self' to the CSP or the header X-Frame-Options: DENY." },
  },
  'header.referrer': {
    area: 'web',
    weight: 2,
    title: { et: 'Referrer-Policy', en: 'Referrer-Policy' },
    messages: {
      pass: { et: 'Lehe aadressid ei leki teistele saitidele (Referrer-Policy).', en: 'Page addresses do not leak to other sites (Referrer-Policy).' },
      warn: { et: 'Referrer-Policy puudub, brauser kasutab vaikimisi reeglit.', en: 'Referrer-Policy is missing; the browser uses its default.' },
    },
    fix: { et: 'Lisage päis Referrer-Policy: strict-origin-when-cross-origin.', en: 'Add the header Referrer-Policy: strict-origin-when-cross-origin.' },
  },
  'header.permissions': {
    area: 'web',
    weight: 0,
    title: { et: 'Permissions-Policy', en: 'Permissions-Policy' },
    messages: {
      pass: { et: 'Lehele on keelatud mittevajalikud brauseri õigused (kaamera, mikrofon jne).', en: 'Unneeded browser features (camera, microphone, …) are switched off.' },
      info: { et: 'Permissions-Policy puudub. Pole kriitiline, kuid hea tava.', en: 'Permissions-Policy is missing. Not critical, but good practice.' },
    },
  },
  'cookies.flags': {
    area: 'web',
    weight: 6,
    title: { et: 'Küpsised', en: 'Cookies' },
    messages: {
      pass: { et: 'Avaleht ei sea küpsiseid või on need korrektselt kaitstud.', en: 'The home page sets no cookies, or they are properly protected.' },
      warn: { et: 'Mõni küpsis on kaitseta (puudub Secure või HttpOnly).', en: 'Some cookies are unprotected (missing Secure or HttpOnly).' },
    },
    fix: { et: 'Märkige küpsised atribuutidega Secure, HttpOnly ja SameSite.', en: 'Mark cookies Secure, HttpOnly and SameSite.' },
  },
  'disclosure.server': {
    area: 'web',
    weight: 4,
    title: { et: 'Serveri versioon', en: 'Server version' },
    messages: {
      pass: { et: 'Server ei avalikusta tarkvara versioone.', en: 'The server does not reveal software versions.' },
      warn: { et: 'Server avalikustab tarkvara versiooni, mis aitab ründajal sobivat rünnakut valida.', en: 'The server reveals a software version, which helps an attacker pick an exploit.' },
      fail: { et: 'Server kasutab tarkvara, mille turvatugi on lõppenud.', en: 'The server runs software that no longer gets security updates.' },
    },
    fix: { et: 'Uuendage tarkvara toetatud versioonile ja peitke versiooninumbrid.', en: 'Update to a supported version and hide version numbers.' },
  },
  'disclosure.generator': {
    area: 'web',
    weight: 3,
    title: { et: 'Sisuhaldussüsteemi versioon', en: 'CMS version' },
    messages: {
      pass: { et: 'Leht ei avalikusta sisuhaldussüsteemi versiooni.', en: 'The page does not reveal its CMS version.' },
      warn: { et: 'Leht avalikustab sisuhaldussüsteemi ja selle versiooni.', en: 'The page reveals its CMS and its version.' },
    },
    fix: { et: 'Hoidke süsteem uuendatud ja eemaldage versioon lehe koodist.', en: 'Keep the system updated and remove the version from the page source.' },
  },
  securitytxt: {
    area: 'web',
    weight: 0,
    title: { et: 'security.txt', en: 'security.txt' },
    messages: {
      pass: { et: 'Lehel on security.txt, nii teavad turvauurijad, kuidas teiega ühendust võtta.', en: 'The site has a security.txt, so security researchers know how to reach you.' },
      info: { et: 'security.txt puudub. Turvauurijad ei tea, kuhu leitud vigadest teatada.', en: 'No security.txt. Security researchers do not know where to report issues.' },
    },
  },
  'mail.mx': {
    area: 'mail',
    weight: 0,
    title: { et: 'E-posti vastuvõtt', en: 'Receiving e-mail' },
    messages: {
      pass: { et: 'Domeen võtab e-posti vastu.', en: 'The domain receives e-mail.' },
      info: {
        et: 'Domeen ei võta e-posti vastu. Siis peaks SPF olema -all ja DMARC p=reject, et keegi teie nimel kirju ei saadaks.',
        en: 'The domain does not receive e-mail. SPF should then be -all and DMARC p=reject, so nobody can send mail in your name.',
      },
    },
  },
  'mail.spf': {
    area: 'mail',
    weight: 10,
    title: { et: 'SPF', en: 'SPF' },
    messages: {
      pass: { et: 'SPF-kirje ütleb, millised serverid tohivad teie nimel kirju saata.', en: 'The SPF record says which servers may send mail in your name.' },
      warn: { et: 'SPF-kirje on olemas, kuid ei keela teisi saatjaid.', en: 'There is an SPF record, but it does not block other senders.' },
      fail: { et: 'SPF-kirje puudub või on vigane. Teie nimel saab saata võltskirju.', en: 'The SPF record is missing or broken. Anyone can send fake mail in your name.' },
    },
    fix: { et: 'Lisage üks SPF-kirje, mis lõpeb -all või ~all.', en: 'Add one SPF record ending in -all or ~all.' },
  },
  'mail.dmarc': {
    area: 'mail',
    weight: 10,
    title: { et: 'DMARC', en: 'DMARC' },
    messages: {
      pass: { et: 'DMARC käsib võltsitud kirjad tagasi lükata või rämpsposti panna.', en: 'DMARC tells receivers to reject or quarantine spoofed mail.' },
      warn: { et: 'DMARC on ainult jälgimisrežiimis (p=none), võltskirjad jõuavad ikka kohale.', en: 'DMARC is only monitoring (p=none); spoofed mail still gets delivered.' },
      fail: { et: 'DMARC puudub. Teie domeeni nimel saadetud õngitsuskirju ei peatata.', en: 'DMARC is missing. Phishing mail sent in your domain’s name is not stopped.' },
    },
    fix: { et: 'Lisage _dmarc kirje ja liikuge järk-järgult p=quarantine või p=reject peale.', en: 'Add a _dmarc record and move step by step to p=quarantine or p=reject.' },
  },
  'mail.dkim': {
    area: 'mail',
    weight: 0,
    title: { et: 'DKIM', en: 'DKIM' },
    messages: {
      pass: { et: 'Leidsime DKIM-võtme, millega teie kirjad allkirjastatakse.', en: 'We found a DKIM key that signs your mail.' },
      info: {
        et: 'Levinud nimedega DKIM-võtit ei leidnud. See võib olla teise nimega, kontrollime seda tervisekontrollis.',
        en: 'No DKIM key under the common names. It may use another name; the health check verifies it.',
      },
    },
  },
  'dns.caa': {
    area: 'dns',
    weight: 0,
    title: { et: 'CAA', en: 'CAA' },
    messages: {
      pass: { et: 'CAA-kirje piirab, kes tohib teie domeenile sertifikaate väljastada.', en: 'A CAA record limits who may issue certificates for your domain.' },
      info: { et: 'CAA-kirje puudub. Sertifikaadi võib väljastada ükskõik milline sertifitseerija.', en: 'No CAA record. Any certificate authority may issue certificates for your domain.' },
    },
  },
};

export interface LocalizedFinding extends Finding {
  area: Area;
  title: string;
  message: string;
  fix?: string;
}

export function localizeFinding(finding: Finding, lang: Lang): LocalizedFinding {
  const definition = FINDINGS[finding.id];
  const message = definition.messages[finding.status] ?? definition.messages.info ?? definition.messages.pass;
  return {
    ...finding,
    area: definition.area,
    title: definition.title[lang],
    message: message?.[lang] ?? '',
    ...(definition.fix && (finding.status === 'warn' || finding.status === 'fail') ? { fix: definition.fix[lang] } : {}),
  };
}
