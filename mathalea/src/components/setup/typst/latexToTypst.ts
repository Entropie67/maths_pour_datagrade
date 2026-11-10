import { tex2typst } from 'tex2typst'
import {
  colours,
  mathaleaColorAliases,
} from '../../../lib/2d/colorToLatexOrHtml'
import { lettreDepuisChiffre } from '../../../lib/outils/outilString'
import { renderScratchDiv } from '../../../lib/renderScratch'
import { typstImport } from './typstPackages'

/**
 * Conversion du contenu HTML des exercices (avec formules LaTeX en `$...$`)
 * vers du balisage Typst, pour la vue Typst.
 *
 * Le HTML traité est celui produit par les exercices en contexte HTML
 * : texte, balises simples
 * (br, b, i, sup, listes...), formules KaTeX, tableaux et figures SVG.
 * Les tableaux (HTML ou array LaTeX) deviennent des `#table(...)` natifs ;
 * les figures SVG sont embarquées. Les images restantes sont remplacées par
 * un encart signalant l'élément manquant.
 */

/**
 * URLs des images d'exercices statiques (annales scannées) déjà récupérées,
 * associées au chemin virtuel où leurs octets sont chargés dans le
 * compilateur (`mapShadow`, voir `typstCompiler.ts`). Alimenté par
 * `Typst.svelte` avant la génération du code ; une image absente de ce
 * registre est affichée comme un encart « image non convertie ».
 */
let staticImagePaths: Map<string, string> = new Map()

/** Renseigne le registre des images d'exercices statiques (voir `staticImagePaths`) */
export function setStaticImagePaths(paths: Map<string, string>): void {
  staticImagePaths = paths
}

/**
 * Largeur intrinsèque (pt) donnée à une image d'exercice statique avant son
 * passage dans `mathalea-fit` : volontairement bien plus grande que
 * n'importe quelle page (A4 paysage compris, ~842pt), pour que la figure
 * soit toujours réduite à la largeur disponible plutôt que conserver une
 * largeur fixe plus étroite que la colonne/page qui la contient.
 */
const STATIC_IMAGE_INTRINSIC_WIDTH_PT = 2000

/** Macros LaTeX propres à MathALÉA (ou absentes de tex2typst) */
const CUSTOM_TEX_MACROS: Record<string, string> = {
  // virgule décimale française : sans espace après la virgule
  '\\dcomma': '\\text{,}',
  '\\euro': '\\text{€}',
  '\\pourcent': '\\%',
  '\\degre': '{}^\\circ',
  '\\np': '\\text{np}',
}

/**
 * Réduit une figure si elle est plus large que la place disponible (sinon
 * elle déborde de la colonne / de la page). La largeur naturelle est mesurée,
 * puis le contenu est mis à l'échelle avec ses labels. Inclus dès qu'une
 * figure est présente.
 *
 * `zoom` multiplie ce ratio d'ajustement automatique plutôt que d'être
 * plafonné par lui (\`calc.min(zoom, ratio)\`) : pour une image d'exercice
 * statique, la largeur intrinsèque volontairement énorme
 * (`STATIC_IMAGE_INTRINSIC_WIDTH_PT`) rend ce ratio toujours très inférieur à
 * 1, donc un `min` y laisserait `zoom` sans aucun effet dès qu'il dépasse ce
 * ratio (le cas normal, y compris à 100 %). Sans effet pour les appelants par
 * défaut (`zoom: 1.0`, jamais renseigné) : `base * 1.0 = base`, identique à
 * `calc.min(1.0, ratio)`.
 */
export const MATHALEA_FIT_HELPER = `#let mathalea-fit(body, zoom: 1.0) = layout(size => {
  let natural = measure(body).width
  let base = if natural > 0pt { calc.min(1.0, size.width / natural) } else { 1.0 }
  let f = base * zoom
  if f != 1.0 { box(scale(f * 100%, origin: top + left, reflow: true, body)) } else { body }
})`

/**
 * Réduit une figure (mathalea2d, avec ou sans labels) si elle dépasse la
 * largeur disponible, applique le zoom choisi par le professeur, l'aligne
 * (gauche/centre/droite) et place le repère invisible de la palette de mise
 * en page (contrôle de zoom) au coin haut-droit de son rendu final. Le zoom
 * et l'alignement sont résolus dans un seul passage de layout (measure()
 * d'un contenu encore différé par un layout() imbriqué ne donnerait pas sa
 * taille finale) puis appliqués manuellement (scale + pad), plutôt que via
 * mathalea-fit/align, pour rester cohérents entre eux.
 *
 * `force-true-size` (posé par `mathalea2dContainerToTypst` pour une figure
 * `vraieGrandeur`, voir `mathalea2d.ts`) désactive la réduction automatique à
 * la largeur disponible : une figure de construction/mesure doit garder sa
 * taille physique réelle quel que soit le nombre de colonnes choisi pour la
 * liste de questions, comme le fait déjà tikz en LaTeX (qui ne réduit jamais
 * une figure, quitte à déborder de la colonne). Seul le zoom du professeur
 * reste appliqué. Par défaut à `false`, il ne change rien aux appels
 * existants.
 *
 * `natural-width` (posé pour une figure à labels, dont `mathalea-figure` fixe
 * la largeur de la boîte) évite de `measure()` toute la figure : cette
 * mesure met en page une première fois chaque label (un `context` et
 * plusieurs `measure()` par formule), avant la mise en page définitive. Sur
 * une fiche de plusieurs centaines de labels (multiplications posées), ce
 * doublon épuisait la mémoire du compilateur WASM (« unreachable »).
 * Par défaut à `auto` (mesure), il ne change rien aux appels existants.
 *
 * `default-align` n'a aucun effet au rendu : il ne fait que porter, dans le
 * code, l'alignement par défaut demandé par l'exercice (`typstFigureAlign` de
 * `propositionsQcm`), lu par `figureDefaultAligns` (`buildTypstDocument.ts`)
 * pour déclarer `#let fig-N-align`.
 */
export const MATHALEA_FIGURE_BLOCK_HELPER = `#let mathalea-figure-block(num, alignment, zoom, body, force-true-size: false, natural-width: auto, default-align: none) = layout(size => {
  let natural = if natural-width == auto { measure(body).width } else { natural-width }
  let f = if force-true-size { zoom } else if natural > 0pt { calc.min(zoom, size.width / natural) } else { zoom }
  let scaled = if f != 1.0 { box(scale(f * 100%, origin: top + left, reflow: true, body)) } else { body }
  let content-width = natural * f
  // size.width peut être infini (conteneur sans largeur déterminée à ce
  // stade du flux) : on le plafonne avant de calculer le padding gauche,
  // sinon un centrage/alignement à droite déclenche une panique Typst
  // (« assertion failed: size.is_finite() ») que le zoom évite déjà
  // naturellement via calc.min(zoom, ...).
  let available = calc.min(size.width, 1000pt)
  let left = if alignment == center { calc.max(0pt, (available - content-width) / 2) }
    else if alignment == right { calc.max(0pt, available - content-width) }
    else { 0pt }
  mathalea-anchor("figure", num, dx: left + content-width)
  pad(left: left)[#scaled]
})`

export const MATHALEA_FIGURE_HELPERS = `#let mathalea-label(x, y, body, angle: 0deg, size: auto, fill: auto, background: none, outset: 1pt) = {
  let styled = if size == auto and fill == auto {
    body
  } else if fill == auto {
    text(size: size, body)
  } else if size == auto {
    text(fill: fill, body)
  } else {
    text(size: size, fill: fill, body)
  }
  let content = if background == none {
    styled
  } else {
    box(fill: background, outset: outset, radius: 1pt, styled)
  }
  (x: x, y: y, angle: angle, body: content)
}

#let mathalea-figure(width, height, graphic, labels: ()) = box(width: width, height: height)[
  #place(top + left, graphic)
  #for label in labels {
    let body = if label.angle == 0deg {
      label.body
    } else {
      rotate(label.angle, origin: center, label.body)
    }
    // le label est centré sur son point : on mesure sa largeur naturelle et
    // on décale le placement de la moitié. Un placement par alignement dans
    // une ancre de largeur nulle contraindrait le label à 0pt et couperait
    // les formules à chaque opérateur (f(x) =, -2x +, 3...).
    context {
      let m = measure(box(body))
      place(top + left, dx: label.x - m.width / 2, dy: label.y - m.height / 2, box(body))
    }
  }
]`

/**
 * Import du paquet taskize (mise en colonnes des questions et des
 * propositions de QCM). `tasks` est importée sous le nom `taskize-tasks` :
 * `MATHALEA_TASKS_HELPER` redéfinit `tasks` par-dessus (voir ce helper).
 */
export const TASKIZE_IMPORT = typstImport(
  'taskize',
  'tasks as taskize-tasks, tasks-setup, is-inline-content, format-label',
)

/**
 * Enrobage de `tasks` : aligne le numéro d'une question sur la première
 * ligne de son énoncé, même quand celui-ci contient un bloc (propositions de
 * QCM, figure, tableau).
 *
 * taskize sait déjà le faire quand l'énoncé tient entièrement en ligne : il
 * pose alors l'étiquette sur la première ligne du texte, donc sur sa ligne
 * de base. Sinon il met l'étiquette et l'énoncé dans deux cellules alignées
 * par le haut : une fraction en display (toutes le sont, voir le
 * `#show math.frac` du préambule) creuse la première ligne du texte, dont la
 * ligne de base descend sans que le numéro suive — c'est le décalage visible
 * sur les QCM à fractions.
 *
 * Il numérote lui-même chaque liste : chaque question est décalée du retrait
 * de l'étiquette (`pad`), et son numéro, posé en tête de la première ligne
 * dans une boîte de largeur nulle, est ramené dans la marge ainsi libérée
 * (`move`) — il partage donc la ligne du texte, quelle que soit sa hauteur.
 * Pour les listes purement en ligne, le retrait est celui du paquet (le
 * numéro et l'écart), donc le rendu est le même ; mais le numéro n'occupe plus
 * de place dans la ligne. C'est nécessaire car le `#show math.equation` du
 * préambule enrobe chaque formule en ligne dans une boîte insécable : avec le
 * numéro dans le paragraphe (cas du paquet), une formule presque aussi large
 * que la ligne ne tenait plus à côté du numéro et passait en dessous, laissant
 * « a) » seul sur sa ligne.
 * Une question commençant par un bloc n'a pas de ligne de texte où poser le
 * numéro : elle garde la présentation en deux cellules.
 *
 * Conséquence : dans une liste ainsi numérotée, la syntaxe de fusion de
 * colonnes de taskize (`+ () ...`, `+ (2) ...`) n'est plus reconnue, le
 * repère n'étant plus en tête du contenu de l'item. MathALÉA ne l'émet pas.
 *
 * Contournement temporaire : le correctif a été proposé en amont (paquet MIT,
 * nathan-ed/typst-package-taskize). Dès qu'une version du paquet aligne le
 * numéro dans ce cas, retirer cet enrobage plutôt que de l'empiler dessus —
 * marche à suivre dans `documentation/developpement/maintenance-moteur/
 * exports/typst.md`, section « Numérotation des questions ».
 */
export const MATHALEA_TASKS_HELPER = `#let mathalea-items-questions(corps) = {
  if type(corps) != content { return () }
  if corps.func() == enum.item { return (corps.body,) }
  if corps.has("children") { return corps.children.map(mathalea-items-questions).flatten() }
  ()
}
#let mathalea-question-numerotee(etiquette, largeur, ecart, corps) = {
  let retrait = largeur + ecart
  let boite = box(width: largeur, { h(1fr); etiquette })
  let en-ligne = if is-inline-content(corps) { true } else if type(corps) == content and corps.has("children") {
    is-inline-content(corps.children.at(0, default: none))
  } else { false }
  if en-ligne {
    pad(left: retrait, { box(width: 0pt, move(dx: -retrait, boite)); corps })
  } else {
    grid(columns: (largeur, 1fr), column-gutter: ecart, align(top, boite), corps)
  }
}
// plus grand nombre de colonnes « équilibré » (toutes les lignes pleines
// sauf la dernière, sans colonne inutile : 4, 2 ou 1 pour 4 items, jamais 3)
// où chaque item tient sur une seule ligne, sinon 1
#let mathalea-colonnes-equilibrees(items, largeur, gouttiere, retrait) = {
  let n = items.len()
  let plus-large = calc.max(0pt, ..items.map(item => measure(item).width))
  let colonnes = range(n, 0, step: -1)
    .filter(c => calc.ceil(n / calc.ceil(n / c)) == c)
    .find(c => (largeur - (c - 1) * gouttiere) / c - retrait >= plus-large)
  // aucune proposition ne tient sur une ligne, même seule : une colonne
  if colonnes == none { 1 } else { colonnes }
}
// numéro aligné sur la première ligne de l'énoncé, y compris quand celui-ci
// contient un bloc (QCM, figure) : taskize alignerait alors par le haut.
// \`equilibre: true\` (propositions de QCM) : \`columns: "auto-fit"\` choisit
// un nombre de colonnes équilibré plutôt que celui de taskize, qui peut
// laisser un item seul sur sa ligne ou étaler un item sur plusieurs colonnes
#let tasks(
  label: auto, start: 1, label-width: auto, indent-after-label: auto,
  label-weight: "regular", equilibre: false, ..args, corps,
) = context {
  let items = mathalea-items-questions(corps)
  if equilibre and args.named().at("columns", default: auto) == "auto-fit" and items.len() > 0 {
    return layout(size => {
      let gouttiere = args.named().at("column-gutter", default: 1em).to-absolute()
      let retrait = (if indent-after-label == auto { 0.4em } else { indent-after-label }).to-absolute()
      tasks(
        label: label, start: start, label-width: label-width,
        indent-after-label: indent-after-label, label-weight: label-weight, ..args,
        columns: mathalea-colonnes-equilibrees(items, size.width, gouttiere, retrait), corps,
      )
    })
  }
  if label in (auto, none) or items.len() == 0 {
    taskize-tasks(
      label: label, start: start, label-width: label-width,
      indent-after-label: indent-after-label, label-weight: label-weight, ..args, corps,
    )
  } else {
    let etiquettes = range(items.len()).map(i => text(weight: label-weight, format-label(start + i, label)))
    let ecart = if indent-after-label == auto { 0.4em } else { indent-after-label }
    // listes purement en ligne : même retrait que le paquet (étiquette + écart)
    let en-ligne = items.all(is-inline-content)
    let largeur = if label-width != auto { label-width } else {
      calc.max(..etiquettes.map(e => measure(e).width)) + if en-ligne { ecart } else { 0pt }
    }
    let numerotees = items.enumerate().map(((i, item)) => enum.item(
      mathalea-question-numerotee(etiquettes.at(i), largeur, ecart, item),
    ))
    taskize-tasks(
      label: none, label-width: 0pt, indent-after-label: 0pt, start: start,
      ..args, numerotees.join(),
    )
  }
}`

/**
 * Import du paquet vartable (tableaux de signes/variations, `#tabvar(...)`),
 * inséré tel quel par `TableauSignesVariationsElement.create()` (voir
 * `typstExport.ts`) via le marqueur `<mathalea-typst>`.
 */
export const VARTABLE_IMPORT = typstImport('vartable', 'tabvar')

/**
 * Import du paquet cetz (dessins vectoriels), utilisé tel quel (`cetz.canvas`,
 * `cetz.draw`…) par le code Typst brut des exercices statiques (annales),
 * inséré via le marqueur `<mathalea-typst>` sans passer par la conversion
 * LaTeX -> Typst.
 */
export const CETZ_IMPORT = typstImport('cetz')

/**
 * Import du module `chart` de cetz-plot (diagrammes en barres/bâtons),
 * référencé (`chart.columnchart`…) par le même code Typst brut que
 * `CETZ_IMPORT`, dont il dépend.
 */
export const CETZ_PLOT_CHART_IMPORT = typstImport('cetz-plot', 'chart')

/**
 * Import du paquet `ctz-euclide` (géométrie euclidienne, portage Typst de
 * `tkz-euclide`), utilisé tel quel par le code Typst brut des annales
 * rédigées à la main : `#ctz-canvas`, `ctz-def-points`, `ctz-draw`,
 * `ctz-draw-mark-right-angle`, `ctz-draw-measure-segment`, `ctz-draw-labels`…
 * L'import se fait en `: *` (toute l'API est préfixée `ctz-`) ; le paquet
 * réexporte aussi `cetz` (v0.5.2 embarquée), ce qui satisfait le
 * `import cetz.draw: *` que ces figures ouvrent dans le corps de
 * `ctz-canvas`. Inséré dès que le code contient `ctz-`.
 */
export const CTZ_EUCLIDE_IMPORT = typstImport('ctz-euclide', '*')

/**
 * Aides Typst pour les QCM :
 * - `qcm-bonne` met en évidence le texte de la bonne réponse dans le corrigé ;
 * - `qcm-case` dessine une case à cocher (format `case`) — vide, ou avec une
 *   coche pour la bonne réponse du corrigé — équivalent Typst de
 *   `\faSquare`/`\faCheckSquare` utilisés côté LaTeX (`preambuleTex.ts`) ;
 * - `qcm-lettre` dessine une lettre en boîte (format `lettre`) — fond noir/
 *   texte blanc, ou fond blanc à bordure noire pour la bonne réponse du
 *   corrigé — équivalent Typst des `\colorbox`/`\fcolorbox` LaTeX.
 */
export const MATHALEA_QCM_HELPERS = `#let qcm-bonne(corps) = text(fill: couleur, weight: "bold", corps)
#let qcm-case(correct) = box(width: 0.85em, height: 0.85em, stroke: 0.6pt, radius: 1pt, baseline: 0.15em,
  align(center + horizon, if correct { text(weight: "bold", size: 0.75em)[✓] } else { [] }))
#let qcm-lettre(lettre, correct) = box(
  fill: if correct { white } else { black },
  stroke: if correct { 0.6pt } else { none },
  inset: (x: 0.3em, y: 0.15em), radius: 1pt, baseline: 0.15em,
  text(fill: if correct { black } else { white }, weight: "bold", lettre),
)`

/**
 * Aide Typst pour les schémas en barres (SchemaEnBoite) : une accolade ou une
 * flèche étirée sur toute la largeur de sa cellule, avec son étiquette.
 */
export const MATHALEA_SCHEMA_HELPER = `#let mathalea-schema-span(label, kind: "brace", flip: false, color: black) = layout(size => {
  // Une courbe garde son relief et son épaisseur, même sur une longue barre.
  let deco = if kind == "arrow" {
    text(fill: color, size: 0.9em)[$ stretch(<->, size: #size.width) $]
  } else {
    let w = size.width
    let h = (0.65em).to-absolute()
    let r = calc.min(h, w / 4)
    let y(v) = if flip { h - v } else { v }
    curve(
      stroke: (paint: color, thickness: 0.8pt, cap: "round"),
      curve.move((0pt, y(h))),
      curve.cubic((0pt, y(h / 2)), (r / 2, y(h / 2)), (r, y(h / 2))),
      curve.line((w / 2 - r, y(h / 2))),
      curve.cubic((w / 2 - r / 2, y(h / 2)), (w / 2, y(h / 2)), (w / 2, y(0pt))),
      curve.cubic((w / 2, y(h / 2)), (w / 2 + r / 2, y(h / 2)), (w / 2 + r, y(h / 2))),
      curve.line((w - r, y(h / 2))),
      curve.cubic((w - r / 2, y(h / 2)), (w, y(h / 2)), (w, y(h))),
    )
  }
  let lbl = align(center, text(fill: color, label))
  if flip { stack(spacing: 2pt, deco, lbl) } else { stack(spacing: 2pt, lbl, deco) }
})`

const LATEX_SIZE_TO_TYPST_SIZE: Record<string, string> = {
  tiny: '0.55em',
  scriptsize: '0.7em',
  footnotesize: '0.8em',
  small: '0.9em',
  normalsize: '1em',
  large: '1.2em',
  Large: '1.44em',
  LARGE: '1.73em',
  huge: '2.07em',
  Huge: '2.49em',
}

const LATEX_SIZE_COMMANDS = Object.keys(LATEX_SIZE_TO_TYPST_SIZE)
  .sort((a, b) => b.length - a.length)
  .join('|')

/**
 * Remplace `{\color{X}CONTENU}` (produit par miseEnEvidence) par
 * `\textcolor{X}{CONTENU}` que tex2typst sait convertir.
 */
function replaceColorGroups(tex: string): string {
  let result = ''
  let index = 0
  while (index < tex.length) {
    const start = tex.indexOf('{\\color{', index)
    if (start === -1) {
      result += tex.slice(index)
      break
    }
    result += tex.slice(index, start)
    const colorStart = start + '{\\color{'.length
    const colorEnd = tex.indexOf('}', colorStart)
    if (colorEnd === -1) {
      result += tex.slice(start)
      break
    }
    const color = tex.slice(colorStart, colorEnd)
    // recherche de l'accolade fermante du groupe
    let depth = 1
    let cursor = colorEnd + 1
    while (cursor < tex.length && depth > 0) {
      if (tex[cursor] === '{') depth++
      else if (tex[cursor] === '}') depth--
      cursor++
    }
    const content = tex.slice(colorEnd + 1, cursor - 1)
    result += `\\textcolor{${color}}{${replaceColorGroups(content)}}`
    index = cursor
  }
  return result
}

/**
 * Remplace les blocs `$…$` et `$$…$$` en un seul passage gauche-à-droite, en
 * tenant compte des accolades : un `$` situé dans un `{…}` (mode texte d'un
 * `\text{…}`) ne referme pas le bloc. Sans cela, `$387\text{ m$^2$/h}…$`
 * serait coupé au premier `$` intérieur.
 *
 * Un `$` n'est reconnu comme ouverture d'un bloc affiché `$$…$$` que quand il
 * n'est pas déjà à l'intérieur d'un bloc `$…$` en cours (exactement comme
 * TeX distingue `$` et `$$`) : sinon deux formules juxtaposées sans espace
 * (ex. 4C32 avant sa réécriture : `` $500$ + $=$ + $\dots$ `` concaténées en
 * `$500$$=$$\dots$`) seraient prises pour un unique bloc affiché dont le
 * contenu serait `=`, les deux formules externes étant absorbées. Une
 * formule affichée « genuine » n'apparaît jamais alors qu'on est déjà dans
 * un bloc `$…$` ouvert : elle est donc toujours correctement reconnue.
 */
function replaceBalancedInlineMath(
  text: string,
  convertInline: (tex: string) => string,
  convertDisplay: (tex: string) => string = convertInline,
): string {
  // trouve le `$` (ou `$$`) fermant au niveau d'accolade 0, à partir de `from`
  function findClosing(from: number, display: boolean): number {
    let depth = 0
    for (let j = from; j < text.length; j++) {
      const ch = text[j]
      if (ch === '\\' && '{}\\'.includes(text[j + 1] ?? '')) {
        // `\{` et `\}` sont des accolades affichées (`\left\{`), pas des
        // groupes ; `\\` est sauté pour que `\\{` reste un groupe
        j++
      } else if (ch === '{') depth++
      else if (ch === '}') {
        if (depth > 0) depth--
      } else if (ch === '$' && depth === 0) {
        if (!display || text[j + 1] === '$') return j
      }
    }
    return -1
  }
  let out = ''
  let i = 0
  while (i < text.length) {
    if (text[i] !== '$') {
      out += text[i]
      i++
      continue
    }
    const display = text[i + 1] === '$'
    const start = display ? i + 2 : i + 1
    const close = findClosing(start, display)
    if (close === -1) {
      // `$` (ou `$$`) non apparié : laissé tel quel
      out += text[i]
      i++
      continue
    }
    out += display
      ? convertDisplay(text.slice(start, close))
      : convertInline(text.slice(start, close))
    i = display ? close + 2 : close + 1
  }
  return out
}

/** Couleurs prédéfinies de Typst : passées telles quelles à tex2typst */
const TYPST_NATIVE_COLORS = new Set([
  'black',
  'gray',
  'silver',
  'white',
  'navy',
  'blue',
  'aqua',
  'teal',
  'eastern',
  'purple',
  'fuchsia',
  'maroon',
  'red',
  'orange',
  'yellow',
  'olive',
  'green',
  'lime',
])

/**
 * Teintes ajustées par rapport à la table CSS `colours` : les valeurs CSS de
 * ces noms sont trop claires (darkgray est plus clair que gray !) ou trop
 * pâles pour rester lisibles en tant que couleur de texte sur fond blanc.
 */
const TYPST_COLOR_OVERRIDES: Record<string, string> = {
  brown: '#964B00',
  violet: '#7F00FF',
  pink: '#FF69B4',
  darkgray: '#555555',
  darkgrey: '#555555',
  grey: '#808080',
}

/**
 * Nombre de décimales d'un prix ProfCollege (`\Prix[0]{12}` → « 12 »,
 * `\Prix{12.5}` → « 12,50 », deux décimales par défaut). Une valeur non
 * numérique est renvoyée telle quelle.
 */
function formatePrixProfCollege(valeur: string, decimales: string): string {
  const brut = valeur.trim()
  if (brut === '') return ''
  const nombre = Number(brut.replace(',', '.'))
  const chiffres = decimales.trim() === '' ? 2 : Number(decimales.trim())
  if (!Number.isFinite(nombre) || !Number.isInteger(chiffres) || chiffres < 0) {
    return brut
  }
  return nombre.toFixed(chiffres).replace('.', ',')
}

/**
 * Macros ProfCollege `\Lg[cm]{5}` (longueur), `\Capa[cL]{5}` (capacité) et
 * `\Prix[0]{12}` (prix en euros). Elles n'existent que dans le préambule de la
 * sortie LaTeX, mais les `canEnonce`/`canReponseACompleter` des « Course aux
 * nombres » les écrivent
 * sans tester `context.isHtml` : elles arrivent donc telles quelles dans la
 * conversion Typst, où `$\Lg[mm]{24}$` devient la variable inconnue `Lg`
 * (erreur de compilation, ex. canc3a-2023). L'argument entre accolades peut
 * être vide (`\Lg[mm]{}` derrière des pointillés à compléter) : seule l'unité
 * est alors rendue. `format` reçoit la valeur et l'unité déjà normalisées et
 * les assemble selon le mode (mathématique ou texte).
 */
function remplaceMacrosProfCollege(
  text: string,
  format: (valeur: string, unite: string) => string,
): string {
  return text.replace(
    /\\(Lg|Capa|Prix)\s*(?:\[([^\]]*)\])?\s*\{([^{}]*)\}/g,
    (_match, nom: string, option: string | undefined, valeur: string) => {
      const options = option ?? ''
      return nom === 'Prix'
        ? format(formatePrixProfCollege(valeur, options), '€')
        : format(
            valeur.trim(),
            nom === 'Capa' && option == null ? 'L' : options.trim(),
          )
    },
  )
}

/** Triple `\ldots` tel que tex2typst le rend : marque un espace-réponse élève */
const TRIPLE_ELLIPSIS = '... ... ...'
/** Espace-réponse élève : pointillés de conduite sur une largeur fixe */
const ANSWER_BLANK = '#box(width: 5em, repeat(gap: 2pt)[.])'

/** Prépare une formule LaTeX de MathALÉA avant sa conversion par tex2typst */
function preprocessTex(tex: string): string {
  // les jetons de protection htmlToTypst (\uE000N\uE001) ne sont pas du LaTeX
  // valide ; ils peuvent fuir dans un bloc $…$ via des $$ adjacents — on les supprime
  let output = replaceColorGroups(
    decodeEntities(tex.replace(/\uE000\d+\uE001/g, '')),
  )
  // tex2typst lève une exception sur une tabulation (ou un autre caractère de
  // contrôle d'espacement) présente dans la formule : la sortie retombe alors
  // sur le LaTeX brut affiché verbatim (`\begin{aligned}`…). Ces caractères
  // n'ont aucune valeur en mode mathématique (ils proviennent en général de
  // l'indentation du template literal de l'exercice) : on les ramène à une
  // espace ordinaire.
  output = output.replace(/[\t\f\v\r]/g, ' ')
  // Espaces-réponses des élèves : dans les énoncés MathALÉA, un blanc à
  // compléter est rendu par un `\ldots` seul dans la formule (voir
  // `remplisLesBlancs`, et les `canAnswers`/`canReponseACompleter` des
  // « Course aux nombres »). Le `...` produit par tex2typst est trop court pour
  // qu'un élève y écrive sa réponse : on le triple pour ~3× plus de place.
  // On épargne les vraies ellipses de suites, reconnaissables à la virgule qui
  // borde le `\ldots` (`x_1, \ldots, x_n`).
  // `mathaleaFormatExercice` a déjà remplacé tous les `\ldots` des énoncés par
  // `....` (quatre points, pour KaTeX) avant d'arriver ici : on reconnaît donc
  // aussi ce motif, sans quoi il deviendrait quatre points séparés (`. . . .`).
  output = output.replace(
    /(?<![,][ \t~]{0,4})(?:\\ldots(?![a-zA-Z])|(?<!\.)\.{4}(?!\.))(?![ \t~]{0,4}[,])/g,
    '\\ldots\\ldots\\ldots',
  )
  output = stripLatexSizeCommands(output)
  // tex2typst échoue sur \displaystyle à l'intérieur des environnements
  // d'alignement, alors que la commande y est redondante : les lignes sont
  // déjà rendues en mode affiché par aligned/align. On la retire uniquement
  // dans ces environnements pour conserver son effet dans les formules
  // mathématiques ordinaires.
  if (/\\begin\{(?:align|aligned|alignedat)\}/.test(output)) {
    output = output.replace(/\\displaystyle\b/g, '')
  }
  // Unités écrites avec des $ imbriqués dans \text{} (ex. `m$^2$`,
  // `$\text{cm}^2$` de MathALÉA) : à l'intérieur de \text{}, `$…$` rebascule
  // en mode mathématique. On sort explicitement du texte pour cette partie :
  // `\text{ m$^2$/h}` → `\text{ m}^2\text{/h}` (que tex2typst convertit en
  // `" m"^2 "/h"`). Répété pour plusieurs $…$ dans un même \text{}.
  // Les dollars échappés (formules de tableur, par exemple) restent du texte.
  let prevNested = ''
  while (prevNested !== output) {
    prevNested = output
    output = output.replace(
      /\\text\s*\{([^{}$]*)(?<!\\)\$([^$]+)(?<!\\)\$([^{}$]*)\}/g,
      // n'émet pas de \text{} vide (tex2typst échoue sur un texte vide)
      (_, before: string, math: string, after: string) =>
        `${before ? `\\text{${before}}` : ''}${math}${after ? `\\text{${after}}` : ''}`,
    )
  }
  // \textbackslash (glyphe « \ » du mode texte, employé comme séparateur
  // diagonal dans les en-têtes de tableaux à double entrée, ex.
  // `\text{Tirage1\textbackslash Tirage2}`) : tex2typst le laisse fuir en
  // identifiant nu `textbackslash` (voire échoue). On le remplace par
  // `\backslash` (symbole Typst « \ ») en sortant du mode texte, et on
  // ré-enrobe le texte adjacent d'un `\text{}` pour que tex2typst ne
  // l'égrène pas lettre par lettre (`latexTableCell` passe ces en-têtes en
  // mode math une fois le `\text{}` externe retiré).
  {
    const wrapBackslashSides = (before: string, after: string): string =>
      `${before.trim() ? `\\text{${before}}` : ''}\\backslash ${
        after.trim() ? `\\text{${after}}` : ''
      }`
    let prevBackslash = ''
    while (prevBackslash !== output) {
      prevBackslash = output
      // à l'intérieur d'un \text{…}
      output = output.replace(
        /\\text\s*\{([^{}]*?)\\textbackslash(?:\s*\{\})?\s*([^{}]*?)\}/g,
        (_, before: string, after: string) => wrapBackslashSides(before, after),
      )
    }
    // hors d'un \text{…} : on capture le texte adjacent (hors commande LaTeX)
    output = output.replace(
      /([^{}$\\]*?)\\textbackslash(?:\s*\{\})?\s*([^{}$\\]*)/g,
      (_, before: string, after: string) => wrapBackslashSides(before, after),
    )
  }
  // Commandes d'espacement LaTeX à l'intérieur d'un `\text{…}` : tex2typst
  // recopie le corps tel quel dans la chaîne Typst qu'il produit
  // (`\text{  ; \ \  }` → `"  ; \ \  "`). Or `\ ` n'y est pas une séquence
  // d'échappement valide : la barre oblique se retrouve visible dans le PDF.
  // En mode texte ces commandes ne sont que des espaces de largeurs
  // différentes — on les rend donc par de vrais espaces.
  {
    const spacingMacros =
      /\\(?:qquad|quad|thinspace|enspace|medspace|thickspace|[,;:!]|\s)/g
    output = output.replace(/\\text\s*\{([^{}]*)\}/g, (whole, body: string) => {
      const cleaned = body.replace(spacingMacros, (macro) => {
        if (macro === '\\qquad') return '  '
        // `\!` est un espace négatif : rien à écrire en mode texte
        if (macro === '\\!') return ''
        return ' '
      })
      return cleaned === body ? whole : `\\text{${cleaned}}`
    })
  }
  // `\;` (espace large) en mode math : tex2typst le prend pour un simple `;`
  // et affiche un point-virgule (`\;\widehat{ABC}` → `";" hat(A B C)`).
  // `\thickspace` donne le même espace (5/18 em), converti en `thick`.
  output = output.replace(/(?<!\\)\\;/g, '\\thickspace ')
  // \textit{} en mode math → \text{} (tex2typst ne reconnaît pas \textit)
  output = output.replace(/\\textit\s*\{/g, '\\text{')
  // \text{\textbf{X}} ou \text{\textit{X}} : tex2typst ne supporte pas les
  // commandes LaTeX imbriquées dans \text{} — on supprime le wrapper interne
  output = output.replace(
    /\\text\s*\{\s*\\text(?:bf|it)\s*\{([^{}]*)\}\s*\}/g,
    '\\text{$1}',
  )
  // \textbf en mode mathématique (produit par miseEnEvidence)
  output = output.replace(/\\textbf\s*\{/g, '\\mathbf{')
  // \textbf sans accolades (\textbf, ou \textbf; etc.) : suppression de la commande
  output = output.replace(/\\textbf(?!\s*\{)/g, '')
  // \boldsymbol{X} → \pmb{X} (tex2typst ne connaît pas \boldsymbol et rend
  // \mathbf en `upright(bold(...))` : les variables y perdraient l'italique
  // des mathématiques, alors que \boldsymbol la conserve — c'est la commande
  // employée par `miseEnEvidence`, donc par toutes les réponses en orange)
  output = output.replace(/\\boldsymbol\s*\{/g, '\\pmb{')
  // \texttt{X} → \text{X} (police machine à écrire, tex2typst décompose lettre par lettre)
  output = output.replace(/\\texttt\s*\{/g, '\\text{')
  // \text X (sans accolades, token unique) → \text{X} (tex2typst exige les accolades)
  output = output.replace(/\\text\s+([^{\\])/g, '\\text{$1}')
  // " en mode math : Typst traite " comme délimiteur de chaîne → on le remplace par ''
  output = output.replace(/"/g, "''")
  // \color{X}{CONTENT} (forme deux-arguments) → \textcolor{X}{CONTENT}
  // replaceColorGroups gère {\color{X}...} ; ici on traite \color{X}{...}
  output = output.replace(/\\color\s*\{([^{}]+)\}\s*\{/g, '\\textcolor{$1}{')
  // \color{X} (sans accolades de contenu) — commande de scope LaTeX non supportée
  // par tex2typst qui la passe telle quelle → on la supprime
  output = output.replace(/\\color\s*\{[^{}]+\}/g, '')
  // Groupes de mise en forme vides, produits par `miseEnEvidence('')` quand le
  // signe ou l'opérateur à colorer est absent (ex. 4L15-0 :
  // `{\color{#F15929}\boldsymbol{}}` → `\textcolor{#F15929}{\pmb{}}` ici).
  // tex2typst en fait un `#text(fill: …)[$bold()$]` ; le `bold()` vide est
  // ensuite pris pour une parenthèse orpheline par le rattrapage en aval, qui
  // consomme la parenthèse fermante du `text(…)` englobant et casse la sortie.
  // Ces groupes ne rendent rien : on les supprime (en boucle pour dénicher les
  // `\textcolor{X}{}` révélés par la suppression d'un `\pmb{}` interne).
  let prevEmptyGroup = ''
  while (prevEmptyGroup !== output) {
    prevEmptyGroup = output
    output = output
      .replace(/\\(?:pmb|mathbf|mathrm)\s*\{\s*\}/g, '')
      .replace(/\\textcolor\s*\{[^{}]*\}\s*\{\s*\}/g, '')
  }
  // \big, \Big, \bigg, \Bigg (avec suffixes l/r/m optionnels) : tex2typst
  // laisse les variantes sans suffixe comme variable nue — on les supprime
  output = output.replace(/\\[Bb]igg?[lrm]?\b/g, '')
  // \{ et \} (accolades littérales en mode math, ex. ensemble {a; b}) :
  // tex2typst les convertit en { et } nus → en Typst math, { est un délimiteur
  // de groupe, non un glyphe → erreur "unclosed delimiter".
  // On remplace par \lbrace / \rbrace que tex2typst convertit correctement en
  // brace.l / brace.r (glyphes Typst pour les accolades affichées).
  output = output.replace(/\\{/g, '\\lbrace ')
  output = output.replace(/\\}/g, '\\rbrace ')
  // ; en mode mathématique : Typst l'interprète comme séparateur de lignes
  // dans mat() et vec() (ex. M(a;b) → erreur "expected content, found array")
  // → on le neutralise via \text{;} sauf s'il fait partie de \; (espace)
  output = output.replace(/(?<!\\);/g, '\\text{;}')
  // Les \text{} imbriqués (produits par le remplacement des ; ou par \text{\text{m}}) :
  // \text{ \text{;} } → \text{ ; }  ou  \text{ \text{m} } → \text{ m }
  // On répète deux fois pour gérer les doubles imbrications
  output = output.replace(
    /\\text\{([^{}]*?)\\text\{([^{}]*?)\}([^{}]*?)\}/g,
    '\\text{$1$2$3}',
  )
  output = output.replace(
    /\\text\{([^{}]*?)\\text\{([^{}]*?)\}([^{}]*?)\}/g,
    '\\text{$1$2$3}',
  )
  // \num{12\,345,6} et \numprint{...} : on garde le contenu tel quel,
  // la virgule décimale devenant \dcomma (voir CUSTOM_TEX_MACROS)
  output = output.replace(
    /\\(?:numprint|num)\s*\{([^{}]*)\}/g,
    // seules les virgules « seules » deviennent décimales (pas le \, des
    // espaces fines de séparation des milliers)
    (_, content: string) => content.replace(/(?<!\\),/g, '\\dcomma '),
  )
  // virgule décimale française : 3,5 ou 3{,}5 -> 3\dcomma 5
  output = output.replace(/(\d)\s*\{,\}\s*(?=\d)/g, '$1\\dcomma ')
  output = output.replace(/(\d),(?=\d)/g, '$1\\dcomma ')
  // \\[dim] (saut de ligne avec espacement optionnel, ex. dans \begin{cases}) :
  // tex2typst ne supporte pas l'argument optionnel — on le supprime
  output = output.replace(/\\\\\s*\[[^\]]*\]/g, '\\\\')
  // \phantom / \vphantom n'ont pas d'équivalent direct : on les remplace par une espace.
  // Le contenu peut être imbriqué sur plusieurs niveaux (ex. \phantom{\sqrt{\dfrac{a}{b}}})
  // → on scanne les accolades via `readBraced` plutôt qu'une regex limitée à un niveau
  output = replacePhantomCommands(output)
  // Contenu LaTeX avec un niveau d'imbrication de {} (ex. \xrightarrow{+x~\text{min}})
  const B1 = '(?:[^{}]|\\{[^{}]*\\})*'
  // \xrightarrow[dessous]{dessus} → \overset/\underset autour de la flèche
  // (tex2typst ne connaît pas \xrightarrow ; l'étiquette peut être dans
  // l'argument optionnel, ex. `\xleftarrow[\div 2]{}` de 6N0B-4)
  output = output.replace(
    new RegExp(
      `\\\\x(right|left)arrow\\s*(?:\\[([^\\]]*)\\])?\\s*\\{(${B1})\\}`,
      'g',
    ),
    (_, direction: string, below = '', above = '') => {
      let arrow = direction === 'right' ? '\\rightarrow' : '\\leftarrow'
      if (above.trim() !== '') arrow = `\\overset{${above}}{${arrow}}`
      if (below.trim() !== '') arrow = `\\underset{${below}}{${arrow}}`
      return arrow
    },
  )
  // \stackrel{A}{B} → \overset{A}{B} (tex2typst ne connaît pas \stackrel)
  output = output.replace(/\\stackrel\s*\{/g, '\\overset{')
  // \bf{X} (ancienne commande LaTeX) → \mathbf{X}
  output = output.replace(/\\bf\s*\{/g, '\\mathbf{')
  // \fbox{X} → \text{[X]} (boîte autour du texte — approximation)
  output = output.replace(
    new RegExp(`\\\\fbox\\s*\\{(${B1})\\}`, 'g'),
    '\\text{[$1]}',
  )
  // \fcolorbox{bord}{fond}{X} → \text{[X]} (approximation)
  output = output.replace(
    new RegExp(
      `\\\\fcolorbox\\s*\\{[^{}]*\\}\\s*\\{[^{}]*\\}\\s*\\{(${B1})\\}`,
      'g',
    ),
    '\\text{[$1]}',
  )
  // \boxed{X} → \text{[X]} approximation (tex2typst produit "boxed x" qui est inconnu)
  output = output.replace(
    new RegExp(`\\\\boxed\\s*\\{(${B1})\\}`, 'g'),
    '\\text{[$1]}',
  )
  // \lvert..\rvert → |..|  /  \lVert..\rVert → ‖..‖
  output = output.replace(/\\lvert\b/g, '|').replace(/\\rvert\b/g, '|')
  output = output.replace(/\\lVert\b/g, '\\|').replace(/\\rVert\b/g, '\\|')
  // \leadstoH, \leadstoV, \leadsto* : flèches personnalisées MathALÉA → \rightarrow
  output = output.replace(/\\leadstoH\b/g, '\\rightarrow')
  output = output.replace(/\\leadstoV\b/g, '\\downarrow')
  // \circlearrowright / \circlearrowleft → flèche Typst
  output = output.replace(/\\circlearrowright\b/g, '\\rightarrow')
  output = output.replace(/\\circlearrowleft\b/g, '\\leftarrow')
  // \overgroup{X} → \overline{X} (approximation)
  output = output.replace(/\\overgroup\s*\{/g, '\\overline{')
  // \iffx → \Leftrightarrow (custom macro "si et seulement si")
  output = output.replace(/\\iffx\b/g, '\\Leftrightarrow')
  // Macros ProfCollege de la sortie LaTeX (`\Lg[mm]{24}`, `\Prix[0]{12}`) →
  // valeur suivie de son unité, écrite comme dans les branches HTML des
  // exercices (`5\text{ cm}`) ; seule l'unité subsiste si la valeur est vide
  output = remplaceMacrosProfCollege(output, (valeur, unite) => {
    if (unite === '') return valeur
    return valeur === '' ? `\\text{${unite}}` : `${valeur}\\text{ ${unite}}`
  })
  // \cfrac → \dfrac (tex2typst gère \dfrac ; \cfrac produit "cfrac")
  output = output.replace(/\\cfrac\b/g, '\\dfrac')
  // \empty → \emptyset (alias standard de l'ensemble vide, tex2typst → nothing)
  output = output.replace(/\\empty(?!set)\b/g, '\\emptyset')
  // \overset{\rule{w}{h}}{X} → \overline{X} : filet horizontal au-dessus d'un symbole
  // (utilisé pour le complément d'un événement, ex. \overset{\rule{0.8em}{0.08em}}{A})
  output = output.replace(
    new RegExp(
      `\\\\overset\\s*\\{\\\\rule\\s*\\{[^{}]*\\}\\s*\\{[^{}]*\\}\\}\\s*\\{(${B1})\\}`,
      'g',
    ),
    '\\overline{$1}',
  )
  // \rule{w}{h} résiduel → supprimé (ligne horizontale sans équivalent Typst direct)
  output = output.replace(/\\rule\s*\{[^{}]*\}\s*\{[^{}]*\}/g, '')
  // tex2typst ne parenthèse pas l'étiquette de \overset/\underset :
  // `\overset{\div 2}{\rightarrow}` deviendrait `limits(->)^div 2` (seul
  // `div` en exposant, le `2` et la suite de la formule absorbés à côté).
  // On parenthèse l'étiquette nous-mêmes : des parenthèses de groupe après
  // ^/_ sont invisibles au rendu Typst. Une étiquette vide est supprimée
  // (le second argument reste, en simple groupe).
  output = output.replace(
    new RegExp(`\\\\(overset|underset)\\s*\\{(${B1})\\}`, 'g'),
    (_, command: string, label: string) =>
      label.trim() === '' ? '' : `\\${command}{(${label})}`,
  )
  // \textcolor{none}, \textcolor{none_2}... (marqueurs « sans couleur ») → supprimés
  output = output.replace(/\\textcolor\s*\{none[_\d]*\}/g, '')
  // Couleurs LaTeX nommées non reconnues par Typst (ex. DarkOrange, darkgray)
  // → équivalent hexadécimal (table CSS `colours`) ; les couleurs natives
  // Typst restent nommées, quelques teintes sont ajustées pour la lisibilité
  output = output.replace(
    /\\textcolor\s*\{([a-zA-Z][a-zA-Z_\d]*)\}/g,
    (match, name: string) => {
      const lower = name.toLowerCase()
      const mathaleaAlias = mathaleaColorAliases[lower]
      if (mathaleaAlias) return `\\textcolor{${mathaleaAlias}}`
      if (TYPST_NATIVE_COLORS.has(lower)) return match
      const hex =
        TYPST_COLOR_OVERRIDES[lower] ??
        (colours as Record<string, string>)[lower]
      return hex ? `\\textcolor{${hex}}` : match
    },
  )
  // \hspace*{0.4cm} : tex2typst produirait `#h(*) 0.4 c m` (étoile invalide) ;
  // ces espaces servent surtout à élargir des colonnes, on les neutralise
  output = output.replace(/\\hspace\s*\*?\s*\{[^{}]*\}/g, '\\;')
  // \begin{cases}\begin{aligned}…\end{aligned}\end{cases} (systèmes
  // d'équations) : tex2typst produit `cases(a &= b \\ c &= d)`, or Typst
  // ignore les sauts de ligne `\` dans les branches d'un `cases` et colle les
  // équations sur une seule ligne. On retire l'`aligned` intermédiaire pour
  // obtenir `cases(a &= b, c &= d)`, qui conserve l'alignement sur les `&`.
  output = output.replace(
    /\\begin\{cases\}\s*\\begin\{aligned\}((?:(?!\\begin\{)[\s\S])*?)\\end\{aligned\}\s*\\end\{cases\}/g,
    '\\begin{cases}$1\\end{cases}',
  )
  // & d'alignement hors environnement (ex. `a \leqslant & b \\ c & d`) :
  // on enveloppe dans \begin{aligned}...\end{aligned} pour que tex2typst
  // accepte la formule sans erreur
  if (
    output.includes('&') &&
    !/\\begin\{(?:array|tabular|tblr|align|aligned|alignedat|cases)\}/.test(
      output,
    )
  ) {
    output = `\\begin{aligned}${output}\\end{aligned}`
  }
  // Mot comportant une lettre latine accentuée et non protégé par \text{}
  // (erreur d'auteur d'exercice, ex. `n^{ième}` ou `à` oubliés hors de
  // \text{}) : tex2typst décompose un tel mot lettre par lettre en
  // identifiants nus (`n^{ième}` → `n^(i è m e)`), ce qui isole chaque
  // lettre accentuée comme un caractère seul en mode maths. Certaines
  // polices maths (ex. Noto Sans Math) n'ont pas ces glyphes précomposés :
  // Typst refuse alors de les afficher (« shaping ... yielded more than
  // one glyph »), quelle que soit la police de repli. On protège d'abord
  // les \text{} déjà présents (ne doivent pas être ré-enveloppés), puis on
  // enveloppe tout mot accentué restant dans \text{} : tex2typst le rend
  // alors en chaîne Typst, toujours affichée correctement quelle que soit
  // la police maths active (contrairement à un caractère nu).
  {
    const protectedTextBlocks: string[] = []
    output = output.replace(/\\text\s*\{[^{}]*\}/g, (match) => {
      protectedTextBlocks.push(match)
      return `${protectedTextBlocks.length - 1}`
    })
    output = output.replace(
      /[a-zA-Z]*[àâäéèêëîïôöùûüÿçœæÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇŒÆ][a-zA-ZàâäéèêëîïôöùûüÿçœæÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇŒÆ-]*/g,
      (word) => `\\text{${word}}`,
    )
    output = output.replace(
      /(\d+)/g,
      (_, i: string) => protectedTextBlocks[Number(i)],
    )
  }
  // Marque le contenu des \text{…} qui contient une lettre, y compris
  // accentuée (unités, mots), pour le rendre ensuite avec la police du texte
  // via #txt. La ponctuation seule (\text{,} décimale, \text{;}) n'est pas
  // marquée : elle reste collée. Un mot entièrement accentué (ex. « à »,
  // sans lettre ASCII) doit être marqué comme les autres : laissé en chaîne
  // Typst nue, il hérite de la police maths ambiante, dont le repli
  // automatique de glyphe peut mal composer un accent en position
  // d'exposant/indice (accent flottant au lieu du caractère composé).
  output = output.replace(
    /\\text\s*\{([^{}]*[a-zA-ZàâäéèêëîïôöùûüÿçœæÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇŒÆ][^{}]*)\}/g,
    `\\text{${TXT_MARK_OPEN}$1${TXT_MARK_CLOSE}}`,
  )
  // sp() produit &nbsp; en contexte HTML, y compris pour l'export Typst.
  // Après décodage, tex2typst refuse U+00A0 en mode maths : utiliser ~ pour
  // conserver l'espace insécable. Dans \text{…}, elle reste littérale.
  output = output.replace(/\\text\s*\{[^{}]*\}|\u00a0/g, (match) =>
    match === '\u00a0' ? '~' : match,
  )
  return output
}

/** Marqueurs (zone privée Unicode) délimitant le texte à rendre via #txt */
const TXT_MARK_OPEN = '\uE010'
const TXT_MARK_CLOSE = '\uE011'

/**
 * Applique une transformation uniquement au code Typst situé hors des
 * chaînes `"..."`. Les corrections de syntaxe mathématique ne doivent jamais
 * réinterpréter les crochets ou parenthèses qui appartiennent au texte affiché.
 */
function transformOutsideTypstStrings(
  source: string,
  transform: (code: string) => string,
): string {
  const strings: string[] = []
  let masked = ''
  let index = 0

  while (index < source.length) {
    if (source[index] !== '"') {
      masked += source[index]
      index++
      continue
    }

    const stringStart = index++
    while (index < source.length) {
      if (source[index] === '\\') {
        index += 2
      } else if (source[index] === '"') {
        index++
        break
      } else {
        index++
      }
    }
    strings.push(source.slice(stringStart, index))
    masked += `\uE020${strings.length - 1}\uE021`
  }

  return transform(masked).replace(
    /\uE020(\d+)\uE021/g,
    (_, stringIndex: string) => strings[Number(stringIndex)],
  )
}

/** Corrige la sortie de tex2typst pour qu'elle compile avec Typst */
function postprocessTypst(typst: string): string {
  let result = typst
    // Texte marqué (unités, mots issus de \text{…}) : rendu avec la police
    // du texte via #txt. tex2typst a transformé \text{⟨mark⟩X⟨mark⟩} en la
    // chaîne "⟨mark⟩X⟨mark⟩" ; on la remplace par #txt("X"). Un indice ou
    // exposant (`_"…"`, `^"…"`) reçoit des parenthèses pour rester valide.
    // Les espaces que tex2typst place autour de la chaîne (simples séparateurs
    // de jetons) sont consommées : contrairement à LaTeX, Typst rend une
    // espace source qui borde une chaîne, elle s'ajouterait donc à celle déjà
    // contenue dans le \text{…} d'origine (`5\text{ cm}` → `5 #txt(" cm")`
    // afficherait une double espace) ou à l'espace insécable qui précède
    // (`5~\text{cm}` → `5 space.nobreak #txt("cm")`).
    // Si le `#txt(…)` est immédiatement suivi d'un `(` ou `[` (ex. `\text{le
    // groupement }(x+y)` des exercices de factorisation), Typst enchaîne l'appel
    // (`#txt("…")(x + y)` = appel de la valeur retournée) et échoue sur
    // « expected comma ». On ré-insère une espace de séparation dans ce cas.
    //
    // Un `\` isolé (saut de ligne d'un `aligned`, ex. `\text{Donc :}` en
    // début de ligne) précède parfois directement la chaîne marquée : la
    // capture ci-dessous consomme aussi l'espace qui le sépare de la
    // chaîne, ce qui recollerait `\` et `#txt(` en `\#txt(`. Or `\#` est en
    // Typst l'échappement du caractère `#` : le saut de ligne disparaît et
    // un `#` littéral s'affiche à sa place. On restitue donc l'espace dans
    // ce cas précis pour garder `\` et `#txt(` séparés.
    .replace(
      new RegExp(
        `(\\\\)? ?([_^]?)"${TXT_MARK_OPEN}([^"]*)${TXT_MARK_CLOSE}" ?([([])?`,
        'g',
      ),
      (
        _m,
        lineBreak: string | undefined,
        script: string,
        body: string,
        chained: string | undefined,
      ) => {
        const prefix = lineBreak ? '\\ ' : ''
        const suffix = chained ? ` ${chained}` : ''
        return script
          ? `${prefix}${script}(#txt("${body}"))${suffix}`
          : `${prefix}#txt("${body}")${suffix}`
      },
    )
    // `\text{ }` (espace seule, non marquée car sans lettre) devient la chaîne
    // `" "` : même raison que ci-dessus, les espaces sources qui l'encadrent
    // doubleraient l'espace rendue.
    .replace(/ ?(" +") ?/g, '$1')
    // tex2typst émet `fill: #f15929` pour \textcolor : Typst attend rgb("...")
    .replace(
      /fill: #([0-9a-fA-F]{3,8})\b/g,
      (_, hex: string) => `fill: rgb("#${hex}")`,
    )
    // Les labels mathalea2d peuvent fournir des couleurs HTML sans `#`.
    .replace(
      /fill: ([0-9a-fA-F]{3,8})\b/g,
      (_, hex: string) => `fill: rgb("#${hex}")`,
    )
    // tex2typst laisse parfois passer les macros LaTeX explicites
    // \thinspace, \medspace, \thickspace, absentes de Typst.
    .replace(/\bthinspace\b/g, 'thin')
    .replace(/\bmedspace\b/g, 'med')
    .replace(/\bthickspace\b/g, 'thick')
    .replace(/\bnegthinspace\b/g, '#h(-math.thin.amount)')
    // \lim\limits_{…} / \sum\nolimits_{…} : tex2typst laisse \limits et
    // \nolimits comme mots nus → Typst les rend en toutes lettres.
    // On applique les fonctions Typst équivalentes à l'opérateur précédent :
    // `lim limits_(…)` → `limits(lim)_(…)`, `sum nolimits_(…)` → `scripts(sum)_(…)`.
    .replace(/\b([A-Za-z]+(?:\.[A-Za-z]+)*) limits(?=[_^])/g, 'limits($1)')
    .replace(/\b([A-Za-z]+(?:\.[A-Za-z]+)*) nolimits(?=[_^])/g, 'scripts($1)')

  // tex2typst produit #text(fill: C)[$math$] pour \textcolor{C}{math} :
  // les $ imbriqués font sortir du mode math → "unclosed delimiter".
  // → on convertit en text(fill: C, math). Les couleurs imbriquées (ex.
  //   #text(fill: A)[$x + #text(fill: B)[$y$]$]) nécessitent de traiter
  //   l'intérieur en premier : on itère jusqu'à ce qu'il n'y ait plus de match.
  // Le fill peut être `rgb("#hex")` (parens imbriquées) → on le match explicitement
  // avant le fallback [^)]+.
  const colorRe = /#text\(fill: (rgb\("[^"]*"\)|[^)]+)\)\[\$([^$]*)\$\]/g
  let prev = ''
  while (prev !== result) {
    prev = result
    result = result.replace(colorRe, (_, fill: string, math: string) => {
      // Résout la couleur pour le mode code Typst :
      // – rgb(...) → #rgb(...) (appel de fonction Typst)
      // – noms CSS absents de Typst (ex. lightgray) → #rgb("#hex") via NAMED_COLOR_TO_HEX
      // – none / none_2 / transparent → supprimer la couleur, garder le contenu
      // – noms Typst natifs (black, red…) → #nom (variable Typst)
      // – littéraux hex (#F15929) → inchangés (littéral couleur Typst)
      const lower = fill.toLowerCase()
      if (/^none/.test(lower)) return math
      let mathFill: string
      if (/^rgb\(/.test(fill)) {
        mathFill = `#${fill}`
      } else if (lower in NAMED_COLOR_TO_HEX) {
        mathFill = `#rgb("${NAMED_COLOR_TO_HEX[lower]}")`
      } else if (/^[a-z]/.test(fill)) {
        mathFill = `#${fill}`
      } else {
        mathFill = fill
      }
      // `bold()` n'épaissit que les lettres et chiffres : la police de maths
      // n'a pas de variante grasse pour les opérateurs, parenthèses ou
      // radicaux (`\boldsymbol` LaTeX les épaissit tous). Un léger contour de
      // la même couleur rétablit un gras homogène sur toute la réponse.
      const paint = /^#(?:rgb\(|[a-z])/.test(mathFill)
        ? mathFill.slice(1)
        : null
      if (paint != null && /^bold\(/.test(math)) {
        return `text(fill: ${mathFill}, stroke: #stroke(paint: ${paint}, thickness: 0.025em), ${math})`
      }
      return `text(fill: ${mathFill}, ${math})`
    })
  }

  result = result
    // \mathbf{[}, \mathbf{]}, \textbf{[} etc. produisent upright(bold([)) ou bold([) en
    // Typst mathématique : [ est interprété comme délimiteur ouvrant → "unclosed delimiter".
    // On remplace par bracket.l / bracket.r (glyphes Typst).
    .replace(/\bupright\(bold\(\[+\)\)/g, 'upright(bold(bracket.l))')
    .replace(/\bupright\(bold\(\]+\)\)/g, 'upright(bold(bracket.r))')
    .replace(/\bbold\(\[+\)/g, 'bold(bracket.l)')
    .replace(/\bbold\(\]+\)/g, 'bold(bracket.r)')
    .replace(/\bupright\(\[+\)/g, 'upright(bracket.l)')
    .replace(/\bupright\(\]+\)/g, 'upright(bracket.r)')
    // \boldsymbol{(} / \boldsymbol{)} (ou \pmb, ex. 3L11-3b qui colore en bleu le
    // signe et les parenthèses d'un produit ajouté) isolent une parenthèse dans
    // un groupe gras :
    //  - bold())  → bold() ferme sans corps → "missing argument: body"
    //  - bold(()  → "(" ouvre un délimiteur jamais fermé → "unclosed delimiter"
    // On remplace la parenthèse isolée par le glyphe Typst paren.l / paren.r ;
    // un éventuel contenu gras qui précède (un signe + ou -) est conservé.
    .replace(/\bupright\(bold\(\)\)\)/g, 'upright(bold(paren.r)))')
    .replace(/\bupright\(bold\(([^()]*?)\(\)\)/g, 'upright(bold($1paren.l))')
    .replace(/\bbold\(\)\)/g, 'bold(paren.r)')
    .replace(/\bbold\(([^()]*?)\(\)/g, 'bold($1paren.l)')
    // \mathbf{)} produit bold() vide (le ) ferme immédiatement bold() sans contenu).
    // bold() sans corps → "missing argument: body" dans Typst. On remplace par paren.r.
    .replace(/\bupright\(bold\(\)\)/g, 'upright(bold(paren.r))')
    .replace(/\bbold\(\)/g, 'bold(paren.r)')

  // \left[...\right] dans \mathbf{} produit [...] (crochets nus). Si plusieurs [A]×[B]
  // se suivent, la séquence ]×[ crée de faux intervalles. On convertit TOUTES les paires
  // équilibrées [...] en bracket.l/bracket.r sans délimiteurs actifs.
  // Les réunions/intersections d'intervalles sont d'abord reconnues dans leur
  // contexte complet : tex2typst peut faire coïncider les deux bornes intérieures
  // avec une paire qui ressemble à `[union]`. Une fois ces cas levés, toute paire
  // [...] restante est un vrai couple de délimiteurs, y compris quand son contenu
  // n'est fait que de minuscules (`[x]`, `K[x]`). On traite les paires de l'intérieur
  // vers l'extérieur en bouclant jusqu'à stabilité.
  {
    let prevBrackets = ''
    while (prevBrackets !== result) {
      prevBrackets = result
      result = transformOutsideTypstStrings(result, (code) =>
        code
          // Pour une réunion d'intervalles français, tex2typst transforme les
          // deux bornes qui encadrent `\cup` en `[union]` :
          // `[a;b[\cup]c;d]` devient `[a ; b [union] c ; d]`.
          // Cette paire n'est donc pas un décor autour de l'opérateur : elle
          // contient la borne droite du premier intervalle et la borne gauche
          // du second. La convertir d'abord évite de les perdre dans la règle
          // qui nettoie les crochets de `[union]`.
          .replace(
            /([\[\]])([^\[\]]*?)\[\s*(union|inter|without)\s*\]([^\[\]]*?)([\[\]])/g,
            (
              _match,
              leftOuter: string,
              firstBody: string,
              operator: string,
              secondBody: string,
              rightOuter: string,
            ) => {
              const glyph = (bracket: string): string =>
                bracket === '[' ? 'bracket.l' : 'bracket.r'
              return `lr(${glyph(leftOuter)} ${firstBody} bracket.l) ${operator} lr(bracket.r ${secondBody} ${glyph(rightOuter)})`
            },
          )
          // Dans les autres cas, tex2typst conserve l'opérateur sous la forme
          // `] union [` entre les deux intervalles. Ces deux crochets sont eux
          // aussi des bornes, et non des séparateurs parasites.
          .replace(
            /([\[\]])([^\[\]]*?)([\[\]])\s*(union|inter|without)\s*([\[\]])([^\[\]]*?)([\[\]])/g,
            (
              _match,
              leftOuter: string,
              firstBody: string,
              firstRight: string,
              operator: string,
              secondLeft: string,
              secondBody: string,
              rightOuter: string,
            ) => {
              const glyph = (bracket: string): string =>
                bracket === '[' ? 'bracket.l' : 'bracket.r'
              return `lr(${glyph(leftOuter)} ${firstBody} ${glyph(firstRight)}) ${operator} lr(${glyph(secondLeft)} ${secondBody} ${glyph(rightOuter)})`
            },
          )
          .replace(/\[([^\[\]]*)\]/g, 'lr(bracket.l $1 bracket.r)'),
      )
    }
  }

  return (
    result
      // tex2typst produit #none_N pour un indice sans base LaTeX (ex. $_2$) →
      // variable inconnue en Typst. On supprime le préfixe invalide.
      .replace(/#none_\w+/g, '')
      // tex2typst convertit \left]...\right[ en lr(]...[), \left[...\right[ en
      // lr([...[). En Typst, ] et [ juste après/avant lr()/lr() sont parsés comme
      // délimiteurs → "unclosed delimiter". On remplace par bracket.r/bracket.l.
      // Cas 1 : ]...[ → intervalles ouverts
      .replace(/lr\(\]([^\[\]]*)\[\)/g, 'lr(bracket.r $1 bracket.l)')
      // Cas 2 : [...[ → semi-ouvert fermé à gauche, ouvert à droite
      .replace(/lr\(\[([^\[\]]*)\[\)/g, 'lr(bracket.l $1 bracket.l)')
      // Cas 3 : ]...] → semi-ouvert ouvert à gauche, fermé à droite
      .replace(/lr\(\]([^\[\]]*)\]\)/g, 'lr(bracket.r $1 bracket.r)')
      // Cas 4 : crochet + parenthèse mixtes (demi-droite [Oz), intervalle [a;b))
      // produits par \left[…\right) → lr([… )). Le crochet resterait non fermé.
      .replace(/lr\(\[([^\[\]()]*)\)\)/g, 'lr(bracket.l $1 paren.r)')
      .replace(/lr\(\(([^\[\]()]*)\]\)/g, 'lr(paren.l $1 bracket.r)')
      // Intervalles français nus (sans \left\right) : ]a;b[, ]a;b], [a;b[
      // (après le traitement des lr(), il ne reste que des crochets résiduels)
      // L'espace initial évite la concaténation d'identifiants : tex2typst peut
      // coller des symboles contre ] sans espace (ex. "union]" → "union lr(…)").
      .replace(/\]([^\[\]]*)\[/g, ' lr(bracket.r $1 bracket.l)')
      .replace(/\]([^\[\]]*)\]/g, ' lr(bracket.r $1 bracket.r)')
      .replace(/\[([^\[\]]*)\[/g, ' lr(bracket.l $1 bracket.l)')
      // demi-droites / intervalles mixtes nus ([Oz), (a;b]) : crochet et
      // parenthèse dépareillés → délimiteurs explicites dans un lr()
      .replace(/\[([^\[\]()]*)\)/g, ' lr(bracket.l $1 paren.r)')
      .replace(/\(([^\[\]()]*)\]/g, ' lr(paren.l $1 bracket.r)')
      // virgule décimale : Typst la colle aux chiffres seulement si la
      // chaîne `","` est écrite sans espaces autour
      .replace(/(\d) ?"," ?(?=\d)/g, '$1","')
  )
}

/**
 * En Typst math, `(` est un délimiteur groupant qui doit toujours être fermé.
 * Quand un bloc $…$ est un fragment d'expression (ex. $)\times(4$ dans une
 * phrase mixte), les parenthèses peuvent être déséquilibrées et provoquer
 * « unclosed delimiter ». On remplace les ( et ) orphelins par paren.l / paren.r.
 */
function balanceTypstMathParens(s: string): string {
  const chars = s.split('')
  const openingParens: number[] = []
  let inString = false
  let escaped = false

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }

    if (ch === '(') {
      openingParens.push(i)
    } else if (ch === ')') {
      if (openingParens.length > 0) {
        openingParens.pop()
      } else {
        // espaces des deux côtés : sans celui de gauche, le glyphe se colle au
        // symbole précédent et Typst lit un seul identifiant ($\beta)$ donnait
        // `betaparen.r`, donc « variable inconnue betaparen »)
        chars[i] = ' paren.r '
      }
    }
  }

  for (const index of openingParens) chars[index] = ' paren.l '
  return chars.join('')
}

function readBraced(
  text: string,
  openIndex: number,
): { value: string; end: number } | null {
  if (text[openIndex] !== '{') return null
  let depth = 0
  for (let index = openIndex; index < text.length; index++) {
    const char = text[index]
    if (char === '\\') {
      index++
      continue
    }
    if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) {
        return { value: text.slice(openIndex + 1, index), end: index + 1 }
      }
    }
  }
  return null
}

/**
 * Remplace \phantom{…}, \hphantom{…} et \vphantom{…} par une espace, quel que
 * soit le niveau d'imbrication de leur contenu (ex. \phantom{\sqrt{\dfrac{a}{b}}}) :
 * une regex à un seul niveau de `{}` laisse passer les cas plus profonds tels
 * quels vers tex2typst, qui émet alors `phantom` comme variable inconnue.
 */
function replacePhantomCommands(text: string): string {
  const marker = /\\(?:phantom|hphantom|vphantom)\s*\{/g
  let output = ''
  let index = 0
  let match: RegExpExecArray | null
  while ((match = marker.exec(text)) != null) {
    const openIndex = match.index + match[0].length - 1
    const arg = readBraced(text, openIndex)
    if (arg == null) {
      marker.lastIndex = match.index + match[0].length
      continue
    }
    output += text.slice(index, match.index) + '\\;'
    index = arg.end
    marker.lastIndex = arg.end
  }
  output += text.slice(index)
  return output
}

/**
 * Remplace `\nom{…}…{…}` par le résultat de `rendu`, en lisant ses arguments
 * à accolades équilibrées (`readBraced`) : les contenus imbriqués (une
 * `\parbox` dans une `\fbox`, par exemple) sont donc traités correctement,
 * là où une expression rationnelle s'arrêterait à la première accolade
 * fermante. Une occurrence à qui il manque un argument est laissée telle
 * quelle.
 */
function replaceLatexCommand(
  text: string,
  name: string,
  argCount: number,
  rendu: (args: string[]) => string,
): string {
  // l'étoile de `\hspace*` : même commande, l'espace est simplement conservée
  // en début de ligne
  const marker = new RegExp(`\\\\${name}\\*?\\s*(?=\\{)`, 'g')
  let output = ''
  let index = 0
  let match: RegExpExecArray | null
  while ((match = marker.exec(text)) != null) {
    const args: string[] = []
    let position = match.index + match[0].length
    for (let n = 0; n < argCount; n++) {
      const arg = readBraced(text, position)
      if (arg == null) break
      args.push(arg.value)
      position = arg.end
    }
    if (args.length < argCount) {
      marker.lastIndex = match.index + match[0].length
      continue
    }
    output += text.slice(index, match.index) + rendu(args)
    index = position
    marker.lastIndex = position
  }
  output += text.slice(index)
  return output
}

/** Jeton posé par `protect()` à la place d'un fragment Typst déjà converti */
const PROTECTED_TOKEN = /\uE000\d+\uE001/

/** Sépare `]` ou `)` d'une `(` qui suivrait : Typst en ferait les arguments d'un appel */
const ZERO_WIDTH_SPACE = '\u200B'

/**
 * Contenu de `\fbox`/`\framebox` : un cadre fin autour du contenu, laissé
 * dans le flux de conversion entre le fragment protégé qui ouvre la boîte et
 * celui qui la ferme.
 */
function encadre(contenu: string, protect: (fragment: string) => string) {
  return `${protect('#box(stroke: 0.6pt + luma(60), inset: (x: 6pt, y: 5pt))[')}${contenu}${protect(']')}`
}

/**
 * Longueur LaTeX (argument de `\hspace`) en longueur Typst. `\linewidth` et
 * ses synonymes deviennent un pourcentage de la largeur disponible
 * (`0.5\linewidth` → `50%`). Renvoie `null` pour tout ce qui n'est pas une
 * longueur reconnue (l'appelant s'en passe alors).
 */
function latexLengthToTypst(longueur: string): string | null {
  const texte = longueur.trim()
  const relative = /^([+-]?\d*\.?\d*)\s*\\(?:line|text|column)width$/.exec(
    texte,
  )
  if (relative != null) {
    const facteur = relative[1] === '' ? 1 : Number(relative[1])
    if (Number.isFinite(facteur)) return `${facteur * 100}%`
  }
  const absolue = /^([+-]?\d*\.?\d+)\s*(pt|mm|cm|in|em|ex)$/.exec(texte)
  if (absolue != null) return `${Number(absolue[1])}${absolue[2]}`
  return null
}

function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let arrayDepth = 0
  let start = 0
  for (let index = 0; index < text.length; index++) {
    if (text.startsWith('\\begin{array}', index)) {
      arrayDepth++
      index += '\\begin{array}'.length - 1
      continue
    }
    if (text.startsWith('\\end{array}', index)) {
      arrayDepth = Math.max(0, arrayDepth - 1)
      index += '\\end{array}'.length - 1
      continue
    }
    const char = text[index]
    if (char === '\\') {
      index++
      continue
    }
    if (char === '{') depth++
    else if (char === '}') depth = Math.max(0, depth - 1)
    else if (char === separator && depth === 0 && arrayDepth === 0) {
      parts.push(text.slice(start, index))
      start = index + 1
    }
  }
  parts.push(text.slice(start))
  return parts
}

function stripLatexSizeCommands(text: string): string {
  let output = ''
  let index = 0
  // fin de commande = tout sauf une lettre : `\large5` est du LaTeX valide,
  // et `\b` ne coupe pas entre une lettre et un chiffre
  const sizeCommand = new RegExp(
    `\\\\(${LATEX_SIZE_COMMANDS})(?![a-zA-Z])`,
    'g',
  )
  while (index < text.length) {
    sizeCommand.lastIndex = index
    const match = sizeCommand.exec(text)
    if (match == null) {
      output += text.slice(index)
      break
    }
    output += text.slice(index, match.index)
    let cursor = match.index + match[0].length
    while (/\s/.test(text[cursor] ?? '')) cursor++
    if (text[cursor] === '{') {
      const arg = readBraced(text, cursor)
      if (arg != null) {
        output += arg.value
        index = arg.end
        continue
      }
    }
    index = cursor
  }
  return output
}

function findMatchingEndEnvironment(
  text: string,
  env: string,
  bodyStart: number,
): number {
  const begin = `\\begin{${env}}`
  const end = `\\end{${env}}`
  let depth = 1
  let cursor = bodyStart
  while (cursor < text.length) {
    const nextBegin = text.indexOf(begin, cursor)
    const nextEnd = text.indexOf(end, cursor)
    if (nextEnd === -1) return -1
    if (nextBegin !== -1 && nextBegin < nextEnd) {
      depth++
      cursor = nextBegin + begin.length
    } else {
      depth--
      if (depth === 0) return nextEnd
      cursor = nextEnd + end.length
    }
  }
  return -1
}

function expandColumnSpecRepeats(spec: string): string {
  // Scanner par accolades (via `readBraced`) plutôt que regex `[^{}]*` :
  // le contenu répété (ex. `*{3}{>{\centering \arraybackslash}X|}`)
  // contient lui-même des accolades imbriquées (`>{...}`), qu'une regex
  // sans suivi de profondeur ne referme pas au bon endroit.
  let output = ''
  for (let index = 0; index < spec.length; index++) {
    if (spec[index] === '*') {
      let cursor = index + 1
      while (/\s/.test(spec[cursor] ?? '')) cursor++
      const countArg = readBraced(spec, cursor)
      const count = countArg?.value.trim()
      if (countArg != null && count != null && /^\d+$/.test(count)) {
        cursor = countArg.end
        while (/\s/.test(spec[cursor] ?? '')) cursor++
        const contentArg = readBraced(spec, cursor)
        if (contentArg != null) {
          output += contentArg.value.repeat(Number(count))
          index = contentArg.end - 1
          continue
        }
      }
    }
    output += spec[index]
  }
  return output
}

function removeColumnSpecModifiers(spec: string): string {
  let output = spec
  for (const marker of ['>', '<']) {
    let index = 0
    let rebuilt = ''
    while (index < output.length) {
      const start = output.indexOf(`${marker}{`, index)
      if (start === -1) {
        rebuilt += output.slice(index)
        break
      }
      rebuilt += output.slice(index, start)
      const arg = readBraced(output, start + marker.length)
      if (arg == null) {
        rebuilt += output[start]
        index = start + 1
      } else {
        index = arg.end
      }
    }
    output = rebuilt
  }
  return output
}

interface ParsedColumnSpec {
  aligns: ('left' | 'center' | 'right')[]
  vlines: number[]
}

function parseLatexColumnSpec(
  spec: string,
  fallbackColumns = 0,
): ParsedColumnSpec {
  const normalized = removeColumnSpecModifiers(expandColumnSpecRepeats(spec))
  const aligns: ('left' | 'center' | 'right')[] = []
  const vlines: number[] = []
  for (let index = 0; index < normalized.length; index++) {
    const char = normalized[index]
    if (char === '|') {
      vlines.push(aligns.length)
    } else if (char === 'l') {
      aligns.push('left')
    } else if (char === 'c' || char === 'X' || char === 'S') {
      aligns.push('center')
    } else if (char === 'r') {
      aligns.push('right')
    } else if (['p', 'm', 'b'].includes(char)) {
      aligns.push('left')
      while (
        index + 1 < normalized.length &&
        /\s/.test(normalized[index + 1])
      ) {
        index++
      }
      if (normalized[index + 1] === '{') {
        const arg = readBraced(normalized, index + 1)
        if (arg != null) index = arg.end - 1
      }
    }
  }
  while (aligns.length < fallbackColumns) aligns.push('center')
  return { aligns, vlines: [...new Set(vlines)] }
}

function parseTblrOptions(options: string): {
  colspec: string
  hlines: boolean
  vlines: boolean
} {
  const colspecMatch = options.match(/colspec\s*=\s*\{([^}]*)\}/)
  return {
    colspec: colspecMatch?.[1] ?? '',
    hlines: /(?:^|,)\s*hlines\s*(?:,|$)/.test(options),
    vlines: /(?:^|,)\s*vlines\s*(?:,|$)/.test(options),
  }
}

type ParsedTableItem = { type: 'hline' } | { type: 'row'; cells: string[] }

function parseLatexTableBody(body: string): ParsedTableItem[] {
  const items: ParsedTableItem[] = []
  let row = ''
  const pushRow = () => {
    // Le `&` d'une entité HTML (`&nbsp;`, `&amp;`, `&#160;`…) n'est pas un
    // séparateur de colonnes : `tableauColonneLigne` peut en injecter dans une
    // cellule via `sp()` (espace insécable), et sans cette protection la
    // cellule `10&nbsp;\%` était coupée en deux colonnes (`10` et `nbsp;\%`).
    const entityAmp = /&(?=(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);)/g
    const ampSentinel = String.fromCharCode(1)
    const cells = splitTopLevel(row.replace(entityAmp, ampSentinel), '&').map(
      (cell) => cell.split(ampSentinel).join('&').trim(),
    )
    if (cells.some((cell) => cell.length > 0))
      items.push({ type: 'row', cells })
    row = ''
  }

  // Un `array` imbriqué dans une cellule ne doit pas voir ses `\\`/`\hline`
  // interprétés comme des séparateurs du tableau extérieur.
  let arrayDepth = 0
  for (let index = 0; index < body.length; index++) {
    if (body.startsWith('\\begin{array}', index)) {
      arrayDepth++
      row += '\\begin{array}'
      index += '\\begin{array}'.length - 1
    } else if (body.startsWith('\\end{array}', index)) {
      arrayDepth = Math.max(0, arrayDepth - 1)
      row += '\\end{array}'
      index += '\\end{array}'.length - 1
    } else if (arrayDepth > 0) {
      row += body[index]
    } else if (body.startsWith('\\hline', index)) {
      pushRow()
      items.push({ type: 'hline' })
      index += '\\hline'.length - 1
    } else if (body.startsWith('\\cline', index)) {
      pushRow()
      items.push({ type: 'hline' })
      index += '\\cline'.length
      while (/\s/.test(body[index] ?? '')) index++
      const arg = readBraced(body, index)
      if (arg != null) index = arg.end - 1
    } else if (body.startsWith('\\tabularnewline', index)) {
      pushRow()
      index += '\\tabularnewline'.length - 1
    } else if (body.startsWith('\\\\', index)) {
      pushRow()
      index++
    } else {
      row += body[index]
    }
  }
  pushRow()
  return items
}

function stripCellLatex(cell: string): string {
  return cell
    .replace(/\\multicolumn\s*\{[^{}]*\}\s*\{[^{}]*\}\s*\{([^{}]*)\}/g, '$1')
    .replace(/\\rowcolor(?:\[[^\]]+\])?\s*\{[^{}]*\}/g, '')
    .replace(/\\cellcolor(?:\[[^\]]+\])?\s*\{[^{}]*\}/g, '')
    .replace(
      /\\(?:displaystyle|textstyle|scriptstyle|scriptscriptstyle)\b/g,
      '',
    )
    .replace(
      /\\(?:centering|arraybackslash|raggedright|raggedleft|sffamily|rmfamily|ttfamily)\b/g,
      '',
    )
    .replace(/\\rule\s*(?:\[[^\]]*\])?\s*\{[^{}]*\}\s*\{[^{}]*\}/g, '')
    .replace(/~/g, '\\;')
    .trim()
}

/**
 * Déballe une cellule entièrement enrobée par `\text{...}`, répété autant de
 * fois que nécessaire : `tableauColonneLigne` enrobe automatiquement d'un
 * `\text{}` supplémentaire tout en-tête/pied de tableau textuel (paramètre
 * `latex` à `false`) même si la valeur d'origine était déjà elle-même un
 * `\text{...}` (ex. `5I1E.ts`, en-têtes passés comme `'\\text{Scratch}'`) ;
 * un seul niveau de déballage laissait alors un `\text{Scratch}` résiduel,
 * non reconnu par `convertCellTextFormatting` et donc affiché tel quel.
 */
function unwrapWholeTextCommand(cell: string): string | null {
  let current = cell.trim()
  let unwrapped = false
  for (;;) {
    if (!current.startsWith('\\text')) break
    let cursor = '\\text'.length
    while (/\s/.test(current[cursor] ?? '')) cursor++
    const arg = readBraced(current, cursor)
    if (arg == null || arg.end !== current.length) break
    current = arg.value.trim()
    unwrapped = true
  }
  return unwrapped ? current : null
}

/** Couleurs nommées CSS/LaTeX absentes de Typst, converties en hexadécimal */
const NAMED_COLOR_TO_HEX: Record<string, string> = {
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
  gray: '#808080',
  grey: '#808080',
  darkgray: '#a9a9a9',
  darkgrey: '#a9a9a9',
  lightblue: '#add8e6',
  lightgreen: '#90ee90',
  lightyellow: '#ffffe0',
  lightpink: '#ffb6c1',
  pink: '#ffc0cb',
  brown: '#964b00',
  violet: '#7f00ff',
  magenta: '#ff00ff',
  cyan: '#00ffff',
}

/** Couleurs nommées directement comprises par Typst */
const TYPST_NAMED_COLORS = new Set([
  'black',
  'white',
  'silver',
  'navy',
  'blue',
  'aqua',
  'teal',
  'eastern',
  'purple',
  'fuchsia',
  'maroon',
  'red',
  'orange',
  'yellow',
  'olive',
  'green',
  'lime',
])

/**
 * Convertit une couleur (CSS `rgb(...)`, hexadécimale ou nommée) en une
 * expression Typst, ou `null` si la couleur est absente/transparente.
 */
function colorToTypst(raw: string): string | null {
  const color = raw.trim().toLowerCase()
  if (color === '' || color === 'transparent' || color === 'inherit') {
    return null
  }
  const rgb = color.match(/^rgba?\(([^)]+)\)/)
  if (rgb != null) {
    const parts = rgb[1].split(',').map((part) => part.trim())
    if (parts.length >= 3) return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`
  }
  const hex = color.replace(/^#/, '')
  if (/^(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(hex)) {
    return `rgb("#${hex}")`
  }
  if (color in NAMED_COLOR_TO_HEX) return `rgb("${NAMED_COLOR_TO_HEX[color]}")`
  if (TYPST_NAMED_COLORS.has(color)) return color
  return null
}

/** Extrait `\cellcolor{...}` (ou `\cellcolor[HTML]{...}`) d'une cellule LaTeX */
function extractCellColor(cell: string): {
  color: string | null
  rest: string
} {
  const match = cell.match(/\\cellcolor(\[[^\]]+\])?\s*\{([^{}]*)\}/)
  if (match == null) return { color: null, rest: cell }
  const raw = match[1] === '[HTML]' ? `#${match[2]}` : match[2]
  return { color: colorToTypst(raw), rest: cell.replace(match[0], '') }
}

/** Cellule d'un tableau Typst : contenu déjà converti et couleur de fond */
interface TypstTableCell {
  body: string
  fill: string | null
}

/**
 * Convertit `\textbf{...}`/`\textit{...}` (imbriqués ou non) en formatage
 * Typst (`#strong[...]`/`#emph[...]`) et échappe le texte brut restant.
 * Utilisé pour le contenu d'une cellule wrappé dans `\text{...}` (ex.
 * `\text{\textbf{Sports}}`, produit par les en-têtes de `tableauColonneLigne`) :
 * sans ce traitement, la commande `\textbf` fuyait telle quelle dans le texte
 * affiché (elle n'est interprétée qu'en mode mathématique par `preprocessTex`).
 */
function convertCellTextFormatting(text: string): string {
  // Le pourcentage est protégé pour LaTeX, mais reste du texte dans la cellule.
  text = text.replace(/\\%/g, '%')
  let output = ''
  let cursor = 0
  const commandRe = /\\text(bf|it)\s*\{/g
  let match: RegExpExecArray | null
  while ((match = commandRe.exec(text)) != null) {
    output += escapeTypstText(text.slice(cursor, match.index))
    const openIndex = match.index + match[0].length - 1
    const arg = readBraced(text, openIndex)
    if (arg == null) {
      output += escapeTypstText(text.slice(match.index))
      cursor = text.length
      break
    }
    const wrapper = match[1] === 'bf' ? '#strong' : '#emph'
    output += `${wrapper}[${convertCellTextFormatting(arg.value)}]`
    cursor = arg.end
    commandRe.lastIndex = cursor
  }
  output += escapeTypstText(text.slice(cursor))
  return output
}

/**
 * Convertit le contenu texte d'une cellule `\text{...}`, en tenant compte
 * d'un éventuel bloc Scratch déjà rendu en SVG par `renderScratchBlocksToSvg`
 * (ex. la colonne « Scratch » de `tableauColonneLigne`, qui embarque le
 * balisage HTML produit par `scratchblock()` directement dans une cellule de
 * tableau LaTeX au lieu du HTML traité par `htmlToTypst`) : sans ce
 * traitement, le SVG (et son wrapper `<div class="scratchblocks">`) fuyait
 * tel quel, échappé en texte littéral illisible par `convertCellTextFormatting`.
 * Les autres balises restantes (le wrapper) sont retirées, leur contenu
 * n'ayant pas d'équivalent Typst utile hors du SVG lui-même.
 */
function convertCellTextContent(text: string, figures?: string[]): string {
  const svgRe = /<svg[\s\S]*?<\/svg>/gi
  if (!svgRe.test(text)) return convertCellTextFormatting(text)
  svgRe.lastIndex = 0
  let output = ''
  let cursor = 0
  let match: RegExpExecArray | null
  while ((match = svgRe.exec(text)) != null) {
    const before = text.slice(cursor, match.index).replace(/<\/?[^>]+>/g, '')
    output += convertCellTextFormatting(before)
    if (figures != null) {
      figures.push(svgToTypstImage(match[0], TABLE_CELL_FIGURE_MAX_WIDTH_PT))
      const figureIndex = figures.length
      const figureName = `fig-${figureIndex}`
      // mathalea-figure-block (plutôt que mathalea-fit) : la figure reçoit
      // les mêmes contrôles de zoom/alignement dans la palette de mise en
      // page que les figures mathalea2d (voir mathalea2dContainerToTypst)
      output += `#mathalea-figure-block(${figureIndex}, ${figureName}-align, ${figureName}-zoom, ${figureName})`
    } else {
      output += missingBox('figure non convertie')
    }
    cursor = svgRe.lastIndex
  }
  output += convertCellTextFormatting(
    text.slice(cursor).replace(/<\/?[^>]+>/g, ''),
  )
  return output
}

/**
 * Un contenu `\text{...}` composé d'une formule brute, non délimitée par
 * `$...$` (ex. `\text{(6 \times 2) - 7}`, cas de la colonne « Calculs avec
 * priorité » de `5I1E.ts` : `tableauColonneLigne`, en mode `latex: false`,
 * enrobe automatiquement chaque cellule texte d'un `\text{}`, y compris
 * celles qui contiennent déjà une formule). Un `\` suivi d'une commande
 * LaTeX n'a de sens qu'en mode mathématique (`\times`, `\div`, `\frac`…) ;
 * sa présence signale donc une formule plutôt que du texte à échapper
 * littéralement. Ignoré dès qu'un `\textbf`/`\textit` apparaît : un en-tête
 * mettant du texte en forme reste traité comme du texte, quitte à laisser
 * une éventuelle formule qui y serait mêlée telle quelle (cas non rencontré
 * en pratique, plus sûr qu'un faux positif sur du texte mis en forme).
 */
function looksLikeUnwrappedMath(text: string): boolean {
  if (/\\text(bf|it)\s*\{/.test(text)) return false
  return /\\[a-zA-Z]+/.test(text)
}

function latexTableCell(cell: string, figures?: string[]): TypstTableCell {
  const { color, rest } = extractCellColor(cell)
  const stripped = stripCellLatex(rest)
  if (stripped.length === 0) return { body: '', fill: color }
  // Dans les tableaux à compléter, \phantom{rrrrr} réserve une vraie zone
  // d'écriture en LaTeX. Le convertisseur mathématique le réduit à une espace.
  const writingSpace = /^\\phantom\{r{5}\}(\\%)?$/.exec(stripped)
  if (writingSpace != null) {
    return {
      body: `#box(width: 45pt, height: 14pt)[]${writingSpace[1] ? '$%$' : ''}`,
      fill: color,
    }
  }
  const textContent = unwrapWholeTextCommand(stripped)
  if (textContent != null) {
    const sizedContent = /<svg/i.test(textContent)
      ? textContent
      : stripLatexSizeCommands(textContent)
    if (!/<svg/i.test(sizedContent) && looksLikeUnwrappedMath(sizedContent)) {
      return { body: `$${latexMathToTypst(sizedContent)}$`, fill: color }
    }
    return { body: convertCellTextContent(sizedContent, figures), fill: color }
  }
  return { body: `$${latexMathToTypst(stripped)}$`, fill: color }
}

function formatTypstArray(values: string[]): string {
  if (values.length === 0) return '()'
  return `(${values.join(', ')},)`
}

function stripArrayStretchCommands(text: string): string {
  return text
    .replace(/\\def\s*\\arraystretch\s*\{[\d.]+\}/g, '')
    .replace(/\\renewcommand\s*\{\\arraystretch\}\s*\{[\d.]+\}/g, '')
    .trim()
}

interface LatexTableEnvironment {
  env: 'array' | 'tabular' | 'tabularx' | 'tblr'
  start: number
  end: number
  colspec: string
  body: string
  stretch: number
  hlines: boolean
  vlines: boolean
}

function findLatexTableEnvironment(tex: string): LatexTableEnvironment | null {
  const match = /\\begin\{(array|tabular|tabularx|tblr)\}/.exec(tex)
  if (match == null || match.index == null) return null
  const env = match[1] as LatexTableEnvironment['env']
  let cursor = match.index + match[0].length
  while (/\s/.test(tex[cursor] ?? '')) cursor++
  if (env === 'tabularx') {
    // \begin{tabularx}{largeur}{colspec} : la largeur précède la spec de colonnes
    const widthArg = readBraced(tex, cursor)
    if (widthArg == null) return null
    cursor = widthArg.end
    while (/\s/.test(tex[cursor] ?? '')) cursor++
  }
  const firstArg = readBraced(tex, cursor)
  if (firstArg == null) return null
  cursor = firstArg.end
  const bodyStart = cursor
  const bodyEnd = findMatchingEndEnvironment(tex, env, bodyStart)
  if (bodyEnd === -1) return null
  const body = tex.slice(bodyStart, bodyEnd)
  const end = bodyEnd + `\\end{${env}}`.length
  let colspec = firstArg.value
  let hlines = false
  let vlines = false
  if (env === 'tblr') {
    const options = parseTblrOptions(firstArg.value)
    colspec = options.colspec
    hlines = options.hlines
    vlines = options.vlines
  }
  const prefix = tex.slice(0, match.index)
  const stretchMatch =
    prefix.match(/\\def\s*\\arraystretch\s*\{([\d.]+)\}/) ??
    prefix.match(/\\renewcommand\s*\{\\arraystretch\}\s*\{([\d.]+)\}/)
  return {
    env,
    start: match.index,
    end,
    colspec,
    body,
    stretch: stretchMatch != null ? Number(stretchMatch[1]) : 1,
    hlines,
    vlines,
  }
}

function shouldConvertAsVisualTable(table: LatexTableEnvironment): boolean {
  if (
    table.env === 'tabular' ||
    table.env === 'tabularx' ||
    table.env === 'tblr'
  )
    return true
  return (
    table.colspec.includes('|') ||
    /\\(?:hline|cline|tabularnewline)\b/.test(table.body)
  )
}

/**
 * Rend un tableau au format Typst natif (`#table(...)`).
 * Une grille entièrement bordée (cas des tableaux MathALÉA) utilise un
 * `stroke` global ; sinon les traits sont posés un à un. L'interligne
 * (`inset.y`) reprend le `\arraystretch` LaTeX, qui n'est pas géré par
 * tex2typst.
 */
function renderTypstTable(
  aligns: ('left' | 'center' | 'right')[],
  rows: TypstTableCell[][],
  insetY: number,
  vlines: number[],
  hlineYs: number[],
  rowHeightEm?: number,
): string {
  const columns = aligns.length
  const uniform = aligns.every((align) => align === aligns[0])
  const fullBorder =
    vlines.length === columns + 1 && hlineYs.length === rows.length + 1

  const header: string[] = [
    `columns: ${columns}`,
    uniform
      ? `align: ${aligns[0] ?? 'center'} + horizon`
      : `align: ${formatTypstArray(aligns.map((align) => `${align} + horizon`))}`,
    `inset: (x: 5pt, y: ${insetY.toFixed(1)}pt)`,
    `stroke: ${fullBorder ? '0.5pt' : 'none'}`,
  ]
  // hauteur commune à toutes les lignes (la dernière taille est répétée)
  if (rowHeightEm != null) header.push(`rows: (${rowHeightEm}em,)`)

  const strokes: string[] = []
  if (!fullBorder) {
    for (const x of vlines) strokes.push(`table.vline(x: ${x}, stroke: 0.5pt)`)
    for (const y of hlineYs) strokes.push(`table.hline(y: ${y}, stroke: 0.5pt)`)
  }

  const cells = rows.map((row) =>
    Array.from({ length: columns }, (_, index) => {
      const cell = row[index] ?? { body: '', fill: null }
      return cell.fill != null
        ? `table.cell(fill: ${cell.fill})[${cell.body}]`
        : `[${cell.body}]`
    }).join(', '),
  )

  const table = `#table(\n  ${[...header, ...strokes, ...cells].join(',\n  ')},\n)`
  return `#align(center)[\n${table}\n]`
}

function latexVisualTableToTypst(
  tex: string,
  figures?: string[],
): string | null {
  const table = findLatexTableEnvironment(tex)
  if (table == null || !shouldConvertAsVisualTable(table)) return null

  const items = parseLatexTableBody(table.body)
  const rows: TypstTableCell[][] = []
  const hlineYs = new Set<number>()
  for (const item of items) {
    if (item.type === 'hline') hlineYs.add(rows.length)
    else rows.push(item.cells.map((cell) => latexTableCell(cell, figures)))
  }
  const maxColumns = Math.max(0, ...rows.map((row) => row.length))
  if (maxColumns === 0) return null

  const parsedColumns = parseLatexColumnSpec(table.colspec, maxColumns)
  const aligns = parsedColumns.aligns.slice(0, maxColumns)
  while (aligns.length < maxColumns) aligns.push('center')
  const vlines = table.vlines
    ? Array.from({ length: maxColumns + 1 }, (_, index) => index)
    : [
        ...new Set(
          parsedColumns.vlines.filter(
            (line) => line >= 0 && line <= maxColumns,
          ),
        ),
      ]
  if (table.hlines && hlineYs.size === 0) {
    for (let y = 0; y <= rows.length; y++) hlineYs.add(y)
  }
  const insetY = Math.max(3, 3 * table.stretch)

  const converted = renderTypstTable(
    aligns,
    rows,
    insetY,
    vlines,
    [...hlineYs].sort((a, b) => a - b),
  )
  const before = stripArrayStretchCommands(tex.slice(0, table.start))
  const after = stripArrayStretchCommands(tex.slice(table.end))
  return [before, converted, after].filter(Boolean).join('\n')
}

/**
 * Convertit un tableau HTML MathALÉA (`table.tableauMathlive`, produit par
 * `tableauColonneLigne` et consorts) en `#table(...)` natif : chaque cellule
 * est reconvertie depuis son HTML (formules incluses) et sa couleur de fond
 * (`background-color`) est reportée.
 */
function htmlTableToTypst(
  table: HTMLTableElement,
  figures?: string[],
  qcmColumns: string = DEFAULT_QCM_COLUMNS,
): string {
  const rows: TypstTableCell[][] = []
  for (const tr of [...table.querySelectorAll('tr')]) {
    const cells = [...tr.children].filter(
      (child): child is HTMLTableCellElement =>
        child.tagName === 'TD' || child.tagName === 'TH',
    )
    if (cells.length === 0) continue
    rows.push(
      cells.map((cell) => ({
        body: htmlToTypst(
          cell.innerHTML,
          figures,
          undefined,
          undefined,
          qcmColumns,
        ),
        fill: colorToTypst(cell.style.backgroundColor ?? ''),
      })),
    )
  }
  const maxColumns = Math.max(0, ...rows.map((row) => row.length))
  if (maxColumns === 0) return missingBox('tableau non converti')

  const aligns = Array.from({ length: maxColumns }, () => 'center' as const)
  const vlines = Array.from({ length: maxColumns + 1 }, (_, index) => index)
  const hlineYs = Array.from({ length: rows.length + 1 }, (_, index) => index)
  const rowHeightEm = Number(table.getAttribute('data-hauteur-ligne'))
  return renderTypstTable(
    aligns,
    rows,
    4,
    vlines,
    hlineYs,
    rowHeightEm > 0 ? rowHeightEm : undefined,
  )
}

function latexSegmentToTypst(
  tex: string,
  display: boolean,
  figures?: string[],
): string {
  // Un `&` brut (séparateur de colonnes `array`/`tabular`/`tblr`/`tabularx`)
  // peut avoir traversé un aller-retour DOM (`template.innerHTML`, utilisé par
  // les `protect*Containers` pour repérer figures/QCM/tableaux/KaTeX) et se
  // retrouver ré-échappé en `&amp;` avant d'atteindre ce segment : aucun texte
  // LaTeX destiné à ce convertisseur ne contient légitimement `&amp;`.
  // Même chose pour `>` et `<`, ré-échappés en `&gt;`/`&lt;` : sans cela, les
  // modificateurs de colonnes `>{...}` d'un `tabularx` ne sont plus reconnus
  // et les traits verticaux du tableau disparaissent.
  tex = tex.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
  const table = latexVisualTableToTypst(tex, figures)
  if (table != null) return table
  const converted = latexMathToTypst(tex)
  if (converted.length === 0) return ''
  // Une formule en ligne ne doit jamais être coupée entre deux lignes (une
  // partie sur chacune) : c'est le préambule qui s'en charge, en mettant
  // toutes les formules en ligne dans une boîte (`MATHALEA_INLINE_FORMULA_RULE`).
  // La règle vaut ainsi aussi pour les formules du code Typst brut des
  // exercices statiques, et l'énoncé reste un `math.equation` dans l'arbre de
  // contenu — ce dont dépend l'alignement du numéro de question
  // (`MATHALEA_TASKS_HELPER`).
  return display ? `$ ${converted} $` : `$${converted}$`
}

/**
 * Convertit une formule LaTeX en mathématiques Typst.
 * En cas d'échec, la formule est renvoyée telle quelle sous forme de
 * chaîne littérale (affichée verbatim dans le document).
 */
export function latexMathToTypst(tex: string): string {
  const trimmed = tex.trim()
  if (trimmed.length === 0) return ''

  function convert(preprocessed: string): string {
    return (
      balanceTypstMathParens(
        postprocessTypst(
          tex2typst(preprocessed, { customTexMacros: CUSTOM_TEX_MACROS }),
        )
          .trim()
          .replace(/(\s*\\)+$/, ''),
      )
        // filet de sécurité : aucun marqueur #txt ne doit fuir dans la sortie
        .replaceAll(TXT_MARK_OPEN, '')
        .replaceAll(TXT_MARK_CLOSE, '')
        // espace-réponse (voir preprocessTex) : pointillés assez longs pour écrire
        .replaceAll(TRIPLE_ELLIPSIS, ANSWER_BLANK)
    )
  }

  const preprocessed = preprocessTex(trimmed)
  try {
    return convert(preprocessed)
  } catch {
    return `"${preprocessed.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
  }
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: '\u00a0',
  emsp: '\u2003',
  ensp: '\u2002',
  thinsp: '\u2009',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  times: '×',
  divide: '÷',
  deg: '°',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  euro: '€',
  minus: '−',
  ndash: '–',
  mdash: '—',
  rsquo: '’',
}

/** Décode les entités HTML usuelles (nommées et numériques) */
function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10)),
    )
    .replace(/&([a-zA-Z]+);/g, (match, name: string) =>
      name in NAMED_ENTITIES ? NAMED_ENTITIES[name] : match,
    )
}

/** Échappe les caractères spéciaux du balisage Typst dans du texte brut */
export function escapeTypstText(text: string): string {
  return text.replace(/[\\#$*_@`[\]<>~]/g, (char) => '\\' + char)
}

/** Encart affiché à la place d'un élément non convertible (image, tableau) */
function missingBox(label: string): string {
  return `#box(stroke: (dash: "dashed", paint: gray), inset: 6pt, text(fill: gray)[${label}])`
}

/**
 * Décalage vertical (en `em`) remplaçant `dominant-baseline="central"` : le
 * centre d'un texte se trouve à peu près 0,325 em au-dessus de sa ligne de
 * base (valeur calibrée sur le rendu de Libertinus par Typst).
 */
const CENTRAL_BASELINE_DY = '0.325em'

/**
 * Remplace `dominant-baseline="central"` (noms des points, étiquettes…) par un
 * `dy` équivalent. L'aperçu Typst affiche la figure comme une image SVG que
 * le navigateur met en page lui-même, avec les polices installées sur la
 * machine : `central` se calcule alors à partir des métriques de la police,
 * et sans Libertinus Math (cas de nombreux postes Linux) la police de repli
 * décale le texte jusqu'à le coller au point qu'il nomme. Le `dy` ne dépend
 * pas de la police et reste inchangé pour le PDF.
 * `kept` est la liste des attributs de la balise (modifiée sur place).
 */
function centerTextBaseline(kept: string[], seen: Set<string>): void {
  if (seen.has('dy')) return
  const index = kept.findIndex((attr) =>
    /^dominant-baseline\s*=\s*"central"$/.test(attr),
  )
  if (index === -1) return
  kept[index] = `dy="${CENTRAL_BASELINE_DY}"`
}

/**
 * Nettoie un SVG mathalea2d pour le parseur XML strict de Typst :
 * les textes des figures sont générés avec un point-virgule parasite
 * entre deux attributs (`font-family= "Book Antiqua"; font-style=...`)
 * qui fait échouer la lecture de l'image.
 */
export function sanitizeSvg(svg: string): string {
  const cleaned = svg
    // Attributs d'accessibilité d'une figure mathalea2d : la description ne sert
    // qu'à l'écran et ne doit pas changer le code Typst. Le motif tient compte
    // des guillemets, car un texte resérialisé par le DOM peut contenir `>`.
    .replace(/<svg\b(?:[^>"]|"[^"]*")*>/i, (balise) =>
      /\sclass="[^"]*\bmathalea2d\b/.test(balise)
        ? balise.replace(/\s(?:role|aria-label|aria-hidden)="[^"]*"/g, '')
        : balise,
    )
    .replace(/<(text|foreignObject) aria-hidden="true"/g, '<$1')
    // Animations SMIL et compteurs associés : inutiles sur une page imprimée
    // (et figés sur leur état initial, ils donneraient un dessin trompeur).
    .replace(/<(animate\w*|set)\b[^>]*?(?:\/>|>[\s\S]*?<\/\1\s*>)/gi, '')
    .replace(
      /<text\b[^>]*\bclass="compteurDeTours"[^>]*>[\s\S]*?<\/text>/gi,
      '',
    )
    // attribut parasite tel que sérialisé par le DOM (`;=""`)
    .replace(/\s;=""/g, '')
    // point-virgule orphelin après la valeur d'un attribut
    .replace(/=\s*("[^"]*")\s*;/g, '=$1 ')
    // entités HTML indéfinies en XML
    .replace(/&nbsp;/g, '&#160;')
    // esperluettes nues
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/\s+/g, ' ')
    // `currentColor` (fill/stroke/color, en attribut ou en style) hérite de
    // la couleur du texte ambiant dans le navigateur ; une fois le SVG extrait
    // et embarqué seul dans le PDF Typst, plus aucun ancêtre ne le résout et
    // le tracé devient invisible. On le remplace par du noir, la couleur du
    // document imprimé.
    .replace(/currentColor/g, 'black')
    // Le SVG mathalea2d est sérialisé sans `xmlns` (inutile en HTML, où le
    // contexte suffit à déterminer l'espace de noms). Une fois embarqué en
    // image autonome (`data:image/svg+xml` dans le PDF Typst), son absence
    // fait échouer le décodage : l'image ne s'affiche pas du tout.
    .replace(
      /<svg(?![\w-])(?![^>]*\bxmlns=)/i,
      '<svg xmlns="http://www.w3.org/2000/svg"',
    )
  return cleaned.replace(
    /<([a-zA-Z][\w:.-]*)([^<>]*)>/g,
    (_tag, name: string, attrs: string) => {
      const selfClosing = /\/\s*$/.test(attrs)
      const attrText = selfClosing ? attrs.replace(/\/\s*$/, '') : attrs
      const seen = new Set<string>()
      const parsed = [...attrText.matchAll(/\s+([:\w.-]+)(?:\s*=\s*"[^"]*")?/g)]
      const kept: string[] = []
      for (let index = parsed.length - 1; index >= 0; index--) {
        const attr = parsed[index]
        const attrName = attr[1]
        if (seen.has(attrName)) continue
        seen.add(attrName)
        kept.unshift(attr[0].trim())
      }
      if (name === 'text') centerTextBaseline(kept, seen)
      return `<${name}${kept.length > 0 ? ' ' + kept.join(' ') : ''}${selfClosing ? '/>' : '>'}`
    },
  )
}

/** Lettre latine convertie en lettre italique mathématique (Unicode, `𝐴`, `𝑎`…) */
function toMathItalicLetter(char: string): string {
  if (char === 'h') return '\u210E' // le « h » italique mathématique est le « ℎ » de Planck (trou du bloc)
  const code = char.charCodeAt(0)
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d434 + code - 65)
  if (code >= 97 && code <= 122)
    return String.fromCodePoint(0x1d44e + code - 97)
  return char
}

/** Retire les caractères qui casseraient un attribut XML dans un littéral Typst */
function safeFontFamily(family: string): string {
  return family.replace(/["\\<>&]/g, '').trim()
}

/**
 * Aligne les textes d'une figure sur les polices du document. Typst n'hérite
 * rien de la page pour un SVG embarqué : sans `font-family` ou avec une police
 * qu'il ne connaît pas (« Book Antiqua »), il rend les textes dans une police
 * de repli, différente du reste du PDF (les labels KaTeX, eux, deviennent de
 * vraies formules Typst).
 * - les noms de points `texteParPoint(..., mathOn = true)` (SVG `<text
 *   font-family="Book Antiqua" font-style="italic">`) passent dans la police
 *   mathématique, en lettres italiques mathématiques Unicode comme dans une
 *   formule Typst ;
 * - les autres `<text>` sans police propre passent dans la police du texte.
 * S'applique au code Typst d'une figure (`image(bytes("<svg…>"), …)`).
 */
export function applyDocumentFontsToFigure(
  figure: string,
  fonts: { font: string; mathFont: string },
): string {
  const mathFamily = safeFontFamily(fonts.mathFont)
  const textFamily = safeFontFamily(fonts.font)
  return figure.replace(
    /<text\b([^>]*)>([^<]*)<\/text>/g,
    (text, attrs: string, content: string) => {
      if (/\sfont-family=\s*\\?"Book Antiqua\\?"/.test(attrs)) {
        if (mathFamily === '') return text
        const rest = attrs
          .replace(/\sfont-family=\s*\\?"Book Antiqua\\?"/g, '')
          .replace(/\sfont-style=\s*\\?"italic\\?"/g, '')
          .replace(/\s+$/, '')
        const letters = content.replace(/[A-Za-z]/g, toMathItalicLetter)
        return `<text${rest} font-family=\\"${mathFamily}\\">${letters}</text>`
      }
      // police déjà fixée (attribut, style en ligne ou classe CSS du SVG)
      if (textFamily === '' || /font-family|\sclass=/.test(attrs)) return text
      return `<text${attrs.replace(/\s+$/, '')} font-family=\\"${textFamily}\\">${content}</text>`
    },
  )
}

/** Chaîne littérale Typst (`"..."`) */
function typstStringLiteral(text: string): string {
  return `"${text.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

function stripOuterBraces(text: string): string {
  let output = text.trim()
  while (output.startsWith('{')) {
    const arg = readBraced(output, 0)
    if (arg == null || arg.end !== output.length) break
    output = arg.value.trim()
  }
  return output
}

function extractLatexSizeCommand(tex: string): string | null {
  const match = new RegExp(`\\\\(${LATEX_SIZE_COMMANDS})(?![a-zA-Z])`).exec(tex)
  return match?.[1] ?? null
}

function extractLatexColor(tex: string): string | null {
  const match = /\\(?:text)?color(?:\[[^\]]+\])?\s*\{([^{}]+)\}/.exec(tex)
  return match?.[1]?.trim() ?? null
}

function unwrapTextColorCommands(text: string): string {
  let output = ''
  let index = 0
  const marker = '\\textcolor'
  while (index < text.length) {
    const start = text.indexOf(marker, index)
    if (start === -1) {
      output += text.slice(index)
      break
    }
    output += text.slice(index, start)
    let cursor = start + marker.length
    while (/\s/.test(text[cursor] ?? '')) cursor++
    if (text[cursor] === '[') {
      const close = text.indexOf(']', cursor)
      if (close === -1) {
        output += text.slice(start, cursor)
        index = cursor
        continue
      }
      cursor = close + 1
      while (/\s/.test(text[cursor] ?? '')) cursor++
    }
    const color = readBraced(text, cursor)
    if (color == null) {
      output += text.slice(start, cursor)
      index = cursor
      continue
    }
    cursor = color.end
    while (/\s/.test(text[cursor] ?? '')) cursor++
    const content = readBraced(text, cursor)
    if (content == null) {
      output += text.slice(start, cursor)
      index = cursor
      continue
    }
    output += content.value
    index = content.end
  }
  return output
}

function removeLatexColorDeclarations(text: string): string {
  return text.replace(/\\color(?:\[[^\]]+\])?\s*\{[^{}]+\}/g, '')
}

function typstColorExpression(color: string): string | null {
  const normalized = color.trim()
  const lower = normalized.toLowerCase()
  if (
    lower === '' ||
    lower === 'transparent' ||
    lower === 'inherit' ||
    /^none/.test(lower)
  )
    return null
  const hex = normalized.replace(/^#/, '')
  if (
    /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
      hex,
    )
  ) {
    return `rgb("#${hex}")`
  }
  if (lower === 'grey') return 'gray'
  if (lower in NAMED_COLOR_TO_HEX) return `rgb("${NAMED_COLOR_TO_HEX[lower]}")`
  if (TYPST_NAMED_COLORS.has(lower)) return lower
  return null
}

function isDefaultBlack(color: string): boolean {
  const normalized = color.trim().toLowerCase().replace(/^#/, '')
  return (
    normalized === 'black' || normalized === '000' || normalized === '000000'
  )
}

function normalizeOverlayLatex(tex: string): {
  tex: string
  color: string | null
  size: string | null
} {
  const color = extractLatexColor(tex)
  const sizeCommand = extractLatexSizeCommand(tex)
  let body = unwrapTextColorCommands(tex)
  body = removeLatexColorDeclarations(body)
  body = stripLatexSizeCommands(body)
  body = stripOuterBraces(body)
  return {
    tex: body.trim(),
    color,
    size: sizeCommand == null ? null : LATEX_SIZE_TO_TYPST_SIZE[sizeCommand],
  }
}

/**
 * Largeur maximale (en pt) d'une figure mathalea2d dans le document : ces
 * figures sont dessinées pour la pleine largeur du navigateur (souvent
 * 750 px CSS, soit 562,5 pt une fois converti) — bien plus large qu'une
 * page A4 (596 pt). Sans plafond, l'image déborde de la page (ou de la
 * colonne/liste qui la contient) et devient invisible dans l'aperçu.
 */
const MAX_FIGURE_WIDTH_PT = 380

/**
 * Plafond de largeur (pt) d'une image embarquée dans une cellule de tableau
 * (ex. un bloc Scratch de `tableauColonneLigne`, voir `convertCellTextContent`) :
 * bien plus étroit que `MAX_FIGURE_WIDTH_PT`, qui laisserait la colonne
 * `auto` de `#table` s'élargir jusqu'à la largeur pleine page.
 */
const TABLE_CELL_FIGURE_MAX_WIDTH_PT = 130

/** 1 pouce = 2,54 cm = 72 pt (conversion physique cm → pt, indépendante de tout DPI écran) */
const PT_PER_CM = 72 / 2.54

/**
 * Taille physique réelle (cm) d'une figure mathalea2d, posée par
 * `mathalea2d.ts` en attributs `data-width-cm`/`data-height-cm` sur le SVG
 * (indépendants de `pixelsParCm`/`zoom`, qui ne pilotent que la taille de
 * rendu à l'écran). Absente pour un SVG qui n'est pas une figure mathalea2d
 * (bloc Scratch, image statique...).
 */
function svgPhysicalDimensionsCm(
  svg: string,
): { widthCm: number; heightCm: number } | null {
  const width = svg.match(/<svg[^>]*?\sdata-width-cm="([\d.]+)"/i)
  if (width == null) return null
  const height = svg.match(/<svg[^>]*?\sdata-height-cm="([\d.]+)"/i)
  return {
    widthCm: parseFloat(width[1]),
    heightCm: height != null ? parseFloat(height[1]) : parseFloat(width[1]),
  }
}

/**
 * Une figure `vraieGrandeur` (voir `mathalea2d.ts`) porte `data-vraie-grandeur`
 * sur son SVG : sa taille physique ne doit être réduite par aucun plafond
 * automatique (ni `maxWidthPt` ici, ni la réduction à la largeur de colonne
 * de `mathalea-figure-block`), pour une exercice de construction/mesure où la
 * taille imprimée doit rester fidèle aux longueurs indiquées.
 */
function svgRequiresTrueSize(svg: string): boolean {
  return /<svg[^>]*?\sdata-vraie-grandeur="1"/i.test(svg)
}

/**
 * Dimensions (pt) d'une figure, mises à l'échelle pour ne pas dépasser
 * `maxWidthPt`. Pour une figure mathalea2d, part de sa taille physique
 * réelle (`data-width-cm`/`data-height-cm`) pour un rendu en vraie grandeur,
 * comme le fait déjà tikz en LaTeX à partir des mêmes coordonnées cm ; sinon
 * (SVG sans cette annotation), retombe sur la conversion CSS 96dpi
 * (`widthPx * 0.75`) faute de taille physique connue. `maxWidthPt` lui-même
 * ne s'applique pas à une figure `vraieGrandeur` (voir `svgRequiresTrueSize`).
 */
function scaledFigureDimensions(
  svg: string,
  widthPx: number,
  heightPx: number,
  maxWidthPt: number = MAX_FIGURE_WIDTH_PT,
): { widthPt: number; heightPt: number } {
  const physical = svgPhysicalDimensionsCm(svg)
  let widthPt = physical != null ? physical.widthCm * PT_PER_CM : widthPx * 0.75
  let heightPt =
    physical != null ? physical.heightCm * PT_PER_CM : heightPx * 0.75
  if (widthPt > maxWidthPt && !(physical != null && svgRequiresTrueSize(svg))) {
    const factor = maxWidthPt / widthPt
    widthPt *= factor
    heightPt *= factor
  }
  return { widthPt, heightPt }
}

/**
 * Ajoute une bordure SVG à l'intérieur des limites définies par le `viewBox`.
 *
 * La bordure CSS éventuellement présente sur l'élément `<svg>` est supprimée
 * afin d'éviter qu'elle soit tronquée lors du rendu du SVG dans Typst.
 * Un élément `<rect>` est ajouté juste après l'ouverture du `<svg>`.
 *
 * Les dimensions et la position du rectangle sont calculées automatiquement
 * à partir du `viewBox` du SVG.
 *
 * @param svg - Contenu du SVG auquel ajouter la bordure.
 * @param margin - Marge entre la bordure et les limites du `viewBox`.
 * @param strokeWidth - Épaisseur de la bordure.
 * @returns Le SVG avec une bordure interne, ou le SVG original si aucun `viewBox` valide n'est trouvé.
 */
function addSvgBorder(svg: string, margin = 1, strokeWidth = 2): string {
  const svgTag = svg.match(/<svg[^>]*>/)?.[0] || ''
  // Ne traiter que les SVG Apigeom avec leur style de bordure.
  if (
    !/\bclass=["'][^"']*\bapigeom-svg\b[^"']*["']/.test(svgTag) ||
    !/\bstyle=["'][^"']*border:\s*solid;[^"']*touch-action:\s*none[^"']*["']/.test(
      svgTag,
    )
  ) {
    return svg
  }
  const viewBoxMatch = svg.match(
    /viewBox\s*=\s*["']\s*([-\d.eE]+)\s+([-\d.eE]+)\s+([-\d.eE]+)\s+([-\d.eE]+)\s*["']/,
  )

  if (!viewBoxMatch) return svg

  const [, minX, minY, width, height] = viewBoxMatch.map(Number)

  const x = minX + margin
  const y = minY + margin
  const rectWidth = width - 2 * margin
  const rectHeight = height - 2 * margin

  const rect =
    `<rect x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}" ` +
    `fill="none" stroke="black" stroke-width="${strokeWidth}"/>`

  return svg
    .replace(/\s*style="[^"]*border:\s*solid;?[^"]*"/, '')
    .replace(/(<svg\b[^>]*>)/, `$1${rect}`)
}

/**
 * Expression Typst affichant un SVG mathalea2d embarqué dans le code
 * (le document reste autonome : il compile aussi avec le CLI typst).
 * La largeur reprend la taille physique réelle de la figure (vraie grandeur,
 * voir `scaledFigureDimensions`), plafonnée à `maxWidthPt`
 * (`MAX_FIGURE_WIDTH_PT`, largeur pleine page, par défaut).
 * Un plafond plus étroit est nécessaire pour une image embarquée dans une
 * cellule de tableau (`#table` dimensionne chaque colonne `auto` sur sa
 * largeur intrinsèque, mesurée avant tout redimensionnement à l'exécution
 * type `mathalea-fit`/`mathalea-figure-block` : sans un plafond déjà étroit
 * ici, la colonne s'élargit pour accueillir l'image à sa taille pleine page).
 */
export function svgToTypstImage(
  svg: string,
  maxWidthPt: number = MAX_FIGURE_WIDTH_PT,
): string {
  const cleaned = addSvgBorder(sanitizeSvg(svg))
  // SVG with zero width or height is rejected by Typst's parser
  const h = cleaned.match(/<svg[^>]*?\sheight="([\d.]+)"/i)
  if (h != null && parseFloat(h[1]) === 0)
    return 'box(width: 0pt, height: 0pt)[]'
  const width = cleaned.match(/<svg[^>]*?\swidth="([\d.]+)"/i)
  if (width != null && parseFloat(width[1]) === 0)
    return 'box(width: 0pt, height: 0pt)[]'
  let widthPt = ''
  if (width != null) {
    const heightPx = h != null ? parseFloat(h[1]) : parseFloat(width[1])
    const scaled = scaledFigureDimensions(
      cleaned,
      parseFloat(width[1]),
      heightPx,
      maxWidthPt,
    )
    widthPt = `, width: ${scaled.widthPt.toFixed(1)}pt`
  }
  return `image(bytes(${typstStringLiteral(cleaned)}), format: "svg"${widthPt})`
}

/**
 * Propriétés dont la valeur calculée (résolue via les règles `.sb3-*` que la
 * librairie `scratchblocks` injecte dans `<head>`) est reportée en attribut
 * `style` inline sur chaque élément d'un bloc Scratch rendu : une fois le SVG
 * extrait et embarqué seul dans le PDF Typst, il n'a plus accès à cette
 * feuille de style de la page (les blocs seraient sans couleur de catégorie).
 */
const SCRATCHBLOCKS_INLINE_PROPERTIES = [
  'fill',
  'stroke',
  'stroke-width',
  'font-family',
  'font-size',
  'font-weight',
]

function inlineScratchblocksStyles(svg: SVGElement): void {
  for (const el of [svg, ...svg.querySelectorAll('*')]) {
    if (el.getAttribute('class') == null) continue
    const computed = getComputedStyle(el)
    el.setAttribute(
      'style',
      SCRATCHBLOCKS_INLINE_PROPERTIES.map(
        (prop) => `${prop}:${computed.getPropertyValue(prop)}`,
      ).join(';'),
    )
  }
}

/** Détecte le balisage scratchblocks non encore rendu (`scratchblock()`, `createScratchSimulatorElement()`) */
const UNRENDERED_SCRATCH_MARKUP =
  /<pre\b[^>]*\bclass=["'][^"']*\bblocks2?\b|<code\b[^>]*\bclass=["'][^"']*\bb\b[^"']*["']|<scratch-simulator\b/i

/**
 * Rend en SVG les blocs Scratch encore à l'état de balisage scratchblocks
 * (`<pre class="blocks">`, produit par `scratchblock()`/
 * `createScratchSimulatorElement()` en contexte HTML). Contrairement aux
 * figures mathalea2d (déjà du SVG dans la chaîne HTML), ce balisage n'est
 * converti en SVG que par un rendu DOM de la librairie `scratchblocks`
 * (`renderScratchDiv`, utilisé par la vue prof mais jamais par la vue
 * Typst, qui ne fait que lire les chaînes produites par `nouvelleVersion()`).
 * Le rendu se fait hors-écran mais attaché au document : `renderMatching`
 * (appelé par `renderScratchDiv`) cherche ses éléments via
 * `document.querySelectorAll`, qui ignore un fragment détaché.
 */
function renderScratchBlocksToSvg(html: string): string {
  if (typeof document === 'undefined') return html
  if (!UNRENDERED_SCRATCH_MARKUP.test(html)) return html
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  document.body.appendChild(container)
  try {
    // le composant <scratch-simulator> (simulateur interactif) ajoute un
    // bouton "Exécuter" à sa connexion au DOM : on ignore son wrapper pour ne
    // garder que son contenu (le balisage scratchblocks à rendre)
    container.innerHTML = html.replace(/<\/?scratch-simulator[^>]*>/gi, '')
    renderScratchDiv(container)
    for (const svg of container.querySelectorAll<SVGElement>(
      'svg[class*="scratchblocks-style-"]',
    )) {
      inlineScratchblocksStyles(svg)
    }
    return container.innerHTML
  } finally {
    container.remove()
  }
}

function extractKatexTex(html: string): string | null {
  const annotationMatch = html.match(
    /<annotation[^>]*encoding=["']application\/x-tex["'][^>]*>([\s\S]*?)<\/annotation>/i,
  )
  if (annotationMatch != null) return decodeEntities(annotationMatch[1])
  return null
}

/**
 * Formule d'un `divLatex` pas encore rendu par KaTeX : les blancs à compléter
 * de `MetaInteractif2d` (`$\\ldots ^\\circ$`) sont posés tels quels dans le HTML.
 */
function extractRawDollarTex(html: string): string | null {
  const match = html.match(/>\s*\$([^$]+)\$\s*<\/div>\s*$/i)
  return match != null ? decodeEntities(match[1]) : null
}

function divLatexToTypstLabel(
  divHtml: string,
  scaleFactor: number,
): string | null {
  const texKatex = extractKatexTex(divHtml)
  const tex = texKatex ?? extractRawDollarTex(divHtml)
  if (tex == null) return null
  const label = normalizeOverlayLatex(tex)
  if (label.tex.length === 0) return null
  const left = divHtml.match(/\bdata-left=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
  const top = divHtml.match(/\bdata-top=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
  if (left == null || top == null) return null
  const leftPx = Number(left[1] ?? left[2] ?? left[3])
  const topPx = Number(top[1] ?? top[2] ?? top[3])
  if (!Number.isFinite(leftPx) || !Number.isFinite(topPx)) return null
  const rotate = divHtml.match(/rotate\((-?[\d.]+)deg\)/i)
  const angle = rotate != null ? Number(rotate[1]) : 0
  const options: string[] = []
  if (label.size != null && label.size !== '1em') {
    options.push(`size: ${label.size}`)
  }
  if (label.color != null && !isDefaultBlack(label.color)) {
    const color = typstColorExpression(label.color)
    if (color != null) options.push(`fill: ${color}`)
  }
  if (Number.isFinite(angle) && angle !== 0) {
    options.push(`angle: ${angle}deg`)
  }
  // fond du label (ex. les probabilités des arbres pondérés, posées par
  // `latex2d({ backgroundColor: 'white' })` pour rester lisibles par-dessus
  // les branches de l'arbre) : repris depuis le style du div KaTeX, sinon le
  // label serait transparent en Typst alors qu'il a un fond en HTML/SVG.
  const backgroundMatch = divHtml.match(/\bbackground-color:\s*([^;"']+)/i)
  if (backgroundMatch != null) {
    const background = typstColorExpression(backgroundMatch[1])
    if (background != null) options.push(`background: ${background}`)
  }
  // marge du fond (`padding` de `latex2d`, en px) : sans elle le fond colle au
  // texte et les branches de l'arbre le touchent.
  const paddingMatch = divHtml.match(/\bpadding:\s*([\d.]+)px/i)
  if (backgroundMatch != null && paddingMatch != null) {
    const outset = Number(paddingMatch[1]) * 0.75 * scaleFactor
    if (Number.isFinite(outset)) options.push(`outset: ${outset.toFixed(1)}pt`)
  }
  const args = [
    `${(leftPx * 0.75 * scaleFactor).toFixed(1)}pt`,
    `${(topPx * 0.75 * scaleFactor).toFixed(1)}pt`,
    // blanc posé sur une figure : deux fois moins large que dans le texte, pour
    // ne pas masquer le tracé
    `[$${
      texKatex == null
        ? latexMathToTypst(label.tex).replaceAll(
            ANSWER_BLANK,
            ANSWER_BLANK.replace('5em', '2.5em'),
          )
        : latexMathToTypst(label.tex)
    }$]`,
    ...options,
  ]
  return `mathalea-label(${args.join(', ')})`
}

function mathalea2dContainerToTypst(
  html: string,
  figures?: string[],
  maxWidthPt: number = MAX_FIGURE_WIDTH_PT,
): string | null {
  if (!/\bsvgContainer\b/.test(html)) return null
  const svgMatch = html.match(/<svg\b[\s\S]*?<\/svg>/i)
  if (svgMatch == null) return null
  if (figures == null) return missingBox('figure non convertie')
  figures.push(svgToTypstImage(svgMatch[0], maxWidthPt))
  const figureIndex = figures.length
  const figureName = `fig-${figureIndex}`
  const zoomVar = `${figureName}-zoom`
  const alignVar = `${figureName}-align`
  const width = svgMatch[0].match(/<svg[^>]*?\swidth="([\d.]+)"/i)
  const height = svgMatch[0].match(/<svg[^>]*?\sheight="([\d.]+)"/i)
  const widthPx = width != null ? parseFloat(width[1]) : 213.3
  const heightPx = height != null ? parseFloat(height[1]) : 120
  const scaled = scaledFigureDimensions(
    svgMatch[0],
    widthPx,
    heightPx,
    maxWidthPt,
  )
  const forceTrueSize = svgRequiresTrueSize(svgMatch[0])
  // les positions des labels sont en pixels de la figure d'origine : le
  // même facteur d'échelle que l'image doit leur être appliqué, sinon ils
  // se retrouvent mal placés une fois la figure plafonnée à MAX_FIGURE_WIDTH_PT
  const scaleFactor = scaled.widthPt / (widthPx * 0.75)
  const widthPt = scaled.widthPt.toFixed(1)
  const heightPt = scaled.heightPt.toFixed(1)
  const labels = [
    ...html.matchAll(
      /<div\b[^>]*\bclass=["'][^"']*\bdivLatex\b[^"']*["'][\s\S]*?<\/div>/gi,
    ),
  ]
    .map((match) => divLatexToTypstLabel(match[0], scaleFactor))
    .filter((label): label is string => label != null)
  const body =
    labels.length === 0
      ? figureName
      : [
          `mathalea-figure(${widthPt}pt, ${heightPt}pt, ${figureName}, labels: (`,
          ...labels.map((label) => `  ${label},`),
          '))',
        ].join('\n')
  // mathalea-figure-block réduit la figure si elle dépasse la largeur
  // disponible, applique le zoom choisi par le professeur, l'aligne et place
  // le repère invisible de la palette de mise en page au coin haut-droit de
  // son rendu final — sauf si `vraieGrandeur` (voir mathalea2d.ts) impose la
  // taille physique réelle quel que soit le nombre de colonnes
  // la boîte de `mathalea-figure` a pour largeur celle de la figure : la
  // passer évite à `mathalea-figure-block` de la mesurer (voir
  // `MATHALEA_FIGURE_BLOCK_HELPER`)
  const options = [
    ...(forceTrueSize ? ['force-true-size: true'] : []),
    ...(labels.length > 0 ? [`natural-width: ${widthPt}pt`] : []),
  ]
  return [
    `#mathalea-figure-block(${figureIndex}, ${alignVar}, ${zoomVar},`,
    body,
    options.length > 0 ? `, ${options.join(', ')})` : ')',
  ].join('\n')
}

function protectMathalea2dContainers(
  html: string,
  protect: (typst: string) => string,
  figures?: string[],
  maxWidthPt: number = MAX_FIGURE_WIDTH_PT,
): string {
  if (typeof document !== 'undefined') {
    const template = document.createElement('template')
    template.innerHTML = html
    const containers = [
      ...template.content.querySelectorAll<HTMLElement>('.svgContainer'),
    ]
    if (containers.length > 0) {
      for (const container of containers) {
        const typst = mathalea2dContainerToTypst(
          container.outerHTML,
          figures,
          maxWidthPt,
        )
        if (typst != null) {
          // ligne vide après la figure : le texte qui suit reprend dans
          // un nouveau paragraphe du code généré (l'espacement fait partie
          // du segment protégé pour survivre à la normalisation des blancs)
          container.replaceWith(
            document.createTextNode(protect(typst + '\n\n')),
          )
        }
      }
      // `template.innerHTML` (sérialisation DOM complète) ré-échappe les `&`
      // bruts présents ailleurs dans le texte (ex. tableau LaTeX
      // `\begin{tabularx}...&...&...\end{tabularx}` protégé plus loin par
      // `latexSegmentToTypst`) en `&amp;` : c'est `latexSegmentToTypst` qui
      // les décode avant conversion, plutôt que de contourner cette
      // sérialisation ici (peu fiable pour les conteneurs complexes/imbriqués).
      return template.innerHTML
    }
  }
  return html.replace(
    /<div\b[^>]*\bclass=["'][^"']*\bsvgContainer\b[^"']*["'][\s\S]*?<\/div>\s*<\/div>/gi,
    (container) =>
      protect(
        (mathalea2dContainerToTypst(container, figures, maxWidthPt) ??
          container) + '\n\n',
      ),
  )
}

/**
 * Convertit le SVG autonome d'une figure apigeom (voir `apigeomFigureToSvg`,
 * `src/lib/apigeom/apigeom-figure.ts` — texte déjà intégré en noeuds `<text>`,
 * contrairement à mathalea2d qui pose ses labels en `<div>` séparés) en
 * `#mathalea-figure-block(...)`, comme `mathalea2dContainerToTypst` : réduit
 * la figure si elle dépasse la largeur disponible, applique le zoom choisi
 * par le professeur et l'alignement, et place le repère invisible de la
 * palette de mise en page (mêmes contrôles que pour les figures mathalea2d).
 */
function apigeomSvgToTypst(
  svgHtml: string,
  figures?: string[],
  maxWidthPt: number = MAX_FIGURE_WIDTH_PT,
): string | null {
  if (figures == null) return missingBox('figure non convertie')
  figures.push(svgToTypstImage(svgHtml, maxWidthPt))
  const figureIndex = figures.length
  const figureName = `fig-${figureIndex}`
  return [
    `#mathalea-figure-block(${figureIndex}, ${figureName}-align, ${figureName}-zoom,`,
    figureName,
    ')',
  ].join('\n')
}

function protectApigeomSvgContainers(
  html: string,
  protect: (typst: string) => string,
  figures?: string[],
  maxWidthPt: number = MAX_FIGURE_WIDTH_PT,
): string {
  return html.replace(
    /<svg\b[^>]*\bclass="[^"]*\bapigeom-svg\b[^"]*"[^>]*>[\s\S]*?<\/svg>/gi,
    (svg) =>
      protect((apigeomSvgToTypst(svg, figures, maxWidthPt) ?? svg) + '\n\n'),
  )
}

/**
 * Colonnes des propositions de QCM par défaut : la variable Typst globale des
 * vues qui n'ont pas de réglage par exercice (Flash-cards, Diaporama PDF,
 * lecture optique), déclarée dans leur préambule.
 */
export const DEFAULT_QCM_COLUMNS = 'qcm-colonnes'

/**
 * Valeur de `qcmColumns` demandant de choisir le nombre de colonnes d'après le
 * contenu des propositions (voir `qcmHasFigure`). Ce n'est pas une
 * expression Typst : elle est toujours remplacée avant d'atteindre le code.
 */
export const QCM_COLUMNS_FROM_CONTENT = '\u0000qcm-auto'

/**
 * Marqueur posé sur le `#tasks(...)` d'un QCM dont au moins une proposition
 * est une figure, relu par `buildTypstDocument` pour choisir la valeur par
 * défaut de la variable `exN-qcm-colonnes` déclarée dans le préambule.
 */
export const QCM_FIGURES_MARKER = '// mathalea:qcm-figures'

/**
 * Préfixe du marqueur posé sur le `#tasks(...)` d'un QCM dont l'exercice a
 * demandé un nombre de colonnes par défaut (`typstColumns` de
 * `propositionsQcm`, relayé par `data-typst-colonnes`) : `// mathalea:qcm-colonnes(2)`.
 * Il l'emporte sur le défaut tiré du contenu (`qcmHasFigure`).
 */
export const QCM_COLUMNS_MARKER = '// mathalea:qcm-colonnes'

/**
 * Une proposition qui est une figure passe par `mathalea-fit` /
 * `mathalea-figure-block`, qui la **réduisent** pour tenir dans la largeur
 * disponible quelle qu'elle soit. `auto-fit` de taskize, qui compare la
 * largeur naturelle de chaque item à celle d'une colonne, n'a donc rien à
 * mesurer : il choisit le maximum de colonnes et rend les figures minuscules.
 * On leur donne une colonne, la seule largeur qui les garde lisibles ; les
 * propositions textuelles, elles, sont bien mesurées et gardent `auto-fit`.
 */
function qcmHasFigure(choices: { body: string }[]): boolean {
  return choices.some((choice) =>
    /#mathalea-(?:figure-block|fit)\(/.test(choice.body),
  )
}

/**
 * Convertit un groupe de propositions de QCM en un bloc `#tasks(...)`
 * (paquet taskize). Chaque item porte son propre marqueur — une case à
 * cocher (`qcm-case`) ou une lettre en boîte (`qcm-lettre`), voir
 * `MATHALEA_QCM_HELPERS` — plutôt que l'étiquetage automatique de `tasks`
 * (`label:`), identique pour tous les items et donc incapable de distinguer
 * la bonne réponse dans le corrigé. Le texte de la bonne réponse reste en
 * plus mis en évidence par `qcm-bonne`.
 *
 * `qcmColumns` est inséré tel quel dans `columns:` : la fiche Typst y passe la
 * variable de l'exercice (`ex2-qcm-colonnes`), réglable depuis la palette de
 * mise en page, ou directement une valeur littérale (`"auto-fit"`, `3`) en
 * mode export, où ces variables de plomberie n'ont pas de sens.
 */
function qcmToTypst(
  choices: { correct: boolean; body: string }[],
  qcmColumns: string,
  format: 'case' | 'lettre',
  requestedColumns?: number,
): string {
  const items = choices
    .map((choice, index) => {
      const marker =
        format === 'case'
          ? `#qcm-case(${choice.correct})`
          : `#qcm-lettre("${lettreDepuisChiffre(index + 1)}", ${choice.correct})`
      const body = choice.correct ? `#qcm-bonne[${choice.body}]` : choice.body
      return `  + ${marker} ${body}`
    })
    .join('\n')
  const withFigure = qcmHasFigure(choices)
  const columns =
    qcmColumns === QCM_COLUMNS_FROM_CONTENT
      ? requestedColumns != null
        ? String(requestedColumns)
        : withFigure
          ? '1'
          : '"auto-fit"'
      : qcmColumns
  // le marqueur ne sert qu'aux variables de la palette : le mode export écrit
  // déjà la valeur choisie ci-dessus
  const isPaletteVariable = qcmColumns.endsWith('-qcm-colonnes')
  const figuresMarker = !isPaletteVariable
    ? ''
    : requestedColumns != null
      ? ` ${QCM_COLUMNS_MARKER}(${requestedColumns})`
      : withFigure
        ? ` ${QCM_FIGURES_MARKER}`
        : ''
  return `#tasks(columns: ${columns}, label: none, above: 0.4em, below: 0.4em, equilibre: true)[${figuresMarker}\n${items}\n]`
}

/**
 * Rendu SVG d'une figure `<canvas-3d>` (empilements de cubes des exercices
 * de motifs). L'élément est un canvas WebGL (Three.js), sans image
 * extractible : on redessine les cubes décrits par son attribut `content`
 * en projection isométrique (la caméra de Canvas3DElement regarde l'origine
 * depuis la diagonale (8, 8, 8)), faces triées de l'arrière vers l'avant.
 * Renvoie `null` si le contenu n'est pas un empilement de cubes.
 */
function canvas3dToSvg(tag: string): string | null {
  const content = tag.match(/content=(?:'([^']*)'|"([^"]*)")/)
  if (content == null) return null
  let cubes: { pos: number[]; size: number; color: string }[]
  try {
    const parsed = JSON.parse(decodeURIComponent(content[1] ?? content[2]))
    const objects: unknown[] = Array.isArray(parsed?.objects)
      ? parsed.objects
      : []
    cubes = objects
      .filter(
        (
          object,
        ): object is {
          type: string
          pos: number[]
          size?: unknown
          color?: unknown
        } =>
          object != null &&
          typeof object === 'object' &&
          (object as { type?: unknown }).type === 'cube' &&
          Array.isArray((object as { pos?: unknown }).pos),
      )
      .map((cube) => ({
        pos: cube.pos,
        size: typeof cube.size === 'number' ? cube.size : 1,
        color: typeof cube.color === 'string' ? cube.color : '#ffffff',
      }))
  } catch {
    return null
  }
  if (cubes.length === 0) return null
  // projection orthographique le long de la diagonale (axes y vers le haut)
  const UNIT = 24
  const project = ([x, y, z]: number[]): [number, number] => [
    (x - z) * 0.70710678 * UNIT,
    -(-x + 2 * y - z) * 0.40824829 * UNIT,
  ]
  /** Assombrit une couleur hexadécimale (faces latérales) */
  const shade = (hex: string, factor: number): string => {
    const value = hex.replace('#', '')
    if (!/^[0-9a-fA-F]{6}$/.test(value)) return hex
    const channels = [0, 2, 4].map((index) =>
      Math.round(parseInt(value.slice(index, index + 2), 16) * factor),
    )
    return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`
  }
  interface Face {
    points: [number, number][]
    fill: string
  }
  const faces: Face[] = []
  // cubes triés de l'arrière (x+y+z petit) vers l'avant
  for (const cube of [...cubes].sort(
    (a, b) => a.pos[0] + a.pos[1] + a.pos[2] - (b.pos[0] + b.pos[1] + b.pos[2]),
  )) {
    const [x, y, z] = cube.pos
    const s = cube.size / 2
    const corners: Record<string, number[]> = {}
    for (const dx of [-s, s]) {
      for (const dy of [-s, s]) {
        for (const dz of [-s, s]) {
          corners[
            `${dx > 0 ? '+' : '-'}${dy > 0 ? '+' : '-'}${dz > 0 ? '+' : '-'}`
          ] = [x + dx, y + dy, z + dz]
        }
      }
    }
    // seules les trois faces tournées vers la caméra sont visibles
    const visible: { keys: string[]; factor: number }[] = [
      { keys: ['-+-', '++-', '+++', '-++'], factor: 1 }, // dessus (+y)
      { keys: ['--+', '+-+', '+++', '-++'], factor: 0.87 }, // face +z
      { keys: ['+--', '++-', '+++', '+-+'], factor: 0.72 }, // face +x
    ]
    for (const face of visible) {
      faces.push({
        points: face.keys.map((key) => project(corners[key])),
        fill: shade(cube.color, face.factor),
      })
    }
  }
  const xs = faces.flatMap((face) => face.points.map((point) => point[0]))
  const ys = faces.flatMap((face) => face.points.map((point) => point[1]))
  const pad = 2
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  const width = Math.max(...xs) + pad - minX
  const height = Math.max(...ys) + pad - minY
  const polygons = faces.map(
    (face) =>
      `<polygon points="${face.points
        .map(
          ([px, py]) => `${(px - minX).toFixed(1)},${(py - minY).toFixed(1)}`,
        )
        .join(
          ' ',
        )}" fill="${face.fill}" stroke="black" stroke-width="1" stroke-linejoin="round"/>`,
  )
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(1)}" height="${height.toFixed(1)}" viewBox="0 0 ${width.toFixed(1)} ${height.toFixed(1)}">${polygons.join('')}</svg>`
}

/** Valeur d'une propriété dans un style CSS en ligne */
function inlineStyleProp(style: string, name: string): string | null {
  const match = new RegExp(`(?:^|[;\\s])${name}\\s*:\\s*([^;]+)`).exec(style)
  return match?.[1]?.trim() ?? null
}

/** Contenu d'une cellule de schéma : HTML converti, replié sur une ligne */
function schemaCellContent(html: string): string {
  return htmlToTypst(html)
    .replace(/\s*\n+\s*/g, ' ')
    .trim()
}

/**
 * Bordure Typst d'une boîte de schéma : les barres partagent leurs bordures
 * en HTML (`border-left: none` sur les boîtes suivantes), on reproduit les
 * côtés omis pour ne pas doubler les traits.
 */
function schemaCellStroke(style: string): string {
  if (/(?:^|[;\s])border\s*:\s*none/.test(style)) return 'none'
  const omitted = ['left', 'right', 'top', 'bottom'].filter((side) =>
    new RegExp(`border-${side}\\s*:\\s*none`).test(style),
  )
  if (omitted.length === 0) return '0.6pt + black'
  return `(${omitted.map((side) => `${side}: none`).join(', ')}, rest: 0.6pt + black)`
}

/**
 * Convertit un schéma en barres (`SchemaEnBoite`, HTML en grille CSS) en une
 * grille Typst : boîtes (`SchemaItem`) reproduites par des cellules avec
 * fond et bordure, accolades et flèches (`SchemaTop`/`SchemaBottom`) par le
 * helper `mathalea-schema-span` (accolade/flèche étirée sur la largeur).
 * Les accolades latérales (`latexAccoladeRight`, rares) ne sont pas rendues.
 */
function schemaEnBoiteToTypst(container: HTMLElement): string {
  interface SchemaCell {
    row: number
    colStart: number
    colEnd: number
    body: (y: number, x: number, colspan: number) => string
  }
  const cells: SchemaCell[] = []
  for (const element of [...container.children] as HTMLElement[]) {
    const className = element.getAttribute('class') ?? ''
    if (/\blatexAccoladeRight\b/.test(className)) continue
    const style = element.getAttribute('style') ?? ''
    const row = parseInt(inlineStyleProp(style, 'grid-row') ?? '', 10)
    const colStart = parseInt(
      inlineStyleProp(style, 'grid-column-start') ?? '',
      10,
    )
    const colEnd = parseInt(inlineStyleProp(style, 'grid-column-end') ?? '', 10)
    if ([row, colStart, colEnd].some(Number.isNaN) || colEnd <= colStart) {
      continue
    }
    if (/\bSchemaTop\b|\bSchemaBottom\b/.test(className)) {
      const flip = /\bSchemaBottom\b/.test(className)
      // le type flèche se reconnaît à sa couleur `--arrow-color` (l'accolade
      // note la sienne hors de l'attribut style, guillemet mal placé)
      const arrow = element.outerHTML.includes('--arrow-color')
      const labelElement = element.querySelector<HTMLElement>(
        '.latexAccoladeTop, .latexAccoladeBottom',
      )
      const label = schemaCellContent(labelElement?.innerHTML ?? '')
      const color = colorToTypst(
        inlineStyleProp(labelElement?.getAttribute('style') ?? '', 'color') ??
          '',
      )
      const options = [
        arrow ? 'kind: "arrow"' : null,
        flip ? 'flip: true' : null,
        color != null && color !== 'black' ? `color: ${color}` : null,
      ].filter((option): option is string => option != null)
      const optionsCode = options.length > 0 ? `, ${options.join(', ')}` : ''
      cells.push({
        row,
        colStart,
        colEnd,
        body: (y, x, colspan) =>
          `grid.cell(x: ${x}, y: ${y}, colspan: ${colspan}, mathalea-schema-span([${label}]${optionsCode}))`,
      })
      continue
    }
    if (!/\bSchemaItem\b/.test(className)) continue
    const height = inlineStyleProp(style, 'height')
    let content = schemaCellContent(element.innerHTML)
    // ligne d'espacement entre deux schémas superposés
    if (content.length === 0 && height != null) {
      content = `#v(${height})`
    }
    const fill = colorToTypst(inlineStyleProp(style, 'background-color') ?? '')
    const stroke = schemaCellStroke(style)
    const bold = inlineStyleProp(style, 'font-weight') === 'bold'
    const textColor = colorToTypst(inlineStyleProp(style, 'color') ?? '')
    if (bold) content = `#strong[${content}]`
    if (textColor != null && textColor !== 'black') {
      content = `#text(fill: ${textColor})[${content}]`
    }
    const align =
      inlineStyleProp(style, 'justify-content') === 'center'
        ? 'center + horizon'
        : 'left + horizon'
    const cellOptions = [
      fill != null ? `fill: ${fill}` : null,
      `stroke: ${stroke}`,
      'inset: 4pt',
      `align: ${align}`,
    ].filter((option): option is string => option != null)
    cells.push({
      row,
      colStart,
      colEnd,
      body: (y, x, colspan) =>
        `grid.cell(x: ${x}, y: ${y}, colspan: ${colspan}, ${cellOptions.join(', ')})[${content}]`,
    })
  }
  if (cells.length === 0) return missingBox('schéma non converti')
  const totalCols = Math.max(...cells.map((cell) => cell.colEnd)) - 1
  const rowIndex = new Map(
    [...new Set(cells.map((cell) => cell.row))]
      .sort((a, b) => a - b)
      .map((row, index) => [row, index]),
  )
  const lines = cells.map(
    (cell) =>
      `  ${cell.body(
        rowIndex.get(cell.row) ?? 0,
        cell.colStart - 1,
        Math.min(cell.colEnd, totalCols + 1) - cell.colStart,
      )},`,
  )
  return [
    '#block(width: 100%, inset: (y: 2pt))[#grid(',
    `  columns: (1fr,) * ${totalCols},`,
    '  row-gutter: 2pt,',
    ...lines,
    ')]',
  ].join('\n')
}

/**
 * Deux colonnes côte à côte (`deuxColonnesResp`, `lib/format/miseEnPage.js`)
 * en `#grid` Typst.
 *
 * En HTML ces colonnes sont une grille CSS (`<div class="cols-responsive">`)
 * dont le `<style>` est retiré plus loin : sans traitement, les deux colonnes
 * se retrouveraient empilées l'une sous l'autre. Le contenu de chaque colonne
 * est reconverti récursivement (formules, figures, tableaux inclus), et les
 * figures s'adaptent d'elles-mêmes à la largeur de leur colonne
 * (`mathalea-fit` mesure l'espace disponible).
 *
 * Les largeurs reprennent le `largeur1` passé à `deuxColonnesResp` (le même
 * partage que la sortie LaTeX), publié dans le HTML par `data-largeur1` ;
 * à défaut, les colonnes sont égales comme dans la grille CSS.
 */
function protectResponsiveColumns(
  html: string,
  protect: (typst: string) => string,
  figures?: string[],
  qcmColumns: string = DEFAULT_QCM_COLUMNS,
): string {
  if (!/\bcols-responsive\b/.test(html)) return html
  if (typeof document === 'undefined') return html
  const template = document.createElement('template')
  template.innerHTML = html
  const containers = [
    ...template.content.querySelectorAll<HTMLElement>('.cols-responsive'),
  ].filter(
    // une colonne peut elle-même contenir deux colonnes : seul le conteneur
    // extérieur est traité, la conversion récursive s'occupe des autres
    (container) => container.parentElement?.closest('.cols-responsive') == null,
  )
  if (containers.length === 0) return html
  for (const container of containers) {
    const columns = [...container.children]
      .filter((child) => child.tagName !== 'STYLE')
      .map((child) =>
        htmlToTypst(child.innerHTML, figures, undefined, undefined, qcmColumns),
      )
    const filled = columns.filter((column) => column.length > 0)
    if (filled.length === 0) {
      container.replaceWith(document.createTextNode(''))
      continue
    }
    // une seule colonne remplie : pas de grille, le contenu prend la largeur
    const code =
      filled.length === 1
        ? filled[0]
        : responsiveColumnsToTypst(
            filled,
            Number(container.dataset.largeur1 ?? Number.NaN),
          )
    container.replaceWith(document.createTextNode(protect('\n' + code + '\n')))
  }
  return template.innerHTML
}

/**
 * `#grid` des colonnes de `deuxColonnesResp` : largeurs en `fr` (le partage
 * se fait sur l'espace restant une fois la gouttière posée, là où des `%`
 * déborderaient), contenus alignés sur leur haut comme en HTML.
 */
function responsiveColumnsToTypst(columns: string[], largeur1: number): string {
  const widths =
    columns.length === 2 &&
    Number.isFinite(largeur1) &&
    largeur1 > 0 &&
    largeur1 < 100
      ? [largeur1, 100 - largeur1]
      : columns.map(() => 1)
  return [
    `#grid(`,
    `  columns: (${widths.map((width) => `${width}fr`).join(', ')}),`,
    '  column-gutter: 1em,',
    '  align: top + left,',
    ...columns.map((column) => `  [${column}],`),
    ')',
  ].join('\n')
}

/**
 * Repère les schémas en barres (`<div class="SchemaContainer">`) et les
 * convertit avant le reste du HTML (leur contenu interne serait sinon
 * aplati en texte).
 */
function protectSchemaContainers(
  html: string,
  protect: (typst: string) => string,
): string {
  if (!/\bSchemaContainer\b/.test(html)) return html
  if (typeof document === 'undefined') {
    // sans DOM : encart plutôt que du texte aplati illisible
    return html.replace(
      /<div\b[^>]*\bclass=["'][^"']*\bSchemaContainer\b[\s\S]*$/i,
      () => protect(missingBox('schéma non converti') + '\n\n'),
    )
  }
  const template = document.createElement('template')
  template.innerHTML = html
  const containers = [
    ...template.content.querySelectorAll<HTMLElement>('.SchemaContainer'),
  ]
  if (containers.length === 0) return html
  for (const container of containers) {
    container.replaceWith(
      document.createTextNode(
        protect(schemaEnBoiteToTypst(container) + '\n\n'),
      ),
    )
  }
  return template.innerHTML
}

/**
 * Une proposition est « correcte » (dans un corrigé) si sa case est cochée
 * (format `case`) ou si sa lettre est colorée (format `lettre`, la mauvaise
 * réponse étant barrée).
 */
function qcmChoiceIsCorrect(choice: Element): boolean {
  // `input[type="radio"]` : QCU (`propositionsQcm(..., { radio: true })`),
  // sans quoi la bonne réponse d'un QCU en format `case` n'était jamais
  // détectée (seules les cases à cocher, jamais les boutons radio, l'étaient).
  const checkbox = choice.querySelector<HTMLInputElement>(
    'input[type="checkbox"], input[type="radio"]',
  )
  if (checkbox != null) return checkbox.checked
  return choice.querySelector('label:not([id]) span[style*="color"]') != null
}

/**
 * Format des propositions d'un groupe de QCM : `case` (une case à cocher,
 * éventuellement un bouton radio pour un QCU) ou `lettre` (une lettre en
 * boîte, sans case). Devine le format depuis le HTML produit par
 * `propositionsQcm()` (`qcm.ts:196-235`) : seul le format `case` insère un
 * `<input>` dans chaque choix.
 */
function qcmChoiceFormat(choice: Element): 'case' | 'lettre' {
  return choice.querySelector('input') != null ? 'case' : 'lettre'
}

/**
 * Détecte les propositions de QCM produites par `propositionsQcm` : chaque
 * proposition porte un libellé `<label id="labelEx{N}Q{i}R{rep}">` (présent
 * quel que soit le format, `case` ou `lettre`). Une proposition est un `<div>`
 * (`propositionsQcm`) ou un `<span class="ex0">` (QCM statique d'un
 * `multi-mathfield`, `staticQcm`). Les propositions d'un même conteneur sont
 * regroupées dans un `#tasks(...)`. Traité avant les formules :
 * les libellés sont reconvertis récursivement par `htmlToTypst`.
 */
function protectQcm(
  html: string,
  protect: (typst: string) => string,
  figures?: string[],
  qcmColumns: string = DEFAULT_QCM_COLUMNS,
): string {
  if (typeof document === 'undefined') return html
  const template = document.createElement('template')
  template.innerHTML = html
  const labels = [
    ...template.content.querySelectorAll<HTMLLabelElement>('label[id]'),
  ].filter((label) => /^labelEx\d+Q\d+R\d+$/.test(label.id))
  if (labels.length === 0) return html

  const groups = new Map<Element, { correct: boolean; body: string }[]>()
  const requested = new Map<Element, number>()
  const alignments = new Map<Element, string>()
  const formats = new Map<Element, 'case' | 'lettre'>()
  const order: Element[] = []
  for (const label of labels) {
    const choice = label.closest('div, span.ex0')
    const container = choice?.parentElement
    if (choice == null || container == null) continue
    const alignment = container.getAttribute('data-typst-align')
    const converted = htmlToTypst(
      label.innerHTML,
      figures,
      undefined,
      undefined,
      qcmColumns,
    )
    // l'alignement demandé par l'exercice voyage dans l'appel de chaque
    // figure (`default-align`), d'où `figureDefaultAligns` le relit
    const body =
      alignment != null && /^(left|center|right)$/.test(alignment)
        ? converted.replace(
            /(#mathalea-figure-block\(\d+, fig-\d+-align, fig-\d+-zoom,)/g,
            `$1 default-align: ${alignment},`,
          )
        : converted
    if (body.length === 0) continue
    if (!groups.has(container)) {
      groups.set(container, [])
      formats.set(container, qcmChoiceFormat(choice))
      const columns = Number(container.getAttribute('data-typst-colonnes'))
      if (Number.isInteger(columns) && columns >= 1) {
        requested.set(container, columns)
      }
      order.push(container)
    }
    groups.get(container)!.push({ correct: qcmChoiceIsCorrect(choice), body })
  }
  if (order.length === 0) return html
  for (const container of order) {
    // les `<br>` qui séparent l'énoncé des propositions (`buildQcmForExercise`
    // en pose deux pour aérer la page web) laisseraient une ou deux lignes
    // vides au-dessus du bloc, qui a déjà son propre espacement (`above:`)
    let previous = container.previousSibling
    while (
      previous != null &&
      (previous.nodeName === 'BR' ||
        (previous.nodeType === Node.TEXT_NODE &&
          (previous.textContent ?? '').trim() === ''))
    ) {
      const toRemove = previous
      previous = previous.previousSibling
      toRemove.remove()
    }
    // le bloc #tasks(...) commence et finit sur sa propre ligne dans le
    // code généré (l'espacement fait partie du segment protégé pour
    // survivre à la normalisation des blancs)
    container.replaceWith(
      document.createTextNode(
        protect(
          '\n' +
            qcmToTypst(
              groups.get(container)!,
              qcmColumns,
              formats.get(container)!,
              requested.get(container),
            ) +
            '\n',
        ),
      ),
    )
  }
  return template.innerHTML
}

/**
 * Convertit les tableaux HTML en Typst avant tout autre traitement (leurs
 * cellules contiennent des formules et éventuellement des figures, reconverties
 * récursivement par `htmlToTypst`).
 */
function protectHtmlTables(
  html: string,
  protect: (typst: string) => string,
  figures?: string[],
  qcmColumns: string = DEFAULT_QCM_COLUMNS,
): string {
  if (typeof document === 'undefined') {
    return html.replace(/<table[\s\S]*?<\/table>/gi, () =>
      protect(missingBox('tableau non converti')),
    )
  }
  const template = document.createElement('template')
  template.innerHTML = html
  const tables = [...template.content.querySelectorAll('table')]
  if (tables.length === 0) return html
  for (const table of tables) {
    table.replaceWith(
      document.createTextNode(
        protect(htmlTableToTypst(table, figures, qcmColumns)),
      ),
    )
  }
  return template.innerHTML
}

function protectKatexSpans(
  html: string,
  protect: (typst: string) => string,
): string {
  if (typeof document !== 'undefined') {
    const template = document.createElement('template')
    template.innerHTML = html
    const spans = [...template.content.querySelectorAll<HTMLElement>('.katex')]
    if (spans.length > 0) {
      for (const span of spans) {
        const tex = extractKatexTex(span.outerHTML)
        if (tex != null) {
          span.replaceWith(
            document.createTextNode(protect(latexSegmentToTypst(tex, false))),
          )
        }
      }
      return template.innerHTML
    }
  }
  return html.replace(
    /<span\b[^>]*\bclass=["'][^"']*\bkatex\b[^"']*["'][\s\S]*?<\/span>/gi,
    (span) => {
      const tex = extractKatexTex(span)
      return tex == null ? span : protect(latexSegmentToTypst(tex, false))
    },
  )
}

/**
 * Convertit un contenu HTML d'exercice MathALÉA en balisage Typst.
 *
 * Si un collecteur `figures` est fourni, chaque figure SVG est convertie
 * en une expression `image(...)` ajoutée au collecteur et référencée dans
 * le balisage par `#fig-N` (variable déclarée par buildTypstDocument).
 * Sans collecteur, la figure est remplacée par un encart.
 *
 * `zoomVariable`, fourni uniquement pour un énoncé/correction statique sans
 * source `.typ`/`_cor.typ` (image scannée seule, voir
 * `TypstExerciseInput.isStaticImage`/`isStaticCorrectionImage`), branche le
 * zoom de l'image scannée trouvée sur cette variable Typst (`exo-N-zoom` ou
 * `exo-N-corr-zoom`) plutôt que sur le zoom par défaut de `mathalea-fit`.
 */
export function htmlToTypst(
  html: string,
  figures?: string[],
  zoomVariable?: string,
  /**
   * Largeur maximale des figures (pt). Par défaut la pleine page
   * (`MAX_FIGURE_WIDTH_PT`) ; un contenu qui vit dans un espace plus étroit
   * — une cellule du tableau « Course aux nombres » — passe un plafond plus
   * serré, pour que la figure y garde des proportions raisonnables plutôt
   * que d'occuper toute la cellule.
   */
  maxFigureWidthPt: number = MAX_FIGURE_WIDTH_PT,
  /**
   * Colonnes des propositions de QCM : nom de la variable Typst de l'exercice
   * (`ex2-qcm-colonnes`, réglable depuis la palette de mise en page) ou valeur
   * littérale en mode export. Par défaut la variable globale `qcm-colonnes`,
   * celle des vues sans réglage par exercice.
   */
  qcmColumns: string = DEFAULT_QCM_COLUMNS,
  /** Met en gras les repères des listes alphabétiques comme les numéros des questions. */
  boldQuestionNumbers = false,
): string {
  // 1. Les formules et les blocs générés sont protégés par des jetons
  //    pour traverser intacts l'échappement du texte.
  const protectedSegments: string[] = []
  const protect = (typst: string): string => {
    protectedSegments.push(typst)
    return `\uE000${protectedSegments.length - 1}\uE001`
  }

  // Passe-plat pour du code Typst natif écrit par un exercice (mise en page
  // impossible à exprimer en HTML/CSS convertible, ex. un grid photo+texte
  // dont l'ordre des colonnes dépend d'un réglage) : le contenu de
  // <mathalea-typst> est inséré tel quel dans le document, sans échappement.
  // Protégé en tout premier pour ne jamais être touché par l'échappement du
  // texte ni par les remplacements suivants (tables, maths, balises...).
  let text = html.replace(
    /<mathalea-typst>([\s\S]*?)<\/mathalea-typst>/gi,
    (_, code: string) => protect(decodeEntities(code)),
  )
  // Éléments purement interactifs (boutons « Relancer l'animation »,
  // déclencheurs JavaScript au montage) : sans objet sur une page imprimée.
  text = text.replace(/<button\b[\s\S]*?<\/button>/gi, '')
  text = text.replace(
    /<mathalea-dom-ready\b[^>]*>(?:[\s\S]*?<\/mathalea-dom-ready>)?/gi,
    '',
  )
  text = protectResponsiveColumns(text, protect, figures, qcmColumns)
  text = protectQcm(
    renderScratchBlocksToSvg(text),
    protect,
    figures,
    qcmColumns,
  )
  text = protectSchemaContainers(text, protect)
  text = protectHtmlTables(text, protect, figures, qcmColumns)
  text = protectMathalea2dContainers(text, protect, figures, maxFigureWidthPt)
  text = protectApigeomSvgContainers(text, protect, figures, maxFigureWidthPt)
  text = protectKatexSpans(text, protect)
  // `~$€$` (pattern produit par `texPrix(val)~$€$`) : le `$€$` est un bloc math
  // imbriqué dans un autre `$...$`. En mode texte brut (pas de KaTeX rendu),
  // on remplace `~$€$` par `~\euro` pour éviter la confusion des délimiteurs $.
  text = text.replace(/~\$€\$/g, '~\\euro ')
  text = text.replace(/\$€\$/g, '\\euro ')
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, tex: string) =>
    protect(latexSegmentToTypst(tex, true, figures)),
  )
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, tex: string) =>
    protect(latexSegmentToTypst(tex, false, figures)),
  )
  // Traite $...$ et $$...$$ avant de supprimer les $ adjacents : cela évite
  // que `$\bullet$ $f(x)$` soit fusionné en `$\bulletf(x)$` (bulletf =
  // variable inconnue). Quand deux blocs `$A$ $B$` sont adjacents, chacun
  // est converti séparément ; le bloc espace `$ $` produit une chaîne vide,
  // ce qui est correct. Le repérage tient compte des accolades : un `$`
  // situé dans un `{…}` (ex. `\text{ m$^2$/h}`, unité avec exposant) fait
  // partie du bloc et ne le referme pas. Un `$$` n'est traité comme bloc
  // affiché que s'il n'est pas déjà à l'intérieur d'un `$…$` ouvert (voir
  // la documentation de `replaceBalancedInlineMath`).
  text = replaceBalancedInlineMath(
    text,
    (tex) => {
      const converted = latexSegmentToTypst(tex, false, figures)
      return converted.length > 0 ? protect(converted) : ''
    },
    (tex) => protect(latexSegmentToTypst(tex, true, figures)),
  )
  // Supprime les $ orphelins restants (ne contenant que des espaces)
  text = text.replace(/\$\s*\$/g, '')

  // `\underline{X}`, `\quad`/`\qquad` et `\medskip` en texte brut hors de
  // tout `$...$` (ex. `canEnonce`/`canReponseACompleter` des exercices
  // « Course aux nombres », écrits en LaTeX texte plutôt qu'en HTML, cf.
  // `context.isHtml` qui reste `true` pendant la génération Typst) : à ce
  // stade, tout ce qui était dans un `$...$` a déjà été protégé, donc ces
  // commandes restantes sont forcément du texte mode LaTeX, pas des maths.
  // `\underline` est réécrit en balise <u> pour rejoindre le traitement des
  // balises HTML ci-dessous ; `\quad`/`\qquad`/`\medskip` en espacement
  // Typst direct. `\medskip` peut être précédé d'un `\\` de saut de ligne
  // LaTeX explicite (ex. can6a-2026 : `Viens-tu à vélo ? \\\medskip …`) :
  // ce `\\` est absorbé avec la commande pour ne pas fuir en texte littéral.
  text = text.replace(/\\underline\s*\{([^{}]*)\}/g, '<u>$1</u>')
  // Certaines réponses CAN utilisent des pointillés LaTeX hors mode maths.
  text = text.replace(/\\(?:ldots|dots)\b(?:\s*\{\})?/g, () =>
    protect(ANSWER_BLANK),
  )
  text = text.replace(/\\qquad\b\s*/g, () => protect('#h(2em)'))
  text = text.replace(/\\quad\b\s*/g, () => protect('#h(1em)'))
  text = text.replace(/(?:\\\\\s*)?\\medskip\b\s*/g, () =>
    protect('#v(0.5em)\n'),
  )

  // Macros ProfCollege `\Lg[mm]{}` / `\Prix[0]{}` restées en mode texte : dans
  // les « Course aux nombres », l'unité à compléter suit les pointillés hors de
  // tout `$…$` (ex. canc3a-2023 : `$\ldots$ \Lg[mm]{}`). Sans cela, elles
  // fuiraient en texte littéral échappé. Leurs variantes en mode mathématique
  // sont traitées en amont par `preprocessTex`.
  // `~` : espace insécable du balisage Typst (une espace ordinaire serait
  // insérée telle quelle, et une U+00A0 ramenée à une espace par la
  // normalisation du texte plus bas)
  text = remplaceMacrosProfCollege(text, (valeur, unite) =>
    valeur === '' || unite === ''
      ? `${valeur}${unite}`
      : `${valeur}${protect('~')}${unite}`,
  )

  // Cases à cocher `\faSquare` / `\faCheckSquare` (police fontawesome de la
  // sortie LaTeX, variante `[regular]` ou `[solid]` en argument optionnel) :
  // écrites en LaTeX texte dans les `canReponseACompleter` / `canEnonce` des
  // « Course aux nombres » (ex. can6a-2025 Q10 et Q25, can1a-2025 Q20,
  // can2a-2025 Q16). Typst n'a pas fontawesome : on dessine un petit carré,
  // à bord fin pour la case vide, plein pour la case cochée. `\faCheckSquare`
  // est traité d'abord pour ne pas laisser `\faSquare` mordre dessus.
  text = text.replace(/\\faCheckSquare\b\s*(?:\[[^\]]*\])?\s*/g, () =>
    protect(
      '#box(baseline: 0.15em, width: 0.85em, height: 0.85em, radius: 1pt, fill: luma(60)) ',
    ),
  )
  text = text.replace(/\\faSquare\b\s*(?:\[[^\]]*\])?\s*/g, () =>
    protect(
      '#box(baseline: 0.15em, width: 0.85em, height: 0.85em, radius: 1pt, stroke: 0.6pt) ',
    ),
  )
  // `\raggedright` / `\raggedleft` / `\centering` en tête de réponse (ex.
  // can6a-2025 Q25) : sans effet utile dans une cellule du tableau, retirés
  // pour ne pas fuir en texte littéral.
  text = text.replace(/\\(?:raggedright|raggedleft|centering)\b\s*/g, '')

  // Mise en boîte LaTeX en mode texte, elle aussi propre aux énoncés des
  // « Course aux nombres » (ex. can2a-2026 Q12, qui encadre un algorithme).
  // Le contenu des boîtes est laissé dans le flux entre deux fragments
  // protégés : il continue à traverser le reste de la conversion (formules
  // déjà protégées, balises HTML, échappements).
  text = text.replace(/\\setlength\s*\{[^{}]*\}\s*\{[^{}]*\}\s*/g, '')
  text = text.replace(/\\newline\b\s*/g, '<br>')
  text = replaceLatexCommand(text, 'hspace', 1, ([longueur]) => {
    const ecart = latexLengthToTypst(longueur)
    return ecart == null ? '' : protect(`#h(${ecart})`)
  })
  text = replaceLatexCommand(text, 'texttt', 1, ([code]) =>
    // une chaîne `#raw` ne peut pas accueillir un fragment déjà protégé (une
    // formule, par exemple) : son jeton n'y serait pas restauré. Le contenu
    // reste alors dans le flux, sans police à chasse fixe.
    PROTECTED_TOKEN.test(code)
      ? code
      : protect(`#raw(${typstStringLiteral(decodeEntities(code))})`),
  )
  text = replaceLatexCommand(text, 'fbox', 1, ([contenu]) =>
    encadre(contenu, protect),
  )
  text = replaceLatexCommand(text, 'framebox', 1, ([contenu]) =>
    encadre(contenu, protect),
  )
  // La largeur de `\parbox` n'est pas reprise : les exercices l'expriment en
  // fraction de `\linewidth` (`0.5\linewidth`), mesure prise sur la page A4
  // de la sortie LaTeX, alors que la boîte atterrit souvent dans une cellule
  // bien plus étroite (tableau « Course aux nombres »), où la largeur
  // littérale couperait les lignes de l'algorithme encadré. Une boîte sans
  // largeur prend celle de son contenu, et ne se replie que s'il déborde.
  text = replaceLatexCommand(
    text,
    'parbox',
    2,
    ([, contenu]) => `${protect('#box[')}${contenu}${protect(']')}`,
  )

  // 2. Figures SVG (embarquées dans le document), puis éléments non
  //    convertis : images et tableaux
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, (svg) => {
    if (figures == null) return protect(missingBox('figure non convertie'))
    figures.push(svgToTypstImage(svg, maxFigureWidthPt))
    const figureName = `fig-${figures.length}`
    // mathalea-figure-block (plutôt que mathalea-fit) : réduit la figure à la
    // largeur disponible, applique le zoom et l'alignement réglés dans la
    // palette de l'aperçu et publie le repère invisible du contrôle de zoom
    // — pour que tout SVG autonome (bloc Scratch, balance…) soit
    // redimensionnable comme les figures mathalea2d. Ligne vide après la
    // figure : le texte qui suit reprend dans un nouveau paragraphe.
    return protect(
      `#mathalea-figure-block(${figures.length}, ${figureName}-align, ${figureName}-zoom, ${figureName})\n\n`,
    )
  })
  // images d'exercices statiques (annales scannées) : l'image est déjà
  // chargée dans le compilateur (voir `staticImagePaths`/`mapShadow`), sinon
  // (référentiel sans image, ou récupération réseau échouée) c'est un encart
  text = text.replace(
    /<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi,
    (_, before: string, src: string, after: string) => {
      const path = staticImagePaths.get(src)
      if (path == null || figures == null) {
        return protect(missingBox('image non convertie'))
      }
      // une image avec des attributs width/height explicites (ex. photo
      // dimensionnée par un exercice, contrairement aux scans d'annales qui
      // n'en portent pas) est embarquée à cette taille (conversion CSS px →
      // pt, 96 px = 72 pt comme pour les figures SVG) plutôt qu'étirée à la
      // largeur de la colonne
      const attrs = before + after
      const width = /\swidth=["']?(\d+(?:\.\d+)?)["']?/i.exec(attrs)?.[1]
      const height = /\sheight=["']?(\d+(?:\.\d+)?)["']?/i.exec(attrs)?.[1]
      const widthPt =
        width != null && height != null
          ? Number(width) * 0.75
          : // largeur intrinsèque volontairement bien plus grande que
            // n'importe quelle colonne/page (A4 paysage compris) :
            // mathalea-fit la réduit alors toujours pour occuper exactement
            // toute la largeur disponible, là où MAX_FIGURE_WIDTH_PT
            // (calibré pour les figures mathalea2d) la laisserait plus
            // étroite que la page
            STATIC_IMAGE_INTRINSIC_WIDTH_PT
      figures.push(`image(${typstStringLiteral(path)}, width: ${widthPt}pt)`)
      const zoomArg = zoomVariable != null ? `, zoom: ${zoomVariable}` : ''
      return protect(`#mathalea-fit(fig-${figures.length}${zoomArg})\n\n`)
    },
  )
  text = text.replace(/<img[^>]*>/gi, () =>
    protect(missingBox('image non convertie')),
  )
  // figures 3D (Three.js) : les empilements de cubes sont redessinés en SVG
  // isométrique à partir de leur description JSON, le reste est signalé
  text = text.replace(/<canvas-3d[^>]*>(?:[\s\S]*?<\/canvas-3d>)?/gi, (tag) => {
    const svg = canvas3dToSvg(tag)
    if (svg == null || figures == null) {
      return protect(missingBox('figure 3D non convertie'))
    }
    figures.push(svgToTypstImage(svg))
    return protect(`#mathalea-fit(fig-${figures.length})\n\n`)
  })

  // les <svg> ont déjà été extraits ci-dessus : les <style>/<script>
  // restants sont hors SVG (CSS/JS d'affichage HTML sans équivalent Typst)
  // et doivent être retirés pour ne pas apparaître comme texte brut
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')

  // 3. Parcours des balises restantes
  let output = ''
  /** Profondeur des blocs de contenu Typst ouverts (#strong[, #emph[...]) */
  let bracketDepth = 0
  const listStack: { type: 'ul' | 'ol'; numbering?: string }[] = []
  /**
   * Dans une liste, retire la ligne vide que les figures protégées ajoutent
   * après elles : une ligne non indentée interrompt l'item Typst en cours, et
   * la sous-question suivante repartirait à « a) ». Hors liste, cette ligne
   * vide fait reprendre le texte dans un nouveau paragraphe.
   */
  const sansLigneVideEnListe = (texte: string): string =>
    listStack.length === 0
      ? texte
      : texte.replace(/\uE000(\d+)\uE001/g, (jeton, index: string) => {
          protectedSegments[Number(index)] = protectedSegments[
            Number(index)
          ].replace(/\n+$/, '')
          return jeton
        })
  /** Position, dans `output`, du début de l'item de liste en cours */
  let debutItem = 0
  /**
   * Saut de ligne d'un `<div>` ou d'un `<p>` dans une liste : `\ ` plutôt qu'un
   * retour à la ligne source, qui ferait sortir la suite de l'item Typst
   * (`#tasks` ne garde que ses items : ce texte disparaîtrait). Rien en début
   * d'item ni après un autre saut, pour ne pas créer de ligne vide.
   */
  const sautDansItem = () => {
    const contenu = output.slice(debutItem).trimEnd()
    return contenu === '' || contenu.endsWith('\\') ? '' : '\\ '
  }
  /** Nombre de blocs Typst ouverts par chaque <span> imbriqué */
  const spanStack: number[] = []
  const openBlock = (markup: string) => {
    bracketDepth++
    return markup
  }
  const closeBlock = () => {
    if (bracketDepth === 0) return ''
    bracketDepth--
    return ']'
  }
  const tokens = text.match(/<\/?[a-zA-Z][^>]*>|<(?!\/?[a-zA-Z])|[^<]+/g) ?? []
  for (const token of tokens) {
    // On ignore les balises html
    const isHtmlTag = /^<\/?[a-zA-Z]/.test(token)
    if (!isHtmlTag) {
      output += sansLigneVideEnListe(
        escapeTypstText(decodeEntities(token.replace(/[^\S\u00a0\u202f]+/g, ' '))),
      )
      continue
    }

    if (token[0] !== '<') {
      // nœud texte : les retours à la ligne du HTML ne sont pas
      // significatifs (les blancs sont normalisés avant le décodage
      // des entités pour préserver les espaces insécables)
      output += sansLigneVideEnListe(
        escapeTypstText(decodeEntities(token.replace(/[^\S\u00a0\u202f]+/g, ' '))),
      )
      continue
    }
    const isClosing = token[1] === '/'
    const name = (token.match(/^<\/?([a-zA-Z0-9]+)/) ?? [])[1]?.toLowerCase()
    switch (name) {
      case 'br':
        // `\ ` (espace, sans retour à la ligne source) plutôt que `\` +
        // `\n` : un `<br>` à l'intérieur d'un `<li>` produirait sinon une
        // ligne de continuation non indentée, que l'étape de nettoyage (4.)
        // prive ensuite de son indentation — Typst la lirait alors comme un
        // nouveau paragraphe, ce qui interromprait la liste `+`/`-` en
        // cours (et sa numérotation). `\ ` produit le même saut de ligne
        // visuel sans jamais introduire ce `\n`.
        output += '\\ '
        break
      case 'b':
      case 'strong':
        output += isClosing ? closeBlock() : openBlock('#strong[')
        break
      case 'i':
      case 'em':
        output += isClosing ? closeBlock() : openBlock('#emph[')
        break
      case 'u':
        output += isClosing ? closeBlock() : openBlock('#underline[')
        break
      case 'sup':
        output += isClosing ? closeBlock() : openBlock('#super[')
        break
      case 'sub':
        output += isClosing ? closeBlock() : openBlock('#sub[')
        break
      case 'ul':
      case 'ol':
        if (isClosing) {
          const list = listStack.pop()
          if (list?.numbering != null) output += ']'
          output += '\n'
        } else {
          const className = token.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1]
          const numbering =
            name === 'ol' && /\balpha\b/i.test(className ?? '')
              ? '#tasks(columns: 1, label: "a)"' +
                (boldQuestionNumbers ? ', label-weight: "bold"' : '') +
                ')['
              : undefined
          listStack.push({ type: name, numbering })
          if (numbering != null) {
            // `#tasks(columns: 1, label: "a)")[+ item\n+ item]` plutôt qu'un
            // `#set enum(numbering: ...)` : le numéro d'un `enum` brut est
            // aligné par le haut de sa cellule, donc « décollé » de la ligne
            // de base quand la première ligne de l'item contient une formule
            // haute (matrice, fraction). `tasks` (`MATHALEA_TASKS_HELPER`)
            // le pose sur la première ligne, comme pour les questions.
            // `columns: 1` : une sous-question par ligne, comme en HTML et en
            // LaTeX, malgré le `columns: "auto-fit"` de `#tasks-setup`.
            output += numbering
          }
        }
        break
      case 'li':
        if (!isClosing) {
          // le marqueur est protégé pour ne pas être échappé comme s'il
          // s'agissait d'un début de ligne saisi dans le texte
          output +=
            '\n' +
            protect(
              listStack[listStack.length - 1]?.type === 'ol' ? '+ ' : '- ',
            )
          debutItem = output.length
        }
        break
      case 'p':
        output += listStack.length > 0 ? sautDansItem() : '\n\n'
        break
      case 'div':
        output += listStack.length > 0 ? sautDansItem() : '\n'
        break
      case 'span': {
        // les spans stylés (texteEnCouleur, texteEnCouleurEtGras...)
        // conservent leur couleur et leur graisse
        if (isClosing) {
          for (let n = spanStack.pop() ?? 0; n > 0; n--) {
            output += closeBlock()
          }
          break
        }
        const style = token.match(/style\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
        const styleValue = style?.[1] ?? style?.[2] ?? ''
        const colorValue = styleValue.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)
        const isBold = /font-weight\s*:\s*(?:bold|[6-9]00)/i.test(styleValue)
        let opened = 0
        if (colorValue != null && !isDefaultBlack(colorValue[1])) {
          const color = typstColorExpression(colorValue[1])
          if (color != null) {
            output += openBlock(`#text(fill: ${color})[`)
            opened++
          }
        }
        if (isBold) {
          output += openBlock('#strong[')
          opened++
        }
        spanStack.push(opened)
        break
      }
      default:
        // balise inconnue : ignorée, seul son contenu est conservé
        break
    }
  }
  while (bracketDepth > 0) output += closeBlock()

  // 4. Nettoyage puis restauration des segments protégés (l'échappement
  //    des débuts de ligne ne doit pas toucher le balisage généré)
  output = output
    .split('\n')
    .map((line) => line.trim())
    // une ligne commençant par -, + ou = serait interprétée comme une
    // liste ou un titre Typst
    .map((line) => (/^[-+=/]/.test(line) ? '\\' + line : line))
    .join('\n')
  output = output.replace(/\n{3,}/g, '\n\n')
  // `#strong[mot](suite)` : Typst lirait `(suite)` comme les arguments d'un
  // nouvel appel (« expected comma », « expected function »). Une espace
  // sans chasse entre `]` et `(` coupe l'appel sans changer le rendu. Les `]`
  // littéraux sont échappés (`\]`) et les formules sont encore protégées :
  // tout `]` nu est ici la fin d'un bloc généré.
  output = output.replace(/(?<!\\)\](?=\()/g, ']' + ZERO_WIDTH_SPACE)
  // Un segment protégé peut contenir le jeton d'un autre segment (colonnes
  // de `deuxColonnesResp` : le conteneur est protégé après le contenu qu'il
  // enveloppe) : on restaure jusqu'à ce qu'il n'en reste plus. La borne
  // évite toute boucle infinie si un contenu portait un jeton par hasard.
  for (let pass = 0; pass < 10 && /\uE000\d+\uE001/.test(output); pass++) {
    output = output.replace(
      /\uE000(\d+)\uE001/g,
      (jeton, index: string, offset: number, texte: string) => {
        const segment = protectedSegments[Number(index)]
        // tableau ou figure (`#align(center)[…]`, `#image(…)`) suivi de
        // « (suite) » : même piège que ci-dessus
        return segment.startsWith('#') &&
          /[\])]$/.test(segment) &&
          texte[offset + jeton.length] === '('
          ? segment + ZERO_WIDTH_SPACE
          : segment
      },
    )
  }
  // Un \ en fin de contenu (issu d'un <br> final) formerait \] avec l'accolade
  // fermante d'un bloc [contenu] Typst → délimiteur non fermé.
  return output.trim().replace(/\\+$/, '')
}
