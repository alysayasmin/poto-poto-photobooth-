export const PHOTO_FILTERS = {
  original: { label: "Original", css: "none" },
  bw: { label: "B&W", css: "grayscale(1)" },
  warm: { label: "Warm", css: "sepia(0.2) saturate(1.15)" },
  cool: { label: "Cool", css: "saturate(0.9) hue-rotate(8deg)" },
  vintage: { label: "Vintage", css: "sepia(0.35) contrast(0.92) brightness(1.04)" },
  contrast: { label: "High Contrast", css: "contrast(1.25) saturate(0.9)" },
} as const;
export type PhotoFilter = keyof typeof PHOTO_FILTERS;
export function isPhotoFilter(value: unknown): value is PhotoFilter {
  return typeof value === "string" && Object.hasOwn(PHOTO_FILTERS, value);
}
