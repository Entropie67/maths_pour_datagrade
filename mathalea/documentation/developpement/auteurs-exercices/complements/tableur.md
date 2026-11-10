# Utiliser le tableur dans un exercice

`MySpreadsheetElement` est plus complexe que la plupart des custom elements, car il gère à la fois :

- l'interactivité HTML (jspreadsheet) ;
- la sérialisation de la réponse élève ;
- un rendu LaTeX potentiellement stylé.

Implémentation : `src/lib/customElements/MySpreadSheet.ts`

## Point d'entrée recommandé

Utiliser `renderSheetMarkup(...)` côté exercice.

`addSheet(...)` reste disponible pour compatibilité, mais délègue désormais à `renderSheetMarkup(...)`.

## Exemple complet

```ts
import { renderSheetMarkup } from '../../lib/customElements/MySpreadSheet'

texte += renderSheetMarkup({
  numeroExercice: exercice.numeroExercice,
  questionIndex: i,
  data: [
    ['Produit', 'Prix'],
    ['Pommes', 3.2],
    ['Poires', 4.1],
  ],
  minDimensions: [2, 3],
  columns: [{ type: 'text' }, { type: 'numeric' }],
  interactif: true,
  showVerifyButton: true,

  // Données dédiées au rendu LaTeX (prioritaires sur data)
  latexData: {
    0: {
      0: { t: 1, v: 'Produit' },
      1: { t: 1, v: 'Prix', s: 'headerBlue' },
    },
    1: {
      0: { t: 1, v: 'Pommes' },
      1: { t: 2, v: 3.2, s: 'priceBg' },
    },
    2: {
      0: { t: 1, v: 'Poires' },
      1: { t: 2, v: 4.1, s: 'priceBg' },
    },
  },

  // Palette de styles utilisée par les clés s dans latexData
  latexStyles: {
    headerBlue: { bg: '#DCEBFF' },
    priceBg: { bg: '#F3F7E8' },
  },

  // Options de sortie de createTableurLatex(...)
  latexOptions: {
    formule: true,
    formuleCellule: 'B2',
    formuleTexte: '=B2*1.2',
    firstColHeaderWidth: '3cm',
  },
  appendFeedbackBlocks: true,
})
```

## Paramètres utiles de renderSheetMarkup(...)

- `numeroExercice` et `questionIndex` : génèrent l'id standard et les blocs feedback (`resultatCheck...`, `feedback...`).
- `appendFeedbackBlocks` : active/neutralise explicitement l'ajout des blocs feedback en sortie HTML.
- `latexData`, `latexStyles`, `latexOptions` : pilotent le rendu LaTeX/Typst.
- `nbColonnesCachees`, `nbLignesCachees`, `readOnlyCells` : options spécifiques au tableur interactif.
- `barreFormule` : affiche au-dessus du tableau, comme dans Excel, le nom de la
  cellule sélectionnée et un champ montrant sa formule (contenu brut). Le champ
  est modifiable (validation par Entrée ou par le bouton ✓, annulation par Échap ou par le bouton ✗) sauf si la cellule
  ou le tableur est en lecture seule. Cette barre n'existe qu'en HTML ; pour le
  rendu LaTeX, `latexOptions.formule` écrit une ligne équivalente.
- `arrondiAffichage` : arrondit à 9 décimales les résultats de formules affichés
  (`110.00000000000001` devient `110`) et remplace `NaN` par `#VALUE!`.
  `rendTableur()` l'active toujours.

## Comportement de rendu

- en HTML non Typst : retourne le markup du custom element (et éventuellement les blocs feedback) ;
- en non-HTML ou Typst : retourne la sortie `render()` du composant, qui passe par `renderLatex()`.

## Règles de priorité pour le rendu LaTeX

1. Si `latexData` est fourni, il est utilisé directement.
2. Sinon, les cellules sont reconstruites automatiquement à partir de `data`.
3. `latexStyles` et `latexOptions` sont optionnels (fallback sur `{}`).

## Structure attendue pour latexData

- cellule texte : `{ t: 1, v: '...' }`
- cellule numérique : `{ t: 2, v: 12.5 }`
- cellule booléenne : `{ t: 3, v: true }`
- style optionnel : clé `s` (ex. `{ t: 1, v: 'Total', s: 'headerBlue' }`)

## Conseils pratiques

- garder `data` cohérent avec `latexData` pour éviter les divergences HTML/LaTeX ;
- éviter des couleurs trop proches du fond dans `latexStyles` (lisibilité impression) ;
- préférer des clés de style explicites (`headerBlue`, `warningCell`) plutôt que des noms ambigus.

## Fonctions et noms français

Le tableur interactif accepte `=RACINE(A1)`, `=SOMME(A1:A3)` et
`=MOYENNE(A1:A3)` (majuscules ou minuscules, arguments séparés par `;` ou
`,`) : `onbeforeformula` les traduit en `SQRT`, `SUM` et `AVERAGE` avant le
calcul, sans modifier le texte saisi par l'élève. Pour ajouter un nom, compléter
`formuleAnglaise()` dans `src/lib/outils/tableurFormules.ts` (et
`evalueFormule()` si les sorties papier doivent aussi le calculer).

## Formules sous forme de texte (`tableurFormules.ts`)

`src/lib/outils/tableurFormules.ts` manipule les formules sans jspreadsheet :

- `decaleFormule()` / `recopieFormule()` : formule obtenue après un
  copier-coller, en respectant les `$` (`$A1`, `A$1`, `$A$1`) ;
- `evalueFormule()`, `valeurAffichee()`, `texteAffiche()` : calcul d'une
  formule (opérations, parenthèses, puissances, `SUM`/`SOMME`, `AVERAGE`/
  `MOYENNE`, `SQRT`/`RACINE`, `MIN`, `MAX`) et affichage des erreurs
  (`#DIV/0!`, `#ERROR!`) ;
- `formuleEnTex()` et `expressionNumerique()` : mise en forme pour les énoncés et
  les corrections.

Pour afficher une formule littérale, utiliser `$${formuleEnTex(formule)}$`
dans une chaîne à interpolation. Cet utilitaire échappe notamment les `$` des
références absolues : ils restent visibles en HTML/KaTeX, LaTeX et Typst.
Utiliser aussi cette mise en forme dans les libellés des paramètres contenant
une référence comme `$A$1`.

`src/lib/outils/tableurRendu.ts` (`rendTableur()`) construit le tableur HTML et
son rendu papier à partir d'un dictionnaire de cellules `{ B2: '=A2*3' }` : les
valeurs LaTeX sont calculées automatiquement. Un tableur non interactif y est
toujours en lecture seule, même dans un exercice interactif.

Les exercices `PET11` à `PET16` (thème « Tableur » du CRPE) s'appuient sur ces
outils et sur `tableurScenarios.ts` (situations dont les formules justes et
fausses sont vérifiées par des tests) et `tableurRecopie.ts` (tirage d'une
recopie de formule).

Les formules erronées préchargées dans un tableur à corriger doivent rester
calculables : jspreadsheet écrit une erreur console lorsqu'une formule désigne
sa propre cellule, y compris par une plage. Pour proposer une erreur de calcul,
privilégier une formule donnant un résultat faux sans référence circulaire.

## Comparaison des réponses

La vérification (`compareSheetFunction`) recalcule la formule de l'élève sur des
valeurs tirées au hasard (`sheetTestDatas`) : une formule équivalente est donc
acceptée. Les nombres sont comparés à `1e-9` près (relatif) pour ignorer les
écarts d'arrondi. Répéter les entrées de `sheetTestDatas` donne plusieurs
tirages.
