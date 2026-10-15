# poto-poto

Next.js App Router / TypeScript / Tailwind / MongoDB-Mongoose / Cloudinary.

## Setup and deployment

1. Use Node.js 22 or newer. Run `npm ci`.
2. Copy `.env.example` to `.env.local` without overwriting existing credentials. Fill all seven keys. No key is public:
   - `MONGODB_URI`: MongoDB connection URI, including the intended database. Allow the deployment network in Atlas and grant the app read/write/index permissions for that database.
   - `ADMIN_EMAIL`: the single admin login email.
   - `ADMIN_PASSWORD`: a unique password of at least 16 characters.
   - `ADMIN_SESSION_SECRET`: an independent random secret of at least 32 characters; generate with `openssl rand -hex 32`.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: all must belong to the same Cloudinary product environment.
3. Run `npm run preflight`. This reads configuration, pings MongoDB/Cloudinary, and checks existing frame metadata. It never prints secret values or modifies records. Resolve every FAIL.
4. Run `npm run test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
5. In Vercel select the Next.js preset, the repository root, and a supported Node.js version >=22. Add the same seven environment variables separately to the intended Preview and Production environments. Do not put secrets in `NEXT_PUBLIC_*`. Configuration checked on a developer machine is not proof that Vercel has the same settings.
6. Deploy a Preview and verify the complete flow on HTTPS before promoting to Production. Environment changes require a new deployment.

Development: `npm run dev`. Admin entry: `/admin` or `/admin/login`; management: `/admin/frames`. Public booth: `/booth`.

## Storage and PNG contract

All new PNGs are validated and uploaded **from the server to Cloudinary**. There is no local-filesystem upload fallback. MongoDB stores the HTTPS delivery URL and `cloudinaryPublicId`; the latter is required to remove the corresponding asset reliably.

Maximum file size is **4 MiB** (4,194,304 bytes), with another 64 KiB allowed for multipart overhead. This stays below Vercel's 4.5 MB function payload ceiling. Oversized input is rejected on the client and while streaming the server body.

All overlays are **720 × 2224 px**, matching the original canvas. Four transparent photo windows are **624 × 468 px**, at x=48 and y=48, 534, 1020, 1506. Uploads check MIME, PNG signature, decoding, dimensions, transparency in each slot, and re-encode a static RGBA PNG. Filenames are generated; original filenames are never trusted. Unique slugs allow repeated display names.

The selected overlay is loaded with `crossOrigin="anonymous"` before assigning its URL, then drawn after photos. Cloudinary delivery must allow CORS for PNG export. Images use `<img>` and the browser canvas, so `next/image` remotePatterns are not applicable; image security has not been disabled.

If an older database contains `/uploads/frames/...` URLs or missing asset IDs, re-upload those frames to Cloudinary and remove the legacy records before deployment. `preflight` detects these cases. Deleting a legacy local record does not unlink a local file; manually clean up its old file after migration.

## Authentication and data safety

Only one environment-configured admin account; no register/roles. Opaque 256-bit session tokens are stored as hashes in MongoDB, expire after eight hours, and use HttpOnly / SameSite=Strict / Secure-in-production cookies. Logout revokes the database session; credential/secret changes invalidate existing sessions. Session signing fingerprints use the server-only secret.

All admin mutations require a matching Origin. The login throttle uses atomic MongoDB counters shared across serverless instances (10 attempts per 15-minute fixed window, including successful logins). Session and limiter collections use expiry indexes; queries independently enforce time boundaries.

MongoDB uses a hot-reload-safe per-instance cache, a pool capped at five connections, timeouts, and retry after connection failure. Models reuse registered Mongoose models. The unique slug index is awaited before an upload writes metadata. Existing duplicate slugs must be resolved first.

Public API lists only published frames newest first and sends `Cache-Control: no-store`. The picker refreshes every 15 seconds and on focus, with loading/empty/error feedback. Original is a built-in fallback, not a hardcoded replacement for database frames.

Delete first unpublishes a frame, deletes the Cloudinary asset (with CDN invalidation), and then removes metadata. A failed asset delete keeps the record retryable. Failed metadata creation attempts asset cleanup; ambiguous upload failures also attempt cleanup using the preassigned asset ID. If cleanup itself fails, reconcile the logged public ID in Cloudinary. MongoDB and Cloudinary do not share an atomic transaction.

## Routes

- Public pages: `/`, `/booth`
- Admin pages: `/admin`, `/admin/login`, `/admin/frames`
- Public API: `GET /api/frames`
- Admin API: `POST /api/admin/login`, `POST /api/admin/logout`, `GET/POST /api/admin/frames`, `PATCH/DELETE /api/admin/frames/:id`

All database/storage API routes run on Node.js. The temporary `/api/test-db` endpoint was removed. Server-only imports guard secrets, Mongoose, and Cloudinary from client imports. Responses never include exception stacks or credentials.

## Validation

- `npm test`: real PNG decoding/validation with mocked Cloudinary upload/delete/failure cleanup, and schema validation.
- `npm run preflight`: read-only checks against configured external services. This intentionally exits nonzero while credentials are missing or rejected.
- `npm audit --omit=dev`: runtime dependency audit. Full audit separately includes lint tooling.

Preview smoke test: login → upload draft → verify absence in booth → publish → select → allow webcam → capture four photos → inspect/export PNG → retake → unpublish → delete → logout. Verify mirrored preview, stream release after leaving the booth, and camera-denied feedback on a real browser. These browser tests must not be inferred from a successful build or mocked storage tests.

See `PREDEPLOYMENT_AUDIT.md` for the latest audit result and remaining blockers.
