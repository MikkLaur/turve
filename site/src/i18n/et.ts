// Estonian texts. This object defines the Messages type: en.ts must have exactly the same keys,
// so a missing translation fails `npm run typecheck` and the build.

export const et = {
  htmlLang: 'et',
  ogLocale: 'et_EE',

  nav: {
    skip: 'Sisu juurde',
    label: 'Peamenüü',
    websites: 'Veebilehed',
    security: 'Turvalisus',
    pricing: 'Hinnad',
    check: 'Turvakontroll',
    about: 'Meist',
    cta: 'Küsi pakkumist',
    switchLang: 'In English',
    switchLangLabel: 'Read this page in English',
  },

  footer: {
    tagline: 'Turvalised veebilehed ja jõukohane küberturve väikeettevõttele.',
    noTracking: 'Sellel lehel pole jälgimist, küpsiseid ega kolmanda osapoole skripte.',
    privacy: 'Privaatsus',
    contact: 'Kontakt',
    regCode: 'Registrikood',
    securityTxt: 'Turvaprobleemist teatamine',
  },

  common: {
    perUnit: '/ tk',
    perMonth: 'kuus',
    estimateAfterReview: 'tunnid pärast ülevaatust',
    hourlyRate: 'tunnihind',
    includes: 'Sisaldab',
    readMore: 'Loe lähemalt',
    seePrices: 'Vaata hindu',
    askOffer: 'Küsi pakkumist',
    freeCheck: 'Tasuta turvakontroll',
    finalPrices: 'Hinnad on lõplikud: me ei ole käibemaksukohustuslased.',
  },

  home: {
    title: 'Turve – turvalised veebilehed ja küberturve väikeettevõttele',
    description:
      'Ehitame turvalisi veebilehti, uuendame vanu ja teeme väikeettevõttele jõukohaseid turvakontrolle ning läbistusteste. Iga tund on enne tellimist näha.',
    eyebrow: 'Veebilehed · Küberturve · Väikeettevõttele',
    heroTitle: 'Turvalised veebilehed ja jõukohane küberturve',
    heroLead:
      'Ehitame uusi veebilehti ja toome vanad tänapäeva nii, et neid oleks raske rünnata. Teeme turvakontrolle ja läbistusteste hinnaga, mis sobib ka väikesele firmale. Iga tund on näha enne, kui tellite.',
    heroCheckLabel: 'Kontrollige oma veebilehte tasuta',
    heroCheckPlaceholder: 'teieettevote.ee',
    heroCheckButton: 'Kontrolli',
    terminalCommand: 'turve kontrolli teieettevote.ee',
    terminalLines: [
      { status: 'ok', name: 'HTTPS', value: 'korras' },
      { status: 'ok', name: 'Sertifikaat', value: '87 päeva' },
      { status: 'bad', name: 'HSTS', value: 'puudub' },
      { status: 'bad', name: 'CSP', value: 'puudub' },
      { status: 'warn', name: 'DMARC', value: 'p=none' },
    ],
    terminalGrade: 'Hinne: C',
    servicesTitle: 'Mida teeme',
    services: [
      {
        title: 'Uued veebilehed',
        text: 'Kiired ja lihtsad lehed, kus on vähe liikuvaid osi ja seega vähe, mida rünnata. Eesti ja inglise keeles, mobiilis sama hea kui arvutis.',
      },
      {
        title: 'Vanade lehtede uuendamine',
        text: 'Teie vana kodulehte ei pea ära viskama. Uuendame, teeme turvaliseks ja kiireks ning lisame uusi võimalusi, näiteks broneerimise või uue keele.',
      },
      {
        title: 'Turvateenused',
        text: 'Turva-tervisekontroll, veebilehe või rakenduse läbistustest ja nõuetele vastavuse kaardistus. Aruanne on kirjutatud nii, et sellest saab aru ka juht.',
      },
      {
        title: 'Hooldus ja turvapartner',
        text: 'Igakuine hooldus hoiab lehe uuendatud ja varundatud. Turvapartner on teie ettevõtte osalise ajaga turvaspetsialist.',
      },
    ],
    modernTitle: 'Vana leht? Ärge visake seda minema.',
    modernText:
      'Paljud väikeettevõtete kodulehed on tehtud aastaid tagasi ega ole sellest saati uuendusi näinud. Vananenud WordPress või pistikprogramm on üks levinumaid viise, kuidas ründajad sisse saavad. Võtame sellise lehe üle, teeme korda ja ehitame juurde, mida teil täna vaja on.',
    modernPoints: [
      'Ülevaatus ja kirjalik plaan koos tundidega',
      'Turvauuendus ilma lehte ümber tegemata',
      'Uus kuub, mis säilitab sisu ja otsingukohad',
      'Uued funktsioonid olemasolevale lehele',
    ],
    whyTitle: 'Miks Turve',
    why: [
      {
        title: 'Turvainsener, mitte ainult arendaja',
        text: 'Turvalisus on meie igapäevatöö. Seepärast ehitame lehti nii, nagu ründaja neid vaatab, ja testime neid samamoodi.',
      },
      {
        title: 'Iga tund on näha',
        text: 'Iga pakett on kirjas tundides ja eurodes. Te teate enne tellimist, mille eest maksate, ja arvega tuleb kaasa ajalogi.',
      },
      {
        title: 'Ilma jälgimiseta',
        text: 'Meie tehtud lehtedel pole asjatuid jälgimisskripte ega kolmanda osapoole koodi. Ka sellel lehel mitte.',
      },
      {
        title: 'Kontrollige meid ise',
        text: 'Pange turve.ee meie enda turvakontrolli. Me sihime hinnet A ja sama ootame ka lehtedelt, mida teile teeme.',
      },
    ],
    processTitle: 'Kuidas töö käib',
    process: [
      { title: 'Valige paketid', text: 'Hinnakalkulaatoris või kirjeldage lihtsalt, mida vajate.' },
      { title: 'Saate täpse pakkumise', text: 'Tundides ja eurodes, kahe tööpäeva jooksul.' },
      { title: 'Töö algab teie kinnitusel', text: 'Lisatöö ainult siis, kui olete selle enne heaks kiitnud.' },
      { title: 'Arve koos ajalogiga', text: 'Näete täpselt, millele aeg kulus, 15-minutilise täpsusega.' },
    ],
    referenceTitle: 'Tehtud töö',
    referenceName: 'Kämblakoda massaažistuudio',
    referenceText:
      'Veebileht eesti ja inglise keeles, broneerimissüsteem, mis arvestab lahtiolekuaegu ja puhkepäevi, ning halduspaneel broneeringute kinnitamiseks.',
    referenceLink: 'kamblakoda.ee',
    finalTitle: 'Räägime teie lehest',
    finalText: 'Kirjeldage, mida vajate, või valige hinnakirjast paketid. Vastame kahe tööpäeva jooksul.',
  },

  websites: {
    title: 'Veebilehed – uued ja uuendatud | Turve',
    description:
      'Turvalised ja kiired veebilehed väikeettevõttele ning vanade kodulehtede uuendamine: turvauuendus, uus kuub ja uued funktsioonid. Hinnad tundides.',
    heading: 'Veebilehed, mida on raske rünnata',
    lead: 'Teeme uusi lehti ja toome vanu tänapäeva. Mõlemal juhul on turvalisus algusest peale sees, mitte hiljem otsa liimitud.',
    secureTitle: 'Kuidas me turvaliselt ehitame',
    secure: [
      {
        title: 'Vähem liikuvaid osi',
        text: 'Kus võimalik, teeme staatilise lehe: pole andmebaasi ega pistikprogramme, mida rünnata või uuendada.',
      },
      {
        title: 'Turvapäised ja range CSP',
        text: 'HTTPS, HSTS ja sisuturbepoliitika, mis lubab ainult teie enda koodi. Kontrollime tulemust oma turvakontrolliga.',
      },
      {
        title: 'Minimaalselt sõltuvusi',
        text: 'Iga väline teek on võimalik nõrk koht. Kasutame neid ainult siis, kui need on tõesti vajalikud.',
      },
      {
        title: 'Lähtekood on teie oma',
        text: 'Annate lehe üle koos kogu koodi ja juhendiga. Teid ei seota meiega.',
      },
    ],
    modernHeading: 'Vanade lehtede uuendamine',
    careHeading: 'Hooldus',
    ctaTitle: 'Kas teie praegune leht vajab uuendamist?',
    ctaText: 'Tehke tasuta turvakontroll. Näete kohe, kus on suuremad mured ja milline pakett need lahendab.',
  },

  security: {
    title: 'Turvateenused väikeettevõttele | Turve',
    description:
      'Turva-tervisekontroll, veebilehe ja rakenduse läbistustest, E-ITS, NIS2 ja ISO 27001 kaardistus ning igakuine turvapartner. Hinnad tundides.',
    heading: 'Küberturve, mis on väikeettevõttele jõukohane',
    lead: 'Suured turvafirmad on väikesele ettevõttele sageli liiga kallid ja liiga keerulised. Teeme sama tööd selgelt piiritletud pakettidena, mille hind on enne näha.',
    partnerHeading: 'Püsiv turvatugi',
    processTitle: 'Kuidas läbistustest käib',
    process: [
      { title: 'Ulatus', text: 'Lepime kokku, mida, millal ja kuidas testime.' },
      { title: 'Kirjalik luba', text: 'Testime ainult teie allkirjastatud loal. Ilma selleta ei tee me midagi.' },
      { title: 'Testimine', text: 'Käsitsi ja tööriistadega, nii et teie igapäevatöö ei häiru.' },
      { title: 'Aruanne', text: 'Leiud riskitaseme järgi, parandusjuhised ja kokkuvõte juhtkonnale.' },
      { title: 'Kordustest', text: 'Soovi korral kontrollime, et parandused töötavad.' },
    ],
    complianceTitle: 'Nõuded selges keeles',
    compliance: [
      { name: 'E-ITS', text: 'Eesti infoturbestandard. Kohustuslik avalikule sektorile ja paljudele nende partneritele.' },
      { name: 'NIS2', text: 'EL-i küberturbe direktiiv, mis laieneb paljudele keskmistele ettevõtetele ja nende tarnijatele.' },
      { name: 'ISO 27001', text: 'Rahvusvaheline infoturbe juhtimise standard, mida küsivad sageli suuremad kliendid.' },
      { name: 'Isikuandmete kaitse', text: 'Isikuandmete kaitse üldmäärus (GDPR) nõuab andmete kaitseks asjakohaseid turvameetmeid.' },
    ],
    principlesTitle: 'Põhimõtted',
    principles: [
      'Testime ainult kirjaliku loaga ja kokkulepitud ulatuses.',
      'Leiud jäävad meie ja teie vahele.',
      'Me ei müü hirmu: ütleme ausalt, mis on päriselt oluline.',
    ],
    ctaTitle: 'Alustage tasuta kontrollist',
    ctaText: 'Turvakontroll näitab minutiga, kuidas teie veebileht ja e-post välja paistavad.',
  },

  pricing: {
    title: 'Hinnad ja kalkulaator | Turve',
    description: 'Kõik paketid koos täpsete tundide ja hindadega. Valige vajalik ja küsige pakkumist otse kalkulaatorist.',
    heading: 'Hinnad',
    lead: 'Iga pakett on kirjas tundides. Valige, mida vajate, ja näete kohe kogusummat. Pakkumise küsimine ei kohusta teid millekski.',
    ratesTitle: 'Tunnihinnad',
    estimatorHint: 'Märkige paketid, mida vajate. Kokkuvõte on lehe allosas.',
    addLabel: 'Lisa',
    qtyLabel: 'Kogus',
    summaryTitle: 'Teie valik',
    summaryEmpty: 'Te pole veel ühtegi paketti valinud.',
    summaryOnce: 'Ühekordne töö',
    summaryMonthly: 'Igakuiselt',
    summaryEstimate: 'Osa töid hinnatakse pärast ülevaatust.',
    summaryButton: 'Küsi pakkumist selle valikuga',
    summaryClear: 'Tühjenda valik',
    noScript: 'Kalkulaator vajab JavaScripti. Hinnad on ka ilma selleta näha; pakkumist saate küsida kontaktivormist.',
    termsTitle: 'Kuidas arveldame',
    terms: [
      'Tööaega arvestame 15-minutilise täpsusega ja arvega tuleb kaasa ajalogi.',
      'Paketi tunnid on kokkulepitud ülempiir. Kui töö võtab vähem aega, maksate vähem.',
      'Paketist välja jäävat tööd teeme ainult teie eelneval nõusolekul ja tunnihinnaga.',
      'Igakuiste pakettide kasutamata tunnid järgmisse kuusse ei kandu.',
      'Majutus ja muud kolmanda osapoole kulud arveldame omahinnaga.',
      'Arve maksetähtaeg on 14 päeva.',
      'Läbistustest algab ainult pärast kirjalikku luba ja kokkulepitud ulatust.',
    ],
  },

  estimatorJs: {
    selected: 'Valitud',
    remove: 'Eemalda',
    total: 'Kokku',
    hoursShort: 'h',
  },

  check: {
    title: 'Tasuta veebilehe turvakontroll | Turve',
    description:
      'Kontrollige tasuta oma veebilehe HTTPS-i, turvapäiseid, sertifikaati ja e-posti kaitset (SPF, DKIM, DMARC). Tulemus ja soovitused kohe.',
    heading: 'Tasuta turvakontroll',
    lead: 'Sisestage oma veebilehe aadress. Minutiga näete, kuidas teie leht ja e-posti domeen ründaja silmis välja paistavad.',
    label: 'Veebilehe aadress',
    placeholder: 'teieettevote.ee',
    button: 'Kontrolli',
    running: 'Kontrollin… see võtab tavaliselt alla 15 sekundi.',
    noScript: 'Turvakontroll vajab JavaScripti.',
    whatTitle: 'Mida kontroll teeb',
    what: [
      'Avab teie lehe ühe korra, nagu tavaline külastaja, ja loeb turvapäised.',
      'Kontrollib HTTPS-i, sertifikaati ja TLS-i versioone.',
      'Vaatab avalikest DNS-kirjetest e-posti kaitset (SPF, DKIM, DMARC).',
    ],
    notTitle: 'Mida kontroll ei tee',
    not: [
      'Ei skaneeri porte ega otsi haavatavusi rünnates.',
      'Ei salvesta teie IP-aadressi. Salvestame ainult domeeni ja tulemuse.',
      'Ei asenda läbistustesti: see on esmane ülevaade.',
    ],
    errors: {
      invalid_domain: 'See ei ole avalik veebiaadress. Sisestage näiteks teieettevote.ee.',
      not_found: 'Sellist domeeni ei leitud. Kontrollige kirjapilti.',
      not_public: 'Seda aadressi ei saa kontrollida, sest see ei ole avalikus internetis.',
      busy: 'Kontrollimisi on praegu palju. Proovige minuti pärast uuesti.',
      rate_limited: 'Liiga palju kontrolle järjest. Proovige tunni aja pärast uuesti.',
      network: 'Ühendus katkes. Proovige uuesti.',
    },
    resultFor: 'Tulemus:',
    grade: 'Hinne',
    score: 'punkti 100-st',
    status: { pass: 'Korras', warn: 'Hoiatus', fail: 'Probleem', info: 'Teave' },
    fix: 'Lahendus',
    evidence: 'Leitud',
    problemsTitle: 'Leitud probleemid',
    okTitle: 'Korras',
    noProblems: 'Suuri probleeme ei leidnud. Tubli!',
    suggestionsTitle: 'Mis aitaks',
    suggestionsText: 'Need paketid lahendavad leitud probleemid:',
    askOffer: 'Küsi pakkumist koos selle tulemusega',
    checkedAt: 'Kontrollitud',
    cachedNote: 'Sama domeeni kontrollitakse kõige rohkem kord tunnis; näete viimast tulemust.',
  },

  about: {
    title: 'Meist | Turve',
    description: 'Kes on Turve taga: turvainsener, kes ehitab veebilehti nii, nagu ründaja neid vaatab.',
    heading: 'Kes on Turve taga',
    lead: 'Turve on väike ettevõte ühe selge mõttega: väikeettevõttel peab olema võimalik saada turvaline veebileht ja päris turvaekspertiisi hinnaga, mis on jõukohane.',
    personTitle: 'Inimene',
    // TODO(owner): replace with your own story, background and credentials.
    personBio: [
      'Töötan igapäevaselt turvainsenerina. [Lisa siia oma taust: kogemus, valdkonnad, sertifikaadid.]',
      'Turve sai alguse sellest, et nägin, kui sageli on väikeettevõtete veebilehed vananenud ja kaitseta, kuigi nende korda tegemine ei pea olema kallis.',
    ],
    photoAlt: 'Turve asutaja portree',
    valuesTitle: 'Mida lubame',
    values: [
      { title: 'Ausus', text: 'Ütleme, kui midagi pole vaja teha. Ka siis, kui see tähendab väiksemat arvet.' },
      { title: 'Täpsus', text: 'Iga tund on kirjas ja põhjendatud.' },
      { title: 'Konfidentsiaalsus', text: 'Teie andmed ja turvaleiud ei lähe kellelegi edasi.' },
    ],
  },

  contact: {
    title: 'Küsi pakkumist | Turve',
    description: 'Küsige pakkumist veebilehe või turvateenuse kohta. Vastame kahe tööpäeva jooksul.',
    heading: 'Küsi pakkumist',
    lead: 'Kirjeldage, mida vajate. Kui valisite hinnakirjast paketid, on need allpool kirjas. Vastame kahe tööpäeva jooksul.',
    selectionTitle: 'Valitud paketid',
    selectionChange: 'Muuda valikut',
    checkAttached: 'Lisatud turvakontrolli tulemus:',
    name: 'Nimi',
    company: 'Ettevõte',
    email: 'E-post',
    phone: 'Telefon',
    website: 'Praegune veebileht',
    websiteHint: 'Kui teil on juba leht, mida soovite uuendada või testida.',
    message: 'Sõnum',
    messageHint: 'Mida soovite teha? Mis on tähtaeg?',
    optional: 'valikuline',
    consentBefore: 'Olen nõus, et Turve kasutab neid andmeid minu päringule vastamiseks. Loe lähemalt: ',
    consentLink: 'privaatsus',
    honeypot: 'Jätke see väli tühjaks',
    submit: 'Saada päring',
    sending: 'Saadan…',
    errors: {
      fields: 'Palun kontrollige märgitud välju.',
      message: 'Kirjutage sõnum või valige hinnakirjast vähemalt üks pakett.',
      rate_limited: 'Liiga palju päringuid järjest. Proovige tunni aja pärast uuesti.',
      network: 'Päringut ei õnnestunud saata. Proovige uuesti.',
    },
  },

  thanks: {
    title: 'Aitäh! | Turve',
    description: 'Päring on kätte saadud.',
    heading: 'Aitäh, päring jõudis kohale',
    text: 'Vaatame selle läbi ja vastame kahe tööpäeva jooksul.',
    back: 'Tagasi avalehele',
  },

  privacy: {
    title: 'Privaatsus | Turve',
    description: 'Kuidas Turve isikuandmeid kogub, kasutab ja kaitseb.',
    heading: 'Privaatsuspoliitika',
    // TODO(owner): have this reviewed before launch. {tokens} are filled from COMPANY in config.ts.
    sections: [
      {
        title: 'Kes vastutab',
        paragraphs: ['Isikuandmete vastutav töötleja on {legalName} (registrikood {regCode}, {address}). Küsimuste korral kirjutage {email}.'],
      },
      {
        title: 'Milliseid andmeid kogume',
        paragraphs: [
          'Pakkumise päring: nimi, ettevõte, e-post, telefon, veebileht, sõnum ja valitud paketid. Neid kasutame ainult teie päringule vastamiseks ja pakkumise tegemiseks (lepingueelsed toimingud, isikuandmete kaitse üldmääruse art 6 lg 1 p b).',
          'Turvakontroll: kontrollitud domeen ja tulemus. Teie IP-aadressi me selle juurde ei salvesta.',
          'Veebiserveri logid: meie majutaja salvestab tehnilistel ja turvalisuse kaalutlustel lühiajaliselt IP-aadressi, aja ja avatud lehe (õigustatud huvi, art 6 lg 1 p f).',
        ],
      },
      {
        title: 'Küpsised ja jälgimine',
        paragraphs: ['Avalik veebileht ei kasuta küpsiseid, analüütikat ega kolmanda osapoole skripte. Seepärast pole siin ka küpsiste nõusoleku akent.'],
      },
      {
        title: 'Kui kaua andmeid hoiame',
        paragraphs: [
          'Päringud, millest lepingut ei sünni, kustutame hiljemalt 12 kuu jooksul. Kui sõlmime lepingu, hoiame arveid ja nendega seotud andmeid raamatupidamise seaduse järgi 7 aastat.',
        ],
      },
      {
        title: 'Kes andmeid näeb',
        paragraphs: ['Andmeid näeb ainult Turve. Andmed asuvad Eestis Zone Media OÜ serverites. Me ei müü ega anna andmeid kellelegi edasi.'],
      },
      {
        title: 'Teie õigused',
        paragraphs: [
          'Teil on õigus oma andmeid näha, parandada ja kustutada ning esitada vastuväiteid. Kirjutage meile ja vastame ühe kuu jooksul. Kaebuse saate esitada Andmekaitse Inspektsioonile (www.aki.ee).',
        ],
      },
    ],
  },

  notFound: {
    title: 'Lehte ei leitud | Turve',
    heading: 'Seda lehte ei ole',
    text: 'Aadress võib olla vale või leht on kolinud.',
    back: 'Avalehele',
  },
};

export type Messages = typeof et;
