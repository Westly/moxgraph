import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDeckUrl } from '../../src/imports/url.ts';
test('deck URLs normalize only the two allowed public provider page formats', () => {
  assert.deepEqual(parseDeckUrl(' https://www.moxfield.com/decks/3x55_3CFz060qxL2xac3NA/?utm_source=test#view '), { provider:'moxfield', id:'3x55_3CFz060qxL2xac3NA', url:'https://moxfield.com/decks/3x55_3CFz060qxL2xac3NA' });
  assert.equal(parseDeckUrl('archidekt.com/decks/19780118/rog_thras_japanese_evil_twin').url, 'https://archidekt.com/decks/19780118');
  for (const url of ['https://moxfield.com.evil.test/decks/3x55_3CFz060qxL2xac3NA','https://evil.test/?moxfield.com/decks/3x55_3CFz060qxL2xac3NA','https://u:p@moxfield.com/decks/3x55_3CFz060qxL2xac3NA','http://moxfield.com/decks/3x55_3CFz060qxL2xac3NA','https://moxfield.com:444/decks/3x55_3CFz060qxL2xac3NA','https://moxfield.com/decks/%33x55_3CFz060qxL2xac3NA','https://moxfield.com/decks/3x55_3CFz060qxL2xac3NA/extra','https://archidekt.com/decks/0','https://archidekt.com/decks/1/a/b','https://archidekt.com/api/decks/1','file:///decks/1','https://moxfield.com\\@evil.test/decks/3x55_3CFz060qxL2xac3NA']) assert.throws(()=>parseDeckUrl(url), url);
});
