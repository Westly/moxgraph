import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('release gate refuses a Worker, raw database or credential-like file in static output', async () => {
  for (const name of ['_worker.js','cards.sqlite','.env.production']) {
    const root = await mkdtemp(path.join(tmpdir(),'moxgraph-guard-'));
    try {
      await writeFile(path.join(root,name),'test-only');
      const result = spawnSync(process.execPath,['scripts/check-data.mjs',root],{encoding:'utf8'});
      assert.notEqual(result.status,0); assert.match(result.stderr,/Unapproved deployable file|Unexpected server/);
    } finally {
      // Only the unique temporary directory created by this test is removed.
      assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir())+path.sep));
      await rm(root,{recursive:true});
    }
  }
});
