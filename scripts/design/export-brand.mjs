// Pass a local installed sharp module path; this utility is not part of the app build.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { default: sharp } = await import(pathToFileURL(resolve(process.argv[2])).href);
for (const size of [32, 180, 512]) {
  await sharp('public/brand/favicon.svg').resize(size, size).png().toFile(`public/brand/icon-${size}.png`);
}
await sharp('public/brand/wordmark.svg', { density: 288 }).png().toFile('public/brand/wordmark.png');
await sharp('public/brand/concepts.svg', { density: 144 }).png().toFile('public/brand/concepts.png');
console.log('Exported PNG brand assets.');
