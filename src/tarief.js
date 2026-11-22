/*
 * ABK – tariefberekening
 *
 * Alleen de rekenregel, zonder iets van de pagina. Daardoor bruikbaar op de
 * site (calculator.js) én in andere omgevingen, zoals de opmaaktool of tests.
 *
 * Formule (gelijk aan de calculator zoals die op de site stond):
 *
 *   ((som opslagen × frequentie × contractperiode × lengte × opmaak) + startbedrag) × betaalmethode
 *
 * De factoren en opslagen zelf staan niet hier maar in Webflow:
 * - startbedrag:  data-value op #startbedrag
 * - opslag:       data-opslag per winkel (CMS)
 * - factoren:     data-value op de keuzes per stap
 */
(function (root) {
  'use strict';

  /**
   * Bereken het tarief.
   *
   * @param {Object}   invoer
   * @param {number}   invoer.startbedrag  vast startbedrag (A)
   * @param {number[]} invoer.opslagen     opslag per gekozen winkel
   * @param {Object}   [invoer.factoren]   { frequentie, contractperiode, lengte, betaalmethode, opmaak }
   *                                       een ontbrekende factor telt als 1
   * @returns {number|null} tarief, of null als er geen winkel gekozen is
   */
  function berekenTarief(invoer) {
    var opslagen = invoer.opslagen || [];
    if (opslagen.length === 0) return null;

    // Optellen in dezelfde volgorde als de oorspronkelijke code (zelfde afronding).
    var totaleOpslag = 0;
    opslagen.forEach(function (opslag) {
      totaleOpslag += opslag;
    });

    var f = invoer.factoren || {};
    var C = factor(f.frequentie);
    var D = factor(f.contractperiode);
    var E = factor(f.lengte);
    var F = factor(f.betaalmethode);
    var G = factor(f.opmaak);
    var A = invoer.startbedrag;

    return ((totaleOpslag * C * D * E * G) + A) * F;
  }

  function factor(waarde) {
    return waarde === undefined || waarde === null ? 1 : waarde;
  }

  var ABK = (root.ABK = root.ABK || {});
  ABK.berekenTarief = berekenTarief;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { berekenTarief: berekenTarief };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
