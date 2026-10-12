import * as validators from './validators.js';
import type { Contracts, CardPrinting } from './contracts';
import columns from '../../schemas/printing-columns.json';

export class DataValidationError extends Error {}
export function parseContract<K extends keyof Contracts>(name: K, value: unknown): Contracts[K] {
  const validator = validators[`validate${name}` as keyof typeof validators];
  if (!validator(value)) throw new DataValidationError(`Invalid ${name} data`);
  return value as Contracts[K];
}

export function decodePrinting(row: unknown): CardPrinting {
  if (!Array.isArray(row) || row.length !== columns.length) throw new DataValidationError('Invalid printing row');
  return parseContract('CardPrinting', Object.fromEntries(columns.map((key, i) => [key, row[i]])));
}

export function safeWebUrl(value: string): URL {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || !url.hostname) {
    throw new DataValidationError('Invalid web URL');
  }
  return url;
}
