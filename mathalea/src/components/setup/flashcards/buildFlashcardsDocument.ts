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

/**
 * Construction du document Typst des flash-cards : une carte par question,
 * avec la question au recto et la réponse au verso. Pensé pour les exercices
 * de course aux nombres. Les planches de rectos et de versos alternent, les
 * versos en miroir horizontal : imprimé en recto-verso (retournement sur les
 * bords longs), chaque réponse tombe au dos de sa question.
 */

/** Contenu d'une carte, au format HTML de MathALÉA (formules en `$...$`) */
export interface FlashcardInput {
  /** Question (recto) */
  front: string
  /** Réponse (verso) */
  back: string
}

export interface FlashcardsDocumentOptions {
  /** Titre du document (sert au nom du fichier exporté) */
  title: string
  /** Police du texte (nom d'une police libre embarquée dans le compilateur) */
  font: string
  /** Police des formules mathématiques */
  mathFont: string
  /** Taille du texte des questions (recto) en points */
  questionFontSize: number
  /** Taille du texte des réponses (verso) en points */
  answerFontSize: number
  /**
   * Interligne du texte des cartes, en `em` (valeur passée à
   * `par(leading)`). Le défaut Typst est `0.65em` ; l'augmenter aère les
   * énoncés à plusieurs lignes.
   */
  lineSpacing: number
  /** Nombre de cartes par ligne */
  columns: number
  /** Nombre de lignes de cartes par page */
  rows: number
  /**
   * Épaisseur des traits de découpe entre les cartes, en points. Un trait
   * fin (0,4 pt) disparaît à la photocopie ; l'augmenter le rend visible.
   */
  separatorThickness: number
  /** Numérote les cartes (coin) : pour réapparier recto et verso après découpe */
  showNumbers: boolean
  /** Premier numéro affiché sur les deux faces des cartes */
  startNumber: number
  pageFormat: 'a4' | 'a5'
  orientation: 'portrait' | 'landscape'
  /** Texte affiché en bas de chaque recto (ex. titre du thème) */
  frontTitle: string
  /** Texte affiché en bas de chaque verso */
  backTitle: string
  /** Point d'ancrage du titre sur la carte, commun aux deux faces */
  titlePosition:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  /** Taille du titre en points, commune aux deux faces */
  titleSize: number
  /** Couleur du titre (hexadécimal), commune aux deux faces */
  titleColor: string
  /** Opacité du titre (0 à 1), commune aux deux faces */
  titleOpacity: number
}

export const defaultFlashcardsDocumentOptions: FlashcardsDocumentOptions = {
  title: 'Flash-cards',
  font: 'Libertinus Serif',
  mathFont: 'Libertinus Math',
  questionFontSize: 14,
  answerFontSize: 14,
  lineSpacing: 0.65,
  columns: 2,
  rows: 4,
  separatorThickness: 1,
  showNumbers: true,
  startNumber: 1,
  pageFormat: 'a4',
  orientation: 'portrait',
  frontTitle: '',
  backTitle: '',
  titlePosition: 'bottom-center',
  titleSize: 9,
  titleColor: '#6b7280',
  titleOpacity: 1,
}

/**
 * Réglages de la palette de l'aperçu à réémettre lors d'une régénération
 * (comme le `TypstCarryOver` de la fiche) : ils sont relus dans le code
 * courant par `harvestFlashcardsCarryOver` pour survivre à un changement de
 * réglages ou à de nouvelles données.
 */
export interface FlashcardsCarryOver {
  /**
   * Facteur de taille du texte d'une face de carte (boutons +/− de
   * l'aperçu), par clef `<num>-recto` ou `<num>-verso` (num 1-based).
   */
  cardScales?: Record<string, number>
  /**
   * Zoom de chaque figure embarquée (boutons +/− de l'aperçu, comme dans la
   * vue Typst), par numéro de figure (`fig-N`, 1-based).
   */
  figureZooms?: Record<number, number>
}

/**
 * Relit dans le code les réglages de la palette de l'aperçu à réémettre lors
 * d'une régénération : facteurs de taille carte par carte et zoom des figures.
 */
export function harvestFlashcardsCarryOver(code: string): FlashcardsCarryOver {
  const cardScales: Record<string, number> = {}
  for (const match of code.matchAll(
    /^#let carte-(\d+)-(recto|verso)-taille = ([\d.]+)/gm,
  )) {
    const value = Number(match[3])
    if (Number.isFinite(value) && value !== 1) {
      cardScales[`${match[1]}-${match[2]}`] = value
    }
  }
  const figureZooms: Record<number, number> = {}
  for (const match of code.matchAll(/^#let fig-(\d+)-zoom = ([\d.]+)/gm)) {
    const value = Number(match[2])
    if (Number.isFinite(value) && value !== 1) {
      figureZooms[Number(match[1])] = value
    }
  }
  const carryOver: FlashcardsCarryOver = {}
  if (Object.keys(cardScales).length > 0) carryOver.cardScales = cardScales
  if (Object.keys(figureZooms).length > 0) carryOver.figureZooms = figureZooms
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

/** Indente un contenu multi-ligne pour l'insérer dans un bloc `[...]` */
function indent(content: string): string {
  return content
    .split('\n')
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join('\n')
}

/**
 * Génère le code Typst complet des flash-cards. Comme pour la fiche
 * (`buildTypstDocument`), le préambule expose des variables réglables
 * directement dans le code (`cartes-par-ligne`, `taille-texte`...).
 */
export function buildFlashcardsDocument(
  cards: FlashcardInput[],
  options: FlashcardsDocumentOptions = defaultFlashcardsDocumentOptions,
  carryOver: FlashcardsCarryOver = {},
): string {
  // figures SVG rencontrées pendant la conversion, déclarées en tête de
  // document (#let fig-N = image(...)) comme dans buildTypstDocument
  const figures: string[] = []
  const converted = cards.map((card) => ({
    front: htmlToTypst(card.front, figures),
    back: htmlToTypst(card.back, figures),
  }))

  const cardLines: string[] = []
  for (const [index, card] of converted.entries()) {
    const num = index + 1
    cardLines.push(`// ----- Carte ${num} -----`)
    cardLines.push(`#let carte-${num}-recto = [`)
    cardLines.push(indent(card.front))
    cardLines.push(']')
    cardLines.push(`#let carte-${num}-verso = [`)
    cardLines.push(indent(card.back))
    cardLines.push(']')
    // facteur de taille du texte de chaque face, réglable par les boutons
    // +/− de l'aperçu (repris du code courant à la régénération)
    cardLines.push(
      `#let carte-${num}-recto-taille = ${carryOver.cardScales?.[`${num}-recto`] ?? 1}`,
    )
    cardLines.push(
      `#let carte-${num}-verso-taille = ${carryOver.cardScales?.[`${num}-verso`] ?? 1}`,
    )
  }

  const allBodies = converted
    .flatMap((card) => [card.front, card.back])
    .join('\n')
  const usesMathaleaFigure = allBodies.includes('mathalea-figure(')
  const usesSchema = allBodies.includes('mathalea-schema-span')
  const usesQcm = allBodies.includes('qcm-')
  const usesTasks = allBodies.includes('#tasks(')

  const lines: string[] = []
  lines.push('// Flash-cards générées par MathALÉA — https://coopmaths.fr/alea')
  lines.push('// Recto : les questions ; verso : les réponses, en miroir.')
  lines.push('// Imprimer en recto-verso (retournement sur les bords longs)')
  lines.push('// puis découper : chaque réponse est au dos de sa question.')
  lines.push('')
  lines.push('// ----- Paquets -----')
  // breather : écarte les lignes aux maths hautes (fractions « display »,
  // matrices…) juste ce qu'il faut, pour qu'un numérateur ne recouvre pas
  // le dénominateur de la ligne précédente
  lines.push(BREATHER_IMPORT)
  if (usesTasks) {
    lines.push(TASKIZE_IMPORT)
    lines.push(MATHALEA_TASKS_HELPER)
  }
  lines.push('')
  // chaque carte publie un repère (boutons +/− de taille sur l'aperçu) ;
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
  lines.push(`#let cartes-par-ligne = ${options.columns}`)
  lines.push(`#let lignes-par-page = ${options.rows}`)
  lines.push(
    `#let numeroter = ${options.showNumbers} // numéro au coin de chaque carte`,
  )
  const startNumber = Number.isFinite(options.startNumber)
    ? Math.max(1, Math.trunc(options.startNumber))
    : 1
  lines.push(`#let premier-numero = ${startNumber}`)
  lines.push(`#let police-texte = ${typstString(options.font)}`)
  lines.push(`#let police-maths = ${typstString(options.mathFont)}`)
  lines.push(`#let taille-questions = ${options.questionFontSize}pt`)
  lines.push(`#let taille-reponses = ${options.answerFontSize}pt`)
  lines.push(
    `#let interligne = ${options.lineSpacing}em // espacement des lignes du texte`,
  )
  lines.push(
    `#let epaisseur-traits = ${options.separatorThickness}pt // traits de découpe entre les cartes`,
  )
  lines.push(`#let titre-recto = ${typstString(options.frontTitle)}`)
  lines.push(`#let titre-verso = ${typstString(options.backTitle)}`)
  lines.push(`#let titre-position = ${typstString(options.titlePosition)}`)
  lines.push(`#let titre-taille = ${options.titleSize}pt`)
  lines.push(
    `#let titre-couleur = ${typstColorWithOpacity(options.titleColor, options.titleOpacity)}`,
  )
  if (usesQcm) {
    lines.push('#let couleur = black // couleur des bonnes réponses de QCM')
    lines.push('#let qcm-colonnes = 2 // colonnes des propositions de QCM')
  }
  lines.push('')
  lines.push(
    `#set page(paper: "${options.pageFormat}", flipped: ${options.orientation === 'landscape'}, margin: (x: 10mm, y: 10mm))`,
  )
  lines.push(
    '#set text(font: police-texte, size: taille-questions, lang: "fr")',
  )
  lines.push('#set par(leading: interligne)')
  lines.push(
    '// police des formules ; le texte inséré garde la police du texte',
  )
  lines.push('#show math.equation: set text(font: police-maths)')
  lines.push('#let txt(corps) = text(font: police-texte, corps)')
  lines.push(MATHALEA_INLINE_FORMULA_RULE)
  lines.push('// les fractions gardent leur taille normale au milieu du texte')
  lines.push('#show math.frac: it => math.display(it)')
  lines.push('// espaces verticaux automatiques : une ligne aux maths hautes')
  lines.push("// (fraction « display »…) s'écarte de la précédente juste ce")
  lines.push("// qu'il faut (paquet breather)")
  lines.push(BREATHER_CALL)
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
      // zoom réglable par les boutons +/− de l'aperçu (repris du code
      // courant à la régénération, voir harvestFlashcardsCarryOver)
      lines.push(
        `#let fig-${figNum}-zoom = ${carryOver.figureZooms?.[figNum] ?? 1}`,
      )
      lines.push(`#let fig-${figNum}-align = center`)
    }
    lines.push('')
  }
  lines.push('// ----- Habillage des cartes -----')
  lines.push('// une carte : contenu centré, numéro au coin (côté opposé au')
  lines.push(
    '// verso pour rester au même endroit une fois la carte retournée),',
  )
  lines.push(
    '// taille du texte de la face (taille de base × facteur de la carte)',
  )
  lines.push('#let carte(num, corps, taille: 1, verso: false) = box(')
  lines.push('  width: 100%, height: 100%, inset: 4mm, clip: true,')
  lines.push(')[')
  lines.push(
    '  // repère des boutons +/− de l’aperçu, au coin opposé au numéro',
  )
  lines.push('  #if num != none {')
  lines.push('    place(top + if verso { left } else { right },')
  lines.push(
    '      mathalea-anchor(if verso { "carte-verso" } else { "carte-recto" }, num))',
  )
  lines.push('  }')
  lines.push('  #if numeroter and num != none {')
  lines.push('    place(if verso { top + right } else { top + left },')
  lines.push('      text(size: 0.55em, fill: gray, str(num + premier-numero - 1)))')
  lines.push('  }')
  lines.push(
    '  #set text(size: (if verso { taille-reponses } else { taille-questions }) * taille)',
  )
  lines.push('  #align(center + horizon, corps)')
  lines.push(
    '  // titre ancré à un coin de la carte (recto/verso), commun à toutes les cartes',
  )
  lines.push('  #let titre = if verso { titre-verso } else { titre-recto }')
  lines.push('  #if titre.trim() != "" {')
  lines.push('    place(')
  lines.push(
    '      (if titre-position.starts-with("top") { top } else { bottom })',
  )
  lines.push('      + (if titre-position.ends-with("left") { left }')
  lines.push('        else if titre-position.ends-with("right") { right }')
  lines.push('        else { center }),')
  lines.push('      text(size: titre-taille, fill: titre-couleur, titre))')
  lines.push('  }')
  lines.push(']')
  lines.push('// une planche : la grille des cartes, traits de découpe en')
  lines.push('// pointillés (les pistes fractionnées remplissent la page)')
  lines.push('#let planche(..cellules) = grid(')
  lines.push('  columns: (1fr,) * cartes-par-ligne,')
  lines.push('  rows: (1fr,) * lignes-par-page,')
  // gris foncé + épaisseur réglable : restent visibles après photocopie
  lines.push(
    '  stroke: (thickness: epaisseur-traits, paint: luma(40%), dash: "dashed"),',
  )
  lines.push('  ..cellules,')
  lines.push(')')
  lines.push('')
  lines.push(...cardLines)
  lines.push('')

  // planches : les cartes par groupes d'une page ; le verso reprend chaque
  // ligne en ordre inverse (miroir horizontal) pour l'impression recto-verso
  const perPage = Math.max(1, options.columns * options.rows)
  const sheets = Math.max(1, Math.ceil(converted.length / perPage))
  for (let sheet = 0; sheet < sheets; sheet++) {
    if (sheet > 0) lines.push('#pagebreak()')
    const cardNum = (row: number, column: number) =>
      sheet * perPage + row * options.columns + column + 1
    const cell = (num: number, side: 'recto' | 'verso') =>
      num <= converted.length
        ? `  carte(${num}, carte-${num}-${side}, taille: carte-${num}-${side}-taille${side === 'verso' ? ', verso: true' : ''}),`
        : '  carte(none, []),'
    lines.push(`// ----- Planche ${sheet + 1} : questions -----`)
    lines.push('#planche(')
    for (let row = 0; row < options.rows; row++) {
      for (let column = 0; column < options.columns; column++) {
        lines.push(cell(cardNum(row, column), 'recto'))
      }
    }
    lines.push(')')
    lines.push('#pagebreak()')
    lines.push(
      `// ----- Planche ${sheet + 1} : réponses (colonnes en miroir) -----`,
    )
    lines.push('#planche(')
    for (let row = 0; row < options.rows; row++) {
      for (let column = options.columns - 1; column >= 0; column--) {
        lines.push(cell(cardNum(row, column), 'verso'))
      }
    }
    lines.push(')')
  }
  lines.push('')

  return lines.join('\n')
}
