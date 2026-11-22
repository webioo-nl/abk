/*
 * ABK – tariefcalculator op de pagina
 *
 * Eén script voor /landelijk-adverteren en de Locaties Template.
 * Verschillen per pagina staan in de aanroep van ABK.initCalculator(…) in Webflow.
 *
 * Laden (onderaan de pagina, zonder async/defer, in deze volgorde):
 *   1. tarief.js       rekenregel (ABK.berekenTarief)
 *   2. calculator.js   dit bestand
 *   3. een inline script met ABK.initCalculator({ … })
 *
 * Opties:
 *   minimaalEenWinkel  true = minstens één winkel moet aangevinkt blijven (melding)
 *   standaardRegio     regio die vooraf geselecteerd wordt als er geen ?regio= in de URL staat
 *                      (op de Locaties Template gevuld vanuit het CMS)
 *
 * Welke elementen dit script op de pagina verwacht, staat in de README.
 */
(function (root) {
  'use strict';

  var ABK = (root.ABK = root.ABK || {});

  ABK.initCalculator = function (opties) {
    opties = opties || {};
    var minimaalEenWinkel = !!opties.minimaalEenWinkel;
    var standaardRegio = opties.standaardRegio || '';

    var doc = root.document;
    var totaalStappen = 7;
    var huidigeStap = 1;
    var allesGeselecteerd = false;

    // ---------------------------------------------------------------
    // Hulpfuncties
    // ---------------------------------------------------------------

    // URL-parameter ophalen, ongeacht hoofdletters in de naam.
    function getUrlParam(param) {
      var params = new URLSearchParams(root.location.search);
      for (var [key, value] of params.entries()) {
        if (key.toLowerCase() === param.toLowerCase()) return value;
      }
      return null;
    }

    function byId(id) {
      return doc.getElementById(id);
    }

    function gekozen(name) {
      return doc.querySelector('input[name="' + name + '"]:checked');
    }

    // Aangevinkte winkels die niet weggefilterd zijn.
    function zichtbareGekozenWinkels() {
      return Array.from(doc.querySelectorAll('.winkel:checked')).filter(function (cb) {
        return !cb.closest('.w-condition-invisible');
      });
    }

    function opDomKlaar(fn) {
      if (doc.readyState === 'loading') {
        doc.addEventListener('DOMContentLoaded', fn);
      } else {
        fn();
      }
    }

    // ---------------------------------------------------------------
    // Regiofilter
    // ---------------------------------------------------------------

    // Toon alleen winkels uit de aangevinkte regio's en reken opnieuw.
    // Vergelijking zonder op hoofdletters te letten.
    function updateFilters() {
      var actieveFilters = Array.from(
        doc.querySelectorAll('input[type="checkbox"][data-filter]:checked')
      ).map(function (cb) {
        return cb.dataset.filter.toLowerCase();
      });

      doc.querySelectorAll('[data-locatie]').forEach(function (locatieEl) {
        var locatie = locatieEl.dataset.locatie.toLowerCase();
        if (actieveFilters.length === 0 || actieveFilters.includes(locatie)) {
          locatieEl.style.display = '';
          locatieEl.classList.remove('w-condition-invisible');
        } else {
          locatieEl.style.display = 'none';
          locatieEl.classList.add('w-condition-invisible');
        }
      });

      updateEindsom();
      updateWinkelData();
      updateSamenvatting();

      // Actieve filters markeren
      doc.querySelectorAll('.filter-checkbox').forEach(function (div) {
        var cb = div.querySelector('input[type="checkbox"][data-filter]');
        if (cb && cb.checked) {
          div.classList.add('filter-active');
        } else {
          div.classList.remove('filter-active');
        }
      });
    }

    // Regio uit ?regio= of uit de standaardregio vooraf aanvinken.
    function pasRegioToe() {
      var regio = getUrlParam('regio') || standaardRegio;
      if (regio) {
        var regioLower = regio.toLowerCase();
        doc.querySelectorAll('input[type="checkbox"][data-filter]').forEach(function (checkbox) {
          checkbox.checked = checkbox.dataset.filter.toLowerCase() === regioLower;
        });
      }
      updateFilters();
    }

    // ---------------------------------------------------------------
    // Stappen
    // ---------------------------------------------------------------

    function updateStepIndicator() {
      byId('stepIndicator').textContent = 'Stap ' + huidigeStap + ' van ' + totaalStappen;
    }

    function toonStap(stap) {
      doc.querySelectorAll('.stap').forEach(function (s) {
        s.classList.remove('actief');
      });
      var huidige = byId('stap' + stap);
      if (huidige) huidige.classList.add('actief');

      updateFormSteps(stap);
      updateEindsom();
      updateStepIndicator();

      var vorigeBtn = doc.querySelector('.vorige-btn');
      var volgendeBtn = doc.querySelector('.volgende-btn');
      if (vorigeBtn) vorigeBtn.style.display = stap === 1 ? 'none' : 'inline-flex';
      if (volgendeBtn) volgendeBtn.style.display = stap === totaalStappen ? 'none' : 'inline-flex';
    }

    function vorigeStap() {
      if (huidigeStap > 1) {
        huidigeStap--;
        toonStap(huidigeStap);
      }
    }

    function volgendeStap() {
      if (huidigeStap < totaalStappen) {
        huidigeStap++;
        toonStap(huidigeStap);
      }
    }

    function updateFormSteps(stap) {
      doc.querySelectorAll('.form-step').forEach(function (step, index) {
        if (index < stap - 1) {
          step.className = 'form-step complete';
        } else if (index === stap - 1) {
          step.className = 'form-step active';
        } else {
          step.className = 'form-step';
        }
      });

      doc.querySelectorAll('.form-step-line .form-step-progress').forEach(function (line, index) {
        if (index < stap - 1) {
          line.className = 'form-step-progress complete';
        } else if (index === stap - 1) {
          line.className = 'form-step-progress in-progress';
        } else {
          line.className = 'form-step-progress';
        }
      });
    }

    // ---------------------------------------------------------------
    // Tarief, winkels en samenvatting
    // ---------------------------------------------------------------

    // Factor van de gekozen optie in een stap (data-value), standaard 1.
    function factorVan(name) {
      return parseFloat(gekozen(name)?.dataset.value || 1);
    }

    function berekenEindsom() {
      var winkels = zichtbareGekozenWinkels();
      if (winkels.length === 0) return null;

      return ABK.berekenTarief({
        startbedrag: parseFloat(byId('startbedrag').dataset.value),
        opslagen: winkels.map(function (w) {
          return parseFloat(w.dataset.opslag);
        }),
        factoren: {
          frequentie: factorVan('frequentie'),
          contractperiode: factorVan('contractperiode'),
          lengte: factorVan('lengte'),
          betaalmethode: factorVan('betaalmethode'),
          opmaak: factorVan('opmaak')
        }
      });
    }

    function formatBedrag(bedrag) {
      return bedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function updateEindsom() {
      var bedrag = berekenEindsom();
      var contractType = gekozen('contractperiode');
      var betaalmethode = gekozen('betaalmethode');
      var perMonthDiv = byId('perMonth');

      if (perMonthDiv) {
        if (betaalmethode && betaalmethode.value.toLowerCase().includes('jaar')) {
          perMonthDiv.textContent = 'p.j.';
        } else if (contractType && contractType.value.toLowerCase().includes('week')) {
          perMonthDiv.textContent = 'p.w.';
        } else {
          perMonthDiv.textContent = 'p.m.';
        }
        updateSamenvatting();
      }

      byId('bedrag').textContent = bedrag !== null ? formatBedrag(bedrag) : '0';

      // Ook in het verborgen formulierveld, zodat het tarief meegaat met de aanvraag.
      var bedragInput = byId('tarief');
      if (bedragInput && bedrag !== null) {
        bedragInput.value = formatBedrag(bedrag);
      }
    }

    function updateWinkelData() {
      var data = zichtbareGekozenWinkels().map(function (cb) {
        return '&bull; ' + (cb.dataset.name || '');
      });
      byId('winkelData').value = data.join('<br /><br />');
    }

    function updateSamenvatting() {
      // Let op: '• ' + undefined geeft '• undefined'; 'Onbekend' wordt nooit getoond.
      // Bewust zo gelaten om de uitkomst gelijk te houden aan de oude code.
      var locaties = zichtbareGekozenWinkels()
        .map(function (cb) {
          return '• ' + cb.dataset.shortname || 'Onbekend';
        })
        .join('<br />');
      byId('samenvatting-locaties').innerHTML = locaties;

      var frequentie = gekozen('frequentie');
      var type = gekozen('contractperiode');
      var lengte = gekozen('lengte');
      var betaal = gekozen('betaalmethode');
      var opmaak = gekozen('opmaak');

      byId('samenvatting-frequentie').textContent = frequentie?.value || '';
      byId('samenvatting-contractperiode').textContent = type?.value || '';
      byId('samenvatting-lengte').textContent = lengte?.value || '';
      byId('samenvatting-betaalmethode').textContent = betaal?.value || '';
      byId('samenvatting-opmaak').textContent = opmaak?.value || '';
    }

    function checkWinkelAantal() {
      var extraTekst = byId('winkeltip');
      if (extraTekst) {
        extraTekst.style.display = doc.querySelectorAll('.winkel').length > 1 ? 'block' : 'none';
      }
    }

    // ---------------------------------------------------------------
    // Formuliervalidatie
    // ---------------------------------------------------------------

    function initValidatie() {
      function validateInput(input, testFn, errorElement, errorMessage) {
        input.addEventListener('input', function () {
          var value = input.value.trim();
          var isValid = testFn(value);
          input.classList.remove('valid', 'invalid');
          input.classList.add(isValid ? 'valid' : 'invalid');

          if (errorElement) {
            if (isValid || value === '') {
              errorElement.style.display = 'none';
            } else {
              errorElement.textContent = errorMessage;
              errorElement.style.display = 'block';
            }
          }
        });
      }

      validateInput(byId('voornaam'), function (val) { return val.length >= 2; });
      validateInput(byId('achternaam'), function (val) { return val.length >= 2; });
      validateInput(byId('e-mail'), function (val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); });
      validateInput(byId('telefoonnummer'), function (val) { return /^[0-9]{8,15}$/.test(val); });

      var urlRegex = /^(https?:\/\/)?(www\.)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;
      validateInput(
        byId('bedrijfswebsite'),
        function (val) { return urlRegex.test(val); },
        byId('website-error'),
        'Voer een geldige URL in.'
      );
    }

    // ---------------------------------------------------------------
    // Koppelen
    // ---------------------------------------------------------------

    // Regiofilters
    doc.querySelectorAll('.filter-checkbox input[type="checkbox"][data-filter]').forEach(function (cb) {
      cb.addEventListener('change', updateFilters);
    });

    var clearBtn = doc.querySelector('[filter-element="clear"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        doc.querySelectorAll('.filter-checkbox input[type="checkbox"][data-filter]').forEach(function (cb) {
          cb.checked = false;
        });
        updateFilters();
      });
    }

    updateFilters();

    // Klikken op een stap in de voortgangsbalk
    doc.querySelectorAll('.form-step').forEach(function (stepEl) {
      stepEl.addEventListener('click', function () {
        var targetStep = parseInt(stepEl.dataset.step, 10);
        if (!isNaN(targetStep) && targetStep >= 1 && targetStep <= totaalStappen) {
          huidigeStap = targetStep;
          toonStap(huidigeStap);
        }
      });
    });

    updateWinkelData();

    // Winkels aan- en uitvinken. Via het document, zodat ook winkels werken
    // die Finsweet pas later in de lijst zet.
    doc.addEventListener('change', function (e) {
      if (!e.target.classList || !e.target.classList.contains('winkel')) return;

      if (minimaalEenWinkel && doc.querySelectorAll('.winkel:checked').length === 0) {
        e.target.checked = true;
        root.alert('Er moet minstens één winkel geselecteerd zijn.');
      }
      updateEindsom();
      updateWinkelData();
    });

    // Keuzes in de stappen
    ['frequentie', 'contractperiode', 'lengte', 'betaalmethode', 'opmaak'].forEach(function (name) {
      doc.querySelectorAll('input[name="' + name + '"]').forEach(function (radio) {
        radio.addEventListener('change', updateEindsom);
      });
    });

    updateEindsom();

    // Alle winkels (de)selecteren
    byId('toggleWinkels').addEventListener('click', function () {
      allesGeselecteerd = !allesGeselecteerd;
      doc.querySelectorAll("input.winkel[type='checkbox']").forEach(function (cb) {
        if (!cb.closest('.w-condition-invisible')) cb.checked = allesGeselecteerd;
      });
      updateEindsom();
      updateWinkelData();
      this.textContent = allesGeselecteerd ? 'Deselecteer alle winkels' : 'Selecteer alle winkels';
    });

    // Eigen startdatum tonen bij de 4e en 5e optie
    byId('startdatum').addEventListener('change', function () {
      var showDateDiv = byId('showDate');
      showDateDiv.style.display = this.selectedIndex === 3 || this.selectedIndex === 4 ? 'block' : 'none';
    });

    // Opnieuw rekenen als Finsweet de lijst met winkels aanvult
    var lijst = doc.querySelector('[fs-list-element="list"]');
    if (lijst) {
      new root.MutationObserver(function () {
        updateFilters();
        updateEindsom();
        updateWinkelData();
        updateSamenvatting();
        checkWinkelAantal();
      }).observe(lijst, { childList: true, subtree: false });
    }

    opDomKlaar(function () {
      pasRegioToe();
      toonStap(huidigeStap);
      checkWinkelAantal();

      var vorigeBtn = doc.querySelector('.vorige-btn');
      var volgendeBtn = doc.querySelector('.volgende-btn');
      if (vorigeBtn) vorigeBtn.addEventListener('click', vorigeStap);
      if (volgendeBtn) volgendeBtn.addEventListener('click', volgendeStap);

      initValidatie();
    });

    // Functies ook globaal beschikbaar, voor eventuele losse code in Webflow
    // die ze nog aanroept.
    root.updateFilters = updateFilters;
    root.updateEindsom = updateEindsom;
    root.updateWinkelData = updateWinkelData;
    root.updateSamenvatting = updateSamenvatting;
    root.berekenEindsom = berekenEindsom;
    root.toonStap = toonStap;
    root.vorigeStap = vorigeStap;
    root.volgendeStap = volgendeStap;
    root.checkWinkelAantal = checkWinkelAantal;
    root.getUrlParam = getUrlParam;
  };
})(typeof window !== 'undefined' ? window : this);
