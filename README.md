# ABK – scripts voor adverterenbovenkassas.tv

Losse JavaScript-bestanden voor de Webflow-site van AdverterenBovenKassas.tv, geladen via jsDelivr.
Beheerd door Webioo Digital Agency.

## Structuur

```
abk/
├── README.md          dit bestand
├── CHANGELOG.md       per versie: wat veranderd, pagina's, live sinds, hashes
├── src/
│   ├── tarief.js      alleen de rekenregel (zonder pagina), ook bruikbaar voor de opmaaktool
│   ├── calculator.js  stappen, samenvatting en formulier op de pagina
│   └── funnel.js      koppeling met de opmaaktool (voorinvullen, verborgen velden)
└── tests/
    ├── tarief.test.js     vaste rekenvoorbeelden (node)
    └── calculator.test.js de hele flow in een nagebootste pagina
```

De prijzen blijven in Webflow: de opslag per winkel in het CMS, de factoren als `data-value` bij de keuzes.
In deze repo staat alleen de formule en het gedrag van de pagina.

## Laden in Webflow

Volgorde is belangrijk: eerst `tarief.js`, dan `calculator.js`, dan de instellingen per pagina.

In "Before </body> tag" van de pagina, zonder `async` of `defer`:

```html
<script src="https://cdn.jsdelivr.net/gh/webioo-nl/abk@vX.Y.Z/src/tarief.js" integrity="sha384-…" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/gh/webioo-nl/abk@vX.Y.Z/src/calculator.js" integrity="sha384-…" crossorigin="anonymous"></script>
<script>ABK.initCalculator({ minimaalEenWinkel: true });</script>
```

| Pagina | Aanroep |
|---|---|
| /landelijk-adverteren | `ABK.initCalculator({ minimaalEenWinkel: true });` |
| Locaties Template (/locatie/…) | `ABK.initCalculator({ minimaalEenWinkel: false, standaardRegio: '<CMS-veld regio>' });` |

Opties:

| Optie | Standaard | Wat |
|---|---|---|
| `minimaalEenWinkel` | `false` | Minstens één winkel moet aangevinkt blijven (met melding). |
| `standaardRegio` | `''` | Regio die vooraf wordt aangevinkt als er geen `?regio=` in de URL staat. Op de Locaties Template via "+ Add field" het CMS-veld van de regio invullen. Let op: een `'` in de regionaam breekt de aanroep. |

Een `?regio=…` in de URL vinkt altijd die regio aan (hoofdletters maken niet uit) en gaat voor op `standaardRegio`.

De oude calculatorcode in "Inside <head> tag" (getUrlParam, cmsRegio, updateFilters) en in "Before </body> tag" moet weg als deze scripts erin staan. Finsweet, de `og:url`-meta en de `<style>` blijven staan.

Hash ophalen (Terminal):

```bash
echo "sha384-$(curl -s <link> | openssl dgst -sha384 -binary | openssl base64 -A)"
```

## Afspraak met Webflow

Het script verwacht deze elementen op de pagina. Hernoem of verwijder ze niet zonder de code aan te passen.

| Element | ID / name / attribuut | Gebruikt voor |
|---|---|---|
| Startbedrag | `#startbedrag` met `data-value` | vast bedrag in de formule |
| Winkel | `input.winkel` met `data-opslag`, `data-name`, `data-shortname` | opslag, formulierveld, samenvatting |
| Winkel-wrapper | element met `data-locatie` (regionaam) rond elke winkel | regiofilter |
| Winkellijst | `[fs-list-element="list"]` (optioneel) | opnieuw rekenen als Finsweet winkels toevoegt |
| Regiofilter | `.filter-checkbox` met daarin `input[type=checkbox][data-filter]` | filter en markering |
| Filters wissen | `[filter-element="clear"]` (optioneel) | alle filters uit |
| Alle winkels | `#toggleWinkels` | (de)selecteren |
| Tip | `#winkeltip` (optioneel) | tonen bij meer dan één winkel |
| Keuzes | radio's met `name` = `frequentie`, `contractperiode`, `lengte`, `betaalmethode`, `opmaak`, elk met `data-value` (factor) en `value` (tekst) | formule en samenvatting; `value` met "jaar" of "week" bepaalt p.j./p.w. |
| Stappen | `.stap` met `id` `stap1` t/m `stap7` | stap tonen |
| Voortgang | `.form-step` met `data-step`, `.form-step-line .form-step-progress`, `#stepIndicator` | voortgangsbalk |
| Knoppen | `.vorige-btn`, `.volgende-btn` | navigeren |
| Tarief | `#bedrag`, `#perMonth` (optioneel) | weergave |
| Verborgen velden | `#tarief` (optioneel), `#winkelData` | gaan mee met de aanvraag |
| Samenvatting | `#samenvatting-locaties`, `#samenvatting-frequentie`, `-contractperiode`, `-lengte`, `-betaalmethode`, `-opmaak` | overzicht |
| Startdatum | `select#startdatum`, `#showDate` | eigen datum bij 4e/5e optie |
| Contactgegevens | `#voornaam`, `#achternaam`, `#e-mail`, `#telefoonnummer`, `#bedrijfswebsite`, `#website-error` | validatie |

## Versies

- Tags: `v1.0.0`, `v1.0.1`, …
  - laatste cijfer: fix
  - middelste cijfer: iets nieuws, Webflow hoeft niet te veranderen
  - eerste cijfer: de afspraak met Webflow verandert, Webflow moet mee aangepast worden
- Altijd een tag in de link, nooit `@main`.
- Een tag nooit opnieuw gebruiken voor andere code. Fout = nieuwe versie.
- Elke versie heeft een eigen hash.
- Per live versie een release met: wat veranderd, welke pagina's, live sinds, hashes (zie CHANGELOG.md).

## Bijdragen

- `main` is beveiligd: wijzigingen alleen via een pull request.
- Externe bijdragen via een fork en een pull request. Webioo keurt goed, zet de tag en publiceert.
- Geen geheimen in deze repo (API-tokens, wachtwoorden): alles wat in de browser draait is openbaar.
- Bestanden en mappen in kleine letters.

## Testen

```bash
npm install   # eenmalig, installeert jsdom voor de paginatests
npm test
```

Daarna op de webflow.io-versie testen voordat er live gepubliceerd wordt.
