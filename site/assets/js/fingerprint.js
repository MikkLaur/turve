'use strict';
// Browser fingerprint demo. Everything runs here, in the visitor's browser: nothing is sent or stored.
// Results are rendered with textContent only (Turve.h), never as markup.
(() => {
  const T = window.Turve;
  const config = T.json('fp-labels');
  const root = document.getElementById('fp-root');
  if (!config || !root) return;
  const L = config.labels;
  const statusBox = document.getElementById('fp-status');

  const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => (key in values ? String(values[key]) : ''));
  const safe = (fn, fallback = null) => {
    try {
      return fn();
    } catch {
      return fallback;
    }
  };
  const withTimeout = (promise, ms, fallback) =>
    Promise.race([Promise.resolve(promise).catch(() => fallback), new Promise((resolve) => setTimeout(() => resolve(fallback), ms))]);

  async function sha256(text) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  }

  // ---------- browser and operating system ----------
  function osFromUa(ua) {
    if (/iPhone|iPod/.test(ua)) return 'iOS';
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iPadOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows/.test(ua)) return 'Windows';
    if (/CrOS/.test(ua)) return 'ChromeOS';
    if (/Macintosh/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    return '';
  }

  function browserFromUa(ua) {
    const rules = [
      [/Edg(?:A|iOS)?\/(\d+)/, 'Microsoft Edge'],
      [/OPR\/(\d+)/, 'Opera'],
      [/(?:Firefox|FxiOS)\/(\d+)/, 'Firefox'],
      [/(?:Chrome|CriOS)\/(\d+)/, 'Chrome'],
      [/Version\/(\d+)[\d.]* .*Safari/, 'Safari'],
    ];
    for (const [re, name] of rules) {
      const m = ua.match(re);
      if (m) return { browser: name, version: m[1] };
    }
    return { browser: '', version: '' };
  }

  async function browserInfo() {
    const ua = navigator.userAgent;
    const info = { ...browserFromUa(ua), os: osFromUa(ua), osVersion: '', model: '', arch: '' };
    const uad = navigator.userAgentData;
    if (uad) {
      const hints = await withTimeout(uad.getHighEntropyValues(['platformVersion', 'fullVersionList', 'model', 'architecture']), 1000, null);
      const brands = ((hints && hints.fullVersionList) || uad.brands || []).filter((b) => !/not.?a.?brand/i.test(b.brand));
      const pick = brands.find((b) => b.brand !== 'Chromium') || brands[0];
      if (pick) {
        info.browser = pick.brand;
        info.version = String(pick.version).split('.')[0];
      }
      if (uad.platform) info.os = uad.platform;
      if (hints) {
        info.osVersion = hints.platformVersion || '';
        info.model = hints.model || '';
        info.arch = hints.architecture || '';
      }
    }
    return info;
  }

  function osLabel(os, version) {
    const major = parseInt(version, 10);
    if (os === 'Windows' && version) return major >= 13 ? 'Windows 11' : major > 0 ? 'Windows 10' : 'Windows';
    if (os === 'macOS' && major > 0) return `macOS ${version.split('.').slice(0, 2).join('.')}`;
    if (os === 'Android' && major > 0) return `Android ${major}`;
    return os;
  }

  // ---------- graphics (WebGL) ----------
  /** Splits on commas that are not inside parentheses. */
  function splitTop(text) {
    const parts = [];
    let depth = 0;
    let current = '';
    for (const ch of text) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    parts.push(current.trim());
    return parts;
  }

  function gpuName(renderer) {
    let name = renderer || '';
    const angle = name.match(/^ANGLE \((.*)\)$/);
    if (angle) {
      const parts = splitTop(angle[1]);
      name = parts[1] || parts[0];
    }
    return name
      .replace(/^ANGLE Metal Renderer: /, '')
      .replace(/\s*\(0x[0-9a-f]+\)/gi, '')
      .replace(/\s*\([^()]*,[^()]*\)/g, '')
      .replace(/\s+(Direct3D|vs_|ps_|OpenGL|D3D|Metal).*$/i, '')
      .replace(/\((R|TM)\)/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  const isGenericGpu = (renderer) => /^(Apple GPU|WebKit WebGL|Mozilla|Generic Renderer)$/i.test(renderer) || /or similar$/i.test(renderer);

  /** Linux + Mesa drivers often put the kernel version into the renderer string. */
  function kernelFrom(renderer) {
    const m = (renderer || '').match(/DRM [\d.]+, ([0-9]+\.[0-9]+[^,)\s]*)/);
    return m ? m[1] : '';
  }

  function webglInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    let vendor = gl.getParameter(gl.VENDOR);
    let renderer = gl.getParameter(gl.RENDERER);
    // Chromium and Safari report "WebKit WebGL" here and the real GPU through this extension;
    // Firefox reports a sanitised name directly (and warns if the extension is used).
    if (/^WebKit/.test(renderer)) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
        renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      }
    }
    const params = [
      gl.MAX_TEXTURE_SIZE, gl.MAX_RENDERBUFFER_SIZE, gl.MAX_VIEWPORT_DIMS, gl.MAX_VERTEX_ATTRIBS,
      gl.MAX_VERTEX_UNIFORM_VECTORS, gl.MAX_FRAGMENT_UNIFORM_VECTORS, gl.MAX_VARYING_VECTORS,
      gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, gl.ALIASED_LINE_WIDTH_RANGE, gl.ALIASED_POINT_SIZE_RANGE,
      gl.SHADING_LANGUAGE_VERSION,
    ].map((p) => {
      const value = gl.getParameter(p);
      return value && typeof value === 'object' && 'length' in value ? Array.from(value).join('x') : String(value);
    });
    const extensions = (gl.getSupportedExtensions() || []).slice().sort();
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return { vendor: String(vendor), renderer: String(renderer), detail: JSON.stringify([params, extensions]) };
  }

  // ---------- canvas ----------
  /**
   * The same drawing on every device: system fonts, an Estonian pangram, emoji and blended shapes.
   * scale 1 is hashed (independent of screen density and zoom); the copy shown on the page is drawn at the
   * screen's density so it stays sharp on phones.
   */
  function drawCanvas(scale, hashed = false) {
    const W = 480;
    const H = 160;
    const canvas = document.createElement('canvas');
    canvas.width = W * scale;
    canvas.height = H * scale;
    // willReadFrequently keeps the hashed copy on the CPU: Chrome otherwise switches between GPU and CPU drawing
    // depending on memory, which would change the result on the same device.
    const ctx = canvas.getContext('2d', { willReadFrequently: hashed });
    ctx.scale(scale, scale);
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 16; x < W; x += 16) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
    }
    for (let y = 16; y < H; y += 16) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f6f5f1';
    ctx.font = '600 30px sans-serif';
    ctx.fillText('turve', 20, 46);
    ctx.fillStyle = '#2dd4bf';
    ctx.fillRect(20 + ctx.measureText('turve').width + 3, 24, 15, 23);

    ctx.fillStyle = '#c9d3df';
    ctx.font = '15px serif';
    ctx.fillText('Põdur Zagrebi tšellomängija-följetonist Ciqo', 20, 78);
    ctx.fillText('külmetas kehvas garaažis.', 20, 98);

    ctx.font = '26px sans-serif';
    ctx.fillText('🔐 🦊 🍏 🛡️ 🇪🇪', 20, 140);

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(45, 212, 191, 0.85)';
    ctx.beginPath();
    ctx.arc(402, 62, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
    ctx.beginPath();
    ctx.arc(434, 88, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(222, 150);
    ctx.bezierCurveTo(300, 118, 380, 162, 466, 134);
    ctx.stroke();
    return canvas;
  }

  /** A flat colour must read back exactly; if it doesn't, the browser adds noise on purpose. */
  function canvasNoise() {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(10, 20, 30)';
    ctx.fillRect(0, 0, 8, 8);
    const data = ctx.getImageData(0, 0, 8, 8).data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 10 || data[i + 1] !== 20 || data[i + 2] !== 30 || data[i + 3] !== 255) return true;
    }
    return false;
  }

  // ---------- audio ----------
  async function audioPrint() {
    const Offline = window.OfflineAudioContext;
    if (!Offline) return null;
    const ctx = new Offline(1, 5000, 44100);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 10000;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -50;
    comp.knee.value = 40;
    comp.ratio.value = 12;
    comp.attack.value = 0;
    comp.release.value = 0.25;
    osc.connect(comp);
    comp.connect(ctx.destination);
    osc.start(0);
    const buffer = await withTimeout(ctx.startRendering(), 1500, null);
    if (!buffer) return null;
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < 5000; i++) sum += Math.abs(data[i]);
    return sum.toString();
  }

  // ---------- fonts ----------
  // Fonts that only come with certain software. IBM Plex is left out: this page loads it itself.
  const FONT_GROUPS = {
    office: ['Century Gothic', 'Bookman Old Style', 'Gill Sans MT', 'Agency FB', 'Bauhaus 93', 'Berlin Sans FB'],
    adobe: ['Minion Pro', 'Myriad Pro', 'Adobe Garamond Pro', 'Adobe Caslon Pro', 'Kozuka Gothic Pro'],
    libre: ['Linux Libertine G', 'Linux Biolinum G'],
    dev: ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Hack', 'Iosevka', 'Victor Mono', 'Monaspace Neon', 'Hasklig', 'Inconsolata'],
    nerd: [
      'JetBrainsMono Nerd Font', 'CaskaydiaMono Nerd Font', 'CaskaydiaCove Nerd Font', 'FiraCode Nerd Font',
      'Hack Nerd Font', 'MesloLGS Nerd Font', 'MesloLGS NF', 'Iosevka Nerd Font', 'Symbols Nerd Font',
    ],
    common: [
      'Arial', 'Helvetica', 'Helvetica Neue', 'Verdana', 'Georgia', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Courier New',
      'Segoe UI', 'Calibri', 'Cambria', 'Consolas', 'Bahnschrift', 'Cascadia Code', 'Comic Sans MS', 'Impact', 'Wingdings',
      'Lucida Grande', 'Menlo', 'Monaco', 'Avenir', 'Futura', 'Papyrus', 'San Francisco', 'SF Pro Text',
      'Roboto', 'Ubuntu', 'Cantarell', 'Noto Sans', 'DejaVu Sans', 'Liberation Sans', 'Open Sans', 'Lato', 'Inter', 'Fira Sans',
      'Source Sans Pro', 'Montserrat', 'Noto Color Emoji', 'Segoe UI Emoji', 'Apple Color Emoji',
    ],
  };

  function detectFonts() {
    const ctx = document.createElement('canvas').getContext('2d');
    const sample = 'mmmmmmmmmmlli WwQq@#ÕÄ 0123';
    const bases = ['monospace', 'sans-serif', 'serif'];
    const width = (font) => {
      ctx.font = font;
      return ctx.measureText(sample).width;
    };
    const baseWidth = Object.fromEntries(bases.map((b) => [b, width(`72px ${b}`)]));
    const found = {};
    for (const [group, names] of Object.entries(FONT_GROUPS)) {
      found[group] = names.filter((name) => bases.some((b) => width(`72px "${name}", ${b}`) !== baseWidth[b]));
    }
    return found;
  }

  // ---------- extras that change over time (shown, but not used for the code) ----------
  function adblock() {
    return new Promise((resolve) => {
      const bait = T.h('div', { class: 'adsbox ad-banner textads banner-ads pub_300x250 fp-bait', 'aria-hidden': 'true' }, ' ');
      document.body.append(bait);
      setTimeout(() => {
        const style = getComputedStyle(bait);
        const hidden = bait.offsetHeight === 0 || style.display === 'none' || style.visibility === 'hidden';
        bait.remove();
        resolve(hidden);
      }, 400);
    });
  }

  async function battery() {
    if (!navigator.getBattery) return null;
    const b = await withTimeout(navigator.getBattery(), 1000, null);
    return b ? { pct: Math.round(b.level * 100), charging: b.charging } : null;
  }

  const media = (query) => safe(() => matchMedia(query).matches, false);

  function languageNames(codes) {
    const names = safe(() => new Intl.DisplayNames([T.lang], { type: 'language' }), null);
    return codes.map((code) => (names && safe(() => names.of(code), null)) || code);
  }

  // ---------- collect, render ----------
  async function collect() {
    const [info, audio, blocked, batt] = await Promise.all([
      browserInfo(),
      withTimeout(safe(audioPrint), 2000, null),
      adblock(),
      battery(),
    ]);
    const gl = safe(webglInfo);
    const canvas = safe(() => drawCanvas(1, true));
    const canvasData = canvas ? safe(() => canvas.toDataURL(), null) : null;
    const shown = safe(() => drawCanvas(Math.min(3, Math.max(1, Math.ceil(window.devicePixelRatio || 1)))));
    const offset = -new Date().getTimezoneOffset() / 60;
    return {
      info,
      gl,
      shown,
      canvasData,
      noise: safe(canvasNoise, false),
      audio,
      fonts: safe(detectFonts, null),
      blocked,
      batt,
      tz: safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone, '') || '',
      utc: `UTC${offset >= 0 ? '+' : '−'}${Math.abs(offset)}`,
      languages: Array.from(navigator.languages || [navigator.language]).filter(Boolean),
      cores: navigator.hardwareConcurrency || null,
      memory: navigator.deviceMemory || null,
      touch: navigator.maxTouchPoints || 0,
      screen: { w: screen.width, h: screen.height, depth: screen.colorDepth, dpr: Math.round(devicePixelRatio * 100) / 100 },
      extended: screen.isExtended === true,
      prefs: {
        dark: media('(prefers-color-scheme: dark)'),
        reducedMotion: media('(prefers-reduced-motion: reduce)'),
        moreContrast: media('(prefers-contrast: more)'),
        forcedColors: media('(forced-colors: active)'),
      },
      dnt: navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1',
    };
  }

  /** Only what stays the same in a private window: no battery, ad blocker (extensions are off there) or dark mode. */
  function stableParts(d) {
    return {
      browser: d.info.browser,
      os: d.info.os,
      osVersion: d.info.osVersion,
      screen: [d.screen.w, d.screen.h, d.screen.depth],
      tz: d.tz,
      languages: d.languages,
      cores: d.cores,
      memory: d.memory,
      touch: d.touch,
      gl: d.gl,
      canvas: d.canvasData,
      audio: d.audio,
      fonts: d.fonts,
      prefs: [d.prefs.reducedMotion, d.prefs.moreContrast, d.prefs.forcedColors],
    };
  }

  function inferences(d) {
    const I = L.infer;
    const facts = [];
    const add = (text, good = false) => facts.push({ text, good });
    const os = osLabel(d.info.os, d.info.osVersion);
    const browser = [d.info.browser, d.info.version].filter(Boolean).join(' ');
    if (browser && os) add(fill(I.browser, { browser, os }));
    if (d.info.model) add(fill(I.model, { model: d.info.model }));
    if (d.gl) {
      const kernel = kernelFrom(d.gl.renderer);
      if (kernel) add(fill(I.kernel, { kernel }));
      const gpu = gpuName(d.gl.renderer);
      if (isGenericGpu(d.gl.renderer)) add(fill(I.gpuHidden, { gpu: d.gl.renderer }), true);
      else if (gpu) add(fill(I.gpu, { gpu }));
    }
    if (d.cores) add(fill(I.cores, { cores: d.cores }));
    if (d.memory) add(fill(I.memory, { memory: fill(d.memory >= 8 ? I.memoryAtLeast : I.memoryAbout, { gb: d.memory }) }));
    add(fill(I.screen, { w: d.screen.w, h: d.screen.h }));
    if (d.extended) add(I.secondScreen);
    if (d.touch > 0) add(I.touch);
    if (d.tz) add(fill(I.timezone, { tz: `${d.tz} (${d.utc})` }));
    if (d.languages.length) add(fill(I.languages, { langs: languageNames(d.languages).join(', ') }));
    if (d.prefs.dark) add(I.dark);
    if (d.prefs.reducedMotion) add(I.reducedMotion);
    if (d.fonts) {
      const desktopLinux = ['Linux', 'ChromeOS', 'Chrome OS', 'Android'].includes(d.info.os);
      if (d.fonts.office.length) add(I.office);
      if (d.fonts.adobe.length) add(fill(I.adobe, { fonts: d.fonts.adobe.join(', ') }));
      if (d.fonts.libre.length && !desktopLinux) add(I.libre);
      if (d.fonts.dev.length) add(fill(I.dev, { fonts: d.fonts.dev.join(', ') }));
      if (d.fonts.nerd.length) add(I.nerd);
    }
    if (d.batt && d.batt.pct < 100) add(fill(d.batt.charging ? I.batteryCharging : I.batteryDischarging, { pct: d.batt.pct }));
    if (d.blocked) add(I.adblock);
    if (d.dnt) add(I.dnt);
    if (d.noise) add(I.noise, true);
    return facts;
  }

  async function signalRows(d) {
    const U = L.unavailable;
    const short = async (value) => (value ? (await sha256(value)).slice(0, 8) : U);
    const allFonts = d.fonts ? Object.values(d.fonts).flat() : [];
    const prefs = [d.prefs.dark ? L.prefs.dark : L.prefs.light];
    if (d.prefs.reducedMotion) prefs.push(L.prefs.reducedMotion);
    if (d.prefs.moreContrast) prefs.push(L.prefs.moreContrast);
    if (d.prefs.forcedColors) prefs.push(L.prefs.forcedColors);
    const canvasHash = await short(d.canvasData);
    return [
      ['browser', [d.info.browser, d.info.version].filter(Boolean).join(' ') || U, 'medium'],
      ['os', [osLabel(d.info.os, d.info.osVersion), d.info.arch].filter(Boolean).join(' · ') || U, 'low'],
      ['screen', `${d.screen.w} × ${d.screen.h}, ${d.screen.depth}-bit, ${d.screen.dpr}×`, 'medium'],
      ['timezone', d.tz ? `${d.tz} (${d.utc})` : U, 'low'],
      ['languages', d.languages.join(', ') || U, 'medium'],
      ['cores', d.cores ? String(d.cores) : U, 'low'],
      ['memory', d.memory ? `${d.memory} GB` : U, 'low'],
      ['touch', String(d.touch), 'low'],
      ['gpu', d.gl ? `${d.gl.vendor} · ${d.gl.renderer}` : U, 'medium'],
      ['webgl', d.gl ? await short(d.gl.detail) : U, 'medium'],
      ['canvas', d.noise && d.canvasData ? `${canvasHash} (${L.noise})` : canvasHash, 'high'],
      ['audio', await short(d.audio), 'medium'],
      ['fonts', d.fonts ? (allFonts.length ? `${allFonts.length}: ${allFonts.join(', ')}` : L.noneFound) : U, 'high'],
      ['prefs', prefs.join(', '), 'low'],
      ['adblock', d.blocked ? L.yes : L.no, 'low', true],
      ['battery', d.batt ? `${d.batt.pct}%, ${d.batt.charging ? L.charging : L.discharging}` : U, 'low', true],
    ];
  }

  async function run() {
    statusBox.textContent = L.running;
    statusBox.removeAttribute('hidden');
    const d = await collect();
    const id = (await sha256(JSON.stringify(stableParts(d)))).slice(0, 12).toUpperCase().match(/.{4}/g).join('-');

    document.getElementById('fp-id').textContent = id;
    document.getElementById('fp-facts').replaceChildren(
      ...inferences(d).map((fact) => T.h('li', { class: fact.good ? 'fp-good' : null }, fact.text)),
    );
    document.getElementById('fp-signals').replaceChildren(
      ...(await signalRows(d)).map(([key, value, power, volatile]) =>
        T.h(
          'tr',
          null,
          T.h('th', { scope: 'row' }, volatile ? `${L.signals[key]} *` : L.signals[key]),
          T.h('td', null, value),
          T.h('td', null, T.h('span', { class: `fp-power power-${power}` }, L.power[power])),
        ),
      ),
    );
    if (d.shown) {
      d.shown.setAttribute('role', 'img');
      d.shown.setAttribute('aria-label', L.canvasAlt);
      document.getElementById('fp-canvas').replaceChildren(d.shown);
    }
    if (d.canvasData) document.getElementById('fp-canvas-hash').textContent = fill(L.canvasHash, { hash: (await sha256(d.canvasData)).slice(0, 8) });

    statusBox.setAttribute('hidden', '');
    root.removeAttribute('hidden');
    document.getElementById('fp-signals-section').removeAttribute('hidden');
  }

  run().catch(() => {
    statusBox.textContent = L.failed;
    statusBox.classList.add('error');
  });
})();
