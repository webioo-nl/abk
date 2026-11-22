# Changelog

Per versie: wat er veranderd is, op welke pagina's, wanneer live, en de hashes.

<!--
## vX.Y.Z – JJJJ-MM-DD

**Wat:**
- …

**Pagina's:** /landelijk-adverteren, Locaties Template

**Live sinds:** JJJJ-MM-DD

**Hashes:**
- tarief.js: sha384-…
- calculator.js: sha384-…
-->

## v1.0.0 – nog niet live

**Wat:**
- De twee calculators (Landelijk Adverteren en Locaties Template) samengevoegd tot `tarief.js` en `calculator.js`, met instellingen per pagina via `ABK.initCalculator`.
- Uitkomst gelijk aan de oude code, met drie bewuste verbeteringen:
  - Locaties Template: na het aan- of uitzetten van een regiofilter wordt het tarief opnieuw berekend (stond eerder op de oude waarde).
  - Locaties Template: regiofilter vergelijkt zonder op hoofdletters te letten, net als Landelijk.
  - Landelijk: winkels die Finsweet later in de lijst zet, tellen nu ook mee bij aanvinken.
- `console.log` bij het versturen van het formulier verwijderd.

**Pagina's:** /landelijk-adverteren, Locaties Template

**Live sinds:** –

**Hashes:** –
