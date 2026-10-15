import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce, position } from './adapter.js';
const base = 'http://127.0.0.1:3600/';
test('metadata protocol converts milliseconds and freezes paused progress', () => {
  let state = reduce(initialState(), { type: 'position', data: { currPosition: 10000, duration: 60000 } }, base, 1000);
  assert.equal(position(state, 3000), 12);
  state = reduce(state, { type: 'pause' }, base, 3000);
  assert.equal(position(state, 9000), 12);
});
test('only accepts metadata-server artwork and removes upstream title span formatting', () => {
  let state = reduce(initialState(), { type: 'trackInfos', data: { title: 'Song <span>(Live)</span>' } }, base);
  assert.equal(state.title, 'Song (Live)');
  state = reduce(state, { type: 'PICT', data: { url: 'img/123.webp' } }, base);
  assert.equal(state.art, base + 'img/123.webp');
  assert.equal(reduce(state, { type: 'PICT', data: { url: 'https://example.com/img/x' } }, base).art, state.art);
  assert.equal(reduce(state, { type: 'stop' }, base).art, '');
});
