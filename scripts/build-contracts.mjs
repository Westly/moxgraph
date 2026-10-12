// Canonical schema definitions. Generated schemas, types and CSP-safe validators stay in sync.
import { mkdir, writeFile } from 'node:fs/promises';
import Ajv from 'ajv';
import standalone from 'ajv/dist/standalone/index.js';
import { compile } from 'json-schema-to-typescript';

const str = { type: 'string' };
const text = { type: 'string', pattern: '[\\s\\S]' };
const uuid = { type: 'string', pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' };
const hash = { type: 'string', pattern: '^[0-9a-f]{64}$' };
const url = { type: 'string', pattern: '^[hH][tT][tT][pP][sS]?://[^\\s]+$' };
const date = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' };
const time = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$' };
const count = { type: 'integer', minimum: 0 };
const en = (...values) => ({ enum: values });
const arr = (items) => ({ type: 'array', items });
const nullable = (schema) => ({ anyOf: [schema, { type: 'null' }] });
const ref = (name) => ({ $ref: `#/$defs/${name}` });
const obj = (properties) => ({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });
const map = (values) => ({ type: 'object', additionalProperties: values });
const finish = en('nonfoil', 'foil', 'etched');
const status = en('exact', 'manual', 'alias', 'ambiguous', 'unknown', 'conflict');
const filePath = { type: 'string', pattern: '^(?:[a-z0-9_-]+/)*[a-z0-9_-]+\\.json$' };
const defs = {
  SourceSnapshot: obj({ id: text, source: text, url, sourceUpdatedAt: nullable(time), retrievedAt: time,
    sha256: hash, bytes: count, records: count, parserVersion: text, status: en('complete') }),
  PrintingFace: obj({ index: count, name: nullable(text), oracleId: nullable(uuid), sourceArtistCredit: nullable(str),
    artistIds: arr(uuid), illustrationId: nullable(uuid), imageUrl: nullable(url) }),
  CardPrinting: obj({ id: uuid, oracleIds: arr(uuid), name: text, printedName: nullable(text), setCode: text,
    setName: nullable(text), collectorNumber: text, language: text, finishes: arr(finish), layout: text,
    games: arr(en('paper', 'mtgo', 'arena', 'astral', 'sega')), paper: { type: 'boolean' }, digital: { type: 'boolean' },
    category: en('card','token','emblem','art_card','auxiliary'),
    sourceArtistCredit: nullable(str), artistIds: arr(uuid), illustrationId: nullable(uuid), imageUrl: nullable(url),
    scryfallUrl: url, faces: arr(ref('PrintingFace')) }),
  Artist: obj({ key: text, displayName: nullable(text), sourceIds: arr(uuid), sourceNames: arr(text),
    kind: en('individual','collective','unknown') }),
  ArtistMapping: obj({ id: text, eventId: text, attendanceId: text, magicconNames: arr(text), artistKeys: arr(text),
    sourceArtistIds: arr(uuid), scryfallNames: map(arr(text)), status: en('verified','review_needed','unmatched'),
    method: text, evidenceUrls: arr(url), reviewedAt: date, notes: str }),
  ArtistLink: obj({ id: text, type: text, platform: nullable(text), label: text, originalUrl: nullable(str),
    displayUrl: nullable(url), sourceProfileUrl: url, retrievedAt: time }),
  Attendance: obj({ id: text, eventId: text, rawName: text, guestId: nullable(text), mappingId: text,
    profileUrl: url, portraitUrl: nullable(url), portraitAttribution: text, booth: nullable(text), days: arr(text),
    status: en('listed','cancelled','unknown'), sourceUrls: arr(url), links: arr(ref('ArtistLink')) }),
  ArtistStatistics: obj({ artistKey: text, snapshotId: text, scope: text, uniqueCards: nullable(count),
    printingEditions: nullable(count), languagePrintings: nullable(count), uniqueArtworks: nullable(count),
    supplementalObjects: nullable(count), missingOracleIds: nullable(count), missingIllustrations: nullable(count) }),
  Event: obj({ id: text, name: text, startsAt: date, endsAt: date, location: text, directoryUrl: url,
    snapshotId: text, retrievedAt: time }),
  SavedDeck: obj({ id: uuid, provider: en('moxfield','archidekt','file'), sourceDeckId: nullable(text), sourceUrl: nullable(url),
    title: text, importedAt: time, refreshedAt: nullable(time), sourceChecksum: hash, schemaVersion: { const: 1 },
    dataVersion: text, mappingRevision: text }),
  DeckLine: obj({ deckId: uuid, sourceLineKey: text, sourcePrintingId: nullable(text), sourceScryfallId: nullable(uuid),
    name: text, quantity: { type: 'integer', minimum: 1 }, section: text, categories: arr(text), setCode: nullable(text),
    collectorNumber: nullable(text), language: nullable(text), finish: nullable(finish), rawFinish: nullable(text),
    resolvedPrintingId: nullable(uuid), resolutionStatus: status, reason: nullable(text),
    manualChoice: nullable(obj({ selectedAt: time, printingId: uuid, reason: text })) }),
  MatchResult: obj({ sourceLineKey: text, eventId: text, printingId: nullable(uuid), artistKey: nullable(text),
    faceIndexes: arr(count), attendanceIds: arr(text), dataVersion: text,
    state: en('attending','no_listed_attendee','artist_unmapped','credit_missing','data_unavailable'), reason: nullable(text) }),
  EventDirectory: obj({ event: ref('Event'), attendance: arr(ref('Attendance')), mappings: arr(ref('ArtistMapping')),
    statistics: arr(ref('ArtistStatistics')) }),
  FileDescriptor: obj({ sha256: hash, bytes: count, gzipBytes: count, records: count,
    kind: en('printings','tuples','artist-index','artists','event','sources') }),
  DataManifest: obj({ schemaVersion: { const: 1 }, version: { type: 'string', pattern: '^v1-[0-9a-f]{16}$' },
    cardSnapshotId: text, eventSnapshotId: text, sourceUpdatedAt: time, eventRetrievedAt: time, mappingRevision: text,
    generatorVersion: text, uuidPrefixLength: { const: 3 }, printingColumns: arr(text),
    coverage: obj({ printings: count, languages: count, sets: count, artists: count, attendees: count, faces: count }),
    files: { type: 'object', propertyNames: filePath, additionalProperties: ref('FileDescriptor') } }),
  ActiveManifest: obj({ schemaVersion: { const: 1 }, version: { type: 'string', pattern: '^v1-[0-9a-f]{16}$' },
    manifestSha256: hash, manifestBytes: { type: 'integer', minimum: 1, maximum: 4 * 1024 * 1024 } }),
};
const columns = Object.keys(defs.CardPrinting.properties);
const schema = { $schema: 'http://json-schema.org/draft-07/schema#', $id: 'https://moxgraph.com/schemas/contracts-v1.json',
  title: 'Contracts', ...obj(Object.fromEntries(Object.keys(defs).map(k => [k, ref(k)]))), $defs: defs };
for (const dir of ['schemas', 'src/models']) await mkdir(dir, { recursive: true });
await writeFile('schemas/contracts.schema.json', JSON.stringify(schema, null, 2) + '\n');
await writeFile('schemas/printing-columns.json', JSON.stringify(columns) + '\n');
await writeFile('src/models/contracts.ts', await compile(schema, 'Contracts', { bannerComment: '/* Generated by npm run contracts. Edit scripts/build-contracts.mjs. */' }));
const ajv = new Ajv({ allErrors: true, strict: true, code: { source: true, esm: true, lines: true }, validateFormats: false });
ajv.addSchema(schema);
const exports = Object.fromEntries(Object.keys(defs).map(k => [`validate${k}`, schema.$id + '#/$defs/' + k]));
await writeFile('src/models/validators.js', standalone(ajv, exports));
await writeFile('src/models/validators.d.ts', Object.keys(defs).map(k => `export function validate${k}(value: unknown): boolean;`).join('\n') + '\n');
console.log(`Generated ${Object.keys(defs).length} schemas, TypeScript contracts and standalone validators.`);
