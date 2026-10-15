# poto-poto

## Development

1. `npm install`
2. Copy `.env.example` to `.env.local`, set a strong `ADMIN_PASSWORD`, `ADMIN_EMAIL`, and a working `MONGODB_URI`.
3. Start MongoDB, then `npm run dev`.
4. Open `/admin/login`, upload a frame, and publish it. Open `/booth` to select it.

The admin has one environment-configured account; no registration. Sessions last eight hours, use random opaque HttpOnly/SameSite=Strict cookies, and are stored as hashes in MongoDB. Logout revokes the session. Changing credentials invalidates existing sessions. Cookies require HTTPS in production. Login throttling is in-process (10 attempts per 15-minute window); use a shared limiter before deploying multiple instances.

## PNG contract

All overlays are **720 × 2224 px**, matching the original canvas. Four photo windows are **624 × 468 px**, at x=48 and y=48, 534, 1020, 1506. Keep those windows transparent. Maximum upload: 5 MB. Uploads validate PNG signature, decoding, dimensions, and transparency in each slot, and re-encode the image. No per-frame slot coordinates are stored.

Photos retain the existing monochrome treatment. The selected PNG is drawn last, above the photos and original footer. Put opaque artwork over the footer area if you want to replace the original branding. Original remains available even if the database is unavailable. The frame picker refreshes every 15 seconds and when the window regains focus.

## Storage and endpoints

Development PNGs are stored in `public/uploads/frames/`, with unique generated filenames. Metadata lives in MongoDB. `src/lib/frame-storage.ts` is the storage adapter to replace for future object storage. This local disk setup is intended for a single persistent development server, not ephemeral/serverless hosting. Back up both MongoDB and uploaded files. Draft/unpublished PNG URLs remain public if known; only published metadata is listed publicly.

- `GET /api/frames`: published frames, newest first; no cache.
- `POST /api/admin/login`, `POST /api/admin/logout`
- `GET/POST /api/admin/frames`
- `PATCH/DELETE /api/admin/frames/:id`

All admin frame endpoints require a session. Mutations also require a matching Origin header. Delete unpublishes first, removes the PNG, then deletes metadata; failed file removal stays retryable in admin.

## Checks

`npm run lint` and `npm run build`.

Manual smoke test: login → upload draft → verify absence in booth → publish → select in booth → capture four photos → download PNG → unpublish → delete → logout. Check invalid PNG, oversized files, wrong dimensions, failed login, and unauthenticated admin requests. Webcam testing requires camera permission on localhost or HTTPS.

Verified during implementation: lint, TypeScript, production build, and API integration against a disposable MongoDB (authentication/Origin guards, invalid PNG/size/dimensions/transparency, draft filtering, publish/unpublish, file serving, deletion, and rejection of a revoked session). Browser webcam/canvas end-to-end testing remains manual because the sandbox could not launch Chrome.

Dependency audit: the existing Next.js 16.3.4 and lint dependency tree report 8 advisories (1 critical, 7 high). Framework versions were kept unchanged in this feature update; resolve these before public deployment.
