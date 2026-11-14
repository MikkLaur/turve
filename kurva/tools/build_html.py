#!/usr/bin/env python3
"""Writes site/index.html for Kurva Nokitseb from the texts below and the files in site/img/.

The page is plain static HTML: this script only saves repeating the <picture> markup 30 times. Texts come from
content.md (derived claims are marked there, never here). Run: python3 -I tools/build_html.py
"""
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "site" / "img"

SZ_ONE = "(min-width: 90em) 310px, (min-width: 48em) 22vw, 84vw"
SZ_TILE = "(min-width: 90em) 310px, (min-width: 48em) 22vw, 44vw"
SZ_TWO = "(min-width: 90em) 660px, (min-width: 48em) 47vw, 84vw"
SZ_HERO = "(min-width: 90em) 570px, (min-width: 48em) 40vw, 92vw"
SZ_PORTRAIT = "(min-width: 90em) 310px, (min-width: 48em) 22vw, 92vw"

ALT = {
    "hero-enne": "Plekiline betoonist trepp enne plaatimist",
    "hero-parast": "Valge kullasoonelise plaadiga trepp ja trepimade, seina ääres valgusriba, all avatud välisuks",
    "trepp-enne": "Plekiline betoonist trepp enne plaatimist",
    "trepp-ajal": "Tasandatud astmed, servadel metallprofiilid ja oranž teip",
    "trepp-parast": "Valmis trepp välisukse juurest vaadatuna, üleval puitpõrand ja kummut",
    "vannituba-ajal": "Vannituba roheliste niiskuskindlate plaatidega, põrandal laserlood",
    "vannituba-nis": "WC valgustatud niši ees, mõlemal pool soojad valgusribad",
    "vannituba-parast": "Valge marmorimustriga seinaga vannituba, must vihmadušš ja riiulinišid",
    "kook-enne": "Tühjaks võetud köök, plekiline lagi, redel ja tööriistad põrandal",
    "kook-ajal": "Köögisein vanade plaatide jäänustega, torud ja kipsplaadid",
    "kook-parast": "Mustad köögikapid, marmorimustriga tagasein ja soe valgusriba kappide all",
    "korter-enne": "Elutuba paljaste betoonseinte ja parkettpõrandaga",
    "korter-ajal": "Pooleldi krohvitud aknasein, kaetud aken ja segunõu",
    "korter-parast": "Valmis elutuba heledate seinte, uue põranda ja puitliistudest seinaga",
    "rays-ajal": "Keldribaar telliskivivõlvi all ehituse ajal, tööriistad põrandal",
    "rays-lett": "Baarileti tagune: tumedad riiulid, külmikud ja valamu kiviseina ääres",
    "rays-parast": "Mängunurga kapp liistudest esiküljega, riiulitel lauamängud, peal vana teler",
    "vahepeal-lammutus": "Lammutatud lae ja seinakattega pesuruum, põrandal praht",
    "vahepeal-katmine": "Paberi ja teibiga kaetud põrand remondi ajal",
    "vahepeal-margid": "Seina pragu, ümber tõmmatud pliiatsiring",
    "vahepeal-plaatimine": "Suured põrandaplaadid, vahedes loodimisklambrid",
    "kristo": "Kristo Kurvits värvib rulliga seina",
}

# (number, title, story, [(photo id, stage word) x3])
PROJECTS = [
    ("01", "Trepp",
     "Trepp oli plekiline betoon. Tasandasin astmed, panin servadele profiilid ja katsin trepi valge, "
     "kullasoonelise plaadiga. Seina äärde tuli valgusriba, mis näitab õhtul teed.",
     [("trepp-enne", "Enne"), ("trepp-ajal", "Ajal"), ("trepp-parast", "Pärast")]),
    ("02", "Vannituba",
     "Suur vannituba algas paljastest niiskuskindlatest plaatidest. Seintele tulid suured marmorimustriga plaadid, "
     "põrandale tume kivimustriga plaat, dušiseina sisse riiulinišid ja WC taha valgustatud nišš.",
     [("vannituba-ajal", "Ajal"), ("vannituba-nis", "Pärast"), ("vannituba-parast", "Pärast")]),
    ("03", "Köök",
     "Köök oli seinteni lahti võetud: vanade plaatide jäänused, torud väljas, lagi plekiline. Nüüd on seinad "
     "siledad ja valged, põrand uus ning mustade kappide taga marmorimustriga tagasein.",
     [("kook-enne", "Enne"), ("kook-ajal", "Ajal"), ("kook-parast", "Pärast")]),
    ("04", "Korter",
     "Elutoa seintelt oli vana krohv kohati maas ja betoon paistis läbi. Krohvisin ja pahteldasin seinad siledaks, "
     "põrandale tuli uus kate ja ühele seinale puitliistud.",
     [("korter-enne", "Enne"), ("korter-ajal", "Ajal"), ("korter-parast", "Pärast")]),
    ("05", "Ray's baar",
     "Ray's 50's & 60's Music Bar Tartus, keldris võlvide all. Tegin baarileti taguse ja mängunurga: riiulid, "
     "kapi liistudega esikülje ja seinad.",
     [("rays-ajal", "Ajal"), ("rays-lett", "Pärast"), ("rays-parast", "Pärast")]),
]

TILES = [
    ("vahepeal-lammutus", "Lammutus", "Vannituba ja pesuruum"),
    ("vahepeal-katmine", "Katmine", "Korter"),
    ("vahepeal-margid", "Pragude märkimine", "Korter"),
    ("vahepeal-plaatimine", "Plaatimine", "Pesuruum"),
]

SERVICES = [
    ("Plaatimine", "vannitoad, köögid, trepid, põrandad"),
    ("Ehitusviimistlus", "krohvimine, pahteldamine, värvimine"),
    ("Üldehitus", ""),
    ("Vannitoad", ""),
    ("Trepid", ""),
    ("Köögid ja korterid", ""),
    ("Äripinnad", "näiteks Ray's baar Tartus"),
]


def t(s):
    return escape(s, quote=False)


def widths(pid):
    return sorted({int(m.group(1)) for p in IMG.glob(f"{pid}-*.webp") if (m := re.search(r"-(\d+)\.webp$", p.name))})


def picture(pid, sizes, *, lazy=True, high=False):
    ws = widths(pid)
    if not ws:
        raise SystemExit(f"no image files for {pid}")
    srcset = lambda ext: ", ".join(f"img/{pid}-{w}.{ext} {w}w" for w in ws)
    fallback = 800 if 800 in ws else ws[-1]
    attrs = 'loading="lazy" decoding="async"' if lazy else 'decoding="async"' + (' fetchpriority="high"' if high else "")
    return (
        f'<picture><source type="image/avif" srcset="{srcset("avif")}" sizes="{sizes}">'
        f'<img src="img/{pid}-{fallback}.webp" srcset="{srcset("webp")}" sizes="{sizes}" width="1200" height="1600" '
        f'alt="{t(ALT[pid])}" {attrs}></picture>'
    )


def frame(pid, stage, n, total, sizes):
    return (
        f'<figure class="frame">{picture(pid, sizes)}'
        f'<figcaption><span>{stage}</span><span>{n} / {total}</span></figcaption></figure>'
    )


def project(num, title, story, frames):
    items = "\n".join(
        f'        <li>{frame(pid, stage, i + 1, 3, SZ_TWO if i == 2 else SZ_ONE)}</li>' for i, (pid, stage) in enumerate(frames)
    )
    return f"""    <article class="project reveal">
      <div class="story fade">
        <h3><span class="label p-num">{num}</span> {t(title)}</h3>
        <p>{t(story)}</p>
      </div>
      <ol class="change" tabindex="0" aria-label="{t(title)}: fotod enne, ajal ja pärast">
{items}
      </ol>
    </article>"""


def tile(pid, title, label, i):
    return (
        f'        <li><figure class="frame">{picture(pid, SZ_TILE)}'
        f'<figcaption class="tile-cap"><span class="tile-title">{t(title)}</span>'
        f'<span class="label">{t(label)}</span></figcaption></figure></li>'
    )


def service(name, note):
    note_html = f'<span class="svc-note">{t(note)}</span>' if note else ""
    return f'        <li class="fade"><span class="svc-name">{t(name)}</span>{note_html}</li>'


def build():
    projects = "\n".join(project(*p) for p in PROJECTS)
    tiles = "\n".join(tile(*x, i) for i, x in enumerate(TILES))
    services = "\n".join(service(*s) for s in SERVICES)
    hero_before = picture("hero-enne", SZ_HERO, lazy=False, high=True)
    hero_after = picture("hero-parast", SZ_HERO, lazy=False)
    ws = widths("hero-enne")
    preload_set = ", ".join(f"img/hero-enne-{w}.avif {w}w" for w in ws)

    return f"""<!DOCTYPE html>
<html lang="et">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kurva Nokitseb · Plaatimine ja siseviimistlus Tartus</title>
  <meta name="description" content="Kristo Kurvits teeb plaatimis-, ehitusviimistlus- ja üldehitustöid Tartus ja Tartumaal. Vaadake töid enne ja pärast. Helistage 5562&nbsp;6600.">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#e4ded3">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="preload" href="fonts/newsreader-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" as="image" type="image/avif" href="img/hero-enne-800.avif" imagesrcset="{preload_set}" imagesizes="{SZ_HERO}" fetchpriority="high">
  <link rel="stylesheet" href="css/site.css">
  <script src="js/site.js"></script>
</head>
<body id="top">
<a class="skip" href="#tood">Liigu sisu juurde</a>

<header class="site-header">
  <div class="wrap">
    <a class="wordmark" href="#top">Kurva Nokitseb</a>
    <nav class="nav" aria-label="Lehe osad">
      <a class="link" href="#tood">Tööd</a>
      <a class="link" href="#teenused">Mida teen</a>
      <a class="link" href="#kristo">Kes nokitseb</a>
    </nav>
    <a class="link head-tel" href="tel:+37255626600">5562&nbsp;6600</a>
  </div>
</header>

<main>
  <section class="wrap hero" aria-labelledby="h-hero">
    <div class="hero-text">
      <p class="label hero-area">Kristo Kurvits · Tartu ja Tartumaa</p>
      <h1 id="h-hero"><span class="h1-a">Enne ja pärast.</span>
        <em>Vahepeal nokitsen mina.<svg class="pencil" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M 44 9 C 118 2 232 3 281 15 C 302 23 297 47 262 52 C 192 60 92 58 35 50 C 6 44 3 20 30 12 C 62 4 142 2 222 7" fill="none" stroke="#1e1a15" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg></em></h1>
      <div class="hero-lower">
        <p class="hero-sub">Plaatimine, ehitusviimistlus ja üldehitus. Vannitoad, trepid, köögid ja korterid.</p>
        <a class="button" href="tel:+37255626600">Helistage&nbsp;5562&nbsp;6600</a>
      </div>
    </div>
    <figure class="frame hero-frame">
      <div class="stack">
        <div class="hero-before">{hero_before}</div>
        <div class="hero-after">{hero_after}</div>
      </div>
      <figcaption>
        <span class="cap cap-before"><span>Trepp · enne</span><span>1 / 2</span></span>
        <span class="cap cap-after"><span>Trepp · pärast</span><span>2 / 2</span></span>
      </figcaption>
    </figure>
  </section>

  <section class="wrap block" id="tood" aria-labelledby="h-tood">
    <div class="block-head" aria-hidden="true"><span class="label num">01</span><span class="label">Tehtud tööd</span></div>
    <h2 id="h-tood">Tehtud tööd</h2>
{projects}
  </section>

  <section class="wrap block" id="vahepeal" aria-labelledby="h-vahepeal">
    <div class="block-head" aria-hidden="true"><span class="label num">02</span><span class="label">Vahepeal</span></div>
    <h2 id="h-vahepeal">Vahepeal</h2>
    <p class="lede">Enne ilusat lõppu on töö, mida pärast ei näe.</p>
    <ol class="tiles reveal">
{tiles}
    </ol>
  </section>

  <section class="wrap block" id="teenused" aria-labelledby="h-teenused">
    <div class="block-head" aria-hidden="true"><span class="label num">03</span><span class="label">Mida teen</span></div>
    <div class="services-grid">
      <h2 id="h-teenused">Mida teen</h2>
      <div class="services-body reveal">
        <ul class="services">
{services}
        </ul>
        <p class="fade closing">Pole kindel, kas teie töö käib minu alla? Helistage ja küsige.</p>
        <p class="fade closing">Iga töö on isemoodi, nii ka hind. Helistage, räägime läbi ja teen teile pakkumise.</p>
      </div>
    </div>
  </section>

  <section class="wrap block" id="kristo" aria-labelledby="h-kristo">
    <div class="block-head" aria-hidden="true"><span class="label num">04</span><span class="label">Kes nokitseb?</span></div>
    <div class="about reveal">
      <h2 id="h-kristo">Kes nokitseb?</h2>
      <figure class="frame portrait">{picture("kristo", SZ_PORTRAIT)}<figcaption><span>Kristo Kurvits</span><span></span></figcaption></figure>
      <div class="about-text fade">
        <p class="about-p">Olen Kristo Kurvits ja Kurva Nokitseb olen mina. Nokitsema tähendab teha, kuni on õige. Teen tööd ise ja oma kätega, Tartus ja Tartumaal.</p>
        <blockquote class="quote">
          <p>„Meie täname. Hea töö.“</p>
          <p class="label source">Ray's 50's &amp; 60's Music Bar, Tartu</p>
        </blockquote>
      </div>
    </div>
  </section>

  <section class="wrap block" id="helista" aria-labelledby="h-helista">
    <div class="block-head"><span class="label num" aria-hidden="true">05</span><h2 class="label" id="h-helista">Helistage</h2></div>
    <div class="reveal">
      <a class="tel-big fade" href="tel:+37255626600">5562&nbsp;6600</a>
      <ul class="contact">
        <li class="fade"><span class="label">E-post</span><a class="link" href="mailto:kristo@kurvanokitseb.ee">kristo@kurvanokitseb.ee</a></li>
        <li class="fade"><span class="label">Piirkond</span><span>Tartu ja Tartumaa</span></li>
        <li class="fade"><span class="label">Hind</span><span>Pakkumise teen iga töö kohta eraldi.</span></li>
      </ul>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="wrap">
    <p class="label">Kurva Nokitseb OÜ · registrikood 16968778</p>
    <p class="label"><a class="link" href="https://www.turve.ee">Kodulehe tegi turve.ee</a></p>
    <p class="label">© 2026</p>
  </div>
</footer>
</body>
</html>
"""


if __name__ == "__main__":
    out = ROOT / "site" / "index.html"
    out.write_text(build(), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size} bytes)")
