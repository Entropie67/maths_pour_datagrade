# Custom element « Relier les étiquettes »

Tag : `relier-etiquettes`. Composant d'appariement : deux colonnes d'étiquettes rectangulaires 16/9 que l'élève relie deux à deux, avec un rendu HTML interactif et deux rendus imprimés (LaTeX/TikZ et Typst).

La recette côté exercice est décrite dans [Formats interactifs spécialisés](../../auteurs-exercices/complements/formats-interactifs.md#relier-les-étiquettes). Cette page documente l'implémentation.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `src/lib/customElements/RelierEtiquettesElement.ts` | Le custom element, ses types, sa correction (`verifQuestion`), le helper `addRelierEtiquettes()` et les rendus `renderLatex()` / `renderTypst()` |
| `src/app.css` | Styles (classes préfixées `relier-etiquettes__`) |
| `tests/unit/relierEtiquettesElement.test.ts` | Tests unitaires |

Le composant vit dans le DOM clair (pas de shadow DOM) : les formules LaTeX des étiquettes sont donc rendues par la passe KaTeX globale (`renderKatex()`), et les couleurs suivent le thème clair/sombre via les variables `--color-coopmaths*`.

## Trois rendus, un seul appel

`create()` choisit la sortie selon le contexte, dans cet ordre (car
`context.isHtml` reste vrai pendant un export Typst) :

1. `context.isTypst` → `<mathalea-typst>${renderTypst()}</mathalea-typst>`, marqueur inséré tel quel par `htmlToTypst()` (`latexToTypst.ts`) ;
2. `!context.isHtml` → `renderLatex()` ;
3. sinon → la balise `<relier-etiquettes>` et ses attributs, suivie du `span#resultatCheck…` et du `div#feedback…` **si l'interactivité est active** (sans quoi ces identifiants seraient dupliqués entre l'énoncé et la correction).

Les trois rendus partagent la même géométrie (étiquettes rectangulaires 16/9,
couloir vide entre les colonnes, point de raccordement sur le bord intérieur)
et la même palette `COULEURS_LIENS`, indexée par le rang de l'étiquette de
gauche : un lien garde donc sa couleur d'un format à l'autre.

Le rendu Typst n'utilise aucun paquet externe : le dessin est un `#block` de
taille fixe où étiquettes, traits (`line`) et points (`circle`) sont posés en
coordonnées absolues avec `#place`. Le LaTeX de chaque étiquette est converti
par un mini-convertisseur local (`latexFragmentToTypstMath`) contenu dans le
fichier du custom element.

## Interactions

Un seul chemin de code sert la souris, le tactile et le clavier :

- `pointerdown`/`pointermove`/`pointerup` sur l'étiquette, avec capture du pointeur. En dessous de `SEUIL_GLISSER` (8 px) le geste est traité comme un appui, au-delà comme un glisser vers l'autre colonne (cible retrouvée par `document.elementFromPoint`) ;
- un appui sélectionne l'étiquette, l'appui suivant sur l'autre colonne crée ou retire le lien ;
- l'activation clavier passe par `click` avec `event.detail === 0`, ce qui distingue le clic clavier du clic issu d'un pointeur déjà traité en `pointerup` ;
- `touch-action: pan-y` sur les étiquettes : le glisser horizontal relie, le défilement vertical de la page reste possible.

Les traits sont dessinés dans un SVG superposé au plateau, sous les étiquettes. Les ancres sont recalculées à partir des `getBoundingClientRect()` à chaque rafraîchissement, et un `ResizeObserver` sur le plateau redessine après le rendu KaTeX ou un changement de largeur.

## Correction

`verifQuestion()` compare l'ensemble des liens de l'élève à `autoCorrection[i].valeur.reponse.value` (JSON de `LienRelier[]`), sans tenir compte de l'ordre. Le score est **proportionnel** : `nbBonnesReponses` est le nombre de liens justes, `nbReponses` le nombre de liens attendus. `montreCorrection()` recolore ensuite les traits (vert juste, rouge faux, pointillés verts pour un lien attendu absent) avant que le composant ne devienne inerte.

## Points d'attention

- Le contenu d'une étiquette est injecté avec `textContent`, pas `innerHTML` : une inégalité comme `$n<0$` serait sinon interprétée comme une balise ouvrante par le parseur HTML. Les étiquettes acceptent donc du texte et du LaTeX entre `$`, mais pas de balises.
- L'identifiant de l'élément suit la convention `${elementTag}Ex${numeroExercice}Q${questionIndex}` : `mathaleaWriteStudentPreviousAnswers()` en dépend pour restaurer les copies. Une instance affichée en correction doit recevoir un `id` explicite différent.
