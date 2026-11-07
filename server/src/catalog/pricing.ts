import { CATALOG_VERSION, GroupId, Localized, Package, findPackage } from './catalog';

export interface SelectionItem {
  id: string;
  qty: number;
}

/**
 * One priced line, frozen into the inquiry so later catalog changes don't alter what the visitor saw.
 * Inquiries from before CATALOG_VERSION 2026-11-08.1 hold the older hour-based shape (unitMinutes, minutes, …).
 */
export interface PricedLine {
  id: string;
  name: Localized;
  group: GroupId;
  billing: Package['billing'];
  /** Fixed price per unit; null = the price is set after a review. */
  unitCents: number | null;
  qty: number;
  cents: number;
}

export interface PricedSelection {
  catalogVersion: string;
  lines: PricedLine[];
  onceCents: number;
  monthlyCents: number;
  /** Some line has no fixed price yet (cents: null). */
  needsEstimate: boolean;
}

export class SelectionError extends Error {}

const MAX_ITEMS = 30;

/**
 * Accepts the estimator's selection either as JSON ([{id, qty}]) or as the hidden form field
 * string "id:qty,id:qty" (no-JS form post), and validates it against the catalog.
 */
export function parseSelection(input: unknown): SelectionItem[] {
  if (input == null || input === '') {
    return [];
  }
  let raw: unknown[];
  if (typeof input === 'string') {
    raw = input
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [id, qty] = part.split(':');
        return { id, qty: qty === undefined ? 1 : Number(qty) };
      });
  } else if (Array.isArray(input)) {
    raw = input;
  } else {
    throw new SelectionError('Selection must be a list.');
  }
  if (raw.length > MAX_ITEMS) {
    throw new SelectionError('Too many packages.');
  }

  const seen = new Set<string>();
  return raw.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new SelectionError('Invalid selection item.');
    }
    const { id, qty } = item as { id?: unknown; qty?: unknown };
    if (typeof id !== 'string') {
      throw new SelectionError('Invalid package id.');
    }
    const pkg = findPackage(id);
    if (!pkg) {
      throw new SelectionError(`Unknown package ${id.slice(0, 40)}.`);
    }
    if (seen.has(id)) {
      throw new SelectionError(`Package ${id} is listed twice.`);
    }
    seen.add(id);
    const quantity = qty === undefined ? 1 : Number(qty);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > pkg.maxQty) {
      throw new SelectionError(`Invalid quantity for ${id}.`);
    }
    return { id, qty: quantity };
  });
}

export function priceSelection(items: readonly SelectionItem[]): PricedSelection {
  const lines: PricedLine[] = items.map(({ id, qty }) => {
    const pkg = findPackage(id);
    if (!pkg) {
      throw new SelectionError(`Unknown package ${id}.`);
    }
    return {
      id: pkg.id,
      name: pkg.name,
      group: pkg.group,
      billing: pkg.billing,
      unitCents: pkg.cents,
      qty,
      cents: pkg.cents === null ? 0 : pkg.cents * qty,
    };
  });

  const sum = (billing: Package['billing']) =>
    lines.filter((line) => line.billing === billing).reduce((total, line) => total + line.cents, 0);

  return {
    catalogVersion: CATALOG_VERSION,
    lines,
    onceCents: sum('once'),
    monthlyCents: sum('monthly'),
    needsEstimate: lines.some((line) => line.unitCents === null),
  };
}
