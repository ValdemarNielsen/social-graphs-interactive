import { ENTITY_DOCUMENTS, ENTITY_MENTIONS, cooccurrenceGraph, resolveEntityMap } from './weekSevenMath.ts';

export type IdentityWire = { id: string; left: string; right: string };
export const MAX_IDENTITY_WIRES = 4;
const mentionIds = ENTITY_MENTIONS.map(mention => mention.id as string);
export function identityWire(left: string, right: string): IdentityWire {
  if (!mentionIds.includes(left) || !mentionIds.includes(right)) throw new RangeError('Unknown candidate mention.');
  if (left === right) throw new RangeError('A wire needs two different candidate mentions.');
  const [a, b] = [left, right].sort();
  return { id: `${a}:${b}`, left: a, right: b };
}

export const ALIAS_WIRE = identityWire('apple-brand', 'apple-inc');
export const INITIAL_IDENTITY_WIRES = [identityWire('apple-brand', 'apple-fruit'), identityWire('jordan-person', 'jordan-country')];

export function identityFault(wire: IdentityWire): string | null {
  const id = identityWire(wire.left, wire.right).id;
  if (id === ALIAS_WIRE.id) return null;
  const ids = new Set([wire.left, wire.right]);
  if (ids.has('apple-fruit') && (ids.has('apple-brand') || ids.has('apple-inc'))) return 'D1 describes a company hiring someone; D2 describes a fruit being eaten. These are different referents, even when the letters match.';
  if (ids.has('jordan-person') && ids.has('jordan-country')) return 'Jordan Lee is a person in D1. Jordan is a country in D3. The shared name does not establish one identity.';
  if (ids.has('jordan-country') && ids.has('greece')) return 'D4 names two countries in a trade statement. Appearing in the same document does not make them the same place.';
  const a = ENTITY_MENTIONS.find(mention => mention.id === wire.left)!;
  const b = ENTITY_MENTIONS.find(mention => mention.id === wire.right)!;
  const together = ENTITY_DOCUMENTS.find(doc => doc.mentions.includes(wire.left) && doc.mentions.includes(wire.right));
  return `${a.label} (${a.kind}) and ${b.label} (${b.kind}) have no supported alias here. ${together ? `${together.id} mentions them together; co-occurrence is not identity.` : 'No document establishes that they refer to the same thing.'}`;
}

export function inspectIdentityWires(wires: readonly IdentityWire[]) {
  const normalized = wires.map(wire => identityWire(wire.left, wire.right));
  if (new Set(normalized.map(wire => wire.id)).size !== normalized.length) throw new RangeError('Duplicate identity wires are not allowed.');
  const resolution = resolveEntityMap(mentionIds, normalized.map(wire => ({ ...wire, decision: 'merge' as const })));
  const objectives = [
    resolution['apple-brand'] !== resolution['apple-fruit'],
    resolution['jordan-person'] !== resolution['jordan-country'],
    resolution['apple-brand'] === resolution['apple-inc'],
  ];
  const faults = normalized.filter(wire => wire.id !== ALIAS_WIRE.id).map(wire => ({ ...wire, reason: identityFault(wire)! }));
  const hasAlias = normalized.some(wire => wire.id === ALIAS_WIRE.id);
  return {
    resolution, graph: cooccurrenceGraph(ENTITY_DOCUMENTS, resolution), objectives,
    repairs: objectives.filter(Boolean).length, faults, hasAlias,
    solved: normalized.length === 1 && hasAlias,
  };
}
