import { FRAME_LAYOUT } from "@/lib/frame-layout";
import { PHOTO_FILTERS, type PhotoFilter } from "@/lib/photo-filters";
export function composeStrip(ctx: CanvasRenderingContext2D, images: CanvasImageSource[], overlay: CanvasImageSource | null, filter: PhotoFilter, date: Date) {
  if (images.length !== 4) throw new Error("Exactly four photos are required.");
  if (!("filter" in ctx) && filter !== "original") throw new Error("This browser cannot export filters. Please use Original or a browser with canvas filter support.");
  const { width, height, padding, photoWidth, photoHeight, gap } = FRAME_LAYOUT;
  ctx.canvas.width = width; ctx.canvas.height = height;
  ctx.filter = "none"; ctx.fillStyle = "#f4f2ec"; ctx.fillRect(0, 0, width, height);
  images.forEach((image, index) => {
    ctx.filter = PHOTO_FILTERS[filter].css;
    ctx.drawImage(image, padding, padding + index * (photoHeight + gap), photoWidth, photoHeight);
    ctx.filter = "none";
  });
  if (overlay) ctx.drawImage(overlay, 0, 0, width, height);
  ctx.fillStyle = "#111111"; ctx.textAlign = "center"; ctx.font = "700 32px Arial, sans-serif";
  ctx.fillText("poto-poto", width / 2, height - 76);
  ctx.font = "16px Arial, sans-serif";
  ctx.fillText(new Intl.DateTimeFormat("en-GB").format(date), width / 2, height - 39);
}
