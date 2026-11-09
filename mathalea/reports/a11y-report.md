# Rapport d'accessibilité automatique

> **Ce rapport mesure, il ne certifie pas : il ne donne aucun taux de conformité RGAA et ne permet pas d'en déduire un.** axe-core ne détecte qu'une partie des défauts : il ne dit rien de la pertinence d'un texte ni du vécu avec un lecteur d'écran. « 0 défaut » signifie seulement qu'axe-core n'en a pas trouvé.

## Résumé

- **Passage** : 2026-11-07 15:14 UTC, commit 999bfaa7b4+modifs, environnement local, axe-core 4.14.0.
- **Vues mesurées** : 20 sur 20.
- **⚠️ Mesurées sans leur contenu principal** : i-have-who-has (aperçu Typst non compilé : /main.typ:153:42: error: unknown variable: txt).
- **Défauts WCAG** : 244 éléments, 7 règles.
- **Bonnes pratiques** : 37 éléments, 5 règles.
- **À vérifier à la main** (axe n'a pas su trancher) : 235 éléments.
- **Vues les plus touchées** : accueil-exercice (32), accueil-exercice-interactif (32), accueil (22).
- **Évolution** : aucun passage précédent, rien à comparer.

## Défauts WCAG par règle

| Règle | Ce qui est demandé | Impact | Éléments | Vues |
| --- | --- | --- | ---: | ---: |
| [`color-contrast`](https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI&lang=fr) | Les éléments doivent avoir un contraste de couleurs suffisant | sérieux | 199 | 19 |
| [`meta-viewport`](https://dequeuniversity.com/rules/axe/4.14/meta-viewport?application=axeAPI&lang=fr) | Le zoom et l’agrandissement ne doivent pas être désactivés | modéré | 20 | 20 |
| [`listitem`](https://dequeuniversity.com/rules/axe/4.14/listitem?application=axeAPI&lang=fr) | Les éléments <li> doivent être contenus dans un élément <ul> ou <ol> | sérieux | 16 | 4 |
| [`list`](https://dequeuniversity.com/rules/axe/4.14/list?application=axeAPI&lang=fr) | <ul> et <ol> ne doivent contenir directement que des éléments <li>, <script> ou <template> | sérieux | 4 | 4 |
| [`label`](https://dequeuniversity.com/rules/axe/4.14/label?application=axeAPI&lang=fr) | Chaque élément de formulaire doit avoir une étiquette | critique | 3 | 2 |
| [`aria-required-children`](https://dequeuniversity.com/rules/axe/4.14/aria-required-children?application=axeAPI&lang=fr) | Certains rôles ARIA doivent comporter des descendants directs spécifiques | critique | 1 | 1 |
| [`scrollable-region-focusable`](https://dequeuniversity.com/rules/axe/4.14/scrollable-region-focusable?application=axeAPI&lang=fr) | Vérifier que les régions défilantes sont accessibles au clavier | sérieux | 1 | 1 |

## Bonnes pratiques par règle

Ces règles d'axe-core ne correspondent à aucun critère WCAG.

| Règle | Ce qui est demandé | Impact | Éléments | Vues |
| --- | --- | --- | ---: | ---: |
| [`page-has-heading-one`](https://dequeuniversity.com/rules/axe/4.14/page-has-heading-one?application=axeAPI&lang=fr) | La page doit contenir un titre de niveau 1 | modéré | 13 | 13 |
| [`region`](https://dequeuniversity.com/rules/axe/4.14/region?application=axeAPI&lang=fr) | Le contenu doit être localisé dans une région | modéré | 13 | 5 |
| [`heading-order`](https://dequeuniversity.com/rules/axe/4.14/heading-order?application=axeAPI&lang=fr) | Les niveaux de titre doivent s’incrémenter d’un seul niveau à la fois | modéré | 4 | 3 |
| [`landmark-unique`](https://dequeuniversity.com/rules/axe/4.14/landmark-unique?application=axeAPI&lang=fr) | Vérifier que chaque landmark est unique | modéré | 4 | 4 |
| [`landmark-one-main`](https://dequeuniversity.com/rules/axe/4.14/landmark-one-main?application=axeAPI&lang=fr) | La page doit contenir une région main | modéré | 3 | 3 |

## Défauts par vue

| Vue | État | WCAG | Bonnes pratiques | À vérifier | Remarques |
| --- | --- | ---: | ---: | ---: | --- |
| accueil | mesurée | 20 | 2 | 1 | vitrine de coopmaths.fr exclue de la mesure |
| accueil-exercice | mesurée | 30 | 2 | 18 |  |
| accueil-exercice-interactif | mesurée | 30 | 2 | 24 | 4 champ(s) math-field : nom et focus à contrôler à la main |
| eleve | mesurée | 9 | 8 | 39 | 4 champ(s) math-field : nom et focus à contrôler à la main |
| can | mesurée | 2 | 3 | 0 | 1 animation(s) sans fin en cours : un contraste peut varier d'un passage à l'autre |
| diaporama | mesurée | 2 | 3 | 0 | 1 animation(s) sans fin en cours : un contraste peut varier d'un passage à l'autre |
| latex | mesurée | 19 | 2 | 5 |  |
| typst | mesurée | 17 | 1 | 24 |  |
| amc | mesurée | 6 | 0 | 8 |  |
| moodle | mesurée | 11 | 0 | 1 |  |
| anki | mesurée | 7 | 0 | 0 |  |
| alacarte | mesurée | 9 | 1 | 1 |  |
| confeleve | mesurée | 19 | 1 | 1 |  |
| flashcards | mesurée | 14 | 1 | 59 |  |
| i-have-who-has | ⚠️ sans son contenu | 12 | 1 | 5 | aperçu Typst non compilé : /main.typ:153:42: error: unknown variable: txt ; 1 animation(s) sans fin en cours : un contraste peut varier d'un passage à l'autre |
| slides | mesurée | 13 | 1 | 11 |  |
| tbi | mesurée | 7 | 1 | 28 |  |
| parcours | mesurée | 6 | 3 | 1 |  |
| mes-sauvegardes | mesurée | 8 | 3 | 8 |  |
| tools | mesurée | 3 | 2 | 1 | 1 animation(s) sans fin en cours : un contraste peut varier d'un passage à l'autre |

## Détail par vue

### accueil

Adresse : `(racine)`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 19 | `.tracking-normal` |
| `landmark-unique` | Bonne pratique | 1 | `.md\:h-\[120px\]` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |

### accueil-exercice

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=&z=1`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 24 | `.tracking-normal` |
| `heading-order` | Bonne pratique | 1 | `.gap-x-2.flex-row.items-center > h3` |
| `landmark-unique` | Bonne pratique | 1 | `.md\:h-\[120px\]` |
| `list` | WCAG | 1 | `.numbered-list` |
| `listitem` | WCAG | 4 | `#exercice0Q0` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |

### accueil-exercice-interactif

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&i=1`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 24 | `.tracking-normal` |
| `heading-order` | Bonne pratique | 1 | `.gap-x-2.flex-row.items-center > h3` |
| `landmark-unique` | Bonne pratique | 1 | `.md\:h-\[120px\]` |
| `list` | WCAG | 1 | `.numbered-list` |
| `listitem` | WCAG | 4 | `#exercice0Q0` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |

### eleve

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&i=1&v=eleve&es=0111001`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 3 | `.flex:nth-child(1) > .py-\[2px\].text-\[0\.7rem\].hover\:bg-coopmaths-action` |
| `landmark-one-main` | Bonne pratique | 1 | `html` |
| `list` | WCAG | 1 | `ul` |
| `listitem` | WCAG | 4 | `#exercice0Q0` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `region` | Bonne pratique | 7 | `.font-light.ml-2` |

### can

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&i=1&v=can`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 1 | `.py-3` |
| `landmark-one-main` | Bonne pratique | 1 | `html` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |
| `region` | Bonne pratique | 1 | `.font-black` |

### diaporama

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=diaporama`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 1 | `.flex-row-reverse` |
| `landmark-one-main` | Bonne pratique | 1 | `html` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |
| `region` | Bonne pratique | 1 | `.font-black` |

### latex

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=latex`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 16 | `.tracking-normal` |
| `heading-order` | Bonne pratique | 2 | `.py-4 > h5` |
| `label` | WCAG | 2 | `#export-latex-taille-input` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |

### typst

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=typst`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 16 | `.tracking-normal` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |

### amc

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=amc`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 5 | `#settings-nb-questions-0` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |

### moodle

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=moodle`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 9 | `.tracking-normal` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `scrollable-region-focusable` | WCAG | 1 | `#tabs-gift > .px-6.text-coopmaths-corpus-light.dark\:text-coopmathsdark-corpus-light > .py-0 > pre` |

### anki

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=anki`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 6 | `.tracking-normal` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |

### alacarte

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=alacarte`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 8 | `.tracking-normal` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |

### confeleve

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=confeleve`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 17 | `.tracking-normal` |
| `label` | WCAG | 1 | `#config-eleve-titre-input` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |

### flashcards

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=flashcards`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 13 | `.tracking-normal` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |

### i-have-who-has

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=i-have-who-has`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 11 | `.tracking-normal` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |

### slides

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=slides`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 12 | `.tracking-normal` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |

### tbi

Adresse : `?uuid=a4d87&id=6M2B-1&alea=rgaa&v=tbi`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `aria-required-children` | WCAG | 1 | `div[role="tablist"]` |
| `list` | WCAG | 1 | `ul` |
| `listitem` | WCAG | 4 | `#exercice0Q0` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |

### parcours

Adresse : `?v=parcours`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 5 | `.tracking-normal` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |
| `region` | Bonne pratique | 2 | `.gap-1` |

### mes-sauvegardes

Adresse : `?v=mes-sauvegardes`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 7 | `.tracking-normal` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |
| `region` | Bonne pratique | 2 | `.px-3` |

### tools

Adresse : `?v=tools`

| Règle | Catégorie | Éléments | Premier exemple |
| --- | --- | ---: | --- |
| `color-contrast` | WCAG | 2 | `.tracking-normal` |
| `landmark-unique` | Bonne pratique | 1 | `.p-4` |
| `meta-viewport` | WCAG | 1 | `meta[name="viewport"]` |
| `page-has-heading-one` | Bonne pratique | 1 | `html` |

## Conditions de mesure

- Serveur : `http://localhost:5186/alea/`.
- Navigateur : Chromium 156.0.8078.4, fenêtre 1280×800, thème clair, contexte neuf pour chaque vue.
- Graine : `rgaa`. Règles axe-core : `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`.
- Zones exclues : `.vitrine-alea` (la vitrine de coopmaths.fr, sur l'accueil).
- Les animations ne sont pas figées : sur une vue signalée, un écart d'un passage à l'autre sur `color-contrast` peut venir de l'instant de la mesure.
- Chaque vue est mesurée dans son état initial : ni les questions de la course aux nombres ou du diaporama après « Démarrer », ni les menus et fenêtres qu'il faut ouvrir.

Voir [la documentation du rapport](../documentation/tests/rapport-accessibilite.md).
