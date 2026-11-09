import QRCode from 'qrcode'
import {
  applyImageCuts,
  harvestImageCuts,
  IMAGE_SLICE_HELPER,
  type ExerciseImageCuts,
} from './imageCuts'
import {
  applyDocumentFontsToFigure,
  CETZ_IMPORT,
  CETZ_PLOT_CHART_IMPORT,
  CTZ_EUCLIDE_IMPORT,
  DEFAULT_QCM_COLUMNS,
  escapeTypstText,
  htmlToTypst,
  MATHALEA_FIGURE_BLOCK_HELPER,
  MATHALEA_FIGURE_HELPERS,
  MATHALEA_FIT_HELPER,
  MATHALEA_QCM_HELPERS,
  MATHALEA_SCHEMA_HELPER,
  MATHALEA_TASKS_HELPER,
  QCM_COLUMNS_FROM_CONTENT,
  QCM_COLUMNS_MARKER,
  QCM_FIGURES_MARKER,
  sanitizeSvg,
  TASKIZE_IMPORT,
  VARTABLE_IMPORT,
} from './latexToTypst'
import { LOGO_CAN_VIRTUAL_PATH } from './mathaleaLogo'
import { minimalCorrection } from './minimalCorrection'
import { simplifyTypstHighlights, withTypstHighlights } from './typstHighlights'
import { typstImport } from './typstPackages'

/**
 * Rend le QR-code en SVG côté mathalea (fond blanc explicite) plutôt que de
 * laisser `exercise-bank` passer l'URL brute à `tiaoma` : ce dernier ne
 * reçoit alors qu'une couleur de trait (`fg-color`), sans option de fond, ce
 * qui produit un QR-code transparent (illisible sur fond sombre ou coloré).
 * `exercise-bank` accepte aussi bien une URL (`str`, déléguée à tiaoma) que
 * du contenu Typst déjà mis en forme (`box(width: size, qr)`) : lui fournir
 * directement une image évite ce chemin défaillant. `QRCode.toString` est
 * synchrone en interne (le rendu SVG ne fait aucune E/S) ; son callback est
 * donc appelé avant que la fonction ne retourne.
 *
 * L'image est enveloppée dans un `link(url)[...]` : le QR-code du PDF devient
 * alors un lien cliquable vers l'exercice (tiaoma, le chemin d'origine
 * d'`exercise-bank`, ne pose pas de lien).
 */
function qrCodeToTypstImage(url: string): string {
  let svg = ''
  QRCode.toString(
    url,
    { type: 'svg', margin: 1, color: { dark: '#000000', light: '#ffffff' } },
    (error: Error | null, result: string) => {
      if (error != null) throw error
      svg = result
    },
  )
  const image = `image(bytes(${typstString(sanitizeSvg(svg))}), format: "svg", width: 100%)`
  return `link(${typstString(url)})[#${image}]`
}

/**
 * Lien vers toute la sélection d'exercices en vue élève (un exercice par
 * page, non interactif mais modifiable par l'élève, mêmes graines que le
 * document imprimé), encodé dans le QR-code de fiche quand `showQrCodeFiche`
 * est actif. Réutilise les paramètres déjà calculés dans l'URL individuelle
 * de chaque exercice (`exercise.url`, voir `exerciceUrl` dans Typst.svelte —
 * mêmes uuid/graine/réglages que le QR-code par exercice) plutôt que de les
 * reconstruire : seuls `v` et `es` en sont exclus, réglés une seule fois pour
 * toute la fiche plutôt que par exercice. `undefined` si aucun exercice
 * imprimé n'a d'URL (fiche entièrement composée d'exercices non chargés).
 */
export function ficheUrl(exercises: TypstExerciseInput[]): string | undefined {
  const url = new URL('https://coopmaths.fr/alea')
  let hasExercise = false
  for (const exercise of exercises) {
    if (exercise.warning != null || exercise.url == null || exercise.url === '')
      continue
    hasExercise = true
    for (const [key, value] of new URL(exercise.url).searchParams) {
      if (key === 'v' || key === 'es') continue
      url.searchParams.append(key, value)
    }
  }
  if (!hasExercise) return undefined
  url.searchParams.append('v', 'eleve')
  // un exercice par page (1), non interactif (0), interactif modifiable (1)
  url.searchParams.append('es', '1011')
  return url.href
}

/** Largeur (et hauteur) du QR-code de fiche, à droite du bloc de titre */
const FICHE_QRCODE_SIZE = '2cm'

function qrCodeGlobalVariableName(version: number): string {
  // Conserve le nom historique pour le sujet A : les fiches déjà éditées et
  // leurs modifications ciblées restent ainsi compatibles.
  return version === 0 ? 'qr-code-global-url' : `qr-code-global-url-${version}`
}

/**
 * QR-code de fiche, pointant vers toute la sélection d'exercices en vue
 * élève. `exo-corner` (exercise-bank) le place au bord droit, à l'endroit où
 * il apparaît dans le flux (juste avant le bloc de titre), sans y prendre de
 * place : le bloc de titre (`exo-corner-fit`, voir `headerBlock`), les titres
 * d'exercices et leurs filets s'arrêtent avant lui, et les énoncés le
 * contournent, jusqu'à ce que le flux soit passé sous le QR-code.
 */
function ficheQrCodeLines(version: number, exportMode = false): string[] {
  const urlVariable = qrCodeGlobalVariableName(version)
  return [
    `#exo-corner(box(width: ${FICHE_QRCODE_SIZE})[${exportMode ? '' : `#mathalea-anchor("qr-code", ${version})`}#link(${urlVariable})[#qrcode(${urlVariable}, width: 100%)]])`,
  ]
}

/**
 * Logo de la page de garde « Course aux nombres », référencé par chemin
 * virtuel (voir `mathaleaLogo.ts`) plutôt qu'embarqué : `prefetchStaticImages`
 * (`Typst.svelte`) le charge dans le compilateur pour l'aperçu, et l'ajoute
 * au `.zip` téléchargé aux côtés du `.typ`.
 *
 * Largeur en pourcentage (relative au conteneur, pas à la page) : elle suit
 * ainsi la largeur de la page de garde sans dépasser en A5 comme en A4,
 * sans code dédié par format.
 */
const MATHALEA_LOGO_IMAGE = `image("${LOGO_CAN_VIRTUAL_PATH}", width: 100%)`

/**
 * Import du paquet exercise-bank (badges Exercice/Correction, banque).
 * Depuis la 0.6.0, le paquet gère lui-même les QR-codes (via tiaoma en
 * interne) : plus besoin d'importer tiaoma séparément.
 *
 * `exo-solution-box` (plutôt que `exo-print-solutions`) : appelée directement
 * par exercice/groupe dans la section Corrections, pour pouvoir y placer une
 * insertion de la palette (texte, section) *avant* le badge « Correction N »
 * — `exo-print-solutions` imprime tous les items en attente d'un coup, sans
 * point d'insertion individuel entre eux (voir `buildVersionContent`).
 */
export const EXERCISE_BANK_IMPORT = typstImport(
  'exercise-bank',
  'exo, exo-setup, exo-solution-box, exo-counter, exo-corner, exo-corner-fit',
)

/**
 * Même import, avec `exo-solution-box` renommé en `exo-solution-box-pkg` :
 * le style `underline` redéfinit `exo-solution-box` (voir
 * `MATHALEA_SOLUTION_UNDERLINE_HELPER`) pour resserrer le titre des corrections.
 */
/** Import du seul QR-code de fiche, sans exercice habillé par exercise-bank */
export const EXERCISE_BANK_CORNER_IMPORT = typstImport(
  'exercise-bank',
  'exo-corner, exo-corner-fit',
)

export const EXERCISE_BANK_IMPORT_UNDERLINE = typstImport(
  'exercise-bank',
  'exo, exo-setup, exo-solution-box as exo-solution-box-pkg, exo-counter, exo-corner, exo-corner-fit',
)

/**
 * `exo-solution-box` pour le style `underline`, dont le paquet fige le filet
 * sous le titre : `style-underline` empile titre, `v(-0.3em)`, filet,
 * `v(0.5em)` puis corps, chacun dans son paragraphe, si bien que
 * l'espacement entre paragraphes (`par.spacing`, 1,2 em par défaut) s'ajoute
 * deux fois — entre le titre et le filet, puis entre le filet et le corps.
 * Aucun réglage du paquet n'agit dessus. On resserre donc `par.spacing` le
 * temps de l'appel (le filet passe à environ 0,2 em du titre), on le rétablit
 * pour le corps de la correction (ses propres paragraphes gardent leur
 * espacement) et un `v` négatif ramène le blanc sous le filet à environ la
 * moitié de celui qui sépare deux corrections (`solution-above`).
 */
export const MATHALEA_SOLUTION_UNDERLINE_HELPER = `#let exo-solution-box(corps, ..args) = context {
  let espacement = par.spacing
  set par(spacing: 0.5em)
  exo-solution-box-pkg(..args, { set par(spacing: espacement); v(0.35em - espacement); corps })
}`

/** QR-code Typst natif utilisé par le QR-code global de la fiche. */
export const TIAOMA_IMPORT = typstImport('tiaoma', 'qrcode')

/** Hauteur (et largeur) des QR-codes placés au coin des exercices (`qr-size`) */
const QRCODE_SIZE = '1.8cm'
const QRCODE_POSITION = '"tasks"'

/**
 * Import du paquet breather (gestion automatique des espaces verticaux) :
 * `#show: breathe` écarte les lignes contenant des maths hautes (fractions
 * « display », matrices…) juste ce qu'il faut, sans toucher aux autres.
 */
export const BREATHER_IMPORT = typstImport('breather', 'breathe')

/**
 * Appel de `breathe` avec un seuil relevé (1.25em, le défaut du paquet est
 * 1.1em) : sous 1.1em, une formule inline courte mais dont le bord (une
 * parenthèse, souvent) dépasse légèrement le seuil bascule sur des marges de
 * texte « bounds » (ink réel) alors que ses voisines de la même ligne
 * restent en métrique par défaut — deux hauteurs de ligne différentes pour
 * des formules à l'ink pourtant comparable. Conséquence visible : dans un
 * QCM (`propositionsQcm`, `qcm-case`) posé juste sous une expression comme
 * `$(-5)^8$` ou `$-(-8)^{-4}$`, les cases à cocher d'une même ligne de
 * questions (`#tasks`, colonnes alignées par le haut) se retrouvent à des
 * hauteurs différentes selon que l'expression franchit ce seuil ou non — cf.
 * l'exercice 4C37. 1.25em passe au-dessus de ce cas frontière (vérifié en
 * conditions réelles sur l'aperçu Typst de l'application, la mesure locale
 * au CLI `typst` ne reproduisant pas l'écart, sans doute par différence de
 * version/métriques avec le moteur `typst.ts` embarqué) tout en restant
 * confortablement sous la hauteur d'une fraction « display » (~1.5em), qui
 * continue de déclencher l'espacement adapté — plus de détails dans
 * `documentation/developpement/maintenance-moteur/exports/typst.md`.
 */
export const BREATHER_CALL = '#show: breathe.with(threshold: 1.25em)'

/**
 * Repère invisible pour la palette de mise en page de l'aperçu : publie la
 * position du point d'insertion (page, x et y en pt) dans une métadonnée,
 * interrogée après compilation (`query(<mathalea-anchor>)`) pour placer les
 * contrôles (colonnes/espacement des questions, insertions) sur l'aperçu.
 * Aucun impact sur la mise en page : une métadonnée n'occupe aucune place.
 */
export const MATHALEA_ANCHOR_HELPER = `#let mathalea-anchor(kind, num, dx: 0pt) = context {
  let position = here().position()
  [#metadata((kind: kind, num: num, page: position.page, x: (position.x + dx).pt(), y: position.y.pt())) <mathalea-anchor>]
}`

/**
 * Saut de colonne (ou de page) conditionnel avant un exercice ou une
 * correction : s'il reste moins de `hauteur` sous la position courante, on
 * passe à la colonne suivante ; sinon rien n'est produit et le rendu est
 * inchangé. Sans cela, avec les habillages pleine largeur d'exercise-bank
 * (`underline` — « Épuré » —, `border-accent`, `rounded-box`, `header-card`),
 * le titre « Exercice N » et son filet pouvaient rester seuls en bas de
 * page : le paquet ne les rend collants (`sticky`) que pour les habillages à
 * badge. Un bloc insécable vide suivi d'un `v` négatif ferait le même travail
 * mais casserait la fusion des espacements autour de l'exercice.
 */
export const MATHALEA_NEEDSPACE_HELPER = `#let mathalea-needspace(hauteur: 5em) = context {
  // \`page.height\` ignore \`flipped\` (paysage) : la hauteur réelle est alors la largeur
  let haut-page = if page.flipped { page.width } else { page.height }
  let marge = page.margin
  let bas = if type(marge) == dictionary { marge.at("bottom", default: marge.at("y", default: auto)) } else { marge }
  bas = if bas == auto { 2.5 / 21 * calc.min(page.width, page.height) } else if type(bas) == relative { bas.length.to-absolute() + bas.ratio * haut-page } else { bas.to-absolute() }
  if haut-page - bas - here().position().y < hauteur.to-absolute() { colbreak(weak: true) }
}`

/** Marqueur de fin de ligne des insertions faites via la palette */
export const INSERTION_TAG = '// mathalea:insertion'
/** Marqueur de fin de ligne des insertions faites via la palette, avant une correction */
export const INSERTION_CORRECTION_TAG = '// mathalea:insertion-corr'

/**
 * Une formule en ligne ne doit jamais être coupée entre deux lignes (une
 * partie sur chacune) : `box` l'en empêche, mais il aligne le *bas* de son
 * contenu sur la ligne de base — une fraction, une parenthèse haute ou un
 * indice se retrouveraient donc entièrement au-dessus du texte qui les
 * entoure (flagrant avec les fractions, toutes en display ici).
 *
 * On rend donc à la boîte la profondeur de la formule (sa partie sous la
 * ligne de base), que Typst n'expose pas directement : mise sur une ligne à
 * côté d'une boîte plus haute qu'elle — dont la ligne de base est le bas,
 * justement parce que `box` aligne par le bas —, la formule ne dépasse que
 * par le bas ; la hauteur de cette ligne vaut donc celle de la boîte témoin
 * plus la profondeur cherchée.
 *
 * C'est une règle d'affichage et non un enrobage émis par le convertisseur :
 * l'énoncé garde ainsi un `math.equation` dans l'arbre de contenu, seule
 * forme que `is-inline-content` (paquet taskize) reconnaît comme étant en
 * ligne — sans quoi le numéro de la question serait aligné en haut de
 * l'énoncé au lieu de partager sa première ligne (voir
 * `MATHALEA_TASKS_HELPER`).
 *
 * Une formule qui contient déjà des retours à la ligne (calcul aligné sur
 * plusieurs lignes, `\\begin{aligned}` de LaTeX) forme un cadre de plusieurs
 * lignes, dont Typst place la ligne de base en bas : le texte qui l'entoure —
 * le numéro de la question, surtout — se retrouverait sur sa dernière ligne.
 * On l'aligne donc sur sa *première* ligne, en mesurant à part la hauteur de
 * celle-ci (le témoin est cette fois entièrement sous la ligne de base, pour
 * ne mesurer que ce qui la dépasse par le haut).
 */
export const MATHALEA_INLINE_FORMULA_RULE = `#let mathalea-formule-multiligne(corps) = {
  if type(corps) != content { return false }
  if repr(corps.func()) == "linebreak" { return true }
  if corps.has("children") { return corps.children.any(mathalea-formule-multiligne) }
  false
}
#let mathalea-formule-premiere-ligne(corps) = {
  if type(corps) != content or not corps.has("children") { return corps }
  let avant = ()
  for enfant in corps.children {
    if repr(enfant.func()) == "linebreak" { break }
    avant.push(enfant)
  }
  avant.join()
}
#show math.equation.where(block: false): formule => context {
  let temoin = 50em
  if mathalea-formule-multiligne(formule.body) {
    let premiere = math.equation(block: false, mathalea-formule-premiere-ligne(formule.body))
    let hauteur = measure([#box(height: temoin, baseline: temoin)#premiere]).height - temoin
    box(baseline: measure(formule).height - hauteur, formule)
  } else {
    box(baseline: measure([#box(height: temoin)#formule]).height - temoin, formule)
  }
}`

/**
 * Lignes insérables (fin d'exercice ou après chaque question), pour que
 * l'élève y écrive. `n` lignes espacées de `gutter` ; sans effet visuel (ni
 * espace) tant que `n` vaut 0, valeur de départ dans la palette. `style`
 * choisit le rendu : `"pointilles"` (filet pointillé, valeur d'origine),
 * `"points"` (points de conduite), `"plein"` (filet continu) ou `"vide"`
 * (espace de la même hauteur, sans trait).
 */
export const MATHALEA_WRITING_LINES_HELPER = `#let mathalea-lignes(n, gutter: 2em, style: "pointilles") = if n > 0 { block(above: 2em, below: 0.8em,
  stack(spacing: gutter, ..range(n).map(i => if style == "vide" { box(width: 100%, height: 0.6pt) } else if style == "points" { box(width: 100%, text(fill: luma(120), repeat(gap: 2pt)[.])) } else { line(length: 100%, stroke: (paint: luma(120), thickness: 0.6pt, dash: if style == "plein" { none } else { "dotted" })) }))
) }`

/**
 * Tableau « Course aux nombres » : équivalent Typst de l'environnement
 * `TableauCan` de la sortie LaTeX (voir `lib/latex/preambuleTex.ts`). Une
 * ligne par question, avec son numéro, son énoncé, la réponse à compléter
 * (`canReponseACompleter` de l'exercice) et une colonne réservée au jury.
 *
 * `enonces` et `reponses` sont deux listes de contenus de même longueur (une
 * réponse manquante laisse la cellule vide) ; les proportions des colonnes
 * reprennent celles du `colspec` de la version LaTeX. L'en-tête se répète en
 * haut de chaque page, comme le `longtblr` de LaTeX.
 *
 * Un énoncé peut être une `table.cell(rowspan: n, …)` — questions liées, qui
 * partagent un même énoncé — les lignes suivantes du groupe portant alors
 * `none` à la place de leur énoncé (équivalent du `\\SetCell[r=n]` de LaTeX).
 *
 * `reponse` règle la largeur de la colonne « Réponse » (en % du tableau, 28 par
 * défaut) : la réduire laisse plus de place aux énoncés. `repere`, une fonction
 * `dx => contenu`, place dans l'en-tête « Réponse » le repère de la palette de
 * mise en page (`dx` : demi-largeur de la cellule, pour viser le milieu de la colonne).
 *
 * `taille` réduit la police du tableau sans toucher aux figures (plafonnées en
 * pt absolus, voir `CAN_FIGURE_MAX_WIDTH_PT`) : en A5, le texte à sa taille
 * pleine écrase les repères et courbes de lecture graphique, dessinés petit —
 * `buildCanVersionContent` le rabaisse alors pour rétablir le rapport
 * texte/figure de l'A4.
 */
export const MATHALEA_CAN_TABLE_HELPER = `#let can-tableau(
  enonces,
  reponses,
  jury: true,
  entetes: ([\\#], [Énoncé], [Réponse], [Jury]),
  fond: luma(230),
  hauteur-ligne: 8pt,
  taille: 1em,
  reponse: 28,
  repere: none,
) = {
  set text(size: taille)
  // \`reponse\` : largeur de la colonne « Réponse » en % du tableau, prise sur
  // celle de l'énoncé (les colonnes « # » et « Jury » gardent la leur)
  let largeurs = (if jury { (7.5, 100 - 7.5 - 10 - reponse, reponse, 10) } else { (8, 100 - 8 - reponse, reponse) }).map(part => part * 1fr)
  // aucune ligne ne se coupe entre deux pages (comportement du \`longtblr\`
  // de la version LaTeX) : une figure serait sinon séparée de son numéro
  let cellule(corps) = if corps != none and corps.func() == table.cell { corps } else { table.cell(breakable: false, corps) }
  let cellules = ()
  for (i, enonce) in enonces.enumerate() {
    cellules.push(table.cell(fill: fond, breakable: false)[*#(i + 1)*])
    // un énoncé \`none\` est celui d'une question liée à la précédente : sa
    // cellule est déjà couverte par le \`rowspan\` de celle qui porte l'énoncé
    if enonce != none { cellules.push(cellule(enonce)) }
    cellules.push(cellule(reponses.at(i, default: [])))
    if jury { cellules.push(table.cell(breakable: false)[]) }
  }
  table(
    columns: largeurs,
    align: center + horizon,
    inset: (x: 6pt, y: hauteur-ligne),
    stroke: 0.6pt + luma(60),
    table.header(..entetes.slice(0, largeurs.len()).enumerate().map(((i, entete)) => table.cell(fill: fond)[
      // repère de la palette (éditeur seulement), au milieu de l'en-tête « Réponse »
      #if i == 2 and repere != none { place(top + left, layout(taille-cellule => context repere(taille-cellule.width / 2))) }*#entete*
    ])),
    ..cellules,
  )
}`

/**
 * Champ à compléter par l'élève (« Nom : ...... »), commun aux deux pages de
 * garde. Les pointillés occupent toute la largeur restante (`repeat`).
 */
export const MATHALEA_COVER_FIELD_HELPER = `#let mathalea-champ(intitule, largeur: 1fr) = box(width: largeur,
  grid(columns: (auto, 1fr), column-gutter: 4pt,
    [#intitule :], box(width: 1fr, repeat(gap: 2pt)[.])))`

/**
 * Page de garde des modèles « Évaluation », « Brevet des collèges » et
 * « BAC » : intitulé encadré, session, matière, durée, consignes, puis le
 * barème exercice par exercice et son total. Reprend la présentation de la
 * page de garde de la vue PDF (`ExamTemplateEngine`, `latex/LatexConfig.ts`).
 *
 * Tous les textes sont passés en arguments nommés : ils restent modifiables
 * dans l'éditeur, comme les autres réglages en tête de document.
 * - `identite` ajoute en haut les champs Nom/Prénom/Classe/Date (évaluation) ;
 * - `colonne-note` ajoute au barème une colonne vide où porter la note ;
 * - `note-fin` inscrit une mention en bas de page (« Tournez la page S.V.P. »).
 */
/**
 * Nombre de points sans unité (« 4 », « 2,5 ») : la grille de « récitation »
 * est trop serrée pour le mot « points », que `mathalea-points` y ajoute.
 * Déclaré pour tous les modèles à barème, dont il est la base.
 */
export const MATHALEA_COVER_POINTS_HELPER = `#let mathalea-points-courts(n) = {
  if n == calc.round(n) { str(calc.round(n)) } else { str(n).replace(".", ",") }
}`

export const MATHALEA_COVER_HELPER = `#let mathalea-points(n) = {
  mathalea-points-courts(n) + if calc.abs(n) >= 2 { " points" } else { " point" }
}
#let mathalea-couverture(
  titre: "",
  session: "",
  matiere: "",
  duree: "",
  consignes: (),
  bareme: (),
  identite: false,
  colonne-note: false,
  note-fin: none,
  version: none,
) = {
  if identite {
    block(width: 100%, below: 2em,
      grid(columns: (1fr, 1fr), column-gutter: 10mm, row-gutter: 1.4em,
        mathalea-champ("Nom"), mathalea-champ("Prénom"),
        mathalea-champ("Classe"), mathalea-champ("Date")))
  }
  set align(center)
  v(1.5cm)
  if titre != "" {
    block(stroke: 0.8pt + couleur, inset: (x: 10pt, y: 8pt),
      text(size: 2em, weight: "bold", fill: couleur, titre))
    v(6mm)
  }
  if version != none { text(size: 1.3em, weight: "bold", fill: couleur, version); v(6mm) }
  if session != "" { text(size: 0.95em, session); v(1.2cm) }
  if matiere != "" {
    text(size: 1.6em, weight: "bold", matiere)
    v(3mm)
    line(length: 7cm, stroke: 1pt + couleur)
    v(1cm)
  }
  if duree != "" { text(size: 1.15em, weight: "bold")[Durée de l’épreuve : #duree]; v(8mm) }
  for consigne in consignes { text(size: 1.05em, style: "italic", consigne); v(4mm) }
  if bareme.len() > 0 {
    v(1.2cm)
    let entetes = ("Exercice", "Barème") + if colonne-note { ("Note",) } else { () }
    let colonnes = (5cm, 3cm) + if colonne-note { (3cm,) } else { () }
    table(columns: colonnes, align: center + horizon, inset: 7pt,
      stroke: 0.7pt + couleur,
      ..entetes.map(entete => text(weight: "bold", entete)),
      ..bareme.enumerate().map(((i, points)) => {
        let cellules = (align(left)[Exercice #(i + 1)], mathalea-points(points))
        if colonne-note { cellules + ([],) } else { cellules }
      }).flatten())
    v(6mm)
    text(size: 1.2em, weight: "bold")[Total : #mathalea-points(bareme.fold(0, (s, p) => s + p))]
  }
  if note-fin != none and note-fin != "" { v(1fr); align(right, text(weight: "bold", note-fin)) }
  pagebreak()
}`

/**
 * En-tête « Récitation » : un bandeau compact en tête de la **même** page que
 * les exercices (pas de `pagebreak`, contrairement aux autres modèles), pour
 * les tests courts où une page de garde pleine gâcherait une feuille.
 *
 * Trois bandes : l'identification (matière et établissement à gauche, intitulé
 * au centre, durée et date à droite), puis deux colonnes — champs à remplir à
 * gauche, grille des points à droite —, puis les consignes en pleine largeur.
 *
 * `grille` détaille les points exercice par exercice (ligne « points » et
 * ligne « obtenus », dont la case Total tient lieu de note), sinon seul le
 * total est rappelé ; `note` ajoute par-dessus une case où porter la note à la main.
 * `signature` ajoute sous le prénom un champ dont l'intitulé est réglable.
 */
export const MATHALEA_COVER_RECITATION_HELPER = `#let mathalea-couverture-recitation(
  titre: "",
  matiere: "",
  etablissement: "",
  duree: "",
  date: "",
  consignes: (),
  bareme: (),
  grille: false,
  signature: true,
  signature-label: "Signature d’un responsable légal",
  note: false,
  version: none,
) = {
  let petit(corps) = text(size: 0.85em, fill: luma(80), corps)
  let trait = line(length: 100%, stroke: 0.5pt)
  let case(corps) = box(stroke: 0.6pt + luma(120), inset: (x: 8pt, y: 6pt), radius: 2pt, corps)
  let total = bareme.fold(0, (somme, points) => somme + points)
  // bandeau : identification à gauche, intitulé au centre, durée et date à droite
  grid(columns: (1fr, auto, 1fr), column-gutter: 0.8em,
    align: (left + horizon, center + horizon, right + horizon),
    stack(spacing: 0.25em, text(weight: "medium", matiere), petit(etablissement)),
    stack(spacing: 0.25em, text(size: 1.35em, weight: "bold", fill: couleur, titre),
      if version != none { text(weight: "bold", fill: couleur, version) }),
    stack(spacing: 0.25em, if duree != "" [Durée #duree], petit(date)))
  v(0.3em)
  line(length: 100%, stroke: 0.7pt + couleur)
  v(0.6em)
  // champs à remplir : traits du nom et du prénom de 6 cm — de quoi écrire un
  // nom, et la place reste à la grille —, mais jamais plus larges que leur
  // colonne (une grille à beaucoup d'exercices la rétrécit, les traits la
  // suivent). La signature, elle, a besoin de hauteur sous son intitulé (pas
  // de trait : on signe dans l'espace libre)
  let trait-champ = layout(size => line(length: calc.min(6cm, size.width), stroke: 0.5pt))
  let champs = grid(columns: (auto, 1fr), column-gutter: 6pt, row-gutter: 1.7em, align: bottom,
    [Nom :], trait-champ,
    [Prénom :], trait-champ)
  // grille sur sa propre ligne : les champs ont toute la largeur, nom et
  // prénom tiennent donc côte à côte
  let champs-en-ligne = grid(columns: (auto, 1fr, auto, 1fr),
    column-gutter: (6pt, 1.6em, 6pt), align: bottom,
    [Nom :], trait-champ,
    [Prénom :], trait-champ)
  let intitule-signature = [#signature-label :]
  let identite = {
    champs
    if signature {
      v(0.9em)
      intitule-signature
      v(1.6em)
    }
  }
  // colonne de droite : grille des points (ou son seul total), et la case de
  // la note si elle est demandée
  let points = if grille and bareme.len() > 0 {
    table(
      columns: (auto,) + (1.5cm,) * bareme.len() + (1.8cm,),
      align: center + horizon,
      inset: (x: 5pt, y: 4.5pt),
      stroke: (x, y) => (
        left: if x == 0 { none } else { 0.4pt + luma(180) },
        right: none,
        top: if y == 0 { 0.7pt + luma(90) } else { 0.4pt + luma(180) },
        bottom: 0.7pt + luma(90),
      ),
      table.header(
        table.cell(align: left)[#petit[EXERCICE]],
        ..range(bareme.len()).map(i => [*#(i + 1)*]),
        [*Total*],
      ),
      table.cell(align: left)[#petit[POINTS]],
      ..bareme.map(points => [#mathalea-points-courts(points)]),
      [*#mathalea-points-courts(total)*],
      table.cell(align: left, inset: (x: 5pt, y: 10pt))[#petit[OBTENUS]],
      ..range(bareme.len() + 1).map(_ => table.cell(inset: (x: 5pt, y: 10pt))[]),
    )
  } else if bareme.len() > 0 {
    case[Total : #box(width: 1.4cm) / #mathalea-points-courts(total)]
  }
  let case-note = if note {
    // assez haute pour y écrire à la main
    case[#block(height: 2.8em, above: 0.3em, below: 0.3em)[Note : #box(width: 3cm)]]
  }
  let liste-consignes = if consignes.len() > 0 {
    set list(marker: text(fill: couleur)[•], indent: 0.4em, body-indent: 0.45em, spacing: 0.35em)
    list(..consignes)
  }
  layout(size => {
    let largeur = if points == none { 0pt } else { measure(points).width }
    // grille trop large pour laisser de quoi écrire à côté : elle prend sa
    // propre ligne, sous les champs
    let pleine-ligne = largeur > size.width * 0.6
    // sans signature, une grille sur sa propre ligne peut partager cette
    // ligne avec la note tant que leurs largeurs naturelles tiennent ensemble
    let note-avec-points = (
      pleine-ligne
        and not signature
        and points != none
        and case-note != none
        and largeur + measure(case-note).width + 20pt <= size.width
    )
    // sinon, la note se pose à droite des consignes — dans le blanc laissé
    // sous la grille — quand leur longueur naturelle lui laisse la place.
    // le test not note-avec-points est indispensable : les deux emplacements
    // sont compatibles (grille pleine ligne, sans signature, tout tenant en
    // largeur) et la note serait alors dessinée deux fois.
    let note-avec-consignes = (
      case-note != none
        and liste-consignes != none
        and not note-avec-points
        and (not pleine-ligne or not signature)
        and measure(liste-consignes).width + measure(case-note).width + 20pt <= size.width
    )
    if points != none or case-note != none {
      if pleine-ligne {
        champs-en-ligne
        if note-avec-points {
          v(0.9em)
          grid(columns: (1fr, auto), column-gutter: 1.2em, align: (left + top, right + top),
            points, case-note)
        } else {
          // la note remplit le blanc à droite de la signature plutôt que de
          // s'ajouter sous la grille ; sa hauteur donne la place où signer
          if signature or (case-note != none and not note-avec-consignes) {
            v(0.9em)
            grid(columns: (1fr, auto), column-gutter: 1.2em, align: (left + top, right + top),
              if signature { intitule-signature } else { [] },
              if case-note != none { case-note } else { [] })
            if case-note == none { v(1.6em) }
          }
          v(0.5em)
          if points != none {
            // réduite si elle déborde encore la largeur du texte (sinon Typst
            // comprime les colonnes jusqu'à faire chevaucher leurs textes)
            if largeur > size.width {
              box(scale(size.width / largeur * 100%, origin: top + left, reflow: true, points))
            } else {
              points
            }
          }
        }
      } else {
        // grille à droite des champs ; la note sous elle et alignée sur son
        // bord droit, sauf si elle accompagne les consignes
        grid(columns: (1fr, auto), column-gutter: 1.6em, align: (left + top, right + top),
          identite,
          if note-avec-consignes { points } else {
            stack(spacing: 0.6em,
              ..(points, if case-note != none { align(right, case-note) }).filter(bloc => bloc != none))
          })
      }
    } else {
      identite
    }
    // consignes en pleine largeur, sous les deux colonnes : une par ligne,
    // sans le retour à la ligne que leur imposait la colonne des champs
    if liste-consignes != none {
      v(0.7em)
      if note-avec-consignes {
        grid(columns: (1fr, auto), column-gutter: 1.2em, align: (left + top, right + top),
          liste-consignes, case-note)
      } else {
        liste-consignes
      }
    }
  })
  v(0.8em)
}`

/**
 * Page de garde « Course aux nombres » : en-tête d'identité avec la case du
 * score sur le total des questions, consignes de passation et logo (le logo
 * porte déjà le nom du sujet, pas de second titre texte). Reprend
 * `\\pageDeGardeCan` de la sortie LaTeX (`lib/latex/preambuleTex.ts`) sans
 * les logos des académies ni de l'APMEP.
 *
 * La durée et le nombre de questions produisent leurs propres consignes (le
 * décompte suit la fiche) ; `consignes` porte les suivantes, libres.
 */
export const MATHALEA_COVER_CAN_HELPER = `#let mathalea-couverture-can(
  duree: "",
  nb-questions: 0,
  consignes: (),
  qr-code: none,
  version: none,
) = {
  let coche(corps) = {
    grid(columns: (auto, 1fr), column-gutter: 6pt,
      text(weight: "bold")[✓], text(style: "italic", corps))
    v(2.5mm)
  }
  if version != none { align(right, text(size: 1.15em, weight: "bold", fill: couleur, version)); v(2mm) }
  line(length: 100%, stroke: 0.7pt)
  v(5mm)
  grid(columns: (1fr, 1fr), column-gutter: 10mm,
    mathalea-champ("Nom"), mathalea-champ("Prénom"))
  v(7mm)
  grid(columns: (1fr, auto), column-gutter: 10mm, align: horizon,
    mathalea-champ("Classe"),
    block(stroke: 0.7pt, inset: 10pt,
      text(size: 1.15em)[Score : #box(width: 1.6cm, repeat(gap: 2pt)[.]) / #nb-questions]))
  v(5mm)
  line(length: 100%, stroke: 0.7pt)
  v(4mm)
  if duree != "" { coche[Durée : #duree] }
  if nb-questions > 0 { coche[L’épreuve comporte #nb-questions questions.] }
  for consigne in consignes { coche(consigne) }
  v(1.5mm)
  line(length: 100%, stroke: 0.7pt)
  // espacement élastique (plutôt qu'une longueur fixe) : le contenu
  // au-dessus varie déjà (0 à plusieurs consignes) et le format de page
  // aussi (A4/A5) — un espacement fixe y débordait sur une 2e page en A5,
  // trop court pour la somme de tout le contenu fixe.
  v(1fr)
  align(center, mathalea-logo)
  v(1fr)
  place(top + right, qr-code)
  pagebreak()
}`

/**
 * Saut de page insérable entre deux exercices, ou avant une correction :
 * `#pagebreak` est interdit dans un conteneur (`columns`), la ligne ferme
 * donc le bloc `en-colonnes` courant, saute la page au niveau du document,
 * puis rouvre le bloc. Fonctionne aussi en une colonne (`en-colonnes` rend
 * alors son corps tel quel).
 */
export const PAGE_BREAK_SNIPPET = '] #pagebreak(weak: true) #en-colonnes['

/** Saut de colonne insérable entre deux exercices ou corrections (page suivante en 1 colonne) */
export const COLUMN_BREAK_SNIPPET = '#colbreak(weak: true)'

/**
 * Marque le début d'un bloc local en deux colonnes.
 * Le marqueur est volontairement indépendant de la syntaxe Typst :
 * il sera transformé lors de la génération en un bloc `grid` local.
 *  Exemple :
 * #ex1()
 * // mathalea:multicol-start
 * #ex2()
 * #ex3()
 * // mathalea:multicol-end
 * #ex4()
 * devient :
 * #ex1()
 * #grid(
 *   columns: (1fr, 1fr),
 *   gutter: 1cm,
 *   [
 *     #ex2()
 *   ],
 *   [
 *     #ex3()
 *   ],
 * )
 * #ex4()
 */

export const MULTICOL_START_SNIPPET = `// mathalea:multicol-start`

/**
 * Marque la fin d'un bloc local en deux colonnes commencé par
 * `// mathalea:multicol-start`.
 *
 *  Le contenu compris entre les deux marqueurs sera regroupé dans * un `grid` à deux colonnes lors de la génération Typst. */
export const MULTICOL_END_SNIPPET = `// mathalea:multicol-end`

/** Colonnes par défaut des blocs #tasks : taskize choisit jusqu'à 4 colonnes uniformes. */
const DEFAULT_TASKS_COLUMNS = '"auto-fit"'

/** Littéral Typst du nombre de colonnes par défaut des listes de questions (réglage du document) */
function questionsColumnsLiteral(
  columns: TypstDocumentOptions['questionsColumns'],
): string {
  return columns === 'auto' ? DEFAULT_TASKS_COLUMNS : String(columns)
}

/**
 * Étiquette de numérotation (littéral Typst) du style choisi dans les
 * réglages du document ou dans la palette de mise en page (réglage par
 * exercice) — voir `boldableLabel` pour sa mise en gras.
 */
export function questionNumberingLabel(style: QuestionNumberingStyle): string {
  return style === 'aucun' ? 'none' : `"${style}"`
}

/**
 * Sens inverse de `questionNumberingLabel` : reconnaît un style connu dans un
 * littéral Typst relu dans le code (`#let exN-numerotation = ...`), pour
 * l'affichage dans la palette de mise en page et la modale de réglages de
 * l'exercice. `undefined` pour un littéral qui ne correspond à aucun style
 * proposé (retouche manuelle du code) : l'appelant retombe alors sur le
 * réglage du document.
 */
export function parseNumberingLiteral(
  literal: string,
): QuestionNumberingStyle | undefined {
  return QUESTION_NUMBERING_STYLES.find(
    (style) => questionNumberingLabel(style) === literal,
  )
}

/**
 * Préfixe des variables de mise en page de la liste des corrections du mode
 * « Course aux nombres ». Elle est unique pour toute la fiche (un seul tableau,
 * une seule liste de réponses) : le numéro 0, qu'aucun exercice ne porte, la
 * distingue des listes de questions (`ex1`, `ex1-corr`…) tout en restant
 * reconnue par la palette de l'aperçu et par `harvestCarryOver`.
 */
const CAN_CORRECTIONS_PREFIX = 'ex0-corr'

/** Largeur par défaut (en %) de la colonne « Réponse » du tableau « Course aux nombres » */
export const CAN_ANSWER_WIDTH_DEFAULT = 28

/**
 * Réglages repris du code courant lors d'une régénération : les ajustements
 * faits via la palette de mise en page (colonnes/espacement des questions par
 * exercice, textes et sections insérés entre les exercices) survivent ainsi
 * aux changements de réglages et aux « Nouvelles données ».
 */
export interface TypstCarryOver {
  /** Ajustements propres aux sujets supplémentaires, indexés à partir de 1. */
  versions?: Record<number, TypstCarryOver>
  /**
   * Valeurs de `#let exN-colonnes`/`#let exN-gutter`/`#let exN-numerotation`
   * divergeant des défauts, par préfixe d'exercice (`ex1`). Expressions
   * Typst brutes (`numbering` n'existe pas pour un préfixe `-qcm`, dont la
   * numérotation des propositions n'est pas réglable).
   */
  tasksLayout?: Record<
    string,
    { columns?: string; gutter?: string; numbering?: string }
  >
  /**
   * Lignes de code Typst insérées entre les exercices (sans le marqueur
   * `// mathalea:insertion`), par numéro de l'exercice qui les précède.
   */
  insertions?: Record<number, string[]>
  /**
   * Numéros (1-based) des exercices fusionnés avec le précédent (bouton de
   * la palette, indépendant de l'option globale `mergeExercises`) : ils
   * rejoignent le groupe `exo.with(...)` de leur prédécesseur (un seul
   * titre pour le groupe) et leurs questions continuent la numérotation.
   */
  merges?: number[]
  /**
   * Numéros (1-based) des exercices groupés en colonnes avec le suivant
   * (grid manuelle à 2 colonnes), par opposition au flux normal
   * en-colonnes. Incompatible avec la fusion sur le même gap.
   */
  multicolGroups?: number[]
  /** Exercices dont la correction est affichée sous l'énoncé (exemples corrigés). */
  workedExamples?: number[]
  /** Zoom de chaque figure (`#let fig-N-zoom = ...`), par numéro de figure */
  figureZoom?: Record<number, number>
  /**
   * Alignement de chaque figure (`#let fig-N-align = ...`), par numéro de
   * figure. Expression Typst brute (`left`, `center` ou `right`).
   */
  figureAlign?: Record<number, string>
  /** Coupures des images par exercice, indépendantes pour chaque sujet et partie. */
  imageCuts?: Record<number, ExerciseImageCuts>
  /**
   * Zoom d'un exercice statique sans source `.typ` (`#let exo-N-zoom = ...`),
   * par numéro d'exercice — contrairement à `figureZoom` (numérotation
   * globale des figures), suit l'exercice si on le déplace.
   */
  exerciseZoom?: Record<number, number>
  /**
   * Zoom d'une correction statique sans source `_cor.typ`
   * (`#let exo-N-corr-zoom = ...`), par numéro d'exercice — indépendant de
   * `exerciseZoom` (l'énoncé peut avoir sa propre source `.typ` sans que la
   * correction en ait une, ou l'inverse).
   */
  exerciseCorrectionZoom?: Record<number, number>
  /**
   * Code Typst saisi à la main (modale d'édition de la palette) qui remplace
   * l'énoncé généré d'un exercice, par numéro d'exercice. Désactive le QR-code
   * et le décompte de questions (numérotation continue en cas de fusion) de
   * cet exercice, dont le contenu échappe désormais à la génération.
   */
  codeOverrides?: Record<number, string>
  /**
   * Code Typst saisi à la main (modale d'édition de la palette) qui remplace
   * la correction générée d'un exercice, par numéro d'exercice. Sans effet
   * si l'exercice n'a pas de correction (rien à remplacer).
   */
  codeOverridesCorrection?: Record<number, string>
  /**
   * Code Typst saisi à la main qui remplace l'énoncé généré d'une ligne du
   * tableau « Course aux nombres », par numéro de ligne (1-based, celui de
   * la colonne « # » du tableau — toutes les questions de tous les exercices
   * mises bout à bout, pas un numéro d'exercice). Pendant, à l'échelle d'une
   * ligne, de `codeOverrides`.
   */
  codeOverridesCan?: Record<number, string>
  /**
   * Largeur de la colonne « Réponse » du tableau « Course aux nombres »
   * (`#let can-reponse = ...`), en % de la largeur du tableau ; absente tant
   * qu'elle vaut `CAN_ANSWER_WIDTH_DEFAULT`.
   */
  canAnswerWidth?: number
  /**
   * Code Typst saisi à la main qui remplace la réponse à compléter générée
   * d'une ligne du tableau « Course aux nombres », par numéro de ligne.
   * Pendant de `codeOverridesCan` pour la colonne « Réponse ».
   */
  codeOverridesCanReponse?: Record<number, string>
  /**
   * Lignes de code Typst insérées juste avant la correction d'un exercice
   * (sans le marqueur `// mathalea:insertion-corr`), par numéro d'exercice.
   * Pendant de `insertions` pour la correction.
   */
  insertionsCorrection?: Record<number, string[]>
  /**
   * Lignes en pointillés (pour que l'élève y écrive) réglées via la palette,
   * par numéro d'exercice (1-based) : après le corps entier de l'exercice,
   * ou après chaque question (y compris la dernière). Ne s'applique jamais
   * à la correction.
   */
  writingLines?: Record<number, WritingLinesSetting>
  /**
   * Titres d'exercice modifiés dans la palette, par numéro d'exercice
   * (`#let exo-N-titre = ... // mathalea:titre-perso`). Une chaîne vide
   * retire le titre de cet exercice.
   */
  exerciseTitles?: Record<number, string>
}

/**
 * Stabilise les sauts structurels de la palette (espaces `exo` et `corr`)
 * avant de construire le document. Un saut de page/colonne est un
 * interrupteur, pas une insertion libre : il ne doit apparaître qu'une fois
 * par repère. Après le dernier exercice, le repère `exo` n'a aucun contenu
 * suivant à déplacer et peut être écarté (sans équivalent côté `corr`, qui
 * n'a pas de repère de fin). Les textes et sections restent, eux, inchangés
 * et peuvent être dupliqués volontairement.
 */
function stabilizeStructuralInsertions(
  carryOver: TypstCarryOver,
  exerciseCount: number,
): TypstCarryOver {
  const dedupe = (
    record: Record<number, string[]> | undefined,
    isDiscarded: (num: number) => boolean,
  ): Record<number, string[]> | undefined => {
    if (record == null) return undefined
    const result: Record<number, string[]> = {}
    for (const [key, lines] of Object.entries(record)) {
      const num = Number(key)
      const structuralInsertions = new Set<string>()
      const stabilized = lines.filter((line) => {
        const isStructural =
          line === PAGE_BREAK_SNIPPET || line === COLUMN_BREAK_SNIPPET
        if (!isStructural) return true
        if (isDiscarded(num) || structuralInsertions.has(line)) return false
        structuralInsertions.add(line)
        return true
      })
      if (stabilized.length > 0) result[num] = stabilized
    }
    return Object.keys(result).length > 0 ? result : undefined
  }

  return {
    ...carryOver,
    insertions: dedupe(carryOver.insertions, (gap) => gap >= exerciseCount),
    insertionsCorrection: dedupe(carryOver.insertionsCorrection, () => false),
  }
}

/** Repère de début d'une surcharge de code (voir `codeOverrides`) */
const CODE_OVERRIDE_START = /^([ \t]*)\/\/ mathalea:override\((\d+)\)\s*$/
/** Repère de fin d'une surcharge de code */
const CODE_OVERRIDE_END = /^[ \t]*\/\/ mathalea:override-end\s*$/
/** Repère de début d'une surcharge de code de correction (voir `codeOverridesCorrection`) */
const CODE_OVERRIDE_CORRECTION_START =
  /^([ \t]*)\/\/ mathalea:override-corr\((\d+)\)\s*$/
/** Repère de fin d'une surcharge de code de correction */
const CODE_OVERRIDE_CORRECTION_END =
  /^[ \t]*\/\/ mathalea:override-corr-end\s*$/
/** Repère de début d'une surcharge d'énoncé de ligne « Course aux nombres » (voir `codeOverridesCan`) */
const CODE_OVERRIDE_CAN_START =
  /^([ \t]*)\/\/ mathalea:override-can\((\d+)\)\s*$/
/**
 * Repère de fin d'une surcharge d'énoncé de ligne « Course aux nombres ».
 * Contrairement à `CODE_OVERRIDE_END` (toujours seul sur sa ligne), cette
 * ligne peut être suivie de `],` : elle termine un élément du tableau passé
 * à `#can-tableau(...)` (voir `typstContentArrayArgument`), qui colle la
 * fermeture du littéral de contenu directement après la dernière ligne
 * plutôt que de l'émettre sur sa propre ligne — le repère n'ancre donc que
 * le début de la ligne, pas sa fin.
 */
const CODE_OVERRIDE_CAN_END = /^[ \t]*\/\/ mathalea:override-can-end/
/**
 * Repère de début d'une surcharge de réponse de ligne « Course aux nombres »
 * (voir `codeOverridesCanReponse`). Contrairement aux autres repères de
 * début, celui-ci peut être précédé d'un `[` collé : la cellule « Réponse »
 * n'a pas de repère `mathalea-anchor` avant elle (seule la cellule « Énoncé »
 * en porte), donc quand elle est surchargée, ce repère se retrouve en toute
 * première ligne de l'élément du tableau — juste après le `[` que
 * `typstContentArrayArgument` colle au début de chaque élément.
 */
const CODE_OVERRIDE_CAN_REPONSE_START =
  /^([ \t]*)\[?\/\/ mathalea:override-can-rep\((\d+)\)\s*$/
/** Repère de fin d'une surcharge de réponse de ligne « Course aux nombres » (voir `CODE_OVERRIDE_CAN_END`) */
const CODE_OVERRIDE_CAN_REPONSE_END =
  /^[ \t]*\/\/ mathalea:override-can-rep-end/

/** Enveloppe le code saisi par le professeur entre ses repères, pour l'exercice `num` */
function wrapCodeOverride(num: number, code: string): string {
  return `// mathalea:override(${num})\n${code}\n// mathalea:override-end`
}

/** Enveloppe le code de correction saisi par le professeur entre ses repères */
function wrapCodeOverrideCorrection(num: number, code: string): string {
  return `// mathalea:override-corr(${num})\n${code}\n// mathalea:override-corr-end`
}

/**
 * Enveloppe l'énoncé saisi par le professeur pour la ligne `num` du tableau
 * « Course aux nombres ». Contrairement à `wrapCodeOverride`, se termine par
 * un saut de ligne après le repère de fin : cette valeur est un élément du
 * tableau passé à `#can-tableau(...)`, dont `typstContentArrayArgument`
 * colle `],` directement après la dernière ligne (voir `CODE_OVERRIDE_CAN_END`)
 * — sans ce saut de ligne, `],` se retrouverait sur la ligne du repère,
 * commentée avec lui (`//`), et l'élément ne se refermerait jamais.
 */
function wrapCodeOverrideCan(num: number, code: string): string {
  return `// mathalea:override-can(${num})\n${code}\n// mathalea:override-can-end\n`
}

/** Enveloppe la réponse saisie par le professeur pour la ligne `num` du tableau « Course aux nombres » (voir `wrapCodeOverrideCan`) */
function wrapCodeOverrideCanReponse(num: number, code: string): string {
  return `// mathalea:override-can-rep(${num})\n${code}\n// mathalea:override-can-rep-end\n`
}

/**
 * Retire l'appel à `mathalea-anchor` du bloc figure (`MATHALEA_FIGURE_BLOCK_HELPER`) :
 * ce repère (contrôle de zoom de la palette de mise en page) n'a pas de sens
 * en mode export, où `mathalea-anchor` n'est jamais défini.
 */
function stripAnchorCall(helper: string): string {
  return helper.replace(/\n\s*mathalea-anchor\([^\n]*\)\n/, '\n')
}

/**
 * Détecte, dans un ensemble de lignes de code Typst déjà généré, les aides
 * dont il a besoin (imports/helpers à inclure) : partagé par
 * `buildTypstDocument` (document complet) et `buildStandaloneExerciseCode`
 * (fragment autonome d'un seul exercice, pour la modale d'édition).
 */
export function detectUsedFeatures(lines: string[]): {
  usesMathaleaFigure: boolean
  usesTasks: boolean
  usesQcm: boolean
  usesSchema: boolean
  usesWritingLines: boolean
  usesCetz: boolean
  usesCtz: boolean
  usesCetzPlotChart: boolean
  usesVarTable: boolean
} {
  return {
    usesMathaleaFigure: lines.some((line) => line.includes('mathalea-figure(')),
    usesTasks: lines.some((line) => line.includes('#tasks(')),
    usesQcm: lines.some((line) => line.includes('qcm-')),
    usesSchema: lines.some((line) => line.includes('mathalea-schema-span')),
    usesWritingLines: lines.some((line) => line.includes('#mathalea-lignes(')),
    usesCetz: lines.some((line) => line.includes('cetz.')),
    // paquet `ctz-euclide` des figures d'annales rédigées à la main (voir
    // CTZ_EUCLIDE_IMPORT) ; `ctz-` n'est un sous-mot ni de `cetz.` ni de `cetz-plot`
    usesCtz: lines.some((line) => line.includes('ctz-')),
    usesCetzPlotChart: lines.some((line) => line.includes('chart.')),
    usesVarTable: lines.some((line) => line.includes('#tabvar(')),
  }
}

/**
 * Préfixes (`ex1-qcm`, `ex2-corr-qcm`) des QCM dont au moins une proposition
 * est une figure, repérés par le marqueur posé sur leur `#tasks(...)` par
 * `qcmToTypst`. Leur valeur par défaut est 1 colonne, pas `"auto-fit"`.
 */
function qcmFigureTasksPrefixes(code: string | string[]): Set<string> {
  const lines = Array.isArray(code) ? code : code.split('\n')
  return new Set(
    lines
      .filter((line) => line.includes(QCM_FIGURES_MARKER))
      .flatMap((line) => [
        ...line.matchAll(/#tasks\(columns: (ex\d+(?:-corr)?-qcm)-colonnes/g),
      ])
      .map((match) => match[1]),
  )
}

/**
 * Nombre de colonnes par défaut demandé par l'exercice pour ses propositions
 * de QCM (`typstColumns` de `propositionsQcm`), par préfixe (`ex1-qcm`), lu
 * dans le marqueur `// mathalea:qcm-colonnes(N)` posé par `qcmToTypst`. Il
 * remplace le défaut tiré du contenu (`qcmFigureTasksPrefixes`).
 */
function qcmRequestedColumns(code: string | string[]): Map<string, string> {
  const lines = Array.isArray(code) ? code : code.split('\n')
  const requested = new Map<string, string>()
  for (const line of lines) {
    const match = line.match(
      new RegExp(
        `#tasks\\(columns: (ex\\d+(?:-corr)?-qcm)-colonnes.*${QCM_COLUMNS_MARKER}\\((\\d+)\\)`,
      ),
    )
    if (match != null) requested.set(match[1], match[2])
  }
  return requested
}

/**
 * Alignement par défaut demandé par l'exercice pour certaines figures
 * (`typstFigureAlign` de `propositionsQcm`), par numéro de figure, lu dans
 * l'argument `default-align` de leur appel `mathalea-figure-block`. Une figure
 * absente de la table est centrée.
 */
function figureDefaultAligns(code: string | string[]): Map<number, string> {
  const text = Array.isArray(code) ? code.join('\n') : code
  const aligns = new Map<number, string>()
  for (const match of text.matchAll(
    /#mathalea-figure-block\(\d+, fig-(\d+)-align, fig-\d+-zoom, default-align: (left|center|right),/g,
  )) {
    aligns.set(Number(match[1]), match[2])
  }
  return aligns
}

/**
 * Marqueur émis en tête d'un `#tasks(...)[...]` (mode aperçu uniquement)
 * dont au moins une question contient une figure `vraieGrandeur` (voir
 * `mathalea2d.ts`) — posé par `exerciseBody`, repéré par
 * `trueSizeFigureTasksPrefixes`.
 */
const TRUE_SIZE_FIGURE_MARKER = '// mathalea:vraie-grandeur'

/**
 * Marqueur posé sur une liste de questions dont les items contiennent eux-mêmes
 * une grille `tasks` (notamment plusieurs QCM). `taskize` ne peut pas choisir
 * ses colonnes automatiquement dans cette configuration imbriquée.
 */
const NESTED_TASKS_MARKER = '// mathalea:taches-imbriquees'

// Éviter les mesures auto-fit répétées de démonstrations en plusieurs
// paragraphes : elles peuvent faire planter le compilateur WebAssembly.
const PARAGRAPH_TASKS_MARKER = '// mathalea:questions-paragraphes'

/**
 * Préfixes (`ex1`, `ex2-corr`...) des exercices dont au moins une question
 * contient une figure `vraieGrandeur`, repérés au marqueur
 * `TRUE_SIZE_FIGURE_MARKER`. Une telle figure ne se réduit jamais pour tenir
 * dans une colonne plus étroite (`force-true-size`, voir
 * `mathalea-figure-block`) : sans une seule colonne par défaut, elle
 * empiéterait sur la question voisine dès que l'exercice en a plusieurs — le
 * professeur garde la main s'il en choisit davantage depuis la palette,
 * comme pour les QCM à figures ci-dessous.
 */
function trueSizeFigureTasksPrefixes(code: string | string[]): Set<string> {
  const lines = Array.isArray(code) ? code : code.split('\n')
  return new Set(
    lines
      .filter((line) => line.includes(TRUE_SIZE_FIGURE_MARKER))
      .flatMap((line) => [
        ...line.matchAll(/#tasks\(columns: (ex\d+(?:-corr)?)-colonnes/g),
      ])
      .map((match) => match[1]),
  )
}

/** Listes nécessitant une colonne par défaut (grilles imbriquées ou paragraphes). */
function singleColumnContentTasksPrefixes(
  code: string | string[],
): Set<string> {
  const lines = Array.isArray(code) ? code : code.split('\n')
  return new Set(
    lines
      .filter(
        (line) =>
          line.includes(NESTED_TASKS_MARKER) ||
          line.includes(PARAGRAPH_TASKS_MARKER),
      )
      .flatMap((line) => [
        ...line.matchAll(/#tasks\(columns: (ex\d+(?:-corr)?)-colonnes/g),
      ])
      .map((match) => match[1]),
  )
}

/**
 * Préfixes (`ex1`, `ex2`...) des exercices dont les lignes de réponse sont
 * posées après chaque question, repérés au marqueur émis par
 * `writingLinesCall`. Ces listes-là sont déclarées à une colonne par défaut :
 * réparties sur plusieurs colonnes, les lignes se réduisent à des tronçons de
 * un ou deux centimètres, sur lesquels l'élève ne peut rien écrire. Le
 * professeur garde la main — un nombre de colonnes choisi dans la palette
 * l'emporte, ici comme pour les QCM à figures.
 */
function perQuestionLinesTasksPrefixes(code: string | string[]): Set<string> {
  const lines = Array.isArray(code) ? code : code.split('\n')
  return new Set(
    lines
      .flatMap((line) => [
        ...line.matchAll(/\/\/ mathalea:lignes-apres\((\d+)\)/g),
      ])
      .map((match) => `ex${match[1]}`),
  )
}

/** Les brouillons utilisent les numéros locaux des figures du sujet. */
function offsetOverrideFigures(
  carry: TypstCarryOver,
  offset: number,
): TypstCarryOver {
  const result = { ...carry }
  for (const key of [
    'codeOverrides',
    'codeOverridesCorrection',
    'codeOverridesCan',
    'codeOverridesCanReponse',
  ] as const) {
    if (carry[key] != null)
      result[key] = Object.fromEntries(
        Object.entries(carry[key]).map(([num, code]) => [
          num,
          code.replace(/\bfig-(\d+)\b/g, (_, n) => `fig-${Number(n) + offset}`),
        ]),
      )
  }
  return result
}

/** Extrait du code Typst courant les réglages de la palette à conserver */
/** Masque les autres sujets sans déplacer les positions dans CodeMirror. */
export function subjectEditorCode(code: string, version: number): string {
  let active: number | null = null
  return code
    .split('\n')
    .map((line) => {
      const marker = /^\/\/ mathalea:(?:sujet|banque)\((\d+)\)\s*$/.exec(line)
      if (marker != null) active = Number(marker[1])
      if (line === '// mathalea:banque-fin') active = null
      return active == null || active === version
        ? line
        : line.replace(/[^\r]/g, ' ')
    })
    .join('\n')
}

/** Un groupe fusionné ne reprend pas le titre de son premier membre. */
export function defaultExerciseTitle(
  num: number,
  title: string,
  merges: number[] = [],
): string {
  return merges.includes(num + 1) ? '' : title
}

/**
 * Ligne `#let exo-N-titre = ...` du préambule : le titre par défaut de
 * l'exercice, ou le titre saisi dans la palette (`custom`, marqué pour
 * survivre à la régénération ; une chaîne vide retire le titre).
 */
export function exerciseTitleLine(
  num: number,
  title: string,
  custom?: string,
): string {
  if (custom != null) {
    const value =
      custom === ''
        ? 'none'
        : `"${custom.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    return `#let exo-${num}-titre = ${value} // mathalea:titre-perso`
  }
  return `#let exo-${num}-titre = ${title ? `[${htmlToTypst(title)}]` : 'none'}`
}

/**
 * Points de chaque exercice quand la fiche les affiche
 * (`showExercisePoints`), `null` sinon. Ce sont ceux du barème de la page de
 * garde tant qu'il suit la fiche un pour un ; à défaut, `defaultPoints`
 * (un point par question, comme le barème proposé).
 */
export function exercisePoints(
  defaultPoints: number[],
  options: Pick<
    TypstDocumentOptions,
    'showExercisePoints' | 'mergeExercises' | 'canMode' | 'coverPage'
  >,
): number[] | null {
  if (!options.showExercisePoints || options.mergeExercises || options.canMode)
    return null
  const bareme = options.coverPage?.bareme ?? []
  return defaultPoints.map((points, k) =>
    bareme.length === defaultPoints.length && Number.isFinite(bareme[k])
      ? bareme[k]
      : points,
  )
}

/** Un point par question : points d'un exercice hors barème réglé */
function defaultExercisePoints(exercises: TypstExerciseInput[]): number[] {
  return exercises.map((exercise) => Math.max(1, exercise.questions.length))
}

export function harvestCarryOver(code: string): TypstCarryOver {
  const versions = [...code.matchAll(/^\/\/ mathalea:sujet\((\d+)\)/gm)]
    .map((match) => Number(match[1]))
    .filter((version) => version > 0)
  const primary = harvestSubjectCarryOver(
    subjectEditorCode(code, 0),
    versions.length > 0,
  )
  if (versions.length > 0)
    primary.versions = Object.fromEntries(
      versions.map((version) => {
        const selected = subjectEditorCode(code, version)
        const offset = Number(
          /^\/\/ mathalea:figures-offset\((\d+)\)/m.exec(selected)?.[1] ?? 0,
        )
        return [
          version,
          offsetOverrideFigures(harvestSubjectCarryOver(selected), -offset),
        ]
      }),
    )
  return primary
}

/**
 * `keepFigureDefaults` : fiche à plusieurs sujets, où une figure d'un sujet
 * B, C... réglée à part porte une valeur au lieu du renvoi vers celle du
 * sujet A (`#let fig-5-zoom = fig-1-zoom`) ; cette valeur est à conserver
 * même si c'est celle par défaut.
 */
function harvestSubjectCarryOver(
  code: string,
  keepFigureDefaults = false,
): TypstCarryOver {
  const tasksLayout: Record<
    string,
    { columns?: string; gutter?: string; numbering?: string }
  > = {}
  // un QCM à figures est déclaré à 1 colonne par défaut (voir `qcmHasFigure`) :
  // cette valeur-là n'est pas un réglage du professeur et ne doit pas être
  // figée dans le carry-over, sans quoi le choix par contenu ne s'appliquerait
  // qu'à la toute première génération
  const qcmFigurePrefixes = qcmFigureTasksPrefixes(code)
  const qcmRequested = qcmRequestedColumns(code)
  const perQuestionLinesPrefixes = perQuestionLinesTasksPrefixes(code)
  const trueSizeFigurePrefixes = trueSizeFigureTasksPrefixes(code)
  const nestedTaskPrefixes = singleColumnContentTasksPrefixes(code)
  for (const match of code.matchAll(
    /^#let (ex\d+(?:-corr)?(?:-qcm)?)-colonnes = (.+?)\s*$/gm,
  )) {
    // les propositions de QCM ont leur propre défaut, indépendant du réglage
    // « Colonnes des questions » du document (voir la boucle de
    // `buildTypstDocument` qui déclare `#let exN-qcm-colonnes`)
    const defaultColumns =
      qcmRequested.get(match[1]) ??
      (qcmFigurePrefixes.has(match[1]) ||
      perQuestionLinesPrefixes.has(match[1]) ||
      trueSizeFigurePrefixes.has(match[1]) ||
      nestedTaskPrefixes.has(match[1])
        ? '1'
        : match[1].endsWith('-qcm')
          ? DEFAULT_TASKS_COLUMNS
          : 'colonnes-questions')
    if (match[2] !== defaultColumns) {
      tasksLayout[match[1]] = { ...tasksLayout[match[1]], columns: match[2] }
    }
  }
  for (const match of code.matchAll(
    /^#let (ex\d+(?:-corr)?(?:-qcm)?)-gutter = (.+?)\s*$/gm,
  )) {
    if (match[2] !== 'interligne-questions') {
      tasksLayout[match[1]] = { ...tasksLayout[match[1]], gutter: match[2] }
    }
  }
  // pas de variante `-qcm` : la numérotation des propositions de QCM
  // (« A) », voir `qcmToTypst`) n'est pas réglable
  for (const match of code.matchAll(
    /^#let (ex\d+(?:-corr)?)-numerotation = (.+?)\s*$/gm,
  )) {
    if (match[2] !== 'numerotation-questions') {
      tasksLayout[match[1]] = { ...tasksLayout[match[1]], numbering: match[2] }
    }
  }
  // une insertion suit le repère de gap de l'exercice qui la précède : on
  // associe chaque ligne marquée au dernier repère rencontré. Une insertion
  // de correction suit de la même façon le repère `corr` de l'exercice
  // qu'elle précède (voir `insertionsCorrection`) — repères et marqueurs
  // distincts, jamais confondus dans la même passe.
  const insertions: Record<number, string[]> = {}
  const insertionsCorrection: Record<number, string[]> = {}
  let currentGap: number | null = null
  let currentCorr: number | null = null
  for (const line of code.split('\n')) {
    const gap = line.match(/#mathalea-anchor\("gap", (\d+)\)/)
    if (gap != null) {
      currentGap = Number(gap[1])
      continue
    }
    const corr = line.match(/#mathalea-anchor\("corr", (\d+)\)/)
    if (corr != null) {
      currentCorr = Number(corr[1])
      continue
    }
    // tri préalable indispensable : sur les lignes des autres sujets, que
    // `subjectEditorCode` remplace par des milliers d'espaces, les motifs
    // ci-dessous (`\s*(.*?)\s*`) font exploser le retour arrière (plusieurs
    // secondes à chaque clic de la palette). `INSERTION_TAG` est aussi le
    // début de `INSERTION_CORRECTION_TAG`.
    if (!line.includes(INSERTION_TAG)) continue
    const insertion = line.match(/^\s*(.*?)\s*\/\/ mathalea:insertion\s*$/)
    if (insertion != null && currentGap != null && insertion[1].length > 0) {
      ;(insertions[currentGap] ??= []).push(insertion[1])
    }
    const insertionCorr = line.match(
      /^\s*(.*?)\s*\/\/ mathalea:insertion-corr\s*$/,
    )
    if (
      insertionCorr != null &&
      currentCorr != null &&
      insertionCorr[1].length > 0
    ) {
      ;(insertionsCorrection[currentCorr] ??= []).push(insertionCorr[1])
    }
  }
  const figureZoom: Record<number, number> = {}
  for (const match of code.matchAll(/^#let fig-(\d+)-zoom = ([\d.]+)/gm)) {
    const value = Number(match[2])
    if (keepFigureDefaults || value !== 1) figureZoom[Number(match[1])] = value
  }
  const canAnswerWidthMatch = code.match(/^#let can-reponse = ([\d.]+)/m)
  const canAnswerWidth =
    canAnswerWidthMatch != null &&
    Number(canAnswerWidthMatch[1]) !== CAN_ANSWER_WIDTH_DEFAULT
      ? Number(canAnswerWidthMatch[1])
      : undefined
  const figureAlign: Record<number, string> = {}
  const defaultAligns = figureDefaultAligns(code)
  for (const match of code.matchAll(
    /^#let fig-(\d+)-align = (left|center|right)/gm,
  )) {
    // le défaut d'une figure est « centré », sauf demande de l'exercice
    if (
      keepFigureDefaults ||
      match[2] !== (defaultAligns.get(Number(match[1])) ?? 'center')
    ) {
      figureAlign[Number(match[1])] = match[2]
    }
  }
  const exerciseZoom: Record<number, number> = {}
  for (const match of code.matchAll(/^#let exo-(\d+)-zoom = ([\d.]+)/gm)) {
    const value = Number(match[2])
    if (value !== 1) exerciseZoom[Number(match[1])] = value
  }
  const exerciseCorrectionZoom: Record<number, number> = {}
  for (const match of code.matchAll(/^#let exo-(\d+)-corr-zoom = ([\d.]+)/gm)) {
    const value = Number(match[2])
    if (value !== 1) exerciseCorrectionZoom[Number(match[1])] = value
  }
  // un exercice fusionné avec le précédent porte cette mention dans le
  // commentaire qui précède sa définition (voir buildVersionContent)
  const merges: number[] = []
  for (const match of code.matchAll(
    /^\/\/ ----- Exercice (\d+) \(fusionné avec le précédent\) -----$/gm,
  )) {
    merges.push(Number(match[1]))
  }
  // un groupe en colonnes porte ce marqueur juste avant son #grid(...)
  // (voir buildVersionContent)
  const multicolGroups: number[] = []
  for (const match of code.matchAll(/\/\/ mathalea:multicol\((\d+)\)/g)) {
    multicolGroups.push(Number(match[1]))
  }
  // une surcharge peut s'étendre sur plusieurs lignes : on ne peut pas la
  // lire avec un simple matchAll, il faut avancer ligne à ligne et retirer
  // l'indentation ajoutée par les blocs englobants (mêmes marges pour le
  // repère et son contenu, voir `wrapCodeOverride`). Les quatre types de
  // surcharge (énoncé/correction d'exercice, énoncé/réponse de ligne
  // « Course aux nombres ») partagent la même boucle : leurs repères sont
  // distincts donc jamais confondus.
  const codeOverrides: Record<number, string> = {}
  const codeOverridesCorrection: Record<number, string> = {}
  const codeOverridesCan: Record<number, string> = {}
  const codeOverridesCanReponse: Record<number, string> = {}
  const codeLines = code.split('\n')
  for (let i = 0; i < codeLines.length; i++) {
    const start = codeLines[i].match(CODE_OVERRIDE_START)
    const startCorrection = codeLines[i].match(CODE_OVERRIDE_CORRECTION_START)
    const startCan = codeLines[i].match(CODE_OVERRIDE_CAN_START)
    const startCanReponse = codeLines[i].match(CODE_OVERRIDE_CAN_REPONSE_START)
    const matched = start ?? startCorrection ?? startCan ?? startCanReponse
    if (matched == null) continue
    const indent = matched[1]
    const num = Number(matched[2])
    const endRegex =
      start != null
        ? CODE_OVERRIDE_END
        : startCorrection != null
          ? CODE_OVERRIDE_CORRECTION_END
          : startCan != null
            ? CODE_OVERRIDE_CAN_END
            : CODE_OVERRIDE_CAN_REPONSE_END
    const content: string[] = []
    i++
    while (i < codeLines.length && !endRegex.test(codeLines[i])) {
      const line = codeLines[i]
      content.push(line.startsWith(indent) ? line.slice(indent.length) : line)
      i++
    }
    if (start != null) codeOverrides[num] = content.join('\n')
    else if (startCorrection != null)
      codeOverridesCorrection[num] = content.join('\n')
    else if (startCan != null) codeOverridesCan[num] = content.join('\n')
    else codeOverridesCanReponse[num] = content.join('\n')
  }
  // lignes en pointillés (palette, par exercice) : chaque appel émis par
  // `writingLinesCall` porte un marqueur identifiant l'exercice et
  // l'emplacement ; en mode « après chaque question » plusieurs appels
  // portent le même marqueur (un par question), avec les mêmes réglages
  // le style est absent des codes émis avant son introduction : il reste
  // facultatif dans le motif, et vaut alors `pointilles` (le rendu d'origine)
  const writingLines: Record<number, WritingLinesSetting> = {}
  for (const match of code.matchAll(
    /^\s*#mathalea-lignes\((\d+), gutter: ([\d.]+)em(?:, style: "(pointilles|points|plein|vide)")?\) \/\/ mathalea:lignes-(fin|apres)\((\d+)\)\s*$/gm,
  )) {
    writingLines[Number(match[5])] = {
      position: match[4] === 'fin' ? 'endOfExercise' : 'afterEachQuestion',
      count: Number(match[1]),
      spacing: Number(match[2]),
      style: (match[3] ?? 'pointilles') as WritingLinesStyle,
    }
  }
  const exerciseTitles: Record<number, string> = {}
  for (const match of code.matchAll(
    /^#let exo-(\d+)-titre = (?:none|"((?:[^"\\]|\\.)*)") \/\/ mathalea:titre-perso$/gm,
  )) {
    exerciseTitles[Number(match[1])] = (match[2] ?? '').replace(/\\(.)/g, '$1')
  }
  return {
    tasksLayout,
    insertions,
    insertionsCorrection,
    figureZoom,
    figureAlign,
    canAnswerWidth,
    imageCuts: harvestImageCuts(code),
    exerciseZoom,
    exerciseCorrectionZoom,
    merges,
    multicolGroups,
    workedExamples: [...code.matchAll(/^\/\/ mathalea:worked\((\d+)\)$/gm)].map(
      (match) => Number(match[1]),
    ),
    codeOverrides,
    codeOverridesCorrection,
    codeOverridesCan,
    codeOverridesCanReponse,
    writingLines,
    exerciseTitles,
  }
}

/**
 * Construction du document Typst complet (fiche d'exercices + corrections)
 * à partir du contenu HTML des exercices, pour la vue Typst.
 */

/** Contenu d'un exercice, au format HTML de MathALÉA (formules en `$...$`) */
export interface TypstExerciseInput {
  /** Référence affichée à côté du titre (ex : 6e23-1) */
  ref: string
  /** Intitulé affiché quand l'option « Afficher le titre des exercices » est active. */
  title?: string
  /**
   * Lien vers l'exercice seul sur MathALÉA (avec ses réglages et sa graine),
   * encodé dans un QR-code quand `showQrCode` est actif. Absent si l'exercice
   * n'a pas d'URL (exercice non chargé).
   */
  url?: string
  /** Consigne et introduction, déjà concaténées */
  intro: string
  /**
   * Consigne seule, déjà formatée (sans l'introduction). En mode fusionné
   * (`mergeExercises`), elle est recopiée en tête de chaque question, juste
   * après son numéro, au lieu d'être affichée une fois avant la liste ;
   * ailleurs, c'est `intro` qui est rendu. Optionnelle : un appelant qui ne
   * la fournit pas garde l'ancien rendu (consigne avant la liste).
   */
  consigne?: string
  /**
   * Introduction seule, déjà formatée (sans la consigne) : en mode fusionné,
   * c'est ce texte — et non `intro` — qui reste affiché une fois avant la
   * liste des questions.
   */
  introduction?: string
  questions: string[]
  /** Consigne propre à la correction */
  introCorrection: string
  corrections: string[]
  /** Numéroter les questions (et les corrections) */
  numbered: boolean
  /** Message affiché à la place du contenu (exercice non imprimable) */
  warning?: string
  /**
   * Mode « Course aux nombres » : énoncés à mettre dans le tableau
   * (`listeCanEnonces` de l'exercice, avec repli sur `listeQuestions` déjà
   * appliqué par l'appelant). Absent pour un exercice qui n'en déclare pas :
   * `questions` sert alors d'énoncés.
   */
  canQuestions?: string[]
  /**
   * Mode « Course aux nombres » : réponses à compléter par l'élève
   * (`listeCanReponsesACompleter`), une par question — colonne « Réponse »
   * du tableau. Une entrée vide laisse la cellule vide.
   */
  canAnswers?: string[]
  /** Réponses courtes explicites ; null conserve la correction complète. */
  shortAnswers?: (string | null | undefined)[]
  /**
   * Mode « Course aux nombres » : pour chaque question, les numéros
   * (`canNumeroLie`) des questions auxquelles son énoncé est lié
   * (`listeCanLiees`). Deux questions liées partagent un seul énoncé — une
   * courbe lue deux fois, par exemple : la première porte l'énoncé, les
   * suivantes n'ont qu'une réponse à compléter.
   */
  canLinkedTo?: number[][]
  /**
   * Mode « Course aux nombres » : le numéro que chaque question se donne
   * (`canNumeroLie`), celui que les questions liées citent dans
   * `canLinkedTo`. Sans rapport avec sa position dans le tableau.
   */
  canLinkNumbers?: number[]
  /**
   * Exercice statique sans source `.typ` (énoncé image scannée seule) :
   * son énoncé n'est qu'un `<img>`, réglable en zoom par la palette
   * (`exo-N-zoom`, voir `htmlToTypst`).
   */
  isStaticImage?: boolean
  /**
   * Exercice statique sans source `_cor.typ` (correction image scannée
   * seule, indépendamment de l'énoncé) : sa correction n'est qu'un `<img>`,
   * réglable en zoom par la palette (`exo-N-corr-zoom`, voir `htmlToTypst`).
   */
  isStaticCorrectionImage?: boolean
}

export interface TypstDocumentOptions {
  title: string
  /** Sous-titre affiché à côté du titre (niveau, classe…) */
  subtitle: string
  headerLine: string
  /** Style de l'en-tête ; `aucun` n'affiche ni titre, ni sous-titre, ni ligne d'en-tête */
  headerStyle: HeaderStyle
  /** Affiche le pied de page (crédit MathALÉA) */
  showFooter: boolean
  /** Texte affiché à gauche du pied de page (« MathALÉA — coopmaths.fr » par défaut) */
  footerText: string
  /** Police du texte (nom d'une police libre embarquée dans le compilateur) */
  font: string
  /** Police des formules mathématiques */
  mathFont: string
  /** Taille du texte en points */
  fontSize: number
  /** Interligne des paragraphes, en em (0.65 = valeur par défaut de Typst) */
  lineSpacing: number
  /** Espacement entre les mots, en % de sa valeur normale (100 = défaut) */
  wordSpacing: number
  /** Espace au-dessus du titre de chaque exercice, en em */
  exerciseSpacing: number
  /**
   * Gestion automatique des espaces verticaux (paquet breather) : les lignes
   * contenant des maths hautes (fractions « display », matrices, racines
   * imbriquées…) s'écartent juste ce qu'il faut, sans toucher à l'interligne
   * des lignes ordinaires.
   */
  autoVerticalSpacing: boolean
  /** Numéros des questions (et sous-questions) en gras */
  boldQuestionNumbers: boolean
  /**
   * Style de numérotation des listes de questions (`aucun` : questions non
   * numérotées, seulement mises en colonnes). Un exercice dont la structure
   * est détectée dans son contenu (repères `a)`, `b)`... voir
   * `splitSubQuestions`) garde son propre style, indépendant de ce réglage.
   */
  questionNumberingStyle: QuestionNumberingStyle
  /**
   * Nombre de colonnes par défaut des listes de questions d'un exercice
   * (`auto` : jusqu'à 4 colonnes uniformes, ajusté au contenu — voir
   * `#tasks-setup`). Un exercice réglé depuis la palette de mise en page de
   * l'aperçu (`#let exN-colonnes`) l'emporte sur ce défaut.
   */
  questionsColumns: 'auto' | 1 | 2 | 3 | 4
  /**
   * Espacement vertical par défaut entre les questions, en em (`#let
   * interligne-questions`). Un exercice réglé depuis la palette de mise en
   * page l'emporte sur ce défaut.
   */
  questionsGutter: number
  /** Affiche la référence du référentiel à côté de la numérotation */
  showExerciseRefs: boolean
  /** Affiche l'intitulé MathALÉA après « Exercice N ». */
  showExerciseTitles: boolean
  /**
   * Affiche les points de chaque exercice (« …… / 4 pts » au bout de sa
   * ligne de titre) et la note globale dans la ligne d'en-tête. Les points
   * sont ceux du barème de la page de garde (`coverPage.bareme`). Sans effet
   * en mode fusionné ou course aux nombres.
   */
  showExercisePoints?: boolean
  /**
   * Place des points d'un exercice : au bout de sa ligne de titre
   * (`right`, défaut) ou sous le titre, à gauche (`below`).
   */
  exercisePointsPosition?: 'right' | 'below'
  /**
   * Ajoute au coin de chaque exercice un QR-code pointant vers l'exercice
   * seul sur MathALÉA (comme la sortie LaTeX). Sans effet en mode fusionné.
   */
  showQrCode: boolean
  /**
   * Ajoute en haut à droite de la première page un QR-code pointant vers
   * toute la sélection d'exercices en vue élève (un exercice par page, non
   * interactif mais modifiable, mêmes graines que le document imprimé) :
   * voir `ficheUrl`. Indépendant de `showQrCode`, qui vise chaque exercice
   * individuellement.
   */
  showQrCodeFiche: boolean
  /**
   * Affiche la correction dans le document généré (`#let corrige`). Décochée,
   * seuls les énoncés et les exemples corrigés sont rendus, sans section finale.
   */
  showCorrections: boolean
  /** Nombre de colonnes du document (1, 2 ou 3) */
  columns: number
  /** Format de page */
  pageFormat: 'a4' | 'a5'
  /** Orientation de la page */
  orientation: 'portrait' | 'landscape'
  /**
   * Fusionne tous les exercices en un seul : les questions sont numérotées
   * à la suite (le numéro ne se réinitialise pas à chaque exercice) et les
   * titres « Exercice N » disparaissent.
   */
  mergeExercises: boolean
  /**
   * Mode « Course aux nombres » : toutes les questions de tous les exercices
   * sont rassemblées dans un seul tableau (numéro, énoncé, réponse à
   * compléter, jury), comme le style « Can » de la sortie LaTeX. Les
   * corrections sont numérotées à la suite. Prend le pas sur `mergeExercises`
   * et sur les réglages de badges (il n'y a plus de titre d'exercice).
   */
  canMode: boolean
  /**
   * Correction minimale : quand une correction met une réponse en évidence
   * (`miseEnEvidence`, orange), seule cette réponse est imprimée — le
   * raisonnement détaillé disparaît. Une correction sans mise en évidence
   * reste affichée telle quelle.
   */
  minimalCorrections: boolean
  /** Style des badges du paquet exercise-bank */
  badgeStyle: BadgeStyle
  /**
   * Place le badge (« Exercice 1 ») dans sa propre colonne à gauche de
   * l'énoncé (`margin`, comportement d'origine) ou seul sur une ligne
   * d'en-tête, l'énoncé prenant toute la largeur en dessous (`above`).
   * `above` est surtout utile en colonnes, où la colonne du badge coûte une
   * bonne part de la largeur, et avec les énoncés numérotés, dont le retrait
   * s'ajoute à celui du badge.
   */
  badgePosition: BadgePosition
  /**
   * Couleur des badges d'exercice, de correction et des titres
   * (expression Typst, ex : `black`). La correction suit la même couleur.
   */
  badgeColor: string
  /** Nombre de versions du sujet (Sujet A, B...) générées à la suite */
  nbVersions: number
  /**
   * Graines explicites par sujet, renseignées quand « Nouvelles données » ne
   * rebrasse qu'un seul sujet : les autres gardent alors leur tirage au lieu
   * de suivre la graine du Sujet A. Indexé par numéro de sujet (`[1]` = Sujet
   * B...), chaque entrée est une liste d'une graine par exercice, dans l'ordre
   * courant. Une entrée absente ou `null`, ou une graine `null`, retombe sur
   * la graine dérivée `${graineSujetA}${index}`. La liste est vidée dès que
   * les exercices changent (ajout, suppression, réordonnancement), l'index
   * n'y correspondant alors plus. N'est lue que par `Typst.svelte`
   * (`buildAllVersionInputs`) ; `buildTypstDocument` ne s'en sert pas.
   */
  versionSeeds?: (readonly (string | null)[] | null)[]
  /**
   * Masque l'étiquette « Sujet A/B... » de l'en-tête (`nbVersions > 1`
   * seulement). Le repère de la palette reste dans l'en-tête sans réserver
   * de place à l'étiquette masquée.
   */
  hideVersionLabel: boolean
  /**
   * Le bloc « Corrections » et chaque sujet d'une fiche à plusieurs versions
   * commencent sur une page impaire, une page blanche (sans en-tête ni pied
   * de page) étant insérée si besoin : l'impression recto-verso en série ne
   * fait alors jamais commencer une partie au dos de la précédente. Décoché,
   * ces parties enchaînent sur la page suivante.
   */
  oddPageStarts: boolean
  /**
   * « Plusieurs sujets sur une page » : sujets (A, B...) à la suite sur une
   * même page quand ils y tiennent,
   * séparés par un trait pointillé ; un sujet qui ne tient pas dans la place
   * restante commence une nouvelle page. Les corrections passent toutes à la
   * fin. Sans effet avec une page de garde.
   */
  chainSubjects: boolean
  /**
   * Nombre d'exemplaires de chaque sujet sur la page (1 par défaut). Un
   * exemplaire supplémentaire n'est ajouté que s'il tient dans la place
   * restante de la page ; les sujets sont alors enchaînés comme avec
   * `chainSubjects`.
   */
  copiesPerPage: number
  /** Page de garde placée en tête de chaque sujet (`aucune` par défaut) */
  coverPage: TypstCoverOptions
  /**
   * Lignes ajoutées d'office à la fin de chaque exercice, pour que l'élève y
   * réponde (0 : aucune). Réglage global, que la palette de l'aperçu affine
   * ensuite exercice par exercice (`TypstCarryOver.writingLines`, qui a la
   * priorité) ; le modèle « récitation » le met à 2 à sa sélection, les
   * autres à 0.
   */
  answerLines: number
  /** Trait de ces lignes (mêmes choix que la palette, voir `WritingLinesStyle`) */
  answerLinesStyle: WritingLinesStyle
  /**
   * Emplacement de ces lignes : à la fin de chaque exercice, ou après chaque
   * question de chaque exercice (mêmes choix que la palette).
   */
  answerLinesPosition: WritingLinesPosition
}

/**
 * Modèles de page de garde proposés (comme la vue PDF, voir
 * `latex/LatexConfig.ts`). `aucune` : la fiche commence directement par son
 * en-tête, comportement d'origine.
 */
export const COVER_TEMPLATES = [
  'aucune',
  'evaluation',
  // « Évaluation (bandeau compact) » côté interface ; la clef reste
  // `recitation`, nom d'origine du modèle, que portent les liens déjà
  // partagés (`typstParam`) et les fiches enregistrées
  'recitation',
  'brevet',
  'bac',
  'can',
] as const
export type CoverTemplate = (typeof COVER_TEMPLATES)[number]

/** Modèle de page de garde effectivement rendu (hors « aucune ») */
export type ActiveCoverTemplate = Exclude<CoverTemplate, 'aucune'>

/**
 * Textes de la page de garde. Tous sont modifiables dans les réglages, et
 * réémis tels quels dans le code Typst (arguments nommés de
 * `#mathalea-couverture`), donc encore modifiables dans l'éditeur.
 */
export interface TypstCoverOptions {
  template: CoverTemplate
  /** Intitulé principal (« Brevet des collèges », « Évaluation »…) */
  titre: string
  /**
   * Session ou date de l'épreuve (« Juin 2026 »). Inutilisé par « can » ;
   * « récitation » l'affiche comme date, sous la durée.
   */
  session: string
  /** Matière (« MATHÉMATIQUES »). Inutilisée par « can ». */
  matiere: string
  /**
   * Établissement (« CO des Coudriers »), affiché sous la matière par le
   * seul modèle « récitation » — les autres n'ont pas de ligne où le mettre.
   */
  etablissement: string
  /** Durée de l'épreuve (« 2 heures ») */
  duree: string
  /** Consignes affichées sous la durée, une par ligne */
  consignes: string[]
  /** Intitulé du champ de signature du bandeau compact */
  signatureLabel: string
  /**
   * Mention en bas de page (« Tournez la page S.V.P. »). Affichée seulement
   * si le modèle en prévoit une (`COVER_TEMPLATE_LAYOUT.hasNoteFin`) et si le
   * texte n'est pas vide.
   */
  noteFin: string
  /**
   * Barème : points de chaque exercice, dans l'ordre de la fiche. Ajusté au
   * nombre d'exercices par les réglages ; ignoré par le modèle « can », dont
   * le score porte sur le nombre de questions.
   */
  bareme: number[]
  /** Affiche le tableau du barème et son total */
  showBareme: boolean
  /**
   * Ajoute le champ de signature sous le prénom.
   * Propre au modèle « récitation », le seul à proposer ce champ.
   */
  showSignature: boolean
  /**
   * Ajoute une case où porter la note à la main (active par défaut). Propre
   * au modèle « récitation », et décochable : la case Total de la ligne
   * « obtenus » de la grille en tient déjà lieu.
   */
  showNote: boolean
}

/**
 * Présentation propre à chaque modèle : ces différences ne sont pas réglables
 * (elles font le modèle), seul le texte de `noteFin` l'est (voir
 * `TypstCoverOptions.noteFin`) — `hasNoteFin` ne dit que si le modèle en
 * affiche une.
 */
const COVER_TEMPLATE_LAYOUT: Record<
  Exclude<ActiveCoverTemplate, 'can' | 'recitation'>,
  { identite: boolean; colonneNote: boolean; hasNoteFin: boolean }
> = {
  // évaluation : la copie est la feuille elle-même, d'où les champs
  // d'identité en tête et la colonne où porter la note de chaque exercice
  evaluation: { identite: true, colonneNote: true, hasNoteFin: false },
  brevet: { identite: false, colonneNote: false, hasNoteFin: true },
  bac: { identite: false, colonneNote: false, hasNoteFin: true },
}

/**
 * Textes proposés à la sélection d'un modèle, tous modifiables ensuite. La
 * session est datée du jour par les réglages (`currentSession`), et le modèle
 * « can » tire ses deux premières consignes de la durée et du nombre de
 * questions (voir `MATHALEA_COVER_CAN_HELPER`).
 */
export const COVER_TEMPLATE_DEFAULTS: Record<
  ActiveCoverTemplate,
  Pick<
    TypstCoverOptions,
    'titre' | 'matiere' | 'duree' | 'consignes' | 'signatureLabel' | 'noteFin'
  >
> = {
  evaluation: {
    titre: 'Évaluation',
    matiere: 'Mathématiques',
    duree: '55 minutes',
    consignes: ['La calculatrice est autorisée.'],
    signatureLabel: '',
    noteFin: '',
  },
  brevet: {
    titre: 'Brevet des collèges',
    matiere: 'MATHÉMATIQUES',
    duree: '2 heures',
    consignes: ['L’usage de la calculatrice est autorisé.'],
    signatureLabel: '',
    noteFin: 'Tournez la page S.V.P.',
  },
  bac: {
    titre: 'Baccalauréat',
    matiere: 'MATHÉMATIQUES',
    duree: '4 heures',
    consignes: ['L’usage de la calculatrice est autorisé.'],
    signatureLabel: '',
    noteFin: 'Tournez la page S.V.P.',
  },
  recitation: {
    titre: 'Évaluation',
    matiere: 'Mathématiques',
    duree: '20 minutes',
    consignes: [
      'Justifier chaque réponse ;',
      'Écrire lisiblement au crayon ou au stylo (noir ou bleu) ;',
      'Ne pas utiliser la calculatrice.',
    ],
    signatureLabel: 'Signature d’un responsable légal',
    noteFin: '',
  },
  can: {
    titre: 'La course aux nombres',
    matiere: '',
    duree: '9 minutes',
    consignes: [
      'L’usage de la calculatrice et du brouillon sont interdits. Il n’est pas permis d’écrire des calculs intermédiaires.',
    ],
    signatureLabel: '',
    noteFin: '',
  },
}

/**
 * Emplacement des lignes en pointillés (voir `TypstCarryOver.writingLines`) :
 * réglage par exercice (palette de mise en page), pas un réglage global.
 */
export const WRITING_LINES_POSITIONS = [
  'endOfExercise',
  'afterEachQuestion',
] as const
export type WritingLinesPosition = (typeof WRITING_LINES_POSITIONS)[number]

/**
 * Trait des lignes : `pointilles` (filet pointillé, valeur d'origine, donc
 * celle des codes déjà enregistrés qui ne portent pas de style), `points`
 * (points de conduite), `plein` (filet continu) ou `vide` (espace sans trait).
 */
export const WRITING_LINES_STYLES = [
  'pointilles',
  'points',
  'plein',
  'vide',
] as const
export type WritingLinesStyle = (typeof WRITING_LINES_STYLES)[number]

/** Réglage de lignes d'un exercice (palette de mise en page) */
export type WritingLinesSetting = {
  position: WritingLinesPosition
  count: number
  spacing: number
  style: WritingLinesStyle
}

/**
 * `aucun` masque le bloc de titre (titre, sous-titre, ligne d'en-tête) sans
 * effet sur le pied de page (réglage indépendant, voir `showFooter`).
 */
export const HEADER_STYLES = ['epure', 'cartouche', 'cadre', 'aucun'] as const
export type HeaderStyle = (typeof HEADER_STYLES)[number]

/**
 * Styles de numérotation proposés pour les listes de questions (`aucun` :
 * pas de numéro). Les motifs (`"1."`, `"1)"`, `"a."`, `"a)"`) sont ceux de
 * la fonction Typst `numbering()`.
 */
export const QUESTION_NUMBERING_STYLES = [
  'aucun',
  '1.',
  '1)',
  'a.',
  'a)',
] as const
export type QuestionNumberingStyle = (typeof QUESTION_NUMBERING_STYLES)[number]

/**
 * Polices de texte libres embarquées dans le compilateur Typst (rendu
 * identique dans l'aperçu du navigateur et dans le PDF exporté).
 */
export const TEXT_FONTS = [
  'Libertinus Serif',
  'New Computer Modern',
  'Noto Serif',
  'Lora',
  'Noto Sans',
  'Source Sans 3',
  'Luciole',
  'Ubuntu',
  'OpenDyslexic',
] as const

/**
 * Polices mathématiques (embarquée + libres servies par MathALÉA).
 * Noto Sans Math n'a pas de lettres latines accentuées dans sa table cmap
 * (é, à, ê… absents) : un caractère accentué isolé en mode maths doit se
 * dessiner en un seul glyphe, et Noto Sans Math le décompose en base + accent
 * (2 glyphes), ce que Typst refuse. `latexToTypst.ts` protège désormais tout
 * mot accentué en mode maths dans une chaîne Typst rendue via `#txt()`
 * (police de texte explicite, jamais celle des maths) — voir le commentaire
 * « Mot comportant une lettre latine accentuée » dans `preprocessTex`.
 */
export const MATH_FONTS = [
  'New Computer Modern Math',
  'Libertinus Math',
  'STIX Two Math',
  'Noto Sans Math',
] as const

/**
 * Styles de badge proposés par le paquet exercise-bank : les douze du paquet,
 * dans l'ordre d'affichage de la liste des réglages (styles pleine largeur
 * d'abord, puis les badges en marge).
 *
 * `margin` (titre dans une colonne latérale) était écarté tant que sa colonne
 * était figée à 3,35 cm — sur un document en deux colonnes, l'énoncé n'était
 * pas plus large que son titre. Depuis exercise-bank 0.6.4, cette colonne se
 * replie d'elle-même sous `margin-fold-below` (par défaut trois fois sa
 * largeur, soit 10 cm : franchi dès deux colonnes en A4) : le titre passe
 * alors sur une ligne d'en-tête et l'énoncé prend toute la largeur.
 */
export const BADGE_STYLES = [
  // styles pleine largeur : le titre occupe une ligne à lui seul, la
  // « Position du titre » n'a rien à y changer
  'border-accent',
  'underline',
  'rounded-box',
  'header-card',
  // styles qui dessinent un badge : sa position est réglable, « En marge »
  // (colonne à gauche de l'énoncé) ou « Au-dessus »
  'margin',
  'box',
  'pill',
  'tag',
  'circled',
  'filled-circle',
  'rect',
  'filled-rect',
] as const
export type BadgeStyle = (typeof BADGE_STYLES)[number]

/**
 * Styles dont le titre occupe déjà toute la largeur : ils n'ont pas de
 * colonne de badge, donc `badge-position` ne change rien à leur allure. Le
 * réglage « Position du titre » est désactivé pour eux (voir `Typst.svelte`).
 */
export const FULL_WIDTH_BADGE_STYLES = [
  'border-accent',
  'underline',
  'rounded-box',
  'header-card',
] as const

/** Le style place-t-il son titre à côté de l'énoncé (colonne de badge) ? */
export function hasSideLabel(style: BadgeStyle): boolean {
  return !(FULL_WIDTH_BADGE_STYLES as readonly string[]).includes(style)
}

/**
 * Position du badge par rapport à l'énoncé (`badge-position` du paquet
 * exercise-bank, depuis 0.6.2) : dans une colonne à gauche, ou seul sur une
 * ligne d'en-tête au-dessus d'un énoncé pleine largeur.
 */
export const BADGE_POSITIONS = ['margin', 'above'] as const
export type BadgePosition = (typeof BADGE_POSITIONS)[number]

/**
 * Styles où le badge est placé dans une colonne à gauche du contenu.
 * Par défaut le paquet réserve une colonne large (dimensionnée sur
 * « Correction 100 ») et décale le bloc dans la marge de la page, ce qui
 * rend le contenu beaucoup trop étroit. On fixe donc une largeur de
 * colonne compacte par style (`margin-position`) et on annule le décalage
 * (`label-extra: 0pt`). Les autres styles occupent toute la largeur.
 */
/**
 * Largeur de la colonne du badge, par style. Les énoncés (« Exercice N »)
 * demandent moins de place que les corrections (« Correction N ») ; comme
 * ils sont rendus dans des sections séparées, on rétrécit la colonne pour
 * les énoncés et on l'élargit juste avant les corrections.
 */
const MARGIN_BADGE_WIDTH: Partial<
  Record<BadgeStyle, { exo: string; corr: string }>
> = {
  box: { exo: '2.2cm', corr: '2.9cm' },
  pill: { exo: '2.5cm', corr: '3.2cm' },
  tag: { exo: '2.7cm', corr: '3.5cm' },
  circled: { exo: '1.4cm', corr: '1.4cm' },
  'filled-circle': { exo: '1.4cm', corr: '1.4cm' },
  // `rect`/`filled-rect` : rectangle au seul numéro, comme les styles
  // cerclés — même largeur de colonne
  rect: { exo: '1.4cm', corr: '1.4cm' },
  'filled-rect': { exo: '1.4cm', corr: '1.4cm' },
}

/**
 * Largeur de la colonne du badge à imposer au paquet, ou `undefined` quand il
 * n'y a pas de colonne à régler : style pleine largeur, ou badge placé
 * au-dessus de l'énoncé (`badge-position: "above"`, qui supprime la colonne).
 */
function marginBadgeWidth(
  options: TypstDocumentOptions,
): { exo: string; corr: string } | undefined {
  if (badgePosition(options) === 'above') return undefined
  return MARGIN_BADGE_WIDTH[options.badgeStyle]
}

/**
 * Position du badge effectivement appliquée : le réglage n'a de sens que
 * pour les styles à titre latéral, les styles pleine largeur restent en
 * `margin` (leur valeur par défaut, sans effet chez eux) quel que soit le
 * réglage laissé par un autre style.
 */
function badgePosition(options: TypstDocumentOptions): BadgePosition {
  return hasSideLabel(options.badgeStyle) ? options.badgePosition : 'margin'
}

export const defaultTypstDocumentOptions: TypstDocumentOptions = {
  title: "Fiche d'exercices",
  subtitle: '',
  headerStyle: 'epure',
  showFooter: true,
  footerText: 'MathALÉA — coopmaths.fr',
  font: 'Libertinus Serif',
  mathFont: 'Libertinus Math',
  fontSize: 11,
  headerLine:
    'Nom : ______________________ Prénom : ______________________ Classe : ______',
  lineSpacing: 0.65,
  wordSpacing: 100,
  exerciseSpacing: 1.6,
  autoVerticalSpacing: true,
  boldQuestionNumbers: true,
  questionNumberingStyle: '1)',
  questionsColumns: 'auto',
  questionsGutter: 1.2,
  showExerciseRefs: false,
  showExerciseTitles: false,
  showExercisePoints: false,
  exercisePointsPosition: 'right',
  showCorrections: true,
  columns: 1,
  pageFormat: 'a4',
  orientation: 'portrait',
  mergeExercises: false,
  canMode: false,
  minimalCorrections: false,
  showQrCode: false,
  showQrCodeFiche: false,
  badgeStyle: 'underline',
  badgePosition: 'margin',
  badgeColor: 'black',
  nbVersions: 1,
  hideVersionLabel: false,
  oddPageStarts: true,
  chainSubjects: false,
  copiesPerPage: 1,
  answerLines: 0,
  answerLinesStyle: 'pointilles',
  answerLinesPosition: 'endOfExercise',
  coverPage: {
    template: 'aucune',
    titre: '',
    session: '',
    matiere: '',
    etablissement: '',
    duree: '',
    consignes: [],
    signatureLabel: '',
    noteFin: '',
    bareme: [],
    showBareme: true,
    showSignature: true,
    showNote: true,
  },
}

/**
 * Les champs numériques vides (null/undefined) et les anciens réglages partagés
 * invalides ne doivent jamais produire de longueurs Typst comme « nullem ».
 * Les espacements nuls restent autorisés ; la taille du texte doit être positive.
 */
export function normalizeTypstLayoutOptions(
  options: TypstDocumentOptions,
): TypstDocumentOptions {
  const normalized = { ...options }
  for (const key of [
    'fontSize',
    'lineSpacing',
    'wordSpacing',
    'exerciseSpacing',
    'questionsGutter',
  ] as const) {
    const value = options[key]
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      (key === 'fontSize' && value === 0)
    ) {
      normalized[key] = defaultTypstDocumentOptions[key]
    }
  }
  return normalized
}

/**
 * Figure du sujet A dont une figure d'un autre sujet reprend le zoom et
 * l'alignement : les figures sont numérotées à la suite, sujet après sujet
 * (`figureOffsets` : premier indice de chaque sujet B, C...). Quand un sujet
 * a autant de figures que le sujet A (mêmes exercices, mêmes figures), sa
 * k-ième figure suit la k-ième du sujet A ; sinon (nombre de figures tiré au
 * hasard) elle garde ses propres réglages. Renvoie `undefined` pour une
 * figure du sujet A ou sans correspondante.
 */
export function sharedFigureNumber(
  figNum: number,
  figureOffsets: number[],
  figureCount: number,
): number | undefined {
  const primaryCount = figureOffsets[0] ?? figureCount
  for (let v = figureOffsets.length - 1; v >= 0; v--) {
    const start = figureOffsets[v]
    if (figNum <= start) continue
    const end = figureOffsets[v + 1] ?? figureCount
    return end - start === primaryCount ? figNum - start : undefined
  }
  return undefined
}

/**
 * Mise en page des sujets enchaînés (`chainSubjects`, `copiesPerPage`) :
 * chaque sujet est mesuré dans la largeur du corps de page ; les sujets
 * d'une même page s'en partagent la hauteur à parts égales, séparées par un
 * trait pointillé (pour découper la feuille). Un sujet qui ne tient pas dans
 * sa part commence une nouvelle page ; un exemplaire supplémentaire
 * (`copie: true`) qui ne tient pas est omis. Les hauteurs sont mesurées, pas
 * lues sur la position courante : la mise en page converge en une passe.
 */
export const MATHALEA_CHAIN_HELPER = `#let mathalea-enchainement(sujets, corps: (190mm, 267mm)) = context {
  let (largeur, hauteur) = corps
  let ecart = 1.2em.to-absolute()
  let trait = line(length: 100%, stroke: (paint: luma(150), thickness: 0.6pt, dash: "dashed"))
  // groupes de sujets par page : k sujets se partagent la page en k parts
  // égales, un sujet n'entre dans un groupe que si tous y tiennent encore
  let pages = ()
  let groupe = ()
  for (sujet, copie) in sujets {
    let h = measure(block(width: largeur, sujet)).height
    let essai = groupe + ((sujet, h),)
    let part = (hauteur - 1pt) / essai.len()
    if groupe.len() == 0 or essai.all(((_, hs)) => hs + ecart <= part) {
      groupe = essai
    } else if not copie {
      pages.push(groupe)
      groupe = ((sujet, h),)
    }
  }
  if groupe.len() > 0 { pages.push(groupe) }
  for (i, groupe) in pages.enumerate() {
    if i > 0 { pagebreak(weak: true) }
    if groupe.len() == 1 {
      groupe.first().first()
    } else {
      let part = (hauteur - 1pt) / groupe.len()
      for (j, (sujet, _)) in groupe.enumerate() {
        block(height: part, width: 100%, spacing: 0pt, breakable: false, {
          if j > 0 {
            place(top, trait)
            v(ecart)
          }
          sujet
        })
      }
    }
  }
}`

/** Nombre maximal d'exemplaires d'un sujet sur une page (`copiesPerPage`) */
export const MAX_COPIES_PER_PAGE = 4

/** Sépare le rendu d'un sujet en énoncés et corrections (bloc `#if corrige`) */
function splitCorrections(renderLines: string[]): {
  enonce: string[]
  corrections: string[]
} {
  const index = renderLines.indexOf('// ----- Corrections -----')
  return index === -1
    ? { enonce: renderLines, corrections: [] }
    : {
        enonce: renderLines.slice(0, index),
        corrections: renderLines.slice(index),
      }
}

/** Rendu d'un sujet avec le repère de fin de ses énoncés, avant les corrections */
function withSubjectEnd(
  renderLines: string[],
  version: number,
  exportMode: boolean,
): string[] {
  if (exportMode) return renderLines
  const { enonce, corrections } = splitCorrections(renderLines)
  return [...enonce, subjectAnchor('end', version), ...corrections]
}

/** Appel d'un repère de la palette, retiré des exemplaires répétés */
const ANCHOR_CALL = /#mathalea-anchor\("[^"]*", \d+(?:, dx: [^)]*)?\)/g

/** Repère de début ou de fin des énoncés d'un sujet (hauteur mesurée par l'aperçu) */
function subjectAnchor(kind: 'start' | 'end', version: number): string {
  return `#mathalea-anchor("subject-${kind}", ${version})`
}

/** Dimensions du corps de page (hors marges), en millimètres */
export function pageBodySize(
  options: Pick<TypstDocumentOptions, 'pageFormat' | 'orientation'>,
  marginX: number,
): { width: number; height: number } {
  const [w, h] = options.pageFormat === 'a5' ? [148, 210] : [210, 297]
  const [width, height] = options.orientation === 'landscape' ? [h, w] : [w, h]
  return { width: width - 2 * marginX, height: height - 2 * 15 }
}

/**
 * Saut de page ouvrant une partie du document (bloc « Corrections », sujet
 * suivant). Avec le réglage « Corrigés et sujets suivants sur une page
 * impaire », Typst insère au besoin une page blanche pour que la partie tombe
 * sur un recto en impression recto-verso. La parité est celle du compteur de
 * pages, remis à 1 (impair) au début de chaque sujet : elle suit donc la
 * parité physique.
 */
function sectionPageBreak(options: TypstDocumentOptions): string {
  if (!options.oddPageStarts) return '#pagebreak(weak: true)'
  // `set page` dans un bloc de code : la page blanche éventuellement insérée
  // par `to: "odd"` naît dans ce bloc, elle est donc sans en-tête ni pied de
  // page (sinon elle afficherait un numéro « 4/3 » incongru) ; la page
  // courante et celle de la partie qui suit, hors du bloc, gardent les leurs.
  return '#{ set page(header: none, footer: none); pagebreak(to: "odd", weak: true) }'
}

/** Applique le réglage « Correction minimale » aux corrections des exercices */
function withMinimalCorrections(
  exercises: TypstExerciseInput[],
  options: TypstDocumentOptions,
): TypstExerciseInput[] {
  if (!options.minimalCorrections) return exercises
  return exercises.map((exercise) => ({
    ...exercise,
    corrections: exercise.corrections.map((correction, i) =>
      minimalCorrection(correction, exercise.shortAnswers?.[i]),
    ),
  }))
}

/**
 * Étiquette de numérotation d'un environnement `tasks` : un littéral Typst
 * (`"1."`, `"a)"`, `none`), ou la référence à une variable de mise en page
 * (`exN-numerotation`, réglable par exercice) dont la valeur (`isVariableRef`)
 * n'est connue qu'à la compilation Typst. En gras, elle devient une fonction
 * qui délègue le motif à `numbering()` puis met en forme le résultat — sauf
 * quand `pattern` vaut `none`, où `numbering()` échouerait : ce cas est
 * connu d'avance pour un littéral (retourné tel quel), mais doit être gardé
 * à l'exécution pour une référence de variable, dont la valeur peut valoir
 * `none` (numérotation retirée pour cet exercice) sans que ce code le sache.
 */
function boldableLabel(
  pattern: string,
  bold: boolean,
  isVariableRef = false,
): string {
  if (pattern === 'none' || !bold) return pattern
  if (isVariableRef) {
    return `if ${pattern} == none { none } else { (..n) => strong(numbering(${pattern}, ..n)) }`
  }
  return `(..n) => strong(numbering(${pattern}, ..n))`
}

/**
 * Repères de sous-questions produits par `numAlpha`/`numAlphaNum`
 * (`<span style="color:...; font-weight:bold">a)&nbsp;</span>`) ou par
 * `stylizeItems` (multiMathfield), qui ajoute d'autres propriétés de style
 * après `font-weight:bold` (`display:inline-block; margin-left:...`). Le
 * style peut donc contenir des propriétés supplémentaires ; on exige
 * seulement `font-weight:bold` et un contenu limité au repère `X)`.
 */
const SUB_QUESTION_MARKER =
  /<span[^>]*\bstyle="[^"]*font-weight:\s*bold[^"]*"[^>]*>\s*([a-z]|\d{1,2})\)(?:&nbsp;|\s)*<\/span>/gi

/**
 * Un repère `a)` / `b)` n'ouvre une sous-question que s'il est en début de
 * ligne : au tout début du contenu, ou juste après un `<br>`. Les `a)` / `b)`
 * qui apparaissent au fil d'une phrase (« Rendre la fraction irréductible à
 * l'aide des décompositions obtenues au a) et au b). ») renvoient à d'autres
 * questions ; les prendre pour des repères ajoute des items fantômes à la
 * liste `tasks` et décale la numérotation.
 */
function isStructuralMarker(html: string, index: number): boolean {
  const before = html.slice(0, index).replace(/(?:\s|&nbsp;)+$/gi, '')
  return before.length === 0 || /<br\s*\/?>$/i.test(before)
}

/**
 * Découpe une question unique contenant ses propres repères (`a)`, `b)`...)
 * en une liste de sous-questions, pour la mettre dans un environnement
 * `tasks`. Renvoie `null` quand la question n'a pas cette structure.
 *
 * La lecture optique s'en sert aussi (`omrQuestions`) : quand un énoncé porte
 * plusieurs réponses, c'est ce découpage qui dit laquelle imprimer devant
 * quelles cases.
 */
export function splitSubQuestions(
  html: string,
): { head: string; items: string[]; label: string } | null {
  const matches = [...html.matchAll(SUB_QUESTION_MARKER)].filter((match) =>
    isStructuralMarker(html, match.index!),
  )
  if (matches.length < 2) return null
  const first = matches[0][1].toLowerCase()
  if (first !== 'a' && first !== '1') return null
  const head = html.slice(0, matches[0].index).replace(/(<br\s*\/?>\s*)+$/i, '')
  const items = matches.map((match, i) => {
    const start = match.index! + match[0].length
    const end = i + 1 < matches.length ? matches[i + 1].index! : html.length
    // les <br> de fin d'item servaient à séparer les sous-questions :
    // l'espacement est maintenant assuré par l'environnement tasks
    return html.slice(start, end).replace(/(<br\s*\/?>\s*)+$/i, '')
  })
  return { head, items, label: first === 'a' ? '"a)"' : '"1)"' }
}

/** Corps d'un exercice (ou de sa correction), et nombre de questions numérotées qu'il contient */
interface ExerciseBodyResult {
  code: string
  /** Nombre de questions affichées dans un environnement `tasks` (0 si aucune) */
  itemCount: number
}

/** Corps d'un exercice (ou de sa correction) : intro puis questions */
function exerciseBody(
  intro: string,
  questions: string[],
  numbered: boolean,
  figures: string[],
  /** Préfixe des variables de mise en page (ex : `ex1`) pour les questions numérotées */
  tasksPrefix?: string,
  /** Réglages du document : gras, style de numérotation, colonnes/espacement par défaut */
  options: TypstDocumentOptions = defaultTypstDocumentOptions,
  /** Numéro de la première question (exercices fusionnés : la numérotation continue) */
  startNumber = 1,
  /** Publie le repère `mathalea-anchor` de la liste `tasks` (palette de l'aperçu) */
  emitAnchor = true,
  /**
   * Exercice fusionné (avec le précédent et/ou le suivant) : une question
   * unique rejoint quand même l'environnement `tasks` pour participer à la
   * numérotation continue du groupe (seule au sein de son propre exercice,
   * elle n'aurait sinon pas de numéro).
   */
  forceList = false,
  /**
   * Lignes en pointillés à insérer après chaque question (à l'intérieur de
   * l'environnement `tasks`, y compris après la dernière) ou après le corps
   * entier de l'exercice. N'est jamais passé pour une correction (voir
   * `computeGeneratedExercises`).
   */
  writingLines?: WritingLinesSetting & {
    /** Numéro (1-based) de l'exercice, pour le marqueur relu par `harvestCarryOver` */
    num: number
  },
  /**
   * Code destiné à être exporté/copié hors de l'appli (fichier .typ,
   * modale d'édition) : les colonnes et l'espacement des questions sont
   * écrits en valeurs littérales dans le `#tasks(...)`, plutôt que de
   * référencer les variables `${tasksPrefix}-colonnes`/`-gutter` (propres à
   * la palette de mise en page de l'éditeur intégré, sans sens hors de lui).
   */
  exportMode = false,
  /** Réglages de colonnes/espacement/numérotation de la palette pour cet exercice, déjà résolus par l'appelant */
  layoutOverride?: { columns?: string; gutter?: string; numbering?: string },
  /** Colonnes des propositions de QCM de cet exercice (palette), déjà résolues par l'appelant */
  qcmLayoutOverride?: { columns?: string },
  /**
   * Variable Typst (`exo-N-zoom` ou `exo-N-corr-zoom`), fournie uniquement
   * pour un énoncé/correction statique sans source `.typ`/`_cor.typ` (image
   * scannée seule) : voir `htmlToTypst`.
   */
  zoomVariable?: string,
  /**
   * Consigne seule de l'exercice (sans l'introduction). En mode fusionné
   * (`options.mergeExercises`) elle est recopiée en tête de chaque question,
   * juste après son numéro, plutôt qu'affichée une seule fois avant la liste :
   * une question isolée au milieu du flux fusionné garde ainsi son énoncé
   * d'action. Ignorée hors mode fusionné (c'est `intro` qui est affiché).
   */
  consigne = '',
  /**
   * Introduction seule de l'exercice (sans la consigne) : en mode fusionné,
   * c'est elle — et non `intro`, qui contient aussi la consigne — qui reste
   * affichée une fois avant la liste des questions.
   */
  introduction = '',
): ExerciseBodyResult {
  // Colonnes des propositions de QCM : réglables par exercice depuis la
  // palette (`#let ex1-qcm-colonnes`), comme les colonnes des questions. En
  // mode export la valeur est écrite littéralement dans le `#tasks(...)`,
  // ces variables de plomberie n'ayant pas de sens hors de l'éditeur intégré.
  const qcmColumnsExpr =
    tasksPrefix == null
      ? DEFAULT_QCM_COLUMNS
      : exportMode
        ? (qcmLayoutOverride?.columns ?? QCM_COLUMNS_FROM_CONTENT)
        : `${tasksPrefix}-qcm-colonnes`
  const parts: string[] = []
  let questionList = questions
  // en mode export, ou sans préfixe (pas de variable `exN-numerotation`
  // possible), le motif est résolu ici, en JS ; sinon `label` référence
  // cette variable de la palette de mise en page, dont la valeur (y compris
  // `none`) n'est connue qu'à la compilation Typst — voir `boldableLabel`.
  let label =
    exportMode || tasksPrefix == null
      ? (layoutOverride?.numbering ??
        questionNumberingLabel(options.questionNumberingStyle))
      : `${tasksPrefix}-numerotation`
  let labelIsVariableRef = !exportMode && tasksPrefix != null
  // Hors fusion, certains exercices portent déjà leurs propres repères
  // (A =, a), b)...), et ne doivent donc pas recevoir d'étiquette taskize.
  // Dans un groupe fusionné, en revanche, chaque question doit afficher le
  // numéro continu : `startNumber` les compte déjà toutes, y compris celles
  // qui n'étaient pas numérotées isolément.
  if (!numbered && !forceList) {
    label = 'none'
    labelIsVariableRef = false
  }
  // une question unique portant ses propres repères (`a)`, `b)`...) est
  // découpée : ses sous-questions deviennent la liste de premier niveau
  let splitHead = ''
  if (questions.length === 1) {
    const split = splitSubQuestions(questions[0])
    if (split != null) {
      if (split.head.trim().length > 0) {
        const head = htmlToTypst(
          split.head,
          figures,
          zoomVariable,
          undefined,
          qcmColumnsExpr,
          options.boldQuestionNumbers,
        )
        if (head.length > 0) {
          splitHead = head
        }
      }
      questionList = split.items
      // les repères détectés dans le contenu l'emportent toujours sur le
      // réglage (document ou exercice) : ce n'est pas un choix du professeur
      label = split.label
      labelIsVariableRef = false
    }
  }
  const converted = questionList
    .map((question) =>
      htmlToTypst(
        question,
        figures,
        zoomVariable,
        undefined,
        qcmColumnsExpr,
        options.boldQuestionNumbers,
      ),
    )
    .filter((question) => question.length > 0)
  // une figure `vraieGrandeur` (voir mathalea2d.ts) ne se réduit jamais pour
  // tenir dans une colonne plus étroite (`force-true-size: true`, posé par
  // `mathalea2dContainerToTypst`) : sans ce repérage, elle empiéterait sur la
  // question voisine dès que l'exercice a plus d'une colonne — voir
  // `trueSizeFigureTasksPrefixes`, même logique que les QCM à figures
  // (`qcmHasFigure`).
  const hasTrueSizeFigure = converted.some((question) =>
    question.includes('force-true-size: true'),
  )
  // taskize ne sait pas résoudre `auto-fit` pour une liste dont tous les
  // items contiennent une autre grille tasks (cas de plusieurs QCM) : sa
  // sélection de colonnes devient `none`, puis échoue dans render-tasks-grid.
  // La grille intérieure des propositions garde, elle, son auto-fit.
  const hasNestedTasks = converted.some((question) =>
    question.includes('#tasks('),
  )
  // Les paragraphes imposent déjà plusieurs lignes : ne pas lancer les
  // mesures auto-fit coûteuses de taskize. Un choix manuel reste prioritaire.
  const hasParagraphs =
    options.questionsColumns === 'auto' &&
    questionList.some((question) =>
      /<br\s*\/?>\s*<br\s*\/?>|<\/p>\s*<p(?:\s|>)/i.test(question),
    )
  const willBuildList =
    tasksPrefix != null &&
    (converted.length > 1 || (forceList && converted.length === 1))
  // Mode fusionné : la consigne de l'exercice est recopiée en tête de chaque
  // question (juste après son numéro) plutôt qu'affichée une seule fois avant
  // la liste — sans elle, une question isolée au milieu du flux fusionné ne
  // dirait plus quoi faire. L'introduction éventuelle, elle, reste affichée
  // une seule fois avant la liste.
  const consigneInline =
    options.mergeExercises && willBuildList && consigne.trim().length > 0
      ? htmlToTypst(
          consigne,
          figures,
          zoomVariable,
          undefined,
          qcmColumnsExpr,
          options.boldQuestionNumbers,
        )
      : ''
  // une consigne qui se rend sur plusieurs lignes (bloc) ne peut pas être
  // glissée en tête d'item derrière un simple retour à la ligne : on garde
  // alors l'affichage classique, une fois avant la liste
  const repeatConsigne =
    consigneInline.length > 0 && !consigneInline.includes('\n')
  const introToRender = repeatConsigne ? introduction : intro
  if (introToRender.trim().length > 0) {
    parts.push(
      htmlToTypst(
        introToRender,
        figures,
        zoomVariable,
        undefined,
        qcmColumnsExpr,
        options.boldQuestionNumbers,
      ),
    )
  }
  if (splitHead.length > 0) {
    parts.push(splitHead)
  }
  // une liste d'au moins deux questions est mise dans un environnement
  // `tasks` : le nombre de colonnes et l'espacement sont réglables par
  // exercice (`#let ex1-colonnes = ...` en tête de document) ; les
  // questions non numérotées (l'exercice écrit ses propres repères)
  // gardent l'environnement mais sans étiquette. Une question unique
  // rejoint aussi l'environnement quand l'exercice est fusionné : sinon
  // elle resterait sans numéro alors que la suite du groupe est numérotée.
  if (willBuildList) {
    // les items d'une même liste doivent se suivre sans ligne vide, sinon
    // la numérotation repart à 1 ; les lignes suivantes d'un item restent
    // indentées à l'intérieur de celui-ci ; en mode « après chaque question »,
    // chaque item (y compris le dernier) se termine par le bloc de lignes,
    // qui reste ainsi dans la liste (indenté avec l'item)
    const items = converted.map((question) => {
      // mode fusionné : la consigne précède l'énoncé, sur sa propre ligne
      // (`\` = retour à la ligne Typst), pour se lire juste après le numéro
      const body = repeatConsigne
        ? `${consigneInline} \\\n${question}`
        : question
      const item = `  + ${body.split('\n').join('\n    ')}`
      if (writingLines?.position === 'afterEachQuestion') {
        return `${item}\n\n    ${writingLinesCall(writingLines)}`
      }
      return item
    })
    // `above`/`below` : sans eux, la liste colle au texte qui la précède et
    // la suit (les fractions dfrac, plus hautes, rendent ce collage très
    // visible : le dernier item peut chevaucher le paragraphe suivant)
    // Le repère `mathalea-anchor` (invisible) permet à la palette de mise en
    // page de l'aperçu de placer ses contrôles à côté de l'environnement ;
    // les corrections (préfixe `exN-corr`) ont leurs propres réglages
    const anchorKind = tasksPrefix.endsWith('-corr') ? 'tasks-corr' : 'tasks'
    const anchorLine = emitAnchor
      ? `#mathalea-anchor("${anchorKind}", ${parseInt(tasksPrefix.slice(2), 10)})\n`
      : ''
    const columnsExpr = exportMode
      ? (layoutOverride?.columns ??
        (hasTrueSizeFigure || hasNestedTasks || hasParagraphs
          ? '1'
          : questionsColumnsLiteral(options.questionsColumns)))
      : `${tasksPrefix}-colonnes`
    const gutterExpr = exportMode
      ? (layoutOverride?.gutter ?? `${options.questionsGutter}em`)
      : `${tasksPrefix}-gutter`
    // repéré par `trueSizeFigureTasksPrefixes` pour donner par défaut une
    // seule colonne à cet exercice en mode aperçu (le mode export a déjà
    // résolu `columnsExpr` ci-dessus, ce marqueur ne lui sert à rien)
    const tasksMarkers = !exportMode
      ? [
          hasTrueSizeFigure ? TRUE_SIZE_FIGURE_MARKER : '',
          hasNestedTasks ? NESTED_TASKS_MARKER : '',
          hasParagraphs ? PARAGRAPH_TASKS_MARKER : '',
        ]
          .filter((marker) => marker.length > 0)
          .join(' ')
      : ''
    parts.push(
      `${anchorLine}#tasks(columns: ${columnsExpr}, label: ${boldableLabel(label, options.boldQuestionNumbers, labelIsVariableRef)}, row-gutter: ${gutterExpr}, above: 1.2em, below: 0.8em, start: ${startNumber})[${tasksMarkers.length > 0 ? ` ${tasksMarkers}` : ''}\n${items.join('\n')}\n]`,
    )
    return {
      code: appendEndOfExerciseLines(parts.join('\n\n'), writingLines),
      itemCount: converted.length,
    }
  }
  parts.push(...converted)
  // Pas de liste `tasks`, donc pas de repère émis plus haut : un exercice à
  // question unique dont l'énoncé contient un QCM en a pourtant besoin, sinon
  // la palette n'a nulle part où afficher son réglage de colonnes.
  // pas de liste `tasks` : « après chaque question » n'a nulle part où
  // s'intercaler, les lignes sont donc posées à la fin du corps
  const body = appendEndOfExerciseLines(parts.join('\n\n'), writingLines, {
    force: true,
  })
  const anchorLine =
    emitAnchor &&
    !exportMode &&
    tasksPrefix != null &&
    body.includes(qcmColumnsExpr)
      ? `#mathalea-anchor("${tasksPrefix.endsWith('-corr') ? 'tasks-corr' : 'tasks'}", ${parseInt(tasksPrefix.slice(2), 10)})\n`
      : ''
  return {
    code: anchorLine + body,
    itemCount: 0,
  }
}

/**
 * Appel Typst du helper de lignes en pointillés (voir
 * `MATHALEA_WRITING_LINES_HELPER`), tagué d'un marqueur identifiant
 * l'exercice et l'emplacement, relu par `harvestCarryOver` à la régénération.
 */
function writingLinesCall(
  writingLines: WritingLinesSetting & { num: number },
): string {
  const tag = writingLines.position === 'endOfExercise' ? 'fin' : 'apres'
  return `#mathalea-lignes(${writingLines.count}, gutter: ${writingLines.spacing}em, style: "${writingLines.style}") // mathalea:lignes-${tag}(${writingLines.num})`
}

/**
 * Ajoute le bloc de lignes en fin de corps d'exercice, si demandé.
 *
 * `force` sert au mode « après chaque question » quand l'exercice n'a pas de
 * liste `tasks` où intercaler les lignes (question unique, ou énoncé d'un
 * seul bloc) : sans lui, un tel exercice n'aurait aucune ligne alors que le
 * réglage — souvent celui du document, donc appliqué à toute la fiche — en
 * demande. Le marqueur émis reste celui de l'emplacement choisi, pour que la
 * palette le relise inchangé.
 */
function appendEndOfExerciseLines(
  code: string,
  writingLines?: WritingLinesSetting & { num: number },
  { force = false }: { force?: boolean } = {},
): string {
  if (writingLines == null || code.trim().length === 0) return code
  if (writingLines.position !== 'endOfExercise' && !force) return code
  return `${code}\n\n${writingLinesCall(writingLines)}`
}

/** Contenu Typst (définitions + rendu) d'une version du sujet */
interface VersionContent {
  bankLines: string[]
  renderLines: string[]
  hasCorrections: boolean
}

/** Lettre affichée pour une version 0-based (0 → A, 1 → B...) */
function versionLetter(version: number): string {
  return String.fromCharCode(65 + version)
}

/** Énoncé et correction générés pour un exercice, avant surcharge éventuelle */
interface GeneratedExercise {
  enonce: string
  correction: string | null
  /**
   * URL de l'exercice seul, à passer en paramètre `qr:` de `exo.with(...)` :
   * le paquet exercise-bank génère et place lui-même le QR-code.
   */
  qrUrl?: string
  /**
   * Réglage de lignes en pointillés appliqué à cet exercice (palette), pour
   * le réémettre après une surcharge de code (voir `buildVersionContent`) :
   * une surcharge remplace tout l'énoncé généré, y compris l'appel posé par
   * `exerciseBody`/`appendEndOfExerciseLines`, sans quoi les lignes du
   * professeur disparaîtraient dès que l'exercice porte une surcharge.
   */
  writingLines?: WritingLinesSetting & { num: number }
}

/**
 * Calcule l'énoncé et la correction générés de chaque exercice, sans
 * appliquer les surcharges de code Typst manuelles (`carryOver.codeOverrides`) :
 * partagé par `buildVersionContent` (assemblage du document complet, qui
 * applique les surcharges après coup sur `enonce`) et par
 * `getGeneratedExerciseCode` (préremplissage de la modale d'édition avec le
 * code actuellement généré d'un seul exercice, avant toute surcharge).
 */
function computeGeneratedExercises(
  allExercises: TypstExerciseInput[],
  options: TypstDocumentOptions,
  carryOver: TypstCarryOver,
  figures: string[],
  emitAnchors: boolean,
  /** Voir `exerciseBody` : colonnes/espacement des `#tasks(...)` en valeurs littérales */
  exportMode = false,
): GeneratedExercise[] {
  // seul point de passage des corrections vers le code généré (avec le mode
  // « Course aux nombres ») : le réglage « Correction minimale » s'y applique
  const exercises = withMinimalCorrections(allExercises, options)
  // exercice fusionné avec le précédent (bouton de la palette) : rejoint le
  // groupe `exo.with(...)` de son prédécesseur (un seul titre pour le
  // groupe). Sans effet quand tous les exercices sont déjà fusionnés
  // (`options.mergeExercises`, branche sans banque ci-dessous).
  const mergedWithPrevious = exercises.map(
    (_, k) =>
      k > 0 &&
      !options.mergeExercises &&
      (carryOver.merges?.includes(k + 1) ?? false),
  )
  // exercice appartenant à un groupe fusionné (avec le précédent et/ou le
  // suivant), global ou local : une question unique y rejoint quand même
  // l'environnement `tasks` pour être numérotée à la suite des autres (voir
  // `forceList` dans exerciseBody), et son QR-code individuel disparaît.
  const isGrouped = exercises.map(
    (_, k) =>
      options.mergeExercises ||
      mergedWithPrevious[k] ||
      (mergedWithPrevious[k + 1] ?? false),
  )
  // en mode fusionné (global ou local), les questions sont numérotées à la
  // suite d'un exercice à l'autre plutôt que de repartir à 1
  let nextStart = 1
  let nextCorrectionStart = 1
  return exercises.map((exercise, k) => {
    // lignes en pointillés de cet exercice (palette, énoncé seulement,
    // jamais dans la correction)
    // à défaut de réglage propre à cet exercice (palette), les lignes de
    // réponse du document (`answerLines`) s'appliquent en fin d'exercice
    const writingLinesSetting =
      carryOver.writingLines?.[k + 1] ??
      (options.answerLines > 0
        ? {
            position: options.answerLinesPosition,
            count: options.answerLines,
            spacing: 2,
            style: options.answerLinesStyle,
          }
        : null)
    const writingLines =
      writingLinesSetting == null
        ? undefined
        : { num: k + 1, ...writingLinesSetting }
    const continued = options.mergeExercises || mergedWithPrevious[k]
    if (exercise.warning != null) {
      if (!continued) nextStart = 1
      return {
        enonce: `#text(fill: gray)[_${escapeTypstText(exercise.warning)}_]`,
        correction: null,
      }
    }
    // QR-code vers l'exercice seul (mode banque, exercice non fusionné
    // uniquement : dans un groupe fusionné (global ou local) il n'y a pas de
    // bloc `exo.with(...)` par exercice où l'accrocher, la case est donc
    // désactivée dans ce cas). Le paquet exercise-bank génère et place le
    // QR-code lui-même à partir de cette URL (voir `buildVersionContent`).
    const qrUrl =
      options.showQrCode &&
      !isGrouped[k] &&
      exercise.url != null &&
      exercise.url.length > 0
        ? exercise.url
        : undefined
    if (!continued) nextStart = 1
    // exercice statique sans source .typ/_cor.typ (juste une image scannée) :
    // énoncé et correction se règlent indépendamment, chacun avec sa propre
    // variable de zoom (une source .typ peut exister pour l'un sans l'autre)
    const enonceZoomVariable = exercise.isStaticImage
      ? `exo-${k + 1}-zoom`
      : undefined
    const correctionZoomVariable = exercise.isStaticCorrectionImage
      ? `exo-${k + 1}-corr-zoom`
      : undefined
    const enonce = exerciseBody(
      exercise.intro,
      exercise.questions,
      exercise.numbered,
      figures,
      `ex${k + 1}`,
      options,
      nextStart,
      emitAnchors,
      isGrouped[k],
      writingLines,
      exportMode,
      carryOver.tasksLayout?.[`ex${k + 1}`],
      carryOver.tasksLayout?.[`ex${k + 1}-qcm`],
      enonceZoomVariable,
      exercise.consigne ?? '',
      exercise.introduction ?? '',
    )
    nextStart += enonce.itemCount
    let correction: string | null = null
    if (exercise.corrections.length > 0) {
      if (!continued) nextCorrectionStart = 1
      // préfixe distinct : la mise en page de la correction (colonnes,
      // espacement) se règle indépendamment de celle de l'énoncé
      const body = exerciseBody(
        exercise.introCorrection,
        exercise.corrections,
        exercise.numbered,
        figures,
        `ex${k + 1}-corr`,
        options,
        nextCorrectionStart,
        emitAnchors,
        isGrouped[k],
        undefined,
        exportMode,
        carryOver.tasksLayout?.[`ex${k + 1}-corr`],
        carryOver.tasksLayout?.[`ex${k + 1}-corr-qcm`],
        correctionZoomVariable,
      )
      nextCorrectionStart += body.itemCount
      correction = body.code
    }
    return {
      enonce: exercise.isStaticImage
        ? applyImageCuts(
            enonce.code,
            carryOver.imageCuts?.[k + 1]?.enonce,
            k + 1,
            'enonce',
          )
        : enonce.code,
      correction:
        correction != null && exercise.isStaticCorrectionImage
          ? applyImageCuts(
              correction,
              carryOver.imageCuts?.[k + 1]?.correction,
              k + 1,
              'correction',
            )
          : correction,
      qrUrl,
      writingLines,
    }
  })
}

/**
 * Renumérote les réglages et références des figures avant un échange
 * d'exercices. Chaque bloc comprend les figures de l'énoncé et du corrigé ;
 * les sujets supplémentaires ont leur propre nombre de figures.
 */
export function swapExerciseFigures(
  carryOver: TypstCarryOver,
  versions: TypstExerciseInput[][],
  options: TypstDocumentOptions,
  numA: number,
  numB: number,
): TypstCarryOver {
  options = normalizeTypstLayoutOptions(options)
  const globalPermutation = new Map<number, number>()
  const localPermutations: Map<number, number>[] = []
  let offset = 0
  for (const exercises of versions) {
    const figures: string[] = []
    const blocks = exercises.map((exercise) => {
      const start = figures.length
      if (options.canMode) {
        computeGeneratedCanRows([exercise], options, figures)
      } else {
        computeGeneratedExercises([exercise], options, {}, figures, false)
      }
      return Array.from(
        { length: figures.length - start },
        (_, index) => start + index + 1,
      )
    })
    ;[blocks[numA - 1], blocks[numB - 1]] = [blocks[numB - 1], blocks[numA - 1]]
    const local = new Map<number, number>()
    blocks.flat().forEach((oldNum, index) => {
      local.set(oldNum, index + 1)
      globalPermutation.set(offset + oldNum, offset + index + 1)
    })
    localPermutations.push(local)
    offset += figures.length
  }
  const remap = (
    carry: TypstCarryOver,
    permutation: Map<number, number>,
  ): TypstCarryOver => {
    const result = { ...carry }
    for (const key of ['figureZoom', 'figureAlign'] as const) {
      if (carry[key] != null) {
        const entries = Object.entries(carry[key]).map(([num, value]) => [
          permutation.get(Number(num)) ?? Number(num),
          value,
        ])
        if (key === 'figureZoom')
          result.figureZoom = Object.fromEntries(entries)
        else result.figureAlign = Object.fromEntries(entries)
      }
    }
    for (const key of [
      'codeOverrides',
      'codeOverridesCorrection',
      'codeOverridesCan',
      'codeOverridesCanReponse',
    ] as const) {
      if (carry[key] != null)
        result[key] = Object.fromEntries(
          Object.entries(carry[key]).map(([num, code]) => [
            num,
            code.replace(
              /\bfig-(\d+)\b/g,
              (_, n) => `fig-${permutation.get(Number(n)) ?? Number(n)}`,
            ),
          ]),
        )
    }
    return result
  }
  const result = remap(carryOver, globalPermutation)
  if (carryOver.versions != null)
    result.versions = Object.fromEntries(
      Object.entries(carryOver.versions).map(([version, carry]) => [
        version,
        remap(carry, localPermutations[Number(version)] ?? new Map()),
      ]),
    )
  return result
}

/**
 * Code Typst actuellement généré pour l'énoncé d'un exercice (préremplissage
 * de la modale d'édition), sans appliquer sa surcharge existante : c'est le
 * texte de départ que le professeur affine, pas la surcharge déjà enregistrée
 * (celle-ci est lue directement dans `carryOver.codeOverrides`).
 */
export function getGeneratedExerciseCode(
  exercises: TypstExerciseInput[],
  num: number,
  options: TypstDocumentOptions = defaultTypstDocumentOptions,
  carryOver: TypstCarryOver = {},
): string {
  const figures: string[] = []
  const generated = computeGeneratedExercises(
    exercises,
    options,
    carryOver,
    figures,
    false,
    true,
  )
  return simplifyTypstHighlights(generated[num - 1]?.enonce ?? '')
}

/**
 * Code Typst actuellement généré pour la correction d'un exercice
 * (préremplissage de la modale d'édition), sans appliquer sa surcharge
 * existante — voir `getGeneratedExerciseCode`, pendant pour l'énoncé.
 * @returns le code généré, ou `''` si l'exercice n'a pas de correction
 */
export function getGeneratedCorrectionCode(
  exercises: TypstExerciseInput[],
  num: number,
  options: TypstDocumentOptions = defaultTypstDocumentOptions,
  carryOver: TypstCarryOver = {},
): string {
  const figures: string[] = []
  const generated = computeGeneratedExercises(
    exercises,
    options,
    carryOver,
    figures,
    false,
    true,
  )
  return simplifyTypstHighlights(generated[num - 1]?.correction ?? '')
}

/**
 * Code Typst autonome (compilable seul avec `typst compile`) d'un exercice :
 * préambule minimal (imports, aides et réglages réellement utilisés par son
 * contenu) suivi de son code. Pour le bouton « Copier avec le préambule »
 * de la modale d'édition : contrairement au fragment inséré dans la fiche
 * complète (qui référence des variables et aides définies ailleurs dans le
 * document), ce code ne dépend de rien d'externe.
 *
 * `codeOverride`, s'il est fourni, remplace le code généré de l'exercice
 * (reprend le brouillon en cours d'édition dans la modale, avec ses
 * éventuelles retouches manuelles) ; les figures SVG restent celles du
 * contenu d'origine de l'exercice (jamais stockées dans le texte du
 * brouillon, seulement référencées par `fig-N`).
 * `part` sélectionne l'énoncé (défaut) ou la correction de l'exercice.
 */
export function buildStandaloneExerciseCode(
  exercises: TypstExerciseInput[],
  num: number,
  options: TypstDocumentOptions = defaultTypstDocumentOptions,
  carryOver: TypstCarryOver = {},
  codeOverride?: string,
  part: 'enonce' | 'correction' = 'enonce',
): string {
  options = normalizeTypstLayoutOptions(options)
  const figures: string[] = []
  const generated = computeGeneratedExercises(
    exercises,
    options,
    carryOver,
    figures,
    false,
    true,
  )
  const generatedPart =
    part === 'correction'
      ? generated[num - 1]?.correction
      : generated[num - 1]?.enonce
  const code = codeOverride ?? generatedPart ?? ''
  const codeLines = code.split('\n')
  const {
    usesMathaleaFigure,
    usesTasks,
    usesQcm,
    usesSchema,
    usesWritingLines,
    usesCetz,
    usesCtz,
    usesCetzPlotChart,
  } = detectUsedFeatures(codeLines)
  const usesFigures = figures.length > 0

  const lines: string[] = []
  const importLines: string[] = []
  if (usesTasks) importLines.push(TASKIZE_IMPORT, MATHALEA_TASKS_HELPER)
  if (options.autoVerticalSpacing) importLines.push(BREATHER_IMPORT)
  // `ctz-euclide` réexporte `cetz` : quand il est présent, on ne redéclare
  // pas l'import `cetz` autonome (versions différentes, `cetz` doit résoudre
  // vers celle du paquet pour le `import cetz.draw: *` des figures d'annales)
  if (usesCtz) importLines.push(CTZ_EUCLIDE_IMPORT)
  else if (usesCetz) importLines.push(CETZ_IMPORT)
  if (usesCetzPlotChart) importLines.push(CETZ_PLOT_CHART_IMPORT)
  if (importLines.length > 0) lines.push(...importLines, '')
  if (usesSchema) lines.push(MATHALEA_SCHEMA_HELPER, '')
  if (usesFigures) {
    lines.push(
      MATHALEA_FIT_HELPER,
      IMAGE_SLICE_HELPER,
      '',
      stripAnchorCall(MATHALEA_FIGURE_BLOCK_HELPER),
      '',
    )
  }
  if (usesMathaleaFigure) lines.push(MATHALEA_FIGURE_HELPERS, '')
  if (usesWritingLines) lines.push(MATHALEA_WRITING_LINES_HELPER, '')
  lines.push(`#let couleur = ${options.badgeColor}`)
  lines.push(`#let police-texte = ${typstString(options.font)}`)
  lines.push(`#let police-maths = ${typstString(options.mathFont)}`)
  lines.push(`#let taille-texte = ${options.fontSize}pt`)
  if (usesQcm) {
    // Repli des chemins sans réglage par exercice (tableau « Course aux
    // nombres ») : la fiche, elle, passe `exN-qcm-colonnes` (voir `exerciseBody`)
    lines.push('#let qcm-colonnes = 2 // colonnes des propositions de QCM')
  }
  if (usesTasks) {
    lines.push(
      '#tasks-setup(columns: "auto-fit", auto-fit-mode: "uniform", max-columns: 4)',
    )
  }
  lines.push(
    `#set text(font: police-texte, size: taille-texte, lang: "fr", spacing: ${options.wordSpacing}%)`,
  )
  lines.push(`#set par(leading: ${options.lineSpacing}em)`)
  // pas de `numbering` : « 1. » est la valeur par défaut, et le préambule
  // d'une banque externe (inséré plus haut) peut avoir réglé la sienne
  lines.push('#set enum(spacing: 1.2em)')
  lines.push('#show math.equation: set text(font: police-maths)')
  lines.push('#let txt(corps) = text(font: police-texte, corps)')
  lines.push(MATHALEA_INLINE_FORMULA_RULE)
  lines.push('#show math.frac: it => math.display(it)')
  if (options.autoVerticalSpacing) lines.push(BREATHER_CALL)
  if (usesQcm) lines.push(MATHALEA_QCM_HELPERS)
  lines.push('')
  if (usesFigures) {
    const defaultAligns = figureDefaultAligns(code)
    for (const [index, figure] of figures.entries()) {
      const figNum = index + 1
      lines.push(
        `#let fig-${figNum} = ${applyDocumentFontsToFigure(figure, options)}`,
      )
      lines.push(
        `#let fig-${figNum}-zoom = ${carryOver.figureZoom?.[figNum] ?? 1}`,
      )
      lines.push(
        `#let fig-${figNum}-align = ${carryOver.figureAlign?.[figNum] ?? defaultAligns.get(figNum) ?? 'center'}`,
      )
    }
    lines.push('')
  }
  lines.push(code)
  return withTypstHighlights(lines.join('\n'))
}

/**
 * Argument tableau de contenus Typst, une entrée par ligne :
 * `(\n  [...],\n),`. Les contenus multilignes sont réindentés pour rester
 * lisibles dans le code généré.
 */
function typstContentArrayArgument(items: string[], indent: string): string[] {
  return typstArrayArgument(
    items.map((item) => `[${item}]`),
    indent,
  )
}

/**
 * Même chose, pour des éléments qui sont déjà des expressions Typst (un
 * `none`, une `table.cell(...)` d'énoncé partagé) et non des contenus à
 * mettre entre crochets.
 */
function typstArrayArgument(items: string[], indent: string): string[] {
  if (items.length === 0) return [`${indent}(),`]
  return [
    `${indent}(`,
    ...items.map(
      (item) => `${indent}  ${item.split('\n').join(`\n${indent}  `)},`,
    ),
    `${indent}),`,
  ]
}

/**
 * Largeur maximale (pt) d'une figure dans la colonne « Énoncé » du tableau
 * « Course aux nombres ». Les figures mathalea2d sont dessinées pour la
 * pleine largeur du navigateur : laissées à leur taille (plafonnée seulement
 * par la largeur de la colonne, voir `mathalea-figure-block`), elles
 * remplissent toute la cellule et la feuille de passation double de volume.
 * Même ordre de grandeur que `TABLE_CELL_FIGURE_MAX_WIDTH_PT`, le plafond des
 * figures des autres tableaux.
 */
const CAN_FIGURE_MAX_WIDTH_PT = 120

/** Une ligne (générée, sans surcharge) du tableau « Course aux nombres » */
interface GeneratedCanRow {
  enonce: string
  reponse: string
  correction: string
  /** Numéro (1-based) de l'exercice dont vient la ligne */
  exerciseNum: number
  /** Vrai pour la première ligne de son exercice (repère `exo`) */
  isFirstOfExercise: boolean
  /**
   * Nombre de lignes sur lesquelles s'étend la cellule « Énoncé » : 1 pour
   * une question ordinaire, davantage quand les questions suivantes lui sont
   * liées et partagent son énoncé (voir `TypstExerciseInput.canLinkedTo`).
   */
  enonceRowspan: number
  /** Vrai pour une ligne dont l'énoncé est celui d'une ligne précédente */
  sharesPreviousEnonce: boolean
}

/**
 * Répartit les questions d'un exercice « Course aux nombres » en groupes de
 * questions liées : la question qui porte l'énoncé, suivie de celles qui le
 * partagent (`canLinkedTo` cite le `canLinkNumbers` de la première). Renvoie,
 * pour chaque question, le nombre de lignes que couvre sa cellule d'énoncé
 * (0 si elle n'en a pas, l'énoncé étant celui d'une question précédente) —
 * équivalent du `\SetCell[r=n]` de la sortie LaTeX (`lib/Latex.ts`).
 */
function computeCanEnonceRowspans(
  linkedTo: number[][] | undefined,
  linkNumbers: number[] | undefined,
  questionCount: number,
): number[] {
  const rowspans = Array.from({ length: questionCount }, () => 1)
  if (linkedTo == null || linkNumbers == null) return rowspans
  for (let i = 0; i < questionCount; i++) {
    if (rowspans[i] === 0 || (linkedTo[i]?.length ?? 0) === 0) continue
    // seules les questions qui suivent immédiatement partagent l'énoncé :
    // deux questions liées mais séparées par une autre resteraient sur des
    // lignes non contiguës, qu'une cellule fusionnée ne peut pas couvrir
    for (let j = i + 1; j < questionCount; j++) {
      if (!(linkedTo[j] ?? []).includes(linkNumbers[i])) break
      rowspans[j] = 0
      rowspans[i]++
    }
  }
  return rowspans
}

/**
 * Calcule les lignes générées du tableau « Course aux nombres » (une par
 * question de chaque exercice), sans appliquer les surcharges manuelles
 * (`carryOver.codeOverridesCan`/`codeOverridesCanReponse`) : partagé par
 * `buildCanVersionContent` (assemblage du tableau, qui applique les
 * surcharges après coup) et par `getGeneratedCanRowCode` (préremplissage de
 * la modale d'édition d'une ligne avec son contenu actuellement généré,
 * avant toute surcharge) — pendant, à l'échelle d'une ligne, de
 * `computeGeneratedExercises`.
 */
function computeGeneratedCanRows(
  allExercises: TypstExerciseInput[],
  options: TypstDocumentOptions,
  figures: string[],
): GeneratedCanRow[] {
  const exercises = withMinimalCorrections(allExercises, options)
  const rows: GeneratedCanRow[] = []
  for (const [k, exercise] of exercises.entries()) {
    if (exercise.warning != null) {
      rows.push({
        enonce: escapeTypstText(exercise.warning),
        reponse: '',
        correction: '',
        exerciseNum: k + 1,
        isFirstOfExercise: true,
        enonceRowspan: 1,
        sharesPreviousEnonce: false,
      })
      continue
    }
    const questions = exercise.canQuestions ?? exercise.questions
    const rowspans = computeCanEnonceRowspans(
      exercise.canLinkedTo,
      exercise.canLinkNumbers,
      questions.length,
    )
    for (const [i, question] of questions.entries()) {
      rows.push({
        // une question liée à la précédente n'a pas d'énoncé propre : c'est
        // la cellule de la première du groupe qui couvre sa ligne
        enonce:
          rowspans[i] === 0
            ? ''
            : htmlToTypst(
                question,
                figures,
                undefined,
                CAN_FIGURE_MAX_WIDTH_PT,
                undefined,
                options.boldQuestionNumbers,
              ),
        reponse: htmlToTypst(
          exercise.canAnswers?.[i] ?? '',
          figures,
          undefined,
          CAN_FIGURE_MAX_WIDTH_PT,
          undefined,
          options.boldQuestionNumbers,
        ),
        correction: htmlToTypst(
          exercise.corrections[i] ?? '',
          figures,
          undefined,
          undefined,
          undefined,
          options.boldQuestionNumbers,
        ),
        exerciseNum: k + 1,
        isFirstOfExercise: i === 0,
        enonceRowspan: Math.max(1, rowspans[i]),
        sharesPreviousEnonce: rowspans[i] === 0,
      })
    }
  }
  return rows
}

/**
 * Code Typst actuellement généré pour l'énoncé et la réponse d'une ligne du
 * tableau « Course aux nombres » (préremplissage de la modale d'édition),
 * sans appliquer sa surcharge existante — voir `getGeneratedExerciseCode`,
 * pendant à l'échelle d'un exercice.
 */
export function getGeneratedCanRowCode(
  exercises: TypstExerciseInput[],
  row: number,
  options: TypstDocumentOptions = defaultTypstDocumentOptions,
): { enonce: string; reponse: string; sharesPreviousEnonce: boolean } {
  const rows = computeGeneratedCanRows(exercises, options, [])
  const found = rows[row - 1]
  return {
    enonce: found?.enonce ?? '',
    reponse: found?.reponse ?? '',
    // une question liée à la précédente n'a pas de cellule « Énoncé » : il
    // n'y a rien à y surcharger (voir `buildCanVersionContent`)
    sharesPreviousEnonce: found?.sharesPreviousEnonce ?? false,
  }
}

/**
 * Contenu d'une version en mode « Course aux nombres » : toutes les questions
 * de tous les exercices dans un seul tableau (`#can-tableau`), puis les
 * corrections numérotées à la suite — équivalent du style « Can » de la
 * sortie LaTeX (`lib/Latex.ts`). La consigne et l'introduction des exercices
 * ne sont pas reprises, comme en LaTeX : le tableau ne montre que les énoncés.
 *
 * La palette de mise en page n'y garde que les repères qui ont un sens : la
 * barre de chaque exercice (repère `exo` placé dans sa première cellule, une
 * métadonnée n'occupant aucune place), le repère de chaque ligne (`can-row`,
 * édition de son énoncé/réponse) et les deux points d'insertion qui
 * encadrent le tableau (`gap` 0 et `gap` du dernier exercice) — entre deux
 * lignes d'un même tableau, une insertion ou un saut de page n'en aurait pas.
 * Les insertions portées par les gaps intermédiaires (héritées d'un passage
 * par le mode fiche) sont donc réémises après le tableau, avec les siennes.
 */
function buildCanVersionContent(
  allExercises: TypstExerciseInput[],
  options: TypstDocumentOptions,
  carryOver: TypstCarryOver,
  figures: string[],
  emitAnchors: boolean,
  exportMode: boolean,
  /** Nom du sujet (« Sujet A »...), affiché sur la section Corrections quand la fiche a plusieurs versions */
  versionLabel?: string,
): VersionContent {
  const exercises = withMinimalCorrections(allExercises, options)
  const generatedRows = computeGeneratedCanRows(allExercises, options, figures)
  const enonces: string[] = []
  const reponses: string[] = []
  const corrections: string[] = []
  generatedRows.forEach((row, index) => {
    const rowNum = index + 1
    const exoAnchor =
      emitAnchors && row.isFirstOfExercise
        ? `#mathalea-anchor("exo", ${row.exerciseNum})\n`
        : ''
    const rowAnchor = emitAnchors
      ? `#mathalea-anchor("can-row", ${rowNum})\n`
      : ''
    const enonceOverride = carryOver.codeOverridesCan?.[rowNum]
    const reponseOverride = carryOver.codeOverridesCanReponse?.[rowNum]
    // Une question liée à la précédente n'a pas de cellule « Énoncé » : la
    // cellule de la première question du groupe couvre sa ligne
    // (`table.cell(rowspan: …)`), et `none` indique au helper de ne pas en
    // ouvrir une nouvelle. Son repère de ligne (bouton d'édition de la
    // palette) part alors dans sa cellule « Réponse », la seule qui lui
    // reste.
    const enonce =
      enonceOverride == null
        ? row.enonce
        : exportMode
          ? enonceOverride
          : wrapCodeOverrideCan(rowNum, enonceOverride)
    if (row.sharesPreviousEnonce) {
      enonces.push('none')
    } else {
      const contenu = `[${exoAnchor}${rowAnchor}${enonce}]`
      enonces.push(
        row.enonceRowspan > 1
          ? `table.cell(rowspan: ${row.enonceRowspan}, breakable: false, ${contenu})`
          : contenu,
      )
    }
    const reponse =
      reponseOverride == null
        ? row.reponse
        : exportMode
          ? reponseOverride
          : wrapCodeOverrideCanReponse(rowNum, reponseOverride)
    reponses.push(
      row.sharesPreviousEnonce ? `${exoAnchor}${rowAnchor}${reponse}` : reponse,
    )
    corrections.push(row.correction)
  })

  const insertionLine = (line: string, indent: string): string =>
    exportMode ? `${indent}${line}` : `${indent}${line} ${INSERTION_TAG}`
  const lastGap = exercises.length
  const renderLines: string[] = ['// ----- Course aux nombres -----']
  renderLines.push('#en-colonnes[')
  if (emitAnchors) renderLines.push('  #mathalea-anchor("gap", 0)')
  renderLines.push(
    ...(carryOver.insertions?.[0] ?? []).map((line) =>
      insertionLine(line, '  '),
    ),
  )
  renderLines.push('  #can-tableau(')
  // largeur de la colonne « Réponse » : variable du préambule (réglable depuis
  // la palette) ou, hors de l'éditeur, valeur littérale quand elle diffère
  if (exportMode) {
    const width = carryOver.canAnswerWidth ?? CAN_ANSWER_WIDTH_DEFAULT
    if (width !== CAN_ANSWER_WIDTH_DEFAULT)
      renderLines.push(`    reponse: ${width},`)
  } else {
    renderLines.push('    reponse: can-reponse,')
    if (emitAnchors)
      renderLines.push(
        '    repere: dx => mathalea-anchor("can-table", 0, dx: dx),',
      )
  }
  // En A5, la fiche de passation garde la même police que l'A4 alors que les
  // figures (repères, courbes) sont plafonnées à une largeur en pt absolus :
  // le texte y paraît surdimensionné à côté d'elles. On le rabaisse pour
  // retrouver le rapport texte/figure de l'A4 (0,85 ≈ A5/A4 en diagonale,
  // arrondi vers le haut pour rester lisible).
  if (options.pageFormat === 'a5') renderLines.push('    taille: 0.85em,')
  renderLines.push(...typstArrayArgument(enonces, '    '))
  renderLines.push(...typstContentArrayArgument(reponses, '    '))
  renderLines.push('  )')
  if (emitAnchors) renderLines.push(`  #mathalea-anchor("gap", ${lastGap})`)
  for (const [num, lines] of Object.entries(carryOver.insertions ?? {})) {
    if (Number(num) === 0) continue
    renderLines.push(...lines.map((line) => insertionLine(line, '  ')))
  }
  renderLines.push(']')
  renderLines.push('')

  const hasCorrections = corrections.some(
    (correction) => correction.trim().length > 0,
  )
  if (hasCorrections) {
    renderLines.push('// ----- Corrections -----')
    renderLines.push('#if corrige [')
    renderLines.push('  // les corrections commencent sur une nouvelle page')
    renderLines.push(`  ${sectionPageBreak(options)}`)
    const url = ficheUrl(exercises)
    renderLines.push(
      ...correctionsHeadingLines(versionLabel, options.hideVersionLabel, url),
    )
    renderLines.push('  #en-colonnes[')
    // Une seule liste numérotée pour toutes les questions : ses numéros
    // suivent ceux des lignes du tableau (les items doivent donc se suivre
    // sans ligne vide, sinon la numérotation repart à 1). L'environnement
    // `tasks` répartit les réponses sur plusieurs colonnes — indispensable
    // avec le réglage « Correction minimale », où chaque item tient en
    // quelques caractères — et le nombre de colonnes se règle depuis la
    // palette de l'aperçu, comme les listes de questions des exercices.
    const layout = carryOver.tasksLayout?.[CAN_CORRECTIONS_PREFIX]
    const columnsExpr = exportMode
      ? (layout?.columns ?? questionsColumnsLiteral(options.questionsColumns))
      : `${CAN_CORRECTIONS_PREFIX}-colonnes`
    const gutterExpr = exportMode
      ? (layout?.gutter ?? `${options.questionsGutter}em`)
      : `${CAN_CORRECTIONS_PREFIX}-gutter`
    const numberingExpr = exportMode
      ? (layout?.numbering ??
        questionNumberingLabel(options.questionNumberingStyle))
      : `${CAN_CORRECTIONS_PREFIX}-numerotation`
    if (emitAnchors) {
      renderLines.push('    #mathalea-anchor("tasks-corr", 0)')
    }
    renderLines.push(
      `    #tasks(columns: ${columnsExpr}, label: ${boldableLabel(numberingExpr, options.boldQuestionNumbers, !exportMode)}, row-gutter: ${gutterExpr}, above: 1.2em, below: 0.8em, start: 1)[`,
    )
    for (const correction of corrections) {
      renderLines.push(`      + ${correction.split('\n').join('\n        ')}`)
    }
    renderLines.push('    ]')
    renderLines.push('  ]')
    renderLines.push(']')
    renderLines.push('')
  }
  return { bankLines: [], renderLines, hasCorrections }
}

/**
 * Construit les définitions et le rendu (Énoncés + Corrections) d'une seule
 * version du sujet. `varPrefix` distingue les variables de banque
 * (`#let <prefix>exN = ...`) d'une version à l'autre ; les variables de mise
 * en page des questions (`exN-colonnes`...) restent, elles, partagées entre
 * toutes les versions d'un même exercice. Chaque sujet émet les mêmes
 * repères pour permettre son édition depuis la palette.
 */
function buildVersionContent(
  exercises: TypstExerciseInput[],
  options: TypstDocumentOptions,
  carryOver: TypstCarryOver,
  figures: string[],
  varPrefix: string,
  emitAnchors: boolean,
  /**
   * Code destiné à être exporté/copié hors de l'appli : voir `exerciseBody`
   * (colonnes/espacement littéraux) et `wrapCodeOverride`/`INSERTION_TAG`
   * (repères de relecture par `harvestCarryOver`, inutiles hors de l'éditeur).
   */
  exportMode = false,
  /** Nom du sujet (« Sujet A »...), affiché sur la section Corrections quand la fiche a plusieurs versions */
  versionLabel?: string,
  /** Repères de régénération individuels pour les sujets B, C... */
  emitVersionExerciseAnchors = false,
): VersionContent {
  // Le carry-over a déjà été sélectionné pour ce sujet par l'appelant.
  const codeOverrideAt = (num: number): string | undefined =>
    carryOver.codeOverrides?.[num]
  const codeOverrideCorrectionAt = (num: number): string | undefined =>
    carryOver.codeOverridesCorrection?.[num]
  // le mode « Course aux nombres » n'a ni banque d'exercices ni titres : tout
  // le contenu tient dans un seul tableau, construit à part
  if (options.canMode) {
    return buildCanVersionContent(
      exercises,
      options,
      carryOver,
      figures,
      emitAnchors,
      exportMode,
      versionLabel,
    )
  }
  /** Insertions de la palette à réémettre après l'exercice `num` */
  const insertionLines = (num: number, indent: string): string[] =>
    (carryOver.insertions?.[num] ?? []).map((line) =>
      exportMode || !emitAnchors
        ? `${indent}${line}`
        : `${indent}${line} ${INSERTION_TAG}`,
    )
  /** Insertions de la palette à réémettre juste avant la correction de l'exercice `num` */
  const insertionCorrectionLines = (num: number, indent: string): string[] =>
    (carryOver.insertionsCorrection?.[num] ?? []).map((line) =>
      exportMode || !emitAnchors
        ? `${indent}${line}`
        : `${indent}${line} ${INSERTION_CORRECTION_TAG}`,
    )
  // Banque d'exercices (paquet exercise-bank) : chaque exercice regroupe
  // son énoncé et sa correction dans un `#let exN = exo.with(...)`, puis
  // la section Énoncés appelle `#exN()` — réordonnez-les librement.
  const bankLines: string[] = []
  // même calcul que dans `computeGeneratedExercises`, nécessaire ici pour le
  // regroupement des exercices fusionnés (bankLines) ci-dessous
  const mergedWithPrevious = exercises.map(
    (_, k) =>
      k > 0 &&
      !options.mergeExercises &&
      (carryOver.merges?.includes(k + 1) ?? false),
  )
  const generated = computeGeneratedExercises(
    exercises,
    options,
    carryOver,
    figures,
    emitAnchors,
    exportMode,
  )
  const hasCorrections = generated.some((g) => g.correction != null)
  // surcharge manuelle (modale d'édition de la palette) : remplace le code
  // émis pour l'exercice concerné, sans QR-code dans le rendu final (ses
  // figures et son décompte de questions restent ceux du texte généré,
  // calculés par computeGeneratedExercises avant la surcharge). En mode
  // export, le repère de relecture (`wrapCodeOverride`) n'a pas d'utilité :
  // rien ne relit plus jamais ce code exporté.
  const built = generated.map((g, k) => {
    const override = codeOverrideAt(k + 1)
    const correctionOverride = codeOverrideCorrectionAt(k + 1)
    // une surcharge remplace l'énoncé entier généré par `exerciseBody`, donc
    // aussi l'appel de lignes en pointillés qu'il y avait posé : on le
    // réémet après coup (`force: true` — la surcharge n'a pas de questions
    // où l'intercaler, la position « après chaque question » retombe donc
    // en fin d'exercice) pour que le réglage de la palette reste visible.
    const overriddenEnonce =
      override == null
        ? g.enonce
        : appendEndOfExerciseLines(
            exportMode ? override : wrapCodeOverride(k + 1, override),
            g.writingLines,
            { force: true },
          )
    return {
      enonce: overriddenEnonce,
      correction:
        g.correction == null
          ? null
          : correctionOverride == null
            ? g.correction
            : exportMode
              ? correctionOverride
              : wrapCodeOverrideCorrection(k + 1, correctionOverride),
    }
  })

  const renderLines: string[] = []
  if (options.mergeExercises) {
    // pas de banque : les contenus sont fusionnés en un seul exercice
    renderLines.push('// ----- Énoncés -----')
    renderLines.push('#en-colonnes[')
    // le repère 0 permet une insertion avant le premier exercice
    if (emitAnchors) renderLines.push('  #mathalea-anchor("gap", 0)')
    renderLines.push(...insertionLines(0, '  '))
    for (const [k, { enonce }] of built.entries()) {
      if (emitAnchors || emitVersionExerciseAnchors)
        renderLines.push(
          `  #mathalea-anchor("${emitAnchors ? 'exo' : 'version-exo'}", ${k + 1})`,
        )
      renderLines.push(indentContentBlock(enonce))
      if (emitAnchors) renderLines.push(`  #mathalea-anchor("gap", ${k + 1})`)
      renderLines.push(...insertionLines(k + 1, '  '))
      renderLines.push('')
    }
    renderLines.push(']')
    renderLines.push('')
    if (hasCorrections) {
      renderLines.push('// ----- Corrections -----')
      renderLines.push('#if corrige [')
      renderLines.push('  // les corrections commencent sur une nouvelle page')
      renderLines.push(`  ${sectionPageBreak(options)}`)
      const url = ficheUrl(exercises)
      renderLines.push(
        ...correctionsHeadingLines(versionLabel, options.hideVersionLabel, url),
      )
      renderLines.push('  #en-colonnes[')
      for (const [k, { correction }] of built.entries()) {
        if (correction == null) continue
        // pas de badge en mode fusionné (contenu concaténé, sans exo-box) :
        // le repère et l'insertion précèdent directement le contenu, déjà
        // « avant la correction »
        const num = k + 1
        if (emitAnchors)
          renderLines.push(`    #mathalea-anchor("corr", ${num})`)
        renderLines.push(...insertionCorrectionLines(num, '    '))
        renderLines.push(indentContentBlock(indentContentBlock(correction)))
        renderLines.push('')
      }
      renderLines.push('  ]')
      renderLines.push(']')
      renderLines.push('')
    }
  } else {
    // Regroupe les exercices fusionnés (bouton de la palette) avec leur
    // prédécesseur : un groupe (un seul exercice, ou plusieurs fusionnés à
    // la suite) ne produit qu'une seule définition `exo.with(...)`, donc un
    // seul titre pour tout le groupe.
    interface ExerciseGroup {
      /** Indice (0-based) du premier exercice du groupe */
      head: number
      /** Indices (0-based) des exercices du groupe, dans l'ordre */
      members: number[]
    }
    const groups: ExerciseGroup[] = []
    for (const [k] of exercises.entries()) {
      if (mergedWithPrevious[k]) {
        groups[groups.length - 1].members.push(k)
      } else {
        groups.push({ head: k, members: [k] })
      }
    }
    const isWorkedGroup = (group: ExerciseGroup) =>
      group.members.some((k) => carryOver.workedExamples?.includes(k + 1))

    /**
     * Contenu de l'énoncé d'un membre du groupe. Les membres autres que la
     * tête n'ont pas leur propre appel `#exN()` (ils sont regroupés dans
     * celui de la tête) : leurs repères « exo » (contrôles de l'exercice
     * dans la palette) sont donc émis ici, à l'intérieur du contenu, plutôt
     * qu'au niveau du document. Le repère « gap » de chaque membre les y
     * rejoint, sauf celui du dernier membre du groupe (voir plus bas) : à
     * l'intérieur d'un groupe, un saut de page casserait la compilation
     * (interdit dans un conteneur Typst) et un saut de colonne ou une
     * insertion de texte n'auraient pas de sens ; seule la limite entre
     * deux groupes reste un point d'insertion valide.
     */
    const memberEnonce = (
      k: number,
      isHead: boolean,
      isLast: boolean,
    ): string => {
      const parts: string[] = []
      if (!isHead && (emitAnchors || emitVersionExerciseAnchors)) {
        parts.push(
          `#mathalea-anchor("${emitAnchors ? 'exo' : 'version-exo'}", ${k + 1})`,
        )
      }
      parts.push(built[k].enonce)
      if (!isLast && emitAnchors) {
        parts.push(`#mathalea-anchor("gap", ${k + 1})`)
      }
      return parts.join('\n')
    }

    for (const group of groups) {
      for (const k of group.members) {
        const suffix = k === group.head ? '' : ' (fusionné avec le précédent)'
        bankLines.push(`// ----- Exercice ${k + 1}${suffix} -----`)
      }
      bankLines.push(`#let ${varPrefix}ex${group.head + 1} = exo.with(`)
      // titre déclaré dans le préambule (`exo-N-titre`), modifiable dans la palette
      if (options.showExerciseTitles) {
        bankLines.push(`  title: exo-${group.head + 1}-titre,`)
      }
      // points déclarés dans le préambule (`exo-N-points`) ; un groupe
      // d'exercices fusionnés vaut la somme de ses membres
      if (exercisePoints(defaultExercisePoints(exercises), options) != null) {
        const sum = group.members.map((k) => `exo-${k + 1}-points`).join(' + ')
        bankLines.push(`  points: ${sum},`)
      }
      if (isWorkedGroup(group)) bankLines.push('  worked: true,')
      // la référence et le QR-code ne sont affichés que pour un groupe d'un
      // seul exercice (ils ne peuvent pas représenter tout un groupe fusionné)
      if (group.members.length === 1) {
        const ref = exercises[group.head].ref.trim()
        if (ref.length > 0) {
          bankLines.push(`  id: "${ref.replaceAll('"', '\\"')}",`)
        }
        // une surcharge de code (modale d'édition) remplace tout le contenu
        // généré de l'exercice : le QR-code s'y désactive avec elle
        const qrUrl = generated[group.head].qrUrl
        if (qrUrl != null && codeOverrideAt(group.head + 1) == null) {
          bankLines.push(`  qr: ${qrCodeToTypstImage(qrUrl)},`)
        }
      }
      bankLines.push('  exercise: [')
      const enonceBody = group.members
        .map((k, i) =>
          memberEnonce(k, k === group.head, i === group.members.length - 1),
        )
        .join('\n\n')
      bankLines.push(indentContentBlock(indentContentBlock(enonceBody)))
      bankLines.push('  ],')
      // le champ `solution:` reste renseigné : `display: "sol"` (PDF
      // « corrigé seul », voir corrigeCode dans Typst.svelte) en dépend pour
      // imprimer la correction directement à l'appel de `#exN()`. En mode
      // normal (« both », hors exemples corrigés), `exo()` la mettrait aussi
      // en attente (corr-loc:
      // "end-chapter") mais rien ne relit plus cette file : la correction
      // affichée dans la section Corrections vient de l'appel direct à
      // `exo-solution-box` plus bas, qui garde un point d'insertion avant
      // son badge (impossible via `exo-print-solutions`, voir plus bas).
      const correctionMembers = group.members.filter(
        (k) => built[k].correction != null,
      )
      if (correctionMembers.length > 0) {
        bankLines.push('  solution: [')
        if (isWorkedGroup(group) && emitAnchors) {
          bankLines.push(`    #mathalea-anchor("corr", ${group.head + 1})`)
        }
        const correctionBody = correctionMembers
          .map((k) => built[k].correction as string)
          .join('\n\n')
        bankLines.push(indentContentBlock(indentContentBlock(correctionBody)))
        bankLines.push('  ],')
      }
      bankLines.push(')')
    }

    const marginWidth = marginBadgeWidth(options)
    renderLines.push('// ----- Énoncés -----')
    // à partir de la 2e version, la colonne des badges a pu être élargie par
    // la section Corrections de la version précédente (réglage global du
    // paquet) : on la remet à sa largeur d'énoncé avant de reprendre
    if (varPrefix !== '' && marginWidth != null) {
      renderLines.push(`#exo-setup(margin-position: ${marginWidth.exo})`)
    }
    renderLines.push('#en-colonnes[')
    // le repère 0 permet une insertion avant le premier exercice
    if (emitAnchors) renderLines.push('  #mathalea-anchor("gap", 0)')
    renderLines.push(...insertionLines(0, '  '))
    const multicolGroups =
      options.columns > 1 ? [] : (carryOver.multicolGroups ?? [])
    let groupIndex = 0
    while (groupIndex < groups.length) {
      const group = groups[groupIndex]
      const isMulticolWithNext =
        multicolGroups.includes(group.head + 1) &&
        groupIndex + 1 < groups.length

      // placé avant les repères "exo", qui doivent suivre l'exercice s'il
      // est renvoyé à la page suivante (voir `MATHALEA_NEEDSPACE_HELPER`)
      renderLines.push('  #mathalea-needspace()')
      if (!isMulticolWithNext) {
        const last = group.members[group.members.length - 1]
        if (emitAnchors || emitVersionExerciseAnchors) {
          renderLines.push(
            `  #mathalea-anchor("${emitAnchors ? 'exo' : 'version-exo'}", ${group.head + 1})`,
          )
        }
        renderLines.push(`  #${varPrefix}ex${group.head + 1}()`)
        // repère "gap" du dernier membre : seule limite entre groupes où
        // un saut de page/colonne ou une insertion a un sens
        if (emitAnchors)
          renderLines.push(`  #mathalea-anchor("gap", ${last + 1})`)
        renderLines.push(...insertionLines(last + 1, '  '))
        groupIndex += 1
      } else {
        const nextGroup = groups[groupIndex + 1]
        renderLines.push(`  // mathalea:multicol(${group.head + 1})`)
        renderLines.push('  #grid(')
        renderLines.push('    columns: (1fr, 1fr),')
        renderLines.push('    gutter: 1cm,')
        for (const currentGroup of [group, nextGroup]) {
          renderLines.push('    [')
          if (emitAnchors || emitVersionExerciseAnchors) {
            renderLines.push(
              `      #mathalea-anchor("${emitAnchors ? 'exo' : 'version-exo'}", ${currentGroup.head + 1})`,
            )
          }
          renderLines.push(`      #${varPrefix}ex${currentGroup.head + 1}()`)
          renderLines.push('    ],')
        }
        renderLines.push('  )')
        const last = nextGroup.members[nextGroup.members.length - 1]
        if (emitAnchors)
          renderLines.push(`  #mathalea-anchor("gap", ${last + 1})`)
        renderLines.push(...insertionLines(last + 1, '  '))
        groupIndex += 2
      }
    }
    renderLines.push(']')
    renderLines.push('')
    if (
      groups.some(
        (group) =>
          !isWorkedGroup(group) &&
          group.members.some((k) => built[k].correction != null),
      )
    ) {
      renderLines.push('// ----- Corrections -----')
      renderLines.push('#if corrige [')
      renderLines.push('  // les corrections commencent sur une nouvelle page')
      renderLines.push(`  ${sectionPageBreak(options)}`)
      const url = ficheUrl(exercises)
      renderLines.push(
        ...correctionsHeadingLines(versionLabel, options.hideVersionLabel, url),
      )
      // les libellés « Correction N » sont plus larges : on élargit la
      // colonne des badges juste pour cette section
      if (marginWidth != null && marginWidth.corr !== marginWidth.exo) {
        renderLines.push(`  #exo-setup(margin-position: ${marginWidth.corr})`)
      }
      renderLines.push('  #en-colonnes[')
      // appel direct de `exo-solution-box` (plutôt que `exo-print-solutions`,
      // qui imprimerait tout d'un coup) : chaque correction garde son propre
      // point d'insertion juste avant son badge. Numérotation : position
      // (1-based) du groupe parmi les `#exN()` effectivement appelés — c'est
      // aussi ce qu'incrémente `exo-counter` en interne (un exercice fusionné
      // avec le précédent ne consomme pas de numéro à lui).
      groups.forEach((group, groupIndex) => {
        if (isWorkedGroup(group)) return
        const num = groupIndex + 1
        const correctionMembers = group.members.filter(
          (k) => built[k].correction != null,
        )
        if (correctionMembers.length === 0) return
        if (emitAnchors) {
          renderLines.push(`    #mathalea-anchor("corr", ${group.head + 1})`)
        }
        renderLines.push(...insertionCorrectionLines(group.head + 1, '    '))
        const correctionBody = correctionMembers
          .map((k) => built[k].correction as string)
          .join('\n\n')
        // même identifiant que le badge de l'énoncé (voir la construction de
        // `exo.with(...)` ci-dessus) : explicite (`ref`) pour un groupe d'un
        // seul exercice, sinon celui qu'exo() aurait généré lui-même
        const ref =
          group.members.length === 1 ? exercises[group.head].ref.trim() : ''
        const exerciseId = ref.length > 0 ? ref : `exo-${num}`
        renderLines.push('    #mathalea-needspace()')
        renderLines.push('    #exo-solution-box(')
        renderLines.push(`      number: ${num},`)
        renderLines.push(`      exercise-id: ${typstString(exerciseId)},`)
        renderLines.push(`      show-id: ${options.showExerciseRefs},`)
        renderLines.push('      [')
        renderLines.push(indentContentBlock(indentContentBlock(correctionBody)))
        renderLines.push('      ],')
        renderLines.push('    )')
      })
      renderLines.push('  ]')
      renderLines.push(']')
      renderLines.push('')
    }
  }

  return { bankLines, renderLines, hasCorrections }
}

/**
 * Génère le code Typst complet de la fiche.
 * Le préambule expose des variables (`colonnes`, `corrige`...) que
 * l'utilisateur peut modifier directement dans l'éditeur.
 * `extraVersions` contient le contenu (graine différente) des sujets B, C...
 * générés à la suite du sujet principal (Sujet A), chacun avec sa propre
 * pagination et ses propres corrections.
 */
export interface TypstBuildOptions {
  /**
   * Code destiné à être exporté/copié hors de l'appli (bouton de
   * téléchargement du .typ, modale d'édition) : sans les repères
   * `mathalea-anchor` (palette de mise en page) ni les marqueurs de
   * relecture (`harvestCarryOver`), colonnes et espacement des questions en
   * valeurs littérales plutôt qu'en variables `exN-colonnes`/`exN-gutter`.
   * Les réglages globaux (`titre`, `couleur`, `police-texte`...) restent en
   * revanche des `#let` : un professeur les modifie en un seul endroit.
   */
  exportMode?: boolean
  /**
   * URL complète (avec ses paramètres) permettant de régénérer cette fiche
   * à l'identique, inscrite en commentaire en tête du code. Omise si non
   * fournie (contexte sans URL, comme les tests).
   */
  sourceUrl?: string
  /**
   * Code Typst déclaré par le préambule d'une banque externe (`manifest.
   * preambule.typ`) dont un exercice figure dans la fiche : l'équivalent
   * d'un `preambule.tex`, pour ses propres fonctions/imports. Inséré juste
   * après les paquets fixes de MathALÉA, avant les réglages de la fiche.
   */
  extraPreamble?: string
}

export function buildTypstDocument(
  exercises: TypstExerciseInput[],
  options: TypstDocumentOptions = defaultTypstDocumentOptions,
  carryOver: TypstCarryOver = {},
  extraVersions: TypstExerciseInput[][] = [],
  { exportMode = false, sourceUrl, extraPreamble }: TypstBuildOptions = {},
): string {
  options = normalizeTypstLayoutOptions(options)
  const stableCarryOver = stabilizeStructuralInsertions(
    carryOver,
    exercises.length,
  )
  // Les corps sont convertis d'abord : les figures SVG rencontrées sont
  // collectées pour être déclarées (`#let fig-N = image(...)`) en tête
  // de document, ce qui garde le corps du code lisible. Partagée entre
  // toutes les versions : chaque occurrence de figure y ajoute une entrée,
  // avec son propre réglage de zoom/alignement.
  const figures: string[] = []
  const totalVersions = 1 + extraVersions.length
  const primary = buildVersionContent(
    exercises,
    options,
    stableCarryOver,
    figures,
    '',
    !exportMode,
    exportMode,
    totalVersions > 1 ? `Sujet ${versionLetter(0)}` : undefined,
    false,
  )
  const figureOffsets: number[] = []
  const extra = extraVersions.map((versionExercises, i) => {
    const offset = figures.length
    figureOffsets.push(offset)
    return buildVersionContent(
      versionExercises,
      options,
      offsetOverrideFigures(
        stabilizeStructuralInsertions(
          {
            ...stableCarryOver,
            imageCuts: undefined,
            codeOverrides: undefined,
            codeOverridesCorrection: undefined,
            codeOverridesCan: undefined,
            codeOverridesCanReponse: undefined,
            ...stableCarryOver.versions?.[i + 1],
            // Ces variables sont communes aux sujets dans le préambule.
            tasksLayout: stableCarryOver.tasksLayout,
            figureZoom: stableCarryOver.figureZoom,
            figureAlign: stableCarryOver.figureAlign,
            exerciseZoom: stableCarryOver.exerciseZoom,
            exerciseCorrectionZoom: stableCarryOver.exerciseCorrectionZoom,
            workedExamples: stableCarryOver.workedExamples,
            // Les lignes pour écrire se règlent une fois pour la fiche : ce que
            // le professeur a réglé sur le sujet A vaut pour tous les sujets.
            writingLines: stableCarryOver.writingLines,
          },
          versionExercises.length,
        ),
        offset,
      ),
      figures,
      `v${i + 1}`,
      !exportMode,
      exportMode,
      totalVersions > 1 ? `Sujet ${versionLetter(i + 1)}` : undefined,
      !exportMode,
    )
  })
  const bankLines = [...primary.bankLines, ...extra.flatMap((v) => v.bankLines)]
  const allLines = [
    ...bankLines,
    ...primary.renderLines,
    ...extra.flatMap((v) => v.renderLines),
  ]
  const usesMathaleaFigure = allLines.some((line) =>
    line.includes('mathalea-figure('),
  )
  const usesTasks = allLines.some((line) => line.includes('#tasks('))
  const usesVarTable = allLines.some((line) => line.includes('#tabvar('))
  const usesQcm = allLines.some((line) => line.includes('qcm-'))
  // Chaque sujet possède ses propres graines : il faut donc aussi construire
  // un lien de fiche (et un QR-code) pour chaque version imprimée.
  const globalQrCodeUrls = options.showQrCodeFiche
    ? [exercises, ...extraVersions].map(ficheUrl)
    : []
  const hasGlobalQrCode = globalQrCodeUrls.some((url) => url != null)
  const usesAnchors =
    (!exportMode && hasGlobalQrCode) ||
    allLines.some((line) => line.includes('#mathalea-anchor('))
  const usesQrCode = allLines.some((line) => /^\s*qr: /.test(line))
  const usesSchema = allLines.some((line) =>
    line.includes('mathalea-schema-span'),
  )
  const usesWritingLines = allLines.some((line) =>
    line.includes('#mathalea-lignes('),
  )
  const usesCanTable = allLines.some((line) => line.includes('#can-tableau('))
  const usesCetz = allLines.some((line) => line.includes('cetz.'))
  // paquet `ctz-euclide` des figures d'annales géométriques (CTZ_EUCLIDE_IMPORT)
  const usesCtz = allLines.some((line) => line.includes('ctz-'))
  const usesCetzPlotChart = allLines.some((line) => line.includes('chart.'))
  // QCM dont au moins une proposition est une figure : une seule colonne par
  // défaut, la seule largeur qui les garde lisibles (voir `qcmHasFigure`)
  const qcmFigurePrefixes = qcmFigureTasksPrefixes(allLines)
  // QCM dont l'exercice a demandé un nombre de colonnes par défaut
  const qcmRequested = qcmRequestedColumns(allLines)
  // lignes de réponse après chaque question : liste à une colonne par défaut
  // (voir `perQuestionLinesTasksPrefixes`)
  const perQuestionLinesPrefixes = perQuestionLinesTasksPrefixes(allLines)
  // exercice dont au moins une question contient une figure `vraieGrandeur` :
  // une seule colonne par défaut (voir `trueSizeFigureTasksPrefixes`)
  const trueSizeFigurePrefixes = trueSizeFigureTasksPrefixes(allLines)
  // une liste qui contient elle-même une grille taskize (plusieurs QCM) ne
  // peut pas rester en auto-fit : le paquet échoue à en déduire les colonnes
  const nestedTaskPrefixes = singleColumnContentTasksPrefixes(allLines)
  // variables de mise en page des questions référencées par les corps
  // (`ex1`, et `ex1-corr` pour les corrections, réglables indépendamment)
  const tasksPrefixes = [
    ...new Set(
      allLines
        .flatMap((line) => [
          ...line.matchAll(
            /#tasks\(columns: (ex\d+(?:-corr)?(?:-qcm)?)-colonnes/g,
          ),
        ])
        .map((m) => m[1]),
    ),
  ].sort(
    (a, b) =>
      parseInt(a.slice(2), 10) - parseInt(b.slice(2), 10) ||
      a.length - b.length,
  )

  // page de garde : le même appel ouvre chaque sujet (le barème et le nombre
  // de questions sont ceux de la fiche, identiques d'une version à l'autre)
  const coverTemplate = options.coverPage?.template ?? 'aucune'
  // note globale dans la ligne d'en-tête quand les exercices affichent leurs
  // points ; une page de garde a déjà sa propre case de note
  const scoreInHeader =
    exercisePoints(defaultExercisePoints(exercises), options) != null &&
    coverTemplate === 'aucune'
  const globalQrCodeOnCanCover =
    globalQrCodeUrls[0] != null && options.canMode && coverTemplate === 'can'
  const coverDeclarations =
    options.coverPage != null ? coverDeclarationLines(options.coverPage) : []
  const coverVersion = (index: number) =>
    coverVersionLabel(
      options,
      totalVersions > 1 ? `Sujet ${versionLetter(index)}` : undefined,
      !exportMode,
    )
  const coverLines =
    options.coverPage != null
      ? coverPageLines(
          options.coverPage,
          countQuestions(exercises),
          false,
          0,
          coverVersion(0),
        )
      : []
  const primaryCoverLines =
    options.coverPage != null && globalQrCodeOnCanCover
      ? coverPageLines(
          options.coverPage,
          countQuestions(exercises),
          true,
          0,
          coverVersion(0),
        )
      : coverLines

  const lines: string[] = []
  lines.push('// Fiche générée par MathALÉA — https://coopmaths.fr/alea')
  if (sourceUrl != null && sourceUrl !== '') {
    lines.push(`// Pour régénérer cette fiche : ${sourceUrl}`)
  }
  lines.push('')
  // en mode « Course aux nombres » il n'y a pas de titre d'exercice à
  // habiller : le paquet exercise-bank n'a rien à faire dans le document
  const usesExerciseBank = !options.mergeExercises && !options.canMode
  if (
    usesTasks ||
    usesExerciseBank ||
    hasGlobalQrCode ||
    options.autoVerticalSpacing ||
    usesVarTable ||
    usesCetz ||
    usesCtz ||
    usesCetzPlotChart
  ) {
    lines.push('// ----- Paquets -----')
    if (usesExerciseBank) {
      lines.push(
        options.badgeStyle === 'underline'
          ? EXERCISE_BANK_IMPORT_UNDERLINE
          : EXERCISE_BANK_IMPORT,
      )
    }
    // le QR-code de fiche passe par `exo-corner` (voir `ficheQrCodeLines`),
    // y compris quand les exercices ne sont pas habillés par exercise-bank
    else if (hasGlobalQrCode && !(options.canMode && coverTemplate === 'can'))
      lines.push(EXERCISE_BANK_CORNER_IMPORT)
    if (hasGlobalQrCode) lines.push(TIAOMA_IMPORT)
    if (usesTasks) lines.push(TASKIZE_IMPORT, MATHALEA_TASKS_HELPER)
    if (options.autoVerticalSpacing) lines.push(BREATHER_IMPORT)
    if (usesVarTable) lines.push(VARTABLE_IMPORT)
    // `ctz-euclide` (figures d'annales géométriques) réexporte `cetz` : quand
    // il est présent, on ne redéclare pas l'import `cetz` autonome — `cetz`
    // doit résoudre vers la version du paquet pour le `import cetz.draw: *`
    // que ces figures ouvrent dans le corps de `ctz-canvas`
    if (usesCtz) lines.push(CTZ_EUCLIDE_IMPORT)
    else if (usesCetz) lines.push(CETZ_IMPORT)
    if (usesCetzPlotChart) lines.push(CETZ_PLOT_CHART_IMPORT)
    lines.push('')
  }
  if (hasGlobalQrCode) {
    // Une URL par sujet, lisible et modifiable directement dans le source
    // Typst exporté. Le sujet A conserve son nom historique.
    for (const [version, url] of globalQrCodeUrls.entries()) {
      if (url != null)
        lines.push(
          `#let ${qrCodeGlobalVariableName(version)} = ${typstString(url)}`,
        )
    }
    lines.push('')
  }
  if (extraPreamble != null && extraPreamble.length > 0) {
    lines.push('// ----- Préambule d’une banque externe -----')
    lines.push(extraPreamble)
    lines.push('')
  }
  if (usesAnchors) {
    lines.push(
      '// ----- Repères invisibles de la palette de mise en page -----',
    )
    lines.push(MATHALEA_ANCHOR_HELPER)
    lines.push('')
  }
  if (usesSchema) {
    lines.push('// ----- Schémas en barres (accolades/flèches étirées) -----')
    lines.push(MATHALEA_SCHEMA_HELPER)
    lines.push('')
  }
  if (usesWritingLines) {
    lines.push('// ----- Lignes en pointillés (à compléter par l’élève) -----')
    lines.push(MATHALEA_WRITING_LINES_HELPER)
    lines.push('')
  }
  if (usesCanTable) {
    lines.push('// ----- Tableau « Course aux nombres » -----')
    lines.push(MATHALEA_CAN_TABLE_HELPER)
    lines.push('')
  }
  // mathalea-fit (adaptation de la largeur des figures) est requis dès
  // qu'une figure est présente ; mathalea-figure l'utilise pour ses figures
  // à labels, il doit donc être défini avant.
  if (figures.length > 0) {
    lines.push('// ----- Figures : adaptation à la largeur et alignement -----')
    lines.push(MATHALEA_FIT_HELPER, IMAGE_SLICE_HELPER)
    lines.push('')
    // le repère `mathalea-anchor` de ce bloc (contrôle de zoom de la
    // palette) n'a pas de sens dans le code exporté, où il n'est jamais défini
    lines.push(
      exportMode
        ? stripAnchorCall(MATHALEA_FIGURE_BLOCK_HELPER)
        : MATHALEA_FIGURE_BLOCK_HELPER,
    )
    lines.push('')
  }
  if (usesMathaleaFigure) {
    lines.push('// ----- Figures mathalea2d -----')
    lines.push(MATHALEA_FIGURE_HELPERS)
    lines.push('')
  }
  lines.push('// ----- Réglages -----')
  lines.push(
    `#let colonnes = ${options.columns} // nombre de colonnes (1, 2 ou 3)`,
  )
  lines.push(
    `#let corrige = ${options.showCorrections} // afficher les corrections`,
  )
  lines.push(
    `#let couleur = ${options.badgeColor} // couleur des badges d'exercice et des titres`,
  )
  lines.push(`#let titre = ${typstString(options.title)}`)
  lines.push(`#let sous-titre = ${typstString(options.subtitle)}`)
  lines.push(`#let entete = ${typstString(options.headerLine)}`)
  lines.push(`#let pied-page = ${typstString(options.footerText)}`)
  lines.push(...coverDeclarations)
  lines.push(`#let police-texte = ${typstString(options.font)}`)
  lines.push(`#let police-maths = ${typstString(options.mathFont)}`)
  lines.push(`#let taille-texte = ${options.fontSize}pt`)
  if (usesQcm) {
    // Repli des chemins sans réglage par exercice (tableau « Course aux
    // nombres ») : la fiche, elle, passe `exN-qcm-colonnes` (voir `exerciseBody`)
    lines.push('#let qcm-colonnes = 2 // colonnes des propositions de QCM')
  }
  if (usesCanTable && !exportMode) {
    lines.push(
      `#let can-reponse = ${stableCarryOver.canAnswerWidth ?? CAN_ANSWER_WIDTH_DEFAULT} // largeur de la colonne Réponse du tableau (% de la largeur)`,
    )
  }
  // réglage par défaut de "auto-fit" (colonnes/espacement littéraux du mode
  // export y compris) : nécessaire dès qu'un `#tasks(...)` est présent, pas
  // seulement quand des variables `exN-colonnes` sont déclarées ci-dessous
  if (usesTasks) {
    lines.push(
      '#tasks-setup(columns: "auto-fit", auto-fit-mode: "uniform", max-columns: 4)',
    )
  }
  // en mode export, chaque `#tasks(...)` porte déjà ses valeurs littérales
  // (voir `exerciseBody`) : `tasksPrefixes` est alors toujours vide, ces
  // variables de plomberie (propres à la palette de mise en page) n'ont pas
  // à être déclarées.
  if (tasksPrefixes.length > 0) {
    lines.push(
      '// colonnes, espacement et numérotation par défaut de tous les exercices (Réglages du document, Styles)',
    )
    lines.push(
      `#let colonnes-questions = ${questionsColumnsLiteral(options.questionsColumns)}`,
    )
    lines.push(`#let interligne-questions = ${options.questionsGutter}em`)
    lines.push(
      `#let numerotation-questions = ${questionNumberingLabel(options.questionNumberingStyle)}`,
    )
    lines.push(
      '// Colonnes, espacement et numérotation des questions, par exercice',
    )
    lines.push(
      '// (les corrections, préfixe exN-corr, se règlent indépendamment) :',
    )
    lines.push(
      '// remplacez colonnes-questions/interligne-questions/numerotation-questions par une valeur pour en dévier',
    )
    lines.push(
      '// (réglable aussi depuis la palette de mise en page ou la modale de réglages de l’exercice).',
    )
    if (tasksPrefixes.some((prefix) => prefix.endsWith('-qcm'))) {
      lines.push(
        '// Les propositions de QCM (suffixe -qcm) ont leurs propres colonnes.',
      )
    }
    for (const prefix of tasksPrefixes) {
      const layout = stableCarryOver.tasksLayout?.[prefix]
      // les propositions de QCM ont leur propre défaut, indépendant du
      // réglage « Colonnes des questions » du document
      const defaultColumns =
        qcmRequested.get(prefix) ??
        (qcmFigurePrefixes.has(prefix) ||
        perQuestionLinesPrefixes.has(prefix) ||
        trueSizeFigurePrefixes.has(prefix) ||
        nestedTaskPrefixes.has(prefix)
          ? '1'
          : prefix.endsWith('-qcm')
            ? DEFAULT_TASKS_COLUMNS
            : 'colonnes-questions')
      lines.push(
        `#let ${prefix}-colonnes = ${layout?.columns ?? defaultColumns}`,
      )
      // les propositions de QCM n'ont pas de `row-gutter` ni d'étiquette de
      // numérotation réglable (elles gardent l'espacement du paquet taskize
      // et leur numérotation « A) », voir `qcmToTypst`) : pas de variable à déclarer
      if (prefix.endsWith('-qcm')) continue
      lines.push(
        `#let ${prefix}-gutter = ${layout?.gutter ?? 'interligne-questions'}`,
      )
      lines.push(
        `#let ${prefix}-numerotation = ${layout?.numbering ?? 'numerotation-questions'}`,
      )
    }
  }
  lines.push('')
  // Marge horizontale : les styles de badge à colonne latérale (`box`,
  // `pill`, `circled`…) décalent déjà le contenu vers la droite, la marge de
  // page reste donc à 15 mm ; les styles pleine largeur (et les modes sans
  // badge, fusionné et « Course aux nombres ») n'ont rien de tel et gagnent
  // une marge plus fine.
  const badgeColumn = usesExerciseBank && marginBadgeWidth(options) != null
  lines.push(
    `#set page(paper: "${options.pageFormat}", flipped: ${options.orientation === 'landscape'}, margin: (x: ${badgeColumn ? '15mm' : '10mm'}, y: 15mm),`,
  )
  lines.push(
    ...pageFooter(options.headerStyle, options.showFooter, exportMode).map(
      (line) => `  ${line}`,
    ),
  )
  lines.push(')')
  lines.push(
    `#set text(font: police-texte, size: taille-texte, lang: "fr", spacing: ${options.wordSpacing}%)`,
  )
  lines.push(`#set par(leading: ${options.lineSpacing}em)`)
  // pas de `numbering` : « 1. » est la valeur par défaut, et le préambule
  // d'une banque externe (inséré plus haut) peut avoir réglé la sienne
  lines.push('#set enum(spacing: 1.2em)')
  // police des formules ; les nombres et symboles restent en police maths
  lines.push('#show math.equation: set text(font: police-maths)')
  // #txt : texte inséré dans une formule mais rendu avec la police du texte
  // (unités, mots) — le parseur convertit \text{…} en #txt("…")
  lines.push('#let txt(corps) = text(font: police-texte, corps)')
  lines.push(MATHALEA_INLINE_FORMULA_RULE)
  // \dfrac plutôt que \frac : les fractions gardent leur taille normale
  // (« display ») même au milieu d'une phrase, comme dans la version LaTeX
  lines.push('#show math.frac: it => math.display(it)')
  if (options.autoVerticalSpacing) {
    lines.push(
      '// gestion automatique des espaces verticaux : les lignes aux maths',
      "// hautes s'écartent juste ce qu'il faut (paquet breather)",
      BREATHER_CALL,
    )
  }
  lines.push('')
  lines.push(
    '// mise en colonnes d’une section (les sauts de page restent possibles',
    '// entre les sections, contrairement à une mise en colonnes globale)',
  )
  lines.push('#let en-colonnes(corps) = if colonnes > 1 {')
  lines.push('  columns(colonnes, gutter: 8mm, corps)')
  lines.push('} else { corps }')
  lines.push(MATHALEA_NEEDSPACE_HELPER)
  lines.push(
    '// titre de section, insérable entre les exercices : #section[Fractions]',
  )
  lines.push(
    '#let section(titre) = block(width: 100%, above: 1.2em, below: 0.9em,',
  )
  lines.push(
    '  grid(columns: (1fr, auto, 1fr), align: horizon, column-gutter: 8pt,',
  )
  lines.push('    line(length: 100%, stroke: 0.8pt + couleur),')
  lines.push(
    '    text(weight: "bold", fill: couleur, size: 1.15em, smallcaps(titre)),',
  )
  lines.push('    line(length: 100%, stroke: 0.8pt + couleur),')
  lines.push('  ))')
  if (usesExerciseBank) {
    lines.push(
      '// réglages du paquet exercise-bank (badges Exercice/Correction)',
    )
    lines.push('#exo-setup(')
    lines.push('  exercise-label: "Exercice",')
    // les corrections gardent le titre « Exercice N » : elles sont déjà dans
    // une section « Corrections », et le numéro renvoie à l'énoncé
    lines.push('  solution-label: "Exercice",')
    lines.push('  // les corrections sont regroupées en fin de fiche')
    lines.push('  corr-loc: "end-chapter",')
    lines.push('  display: if corrige { "both" } else { "ex" },')
    lines.push(`  badge-style: "${options.badgeStyle}",`)
    // `above` : le badge passe seul sur une ligne d'en-tête et l'énoncé prend
    // toute la largeur en dessous (pas de colonne de badge à dimensionner)
    if (badgePosition(options) !== 'margin') {
      lines.push(`  badge-position: "${badgePosition(options)}",`)
    }
    lines.push('  badge-color: couleur,')
    // le corrigé est placé dans le champ `solution` (étiquette `solution-label`) :
    // sa couleur suit donc `solution-color`, réglée sur la couleur des badges
    lines.push('  solution-color: couleur,')
    lines.push('  correction-color: couleur,')
    // Blanc au-dessus de chaque correction ; celui sous le filet du titre
    // souligné en vaut environ la moitié (voir
    // `MATHALEA_SOLUTION_UNDERLINE_HELPER`).
    lines.push('  solution-above: 1.8em,')
    lines.push(`  show-id: ${options.showExerciseRefs},`)
    // points au bout de la ligne de titre ou dessous, avec un blanc pour la note
    if (exercisePoints(defaultExercisePoints(exercises), options) != null) {
      const position =
        options.exercisePointsPosition === 'below' ? 'below' : 'right'
      lines.push(`  points-position: "${position}",`)
      lines.push('  points-format: "score",')
    }
    lines.push(`  exercise-above: ${options.exerciseSpacing}em,`)
    if (usesQrCode) lines.push(`  qr-size: ${QRCODE_SIZE},`)
    if (usesQrCode) lines.push(`  qr-position: ${QRCODE_POSITION},`)

    // styles « en marge » : colonne compacte pour ne pas étrangler le
    // contenu (le paquet dimensionne sinon la colonne sur « Correction 100 »).
    // On règle ici la largeur des énoncés ; celle des corrections est
    // élargie juste avant leur affichage.
    const marginWidth = marginBadgeWidth(options)
    if (marginWidth != null) {
      lines.push('  label-extra: 0pt,')
      lines.push(`  margin-position: ${marginWidth.exo},`)
    }
    lines.push(')')
    if (options.badgeStyle === 'underline') {
      lines.push(MATHALEA_SOLUTION_UNDERLINE_HELPER)
    }
  }
  if (usesQcm) {
    lines.push('// ----- QCM (case à cocher) -----')
    lines.push(MATHALEA_QCM_HELPERS)
  }
  // la page de garde suit les réglages (`couleur`) et précède l'en-tête :
  // ses aides sont déclarées ici, seulement quand un modèle est choisi
  if (coverTemplate !== 'aucune') {
    lines.push('// ----- Page de garde -----')
    // `mathalea-champ` (pointillés) sert aux modèles pleine page ; le bandeau
    // « récitation » a ses propres champs, sur un trait plein
    if (coverTemplate !== 'recitation') lines.push(MATHALEA_COVER_FIELD_HELPER)
    if (coverTemplate === 'can') {
      lines.push(`#let mathalea-logo = ${MATHALEA_LOGO_IMAGE}`)
      lines.push(MATHALEA_COVER_CAN_HELPER)
    } else if (coverTemplate === 'recitation') {
      lines.push(MATHALEA_COVER_POINTS_HELPER)
      lines.push(MATHALEA_COVER_RECITATION_HELPER)
    } else {
      lines.push(MATHALEA_COVER_POINTS_HELPER)
      lines.push(MATHALEA_COVER_HELPER)
    }
  }
  lines.push('')
  if (figures.length > 0) {
    const defaultAligns = figureDefaultAligns(allLines)
    lines.push('// ----- Figures (SVG embarqués) -----')
    for (const [index, figure] of figures.entries()) {
      const figNum = index + 1
      lines.push(
        `#let fig-${figNum} = ${applyDocumentFontsToFigure(figure, options)}`,
      )
      // figure d'un sujet B, C... : zoom et alignement de la figure
      // correspondante du sujet A (voir `sharedFigureNumber`), sauf si elle a
      // été réglée depuis son propre sujet (valeur relue par `harvestCarryOver`)
      const shared = sharedFigureNumber(figNum, figureOffsets, figures.length)
      const zoom = stableCarryOver.figureZoom?.[figNum]
      const align = stableCarryOver.figureAlign?.[figNum]
      lines.push(
        shared != null && zoom == null
          ? `#let fig-${figNum}-zoom = fig-${shared}-zoom`
          : `#let fig-${figNum}-zoom = ${zoom ?? 1}`,
      )
      lines.push(
        shared != null && align == null
          ? `#let fig-${figNum}-align = fig-${shared}-align`
          : `#let fig-${figNum}-align = ${align ?? defaultAligns.get(figNum) ?? 'center'}`,
      )
    }
    lines.push('')
  }
  if (options.showExerciseTitles) {
    lines.push('// ----- Titres des exercices -----')
    for (const [k, exercise] of exercises.entries()) {
      lines.push(
        exerciseTitleLine(
          k + 1,
          defaultExerciseTitle(
            k + 1,
            exercise.title ?? '',
            stableCarryOver.merges,
          ),
          stableCarryOver.exerciseTitles?.[k + 1],
        ),
      )
    }
    lines.push('')
  }
  const points = exercisePoints(defaultExercisePoints(exercises), options)
  if (points != null) {
    lines.push('// ----- Points des exercices -----')
    for (const [k, value] of points.entries()) {
      lines.push(`#let exo-${k + 1}-points = ${value}`)
    }
    lines.push(
      `#let exo-points-total = ${points.map((_, k) => `exo-${k + 1}-points`).join(' + ') || '0'}`,
    )
    lines.push('')
  }
  // exercices statiques sans source .typ/_cor.typ (énoncé/correction juste
  // une image scannée) : une variable de zoom par énoncé/correction
  // concerné, ajustable dans la palette de l'aperçu (voir `htmlToTypst`,
  // branché dessus via `exercise.isStaticImage`/`isStaticCorrectionImage`)
  const staticImageExerciseNums = exercises
    .map((exercise, k) => (exercise.isStaticImage ? k + 1 : null))
    .filter((num): num is number => num != null)
  const staticCorrectionImageExerciseNums = exercises
    .map((exercise, k) => (exercise.isStaticCorrectionImage ? k + 1 : null))
    .filter((num): num is number => num != null)
  if (
    staticImageExerciseNums.length > 0 ||
    staticCorrectionImageExerciseNums.length > 0
  ) {
    lines.push('// ----- Zoom des exercices statiques (image seule) -----')
    for (const num of staticImageExerciseNums) {
      lines.push(
        `#let exo-${num}-zoom = ${stableCarryOver.exerciseZoom?.[num] ?? 1}`,
      )
    }
    for (const num of staticCorrectionImageExerciseNums) {
      lines.push(
        `#let exo-${num}-corr-zoom = ${stableCarryOver.exerciseCorrectionZoom?.[num] ?? 1}`,
      )
    }
    lines.push('')
  }
  if (!exportMode) {
    for (const num of stableCarryOver.workedExamples ?? []) {
      lines.push(`// mathalea:worked(${num})`)
    }
  }
  if (!exportMode && totalVersions > 1) lines.push('// mathalea:banque(0)')
  lines.push(...primary.bankLines)
  for (const [i, version] of extra.entries()) {
    if (!exportMode) {
      lines.push(`// mathalea:banque(${i + 1})`)
      lines.push(`// mathalea:figures-offset(${figureOffsets[i]})`)
    }
    lines.push(...version.bankLines)
  }
  if (!exportMode && totalVersions > 1) lines.push('// mathalea:banque-fin')
  lines.push('')
  // Repère de début de sujet : l'aperçu ne compile que le sujet montré (voir
  // `previewCode` dans `Typst.svelte`). La mise en page est l'essentiel du
  // temps d'attente et croît plus vite que le nombre de pages : sur une fiche
  // à deux sujets, n'en compiler qu'un fait plus que diviser l'attente par
  // deux. C'est un commentaire : le document reste identique pour l'export et
  // la compilation CLI.
  // Sujets enchaînés sur une même page quand ils y tiennent (voir
  // MATHALEA_CHAIN_HELPER) : chaque sujet devient une variable de contenu,
  // la mise en page les place à la suite et les corrections suivent toutes.
  // Pas de repère de sujet : l'aperçu montre la fiche entière, telle qu'elle
  // sera imprimée. Une page de garde occupe sa page : rien à enchaîner ; le
  // bandeau compact (`recitation`) tient en tête de page et suit chaque sujet.
  const copies = Math.min(
    MAX_COPIES_PER_PAGE,
    Math.max(1, Math.floor(options.copiesPerPage ?? 1)),
  )
  const chain =
    (copies > 1 || (options.chainSubjects && totalVersions > 1)) &&
    (coverTemplate === 'aucune' || coverTemplate === 'recitation')
  if (chain) {
    lines.push(MATHALEA_CHAIN_HELPER)
    lines.push('')
    const subjects = [primary, ...extra].map((version, i) => ({
      i,
      ...splitCorrections(version.renderLines),
    }))
    const items: string[] = []
    for (const subject of subjects) {
      const body = [
        ...(usesExerciseBank ? ['#exo-counter.update(0)'] : []),
        ...(exportMode ? [] : [subjectAnchor('start', subject.i)]),
        ...(coverTemplate === 'recitation'
          ? [
              ...(exportMode ? [] : ['#mathalea-anchor("cover", 0)']),
              ...(subject.i === 0
                ? primaryCoverLines
                : coverPageLines(
                    options.coverPage as TypstCoverOptions,
                    countQuestions(exercises),
                    false,
                    subject.i,
                    coverVersion(subject.i),
                  )),
            ]
          : []),
        ...(globalQrCodeUrls[subject.i] != null
          ? ficheQrCodeLines(subject.i, exportMode)
          : []),
        ...(!exportMode && options.headerStyle !== 'aucun'
          ? ['#mathalea-anchor("header", 0)']
          : []),
        ...headerBlock(
          options.headerStyle,
          totalVersions > 1 ? `Sujet ${versionLetter(subject.i)}` : undefined,
          !exportMode,
          options.hideVersionLabel,
          scoreInHeader,
          globalQrCodeUrls[subject.i] != null,
        ),
        '',
        ...subject.enonce,
        ...(exportMode ? [] : [subjectAnchor('end', subject.i)]),
      ]
      lines.push(`#let mathalea-sujet-${subject.i} = [`, ...body, ']')
      items.push(`(mathalea-sujet-${subject.i}, false)`)
      if (copies > 1) {
        // les exemplaires n'ont pas de repère : la palette de l'aperçu ne
        // propose ses réglages que sur l'original
        lines.push(
          `#let mathalea-sujet-${subject.i}-copie = [`,
          ...body.map((line) => line.replace(ANCHOR_CALL, '')),
          ']',
        )
        for (let k = 1; k < copies; k++) {
          items.push(`(mathalea-sujet-${subject.i}-copie, true)`)
        }
      }
    }
    const body = pageBodySize(options, badgeColumn ? 15 : 10)
    lines.push(
      `#mathalea-enchainement((${items.join(', ')},), corps: (${body.width}mm, ${body.height}mm))`,
    )
    lines.push('')
    // repère de début des corrections de chaque sujet : l'aperçu ne garde que
    // les repères du premier sujet pour la palette (voir `paletteAnchors`)
    for (const subject of subjects) {
      if (!exportMode && subject.corrections.length > 0) {
        lines.push(`#mathalea-anchor("subject-corr", ${subject.i})`)
      }
      lines.push(...subject.corrections)
    }
    return lines.join('\n')
  }

  if (!exportMode && totalVersions > 1) lines.push(subjectMarker(0))
  // début du sujet, bandeau compact compris (il partage la page des énoncés)
  if (!exportMode) lines.push(subjectAnchor('start', 0))
  if (primaryCoverLines.length > 0) {
    // repère du bloc de couverture : la palette de l'aperçu propose d'y
    // modifier titre, session, matière, durée et consignes (sans objet en
    // mode export) ; un seul repère suffit, les sujets suivants affichent la
    // même page de garde (voir la boucle des versions plus bas)
    if (!exportMode) lines.push('#mathalea-anchor("cover", 0)')
    lines.push(...primaryCoverLines)
    lines.push('')
  }
  lines.push('// ----- En-tête -----')
  if (globalQrCodeUrls[0] != null && !globalQrCodeOnCanCover) {
    // avant le bloc de titre : `exo-corner` publie la place qu'il occupe, que
    // le bloc de titre et les exercices qui suivent lisent pour l'éviter
    lines.push(...ficheQrCodeLines(0, exportMode))
  }
  // repère du bloc de titre : la palette de l'aperçu propose d'y modifier
  // les variables titre, sous-titre et entete (sans objet en mode export, ni
  // quand l'habillage « aucun » n'affiche justement aucun bloc à ce repère)
  if (!exportMode && options.headerStyle !== 'aucun') {
    lines.push('#mathalea-anchor("header", 0)')
  }
  lines.push(
    ...headerBlock(
      options.headerStyle,
      totalVersions > 1 ? `Sujet ${versionLetter(0)}` : undefined,
      !exportMode,
      options.hideVersionLabel,
      scoreInHeader,
      globalQrCodeUrls[0] != null && !globalQrCodeOnCanCover,
    ),
  )
  lines.push('')
  lines.push(...withSubjectEnd(primary.renderLines, 0, exportMode))
  for (const [i, version] of extra.entries()) {
    if (!exportMode) lines.push(subjectMarker(i + 1))
    lines.push(sectionPageBreak(options))
    // chaque sujet recommence sa propre pagination et sa numérotation
    // d'exercices (compteur global du paquet exercise-bank)
    lines.push('#counter(page).update(1)')
    if (usesExerciseBank) lines.push('#exo-counter.update(0)')
    lines.push('')
    if (!exportMode) lines.push(subjectAnchor('start', i + 1))
    if (coverLines.length > 0) {
      if (!exportMode) lines.push('#mathalea-anchor("cover", 0)')
      lines.push(
        ...coverPageLines(
          options.coverPage as TypstCoverOptions,
          countQuestions(exercises),
          globalQrCodeUrls[i + 1] != null &&
            options.canMode &&
            coverTemplate === 'can',
          i + 1,
          coverVersion(i + 1),
        ),
      )
      lines.push('')
    }
    const qrCodeHere =
      globalQrCodeUrls[i + 1] != null &&
      !(options.canMode && coverTemplate === 'can')
    if (qrCodeHere) lines.push(...ficheQrCodeLines(i + 1, exportMode))
    if (!exportMode && options.headerStyle !== 'aucun') {
      lines.push('#mathalea-anchor("header", 0)')
    }
    lines.push(
      ...headerBlock(
        options.headerStyle,
        `Sujet ${versionLetter(i + 1)}`,
        !exportMode,
        options.hideVersionLabel,
        scoreInHeader,
        qrCodeHere,
      ),
    )
    lines.push('')
    lines.push(...withSubjectEnd(version.renderLines, i + 1, exportMode))
  }

  return withTypstHighlights(lines.join('\n'))
}

/**
 * Marqueur (commentaire Typst) ouvrant le bloc d'un sujet. `previewCode`
 * (`Typst.svelte`) s'en sert pour ne compiler qu'un sujet dans l'aperçu ; il
 * n'apparaît que sur une fiche à plusieurs sujets et n'a aucun effet sur le
 * rendu. Le numéro est l'indice du sujet (0 = Sujet A).
 */
export function subjectMarker(num: number): string {
  return `// mathalea:sujet(${num})`
}

/** Repère un marqueur de sujet et en extrait le numéro */
export const SUBJECT_MARKER_PATTERN = /^\/\/ mathalea:sujet\((\d+)\)\s*$/

/** Chaîne littérale Typst (échappe backslash et guillemets) */
function typstString(text: string): string {
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/**
 * Littéral tableau Typst. Un tableau d'un seul élément exige une virgule
 * finale (`("a",)`), sans quoi Typst n'y voit qu'une expression parenthésée.
 */
function typstArray(items: string[]): string {
  if (items.length === 0) return '()'
  if (items.length === 1) return `(${items[0]},)`
  return `(${items.join(', ')})`
}

/**
 * Nombre de questions de la fiche, pour la case « Score : ... / n » de la
 * page de garde « Course aux nombres » (mêmes énoncés que ceux du tableau).
 */
function countQuestions(exercises: TypstExerciseInput[]): number {
  return exercises.reduce(
    (total, exercise) =>
      total + (exercise.canQuestions ?? exercise.questions).length,
    0,
  )
}

/**
 * Déclare les textes de la page de garde en variables (`#let couverture-titre
 * = ...`), comme `titre`/`sous-titre`/`entete` pour l'en-tête de la fiche :
 * `coverPageLines` y renvoie plutôt que d'inscrire les valeurs en dur, ce qui
 * permet à la palette de l'aperçu de les modifier par des éditions ciblées
 * (voir `#mathalea-anchor("cover", 0)` dans `buildTypstDocument`), sans
 * régénérer tout le document. Toujours émises quand un modèle est choisi,
 * même les variables inutilisées par ce modèle (`couverture-session` et
 * `couverture-matiere` pour « can », `couverture-note-fin` pour
 * « évaluation ») : une variable Typst non lue ne produit ni erreur ni
 * avertissement, et les garder simplifie la palette (mêmes variables quel
 * que soit le modèle).
 */
function coverDeclarationLines(cover: TypstCoverOptions): string[] {
  if (cover.template === 'aucune') return []
  const consignes = typstArray(
    cover.consignes
      .filter((consigne) => consigne.trim() !== '')
      .map(typstString),
  )
  return [
    `#let couverture-titre = ${typstString(cover.titre)}`,
    `#let couverture-session = ${typstString(cover.session)}`,
    `#let couverture-matiere = ${typstString(cover.matiere)}`,
    `#let couverture-etablissement = ${typstString(cover.etablissement)}`,
    `#let couverture-duree = ${typstString(cover.duree)}`,
    `#let couverture-consignes = ${consignes}`,
    `#let couverture-signature = ${typstString(cover.signatureLabel ?? 'Signature d’un responsable légal')}`,
    `#let couverture-note-fin = ${typstString(cover.noteFin)}`,
  ]
}

/**
 * Étiquette « Sujet A/B... » portée par la page de garde. Seulement quand
 * l'habillage « aucun » ne l'affiche pas dans un bloc de titre : sans cela,
 * une fiche à plusieurs sujets dont la page de garde ouvre chaque sujet ne
 * dirait nulle part de quel sujet il s'agit.
 */
interface CoverVersionLabel {
  label: string
  /** étiquette masquée (réglage `hideVersionLabel`) : seul son repère reste */
  hidden: boolean
  /** émettre le repère de l'icône de l'aperçu (hors mode export) */
  anchor: boolean
}

/** Repère de l'étiquette masquée, hors du flux (voir `headerBlockLines`) */
const HIDDEN_VERSION_ANCHOR =
  '#place(top + right)[#mathalea-anchor("version-label", 0)]'

/** Argument `version:` passé au modèle de page de garde (vide si masquée) */
function coverVersionCall(versionLabel?: CoverVersionLabel): string[] {
  if (versionLabel == null || versionLabel.hidden) return []
  const anchor = versionLabel.anchor
    ? '#mathalea-anchor("version-label", 0)'
    : ''
  return [`  version: [${anchor}${escapeTypstText(versionLabel.label)}],`]
}

/**
 * Étiquette de version de la page de garde d'un sujet, ou `undefined` quand
 * l'en-tête de fiche s'en charge déjà (habillage autre que « aucun »).
 */
function coverVersionLabel(
  options: TypstDocumentOptions,
  versionLabel: string | undefined,
  anchor: boolean,
): CoverVersionLabel | undefined {
  if (versionLabel == null || options.headerStyle !== 'aucun') return undefined
  return { label: versionLabel, hidden: options.hideVersionLabel, anchor }
}

/**
 * Appel de la page de garde : les textes (`couverture-titre`...) réfèrent aux
 * variables déclarées par `coverDeclarationLines`, éditables sur l'aperçu.
 * Seul le barème reste inscrit en dur (réglé dans le volet, pas sur l'aperçu).
 */
function coverPageLines(
  cover: TypstCoverOptions,
  nbQuestions: number,
  showQrCode = false,
  version = 0,
  versionLabel?: CoverVersionLabel,
): string[] {
  if (cover.template === 'aucune') return []
  const versionCall = coverVersionCall(versionLabel)
  const versionAnchor =
    versionLabel?.hidden && versionLabel.anchor ? [HIDDEN_VERSION_ANCHOR] : []
  if (cover.template === 'can') {
    return [
      ...versionAnchor,
      '#mathalea-couverture-can(',
      ...versionCall,
      '  duree: couverture-duree,',
      `  nb-questions: ${nbQuestions},`,
      '  consignes: couverture-consignes,',
      ...(showQrCode
        ? [
            `  qr-code: [#mathalea-anchor("qr-code", ${version})#box(width: ${FICHE_QRCODE_SIZE}, fill: white, inset: 2pt)[#qrcode(${qrCodeGlobalVariableName(version)}, width: 100%)]],`,
          ]
        : []),
      ')',
    ]
  }
  if (cover.template === 'recitation') {
    // le barème est toujours passé (il donne le total « /16 » de la ligne
    // des points) ; `grille` ne décide que de son affichage détaillé
    return [
      ...versionAnchor,
      '#mathalea-couverture-recitation(',
      ...versionCall,
      '  titre: couverture-titre,',
      '  matiere: couverture-matiere,',
      '  etablissement: couverture-etablissement,',
      '  duree: couverture-duree,',
      '  date: couverture-session,',
      '  consignes: couverture-consignes,',
      '  signature-label: couverture-signature,',
      `  bareme: ${typstArray(cover.bareme.map((points) => String(points)))},`,
      `  grille: ${cover.showBareme === true},`,
      `  signature: ${cover.showSignature !== false},`,
      `  note: ${cover.showNote !== false},`,
      ')',
    ]
  }
  const layout = COVER_TEMPLATE_LAYOUT[cover.template]
  const bareme = cover.showBareme
    ? typstArray(cover.bareme.map((points) => String(points)))
    : '()'
  const lines = [
    ...versionAnchor,
    '#mathalea-couverture(',
    ...versionCall,
    '  titre: couverture-titre,',
    '  session: couverture-session,',
    '  matiere: couverture-matiere,',
    '  duree: couverture-duree,',
    '  consignes: couverture-consignes,',
    `  bareme: ${bareme},`,
  ]
  if (layout.identite) lines.push('  identite: true,')
  if (layout.colonneNote) lines.push('  colonne-note: true,')
  if (layout.hasNoteFin) lines.push('  note-fin: couverture-note-fin,')
  lines.push(')')
  return lines
}

/**
 * Titre de la section Corrections d'un sujet, avec le nom du sujet (« Sujet
 * A »...) en dessous quand la fiche a plusieurs versions : en feuilletant
 * directement les pages de corrigé, loin de l'en-tête du sujet qui l'affiche
 * déjà (voir `headerBlock`), rien d'autre n'indique quel sujet on corrige.
 */
function correctionsHeadingLines(
  versionLabel?: string,
  hideVersionLabel = false,
  url?: string,
): string[] {
  const title = url
    ? `  #align(center, text(size: 1.3em, weight: "bold", fill: couleur)[  #link("${url}")[Corrections]])`
    : '  #align(center, text(size: 1.3em, weight: "bold", fill: couleur)[Corrections])'
  if (versionLabel == null || hideVersionLabel) return [title]
  return [
    title,
    `  #align(center, text(weight: "bold", fill: couleur)[${escapeTypstText(versionLabel)}])`,
  ]
}

/** Case de la note globale, sur le total des points des exercices */
const MATHALEA_SCORE_CELL =
  'text(weight: "bold")[Note : #box(width: 2.5em, repeat[.]) / #exo-points-total]'

/**
 * Bloc de titre de la fiche (`titre`, `sous-titre`, `entete` déclarés dans
 * les réglages), selon l'habillage choisi.
 */
function headerBlock(
  style: HeaderStyle,
  versionLabel?: string,
  emitAnchor = false,
  hideVersionLabel = false,
  score = false,
  besideQrCode = false,
): string[] {
  const lines = headerBlockLines(
    style,
    versionLabel,
    emitAnchor,
    hideVersionLabel,
    score,
  )
  // à côté du QR-code de fiche (voir `ficheQrCodeLines`), le bloc de titre
  // s'arrête avant lui plutôt que de passer dessous
  if (!besideQrCode || lines.length === 0) return lines
  return ['#exo-corner-fit[', ...lines.map((line) => `  ${line}`), ']']
}

function headerBlockLines(
  style: HeaderStyle,
  versionLabel?: string,
  emitAnchor = false,
  hideVersionLabel = false,
  score = false,
): string[] {
  // avec plusieurs versions, l'étiquette « Sujet A/B... » termine la ligne
  // d'en-tête (Nom/Prénom/Classe) plutôt que d'ajouter une ligne à part ;
  // dans ce cas la ligne s'affiche même si `entete` est vide (l'étiquette
  // doit rester visible sur chaque sujet)
  const hasVersionLabel = versionLabel != null
  const labelExpr = hasVersionLabel
    ? `text(weight: "bold", fill: couleur)[${escapeTypstText(versionLabel)}]`
    : null
  // Le repère de l'étiquette masquée reste dans le titre, hors du flux.
  // La ligne d'en-tête peut alors disparaître si elle est vide.
  const hiddenVersionAnchor =
    hasVersionLabel && hideVersionLabel && emitAnchor
      ? '  #place(top + right)[#mathalea-anchor("version-label", 0)]'
      : null
  const versionCell =
    labelExpr == null || hideVersionLabel
      ? null
      : emitAnchor
        ? `[#mathalea-anchor("version-label", 0)#${labelExpr}]`
        : labelExpr
  /**
   * Ligne d'en-tête (`entete`), avec l'étiquette de version à sa droite
   * quand il y en a une ; sans étiquette, rendu inchangé (simple `text`,
   * centré pour l'habillage « cadre »).
   */
  const enteteLine = (centered: boolean): string => {
    // note globale (« Note : …… / 16 ») au bout de la ligne, avant
    // l'étiquette de version
    if (score) {
      const align = centered ? 'center' : 'left'
      const cells = [
        MATHALEA_SCORE_CELL,
        ...(versionCell != null ? [versionCell] : []),
      ]
      const columns = ['1fr', ...cells.map(() => 'auto')].join(', ')
      return `grid(columns: (${columns}), align: (${align}, horizon), column-gutter: 1.5em, text(fill: gray.darken(20%))[#entete], ${cells.join(', ')})`
    }
    if (versionCell != null) {
      const align = centered ? 'center' : 'left'
      return `grid(columns: (1fr, auto), align: (${align}, horizon), text(fill: gray.darken(20%))[#entete], ${versionCell})`
    }
    const plain = 'text(fill: gray.darken(20%))[#entete]'
    return centered ? `align(center, ${plain})` : plain
  }
  const enteteCondition =
    score || (hasVersionLabel && !hideVersionLabel) ? 'true' : 'entete != ""'
  // aucun bloc de titre : la fiche commence directement par les exercices.
  // Avec plusieurs versions, l'étiquette « Sujet A/B... » n'a alors nulle
  // part où s'afficher — c'est un compromis accepté du réglage.
  if (style === 'aucun') return []
  if (style === 'cadre') {
    return [
      '#block(width: 100%, stroke: (top: 1pt + couleur, bottom: 1pt + couleur), inset: (y: 8pt))[',
      ...(hiddenVersionAnchor ? [hiddenVersionAnchor] : []),
      '  #set align(center)',
      '  #text(size: 1.4em, weight: "bold", fill: couleur, tracking: 0.5pt)[#smallcaps(titre)]',
      '  #if sous-titre != "" [',
      '    #v(2pt)',
      '    #text(size: 0.85em, fill: gray, style: "italic")[#sous-titre]',
      '  ]',
      ']',
      `#if ${enteteCondition} [ #v(3pt) #${enteteLine(true)} ]`,
      '#v(8pt)',
    ]
  }
  if (style === 'cartouche') {
    // carte à fond très clair (peu d'encre) avec un filet d'accent à gauche
    return [
      '#block(width: 100%, fill: couleur.transparentize(90%), stroke: (left: 3pt + couleur),',
      '  inset: 9pt, radius: (right: 4pt))[',
      ...(hiddenVersionAnchor ? [hiddenVersionAnchor] : []),
      '  #text(size: 1.5em, weight: "bold", fill: couleur)[#titre]',
      '  #if sous-titre != "" [',
      '    #h(1fr)',
      '    #box(baseline: 30%, stroke: 0.6pt + couleur, inset: (x: 6pt, y: 2pt), radius: 3pt,',
      '      text(fill: couleur, weight: "bold", size: 0.85em)[#sous-titre])',
      '  ]',
      ']',
      `#if ${enteteCondition} [`,
      '  #v(4pt)',
      '  #block(width: 100%, stroke: 0.6pt + couleur.lighten(40%), radius: 3pt, inset: 6pt,',
      `    ${enteteLine(false)})`,
      ']',
      '#v(6pt)',
    ]
  }
  // style « épuré » (défaut)
  return [
    '#block(width: 100%, inset: (y: 4pt))[',
    ...(hiddenVersionAnchor ? [hiddenVersionAnchor] : []),
    '  #text(size: 1.5em, weight: "bold", fill: couleur)[#titre]',
    '  #if sous-titre != "" [ #h(1fr) #text(fill: gray)[#sous-titre] ]',
    '  #v(-3pt)',
    '  #line(length: 100%, stroke: 1.2pt + couleur)',
    ']',
    `#if ${enteteCondition} [ #v(2pt) #${enteteLine(false)} ]`,
    '#v(6pt)',
  ]
}

/**
 * Pied de page (texte éditable `pied-page`, sans numéro de page) selon
 * l'habillage. Renvoie l'argument `footer: ...` du `#set page(...)` —
 * `footer: none,` quand `showFooter` est décoché, quel que soit l'habillage.
 *
 * Repère d'édition : `here().page()` (numéro de page **physique**, à la
 * différence de `counter(page)` que les sujets suivants remettent à 1) limite
 * l'icône à la toute première page du document, comme le titre et la page de
 * garde (un seul point d'édition, même si le pied de page, lui, se répète
 * sur chaque page).
 */
function pageFooter(
  style: HeaderStyle,
  showFooter: boolean,
  exportMode: boolean,
): string[] {
  if (!showFooter) return ['footer: none,']
  const anchorLines = exportMode
    ? []
    : ['  #if here().page() == 1 [#mathalea-anchor("footer", 0)]']
  if (style === 'cadre') {
    return [
      'footer: context [',
      ...anchorLines,
      '  #set text(size: 8pt, style: "italic")',
      '  #line(length: 100%, stroke: 0.4pt)',
      '  #v(-2pt)',
      '  #align(left)[#pied-page]',
      '],',
    ]
  }
  if (style === 'cartouche') {
    return [
      'footer: context [',
      ...anchorLines,
      '  #set text(size: 8pt, fill: couleur)',
      '  #line(length: 100%, stroke: 0.6pt + couleur.lighten(30%))',
      '  #v(-2pt)',
      '  #align(left)[#pied-page]',
      '],',
    ]
  }
  return [
    'footer: context [',
    ...anchorLines,
    '  #set text(size: 8pt, fill: gray)',
    '  #line(length: 100%, stroke: 0.4pt + gray.lighten(30%))',
    '  #v(-2pt)',
    '  #align(left)[#pied-page]',
    '],',
  ]
}

/** Indente un bloc pour l'inscrire dans le `#if corrige [...]` */
function indentContentBlock(content: string): string {
  return content
    .split('\n')
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join('\n')
}
