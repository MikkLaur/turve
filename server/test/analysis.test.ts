import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { scoreFindings, suggestPackages } from '../src/check/grade';
import { dmarcFinding, spfFinding } from '../src/check/mailFindings';
import type { Finding } from '../src/check/types';
import { headerFindings, securityTxtFinding } from '../src/check/webFindings';

const status = (findings: Finding[], id: Finding['id']) => findings.find((f) => f.id === id)?.status;

describe('headerFindings', () => {
  it('passes a well-configured site', () => {
    const findings = headerFindings(
      {
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'content-security-policy': "default-src 'self'; frame-ancestors 'none'",
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'camera=()',
        'set-cookie': ['sid=abc; Secure; HttpOnly; SameSite=Lax'],
        server: 'Apache',
      },
      '<html><head><title>x</title></head></html>',
    );
    assert.ok(findings.every((f) => f.status === 'pass'), JSON.stringify(findings.filter((f) => f.status !== 'pass')));
  });

  it('flags a typical old WordPress site', () => {
    const findings = headerFindings(
      {
        'strict-transport-security': 'max-age=300',
        'x-powered-by': 'PHP/7.4.33',
        'set-cookie': ['PHPSESSID=1; path=/'],
        'content-security-policy': "script-src 'self' 'unsafe-inline'",
      },
      '<meta name="generator" content="WordPress 5.8.2" />',
    );
    assert.equal(status(findings, 'header.hsts'), 'warn');
    assert.equal(status(findings, 'header.csp'), 'warn');
    assert.equal(status(findings, 'header.nosniff'), 'fail');
    assert.equal(status(findings, 'header.framing'), 'fail');
    assert.equal(status(findings, 'disclosure.server'), 'fail', 'PHP 7.4 is end-of-life');
    assert.equal(status(findings, 'disclosure.generator'), 'warn');
    assert.equal(status(findings, 'cookies.flags'), 'warn');
    assert.equal(findings.find((f) => f.id === 'cookies.flags')?.evidence, 'PHPSESSID: Secure, HttpOnly');
  });

  it('treats CSP with nonces as strict, and supported PHP as a mere disclosure', () => {
    const findings = headerFindings({ 'content-security-policy': "script-src 'nonce-abc' 'unsafe-inline'", 'x-powered-by': 'PHP/8.3.1' }, '');
    assert.equal(status(findings, 'header.csp'), 'pass');
    assert.equal(status(findings, 'disclosure.server'), 'warn');
  });

  it('reads security.txt', () => {
    assert.equal(securityTxtFinding(200, 'Contact: mailto:security@example.ee\n').status, 'pass');
    assert.equal(securityTxtFinding(200, '<html>not found page</html>').status, 'info');
    assert.equal(securityTxtFinding(null, '').status, 'info');
  });
});

describe('mail records', () => {
  it('grades SPF', () => {
    assert.equal(spfFinding(['v=spf1 include:_spf.google.com -all'], true).status, 'pass');
    assert.equal(spfFinding(['v=spf1 include:_spf.google.com ~all'], true).status, 'pass');
    assert.equal(spfFinding(['v=spf1 ~all'], false).status, 'warn', 'no mail → should be -all');
    assert.equal(spfFinding(['v=spf1 ?all'], true).status, 'warn');
    assert.equal(spfFinding(['v=spf1 +all'], true).status, 'fail');
    assert.equal(spfFinding(['v=spf1 a mx'], true).status, 'warn');
    assert.equal(spfFinding(['v=spf1 redirect=_spf.example.ee'], true).status, 'pass');
    assert.equal(spfFinding(['v=spf1 -all', 'v=spf1 ~all'], true).status, 'fail');
    assert.equal(spfFinding(['google-site-verification=x'], true).status, 'fail');
  });

  it('grades DMARC', () => {
    assert.equal(dmarcFinding(['v=DMARC1; p=reject; rua=mailto:x@example.ee'], true).status, 'pass');
    assert.equal(dmarcFinding(['v=DMARC1; p=quarantine'], true).status, 'pass');
    assert.equal(dmarcFinding(['v=DMARC1; p=quarantine'], false).status, 'warn');
    assert.equal(dmarcFinding(['v=DMARC1; p=none'], true).status, 'warn');
    assert.equal(dmarcFinding([], true).status, 'fail');
  });
});

describe('grading', () => {
  it('fails a site without HTTPS regardless of score', () => {
    assert.equal(scoreFindings([{ id: 'https.available', status: 'fail' }]).grade, 'F');
  });

  it('caps an invalid certificate at D', () => {
    const { grade, score } = scoreFindings([{ id: 'https.available', status: 'pass' }, { id: 'tls.certificate', status: 'fail' }]);
    assert.equal(score, 75);
    assert.equal(grade, 'D');
  });

  it('suggests matching packages', () => {
    const findings: Finding[] = [
      { id: 'mail.dmarc', status: 'fail' },
      { id: 'header.hsts', status: 'fail' },
      { id: 'disclosure.generator', status: 'warn' },
    ];
    assert.deepEqual(suggestPackages(findings, 80), ['sec-checkup', 'mod-security-update', 'mod-review']);
    assert.deepEqual(suggestPackages([{ id: 'header.hsts', status: 'pass' }], 100), ['sec-pentest-site']);
  });
});
