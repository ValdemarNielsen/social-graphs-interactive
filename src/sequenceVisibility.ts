/** Count only the usable viewport, below the fixed navigation. Tall artwork
 * can still play when it fills that area; a sliver at either edge cannot. */
export function sequenceIsVisible(top: number, bottom: number, viewportHeight: number, safeTop: number, wasVisible = false) {
  const available = Math.max(0, viewportHeight - safeTop - 18);
  const height = Math.max(0, bottom - top);
  const shown = Math.max(0, Math.min(bottom, viewportHeight - 18) - Math.max(top, safeTop));
  return height > 0 && available > 0 && shown >= Math.min(height, available) * (wasVisible ? .72 : .86);
}
