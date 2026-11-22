// Testpagina met alle elementen die calculator.js verwacht (zie README, Afspraak met Webflow).
module.exports = function pagina({ locatie = false } = {}) {
  const winkels = [
    ['Noord-Holland', 'AH Heemstede Binnenweg', 'Heemstede', '12.5', locatie],
    ['Noord-Holland', 'AH Haarlem Centrum', 'Haarlem', '20', false],
    ['Zuid-Holland', 'AH Leiden Station', 'Leiden', '17.25', false],
    ['Utrecht', 'AH Utrecht CS', 'Utrecht', '30', false],
  ];
  const radio = (name, opts) => opts.map(([id, val, dv, checked]) =>
    `<label><input type="radio" name="${name}" id="${id}" value="${val}" data-value="${dv}" ${checked ? 'checked' : ''}>${val}</label>`).join('');
  return `
<form id="calc-form">
  <div id="stepIndicator"></div>
  <div class="form-steps">${[1,2,3,4,5,6,7].map(n => `<div class="form-step" data-step="${n}">${n}</div>`).join('')}</div>
  <div class="form-step-line">${[1,2,3,4,5,6].map(() => `<div class="form-step-progress"></div>`).join('')}</div>
  <div id="startbedrag" data-value="25"></div>
  <div class="stap" id="stap1">
    <div class="filter-checkbox"><input type="checkbox" data-filter="Noord-Holland"></div>
    <div class="filter-checkbox"><input type="checkbox" data-filter="Zuid-Holland"></div>
    <div class="filter-checkbox"><input type="checkbox" data-filter="Utrecht"></div>
    <a filter-element="clear" href="#">Wis</a>
    <button type="button" id="toggleWinkels">Selecteer alle winkels</button>
    <div id="winkeltip" style="display:none">tip</div>
    <div fs-list-element="list">
      ${winkels.map(([r, n, s, o, c]) => `<div data-locatie="${r}"><input type="checkbox" class="winkel" data-opslag="${o}" data-name="${n}" data-shortname="${s}" ${c ? 'checked' : ''}></div>`).join('')}
    </div>
  </div>
  <div class="stap" id="stap2">${radio('frequentie', [['f10','10x per uur','1.23'],['f20','20x per uur','2.48',1],['f30','30x per uur','3.65']])}</div>
  <div class="stap" id="stap3">${radio('contractperiode', [['week','Week','0.55'],['30d','30 dagen','1.375'],['doorl','Doorlopend maand-abonnement','1.21',1],['12m','12 maanden','1.1']])}</div>
  <div class="stap" id="stap4">${radio('lengte', [['s10','10 seconden','1',1],['s15','15 seconden','1.5']])}</div>
  <div class="stap" id="stap5">${radio('betaalmethode', [['fact','Factuur','1'],['inc','Automatische incasso','0.9',1],['jaar','Jaarfactuur','10']])}</div>
  <div class="stap" id="stap6">${radio('opmaak', [['zelf','Zelf advertenties opmaken en uploaden','1'],['gratis','1x GRATIS advertentieopmaak','1',1],['4x','4x per jaar advertentie opmaken','4'],['12x','12x per jaar advertentie opmaken','12']])}</div>
  <div class="stap" id="stap7">
    <select id="startdatum"><option>Zo snel mogelijk</option><option>1</option><option>2</option><option>Datum A</option><option>Datum B</option></select>
    <div id="showDate" style="display:none"></div>
    <input id="voornaam"><input id="achternaam"><input id="e-mail"><input id="telefoonnummer"><input id="bedrijfswebsite"><div id="website-error"></div>
    <input type="hidden" id="tarief"><input type="hidden" id="winkelData">
  </div>
  <div><span id="bedrag"></span> <span id="perMonth"></span></div>
  <div id="samenvatting-locaties"></div><div id="samenvatting-frequentie"></div><div id="samenvatting-contractperiode"></div>
  <div id="samenvatting-lengte"></div><div id="samenvatting-betaalmethode"></div><div id="samenvatting-opmaak"></div>
  <button type="button" class="vorige-btn">Vorige</button><button type="button" class="volgende-btn">Volgende</button>
</form>`;
};
