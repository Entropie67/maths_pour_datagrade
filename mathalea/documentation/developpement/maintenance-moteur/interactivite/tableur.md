# Architecture du tableur

`MySpreadsheetElement`, implémenté dans
`src/lib/customElements/MySpreadSheet.ts`, combine :

- un tableur HTML interactif ;
- la sérialisation de la réponse élève ;
- un rendu LaTeX ou Typst imprimable.

La recette côté exercice est dans
[Utiliser le tableur](../../auteurs-exercices/complements/tableur.md).

## Point d'entrée

`renderSheetMarkup()` est l'interface stable pour les exercices. `addSheet()`
reste un alias de compatibilité.

## Rendu

- en HTML hors Typst, le helper produit le custom element et éventuellement les
  zones de résultat et de feedback ;
- en LaTeX ou Typst, il appelle le rendu imprimable ;
- `latexData` est prioritaire lorsqu'il est fourni ;
- sinon, le rendu reconstruit les cellules depuis `data`.

`latexStyles` et `latexOptions` ne doivent pas modifier la valeur interactive.

## Barre de formule

Avec l'attribut `barre-formule="true"` (option `barreFormule`), le custom
element insère avant la feuille un champ « cellule sélectionnée » et un champ de
formule. Ils sont synchronisés par les événements `onselection` et
`onafterchanges` de jspreadsheet. jspreadsheet écoute le clavier sur tout le document (Entrée, flèches, Suppr) :
les touches tapées dans la barre sont donc arrêtées (`stopPropagation`). La
validation (Entrée, bouton ✓, perte du focus ou changement de cellule) appelle
`setValueFromCoords()`, ce qui déclenche les mêmes événements qu'une saisie dans
la cellule. Le champ est en lecture seule si le tableur l'est ou si la cellule
est dans `readOnlyCells`.

`installFormulaPointing()` (`src/lib/outils/tableurPointage.ts`) intercepte le
`mousedown` en capture avant jspreadsheet lorsque la barre a le focus et attend
une référence (après `=`, un opérateur, `(`, `;` ou `,`). Un clic insère la
référence ; les clics suivants la remplacent jusqu'à une nouvelle saisie ou un
déplacement du curseur. Le glisser et Maj+clic depuis la dernière cellule pointée
insèrent une plage rectangulaire. La cellule éditée et le focus restent inchangés.
Après un opérande saisi au clavier, le clic conserve la validation et la sélection
habituelles. F4, sur une référence ou une plage au curseur, fait tourner les
blocages : `B2`, `$B$2`, `B$2`, `$B2`, puis `B2`.

Entrée ou ✓ valide et quitte la barre : le clic suivant sélectionne une autre
cellule. Échap ou ✗ annule et quitte la barre. Les flèches déplacent le curseur
dans le champ ; le mode de pointage par flèches et la bascule F2 ne sont pas gérés
par la barre.

## Lecture seule

Un tableur dont toutes les cellules sont protégées affiche « 🔒 Tableur en
lecture seule. ». La sélection et la copie restent possibles. Une tentative de
saisie au clavier, de collage ou d'édition par double clic affiche un message
accessible (`role="status"`) invitant à saisir la réponse sous le tableau.
Dans une feuille partiellement protégée, le message invite à sélectionner une
cellule modifiable. `installReadOnlyFeedback()` (`tableurLectureSeule.ts`)
intercepte ces tentatives avant les gestionnaires de jspreadsheet ; ses événements
sont retirés au démontage du custom element.

Les zones de résultat et de feedback vides sont masquées sans marge ni padding,
y compris les blocs externes produits par `renderSheetMarkup()`.

## Noms de fonctions français

`onbeforeformula` appelle `formuleAnglaise()` (`tableurFormules.ts`) pour
traduire `RACINE`, `SOMME` et `MOYENNE` en `SQRT`, `SUM` et `AVERAGE`. Le
contenu brut de la cellule n'est pas modifié.

## Invariants

- les identifiants suivent la convention exercice/question ;
- `data` et `latexData` représentent le même contenu pédagogique ;
- les cellules masquées ou en lecture seule sont conservées lors de la
  sérialisation ;
- le rendu imprimable ne dépend pas de jspreadsheet ni du DOM.

Toute évolution de la structure sérialisée doit tenir compte des réponses déjà
enregistrées et des exports.
