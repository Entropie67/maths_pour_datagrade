# Vue mobile

Sur téléphone, la page d'accueil (`v=` vide) n'affiche pas le menu latéral de la
vue bureau mais une vue dédiée : navigation par tuiles, menu général plein écran
et menu par exercice plein écran.

## Activation

[`Start.svelte`](../../../../src/components/setup/start/Start.svelte) calcule
`isMobileViewUsed = !isMd && !$globalOptions.recorder`, où `isMd` compare
`innerWidth` à `SM_BREAKPOINT` (640 px, défini dans
[`components/keyboard/lib/sizes.ts`](../../../../src/components/keyboard/lib/sizes.ts)).

- `isMobileViewUsed` vrai : `Start.svelte` n'affiche que
  [`MobileView.svelte`](../../../../src/components/setup/mobile/MobileView.svelte)
  (ni `Header`, ni `SideMenu`).
- `isMobileViewUsed` faux : la vue bureau et l'ancien repli smartphone sont
  inchangés. Les intégrations (`recorder=capytale`, `moodle`…) restent sur ce
  chemin car elles dépendent de `NavBarRecorder`.

L'item « Afficher comme sur un ordinateur » du menu général force
`forceDesktopView = true` dans `Start.svelte` (via la prop `useDesktopView`
transmise à `MobileView` puis à `MobileGlobalMenu`), ce qui bascule
`isMobileViewUsed` à faux tant que la page n'est pas rechargée — aucune
persistance, aucun changement de largeur réelle de la fenêtre.

Le conteneur `#startComponent` passe de `h-screen` à `min-h-screen` en vue
mobile : le contenu de la page défile alors dans le flux normal, sans laisser
apparaître le fond de `<html>` sous les exercices longs.

## Rubriques affichées : `src/json/mobileMenu.json`

La vue mobile ne parcourt pas les référentiels entiers. Les rubriques proposées
sont décrites dans
[`src/json/mobileMenu.json`](../../../../src/json/mobileMenu.json) :

```jsonc
{
  "sections": [
    {
      "id": "college",              // identifiant utilisé dans le chemin de navigation
      "title": "Collège",           // libellé de la grosse tuile
      "subtitle": "6e · 5e · …",    // optionnel
      "icon": "bx-backpack",        // classe boxicons, optionnelle
      "views": ["mobile", "typst"], // optionnel : vues affichant la rubrique (toutes par défaut)
      "entries": [
        {
          "id": "6e",               // identifiant unique dans la rubrique
          "title": "6e",            // libellé de la tuile
          "referentiel": "aleatoires", // nom du référentiel du menu
          "path": ["6e"],           // chemin des clés menant au nœud
          "externalLinks": [        // optionnel : liens externes du niveau
            {
              "title": "Cahiers d'automatismes",
              "url": "https://coopmaths.fr/www/automatismes/2nde/",
              "icon": "bx-book"     // optionnel, classe boxicons
            }
          ]
        }
      ]
    }
  ]
}
```

- `referentiel` correspond au champ `name` des référentiels renvoyés par
  `getReferentiels()`
  ([`referentielsStore.ts`](../../../../src/lib/stores/referentielsStore.ts)) :
  `aleatoires`, `examens`, `partenaires`, `geometrieDynamique`, `outils`,
  `ressources`, `statiques`.
- `path` est le chemin des clés brutes du référentiel (`["BrevetTags"]`,
  `["40_Épreuves de Première - Par thème"]`, …). Une entrée dont le chemin ne se
  résout pas n'affiche simplement aucun contenu : c'est pour cette raison que
  les rubriques françaises (`college`, `lycee`, `lyceePro`, `can`) et suisses
  (`primaire`, `ecoleObligatoire`, `secondaireII`) sont déclarées séparément
  avec des chemins propres à chaque référentiel, plutôt que partagées.
- `locales` (optionnel) restreint une rubrique ou une entrée aux locales
  listées (mêmes valeurs que `Language`, ex. `["fr-CH"]`) ; sans ce champ, la
  rubrique/entrée est proposée quelle que soit la locale du référentiel
  affiché (`referentielLocale`). `mobileMenuSectionsForLocale(lang)` et
  `typstMenuSectionsForLocale(lang)`
  ([`lib/components/mobileMenu.ts`](../../../../src/lib/components/mobileMenu.ts))
  filtrent à la fois les rubriques et leurs entrées, puis retirent les
  rubriques devenues vides.
- `externalLinks` (optionnel) liste des liens ouverts dans un nouvel onglet,
  affichés en tuiles au-dessus des thèmes lorsqu'on est directement sur l'écran
  du niveau (`path` de longueur 2, ex. `["lycee", "2e"]`). Utilisé par exemple
  pour pointer vers le Cahier d'automatismes de 2nde et de 1re. Rendu par
  [`MobileBrowser.svelte`](../../../../src/components/setup/mobile/MobileBrowser.svelte)
  via [`MobileTile.svelte`](../../../../src/components/setup/mobile/MobileTile.svelte)
  (prop `href`, qui bascule la tuile d'un `<button>` de navigation vers un
  `<a target="_blank">`).

- `views` (optionnel) restreint la rubrique à certaines vues. Ce fichier sert
  aussi à la modale « Ajouter un exercice » de la
  [vue Typst](../exports/typst.md#ajouter-un-exercice-depuis-laperçu) : les
  rubriques sans `views` sont proposées partout, `"views": ["typst"]` réserve
  une rubrique à cette modale (c'est le cas de « Ressources complémentaires »,
  absente du téléphone ; « Course aux nombres » a `"views": ["typst",
  "mobile"]` et est donc proposée aux deux).
  [`lib/components/mobileMenu.ts`](../../../../src/lib/components/mobileMenu.ts)
  en tire `mobileMenuSectionsForLocale()` et `typstMenuSectionsForLocale()`.

Ajouter un niveau au menu mobile ne demande donc **que** l'ajout d'une entrée
dans ce fichier.

## Navigation

[`MobileBrowser.svelte`](../../../../src/components/setup/mobile/MobileBrowser.svelte)
affiche l'état courant à partir du tableau `path` détenu par `MobileView` :

| `path`              | Écran                                                                          |
| ------------------- | ------------------------------------------------------------------------------- |
| `[]`                | `MobileCarouselCards`, les grosses tuiles de rubriques puis `MobileSearch`     |
| `["college"]`       | tuiles des niveaux de la rubrique                                              |
| `["college", "6e"]` | thèmes du nœud pointé par l'entrée                                             |
| plus long           | sous-thèmes puis liste d'exercices                                            |

Les helpers de découpage et de libellé sont dans
[`lib/components/mobileMenu.ts`](../../../../src/lib/components/mobileMenu.ts) :
`resolveNode()` descend dans un référentiel, `splitChildren()` sépare
sous-catégories et terminaisons (et trie les annales par année décroissante),
`nodeLabel()` / `endingLabel()` produisent les libellés (KaTeX compris).
`nodeLabel()` cherche l'intitulé d'un thème dans `levelsThemesList.json` puis
dans `levelsThemesListCH.json` (les codes des deux référentiels ne se
recouvrent pas) ; pour un thème suisse, `nodeCode()` renvoie son code
(`9NO1`, `1mF2`…), affiché en sous-titre de la tuile comme dans le menu de la
vue bureau. Un thème suisse sans entrée dans `levelsThemesListCH.json`
s'affiche par son seul code : y ajouter l'intitulé.

Une rubrique qui ne propose qu'un niveau (Primaire) n'a pas d'écran à une
seule tuile : `sectionPath()` ouvre directement ce niveau depuis l'accueil et
`parentPath()` y revient directement au retour.

Les lignes d'exercice (navigation par thèmes et résultats de recherche) partagent
le composant
[`MobileEndingItem.svelte`](../../../../src/components/setup/mobile/MobileEndingItem.svelte).

### Recherche sur la page d'accueil

[`MobileSearch.svelte`](../../../../src/components/setup/mobile/MobileSearch.svelte)
affiche un champ de recherche texte sous les tuiles de rubriques (`path.length
=== 0`). Il recherche par thème/identifiant sur l'ensemble des référentiels
cherchables (mêmes critères que `SearchInput.svelte` de la vue bureau, via
`stringToCriterion()`), mais sans les filtres avancés (niveaux, spécificités,
types) de la vue bureau. L'ensemble des ressources cherchables est construit
par `buildResourcesSet()`
([`lib/stores/referentielsStore.ts`](../../../../src/lib/stores/referentielsStore.ts)),
partagé avec `SideMenu.svelte` de la vue bureau. Toucher un résultat ajoute
l'exercice et bascule sur l'affichage des exercices, comme un exercice choisi
par tuiles.

Un clic sur un exercice l'ajoute à `exercicesParams` et bascule sur l'affichage
des exercices ; la flèche de retour ramène à la catégorie parente. Quand la
sélection se vide, la vue revient automatiquement au choix des exercices.

Au chargement, une URL qui contient déjà des exercices ouvre directement leur
affichage ; le choix des rubriques n'est proposé que si la sélection est vide.
`MobileView` teste `exercicesParams` à l'initialisation puis à nouveau après un
`tick()` dans `onMount`, car `App.svelte` peut ne lire l'URL qu'après le montage.

## Menus plein écran

`MobileView` place `setContext('mobileView', true)`. Les composants d'exercice
lisent ce contexte pour adapter leur rendu, sans que la vue bureau soit touchée :

| Composant                    | Adaptation en vue mobile                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `HeaderExerciceVueProf`      | barre de titre compacte : titre + une seule icône ouvrant un menu plein écran (nouvelles données, paramétrer, interactivité, supprimer) |
| `ExerciceMathaleaVueProf`    | volet `Settings` replié par défaut ; boutons « Afficher/Masquer la correction » et « Nouvelles données » sous l'exercice |
| `ExerciceStatic`             | bouton « Ouvrir l'énoncé en plein écran » (nouvel onglet, pour zoomer) sous chaque image ; bouton de correction sous l'exercice |

Pour un exercice MathALÉA non interactif, le bouton de correction est affiché
dès qu'une correction existe. Il n'est pas affiché en mode interactif, où la
correction apparaît lors de la vérification. La génération des questions
modifie l'exercice en place : le composant signale cette modification à Svelte
après génération et lors d'une mise à jour asynchrone pour actualiser le bouton.

Le menu général
([`MobileGlobalMenu.svelte`](../../../../src/components/setup/mobile/MobileGlobalMenu.svelte))
recouvre les exercices et propose : nouvelles données pour tous, interactivité
globale, réordonnancement (`ChipsList`), impression (vue `typst`), lien élève
(vue `confeleve`), tout effacer, bascule du thème clair/sombre et « Afficher
comme sur un ordinateur » (voir ci-dessus).

## Vue Typst sur téléphone

[`Typst.svelte`](../../../../src/components/setup/typst/Typst.svelte) calcule un
`isMobile` (même seuil `SM_BREAKPOINT`) et, dans ce cas :

- masque le sélecteur *Code / Côte à côte / Aperçu* et force le mode `preview`
  (le mode mémorisé en `localStorage` est ignoré) ;
- replie le volet *Réglages* et la palette *Mise en page* par défaut ;
- masque le choix de la langue du référentiel via la propriété `showLanguage`
  de [`NavBar.svelte`](../../../../src/components/shared/header/NavBar.svelte).
