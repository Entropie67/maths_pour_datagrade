# Questions de cours (banque et exercice natif)

« Questions de cours » existe sous deux formes dans MathALÉA :

| Forme                | Fichier                                              | uuid               | Rôle                                                                                                                                         |
| -------------------- | ---------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| App externe (iframe) | `src/exercices/apps/questions-de-cours.ts`           | `questionsDeCours` | Version historique, servie par coopmaths.fr. Conservée telle quelle pour ne pas casser les liens partagés ni les copies Capytale existantes. |
| Exercice natif       | `src/exercices/questionsDeCours/QuestionsDeCours.ts` | `afd39`            | Version intégrée : interactivité, corrections, barème et impression passent par le moteur MathALÉA.                                          |

Les deux cohabitent volontairement. L'exercice natif n'est référencé dans aucun
référentiel pour l'instant : il s'ouvre par `?uuid=afd39`.

## La banque

Les questions vivent dans `src/json/questionsDeCours/`, un fichier JSON par
thème. Ces fichiers sont issus du dépôt de l'app
([questions-de-cours](https://forge.apps.education.fr/coopmaths/apps/questions-de-cours)) :
la plupart des noms de champs restent en anglais pour que les deux dépôts
puissent continuer à s'échanger des séries de questions. Exception : le champ
`propositions` de l'app a été renommé `badPropositions` côté MathALÉA (voir
plus bas), une resynchronisation depuis l'app devra donc le renommer.

Le README du dépôt de l'app décrit le format d'origine en détail (sous le nom
`propositions`). `src/lib/questionsDeCours/banque.ts` n'accepte que les clés
listées ci-dessous : toute autre clé (faute de frappe comprise) fait échouer
`banque.test.ts`.

#### Clés communes (tous types)

| Clé       | Obligatoire | Format                                 | Rôle                                                                       |
| --------- | ----------- | --------------------------------------- | --------------------------------------------------------------------------- |
| `id`      | oui         | chaîne non vide, unique                 | Identifiant utilisé dans `sup` et l'URL.                                    |
| `level`   | oui         | `6`, `5`, `4`, `3`, `2`, `1` ou `T`      | Première classe où la notion est vue ; sert au filtre de niveau.            |
| `themes`  | oui         | chaîne ou tableau de chaînes            | Regroupement dans le sélecteur (une question peut avoir plusieurs thèmes).  |
| `title`   | oui         | chaîne non vide                         | Titre affiché en vue enseignante seulement, jamais à l'élève.               |
| `question`| oui         | chaîne, LaTeX autorisé entre `$`        | Énoncé.                                                                     |
| `answer`  | oui         | chaîne ou tableau de chaînes            | Réponse(s) acceptée(s) ; la première sert de correction par défaut.         |
| `correction` | non      | chaîne                                  | Correction affichée à la place de la valeur par défaut.                     |
| `type`    | non (défaut `math`) | `math`, `qcm` ou `text`          | Détermine le champ interactif et les clés spécifiques ci-dessous.           |
| `comparison` | non (défaut `isEqual`) | `isEqual`, `isSame`, `expressionsForcementReduites` | Voir la table de traduction plus bas ; pertinent surtout pour `math`. |
| `keys`    | non          | tableau de chaînes                      | Touches additionnelles du clavier (`math` uniquement, voir plus bas).       |
| `badPropositions` | non  | tableau de chaînes                      | Voir par type ci-dessous ; ne doit jamais répéter une valeur de `answer`.   |

#### Clés propres à chaque `type`

| `type` | Élément rendu | Clés à compléter en plus des clés communes |
| ------ | -------------- | ------------------------------------------- |
| `math` (défaut) | `mathalea-mathfield` | `keys` pour les touches du clavier personnalisable ; `comparison` si la comparaison par défaut ne convient pas (ex. `isSame` pour accepter une factorisation, `expressionsForcementReduites` pour une expression littérale). |
| `qcm`  | `mathalea-qcm`       | `badPropositions` obligatoire en pratique : ce sont les fausses réponses proposées (la bonne réponse ne doit pas y figurer). Il faut au moins deux propositions distinctes au total (`answer` ∪ `badPropositions`), sans quoi la question est rejetée par la validation. |
| `text` | `mathalea-textfield` | `badPropositions` optionnel (pas encore exploité comme touches-mots). La comparaison ignore la casse et les accents automatiquement, inutile de dupliquer les réponses sans accent dans `answer`. |

`src/lib/questionsDeCours/banque.ts` charge, valide et indexe la banque :

- la validation est écrite à la main (l'app utilisait `zod`, non embarqué ici) ;
  elle refuse les clés inconnues, ce qui attrape les fautes de frappe du type
  `proposition` au lieu de `badPropositions` ;
- une question invalide est ignorée en production et fait échouer
  `banque.test.ts`, qui vérifie l'intégralité de la banque à chaque `pnpm test:src` ;
- `questionDeCoursParId()` et `questionsDeCoursParTheme` servent à l'exercice et
  serviront au futur sélecteur visuel.

Pour ajouter une série de questions : déposer le JSON dans
`src/json/questionsDeCours/`, l'ajouter à `SOURCES` dans `banque.ts`, puis
lancer les tests unitaires.

## L'exercice natif

La sélection des questions vit dans `sup` : les identifiants choisis, séparés
par des virgules. Une sélection vide vaut « toute la banque », ce qui rend
l'exercice utilisable avant tout réglage. Les questions retenues sont mélangées
avec la graine de l'exercice, puis tronquées à `nbQuestions`.

Deux façons de la modifier :

- le **sélecteur visuel** (`questions-de-cours-selecteur`), affiché en tête de
  l'énoncé en vue enseignante ;
- le champ texte « Questions choisies » du panneau de réglages, pratique pour
  coller une sélection reçue par ailleurs.

### Le sélecteur

`src/lib/customElements/QuestionsDeCoursSelecteur.ts` est un custom element
**technique** : il ne porte aucune réponse d'élève, il n'est donc ni dans
`InteractivityType` ni dans `listOfCustomElements`. Il propose une recherche
(insensible à la casse et aux accents), un filtre de niveau (« jusqu'au »,
« égal à », « à partir du »), un bloc repliable par thème avec un raccourci
« Tout cocher / Tout décocher » sur le thème ouvert, et l'énoncé de chaque
question rendu en KaTeX — le rendu n'est fait qu'à l'ouverture d'un thème, la
banque étant trop grosse pour tout rendre d'avance.

Les filtres restent maîtres : le raccourci d'un thème ne coche que les
questions visibles, jamais celles qu'une recherche ou un niveau écarte. Les
champs et les cases reprennent les styles des formulaires de réglages
(constantes en tête du fichier) pour rester cohérents avec le reste du site,
en thème clair comme en thème sombre.

Quand une case change, il émet l'événement DOM `settings` (avec `sup` et, tant
que le nombre de questions suivait la sélection, `nbQuestions`).
`ExerciceMathaleaVueProf` écoute cet événement sur l'`<article>` de l'énoncé et
le traite avec `handleNewSettings()`, exactement comme les événements du
panneau de réglages : l'exercice est régénéré, l'URL est mise à jour, et
l'énoncé affiché sous le sélecteur sert d'aperçu.

C'est le point d'extension à réutiliser pour tout composant d'énoncé qui doit
changer les réglages de son exercice : émettre `settings` plutôt que toucher
directement à `exercicesParams`.

Comme l'exercice est régénéré à chaque coche, le sélecteur est détruit puis
recréé. Son état d'affichage (recherche, thèmes ouverts, défilement, dernière
case cochée pour rendre le focus) est donc conservé dans une `Map` de module,
indexée par numéro d'exercice.

Chaque type de question est rendu par un custom element déjà enregistré, ce qui
évite d'en créer un nouveau :

| `type` | Élément              | Réponse déclarée par                                    |
| ------ | -------------------- | ------------------------------------------------------- |
| `math` | `mathalea-mathfield` | `handleAnswers` avec les options de comparaison         |
| `text` | `mathalea-textfield` | `handleAnswers` + `texteSansCasse`                      |
| `qcm`  | `mathalea-qcm`       | `handleAnswers` avec `formatInteractif: 'mathalea-qcm'` |

Pour les questions `qcm`, `badPropositions` ne doit contenir que les fausses
réponses (la bonne réponse ne doit pas y être recopiée, `banque.test.ts` le
vérifie). À chaque génération, `selectionnePropositionsQcm()` pioche au hasard
jusqu'à 4 propositions au total (la bonne réponse toujours comprise) parmi
`badPropositions` ∪ `answer`, puis mélange leur ordre — la banque peut donc
lister autant de fausses réponses qu'elle veut, sans se limiter à 4.

Les modes de comparaison de la banque sont traduits en options de
`fonctionComparaison` :

| `comparison`                   | Option MathALÉA                                                         |
| ------------------------------ | ----------------------------------------------------------------------- |
| `isEqual` (défaut)             | comparateur par défaut                                                  |
| `expressionsForcementReduites` | `expressionsForcementReduites`                                          |
| `isSame`                       | `factorisation` (la seule question concernée demande une factorisation) |

La comparaison de textes de MathALÉA ignore la casse mais pas les accents :
l'exercice ajoute donc explicitement les variantes sans accents aux réponses
acceptées.

### Le clavier

Les questions `math` utilisent `KeyboardType.clavierPersonnalisable` (chiffres
et opérations de base) et lui passent les touches de la question via
`dataKeys` : la clé `keys` de la banque est donc portée telle quelle, noms de
raccourcis compris (`POW`, `SQRT`, `PMATRIX11`…). Voir
[Formats interactifs spécialisés](../../auteurs-exercices/complements/formats-interactifs.md#ajouter-des-touches-propres-à-une-question).

Deux différences avec l'app : les touches déjà présentes sur le clavier de base
n'y sont pas dédupliquées, et les `badPropositions` des questions `text` ne
sont pas encore proposées comme touches-mots.

### Sorties

- HTML interactif : champ de saisie sous l'énoncé.
- HTML non interactif : énoncé seul.
- LaTeX et Typst : énoncé suivi de `\dotfill` pour les questions à saisie, et
  des propositions (`propositionsQcm`) pour les QCM. Attention, `context.isHtml`
  reste vrai pendant la régénération Typst : c'est `context.isTypst` qui
  distingue ce cas.

Le sélecteur (et l'avertissement sur les identifiants inconnus) n'est ajouté à
`introduction` qu'en vue enseignante HTML, jamais pour l'élève ni dans les
exports.

## Ce qui reste à faire

- **Export AMC** : `amcReady` n'est pas déclaré, alors que les questions `qcm`
  s'y prêteraient.
- **Reprise des copies** : les copies Capytale produites par la version iframe
  ne sont pas relisibles par l'exercice natif, et l'ancien paramètre d'URL
  (`params={"selectedItems":[…]}`) n'est pas traduit vers `sup`.

## Voir aussi

- [Série aléatoire](serie-aleatoire.md) : l'autre app native, dont le sélecteur
  suit le même contrat (`settings`, styles partagés)
- [Apps externes](apps-externes.md)
- [Convention des custom elements](../interactivite/custom-elements.md)
- [Système d'interactivité](../interactivite/systeme-interactivite.md)
