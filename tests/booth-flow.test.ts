import test from 'node:test';
import assert from 'node:assert/strict';
import { flowRedirect, initialBoothState, restoreBoothState, retakeState } from '../src/lib/booth-state';
import { composeStrip } from '../src/lib/compose-strip';
import { PHOTO_FILTERS, type PhotoFilter } from '../src/lib/photo-filters';
const frame = { _id: 'frame', name: 'Test frame', slug: 'test', imageUrl: 'https://example.com/frame.png', isPublished: true, createdAt: '2026-10-15T00:00:00Z' };
const photos = ['1', '2', '3', '4'].map(value => `data:image/jpeg;base64,${value}`);
const complete = { selectedFrame: frame, capturedPhotos: photos, selectedFilter: 'bw' as const, capturedAt: '2026-10-15T00:00:00Z' };
test('route prerequisites and four-photo transition', () => {
  for (const path of ['/booth', '/filter', '/result']) assert.equal(flowRedirect(path, initialBoothState), '/frames');
  const partial = { ...complete, capturedPhotos: photos.slice(0, 3) };
  assert.equal(flowRedirect('/filter', partial), '/booth');
  assert.equal(flowRedirect('/result', partial), '/booth');
  assert.equal(flowRedirect('/booth', complete), '/filter');
  assert.equal(flowRedirect('/result', complete), null);
});
test('refresh restores originals; malformed storage resets safely; retake keeps frame', () => {
  assert.deepEqual(restoreBoothState(JSON.stringify(complete)), complete);
  assert.deepEqual(restoreBoothState('broken-json'), initialBoothState);
  assert.deepEqual(restoreBoothState(JSON.stringify({ ...complete, capturedPhotos: ['https://external/photo'] })), initialBoothState);
  assert.equal(restoreBoothState(JSON.stringify({ ...complete, selectedFilter: '__proto__' })).selectedFilter, 'original');
  const next = retakeState(complete);
  assert.equal(next.selectedFrame, frame); assert.deepEqual(next.capturedPhotos, []); assert.equal(next.selectedFilter, 'original');
  assert.equal(complete.capturedPhotos, photos); assert.equal(complete.selectedFilter, 'bw');
});
test('all filters apply to four photos only; overlay then branding remain unfiltered', () => {
  for (const key of Object.keys(PHOTO_FILTERS) as PhotoFilter[]) {
    const calls: { kind: string; filter: string; source?: unknown }[] = [];
    const canvas = { width: 0, height: 0 };
    const context = {
      canvas, filter: 'none', fillStyle: '', textAlign: '', font: '',
      fillRect() { calls.push({ kind: 'background', filter: this.filter }); },
      drawImage(source: unknown) { calls.push({ kind: 'image', filter: this.filter, source }); },
      fillText() { calls.push({ kind: 'text', filter: this.filter }); },
    };
    const images = [{}, {}, {}, {}] as CanvasImageSource[];
    const overlay = {} as CanvasImageSource;
    composeStrip(context as unknown as CanvasRenderingContext2D, images, overlay, key, new Date(complete.capturedAt));
    assert.deepEqual(calls.slice(1, 5).map(call => call.filter), Array(4).fill(PHOTO_FILTERS[key].css));
    assert.equal(calls[5].source, overlay); assert.equal(calls[5].filter, 'none');
    assert.ok(calls.slice(6).every(call => call.kind === 'text' && call.filter === 'none'));
    assert.equal(canvas.width, 720); assert.equal(canvas.height, 2224); assert.equal(context.filter, 'none');
  }
});
