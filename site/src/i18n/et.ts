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
    giveaway: 'Loos',
    cta: 'Küsi pakkumist',
    switchLang: 'In English',
    switchLangLabel: 'Read this page in English',
  },

  footer: {
    tagline: 'Turvalised veebilehed ja jõukohane küberturve väikeettevõttele.',
    noTracking: 'Sellel lehel pole jälgimist, küpsiseid ega kolmanda osapoole skripte.',
    privacy: 'Privaatsus',
    contact: 'Kontakt',
    providerBefore: 'Turve teenuseid osutab',
    regCode: 'registrikood',
    fingerprint: 'Brauseri sõrmejälg',
  },

  common: {
    perUnit: '/ tk',
    perMonth: 'kuus',
    estimateAfterReview: 'hind pärast ülevaatust',
    offerRegular: 'Tavahind',
    includes: 'Sisaldab',
    readMore: 'Loe lähemalt',
    seePrices: 'Vaata hindu',
    call: 'Helista',
    askOffer: 'Küsi pakkumist',
    freeCheck: 'Tasuta turvakontroll',
    // Year-end offer (LAUNCH_OFFER). {spots} and {price} are filled at build time, {left} in the browser.
    offerStatic: 'Esimesele {spots} kliendile',
    offerLeft: 'Kohti alles: {left} / {spots}',
    offerFull: 'Kõik pakkumise kohad on täis. Tavahind {price}.',
    offerEnded: 'Aastalõpu pakkumine on lõppenud. Tavahind {price}.',
  },

  home: {
    title: 'Turve – turvalised veebilehed ja küberturve väikeettevõttele',
    description:
      'Ehitame turvalisi veebilehti, uuendame vanu ja teeme väikeettevõttele jõukohaseid turvakontrolle ning läbistusteste. Hind on enne tellimist teada.',
    eyebrow: 'Veebilehed · Küberturve · Väikeettevõttele',
    heroTitle: 'Turvalised veebilehed ja jõukohane küberturve',
    heroLead:
      'Ehitame uusi veebilehti ja toome vanad tänapäeva nii, et neid oleks raske rünnata. Teeme turvakontrolle ja läbistusteste hinnaga, mis sobib ka väikesele firmale. Hind on teada enne, kui tellite.',
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
    fpTitle: 'Teie brauser räägib teist rohkem, kui arvate',
    fpText:
      'Iga veebileht saab teid teie arvuti ja brauseri järgi ära tunda ka ilma küpsisteta, isegi privaatses aknas. Vaadake, mida teie brauser reedab. Kõik arvutatakse teie enda brauseris ja midagi ei salvestata.',
    fpButton: 'Vaata oma brauseri sõrmejälge',
    fpCommand: 'turve sõrmejälg',
    fpLines: [
      { name: 'kood', value: '7F3A-91C2-0B4E' },
      { name: 'seade', value: 'macOS 15, Apple M2' },
      { name: 'fondid', value: 'Microsoft Office' },
      { name: 'keeled', value: 'eesti, inglise' },
      { name: 'ekraan', value: '2 monitori' },
    ],
    modernTitle: 'Vana leht? Ärge visake seda minema.',
    modernText:
      'Paljud väikeettevõtete kodulehed on tehtud aastaid tagasi ega ole sellest saati uuendusi näinud. Vananenud WordPress või pistikprogramm on üks levinumaid viise, kuidas ründajad sisse saavad. Võtame sellise lehe üle, teeme korda ja ehitame juurde, mida teil täna vaja on.',
    modernPoints: [
      'Ülevaatus ja kirjalik plaan koos hindadega',
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
        title: 'Hind on enne teada',
        text: 'Iga paketi hind ja sisu on kirjas. Teate enne tellimist, mida saate ja mida maksate.',
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
      { title: 'Saate täpse pakkumise', text: 'Fikseeritud hinnaga, kahe tööpäeva jooksul.' },
      { title: 'Töö algab teie kinnitusel', text: 'Lisatöö ainult siis, kui olete selle enne heaks kiitnud.' },
      { title: 'Arve pärast tööd', text: 'Arve tuleb pärast töö üleandmist, maksetähtaeg on 14 päeva.' },
    ],
    referenceTitle: 'Tehtud töö',
    referenceName: 'Kämblakoda massaažistuudio',
    referenceText:
      'Veebileht eesti ja inglise keeles, broneerimissüsteem, mis arvestab lahtiolekuaegu ja puhkepäevi, ning halduspaneel broneeringute kinnitamiseks.',
    referenceLink: 'kamblakoda.ee',
    finalTitle: 'Räägime teie lehest',
    finalText: 'Kirjeldage, mida vajate, või valige hinnakirjast paketid. Vastame kahe tööpäeva jooksul.',
    offerEyebrow: 'Aastalõpu pakkumine',
    // {price} = the offer's price
    offerTitle: 'Üheleheline koduleht {price}',
    offerText:
      'Kiire ja turvaline üheleheline koduleht aastalõpu hinnaga. Pakkumine kehtib esimesele 10 kliendile ja aasta lõpuni. Kujunduse valime koos tasuta konsultatsioonil.',
  },

  websites: {
    title: 'Veebilehed – uued ja uuendatud | Turve',
    description:
      'Turvalised ja kiired veebilehed väikeettevõttele ning vanade kodulehtede uuendamine: turvauuendus, uus kuub ja uued funktsioonid. Fikseeritud hinnad.',
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
      'Turva-tervisekontroll, veebilehe ja rakenduse läbistustest, E-ITS, NIS2 ja ISO 27001 kaardistus ning igakuine turvapartner. Fikseeritud hinnad.',
    heading: 'Küberturve, mis on väikeettevõttele jõukohane',
    lead: 'Suured turvafirmad on väikesele ettevõttele sageli liiga kallid ja liiga keerulised. Teeme sama tööd selgelt piiritletud pakettidena, mille hind on enne näha. Kui teil pole kedagi, kes leitud vead parandaks, parandame need ise.',
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
    description: 'Kõik paketid koos hindadega. Valige vajalik ja küsige pakkumist otse kalkulaatorist.',
    heading: 'Hinnad',
    lead: 'Iga paketi hind on fikseeritud. Valige, mida vajate, ja näete kohe kogusummat. Pakkumise küsimine ei kohusta teid millekski.',
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
    consultNotice: 'Pole kindel, mida valida?',
    consultCall: 'Helistage',
    consultOr: 'või',
    consultWrite: 'kirjutage meile',
    consultFree: '20-minutiline konsultatsioon on tasuta.',
    projectTitle: 'Konsultatsioon ja projektitöö',
    projectText:
      'Töö, mis ühtegi paketti ei mahu, teeme fikseeritud hinnaga pakkumise alusel või tunnitööna. Tunnitööd arvestame 15-minutilise täpsusega ja arvega tuleb kaasa ajalogi.',
    termsTitle: 'Kuidas arveldame',
    terms: [
      'Paketi hind on fikseeritud: maksate kokkulepitud summa, mitte rohkem.',
      'Paketist välja jäävat tööd teeme ainult teie eelneval nõusolekul.',
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
    fingerprintLink: 'Vaadake ka, mida teie brauser teie kohta reedab',
  },

  fingerprint: {
    title: 'Brauseri sõrmejälg: mida teie brauser teist reedab | Turve',
    description:
      'Vaadake, mida iga veebileht saab teie arvuti ja brauseri kohta teada ilma küpsisteta. Kõik arvutatakse teie brauseris, midagi ei saadeta ega salvestata.',
    heading: 'Mida teie brauser teist reedab',
    lead: 'Iga veebileht saab teid ära tunda ka ilma küpsisteta. Allpool on see, mida see leht praegu teie kohta näeb. Kõik arvutatakse teie enda brauseris: me ei saada ega salvesta midagi.',
    noScript: 'See leht vajab JavaScripti. Ilma JavaScriptita näeb veebileht teie kohta tõesti palju vähem – see on üks tõhusamaid kaitseid.',
    running: 'Loen teie brauserit…',
    failed: 'Sõrmejälge ei õnnestunud arvutada. Proovige lehte uuesti laadida.',
    idTitle: 'Teie brauseri sõrmejälg',
    idText: 'See kood on arvutatud ainult teie seadme ja brauseri omadustest. Küpsiseid ega salvestatud andmeid ei kasutata.',
    tryTitle: 'Proovige ise',
    trySteps: [
      'Jätke kood meelde.',
      'Avage see leht privaatses aknas või kustutage küpsised ja tulge tagasi.',
      'Sama kood tähendab, et iga veebileht tunneb teid samamoodi ära.',
    ],
    changedNote:
      'Kui kood muutus, lisab teie brauser sõrmejälgedele juhuslikku müra. Nii teevad näiteks Safari, Brave ja Firefoxi privaatne aken – see on hea. Kood muutub ka siis, kui avate lehe teisel ekraanil, sest ekraan on üks signaalidest.',
    inferTitle: 'Mida see leht teie kohta välja luges',
    infer: {
      browser: 'Kasutate brauserit {browser} operatsioonisüsteemis {os}.',
      model: 'Teie seade on {model}.',
      kernel: 'Teie Linuxi tuuma versioon on {kernel}.',
      gpu: 'Teie graafikaprotsessor on {gpu}.',
      gpuHidden: 'Teie brauser näitab graafikaprotsessori kohta ainult üldistatud nime („{gpu}“). Hea!',
      cores: 'Teie protsessoril on {cores} tuuma.',
      memory: 'Teie seadmel on {memory} muutmälu.',
      memoryAtLeast: 'vähemalt {gb} GB',
      memoryAbout: 'umbes {gb} GB',
      screen: 'Teie ekraan on {w} × {h} pikslit.',
      secondScreen: 'Teil on ühendatud ka teine monitor.',
      touch: 'Teie ekraan on puutetundlik.',
      timezone: 'Teie kell on seatud ajavööndisse {tz}.',
      languages: 'Teie brauser eelistab keeli: {langs}.',
      dark: 'Eelistate tumedat kujundust.',
      reducedMotion: 'Olete palunud vähem animatsioone.',
      office: "Teie arvutisse on paigaldatud Microsoft Office'i fondid.",
      adobe: "Teie arvutis on Adobe'i fondid ({fonts}).",
      libre: 'Teie arvutisse on paigaldatud LibreOffice.',
      dev: 'Teil on programmeerijate fondid ({fonts}). Tõenäoliselt kirjutate koodi.',
      nerd: 'Teil on Nerd Fonts – veedate ilmselt palju aega terminalis.',
      batteryCharging: 'Teie aku on {pct}% täis ja laeb.',
      batteryDischarging: 'Teie aku on {pct}% täis ja seade töötab akutoitel.',
      adblock: 'Kasutate reklaamiblokeerijat.',
      dnt: 'Teie brauser palub veebilehtedel teid mitte jälgida. Paljud ei arvesta sellega – ja see palve teeb teid veidi eristatavamaks.',
      noise: 'Teie brauser lisab joonistuse lugemisele juhuslikku müra, et sõrmejälge segada. Väga hea!',
    },
    signalsTitle: 'Kõik signaalid',
    signalsLead: 'Iga rida eraldi on üsna süütu. Koos moodustavad need sõrmejälje, mis on sageli ainulaadne.',
    columns: { signal: 'Signaal', value: 'Mida brauser ütles', power: 'Eristusvõime' },
    power: { low: 'madal', medium: 'keskmine', high: 'kõrge' },
    signals: {
      browser: 'Brauser',
      os: 'Operatsioonisüsteem',
      screen: 'Ekraan',
      timezone: 'Ajavöönd',
      languages: 'Keeled',
      cores: 'Protsessori tuumad',
      memory: 'Muutmälu',
      touch: 'Puutepunktid',
      gpu: 'Graafikaprotsessor',
      webgl: 'WebGL-i omadused',
      canvas: 'Joonistus (canvas)',
      audio: 'Helitöötlus',
      fonts: 'Paigaldatud fondid',
      prefs: 'Eelistused',
      adblock: 'Reklaamiblokeerija',
      battery: 'Aku',
    },
    prefs: { dark: 'tume kujundus', light: 'hele kujundus', reducedMotion: 'vähem animatsioone', moreContrast: 'suurem kontrast', forcedColors: 'sunnitud värvid' },
    unavailable: 'ei avalda',
    noneFound: 'ei leitud',
    yes: 'jah',
    no: 'ei',
    charging: 'laeb',
    discharging: 'akutoitel',
    noise: 'müraga',
    volatileNote: '* Neid me koodi ei arvesta, sest need muutuvad ajas või privaatses aknas.',
    canvasHash: 'Selle pildi sõrmejälg: {hash}',
    canvasAlt: 'Teie brauseris joonistatud pilt: Turve logo, eestikeelne lause, emojid ja kaks kattuvat ringi.',
    canvasCaption:
      "See pilt joonistati just praegu teie brauseris. Iga seade joonistab selle veidi isemoodi: emojid näevad iPhone'is, Androidis ja Windowsis silmaga nähtavalt erinevad välja, fondid ja servad aga sageli vaid üksikute pikslite võrra. Täpselt ühesugused seadmed, näiteks sama mudeli ja tarkvaraga iPhone'id, joonistavad sageli identse pildi – seepärast loeb kõigi signaalide kombinatsioon.",
    privacyNote:
      'Kõik ülaltoodu arvutati teie brauseris ja jääb sinna. Kontrollige ise: arendaja tööriistade võrguvaates (F12 → Network) näete ainult selle lehe enda faile.',
    uniqueTitle: 'Kui ainulaadne ma olen?',
    unique: [
      'Täpset arvu me öelda ei saa: selleks peaksime teie sõrmejälge võrdlema teiste külastajate omadega ja neid hoidma. Seda me ei tee.',
      'Suured uuringud on leidnud, et olenevalt valimist on kolmandik kuni üheksa kümnendikku arvutibrauseritest ainulaadsed: EFF-i Panopticlick (2010) 84%, AmIUnique (2016) 89% ja 2018. aasta uuring kahe miljoni brauseriga ühel Prantsuse veebilehel 34%.',
    ],
    protectTitle: 'Kuidas end kaitsta',
    protect: [
      'Kasutage brauserit, mis sõrmejälgi segab: Safari, Brave või Firefox range jälgimiskaitsega.',
      'Hoidke laienduste ja lisafontide hulk väike: iga lisa teeb teid eristatavamaks.',
      'Uuendage brauserit: vanad versioonid on haruldased ja seega kergemini äratuntavad.',
      'Väga tundlikuks sirvimiseks kasutage Tor Browserit: see püüab näidata kõiki kasutajaid ühesugusena.',
    ],
    businessTitle: 'Mida see tähendab ettevõttele',
    business: [
      {
        title: 'Teie töötajaid tuntakse ära',
        text: 'Reklaamivõrgud ja andmekaupmehed seovad sõrmejälje abil kokku sama arvuti külastused eri lehtedel – ilma küpsisteta ja ka privaatses aknas.',
      },
      {
        title: 'Ründajad kasutavad sama tehnikat',
        text: 'Õngitsuslehed vaatavad külastaja sõrmejälge: turvauurijale ja automaatsele skannerile näidatakse süütut lehte, ohvrile päris lõksu.',
      },
      {
        title: 'Kaitsjad ka',
        text: 'Pangad ja e-poed kasutavad sõrmejälge pettuste tõkestamiseks. Kui teie kontole logitakse sisse võõrast seadmest, märkavad nad seda.',
      },
      {
        title: 'Jälgimiseks on vaja nõusolekut',
        text: 'Kui teie veebileht kasutab sõrmejälge külastajate jälgimiseks, nõuab Euroopa õigus selleks nõusolekut samamoodi nagu küpsiste puhul.',
      },
    ],
    ctaTitle: 'Kas teie töötajad teavad, mida nende brauser reedab?',
    ctaText: 'Aitame väikeettevõttel mõista, kuidas jälgijad ja ründajad töötavad, ning seada sisse kaitsed, mis päriselt aitavad.',
    ctaSecurity: 'Vaata turvateenuseid',
  },

  giveaway: {
    title: 'Loos: võida ühelehelise kodulehe | Turve',
    endedTitle: 'Loos on lõppenud | Turve',
    // {price} = the prize package's price from the catalog
    description: 'Loosime välja ühelehelise kodulehe koos domeeni ja majutusega, väärtus üle {price}. Osalemine käib Facebookis, reeglid on sellel lehel.',
    eyebrow: 'Loos',
    heading: 'Loosime välja ühelehelise kodulehe',
    endedHeading: 'Loos on lõppenud',
    lead: 'Kui teie ettevõttel pole veebilehte või see on vana, saate uue meilt kingituseks, koos domeeni ja majutusega. Väärtus üle {price}.',
    enter: 'Osale Facebookis',
    consult: 'Küsi tasuta konsultatsiooni',
    // The dates in these texts must match GIVEAWAY in site/src/giveaway.ts (the build checks `when` and `closed`).
    when: 'Osalemine lõpeb kolmapäeval, 11.11 kell 12:00',
    units: { days: 'päeva', hours: 'tundi', minutes: 'minutit', seconds: 'sekundit' },
    // After the deadline: `closed` above the countdown to the reveal, `drawing` while the winner isn't published yet,
    // `drawn` as the lead once the giveaway has ended (after GIVEAWAY.tabUntil).
    closed: 'Osalemine on lõppenud. Võitja avalikustame siin kell 18:00.',
    drawing: 'Loosime võitjat. Tulemus ilmub siia mõne minuti jooksul.',
    drawn: 'Osalemine lõppes 11.11 kell 12:00 ja võitja loosisime samal päeval kell 18:00.',
    // The reveal. {company} and {business} are the winner's, as written in the comment.
    showWinner: 'Näita võitjat',
    winnerTitle: 'Võitja',
    drawCommand: 'shuf -n 1 kommentaarid.txt',
    congrats: 'Palju õnne. Võtame teiega ühendust Messengeris.',
    winnerAnnounce: 'Võitja: {company}, {business}.',
    prizeTitle: 'Mida võitja saab',
    prize: [
      'Valmis kujundus, mille valime koos tasuta konsultatsioonil, teie logo ja värvidega',
      'Kuni 6 sisuplokki (teenused, meist, kontakt jne)',
      'Mobiilisõbralik ja kiire, HTTPS ja turvapäised paigas',
      'Üks parandusring',
      'Lehe jaluses väike viide turve.ee-le',
      'Domeen ja majutus esimeseks aastaks: need ostame ja seadistame meie',
    ],
    prizeNote: 'Tekstid ja pildid annate teie; ütleme täpselt, mida kuhu vaja on.',
    howTitle: 'Kuidas osaleda',
    how: [
      'Avage Facebooki postitus.',
      'Kirjutage kommentaaridesse oma ettevõtte nimi ja tegevusala.',
      'Oodake kolmapäeva 18:00: siis avalikustame võitja siin lehel ja vastame talle kommentaarina ja Messengeris.',
    ],
    howNote: 'Üks kommentaar inimese kohta. Jagama ega sõpru märkima ei pea.',
    rulesTitle: 'Reeglid',
    // As in reklaamikampaania/material/2026-11-08-kodulehe-loos/rules.md. {legalName} and {regCode} come from COMPANY,
    // {package} and {price} from the catalog, {privacy} becomes a link to the privacy page, `code` is shown as code.
    rules: [
      {
        title: 'Korraldaja',
        text: '{legalName} (registrikood {regCode}), kaubamärk Turve / turve.ee. Facebook ega Meta ei ole loosimisega seotud, ei toeta seda ega korralda seda.',
      },
      {
        title: 'Auhind',
        text: 'üks „{package}“ pakett (kataloogihind {price}) koos domeeni ja majutusega, võitjale tasuta. Sisaldab: valmis kujundus, mille valime koos tasuta konsultatsioonil võitja logo ja värvidega; kuni 6 sisuplokki; mobiilisõbralik leht, HTTPS ja turvapäised; üks parandusring; lehe jaluses väike viide turve.ee-le; domeen ja majutus esimeseks aastaks, mille ostab ja seadistab korraldaja. Domeeninime valime koos (sõltub sellest, kas nimi on vaba); domeen registreeritakse võitja ettevõtte nimele. Tekstid ja pildid annab võitja. Pärast esimest aastat jätkub majutus ja domeen võitja kulul; korraldaja teatab enne tähtaega hinna ja võitja otsustab, kas jätkab. Auhinda ei saa vahetada raha vastu ega üle anda teisele.',
      },
      {
        title: 'Kes võivad osaleda',
        text: 'Eestis registreeritud ettevõtte või FIE esindajad, 18-aastased ja vanemad. Ettevõttel peab olema õigus lehe sisu kasutada. Korraldaja ja tema lähikondlased ei osale.',
      },
      {
        title: 'Kuidas osaleda',
        text: 'kirjutage selle postituse alla kommentaar oma ettevõtte nimega ja tegevusalaga. Üks kommentaar inimese kohta. Postituse jagamine ega sõprade märkimine ei ole nõutud. Ostu ega makset ei nõuta.',
      },
      {
        title: 'Aeg',
        text: 'osalemine kuni kolmapäev, 11.11.2026 kell 12:00 (Eesti aeg). Loosimine samal päeval kell 18:00.',
      },
      {
        title: 'Loosimine',
        text: 'kehtivad kommentaarid nummerdatakse ilmumise järjekorras; võitja valitakse juhuslikult arvutiga (`shuf -n 1` süsteemi juhuslikkusest). Valik salvestatakse ekraanipildina. Kommentaarid, mis on kustutatud või ei vasta reeglitele, ei osale.',
      },
      {
        title: 'Võitja teavitamine',
        text: 'võitja saab vastuse kommentaarina postituse all ja Messengeris. Kui võitja ei vasta 48 tunni jooksul, loositakse uus.',
      },
      {
        title: 'Auhinna lunastamine',
        text: 'võitja broneerib tasuta konsultatsiooni (telefonil või kontaktivormis) kuni 27.11.2026 ja saadab tekstid ning pildid kuni 4.12.2026. Hilinemisel võib auhind aeguda. Töö valmib enne aasta lõppu.',
      },
      {
        title: 'Andmed',
        text: 'kasutame osaleja nime ja kommentaari ainult loosimiseks ja võitjaga ühenduse võtmiseks. Muid andmeid me ei kogu. Võitja ettevõtte nime ja tegevusala avaldame turve.ee lehel ja postituse all. Privaatsus: {privacy}',
      },
      {
        title: 'Muud',
        text: 'korraldajal on õigus loosimine tühistada või reegleid muuta, kui see on vajalik (nt tehniline probleem või väärkasutus), teatades sellest postituse all.',
      },
    ],
    // The year-end offer band at the end of the page.
    offerText: 'Ka ilma loosita saate ühelehelise kodulehe aastalõpu hinnaga, kuni 10 esimesele kliendile ja aasta lõpuni. Kujunduse valime koos tasuta konsultatsioonil.',
  },

  about: {
    title: 'Meist | Turve',
    description:
      'Mikk Laur on turvainsener ja Turve asutaja. Küberturve peab olema jõukohane igale ettevõttele, mitte ainult suurtele.',
    heading: 'Kes on Turve taga',
    lead: 'Küberturve ei tohi olla ainult suurte ettevõtete pärusmaa.',
    personTitle: 'Inimene',
    personBio: [
      'Ettevõtted on küberturvet pikalt pidanud kuluks, mille võib edasi lükata. Need ajad on möödas: petukirjad, ülevõetud kontod ja häkitud kodulehed ei vali enam suuri ja rikkaid, vaid kõiki, kelle juurde on lihtne sisse saada.',
      'Väikeettevõttel pole oma turvainseneri ega suure firma eelarvet. Aga midagi tuleb teha, ja see midagi peab olema jõukohane. Selleks ongi Turve: turvateenused, mida saab endale lubada iga ettevõte.',
      'Turve on minu oma ettevõte. Teen väikeettevõtetele seda, mida suurtes firmades teeb turvameeskond: leian nõrgad kohad enne ründajaid ja selgitan lihtsas keeles, mida nendega teha.',
    ],
    photoAlt: 'Turve asutaja',
    linkedin: 'Minu taust LinkedInis',
    forYouTitle: 'Mida see teile tähendab',
    forYou: [
      { title: 'Vaatan ründaja pilguga', text: 'Iga lehte, mille ehitan, kontrollin enne üleandmist nii, nagu seda teeks ründaja. Mida leian, selle parandan enne, kui keegi teine selle leiab.' },
      { title: 'Alustada saab väikselt', text: 'Turvalisus ei pea algama suurest projektist. Tasuta turvakontroll või üks turva-tervisekontroll näitab, kust alustada, ja hind on enne teada.' },
      { title: 'Ütlen, mis pole vajalik', text: 'Kõike ei pea parandama. Ütlen ausalt, mis on päriselt oluline, ka siis, kui see tähendab väiksemat arvet.' },
      { title: 'Teie andmed jäävad teile', text: 'Teie andmed ja turvaleiud ei lähe kellelegi edasi.' },
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
    // Prefilled in the message when the visitor comes from a demo's "Vali see kujundus" link.
    themePrefix: 'Kujundus',
    consultHint: 'Soovite enne rääkida? Kirjutage sõnumisse, et soovite tasuta 20-minutilist konsultatsiooni, ja lisage telefoninumber: helistame teile.',
    callOr: 'Või helistage ise:',
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
    // {tokens} are filled from COMPANY in config.ts.
    sections: [
      {
        title: 'Kes vastutab',
        paragraphs: ['Isikuandmete vastutav töötleja on {legalName} (registrikood {regCode}), kes osutab teenuseid kaubamärgi Turve all. Ettevõtte ametlikud andmed on e-äriregistris. Küsimuste korral kirjutage {email}.'],
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
        paragraphs: [
          'Avalik veebileht ei kasuta küpsiseid, analüütikat ega kolmanda osapoole skripte. Seepärast pole siin ka küpsiste nõusoleku akent.',
          'Brauseri sõrmejälje leht arvutab kõik näidatud andmed teie enda brauseris. Neid ei saadeta meile ega salvestata.',
        ],
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
