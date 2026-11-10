import {
  MATHALEA_FIGURE_BLOCK_HELPER,
  MATHALEA_FIGURE_HELPERS,
  MATHALEA_FIT_HELPER,
  MATHALEA_QCM_HELPERS,
  MATHALEA_SCHEMA_HELPER,
  MATHALEA_TASKS_HELPER,
  TASKIZE_IMPORT,
  htmlToTypst,
  applyDocumentFontsToFigure,
} from '../typst/latexToTypst'
import {
  BREATHER_CALL,
  BREATHER_IMPORT,
  MATHALEA_ANCHOR_HELPER,
  MATHALEA_INLINE_FORMULA_RULE,
} from '../typst/buildTypstDocument'
import { minimalCorrection } from '../typst/minimalCorrection'

/**
 * Construction du document Typst du « Diaporama PDF » : une question en grand
 * par page, au format d'écran (16/9 ou 4/3), puis les corrections. Les pages
 * sont des pages Typst ordinaires (`paper: "presentation-16-9"`) : pas de
 * dépendance à un paquet de présentation, le code reste lisible et éditable.
 */

/** Contenu d'une diapositive, au format HTML de MathALÉA (formules en `$...$`) */
export interface SlideInput {
  /** Question (la diapositive) */
  question: string
  /** Correction correspondante */
  correction: string
  shortAnswer?: string | null
  /**
   * Autres versions de la même question, affichées côte à côte sur la même
   * diapositive (réglage « multivue », comme dans le diaporama en direct).
   */
  extraVersions?: { question: string; correction: string }[]
}

/** Ce que le diaporama contient, et dans quel ordre */
export type SlidesContent =
  /** toutes les questions, puis toutes les corrections */
  | 'questions-corrections'
  /** chaque correction juste après sa question */
  | 'alternees'
  /** toutes les questions, puis chaque question suivie de sa correction */
  | 'toutes-questions-puis-alternees'
  /** les questions seules */
  | 'questions'
  /** les corrections seules */
  | 'corrections'

/** Alignement vertical du contenu sur la diapositive */
export type SlideAlign = 'top' | 'center' | 'bottom'

export interface SlidesDocumentOptions {
  /**
   * Titre de la page de garde (sert aussi au nom du fichier exporté). Se règle
   * par le crayon de la page de garde sur l'aperçu ; vider le titre et le
   * sous-titre retire la page de garde.
   */
  coverTitle: string
  /** Sous-titre de la page de garde (vide par défaut) */
  coverSubtitle: string
  /** Police du texte (nom d'une police libre embarquée dans le compilateur) */
  font: string
  /** Police des formules mathématiques */
  mathFont: string
  /** Taille du texte des questions en points */
  questionFontSize: number
  /** Taille du texte des corrections en points */
  correctionFontSize: number
  /** Format de la page : 16/9 ou 4/3 */
  ratio: '16-9' | '4-3'
  /** Contenu et ordre des diapositives */
  content: SlidesContent
  /**
   * Affiche deux versions différentes de chaque question côte à côte sur la
   * même diapositive (comme le réglage « multivue » du diaporama en direct).
   */
  multivue: boolean
  /** Alignement vertical par défaut du contenu (réglable diapo par diapo) */
  align: SlideAlign
  /** Alignement horizontal du contenu, commun à toutes les diapositives */
  horizontalAlign: 'left' | 'center'
  /** Zoom par défaut des figures (réglable figure par figure sur l'aperçu) */
  figureZoom: number
  /** Numérote les diapositives (coin haut-gauche) */
  showNumbers: boolean
  /** Ajoute « Correction » au numéro des diapositives de correction */
  showCorrectionLabel: boolean
  /**
   * Réduit automatiquement la taille du texte d'une diapositive trop chargée
   * pour qu'elle tienne dans la page (les corrections détaillées débordaient
   * sinon sur la page précédente).
   */
  autoFit: boolean
  /**
   * Gestion automatique des espaces verticaux (paquet breather) : les lignes
   * contenant des maths hautes (fractions « display », matrices, racines
   * imbriquées…) s'écartent juste ce qu'il faut.
   */
  autoVerticalSpacing: boolean
  /** Texte du pied de page (vide pour ne pas en mettre) */
  footer: string
  /**
   * Ajoute à la fin du document une page récapitulant toutes les questions
   * (autant de pages que nécessaire : le contenu s'y enchaîne au lieu
   * d'occuper toute la page comme une diapositive). En multivue, seule la
   * première version de chaque question y figure.
   */
  recapQuestions: boolean
  /**
   * Ajoute à la fin du document une page récapitulant toutes les questions
   * avec leur réponse, réduite à l'essentiel (correction minimale, comme le
   * réglage du même nom de la vue Typst).
   */
  recapAnswers: boolean
  /** Titre du récapitulatif des questions (vide pour ne pas en mettre) */
  recapQuestionsTitle: string
  /** Titre du récapitulatif des questions et réponses */
  recapAnswersTitle: string
  /** Taille du texte des récapitulatifs en points */
  recapFontSize: number
  /** Nombre de colonnes des récapitulatifs */
  recapColumns: number
  /** Texte affiché sur chaque diapositive (ex. le thème de la séance) */
  slideTitle: string
  /** Point d'ancrage de ce texte sur la diapositive */
  titlePosition:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  /** Taille de ce texte en points */
  titleSize: number
  /** Couleur de ce texte (hexadécimal) */
  titleColor: string
  /** Opacité de ce texte (0 à 1) */
  titleOpacity: number
}

export const defaultSlidesDocumentOptions: SlidesDocumentOptions = {
  coverTitle: 'Calcul mental',
  coverSubtitle: '',
  font: 'Libertinus Serif',
  mathFont: 'Libertinus Math',
  questionFontSize: 40,
  correctionFontSize: 32,
  ratio: '16-9',
  content: 'questions-corrections',
  multivue: false,
  align: 'center',
  horizontalAlign: 'center',
  figureZoom: 1.5,
  showNumbers: true,
  showCorrectionLabel: true,
  autoFit: true,
  autoVerticalSpacing: true,
  footer: 'MathALÉA - CC BY-SA',
  recapQuestions: false,
  recapAnswers: false,
  recapQuestionsTitle: 'Toutes les questions',
  recapAnswersTitle: 'Toutes les questions et leurs réponses',
  recapFontSize: 16,
  recapColumns: 2,
  slideTitle: '',
  titlePosition: 'bottom-right',
  titleSize: 14,
  titleColor: '#6b7280',
  titleOpacity: 1,
}

/**
 * Réglages faits sur l'aperçu (taille et alignement diapo par diapo, ordre,
 * diapositives masquées, zoom des figures) à réémettre lors d'une
 * régénération : ils sont relus dans le code courant par
 * `harvestSlidesCarryOver`, comme le `TypstCarryOver` de la fiche.
 */
export interface SlidesCarryOver {
  /** Facteur de taille du texte, par clef `<num>-question` ou `<num>-correction` */
  slideScales?: Record<string, number>
  /** Alignement vertical, par clef `<num>-question` ou `<num>-correction` */
  slideAligns?: Record<string, SlideAlign>
  /** Ordre d'affichage des diapositives visibles (numéros 1-based) */
  order?: number[]
  /** Diapositives masquées (numéros 1-based) */
  hidden?: number[]
  /** Zoom de chaque figure, par numéro de figure */
  figureZooms?: Record<number, number>
  /** Alignement de chaque figure, par numéro de figure */
  figureAligns?: Record<number, 'left' | 'center' | 'right'>
}

/**
 * Relit dans le code les réglages faits sur l'aperçu. Pour l'alignement, seul
 * l'écart au défaut *alors actif* (marqué par `diapo-align-defaut`, écrit à
 * la génération précédente) est retenu comme une vraie surcharge à figer —
 * comme pour la taille du texte, dont seul l'écart à son défaut fixe (1) est
 * retenu. Comparer au défaut qui vient d'être choisi, lui, figerait les
 * diapositives qui ne faisaient que suivre l'ancien défaut et empêcherait un
 * nouveau réglage global de leur être appliqué.
 */
export function harvestSlidesCarryOver(code: string): SlidesCarryOver {
  const carryOver: SlidesCarryOver = {}

  const slideScales: Record<string, number> = {}
  for (const match of code.matchAll(
    /^#let diapo-(\d+)-(question|correction)-taille = ([\d.]+)/gm,
  )) {
    const value = Number(match[3])
    if (Number.isFinite(value) && value !== 1) {
      slideScales[`${match[1]}-${match[2]}`] = value
    }
  }
  if (Object.keys(slideScales).length > 0) carryOver.slideScales = slideScales

  const defaultAlignMatch =
    /^#let diapo-align-defaut = "(top|center|bottom)"/m.exec(code)
  const defaultAlign =
    (defaultAlignMatch?.[1] as SlideAlign | undefined) ?? 'center'
  const slideAligns: Record<string, SlideAlign> = {}
  for (const match of code.matchAll(
    /^#let diapo-(\d+)-(question|correction)-align = "(top|center|bottom)"/gm,
  )) {
    const value = match[3] as SlideAlign
    if (value !== defaultAlign) {
      slideAligns[`${match[1]}-${match[2]}`] = value
    }
  }
  if (Object.keys(slideAligns).length > 0) carryOver.slideAligns = slideAligns

  // l'ordre est celui des appels `#diapo(...)` du corps du document : il suit
  // donc aussi une page déplacée ou supprimée à la main dans le code
  const order: number[] = []
  for (const match of code.matchAll(/^#diapo\((\d+),/gm)) {
    const num = Number(match[1])
    if (Number.isInteger(num) && !order.includes(num)) order.push(num)
  }
  if (order.length > 0) carryOver.order = order

  const hiddenMatch = /^#let diapos-masquees = \(([^)]*)\)/m.exec(code)
  if (hiddenMatch != null) {
    const hidden = hiddenMatch[1]
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((num) => Number.isInteger(num) && num > 0)
    if (hidden.length > 0) carryOver.hidden = hidden
  }

  const figureZooms: Record<number, number> = {}
  for (const match of code.matchAll(/^#let fig-(\d+)-zoom = ([\d.]+)/gm)) {
    const value = Number(match[2])
    if (Number.isFinite(value)) figureZooms[Number(match[1])] = value
  }
  if (Object.keys(figureZooms).length > 0) carryOver.figureZooms = figureZooms

  const figureAligns: Record<number, 'left' | 'center' | 'right'> = {}
  for (const match of code.matchAll(
    /^#let fig-(\d+)-align = (left|center|right)/gm,
  )) {
    figureAligns[Number(match[1])] = match[2] as 'left' | 'center' | 'right'
  }
  if (Object.keys(figureAligns).length > 0) {
    carryOver.figureAligns = figureAligns
  }

  return carryOver
}

/** Chaîne littérale Typst (échappe backslash et guillemets) */
function typstString(text: string): string {
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/** Couleur Typst à partir d'un hexadécimal et d'une opacité (0 à 1) */
function typstColorWithOpacity(hex: string, opacity: number): string {
  const base = `rgb(${typstString(hex)})`
  const clamped = Math.min(1, Math.max(0, opacity))
  if (clamped >= 1) return base
  return `${base}.transparentize(${Math.round((1 - clamped) * 100)}%)`
}

/** Littéral de tableau Typst d'entiers (virgule finale si un seul élément) */
function typstArray(values: number[]): string {
  if (values.length === 1) return `(${values[0]},)`
  return `(${values.join(', ')})`
}

/** Indente un contenu multi-ligne pour l'insérer dans un bloc `[...]` */
function indent(content: string): string {
  return content
    .split('\n')
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join('\n')
}

/**
 * Ordre d'affichage des diapositives : celui relu dans le code, complété par
 * les diapositives apparues depuis (nouvel exercice, question ajoutée) et
 * privé de celles que le professeur a masquées.
 */
function resolveOrder(
  total: number,
  carryOver: SlidesCarryOver,
): { order: number[]; hidden: number[] } {
  const inRange = (num: number) => num >= 1 && num <= total
  const hidden = [...new Set(carryOver.hidden ?? [])]
    .filter(inRange)
    .sort((a, b) => a - b)
  const order = [...new Set(carryOver.order ?? [])].filter(
    (num) => inRange(num) && !hidden.includes(num),
  )
  for (let num = 1; num <= total; num++) {
    if (!order.includes(num) && !hidden.includes(num)) order.push(num)
  }
  return { order, hidden }
}

/**
 * Génère le code Typst complet du diaporama. Comme pour la fiche
 * (`buildTypstDocument`), le préambule expose des variables réglables
 * directement dans le code (`taille-questions`, `numeroter`...).
 */
export function buildSlidesDocument(
  slides: SlideInput[],
  options: SlidesDocumentOptions = defaultSlidesDocumentOptions,
  carryOver: SlidesCarryOver = {},
): string {
  // figures SVG rencontrées pendant la conversion, déclarées en tête de
  // document (#let fig-N = image(...)) comme dans buildTypstDocument
  const figures: string[] = []
  const converted = slides.map((slide) => {
    // réponse du récapitulatif : la correction réduite à ses réponses mises
    // en évidence. `minimalCorrection` rend la correction inchangée quand
    // elle n'en contient aucune : le récapitulatif réutilise alors la
    // correction de la diapositive plutôt que de la convertir une seconde
    // fois (contenu et figures ne sont pas dupliqués).
    const minimalAnswer = options.recapAnswers
      ? minimalCorrection(slide.correction, slide.shortAnswer)
      : slide.correction
    return {
      question: htmlToTypst(slide.question, figures),
      correction: htmlToTypst(slide.correction, figures),
      minimalAnswer:
        minimalAnswer === slide.correction
          ? null
          : htmlToTypst(minimalAnswer, figures),
      extraVersions: (slide.extraVersions ?? []).map((version) => ({
        question: htmlToTypst(version.question, figures),
        correction: htmlToTypst(version.correction, figures),
      })),
    }
  })
  const usesMultivue = converted.some((slide) => slide.extraVersions.length > 0)

  const { order, hidden } = resolveOrder(converted.length, carryOver)

  const slideLines: string[] = []
  for (const [index, slide] of converted.entries()) {
    const num = index + 1
    slideLines.push(`// ----- Diapositive ${num} -----`)
    slideLines.push(`#let diapo-${num}-question = [`)
    slideLines.push(indent(slide.question))
    slideLines.push(']')
    slideLines.push(`#let diapo-${num}-correction = [`)
    slideLines.push(indent(slide.correction))
    slideLines.push(']')
    // versions supplémentaires du multivue : diapo-N-question-v2, -v3...
    for (const [versionIndex, version] of slide.extraVersions.entries()) {
      const vNum = versionIndex + 2
      slideLines.push(`#let diapo-${num}-question-v${vNum} = [`)
      slideLines.push(indent(version.question))
      slideLines.push(']')
      slideLines.push(`#let diapo-${num}-correction-v${vNum} = [`)
      slideLines.push(indent(version.correction))
      slideLines.push(']')
    }
    if (options.recapAnswers) {
      if (slide.minimalAnswer == null) {
        slideLines.push(
          `#let recap-${num}-reponse = diapo-${num}-correction // aucune réponse mise en évidence`,
        )
      } else {
        slideLines.push(`#let recap-${num}-reponse = [`)
        slideLines.push(indent(slide.minimalAnswer))
        slideLines.push(']')
      }
    }
    // taille et alignement de chaque face, réglables par les boutons de
    // l'aperçu (repris du code courant à la régénération)
    for (const side of ['question', 'correction'] as const) {
      slideLines.push(
        `#let diapo-${num}-${side}-taille = ${carryOver.slideScales?.[`${num}-${side}`] ?? 1}`,
      )
      slideLines.push(
        `#let diapo-${num}-${side}-align = ${typstString(
          carryOver.slideAligns?.[`${num}-${side}`] ?? options.align,
        )}`,
      )
    }
  }

  const allBodies = converted
    .flatMap((slide) => [
      slide.question,
      slide.correction,
      ...slide.extraVersions.flatMap((version) => [
        version.question,
        version.correction,
      ]),
    ])
    .join('\n')
  const usesMathaleaFigure = allBodies.includes('mathalea-figure(')
  const usesSchema = allBodies.includes('mathalea-schema-span')
  const usesQcm = allBodies.includes('qcm-')
  const usesTasks = allBodies.includes('#tasks(')

  const lines: string[] = []
  lines.push('// Diaporama PDF généré par MathALÉA — https://coopmaths.fr/alea')
  lines.push('// Une question en grand par page, au format d’un écran.')
  lines.push('// Les corrections suivent les questions (réglage « Contenu »).')
  lines.push('')
  if (usesTasks || options.autoVerticalSpacing) {
    lines.push('// ----- Paquets -----')
    if (usesTasks) lines.push(TASKIZE_IMPORT, MATHALEA_TASKS_HELPER)
    if (options.autoVerticalSpacing) lines.push(BREATHER_IMPORT)
    lines.push('')
  }
  // chaque diapositive publie un repère (boutons de réglage de l'aperçu) ;
  // mathalea-figure-block s'en sert aussi pour ses figures
  lines.push('// ----- Repères invisibles des contrôles de l’aperçu -----')
  lines.push(MATHALEA_ANCHOR_HELPER)
  lines.push('')
  if (figures.length > 0) {
    lines.push('// ----- Adaptation des figures à la largeur -----')
    lines.push(MATHALEA_FIT_HELPER)
    lines.push('')
    lines.push(MATHALEA_FIGURE_BLOCK_HELPER)
    lines.push('')
  }
  if (usesMathaleaFigure) {
    lines.push('// ----- Figures mathalea2d -----')
    lines.push(MATHALEA_FIGURE_HELPERS)
    lines.push('')
  }
  if (usesSchema) {
    lines.push('// ----- Schémas en barres (accolades/flèches étirées) -----')
    lines.push(MATHALEA_SCHEMA_HELPER)
    lines.push('')
  }
  lines.push('// ----- Réglages -----')
  lines.push(`#let police-texte = ${typstString(options.font)}`)
  lines.push(`#let police-maths = ${typstString(options.mathFont)}`)
  lines.push(`#let taille-questions = ${options.questionFontSize}pt`)
  lines.push(`#let taille-corrections = ${options.correctionFontSize}pt`)
  lines.push(
    `#let alignement-horizontal = ${options.horizontalAlign === 'left' ? 'left' : 'center'}`,
  )
  lines.push(
    `#let numeroter = ${options.showNumbers} // numéro au coin de la diapositive`,
  )
  lines.push(
    `#let etiquette-correction = ${options.showCorrectionLabel} // « Correction » devant le numéro`,
  )
  lines.push(
    `#let ajustement-auto = ${options.autoFit} // réduit le texte s’il déborde de la page`,
  )
  lines.push(
    '#let taille-numero = 16pt // numéro (et « Correction N ») du coin',
  )
  lines.push(`#let garde-titre = ${typstString(options.coverTitle)}`)
  lines.push(`#let garde-sous-titre = ${typstString(options.coverSubtitle)}`)
  lines.push(`#let titre = ${typstString(options.slideTitle)}`)
  lines.push(`#let titre-position = ${typstString(options.titlePosition)}`)
  lines.push(
    `#let titre-taille = ${options.titleSize}pt // titre des diapositives et pied de page`,
  )
  lines.push(
    `#let titre-couleur = ${typstColorWithOpacity(options.titleColor, options.titleOpacity)}`,
  )
  lines.push(`#let pied-de-page = ${typstString(options.footer)}`)
  if (options.recapQuestions || options.recapAnswers) {
    // un champ de réglage vidé donnerait NaN : le document entier ne
    // compilerait plus (`(1fr,) * NaN`), on retombe sur le défaut
    const recapFontSize = Number.isFinite(options.recapFontSize)
      ? options.recapFontSize
      : defaultSlidesDocumentOptions.recapFontSize
    const recapColumns = Number.isFinite(options.recapColumns)
      ? Math.max(1, Math.round(options.recapColumns))
      : defaultSlidesDocumentOptions.recapColumns
    lines.push(
      `#let recap-taille = ${recapFontSize}pt // texte des récapitulatifs`,
    )
    lines.push(`#let recap-colonnes = ${recapColumns}`)
    if (options.recapQuestions) {
      lines.push(
        `#let recap-titre-questions = ${typstString(options.recapQuestionsTitle)}`,
      )
    }
    if (options.recapAnswers) {
      lines.push(
        `#let recap-titre-reponses = ${typstString(options.recapAnswersTitle)}`,
      )
    }
  }
  lines.push('#let titre-affiche = titre.trim() != ""')
  lines.push(
    '#let titre-en-haut = titre-affiche and titre-position.starts-with("top")',
  )
  lines.push('#let titre-en-bas = titre-affiche and not titre-en-haut')
  lines.push(
    `#let diapos-masquees = ${typstArray(hidden)} // masquées depuis l’aperçu (pour mémoire)`,
  )
  // non utilisée par la mise en page : sert uniquement de repère à
  // `harvestSlidesCarryOver` pour distinguer un alignement de diapositive
  // réglé à la main (à figer) de celui qui ne fait que suivre ce défaut (à
  // laisser suivre un nouveau défaut choisi dans les réglages)
  lines.push(
    `#let diapo-align-defaut = ${typstString(options.align)} // pour mémoire`,
  )
  if (usesQcm) {
    lines.push('#let couleur = black // couleur des bonnes réponses de QCM')
    lines.push('#let qcm-colonnes = 2 // colonnes des propositions de QCM')
  }
  lines.push('')
  lines.push('// Le pied de page vit dans la marge : il n’empiète pas sur le')
  lines.push('// contenu de la diapositive. Le titre des diapositives ancré en')
  lines.push('// bas le rejoint sur cette ligne : ils sont ainsi alignés et de')
  lines.push(
    '// même taille. Le pied va à droite, sauf si le titre y est déjà.',
  )
  // parenthèses obligatoires : sans elles, le `else` d’une ligne suivante ne
  // ferait plus partie de l’expression (Typst clôt le `#let` en fin de ligne)
  lines.push('#let colonne-titre = (')
  lines.push('  if titre-position.ends-with("left") { 0 }')
  lines.push('  else if titre-position.ends-with("right") { 2 } else { 1 })')
  lines.push(
    '#let colonne-pied = if titre-en-bas and colonne-titre == 2 { 0 } else { 2 }',
  )
  lines.push('#let ligne-pied = {')
  lines.push('  let cellule(numero, ali) = align(ali,')
  lines.push('    if titre-en-bas and colonne-titre == numero {')
  lines.push('      text(fill: titre-couleur, titre)')
  lines.push(
    '    } else if pied-de-page.trim() != "" and colonne-pied == numero {',
  )
  lines.push('      text(fill: gray, pied-de-page)')
  lines.push('    } else { [] })')
  lines.push('  text(size: titre-taille, grid(columns: (1fr, 1fr, 1fr),')
  lines.push('    cellule(0, left), cellule(1, center), cellule(2, right)))')
  lines.push('}')
  lines.push(
    `#set page(paper: "presentation-${options.ratio}", margin: (x: 15mm, y: 12mm),`,
  )
  lines.push(
    '  footer: if titre-en-bas or pied-de-page.trim() != "" { ligne-pied } else { none })',
  )
  lines.push(
    '#set text(font: police-texte, size: taille-questions, lang: "fr")',
  )
  lines.push(
    '// police des formules ; le texte inséré garde la police du texte',
  )
  lines.push('#show math.equation: set text(font: police-maths)')
  lines.push('#let txt(corps) = text(font: police-texte, corps)')
  lines.push(MATHALEA_INLINE_FORMULA_RULE)
  lines.push('// les fractions gardent leur taille normale au milieu du texte')
  lines.push('#show math.frac: it => math.display(it)')
  if (options.autoVerticalSpacing) {
    lines.push(
      '// gestion automatique des espaces verticaux : les lignes aux maths',
      "// hautes s'écartent juste ce qu'il faut (paquet breather)",
      BREATHER_CALL,
    )
  }
  if (usesQcm) {
    lines.push(MATHALEA_QCM_HELPERS)
  }
  lines.push('')
  if (figures.length > 0) {
    lines.push('// ----- Figures (SVG embarqués) -----')
    for (const [index, figure] of figures.entries()) {
      const figNum = index + 1
      lines.push(
        `#let fig-${figNum} = ${applyDocumentFontsToFigure(figure, options)}`,
      )
      lines.push(
        `#let fig-${figNum}-zoom = ${carryOver.figureZooms?.[figNum] ?? options.figureZoom}`,
      )
      lines.push(
        `#let fig-${figNum}-align = ${carryOver.figureAligns?.[figNum] ?? 'center'}`,
      )
    }
    lines.push('')
  }
  lines.push('// ----- Habillage des diapositives -----')
  lines.push('// alignement du contenu : horizontal commun, vertical réglable')
  lines.push('// diapositive par diapositive (boutons de l’aperçu)')
  lines.push('#let aligne(nom) = alignement-horizontal + (')
  lines.push('  if nom == "top" { top } else if nom == "bottom" { bottom }')
  lines.push('  else { horizon })')
  lines.push(
    '// une diapositive trop chargée (correction détaillée…) déborderait',
  )
  lines.push('// de la page : son texte est réduit jusqu’à ce qu’elle tienne.')
  lines.push('// Réduire la police diminue à la fois la hauteur des lignes et')
  lines.push('// leur nombre : la racine carrée du dépassement donne une bonne')
  lines.push('// première estimation, affinée par quelques passes de 5 %.')
  lines.push('#let ajuster(corps, taille) = layout(size => {')
  lines.push(
    '  let hauteur(t) = measure(block(width: size.width, text(size: t, corps))).height',
  )
  lines.push('  let h = hauteur(taille)')
  lines.push('  let t = taille')
  lines.push('  if ajustement-auto and h > size.height and h > 0pt {')
  lines.push('    t = taille * calc.sqrt(size.height / h)')
  lines.push('    let passes = 0')
  lines.push('    while hauteur(t) > size.height and passes < 8 {')
  lines.push('      t = t * 0.95')
  lines.push('      passes = passes + 1')
  lines.push('    }')
  lines.push('  }')
  lines.push('  text(size: t, corps)')
  lines.push('})')
  lines.push('// une diapositive : le contenu occupe toute la page, le numéro')
  lines.push('// et le titre restent discrets dans les coins')
  lines.push(
    '#let diapo(num, corps, taille: 1, alignement: "center", correction: false) = box(',
  )
  lines.push('  width: 100%, height: 100%,')
  lines.push(')[')
  lines.push('  // repère des boutons de l’aperçu, au coin haut-droit')
  lines.push(
    '  #place(top + right, mathalea-anchor(if correction { "diapo-correction" } else { "diapo-question" }, num))',
  )
  lines.push('  // le numéro cède le coin haut-gauche au titre s’il s’y trouve')
  lines.push(
    '  #let numero-en-haut = not (titre-en-haut and titre-position == "top-left")',
  )
  lines.push('  #if numeroter {')
  lines.push(
    '    place((if numero-en-haut { top } else { bottom }) + left, text(size: taille-numero, fill: gray,',
  )
  lines.push(
    '      if correction and etiquette-correction { "Correction " + str(num) } else { str(num) }))',
  )
  lines.push('  }')
  lines.push(
    '  // titre ancré en haut ; ancré en bas, il est dans le pied de page',
  )
  lines.push('  #if titre-en-haut {')
  lines.push('    place(')
  lines.push('      top + (if titre-position.ends-with("left") { left }')
  lines.push('        else if titre-position.ends-with("right") { right }')
  lines.push('        else { center }),')
  lines.push('      text(size: titre-taille, fill: titre-couleur, titre))')
  lines.push('  }')
  lines.push(
    '  #let taille-texte = (if correction { taille-corrections } else { taille-questions }) * taille',
  )
  lines.push(
    '  // numéro et titre sont posés en `place` : ils ne prennent pas de',
  )
  lines.push(
    '  // place dans le flux, on leur réserve donc un bandeau pour que le',
  )
  lines.push(
    '  // contenu ne passe pas dessous (l’ajustement automatique tient',
  )
  lines.push('  // compte de la hauteur restante)')
  lines.push('  #let bandeau(en-haut) = calc.max(')
  lines.push(
    '    if numeroter and numero-en-haut == en-haut { taille-numero * 1.6 } else { 0pt },',
  )
  lines.push(
    '    if titre-en-haut and en-haut { titre-taille * 1.6 } else { 0pt })',
  )
  // `block` (et non `pad`) : sa hauteur reste celle de la page, sans quoi
  // l'alignement vertical du contenu n'aurait plus rien à centrer
  lines.push('  #block(width: 100%, height: 100%,')
  lines.push('    inset: (top: bandeau(true), bottom: bandeau(false)),')
  lines.push('    align(aligne(alignement), ajuster(corps, taille-texte)))')
  lines.push(']')
  if (usesMultivue) {
    lines.push(
      '// variante « multivue » : plusieurs versions différentes de la',
    )
    lines.push('// même question côte à côte, en colonnes de largeur égale')
    lines.push(
      '#let diapo-multi(num, corps-liste, taille: 1, alignement: "center", correction: false) = box(',
    )
    lines.push('  width: 100%, height: 100%,')
    lines.push(')[')
    lines.push(
      '  #place(top + right, mathalea-anchor(if correction { "diapo-correction" } else { "diapo-question" }, num))',
    )
    lines.push(
      '  #let numero-en-haut = not (titre-en-haut and titre-position == "top-left")',
    )
    lines.push('  #if numeroter {')
    lines.push(
      '    place((if numero-en-haut { top } else { bottom }) + left, text(size: taille-numero, fill: gray,',
    )
    lines.push(
      '      if correction and etiquette-correction { "Correction " + str(num) } else { str(num) }))',
    )
    lines.push('  }')
    lines.push('  #if titre-en-haut {')
    lines.push('    place(')
    lines.push('      top + (if titre-position.ends-with("left") { left }')
    lines.push('        else if titre-position.ends-with("right") { right }')
    lines.push('        else { center }),')
    lines.push('      text(size: titre-taille, fill: titre-couleur, titre))')
    lines.push('  }')
    lines.push(
      '  #let taille-texte = (if correction { taille-corrections } else { taille-questions }) * taille',
    )
    lines.push('  #let bandeau(en-haut) = calc.max(')
    lines.push(
      '    if numeroter and numero-en-haut == en-haut { taille-numero * 1.6 } else { 0pt },',
    )
    lines.push(
      '    if titre-en-haut and en-haut { titre-taille * 1.6 } else { 0pt })',
    )
    lines.push('  #block(width: 100%, height: 100%,')
    lines.push('    inset: (top: bandeau(true), bottom: bandeau(false)),')
    // rows: (1fr,) : la ligne occupe toute la hauteur restante, sans quoi
    // chaque cellule ne mesurerait que la hauteur de son contenu et
    // l'alignement vertical n'aurait rien à centrer/monter/descendre
    lines.push(
      '    grid(columns: (1fr,) * corps-liste.len(), rows: (1fr,), gutter: 16pt,',
    )
    lines.push(
      '      ..corps-liste.map(corps => align(aligne(alignement), ajuster(corps, taille-texte)))))',
    )
    lines.push(']')
  }
  lines.push('// la page de garde n’a ni numéro ni titre : son contenu, libre,')
  lines.push('// occupe toute la page (crayon de l’aperçu pour l’éditer)')
  lines.push('#let garde(corps) = box(width: 100%, height: 100%)[')
  lines.push('  #place(top + right, mathalea-anchor("diapo-garde", 0))')
  lines.push('  #block(width: 100%, height: 100%,')
  lines.push('    align(center + horizon, ajuster(corps, taille-questions)))')
  lines.push(']')
  if (options.recapQuestions || options.recapAnswers) {
    lines.push(
      '// les récapitulatifs de fin de document ne sont pas des diapositives :',
      '// leur contenu, en petit, s’enchaîne sur autant de pages ordinaires',
      '// qu’il en faut. Une grille (plutôt que `columns`) répartit les',
      '// questions de gauche à droite : elles s’équilibrent alors entre les',
      '// colonnes même quand elles ne remplissent pas la page.',
      '#let recap(titre, items) = {',
      '  set text(size: recap-taille)',
      '  if titre.trim() != "" {',
      '    block(below: 1.6em, text(size: recap-taille * 1.4, weight: "bold", titre))',
      '  }',
      '  grid(columns: (1fr,) * recap-colonnes,',
      '    column-gutter: 1.5em, row-gutter: 0.9em,',
      '    ..items.map(((num, corps)) => [',
      '      #text(fill: gray, weight: "bold")[#num.] #corps',
      '    ]))',
      '}',
    )
    if (options.recapAnswers) {
      lines.push(
        '// une ligne du récapitulatif des réponses : la question, puis sa',
        '// réponse (correction réduite à ce qui est mis en évidence)',
        '#let recap-question-reponse(question, reponse) = [',
        '  #question #h(0.4em) #text(fill: gray)[#sym.arrow] #h(0.4em) #reponse',
        ']',
      )
    }
  }
  lines.push('')
  lines.push('// ----- Page de garde -----')
  lines.push('// titre et sous-titre se règlent au crayon, sur l’aperçu')
  lines.push('#let page-de-garde = [')
  lines.push('  #text(size: 1.6em, weight: "bold")[#garde-titre]')
  lines.push('  #if garde-sous-titre.trim() != "" {')
  lines.push('    v(0.5em)')
  lines.push('    text(size: 0.6em, fill: gray)[#garde-sous-titre]')
  lines.push('  }')
  lines.push(']')
  lines.push('')
  lines.push(...slideLines)
  lines.push('')

  // corps du document : une page par diapositive, dans l'ordre choisi
  const page = (num: number, side: 'question' | 'correction') => {
    const slide = converted[num - 1]
    const extraVersions = slide?.extraVersions ?? []
    if (extraVersions.length > 0) {
      const bodies = [
        `diapo-${num}-${side}`,
        ...extraVersions.map(
          (_, index) => `diapo-${num}-${side}-v${index + 2}`,
        ),
      ]
      const args = [
        `${num}`,
        `(${bodies.join(', ')})`,
        `taille: diapo-${num}-${side}-taille`,
        `alignement: diapo-${num}-${side}-align`,
      ]
      if (side === 'correction') args.push('correction: true')
      return `#diapo-multi(${args.join(', ')})`
    }
    const args = [
      `${num}`,
      `diapo-${num}-${side}`,
      `taille: diapo-${num}-${side}-taille`,
      `alignement: diapo-${num}-${side}-align`,
    ]
    if (side === 'correction') args.push('correction: true')
    return `#diapo(${args.join(', ')})`
  }

  const pages: { num: number; side: 'question' | 'correction' }[] = []
  switch (options.content) {
    case 'corrections':
      for (const num of order) pages.push({ num, side: 'correction' })
      break
    case 'alternees':
      for (const num of order) {
        pages.push({ num, side: 'question' })
        pages.push({ num, side: 'correction' })
      }
      break
    case 'questions-corrections':
      for (const num of order) pages.push({ num, side: 'question' })
      for (const num of order) pages.push({ num, side: 'correction' })
      break
    case 'toutes-questions-puis-alternees':
      // toutes les questions une première fois, puis chaque question
      // suivie de sa correction (la question réapparaît donc deux fois)
      for (const num of order) pages.push({ num, side: 'question' })
      for (const num of order) {
        pages.push({ num, side: 'question' })
        pages.push({ num, side: 'correction' })
      }
      break
    case 'questions':
    default:
      for (const num of order) pages.push({ num, side: 'question' })
      break
  }

  lines.push('// ----- Diapositives -----')
  // le diaporama s'ouvre toujours sur sa page de garde
  lines.push('#garde(page-de-garde)')
  for (const { num, side } of pages) {
    lines.push('#pagebreak()')
    lines.push(
      `// Diapositive ${num} — ${side === 'correction' ? 'correction' : 'question'}`,
    )
    lines.push(page(num, side))
  }

  // récapitulatifs, à la fin du document : les questions visibles dans
  // l'ordre des diapositives, sur autant de pages que nécessaire
  if (options.recapQuestions) {
    lines.push('')
    lines.push('// ----- Récapitulatif des questions -----')
    lines.push('#pagebreak()')
    lines.push('#recap(recap-titre-questions, (')
    for (const num of order) lines.push(`  (${num}, diapo-${num}-question),`)
    lines.push('))')
  }
  if (options.recapAnswers) {
    lines.push('')
    lines.push(
      '// ----- Récapitulatif des questions et de leurs réponses -----',
    )
    lines.push('#pagebreak()')
    lines.push('#recap(recap-titre-reponses, (')
    for (const num of order) {
      lines.push(
        `  (${num}, recap-question-reponse(diapo-${num}-question, recap-${num}-reponse)),`,
      )
    }
    lines.push('))')
  }
  lines.push('')

  return lines.join('\n')
}
