// Rekenregel los testen: npm test
const test = require('node:test');
const assert = require('node:assert');
const { berekenTarief } = require('../src/tarief.js');

const standaard = { frequentie: 2.48, contractperiode: 1.21, lengte: 1, betaalmethode: 0.9, opmaak: 1 };

test('één winkel met standaardkeuzes', () => {
  // ((12,5 × 2,48 × 1,21 × 1 × 1) + 25) × 0,9 = 56,259
  const t = berekenTarief({ startbedrag: 25, opslagen: [12.5], factoren: standaard });
  assert.strictEqual(t.toFixed(3), '56.259');
});

test('meerdere winkels: opslagen worden opgeteld', () => {
  // ((12,5 + 20) × 2,48 × 1,21 + 25) × 0,9 = 110,27...
  const t = berekenTarief({ startbedrag: 25, opslagen: [12.5, 20], factoren: standaard });
  assert.strictEqual(t.toFixed(2), ((32.5 * 2.48 * 1.21 * 1 * 1 + 25) * 0.9).toFixed(2));
});

test('startbedrag telt één keer, niet per winkel', () => {
  const een = berekenTarief({ startbedrag: 25, opslagen: [10], factoren: {} });
  const twee = berekenTarief({ startbedrag: 25, opslagen: [10, 10], factoren: {} });
  assert.strictEqual(twee - een, 10);
});

test('geen winkels: null', () => {
  assert.strictEqual(berekenTarief({ startbedrag: 25, opslagen: [], factoren: standaard }), null);
});

test('ontbrekende factoren tellen als 1', () => {
  assert.strictEqual(berekenTarief({ startbedrag: 5, opslagen: [10] }), 15);
});

test('betaalmethode vermenigvuldigt ook het startbedrag', () => {
  assert.strictEqual(berekenTarief({ startbedrag: 25, opslagen: [10], factoren: { betaalmethode: 10 } }), 350);
});

test('opmaak werkt als factor op de opslag (huidige rekenregel)', () => {
  // Let op: 12x per jaar opmaak vermenigvuldigt de opslag met 12. Nog af te stemmen met ABK.
  const t = berekenTarief({ startbedrag: 0, opslagen: [10], factoren: { opmaak: 12 } });
  assert.strictEqual(t, 120);
});
