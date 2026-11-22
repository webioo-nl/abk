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

```html
<script src="https://cdn.jsdelivr.net/gh/webioo-nl/abk@vX.Y.Z/src/tarief.js" integrity="sha384-…" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/gh/webioo-nl/abk@vX.Y.Z/src/calculator.js" integrity="sha384-…" crossorigin="anonymous"></script>
<script>ABK.initCalculator({ regioUitUrl: true, minimaalEenWinkel: true, finsweetLijst: false });</script>
```

| Pagina | Instellingen |
|---|---|
| /landelijk-adverteren | nog in te vullen |
| Locaties Template (/locatie/…) | nog in te vullen |

Hash ophalen (Terminal):

```bash
echo "sha384-$(curl -s <link> | openssl dgst -sha384 -binary | openssl base64 -A)"
```

## Afspraak met Webflow

Het script verwacht deze elementen op de pagina. Hernoem of verwijder ze niet zonder de code aan te passen.

| Element | ID / name / attribuut | Gebruikt voor |
|---|---|---|
| _nog in te vullen bij de eerste versie_ | | |

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
node tests/tarief.test.js
node tests/calculator.test.js
```

Daarna op de webflow.io-versie testen voordat er live gepubliceerd wordt.
