import test from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { saveFrame, deleteFrameFile, frameSlug } from '../src/lib/frame-storage';
import { Frame } from '../src/models/Frame';
import { MAX_FRAME_BYTES } from '../src/lib/frame-layout';

test('PNG validation, cloud upload/delete, and failure cleanup', async (t) => {
  const original = { ...process.env };
  Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'test', CLOUDINARY_API_SECRET: 'test' });
  t.after(() => { process.env = original; });
  let uploadFails = false;
  const deleted: string[] = [];
  const uploaded: Buffer[] = [];
  t.mock.method(cloudinary.uploader, 'upload_stream', (options: Record<string, unknown>, callback: (error: unknown, result?: unknown) => void) => {
    const chunks: Buffer[] = [];
    return new Writable({
      write(chunk, _encoding, done) { chunks.push(Buffer.from(chunk)); done(); },
      final(done) {
        uploaded.push(Buffer.concat(chunks));
        callback(uploadFails ? new Error('Provider timeout') : null, { secure_url: 'https://res.cloudinary.com/test/image/upload/frame.png', public_id: options.public_id });
        done();
      },
    });
  });
  t.mock.method(cloudinary.uploader, 'destroy', async (id: string) => { deleted.push(id); return { result: 'ok' }; });
  const file = (buffer: Buffer, type = 'image/png') => new File([new Uint8Array(buffer)], '../../untrusted.exe', { type });
  const png = await sharp({ create: { width: 720, height: 2224, channels: 4, background: { r: 20, g: 30, b: 40, alpha: 0 } } }).png().toBuffer();
  const result = await saveFrame(file(png), frameSlug('../../Crème Chrome!'));
  assert.match(result.cloudinaryPublicId, /^poto-poto\/frames\/creme-chrome-[a-f0-9-]+$/);
  assert.match(result.imageUrl, /^https:/);
  const meta = await sharp(uploaded[0]).metadata();
  assert.equal(meta.width, 720); assert.equal(meta.height, 2224); assert.equal(meta.format, 'png');
  await deleteFrameFile(result); assert.equal(deleted[0], result.cloudinaryPublicId);
  await assert.rejects(saveFrame(file(png, 'text/plain'), 'invalid'));
  await assert.rejects(saveFrame(file(Buffer.from('not png')), 'invalid'));
  await assert.rejects(saveFrame(file(Buffer.alloc(MAX_FRAME_BYTES + 1)), 'large'), { status: 413 });
  const wrongSize = await sharp(png).resize(100, 100).png().toBuffer();
  await assert.rejects(saveFrame(file(wrongSize), 'invalid'));
  const opaque = await sharp(png).removeAlpha().png().toBuffer();
  await assert.rejects(saveFrame(file(opaque), 'invalid'));
  await assert.rejects(deleteFrameFile({ imageUrl: 'https://example.com/no-id.png' }), { status: 409 });
  await assert.rejects(deleteFrameFile({ imageUrl: '', cloudinaryPublicId: '../../outside' }), { status: 409 });
  uploadFails = true;
  await assert.rejects(saveFrame(file(png), 'failed'), /Cloudinary upload failed/);
  assert.equal(deleted.length, 2, 'ambiguous failed upload must attempt cleanup');
});

test('Frame model retains required fields, defaults, unique slug, and timestamps', async () => {
  const missing = new Frame();
  await assert.rejects(missing.validate());
  const frame = new Frame({ name: 'Frame', slug: 'frame', imageUrl: 'https://example.com/frame.png' });
  await frame.validate();
  assert.equal(frame.isPublished, false);
  assert.equal(Frame.schema.path('slug').options.unique, true);
  assert.ok(Frame.schema.path('createdAt')); assert.ok(Frame.schema.path('updatedAt'));
});
