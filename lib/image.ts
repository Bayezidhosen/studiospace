/**
 * next/image only optimizes hosts configured in next.config.ts
 * (`images.unsplash.com`). Studio photos are host-submitted URLs, so any
 * other — valid but unlisted — host passes through unoptimized instead of
 * erroring at request time.
 */
export function isOptimizableImage(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}
