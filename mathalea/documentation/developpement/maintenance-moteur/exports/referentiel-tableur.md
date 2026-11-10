# Export « Référentiel et liste des exercices »

Cet export produit un classeur tableur (ODS ou XLSX, au choix) décrivant le
référentiel des **exercices aléatoires**. Il est accessible depuis « Plus
d'exports » dans l'en-tête de la page de conception (`ExportButtons.svelte`),
en dernière entrée de la liste.

## Contenu du classeur

Deux onglets :

| Onglet | Colonnes | Contenu |
| --- | --- | --- |
| `Référentiel` | Niveau, Thème, Sous-thème | Un triplet distinct par branche du référentiel menant à au moins un exercice, dans l'ordre de première rencontre. |
| `Liste des exercices` | Niveau, Thème, Sous-thème, ID, Titre | Une ligne par exercice aléatoire. |

Le nœud `Nouveautés` (qui duplique des exercices déjà rangés dans les niveaux)
est exclu. Les niveaux d'imbrication au-delà du troisième sont concaténés dans
la colonne `Sous-thème` avec `›` comme séparateur.

Les codes des nœuds (`4C1`, `can1D0`…) sont traduits en intitulés lisibles via
`codeToLevelList*.json` puis `levelsThemesList*.json` ; à défaut le code brut
est conservé. Les listes FR ou CH sont choisies selon `referentielLocale`.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `src/lib/spreadsheet.ts` | Générateur minimaliste XLSX (Office Open XML) et ODS (OpenDocument) à partir de grilles de cellules, basé sur JSZip. Aucune mise en forme. |
| `src/lib/referentielExport.ts` | Extraction des données depuis le référentiel « aleatoires » (`getReferentiels`), construction des deux onglets, téléchargement. |
| `src/components/setup/start/presentationalComponents/header/headerButtons/exportButtons/ExportButtons.svelte` | Entrée de menu et modale de choix du format. |

`spreadsheet.ts` est générique et réutilisable pour d'autres exports tableur :
`buildXlsxBlob(sheets)`, `buildOdsBlob(sheets)`, `downloadBlob(blob, nom)`.

## Tests

- `src/lib/spreadsheet.test.ts` : structure des archives produites (parties OOXML
  obligatoires, `mimetype` non compressé en premier pour l'ODS, échappement XML),
  relecture avec JSZip.
- `src/lib/referentielExport.test.ts` : traduction des codes, exclusion de
  `Nouveautés`, concaténation des sous-niveaux, déduplication de l'onglet
  `Référentiel`, et passage sur le référentiel réel `referentiel2022FR.json`.
