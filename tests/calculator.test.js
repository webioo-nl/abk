// De calculator op een nagebootste pagina testen: npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const pagina = require('./pagina.js');

const src = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');

function laad({ opties = {}, url = 'https://www.adverterenbovenkassas.tv/landelijk-adverteren', locatie = false } = {}) {
  const fouten = [];
  const vc = new VirtualConsole().on('jsdomError', e => fouten.push(e.message));
  const html = `<!DOCTYPE html><html><body>${pagina({ locatie })}
    <script>${src('tarief.js')}</script>
    <script>${src('calculator.js')}</script>
    <script>ABK.initCalculator(${JSON.stringify(opties)});</script></body></html>`;
  const dom = new JSDOM(html, {
    url, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.__alerts = []; w.alert = m => w.__alerts.push(m); },
  });
  return new Promise(res => dom.window.document.addEventListener('DOMContentLoaded', () =>
    setTimeout(() => res({ w: dom.window, d: dom.window.document, fouten }), 0)));
}

const g = (d, id) => d.getElementById(id);
const change = (w, el) => el.dispatchEvent(new w.Event('change', { bubbles: true }));
function vink(w, el, v) { el.checked = v; change(w, el); }
function kies(w, d, id) { const el = g(d, id); el.checked = true; change(w, el); }

test('laadt zonder fouten en toont stap 1', async () => {
  const { d, fouten } = await laad({ opties: { minimaalEenWinkel: true } });
  assert.deepStrictEqual(fouten, []);
  assert.strictEqual(g(d, 'stepIndicator').textContent, 'Stap 1 van 7');
  assert.strictEqual(g(d, 'bedrag').textContent, '0');
});

test('winkel kiezen geeft tarief, ook in het verborgen veld', async () => {
  const { w, d } = await laad();
  vink(w, d.querySelectorAll('.winkel')[0], true);
  assert.strictEqual(g(d, 'bedrag').textContent, '56,26');
  assert.strictEqual(g(d, 'tarief').value, '56,26');
  assert.strictEqual(g(d, 'winkelData').value, '&bull; AH Heemstede Binnenweg');
});

test('keuzes in de stappen tellen mee', async () => {
  const { w, d } = await laad();
  vink(w, d.querySelectorAll('.winkel')[0], true);
  kies(w, d, 'jaar');
  assert.strictEqual(g(d, 'perMonth').textContent, 'p.j.');
  assert.strictEqual(g(d, 'bedrag').textContent, '625,10'); // ((12,5×2,48×1,21)+25)×10
  assert.strictEqual(g(d, 'samenvatting-betaalmethode').textContent, 'Jaarfactuur');
});

test('regiofilter verbergt winkels en rekent opnieuw', async () => {
  const { w, d } = await laad();
  vink(w, d.querySelectorAll('.winkel')[0], true); // Noord-Holland
  vink(w, d.querySelector('[data-filter="Zuid-Holland"]'), true);
  assert.strictEqual(g(d, 'bedrag').textContent, '0');
  assert.strictEqual(g(d, 'winkelData').value, '');
});

test('regio uit de URL wordt vooraf aangevinkt (hoofdletters maken niet uit)', async () => {
  const { d } = await laad({ url: 'https://www.adverterenbovenkassas.tv/landelijk-adverteren?Regio=zuid-holland' });
  assert.strictEqual(d.querySelector('[data-filter="Zuid-Holland"]').checked, true);
  assert.strictEqual(d.querySelectorAll('[data-locatie="Noord-Holland"]')[0].style.display, 'none');
});

test('standaardRegio (CMS) werkt als er geen regio in de URL staat', async () => {
  const { d } = await laad({ locatie: true, opties: { standaardRegio: 'Utrecht' }, url: 'https://www.adverterenbovenkassas.tv/locatie/x' });
  assert.strictEqual(d.querySelector('[data-filter="Utrecht"]').checked, true);
});

test('regio in de URL gaat voor op standaardRegio', async () => {
  const { d } = await laad({ locatie: true, opties: { standaardRegio: 'Utrecht' }, url: 'https://www.adverterenbovenkassas.tv/locatie/x?regio=Zuid-Holland' });
  assert.strictEqual(d.querySelector('[data-filter="Zuid-Holland"]').checked, true);
  assert.strictEqual(d.querySelector('[data-filter="Utrecht"]').checked, false);
});

test('minimaalEenWinkel: laatste winkel blijft aangevinkt met melding', async () => {
  const { w, d } = await laad({ opties: { minimaalEenWinkel: true } });
  const c = d.querySelectorAll('.winkel')[0];
  vink(w, c, true); vink(w, c, false);
  assert.strictEqual(c.checked, true);
  assert.strictEqual(w.__alerts.length, 1);
});

test('zonder minimaalEenWinkel mag alles uit', async () => {
  const { w, d } = await laad({ locatie: true });
  vink(w, d.querySelectorAll('.winkel')[0], false);
  assert.strictEqual(w.__alerts.length, 0);
  assert.strictEqual(g(d, 'bedrag').textContent, '0');
});

test('winkels die Finsweet later toevoegt werken ook', async () => {
  const { w, d } = await laad();
  const lijst = d.querySelector('[fs-list-element="list"]');
  const item = d.createElement('div');
  item.dataset.locatie = 'Noord-Holland';
  item.innerHTML = '<input type="checkbox" class="winkel" data-opslag="10" data-name="AH Later" data-shortname="Later">';
  lijst.appendChild(item);
  await new Promise(r => setTimeout(r, 0)); // observer
  vink(w, item.querySelector('.winkel'), true);
  assert.strictEqual(g(d, 'winkelData').value, '&bull; AH Later');
});

test('stappen: volgende, vorige en balk', async () => {
  const { d } = await laad();
  d.querySelector('.volgende-btn').click();
  assert.strictEqual(g(d, 'stepIndicator').textContent, 'Stap 2 van 7');
  d.querySelectorAll('.form-step')[6].click();
  assert.strictEqual(d.querySelector('.volgende-btn').style.display, 'none');
  d.querySelector('.vorige-btn').click();
  assert.strictEqual(g(d, 'stepIndicator').textContent, 'Stap 6 van 7');
});

test('functies blijven globaal beschikbaar', async () => {
  const { w } = await laad();
  for (const f of ['updateFilters', 'updateEindsom', 'updateWinkelData', 'updateSamenvatting', 'toonStap']) {
    assert.strictEqual(typeof w[f], 'function', f);
  }
});
