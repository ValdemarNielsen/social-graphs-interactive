/** Start on the leading edge, rather than waiting for most of the artwork.
 * A smaller exit threshold avoids chatter while retaining offscreen pauses. */
export function sequenceIsVisible(top: number, bottom: number, viewportHeight: number, safeTop: number, wasVisible = false) {
  const available = Math.max(0, viewportHeight - safeTop - 18);
  const height = Math.max(0, bottom - top);
  const shown = Math.max(0, Math.min(bottom, viewportHeight - 18) - Math.max(top, safeTop));
  const threshold = wasVisible ? 8 : 40;
  return height > 0 && available > 0 && shown >= Math.min(threshold, height * .2, available * .2);
}
