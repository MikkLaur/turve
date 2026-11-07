import type { OnePagerContent, ThemeId } from './types';

// Demo content: reads like a real site for each trade. The business names are clear placeholders ("Teie …") and
// testimonial authors are always marked as examples, so nothing poses as a real company, person or review.
const PHONE = '+372 555 0000';
const EMAIL = 'info@teieettevote.ee';
const EXAMPLE_QUOTES = {
  title: 'Kliendid ütlevad',
  items: [
    { quote: 'Siia tuleb lühike tsitaat päris kliendilt, tema loal.', author: 'Näide: kliendi eesnimi' },
    { quote: 'Kaks-kolm tsitaati on piisav. Kui neid veel pole, jätame selle osa ära.', author: 'Näide: kliendi eesnimi' },
  ],
};

export const DEMOS: Record<ThemeId, OnePagerContent> = {
  betoon: {
    lang: 'et',
    businessName: 'Teie Betoonitööd',
    credit: true,
    tagline: 'Vundamendid, põrandad ja platsid, mis peavad vastu aastakümneid.',
    cta: { label: 'Helista ja küsi pakkumist', href: 'tel:+3725550000' },
    intro: {
      title: 'Meist lühidalt',
      text: 'Valame vundamente, põrandaid ja õuealasid juba üle kümne aasta. Tuleme objektile, mõõdame üle ja saadame kirjaliku hinnapakkumise kahe tööpäeva jooksul.',
    },
    services: {
      title: 'Teenused',
      items: [
        { name: 'Vundamendid', text: 'Lint- ja plaatvundamendid elamutele, saunadele ja garaažidele.', price: 'hind objekti järgi' },
        { name: 'Betoonpõrandad', text: 'Põrand koos soojustuse ja põrandakütte torustikuga, siluritud või lihvitud pinnaga.', price: 'alates 25 € / m²' },
        { name: 'Õuealad ja platsid', text: 'Parkimisplatsid, terrassialused ja kõnniteed, mis kannatavad nii autot kui ka külma.' },
        { name: 'Betooni lihvimine', text: 'Vana betoonpinna lihvimine ja immutamine, et see oleks sile ja tolmuvaba.', price: 'alates 12 € / m²' },
      ],
    },
    gallery: {
      title: 'Tehtud tööd',
      items: [{ caption: 'Plaatvundament eramule' }, { caption: 'Lihvitud betoonpõrand garaažis' }, { caption: 'Parkimisplats kortermaja ees' }],
    },
    about: {
      title: 'Kes me oleme',
      text: 'Oleme kolmeliikmeline meeskond. Teeme töö ise, mitte alltöövõtjatega, ja jätame objekti korda. Tehtud tööle anname kirjaliku garantii.',
      photoAlt: 'Meeskonna foto objektil',
    },
    contact: {
      title: 'Kontakt',
      phone: PHONE,
      email: EMAIL,
      address: 'Tänava 1, Linn',
      hours: [
        { days: 'E–R', time: '8–18' },
        { days: 'L', time: 'kokkuleppel' },
      ],
    },
  },
  keevitus: {
    lang: 'et',
    businessName: 'Teie Keevitustöökoda',
    credit: true,
    tagline: 'Keevitus ja metallitööd – väravast trepipiirdeni.',
    cta: { label: 'Helista meile', href: 'tel:+3725550000' },
    intro: {
      title: 'Meist lühidalt',
      text: 'Oleme väike töökoda, kus metalli keevitatakse, painutatakse ja värvitakse. Teeme töid nii eraisikutele kui ka ettevõtetele, väikesest parandusest kuni terve väravani.',
    },
    services: {
      title: 'Teenused',
      items: [
        { name: 'Väravad ja piirded', text: 'Lükand- ja tiibväravad, aiapiirded ning trepi- ja rõdupiirded teie mõõtude järgi.', price: 'hind joonise järgi' },
        { name: 'Keevitus ja remont', text: 'Keevitame terast, roostevaba ja alumiiniumi. Parandame ka katkised detailid ja masinaosad.', price: 'alates 45 € / h' },
        { name: 'Metallkonstruktsioonid', text: 'Varikatused, trepi kandekonstruktsioonid, riiulid ja raamid.' },
        { name: 'Viimistlus', text: 'Liivapritsitud ja pulbervärvitud pind, mis peab vastu Eesti ilmale.' },
      ],
    },
    gallery: {
      title: 'Tehtud tööd',
      items: [{ caption: 'Lükandvärav eramu juurde' }, { caption: 'Trepipiire roostevabast terasest' }, { caption: 'Varikatuse raam' }],
    },
    about: {
      title: 'Töökoda',
      text: 'Töökojas töötab kaks kogenud keevitajat. Tulge läbi, vaadake näidiseid ja räägime, mida teil vaja on.',
      photoAlt: 'Foto töökojast või keevitajast tööhoos',
    },
    contact: {
      title: 'Kontakt',
      phone: PHONE,
      email: EMAIL,
      address: 'Tööstuse 1, Linn',
      hours: [
        { days: 'E–R', time: '8–17' },
        { days: 'L–P', time: 'suletud' },
      ],
    },
  },
  manikuur: {
    lang: 'et',
    businessName: 'Teie Maniküürisalong',
    credit: true,
    tagline: 'Hoolitsetud käed ja küüned rahulikus salongis.',
    cta: { label: 'Helista ja broneeri aeg', href: 'tel:+3725550000' },
    intro: {
      title: 'Tere tulemast',
      text: 'Oleme hubane salong kesklinnas, kus saate maniküüri ja pediküüri rahulikus õhkkonnas. Kasutame kvaliteetseid tooteid ja steriliseerime kõik tööriistad pärast iga klienti.',
    },
    services: {
      title: 'Teenused ja hinnad',
      items: [
        { name: 'Klassikaline maniküür', text: 'Küünte kujundamine, küünenahkade hooldus ja kätekreem.', price: '25 €' },
        { name: 'Geellakk', text: 'Läikiv ja vastupidav lakk, mis püsib 2–3 nädalat.', price: '35 €' },
        { name: 'Geelküüned', text: 'Pikendus või tugevdus koos kuju ja lakiga.', price: 'alates 45 €' },
        { name: 'Pediküür', text: 'Jalgade ja küünte hooldus koos lakkimisega.', price: '40 €' },
      ],
    },
    gallery: {
      title: 'Tööd',
      items: [{ caption: 'Prantsuse maniküür' }, { caption: 'Geellakk sügistoonides' }, { caption: 'Küünekunst' }],
    },
    about: {
      title: 'Teie meister',
      text: 'Olen maniküürimeister kaheksa aastat. Mulle meeldivad puhtad jooned ja see, kui klient lahkub hea tujuga.',
      photoAlt: 'Meistri foto',
    },
    testimonials: EXAMPLE_QUOTES,
    contact: {
      title: 'Kontakt',
      phone: PHONE,
      email: EMAIL,
      address: 'Tänava 1, Linn',
      hours: [
        { days: 'E–R', time: '10–19' },
        { days: 'L', time: '10–15' },
        { days: 'P', time: 'suletud' },
      ],
    },
  },
  universaalne: {
    lang: 'et',
    businessName: 'Teie Ettevõte',
    credit: true,
    tagline: 'Üks lause, mis ütleb, mida teete ja kellele.',
    cta: { label: 'Võta ühendust', href: 'mailto:info@teieettevote.ee' },
    intro: {
      title: 'Meist',
      text: 'Siia tulevad 2–3 lauset: mida teete, kellele ja mis teeb teid eriliseks. Kirjutage nii, nagu räägiksite kliendiga telefonis.',
    },
    services: {
      title: 'Teenused',
      items: [
        { name: 'Teie esimene teenus', text: 'Üks-kaks lauset sellest, mida see teenus kliendile annab.', price: 'alates 50 €' },
        { name: 'Teie teine teenus', text: 'Kirjeldage lühidalt ja kliendi keeles, ilma erialaterminiteta.' },
        { name: 'Teie kolmas teenus', text: 'Hinna võite näidata või jätta näitamata – otsustate teie.' },
      ],
    },
    gallery: {
      title: 'Pildid',
      items: [{ caption: 'Teie töö, toode või ruum' }, { caption: 'Veel üks hea pilt' }, { caption: 'Ja kolmas' }],
    },
    about: {
      title: 'Kes me oleme',
      text: 'Foto ja paar lauset teist või meeskonnast: kes te olete, kui kaua olete seda tööd teinud ja miks see teile meeldib.',
      photoAlt: 'Teie või meeskonna foto',
    },
    testimonials: EXAMPLE_QUOTES,
    contact: {
      title: 'Kontakt',
      phone: PHONE,
      email: EMAIL,
      address: 'Tänava 1, Linn',
      hours: [
        { days: 'E–R', time: '9–17' },
        { days: 'L–P', time: 'suletud' },
      ],
    },
  },
};
