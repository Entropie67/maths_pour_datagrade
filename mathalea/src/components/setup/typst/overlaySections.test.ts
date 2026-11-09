import { describe, expect, it } from 'vitest'
import {
  anchorSections,
  locateSectionAnchor,
  pageIndexAt,
} from './overlaySections'
import type { TypstAnchor } from './typstCompiler'

const pages = [
  { y: 0, width: 600, height: 800 },
  { y: 820, width: 600, height: 800 },
]

function anchor(
  kind: TypstAnchor['kind'],
  num: number,
  page: number,
  x: number,
  y: number,
): TypstAnchor {
  return { kind, num, page, x, y }
}

describe('pageIndexAt', () => {
  it('retrouve la page contenant le point, ou la plus proche entre deux pages', () => {
    expect(pageIndexAt(pages, 100)).toBe(0)
    expect(pageIndexAt(pages, 900)).toBe(1)
    expect(pageIndexAt(pages, 805)).toBe(0)
    expect(pageIndexAt(pages, 815)).toBe(1)
    expect(pageIndexAt([], 10)).toBe(-1)
  })
})

describe('locateSectionAnchor', () => {
  const anchors = [
    anchor('header', 0, 1, 50, 20),
    anchor('exo', 1, 1, 50, 100),
    anchor('tasks', 1, 1, 60, 150),
    anchor('exo', 2, 1, 50, 500),
    anchor('corr', 1, 2, 50, 100),
  ]

  it("renvoie l'exercice commencé le plus récemment au-dessus du point", () => {
    expect(locateSectionAnchor(anchors, pages, 1, 1, 300, 300)?.num).toBe(1)
    expect(locateSectionAnchor(anchors, pages, 1, 1, 300, 600)?.num).toBe(2)
  })

  it("rattache le haut d'une page à l'exercice commencé sur la précédente", () => {
    expect(locateSectionAnchor(anchors, pages, 1, 2, 300, 50)?.num).toBe(2)
    expect(locateSectionAnchor(anchors, pages, 1, 2, 300, 200)?.kind).toBe(
      'corr',
    )
  })

  it('ne renvoie rien avant le premier exercice (en-tête)', () => {
    expect(locateSectionAnchor(anchors, pages, 1, 1, 300, 50)).toBeNull()
  })

  it('suit les colonnes dans un document multicolonne', () => {
    const columnAnchors = [
      anchor('exo', 1, 1, 40, 100),
      anchor('exo', 2, 1, 40, 600),
      anchor('exo', 3, 1, 340, 300),
    ]
    // colonne de gauche, plus bas que le début de l'exercice 3 (à droite)
    expect(locateSectionAnchor(columnAnchors, pages, 2, 1, 100, 400)?.num).toBe(
      1,
    )
    // haut de la colonne de droite : suite de l'exercice 2
    expect(locateSectionAnchor(columnAnchors, pages, 2, 1, 400, 100)?.num).toBe(
      2,
    )
    expect(locateSectionAnchor(columnAnchors, pages, 2, 1, 400, 500)?.num).toBe(
      3,
    )
  })
})

describe('anchorSections', () => {
  const anchors = [
    anchor('exo', 1, 1, 50, 100),
    anchor('figure', 1, 1, 400, 200),
    anchor('exo', 2, 1, 50, 500),
  ]
  const sections = (a: TypstAnchor) => anchorSections(a, anchors, pages, 1, 2)

  it('rattache chaque contrôle à son exercice ou à sa correction', () => {
    expect(sections(anchor('exo', 2, 1, 50, 500))).toEqual(['exo-2'])
    expect(sections(anchor('version-exo', 2, 1, 50, 500))).toEqual(['exo-2'])
    expect(sections(anchor('tasks', 1, 1, 60, 150))).toEqual(['exo-1'])
    expect(sections(anchor('corr', 2, 2, 50, 100))).toEqual(['corr-2'])
    expect(sections(anchor('tasks-corr', 2, 2, 60, 150))).toEqual(['corr-2'])
    expect(sections(anchor('figure', 1, 1, 400, 200))).toEqual(['exo-1'])
  })

  it('rattache un repère entre deux exercices aux deux', () => {
    expect(sections(anchor('gap', 0, 1, 50, 90))).toEqual(['exo-1'])
    expect(sections(anchor('gap', 1, 1, 50, 490))).toEqual(['exo-1', 'exo-2'])
  })

  it('laisse toujours visibles les contrôles communs à la fiche', () => {
    expect(sections(anchor('gap', 2, 1, 50, 700))).toBeUndefined()
    expect(sections(anchor('header', 0, 1, 50, 20))).toBeUndefined()
    expect(sections(anchor('tasks-corr', 0, 2, 60, 150))).toBeUndefined()
    expect(sections(anchor('can-row', 1, 1, 60, 150))).toBeUndefined()
  })

  it('garde les sauts accessibles depuis les deux exercices côte à côte', () => {
    const groupedAnchors = [
      anchor('exo', 2, 1, 50, 100),
      anchor('exo', 3, 1, 350, 100),
      anchor('gap', 3, 1, 50, 450),
      anchor('exo', 4, 1, 50, 500),
    ]
    const gap = groupedAnchors[2]
    const visibleSections = anchorSections(
      gap,
      groupedAnchors,
      pages,
      1,
      4,
      [2],
    )
    expect(visibleSections).toEqual(['exo-2', 'exo-3', 'exo-4'])
    // Le trajet depuis la colonne droite traverse l'exercice de gauche.
    for (const x of [450, 300, 100, 50]) {
      const owner = locateSectionAnchor(
        groupedAnchors,
        pages,
        1,
        1,
        x,
        430,
        [2],
      )
      expect(visibleSections).toContain(`exo-${owner?.num}`)
    }
    expect(
      anchorSections(
        anchor('gap', 1, 1, 50, 90),
        groupedAnchors,
        pages,
        1,
        4,
        [2],
      ),
    ).toEqual(['exo-1', 'exo-2', 'exo-3'])
  })
})
