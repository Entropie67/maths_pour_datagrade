import type { PreviewPageGeometry } from '../shared/typstPreview'
import type { TypstAnchor } from './typstCompiler'

/**
 * Clé d'une section de l'aperçu Typst : l'énoncé (`exo-3`) ou la correction
 * (`corr-3`) d'un exercice. Sert à n'afficher que les contrôles de la palette
 * de mise en page qui concernent l'exercice survolé.
 */
export type SectionKey = `exo-${number}` | `corr-${number}`

/** Repères qui ouvrent une section (début d'un énoncé ou d'une correction) */
const SECTION_KINDS = new Set(['exo', 'version-exo', 'corr'])

export function sectionKeyOf(anchor: TypstAnchor): SectionKey | null {
  if (!SECTION_KINDS.has(anchor.kind)) return null
  return anchor.kind === 'corr' ? `corr-${anchor.num}` : `exo-${anchor.num}`
}

/**
 * Index (0-based) de la page qui contient l'ordonnée `y` de l'aperçu, ou de
 * la plus proche quand `y` tombe dans l'espacement entre deux pages ; -1 sans
 * page.
 */
export function pageIndexAt(pages: PreviewPageGeometry[], y: number): number {
  const index = pages.findIndex(
    (page) => y >= page.y && y <= page.y + page.height,
  )
  if (index !== -1) return index
  let bestIndex = -1
  let bestDistance = Infinity
  pages.forEach((page, i) => {
    const distance = Math.min(
      Math.abs(y - page.y),
      Math.abs(y - (page.y + page.height)),
    )
    if (distance < bestDistance) {
      bestDistance = distance
      bestIndex = i
    }
  })
  return bestIndex
}

/**
 * Position dans l'ordre de lecture du document : page, puis colonne (document
 * multicolonne), puis ordonnée. La colonne est déduite de l'abscisse en
 * découpant la page en bandes égales, comme le placement de la barre d'un
 * exercice (`TypstLayoutOverlay`).
 */
function readingPosition(
  page: number,
  x: number,
  y: number,
  pageWidth: number,
  columns: number,
): [number, number, number] {
  const count = Math.max(1, columns)
  const column =
    count > 1 && pageWidth > 0
      ? Math.min(count - 1, Math.max(0, Math.floor((x / pageWidth) * count)))
      : 0
  return [page, column, y]
}

function isBeforeOrEqual(
  a: [number, number, number],
  b: [number, number, number],
): boolean {
  if (a[0] !== b[0]) return a[0] < b[0]
  if (a[1] !== b[1]) return a[1] < b[1]
  return a[2] <= b[2]
}

/**
 * Repère `exo`/`version-exo`/`corr` de la section qui contient le point
 * (`page` 1-based, `x`/`y` en pt dans la page) : le dernier rencontré avant
 * lui dans l'ordre de lecture. `null` avant le premier exercice (en-tête,
 * page de garde).
 */
export function locateSectionAnchor(
  anchors: TypstAnchor[],
  pages: PreviewPageGeometry[],
  columns: number,
  page: number,
  x: number,
  y: number,
  multicolGroups: number[] = [],
): TypstAnchor | null {
  const pageWidth = pages[page - 1]?.width ?? 0
  const point = readingPosition(page, x, y, pageWidth, columns)
  let candidate: TypstAnchor | null = null
  let candidatePosition: [number, number, number] | null = null
  for (const anchor of anchors) {
    if (!SECTION_KINDS.has(anchor.kind)) continue
    const position = readingPosition(
      anchor.page,
      anchor.x,
      anchor.y,
      pages[anchor.page - 1]?.width ?? pageWidth,
      columns,
    )
    if (!isBeforeOrEqual(position, point)) continue
    if (
      candidatePosition == null ||
      isBeforeOrEqual(candidatePosition, position)
    ) {
      candidate = anchor
      candidatePosition = position
    }
  }
  return sideBySideAnchor(candidate, anchors, x, multicolGroups)
}

/**
 * Exercices groupés en colonnes (grid manuelle) : ils sont côte à côte sur la
 * même ligne, la colonne n'est donc pas déduite du nombre de colonnes du
 * document ; on retient le membre du groupe dont l'abscisse précède le point.
 */
function sideBySideAnchor(
  candidate: TypstAnchor | null,
  anchors: TypstAnchor[],
  x: number,
  multicolGroups: number[],
): TypstAnchor | null {
  if (candidate == null || candidate.kind !== 'exo') return candidate
  let first = candidate.num
  while (multicolGroups.includes(first - 1)) first--
  let last = candidate.num
  while (multicolGroups.includes(last)) last++
  if (first === last) return candidate
  const members = anchors.filter(
    (anchor) =>
      anchor.kind === 'exo' &&
      anchor.num >= first &&
      anchor.num <= last &&
      anchor.page === candidate.page &&
      Math.abs(anchor.y - candidate.y) < 1,
  )
  let best = members[0] ?? candidate
  for (const member of members) {
    if (member.x <= x && member.x >= best.x) best = member
  }
  return best
}

/**
 * Sections dont le contrôle d'un repère fait partie : il n'est affiché que
 * lorsque l'une d'elles est survolée. `undefined` : contrôle commun à toute la
 * fiche (en-tête, page de garde, ajout d'un exercice en fin de fiche…),
 * toujours affiché.
 */
export function anchorSections(
  anchor: TypstAnchor,
  anchors: TypstAnchor[],
  pages: PreviewPageGeometry[],
  columns: number,
  exerciseCount: number,
  multicolGroups: number[] = [],
): SectionKey[] | undefined {
  switch (anchor.kind) {
    case 'exo':
    case 'version-exo':
    case 'corr':
      return [sectionKeyOf(anchor) as SectionKey]
    case 'tasks':
      return [`exo-${anchor.num}`]
    case 'tasks-corr':
      // num 0 : corrections de la « Course aux nombres », communes à la fiche
      return anchor.num === 0 ? undefined : [`corr-${anchor.num}`]
    case 'gap': {
      // entre deux exercices : la barre (sauts, fusion) concerne les deux ;
      // après le dernier, elle porte « Ajouter un exercice », toujours visible
      if (anchor.num >= exerciseCount) return undefined
      let first = Math.max(1, anchor.num)
      let last = anchor.num + 1
      // Le repère après une grille est à gauche, sous son premier membre.
      // Garder ses boutons visibles pendant le trajet depuis l'autre membre.
      if (columns <= 1) {
        while (first > 1 && multicolGroups.includes(first - 1)) first--
        while (last < exerciseCount && multicolGroups.includes(last)) last++
      }
      return Array.from(
        { length: last - first + 1 },
        (_, index): SectionKey => `exo-${first + index}`,
      )
    }
    case 'figure': {
      const owner = locateSectionAnchor(
        anchors,
        pages,
        columns,
        anchor.page,
        anchor.x,
        anchor.y,
      )
      return owner == null ? undefined : [sectionKeyOf(owner) as SectionKey]
    }
    default:
      return undefined
  }
}
