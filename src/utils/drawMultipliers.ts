import data from '../data/multipliers.json';

export function drawMultiplier(): number {
  const total = data.reduce((s, m) => s + m.weight, 0);
  let r = Math.random() * total;

  for (const m of data) {
    if (r < m.weight) return m.value;
    r -= m.weight;
  }

  return data[0].value;
}
