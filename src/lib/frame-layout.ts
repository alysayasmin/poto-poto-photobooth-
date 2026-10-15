export const FRAME_LAYOUT = { width: 720, height: 2224, padding: 48, photoWidth: 624, photoHeight: 468, gap: 18 } as const;
export const MAX_FRAME_BYTES = 5 * 1024 * 1024;
export type FrameItem = { _id: string; name: string; slug: string; imageUrl: string; isPublished: boolean; createdAt: string };
