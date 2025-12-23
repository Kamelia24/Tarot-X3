import type { MultiplierEntry } from '../types';

export function drawMultiplier(entries: MultiplierEntry[]): number {
  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;

  for (const entry of entries) {
    r -= entry.weight;
    if (r <= 0) {
      return entry.value;
    }
  }

  return entries[entries.length - 1].value;
}
