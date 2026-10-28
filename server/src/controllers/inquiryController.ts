import { Request, Response } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import type { Lang } from '../catalog/catalog';
import { parseSelection, priceSelection, PricedSelection, SelectionError } from '../catalog/pricing';
import { CONTACT_PATH, THANK_YOU_PATH } from '../catalog/sitePaths';
import { config } from '../config/config';
import { insertInquiry } from '../repositories/inquiries';
import { findCheckByPublicId } from '../repositories/securityChecks';
import { checkFormToken, issueFormToken } from '../services/formToken';

/** Field names shared with the contact form in site/src. "hp" is the honeypot: a hidden field people leave empty. */
export const inquiryValidation = [
  body('lang').optional().isIn(['et', 'en']),
  body('name').isString().trim().isLength({ min: 2, max: 200 }),
  body('company').optional({ values: 'falsy' }).isString().trim().isLength({ max: 200 }),
  body('email').isString().trim().isLength({ max: 254 }).isEmail(),
  body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 40 }).matches(/^[0-9+()\-.\s]*$/),
  body('website').optional({ values: 'falsy' }).isString().trim().isLength({ max: 255 }),
  body('message').optional({ values: 'falsy' }).isString().trim().isLength({ max: 5000 }),
  body('consent').custom((value) => value === true || value === 'on' || value === 'true' || value === '1'),
  body('check').optional({ values: 'falsy' }).isString().matches(/^[A-Za-z0-9_-]{22}$/),
  body('packages').optional({ values: 'falsy' }),
  body('hp').optional(),
  body('token').optional(),
];

function isFormPost(req: Request): boolean {
  return !!req.is('application/x-www-form-urlencoded');
}

function langOf(req: Request): Lang {
  return (req.body as { lang?: unknown } | undefined)?.lang === 'en' ? 'en' : 'et';
}

/** Minimal HTML answer for a no-JS form post that didn't validate. All text is fixed; nothing from the request is echoed. */
function formErrorPage(res: Response, lang: Lang): void {
  const text =
    lang === 'en'
      ? { title: 'Please check the form', body: 'Some fields were missing or invalid. Go back, check the form and send it again.', back: 'Back to the form' }
      : { title: 'Palun kontrollige vormi', body: 'Mõni väli oli puudu või vigane. Minge tagasi, kontrollige vormi ja saatke uuesti.', back: 'Tagasi vormi juurde' };
  res
    .status(400)
    .type('html')
    .send(
      `<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width">` +
        `<title>${text.title}</title><h1>${text.title}</h1><p>${text.body}</p>` +
        `<p><a href="${config.siteOrigin}${CONTACT_PATH[lang]}">${text.back}</a></p></html>`,
    );
}

export function getFormToken(_req: Request, res: Response): void {
  res.json({ token: issueFormToken() });
}

export async function createInquiry(req: Request, res: Response): Promise<void> {
  const lang = langOf(req);
  const fail = (fields: string[]) =>
    isFormPost(req) ? formErrorPage(res, lang) : void res.status(400).json({ message: 'Validation failed', fields });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    fail(errors.array().map((e) => (e.type === 'field' ? e.path : e.type)));
    return;
  }
  const data = matchedData(req) as Record<string, string | undefined> & { packages?: unknown; hp?: unknown; token?: unknown };

  let selection: PricedSelection | null = null;
  try {
    const items = parseSelection(data.packages);
    selection = items.length ? priceSelection(items) : null;
  } catch (error) {
    if (error instanceof SelectionError) {
      fail(['packages']);
      return;
    }
    throw error;
  }

  const check = data.check ? await findCheckByPublicId(data.check) : null;
  const message = data.message?.trim() || null;
  if (!message && !selection && !check) {
    fail(['message']);
    return;
  }

  const flags: string[] = [];
  const honeypot = typeof data.hp === 'string' && data.hp.trim() !== '';
  if (honeypot) {
    flags.push('honeypot');
  }
  const verdict = checkFormToken(data.token);
  if (verdict !== 'ok') {
    flags.push(`token-${verdict}`);
  }
  if (isFormPost(req)) {
    flags.push('no-js');
  }

  await insertInquiry({
    lang,
    name: data.name!.trim(),
    company: data.company?.trim() || null,
    email: data.email!.trim(),
    phone: data.phone?.trim() || null,
    website: data.website?.trim() || null,
    message,
    selection,
    securityCheckId: check?.id ?? null,
    // Honeypot hits are kept (autofill can trigger it) but filed as spam, and the sender sees the normal answer.
    status: honeypot ? 'spam' : 'new',
    flags,
  });

  if (isFormPost(req)) {
    res.redirect(303, `${config.siteOrigin}${THANK_YOU_PATH[lang]}`);
    return;
  }
  res.status(201).json({ ok: true });
}
