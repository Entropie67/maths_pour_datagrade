import {
  BREATHER_CALL,
  BREATHER_IMPORT,
  MATHALEA_ANCHOR_HELPER,
  MATHALEA_INLINE_FORMULA_RULE,
  type TypstExerciseInput,
} from './buildTypstDocument'
import {
  MATHALEA_FIGURE_BLOCK_HELPER,
  MATHALEA_FIGURE_HELPERS,
  MATHALEA_FIT_HELPER,
  MATHALEA_QCM_HELPERS,
  MATHALEA_SCHEMA_HELPER,
  MATHALEA_TASKS_HELPER,
  TASKIZE_IMPORT,
  htmlToTypst,
} from './latexToTypst'
import { minimalCorrection } from './minimalCorrection'

/** Chemin du verso dans le fichier `.typ` et dans le système virtuel. */
export const I_HAVE_WHO_HAS_BACK_IMAGE = 'versoGKiA.jpg'
export const I_HAVE_WHO_HAS_BACK_IMAGE_VIRTUAL_PATH = `/${I_HAVE_WHO_HAS_BACK_IMAGE}`

export interface IHaveWhoHasCarryOver {
  cardScales?: Record<number, number>
  cardCodes?: Record<number, string>
}

/** Relit les zooms carte par carte dans le code Typst éditable. */
export function harvestIHaveWhoHasCarryOver(
  code: string,
): IHaveWhoHasCarryOver {
  const cardScales: Record<number, number> = {}
  const cardCodes: Record<number, string> = {}
  for (const match of code.matchAll(/^#let carte-(\d+)-taille = ([\d.]+)/gm)) {
    const value = Number(match[2])
    if (Number.isFinite(value) && value !== 1) {
      cardScales[Number(match[1])] = value
    }
  }
  for (const match of code.matchAll(/^#let code-carte-(\d+) = "([A-Z]\d)"/gm)) {
    cardCodes[Number(match[1])] = match[2]
  }
  const carryOver: IHaveWhoHasCarryOver = {}
  if (Object.keys(cardScales).length > 0) carryOver.cardScales = cardScales
  if (Object.keys(cardCodes).length > 0) carryOver.cardCodes = cardCodes
  return carryOver
}

export interface IHaveWhoHasCard {
  answer: string
  question: string
}

/**
 * Identifiant court et reproductible d'un tirage. Les graines sont préférées
 * au contenu généré afin qu'un même tirage garde son identifiant lorsque la
 * mise en page ou le titre change.
 */
export function iHaveWhoHasSeriesId(parts: readonly string[]): string {
  let hash = 0x811c9dc5
  for (const character of parts.join('\u001f')) {
    hash ^= character.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193)
  }
  const value = (hash >>> 0) % (26 * 26)
  return `${String.fromCharCode(65 + Math.floor(value / 26))}${String.fromCharCode(97 + (value % 26))}`
}

/**
 * Retire une lettre majuscule servant uniquement à repérer les questions
 * d'une série (`$A=…$`, `$B = …$` ou `A = $…$`). Ces repères révèlent sinon
 * immédiatement l'ordre de la chaîne aux élèves.
 */
export function removeQuestionIndex(question: string): string {
  return question
    .replace(/^(\s*\$)\s*[A-Z]\s*=\s*/u, '$1')
    .replace(/^(\s*)[A-Z]\s*=\s*/u, '$1')
}

/**
 * Retire le signe égal final utilisé comme blanc de réponse dans certains
 * calculs (`$20\\times70=$`). Une égalité complète telle que `$x=2$` ne
 * correspond pas au motif et reste intacte.
 */
export function removeTrailingCompletionEquals(question: string): string {
  return question.replace(/=\s*\$(\s*)$/u, '$$$1')
}

/** Ajoute une seule ponctuation finale, après une éventuelle formule. */
function withFinalPunctuation(text: string, punctuation: '.' | '?'): string {
  const withoutTrailingBreaks = text.trim().replace(/(?:<br\s*\/?>\s*)+$/gi, '')
  const escaped = punctuation === '?' ? '\\?' : '\\.'
  const content = withoutTrailingBreaks.replace(
    new RegExp(`(?:&nbsp;|\\s)*${escaped}\\s*$`),
    '',
  )
  return punctuation === '?' ? `${content}&nbsp;?` : `${content}.`
}

export interface IHaveWhoHasDocumentOptions {
  title: string
  font: string
  mathFont: string
  pageFormat: 'a4' | 'a5'
  orientation: 'portrait' | 'landscape'
  columns: number
  rows: number
  questionFontSize: number
  answerFontSize: number
  lineSpacing: number
  separatorThickness: number
  showNumbers: boolean
}

export const defaultIHaveWhoHasDocumentOptions: IHaveWhoHasDocumentOptions = {
  title: 'J’ai qui a',
  font: 'Libertinus Serif',
  mathFont: 'Libertinus Math',
  pageFormat: 'a4',
  orientation: 'landscape',
  columns: 2,
  rows: 4,
  questionFontSize: 15,
  answerFontSize: 15,
  lineSpacing: 0.7,
  separatorThickness: 0.8,
  showNumbers: false,
}

/**
 * Aplatit les questions de la fiche et ferme la chaîne : la carte i porte la
 * réponse i et l'énoncé i + 1 ; la dernière revient à la première question.
 */
export function buildIHaveWhoHasCards(
  exercises: TypstExerciseInput[],
): IHaveWhoHasCard[] {
  const pairs = exercises.flatMap((exercise) =>
    exercise.questions.flatMap((question, index) => {
      const correction = exercise.corrections[index]
      return question.trim() !== '' && correction?.trim()
        ? [
            {
              question: withFinalPunctuation(
                removeTrailingCompletionEquals(removeQuestionIndex(question)),
                '?',
              ),
              answer: withFinalPunctuation(
                minimalCorrection(correction, exercise.shortAnswers?.[index]),
                '.',
              ),
            },
          ]
        : []
    }),
  )
  return pairs.map((pair, index) => ({
    answer: pair.answer,
    question: pairs[(index + 1) % pairs.length]?.question ?? pair.question,
  }))
}

/**
 * Clef de comparaison d'une réponse minimale. Les deux balisages orange
 * reconnus par `minimalCorrection` sont retirés afin que « 19 » soit détecté
 * comme doublon quelle que soit la façon dont l'exercice le met en évidence.
 */
export function minimalAnswerKey(correction: string, shortAnswer?: string | null): string {
  return minimalCorrection(correction, shortAnswer)
    .replace(/<[^>]+>/g, '')
    .replace(/\\color\{#[0-9a-f]{6}\}/gi, '')
    .replace(/\\boldsymbol\{([^{}]*)\}/g, '$1')
    .replace(/[{}$]/g, '')
    .replace(/(?:&nbsp;|&emsp;|\s)+/gi, '')
    .trim()
    .toLocaleLowerCase('fr')
}

/** Réponses minimales apparaissant plusieurs fois dans la fiche. */
export function duplicateMinimalAnswers(
  exercises: TypstExerciseInput[],
): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const exercise of exercises) {
    for (const [index, correction] of exercise.corrections.entries()) {
      if (exercise.questions[index]?.trim() === '') continue
      if (correction.trim() === '') continue
      const key = minimalAnswerKey(correction, exercise.shortAnswers?.[index])
      if (seen.has(key)) duplicates.add(key)
      else seen.add(key)
    }
  }
  return [...duplicates]
}

function typstString(text: string): string {
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function indent(content: string): string {
  return content
    .split('\n')
    .map((line) => (line.length > 0 ? `    ${line}` : line))
    .join('\n')
}

function makeCardCodes(count: number, preserved: Record<number, string> = {}) {
  const candidates = Array.from({ length: 26 }, (_, letter) =>
    Array.from(
      { length: 10 },
      (_, digit) => `${String.fromCharCode(65 + letter)}${digit}`,
    ),
  ).flat()
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  const used = new Set(Object.values(preserved))
  const available = candidates.filter((code) => !used.has(code))
  return Array.from(
    { length: count },
    (_, index) => preserved[index + 1] ?? available.shift() ?? `X${index % 10}`,
  )
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Position verticale du titre dans le verso. L'image est affichée avec
 * `fit: "contain"` : sa hauteur relative varie donc avec le ratio des cartes.
 * Ce calcul suit la zone blanche située entre « Qui a… ? » et le logo dans le
 * JPG, au lieu de placer le titre à une hauteur fixe dans la carte.
 */
function backTitleOffsetPercent(options: IHaveWhoHasDocumentOptions): number {
  const pageDimensions =
    options.pageFormat === 'a4'
      ? { width: 210, height: 297 }
      : { width: 148, height: 210 }
  const pageWidth =
    options.orientation === 'landscape'
      ? pageDimensions.height
      : pageDimensions.width
  const pageHeight =
    options.orientation === 'landscape'
      ? pageDimensions.width
      : pageDimensions.height
  // Le verso possède un inset de 3 mm sur chacun de ses quatre côtés.
  const cardWidth =
    (pageWidth - 20) / Math.max(1, options.columns) - 6
  const cardHeight =
    (pageHeight - 20) / Math.max(1, options.rows) - 6
  const imageRatio = 1200 / 628
  const renderedImageHeight = Math.min(cardHeight, cardWidth / imageRatio)
  const imageTop = (cardHeight - renderedImageHeight) / 2
  const titleY = imageTop + renderedImageHeight * 0.69
  return Math.round((1 - titleY / cardHeight) * 1000) / 10
}

interface PolygonPoint {
  x: number
  y: number
}

function polygonVertices(sides: number, radius: number): PolygonPoint[] {
  const center = 300
  const count = Math.max(3, sides)
  // Le décalage d'un demi-secteur place la médiatrice d'un côté à droite,
  // exactement dans l'axe de la fenêtre de lecture.
  return Array.from({ length: count }, (_, index) => {
    const angle = ((index + 0.5) * 2 * Math.PI) / count
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  })
}

function polygonPoints(sides: number, radius: number): string {
  return polygonVertices(sides, radius)
    .map(({ x, y }) => `${x},${y}`)
    .join(' ')
}

function polygonCodeRadius(sides: number, radius: number): number {
  const count = Math.max(3, sides)
  const apothem = radius * Math.cos(Math.PI / count)
  // Garde la fenêtre entière à l'intérieur du côté qui lui fait face.
  return Math.min(205, apothem - 50)
}

/** Encoche tournée et dimensionnée d'après le côté le plus bas du polygone. */
function polygonNotch(sides: number, radius: number): string {
  const vertices = polygonVertices(sides, radius)
  const edges = vertices.map((start, index) => {
    const end = vertices[(index + 1) % vertices.length]
    return {
      start,
      end,
      middle: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
    }
  })
  const edge = edges.reduce((lowest, candidate) =>
    candidate.middle.y > lowest.middle.y ? candidate : lowest,
  )
  const edgeLength = Math.hypot(
    edge.end.x - edge.start.x,
    edge.end.y - edge.start.y,
  )
  const width = Math.min(150, edgeLength * 0.72)
  const height = Math.min(65, width * 0.42)
  const rotation =
    (Math.atan2(edge.end.y - edge.start.y, edge.end.x - edge.start.x) * 180) /
    Math.PI
  return `<path d="M ${-width / 2} 0 C ${-width / 2} ${height} ${width / 2} ${height} ${width / 2} 0 Z" transform="translate(${edge.middle.x} ${edge.middle.y}) rotate(${rotation})" fill="white" stroke="black" stroke-width="3" stroke-dasharray="8 5"/>`
}

/** Polygone arrière : les codes suivent le cycle des cartes. */
function solutionPolygonSvg(codes: string[]): string {
  const center = 300
  const radius = 280
  const count = Math.max(1, codes.length)
  const labelRadius = polygonCodeRadius(count, radius)
  const parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">',
    '<rect width="100%" height="100%" fill="white"/>',
    `<polygon points="${polygonPoints(count, radius)}" fill="white" stroke="black" stroke-width="3"/>`,
  ]
  for (let index = 0; index < count; index++) {
    // Les codes progressent dans le sens trigonométrique : une rotation
    // physique horaire d'un cran amène donc le code suivant à droite.
    const angle = (-index * 2 * Math.PI) / count
    const x = center + labelRadius * Math.cos(angle)
    const y = center + labelRadius * Math.sin(angle)
    const rotation = (angle * 180) / Math.PI
    parts.push(
      `<text x="${x}" y="${y}" transform="rotate(${rotation} ${x} ${y})" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="${count > 40 ? 14 : 20}" font-weight="bold">${escapeXml(codes[index])}</text>`,
    )
  }
  parts.push(
    '<circle cx="300" cy="300" r="9" fill="white" stroke="black" stroke-width="2"/>',
    '<text x="300" y="300" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="24" font-weight="bold">Polygone solution</text>',
    '</svg>',
  )
  return parts.join('')
}

/** Polygone supérieur à évider, avec fenêtre de lecture à droite. */
function coverPolygonSvg(seriesLabel: string, codeCount: number): string {
  const labelRadius = polygonCodeRadius(codeCount, 280)
  const verticalGap =
    2 * labelRadius * Math.sin(Math.PI / Math.max(2, codeCount))
  const windowHeight = Math.max(18, Math.min(42, verticalGap * 0.6))
  const windowY = 300 - windowHeight / 2
  const windowX = 300 + labelRadius - 45
  const labelSize =
    seriesLabel.length > 45 ? 20 : seriesLabel.length > 30 ? 24 : 29
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><marker id="fleche" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5 Z" fill="black"/></marker></defs><rect width="100%" height="100%" fill="white"/><polygon points="${polygonPoints(codeCount, 280)}" fill="#f2f2f2" stroke="black" stroke-width="3"/><rect x="${windowX}" y="${windowY}" width="90" height="${windowHeight}" rx="7" fill="white" stroke="black" stroke-width="3" stroke-dasharray="8 5"/><path d="M 171 147 A 200 200 0 0 1 429 147" fill="none" stroke="black" stroke-width="3" marker-end="url(#fleche)"/><text x="300" y="175" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold">Sens de rotation</text>${polygonNotch(codeCount, 280)}<circle cx="300" cy="300" r="9" fill="white" stroke="black" stroke-width="2"/><text x="300" y="230" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="42" font-weight="bold">J’ai… Qui a… ?</text><text x="300" y="430" text-anchor="middle" font-family="sans-serif" font-size="${labelSize}" font-weight="bold">${escapeXml(seriesLabel)}</text></svg>`
}

/** Génère les cartes recto-verso, les roues de décodage et leurs caches. */
export function buildIHaveWhoHasDocument(
  exercises: TypstExerciseInput[],
  options: IHaveWhoHasDocumentOptions = defaultIHaveWhoHasDocumentOptions,
  carryOver: IHaveWhoHasCarryOver = {},
  seriesId = iHaveWhoHasSeriesId(
    exercises.flatMap(({ questions, corrections }) => [
      ...questions,
      ...corrections,
    ]),
  ),
): string {
  const figures: string[] = []
  const cards = buildIHaveWhoHasCards(exercises).map((card) => ({
    answer: htmlToTypst(card.answer, figures),
    question: htmlToTypst(card.question, figures),
  }))
  const codes = makeCardCodes(cards.length, carryOver.cardCodes)
  const seriesLabel = `${options.title} — Série ${seriesId}`
  const backTitleOffset = backTitleOffsetPercent(options)
  const bodies = cards
    .flatMap((card) => [card.answer, card.question])
    .join('\n')
  const lines: string[] = [
    '// « J’ai… qui a… ? » généré par MathALÉA — https://coopmaths.fr/alea',
    '// Recto : chaîne question-réponse ; verso : motif uniforme, en miroir.',
    '',
    BREATHER_IMPORT,
    MATHALEA_ANCHOR_HELPER,
  ]
  if (bodies.includes('#tasks('))
    lines.push(TASKIZE_IMPORT, MATHALEA_TASKS_HELPER)
  if (figures.length > 0)
    lines.push(MATHALEA_FIT_HELPER, MATHALEA_FIGURE_BLOCK_HELPER)
  if (bodies.includes('mathalea-figure(')) lines.push(MATHALEA_FIGURE_HELPERS)
  if (bodies.includes('mathalea-schema-span'))
    lines.push(MATHALEA_SCHEMA_HELPER)
  lines.push(
    '',
    `#let cartes-par-ligne = ${Math.max(1, options.columns)}`,
    `#let lignes-par-page = ${Math.max(1, options.rows)}`,
    `#let numeroter = ${options.showNumbers}`,
    `#let police-texte = ${typstString(options.font)}`,
    `#let police-maths = ${typstString(options.mathFont)}`,
    `#let taille-questions = ${options.questionFontSize}pt`,
    `#let taille-reponses = ${options.answerFontSize}pt`,
    `#let epaisseur-traits = ${options.separatorThickness}pt`,
    `#let titre-serie = ${typstString(seriesLabel)}`,
    `#set page(paper: "${options.pageFormat}", flipped: ${options.orientation === 'landscape'}, margin: (x: 10mm, y: 10mm))`,
    '#set text(font: police-texte, lang: "fr")',
    `#set par(leading: ${options.lineSpacing}em)`,
    '#show math.equation: set text(font: police-maths)',
    '#let txt(corps) = text(font: police-texte, corps)',
    MATHALEA_INLINE_FORMULA_RULE,
    '#show math.frac: it => math.display(it)',
    BREATHER_CALL,
  )
  if (bodies.includes('qcm-')) {
    lines.push(
      '#let couleur = black',
      '#let qcm-colonnes = 2',
      MATHALEA_QCM_HELPERS,
    )
  }
  if (figures.length > 0) {
    lines.push('', '// ----- Figures (SVG embarqués) -----')
    figures.forEach((figure, index) => {
      lines.push(`#let fig-${index + 1} = ${figure}`)
      lines.push(`#let fig-${index + 1}-zoom = 1`)
      lines.push(`#let fig-${index + 1}-align = center`)
    })
  }
  lines.push(
    '',
    '#let carte(num, code, reponse, question, taille: 1) = box(width: 100%, height: 100%, inset: 5mm, clip: true)[',
    '  #place(bottom + right, mathalea-anchor("carte-recto", num))',
    '  #place(top + right, text(size: 11pt, weight: "bold", code))',
    '  #if numeroter { place(bottom + left, text(size: 8pt, fill: gray, str(num))) }',
    '  #grid(rows: (1fr, 1fr), gutter: 3mm,',
    '    align(left + horizon, text(size: taille-reponses * taille)[#strong[J’ai] #reponse]),',
    '    align(left + horizon, text(size: taille-questions * taille)[#strong[Qui a] #question]),',
    '  )',
    ']',
    `#let dos-carte = box(width: 100%, height: 100%, inset: 3mm, clip: true)[`,
    `  #image(${typstString(I_HAVE_WHO_HAS_BACK_IMAGE)}, width: 100%, height: 100%, fit: "contain")`,
    `  #place(left + bottom, dx: 4%, dy: -${backTitleOffset}%, text(size: 11pt, weight: "bold", ${typstString(options.title)}))`,
    `  #place(right + bottom, dx: -4%, dy: -${backTitleOffset}%, text(size: 11pt, weight: "bold", ${typstString(`Série ${seriesId}`)}))`,
    ']',
    '#let planche(..cartes) = grid(',
    '  columns: (1fr,) * cartes-par-ligne,',
    '  rows: (1fr,) * lignes-par-page,',
    '  stroke: (thickness: epaisseur-traits, paint: luma(40%), dash: "dashed"),',
    '  ..cartes,',
    ')',
    '',
  )
  cards.forEach((card, index) => {
    lines.push(
      `#let carte-${index + 1}-taille = ${carryOver.cardScales?.[index + 1] ?? 1}`,
    )
    lines.push(`#let code-carte-${index + 1} = ${typstString(codes[index])}`)
    lines.push(`#let carte-${index + 1}-reponse = [`)
    lines.push(indent(card.answer))
    lines.push(']')
    lines.push(`#let carte-${index + 1}-question = [`)
    lines.push(indent(card.question))
    lines.push(']')
  })
  const perPage = Math.max(1, options.columns * options.rows)
  const pages = Math.max(1, Math.ceil(cards.length / perPage))
  for (let page = 0; page < pages; page++) {
    if (page > 0) lines.push('#pagebreak()')
    lines.push(`// ----- Planche ${page + 1} : rectos -----`)
    lines.push('#planche(')
    for (let offset = 0; offset < perPage; offset++) {
      const num = page * perPage + offset + 1
      lines.push(
        num <= cards.length
          ? `  carte(${num}, code-carte-${num}, carte-${num}-reponse, carte-${num}-question, taille: carte-${num}-taille),`
          : '  carte(0, "", [], []),',
      )
    }
    lines.push(')')
    lines.push('#pagebreak()')
    lines.push(
      `// ----- Planche ${page + 1} : versos (colonnes en miroir) -----`,
    )
    lines.push('#planche(')
    for (let row = 0; row < options.rows; row++) {
      for (let column = options.columns - 1; column >= 0; column--) {
        const num = page * perPage + row * options.columns + column + 1
        lines.push(
          num <= cards.length ? '  dos-carte,' : '  carte(0, "", [], []),',
        )
      }
    }
    lines.push(')')
  }
  lines.push('#pagebreak()')
  lines.push('// ----- Polygones de correction et d’assemblage -----')
  lines.push('#set page(paper: "a4", flipped: true, margin: 8mm)')
  lines.push(
    '#grid(columns: (1fr, 1fr), rows: (140mm,), gutter: 8mm, align: center + top,',
  )
  const assemblyPart = (svg: string) =>
    `  image(bytes(${typstString(svg)}), format: "svg", width: 125mm, height: 125mm, fit: "contain"),`
  lines.push(
    `  stack(dir: ttb, spacing: 2mm, ${assemblyPart(coverPolygonSvg(seriesLabel, codes.length)).trim().replace(/,$/, '')}, align(center, text(size: 9pt)[Découper la fenêtre et l’encoche en pointillés.])),`,
  )
  lines.push(assemblyPart(solutionPolygonSvg(codes)))
  lines.push(')')
  return lines.join('\n')
}
