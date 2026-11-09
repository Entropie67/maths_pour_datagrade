# Vue Parcours pour l'application

La vue Parcours (`v=parcours` dans l'URL) prépare les parcours de l'application
MathALÉA (mathalea-mobile) : une bibliothèque de parcours par niveau, les classes
qui les reçoivent, les objectifs travaillés, et un fichier à publier dans le
dossier partagé des élèves. Elle est accessible depuis « Plus d'exports »
(« Parcours pour l'application ») sur la page d'accueil. Tout reste dans le
navigateur : la bibliothèque est enregistrée dans `localStorage`
(`mathalea-parcours-bibliotheque`), rien n'est envoyé à un serveur. Elle fait
partie de [Mes sauvegardes](mes-sauvegardes.md) : section « Mes parcours »,
fichier `.mathalea`, sauvegarde automatique et synchronisation (module
`src/lib/mesFeuilles/parcoursSettings.ts`, `saveParcoursLibrary`). Le lien
`?v=parcours&parcours=<id>` ouvre la vue sur un parcours.

## Principe

1. **On crée pour un niveau, on donne à une classe.** L'éditeur ne contient pas
   les classes : la vue Classes attribue les parcours et règle leur ordre.
2. **Exercices** : « Ajouter des exercices » ouvre la fenêtre d'ajout du site
   (`TypstAddExerciseModal`) en pleine page, au niveau et au chapitre du
   parcours, réglages dépliés. Seuls les exercices interactifs entrent dans un
   parcours. La feuille composée sur la page d'accueil s'ajoute aussi d'un clic.
3. **Organisation** : liste simple, paliers numérotés ou ceintures (première
   ceinture au choix). « Paliers » propose un palier par objectif. Pour chaque
   palier : titre, accès (au moins N % au palier précédent, ou ouvert à tout
   moment), ressource pour revoir (lien), pause après le palier (texte et
   document lié). Les exercices se glissent d'un palier à l'autre ; les flèches
   franchissent aussi les bords des paliers.
4. **Objectifs** : chaque exercice reçoit l'objectif du programme sous lequel le
   référentiel le range (`listerExercices` du moteur, code comme `5N2G`). La vue
   Objectifs importe des listes (CSV `code;libellé;niveau;chapitre`, texte collé,
   fichier `objectifs-mathalea/1`) au fil de l'année, sans doublon.
5. **Publier** télécharge `parcours-mathalea-<date>.json` (format
   `classes-mathalea/1`) : les classes et leurs parcours pour les élèves, et
   toute la bibliothèque (parcours sans classe, objectifs). « Ouvrir » ou un
   fichier déposé sur la page reprend une bibliothèque publiée ici ou par
   l'application, sans rien effacer.

**France ou Suisse** : le drapeau de l'en-tête (ou `lang=fr-CH` dans l'URL)
choisit le référentiel. En Suisse, les niveaux sont les rubriques du référentiel
suisse de MathALÉA, section comprise : 9R1 à 11CT, 1re à 4e Collège,
Préqualifiant, Primaire (`levelsFor`, `SWISS_LEVELS` dans
`parcoursReferential.ts`). La fenêtre d'ajout s'ouvre sur les chapitres de la
section. Un parcours garde son niveau d'un pays à l'autre ; l'index des
exercices connaît ceux des deux référentiels, avec le code du pays affiché.

Le schéma du parcours (colonne de droite sur grand écran, repliable ailleurs)
montre les paliers, leurs exercices, les conditions d'accès et les pauses ; un
clic mène à la partie correspondante de l'éditeur.

## Format

Les clés du JSON sont celles de l'application (français) ; elles ne se
traduisent pas. Un parcours garde ses étapes en une seule liste ; `paliers`
donne le nombre d'exercices de chacun, si bien qu'une ancienne version de
l'application affiche simplement tout le parcours. Champs propres aux
paliers : `acces` (`libre` ou `seuil`), `seuil`, `ressource`, `pause` ; au
parcours : `style` (`paliers` ou `ceintures`), `premiereCeinture`.

## Fichiers

| Fichier                                                   | Rôle                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| `src/components/setup/parcours/Parcours.svelte`           | La vue : bibliothèque, onglets, ouvrir et publier            |
| `src/components/setup/parcours/ParcoursEditor.svelte`     | Éditeur d'un parcours (paliers, objectifs, glisser-déposer)  |
| `src/components/setup/parcours/ParcoursSchema.svelte`     | Schéma du parcours                                           |
| `src/components/setup/parcours/ParcoursClasses.svelte`    | Classes, attribution et ordre                                |
| `src/components/setup/parcours/ParcoursObjectives.svelte` | Objectifs : import CSV, liste, exercices qui les travaillent |
| `src/components/setup/parcours/ExerciseSettings.svelte`   | Réglages d'un exercice du parcours                           |
| `src/components/setup/parcours/ExercisePreview.svelte`    | Aperçu élève (moteur de l'application)                       |
| `src/lib/parcours/`                                       | Format, bibliothèque, édition, objectifs, référentiel        |
| `src/lib/mesFeuilles/parcoursSettings.ts`                 | Stockage, fusion et fichier `.mathalea` de la bibliothèque   |

La fenêtre d'ajout (`TypstAddExerciseModal`, `TypstExercisePreview`) accepte des
options facultatives pour cette vue (chemin d'arrivée, pleine page, réglages
dépliés, libellés) ; les autres vues n'en changent pas.

## Salons : versions

Un salon (travail à plusieurs, `src/lib/parcours/salon/`) est un document Yjs
partagé par le serveur des salons (`VITE_SALONS_URL`, par défaut
`https://parcours.gemaths.net`). Le serveur en garde une copie par heure de
modification au plus (500 par salon), lisible par les membres :
`GET /api/salons/<id>/versions` (dates) et `GET /api/salons/<id>/versions/<date>`
(état Yjs en base64).

- `salonVersions.ts` : relit un parcours dans une copie, compare deux parcours
  sans les clés internes `cle` (le salon en ajoute aux blocs anciens en
  réécrivant), retrouve les parcours supprimés.
- `VersionsPanel.svelte` (onglet Versions du volet, bouton Versions de l'en-tête) :
  liste les copies où le parcours change ; « Revenir à cette version » réécrit
  le parcours dans le salon comme une modification ordinaire, et l'état
  remplacé reste en mémoire pour « Annuler le retour ».
- `DeletedParcours.svelte` (bas de chaque salon) : parcours absents du salon
  mais présents dans une copie, dans leur dernière version, à rétablir.

## Tests

- `tests/unit/parcours.test.ts` : paliers (découpage, déplacements, contrôles),
  bibliothèque (attribution, versions, publication, reprise), objectifs (CSV),
  ceintures et icônes, objectif du programme lu dans le référentiel.
- `src/lib/parcours/salon/salonVersions.test.ts` : relecture d'une copie, retour
  à une version, parcours supprimés, comparaison sans les clés internes.
