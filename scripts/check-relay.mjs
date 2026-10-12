import {readFile} from 'node:fs/promises';
import {checkRelayConfig} from './release-policy.mjs';
checkRelayConfig(JSON.parse(await readFile('tools/import-relay/wrangler.jsonc','utf8')));
console.log('Relay policy passed: only three bounded rate counters; no paid CPU override; observability off; no storage or paid bindings. Account Free status and measured CPU still need live verification.');
