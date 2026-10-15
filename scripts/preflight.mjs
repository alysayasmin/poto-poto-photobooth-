import nextEnv from '@next/env';
import mongoose from 'mongoose';
import cloudinaryPackage from 'cloudinary';
const { loadEnvConfig } = nextEnv;
const cloudinary = cloudinaryPackage.v2;
loadEnvConfig(process.cwd());
let failed = false;
const keys = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const present = key => !!process.env[key]?.trim() && process.env[key].trim() !== '...';
function result(label, pass, detail = '') {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label}${detail ? ': ' + detail : ''}`);
  if (!pass) failed = true;
}
for (const key of keys) result(key, present(key), present(key) ? 'set (value hidden)' : 'missing/placeholder');
if (present('ADMIN_EMAIL')) result('Admin email format', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.ADMIN_EMAIL.trim()));
if (present('ADMIN_PASSWORD')) result('Admin password length', process.env.ADMIN_PASSWORD.trim().length >= 16);
if (present('ADMIN_SESSION_SECRET')) result('Session secret length', process.env.ADMIN_SESSION_SECRET.trim().length >= 32);
if (present('MONGODB_URI')) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 1, serverSelectionTimeoutMS: 8000 });
    await mongoose.connection.db.admin().ping();
    result('MongoDB connection', true);
    const frames = mongoose.connection.db.collection('frames');
    const local = await frames.countDocuments({ imageUrl: { $regex: '^/' } });
    const missingId = await frames.countDocuments({ cloudinaryPublicId: { $in: [null, ''] } });
    const duplicates = await frames.aggregate([{ $group: { _id: '$slug', count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }, { $count: 'count' }]).toArray();
    result('Persistent frame metadata', local === 0 && missingId === 0, `${local} local URLs, ${missingId} missing asset IDs`);
    result('Unique existing slugs', duplicates.length === 0);
  } catch {
    result('MongoDB connection', false, 'check URI, credentials, network access, and database permissions');
  } finally { await mongoose.disconnect(); }
}
if (['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].every(present)) {
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(), api_key: process.env.CLOUDINARY_API_KEY.trim(), api_secret: process.env.CLOUDINARY_API_SECRET.trim(), secure: true });
  try { await cloudinary.api.ping(); result('Cloudinary credentials', true); }
  catch (error) {
    const message = error.error?.message || error.message || '';
    result('Cloudinary credentials', false, message.includes('cloud_name mismatch') ? 'cloud_name mismatch: all three keys must belong to the same product environment' : 'check product environment, API key/secret, permissions, and connectivity');
  }
}
console.log(failed ? 'NOT READY TO DEPLOY' : 'Configuration checks passed. Verify the same settings and the full photobooth flow in a Vercel preview.');
process.exitCode = failed ? 1 : 0;
