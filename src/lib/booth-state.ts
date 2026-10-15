import type { FrameItem } from "@/lib/frame-layout";
import { isPhotoFilter, type PhotoFilter } from "@/lib/photo-filters";
export type BoothState = {
  selectedFrame: FrameItem | null;
  capturedPhotos: string[];
  selectedFilter: PhotoFilter;
  capturedAt: string | null;
};
export const BOOTH_STORAGE_KEY = "poto-poto:booth:v1";
export const initialBoothState: BoothState = { selectedFrame: null, capturedPhotos: [], selectedFilter: "original", capturedAt: null };
export function restoreBoothState(raw: string | null): BoothState {
  if (!raw) return initialBoothState;
  try {
    const data = JSON.parse(raw);
    const frame = data.selectedFrame;
    if (!frame || typeof frame._id !== "string" || typeof frame.name !== "string" || typeof frame.imageUrl !== "string" || !frame.isPublished) return initialBoothState;
    if (!frame.imageUrl.startsWith("https://") && !frame.imageUrl.startsWith("/uploads/frames/")) return initialBoothState;
    if (!Array.isArray(data.capturedPhotos) || data.capturedPhotos.length > 4 || !data.capturedPhotos.every((photo: unknown) => typeof photo === "string" && /^data:image\/(jpeg|png);base64,/.test(photo))) return initialBoothState;
    return { selectedFrame: frame, capturedPhotos: data.capturedPhotos, selectedFilter: isPhotoFilter(data.selectedFilter) ? data.selectedFilter : "original", capturedAt: typeof data.capturedAt === "string" && !Number.isNaN(Date.parse(data.capturedAt)) ? data.capturedAt : null };
  } catch { return initialBoothState; }
}
export function retakeState(state: BoothState): BoothState {
  return { ...state, capturedPhotos: [], selectedFilter: "original", capturedAt: null };
}
export function flowRedirect(path: string, state: BoothState): string | null {
  if (path === "/frames") return null;
  if (!state.selectedFrame) return "/frames";
  if ((path === "/filter" || path === "/result") && state.capturedPhotos.length !== 4) return "/booth";
  if (path === "/booth" && state.capturedPhotos.length === 4) return "/filter";
  if (path === "/result" && !isPhotoFilter(state.selectedFilter)) return "/filter";
  return null;
}
