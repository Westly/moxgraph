// Shared fail-closed gate for local, GitHub, Pages and Worker builds. No network
// retrieval or deployment happens here; the committed catalogue is validated.
import {spawnSync} from 'node:child_process';

const commands = [
  [process.execPath, ['node_modules/tsx/dist/cli.mjs', '--test', 'tests/app/*.test.ts']],
  [process.execPath, ['--test', 'tests/import-relay.test.mjs', 'tests/release-policy.test.mjs']],
  [process.platform === 'win32' ? 'python' : 'python3', ['-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py']],
  [process.execPath, [process.env.npm_execpath, 'run', 'build']],
];
for (const [command, args] of commands) {
  const result = spawnSync(command, args, {stdio:'inherit'});
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('Release checks passed. Deployment may proceed.');
