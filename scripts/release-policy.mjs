import assert from 'node:assert/strict';

export function checkPortablePath(path) {
  assert.ok(!path.split('/').some(part => /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part)), `Windows reserved filename: ${path}`);
}

export function checkHeaders(text) {
  const csp = text.split(/\r?\n/).find(l => l.trim().startsWith('Content-Security-Policy:'));
  assert.ok(csp, 'Static Content-Security-Policy is required');
  for (const directive of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'", "form-action 'self'", "connect-src 'self' https://moxgraph-import-relay-probe.westlywhite.workers.dev https://cards.scryfall.io"]) {
    assert.ok(csp.split(';').some(d => d.trim() === directive || d.trim() === `Content-Security-Policy: ${directive}`), `Missing or expanded policy: ${directive}`);
  }
  assert.ok(!/unsafe-inline|unsafe-eval|\*|data:/.test(csp), 'CSP cannot allow inline code, eval or arbitrary origins');
  for (const header of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy: strict-origin-when-cross-origin']) assert.ok(text.includes(header), `Missing ${header}`);
}

export function checkPublishedText(text, path) {
  assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[A-Z0-9]{16})\b/.test(text), `Credential pattern in ${path}`);
  assert.ok(!/(?:3x55_3CFz060qxL2xac3NA|zB7a13TqOUWlUZuylE905Q|SbEkgxN4CEqiCG5B94rkkg)/.test(text), `Personal fixture deck identifier in ${path}`);
  assert.ok(!/axe-core|Local WBS 9 QA|synthetic-changed-provider-id/.test(text), `Development harness in ${path}`);
  if (path.endsWith('.svg')) assert.ok(!/<script|\bon\w+\s*=|<foreignObject|javascript:/i.test(text), `Active SVG content in ${path}`);
}

export function checkRelayConfig(config) {
  const expected = {
    name: 'moxgraph-import-relay-probe', main: 'worker.mjs', compatibility_date: '2026-10-11', workers_dev: true, preview_urls: false,
    // Free enforces its own 10 ms allowance; configuring a custom CPU limit is
    // rejected by Cloudflare on Free (API 100328). No paid-plan override here.
    observability: { enabled: false },
    ratelimits: [
      { name: 'IMPORT_BURST_LIMIT', namespace_id: '97431001', simple: { limit: 2, period: 10 } },
      { name: 'IMPORT_IP_LIMIT', namespace_id: '97431002', simple: { limit: 12, period: 60 } },
      { name: 'IMPORT_PROVIDER_LIMIT', namespace_id: '97431003', simple: { limit: 60, period: 60 } }
    ]
  };
  assert.deepEqual(config, expected, 'Relay boundary changed: review Free plan, CPU, rate limits, storage/bindings and logging before publishing');
}
