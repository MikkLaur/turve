// Every interpolation is HTML-escaped unless it is a Raw value (built by html`` itself or raw()).
const RAW = Symbol('raw');

export interface Raw {
  readonly [RAW]: string;
}

export function raw(trusted: string): Raw {
  return { [RAW]: trusted };
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function isRaw(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && RAW in value;
}

function piece(value: unknown): string {
  if (value === null || value === undefined || value === false) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map(piece).join('');
  }
  if (isRaw(value)) {
    return value[RAW];
  }
  return escapeHtml(String(value));
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): Raw {
  let out = strings[0]!;
  values.forEach((value, i) => {
    out += piece(value) + strings[i + 1]!;
  });
  return raw(out);
}

export function toString(fragment: Raw): string {
  return fragment[RAW];
}

/** JSON in a <script> data block (application/json or ld+json): never executed, so CSP allows it. */
export function jsonBlock(id: string | null, data: unknown, type = 'application/json'): Raw {
  const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  const idAttr = id ? ` id="${escapeHtml(id)}"` : '';
  return raw(`<script type="${escapeHtml(type)}"${idAttr}>${json}</script>`);
}
