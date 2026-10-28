import { PACKAGES } from '../../../server/src/catalog/catalog';
import { packageCard } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html } from '../html';

const PALETTE = [
  { name: 'Tint (ink)', variable: '--ink', hex: '#0d1b2a', use: 'Tekst, tume päis ja hero, logo' },
  { name: 'Tint 2', variable: '--ink-2', hex: '#1b2b40', use: 'Tumedad pinnad, kaardid tumedas alas' },
  { name: 'Paber', variable: '--paper', hex: '#f6f5f1', use: 'Lehe taust' },
  { name: 'Kaart', variable: '--card', hex: '#ffffff', use: 'Kaardid, vormiväljad' },
  { name: 'Joon', variable: '--line', hex: '#dcd9d0', use: 'Piirjooned' },
  { name: 'Hall tekst', variable: '--muted', hex: '#4f5b6b', use: 'Teisane tekst' },
  { name: 'Türkiis', variable: '--accent', hex: '#0f766e', use: 'Nupud ja lingid heledal taustal' },
  { name: 'Hele türkiis', variable: '--accent-bright', hex: '#2dd4bf', use: 'Rõhud tumedal taustal, logo kursor' },
  { name: 'Korras', variable: '--pass', hex: '#15803d', use: 'Kontrolli tulemus: korras (alati koos tekstiga)' },
  { name: 'Hoiatus', variable: '--warn', hex: '#b45309', use: 'Kontrolli tulemus: hoiatus' },
  { name: 'Probleem', variable: '--fail', hex: '#b91c1c', use: 'Kontrolli tulemus: probleem' },
];

/** Brand review page for the owner (dev builds only, /stiil/). Not linked, not in the sitemap. */
export function styleTilePage(ctx: PageContext): PageOutput {
  const sample = PACKAGES.find((p) => p.id === 'sec-checkup')!;
  const sample2 = PACKAGES.find((p) => p.id === 'web-extra-page')!;
  const body = html`
    <section class="hero">
      <div class="wrap hero-inner">
        <p class="eyebrow">Stiilitahvel · ülevaatuseks</p>
        <p class="brand brand-xl"><span class="brand-word">turve</span><span class="brand-cursor" aria-hidden="true"></span></p>
        <p class="lead">Sõnamärk „turve“ väiketähtedega IBM Plex Sans SemiBoldis ja türkiisne kursor: insener, terminal, „valmis kirjutama“. Kursor vilgub ainult siin ja ainult siis, kui süsteemis pole vähendatud liikumist sisse lülitatud.</p>
        <p class="button-row"><a class="button" href="#varvid">Nupp</a><a class="button ghost on-dark" href="#tuup">Teisane nupp</a></p>
      </div>
    </section>

    <section class="section" id="varvid">
      <div class="wrap">
        <h2>Värvid</h2>
        <p class="section-lead">Tumesinine annab usaldust ja tõsidust, türkiis on „korras, turvaline“. Olekuid ei näidata kunagi ainult värviga.</p>
        <div class="swatches">
          ${PALETTE.map(
            (c) => html`<div class="swatch"><span class="swatch-color" data-swatch="${c.variable}"></span><strong>${c.name}</strong><code>${c.hex}</code><span class="muted">${c.use}</span></div>`,
          )}
        </div>
      </div>
    </section>

    <section class="section alt" id="tuup">
      <div class="wrap">
        <h2>Kirjatüüp</h2>
        <p class="section-lead">IBM Plex Sans (tekst) ja IBM Plex Mono (tunnid, hinnad, tehnilised väärtused). Mõlemad OFL-litsentsiga ja serveeritakse meie enda serverist.</p>
        <h1>Pealkiri 1: turvalised veebilehed</h1>
        <h2>Pealkiri 2: vanade lehtede uuendamine</h2>
        <h3>Pealkiri 3: turva-tervisekontroll</h3>
        <p class="lead">Juhatus: iga tund on näha enne, kui tellite.</p>
        <p>Sisutekst: Õun, šokolaad ja žürii. Ärge visake vana lehte minema – teeme selle korda ja lisame, mida täna vaja on.</p>
        <p class="mono-sample"><code>12 h · 660 €</code> <code>Strict-Transport-Security: max-age=31536000</code></p>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <h2>Paketikaardid</h2>
        <div class="package-grid">${packageCard(sample, ctx)}${packageCard(sample2, ctx, { selectable: true })}</div>
      </div>
    </section>

    <section class="section alt">
      <div class="wrap narrow">
        <h2>Turvakontrolli tulemus</h2>
        <div class="check-summary">
          <p class="grade grade-c" aria-label="Hinne C"><span>C</span></p>
          <div><p class="check-domain">naide.ee</p><p class="muted">72 punkti 100-st</p></div>
        </div>
        <ul class="findings">
          <li class="finding status-fail"><span class="badge">Probleem</span><div><strong>HSTS</strong><p>Strict-Transport-Security puudub.</p></div></li>
          <li class="finding status-warn"><span class="badge">Hoiatus</span><div><strong>DMARC</strong><p>DMARC on ainult jälgimisrežiimis (p=none).</p></div></li>
          <li class="finding status-pass"><span class="badge">Korras</span><div><strong>Sertifikaat</strong><p>Sertifikaat kehtib ja vastab domeenile.</p></div></li>
          <li class="finding status-info"><span class="badge">Teave</span><div><strong>security.txt</strong><p>security.txt puudub.</p></div></li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="wrap narrow">
        <h2>Vormid</h2>
        <form class="contact-form" action="#">
          <div class="field"><label for="s-name">Nimi</label><input id="s-name" type="text" value="Mari Maasikas"></div>
          <div class="field"><label for="s-email">E-post</label><input id="s-email" type="email" aria-invalid="true" value="mari@"></div>
          <p class="notice">Teavitus: kalkulaator vajab JavaScripti.</p>
          <p class="notice error">Viga: palun kontrollige märgitud välju.</p>
        </form>
      </div>
    </section>`;
  return { id: null, title: 'Stiilitahvel | Turve', description: 'Brand review', body, noindex: true };
}
