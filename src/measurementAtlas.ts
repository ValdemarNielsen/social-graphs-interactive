export type AtlasDimension = 0 | 1 | 2;
export type AtlasDocument = { id: string; vector: readonly [number, number, number] };

/** Deliberately invented feature vectors. These are not learned embeddings. */
export const atlasDocuments: readonly AtlasDocument[] = [
  { id: 'A', vector: [0, 0, 0] }, { id: 'B', vector: [.8, .4, .1] }, { id: 'C', vector: [.15, .1, 3] },
  { id: 'D', vector: [3.6, 0, .2] }, { id: 'E', vector: [4, .5, .1] }, { id: 'F', vector: [3.8, .15, 3] },
];

/** Euclidean distance remains well-defined at the zero vector. No cosine is used. */
export function atlasDistance(a: AtlasDocument, b: AtlasDocument, dimensions: readonly AtlasDimension[]) {
  return Math.hypot(...dimensions.map(d => a.vector[d] - b.vector[d]));
}

export function nearestDocument(selected: number, dimensions: readonly AtlasDimension[]) {
  return atlasDocuments.map((item, i) => ({ ...item, index: i, distance: atlasDistance(atlasDocuments[selected], item, dimensions) }))
    .filter(item => item.index !== selected).sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))[0];
}

/** Both displayed coordinates use 95 SVG units per feature unit. */
export function atlasPoint(document: AtlasDocument, vertical: 1 | 2) {
  return { x: 84 + document.vector[0] * 95, y: 338 - document.vector[vertical] * 95 };
}
