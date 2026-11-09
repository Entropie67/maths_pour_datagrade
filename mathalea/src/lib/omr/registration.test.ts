import { describe, expect, it } from 'vitest'
import { otsuThreshold } from './binarize'
import {
  applyHomography,
  findMarkers,
  markerConfidence,
  pageToImage,
  solveHomography,
} from './registration'
import { homographieDeScan, pageBlanche, remplirRect } from './testHelpers'
import type { Point } from './omrTypes'

/** Repères de calage d'une A4 : carrés de 5 mm à 10 mm des bords. */
const REPERES: Point[] = [
  { x: 12.5 / 210, y: 12.5 / 297 },
  { x: 1 - 12.5 / 210, y: 12.5 / 297 },
  { x: 1 - 12.5 / 210, y: 1 - 12.5 / 297 },
  { x: 12.5 / 210, y: 1 - 12.5 / 297 },
]
const TAILLE = { w: 5 / 210, h: 5 / 297 }

/** A4 à 150 dpi. */
const LARGEUR = 1240
const HAUTEUR = 1754

function pageAvecReperes(options = {}) {
  const image = pageBlanche(LARGEUR, HAUTEUR)
  const h = homographieDeScan(LARGEUR, HAUTEUR, options)
  for (const repere of REPERES) {
    remplirRect(image, h, {
      x: repere.x - TAILLE.w / 2,
      y: repere.y - TAILLE.h / 2,
      w: TAILLE.w,
      h: TAILLE.h,
    })
  }
  return { image, h }
}

describe('solveHomography', () => {
  const carre: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ]

  it('retrouve l’identité', () => {
    const h = solveHomography(carre, carre)
    expect(h).not.toBeNull()
    for (const p of carre) {
      const q = applyHomography(h as Float64Array, p)
      expect(q.x).toBeCloseTo(p.x, 10)
      expect(q.y).toBeCloseTo(p.y, 10)
    }
  })

  it('envoie exactement les quatre points source sur les points cibles', () => {
    const cible: Point[] = [
      { x: 12, y: 7 },
      { x: 210, y: 15 },
      { x: 205, y: 300 },
      { x: 4, y: 292 },
    ]
    const h = solveHomography(carre, cible) as Float64Array
    expect(h).not.toBeNull()
    cible.forEach((attendu, i) => {
      const obtenu = applyHomography(h, carre[i])
      expect(obtenu.x).toBeCloseTo(attendu.x, 8)
      expect(obtenu.y).toBeCloseTo(attendu.y, 8)
    })
  })

  it('rejette une configuration dégénérée (points alignés)', () => {
    const alignes: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ]
    expect(solveHomography(alignes, carre)).toBeNull()
  })
})

describe('findMarkers', () => {
  it('retrouve les quatre marqueurs d’une page parfaitement alignée', () => {
    const { image, h } = pageAvecReperes()
    const seuil = otsuThreshold(image)
    const trouves = findMarkers(image, seuil, REPERES)
    expect(trouves).not.toBeNull()
    REPERES.forEach((repere, i) => {
      const attendu = applyHomography(h, repere)
      const obtenu = (trouves as Point[])[i]
      // le centroïde d'un carré rastérisé sur la grille de pixels s'écarte du
      // centre idéal d'une fraction de pixel : 1 px à 150 dpi vaut 0,17 mm
      expect(
        Math.hypot(obtenu.x - attendu.x, obtenu.y - attendu.y),
      ).toBeLessThan(1)
    })
  })

  it.each([
    ['décalée', { decalageX: 14, decalageY: -9 }],
    ['tournée de 1,5°', { angleDegres: 1.5 }],
    ['tournée et décalée', { angleDegres: -1, decalageX: 8, decalageY: 11 }],
    ['légèrement en perspective', { perspective: 0.02, angleDegres: 0.7 }],
  ])('retrouve les marqueurs d’une page %s', (_nom, options) => {
    const { image, h } = pageAvecReperes(options)
    const seuil = otsuThreshold(image)
    const trouves = findMarkers(image, seuil, REPERES)
    expect(trouves).not.toBeNull()
    REPERES.forEach((repere, i) => {
      const attendu = applyHomography(h, repere)
      const obtenu = (trouves as Point[])[i]
      // moins d'un pixel d'écart sur le centroïde
      expect(
        Math.hypot(obtenu.x - attendu.x, obtenu.y - attendu.y),
      ).toBeLessThan(1)
    })
  })

  it('ignore le texte de la page, trop petit et trop peu dense', () => {
    const { image, h } = pageAvecReperes()
    // barbouille de « texte » dans le coin haut-gauche, près du marqueur
    for (let i = 0; i < 40; i++) {
      remplirRect(image, h, {
        x: 0.03 + (i % 8) * 0.006,
        y: 0.02 + Math.floor(i / 8) * 0.004,
        w: 0.003,
        h: 0.002,
      })
    }
    const seuil = otsuThreshold(image)
    const trouves = findMarkers(image, seuil, REPERES)
    expect(trouves).not.toBeNull()
    const attendu = applyHomography(h, REPERES[0])
    const obtenu = (trouves as Point[])[0]
    expect(Math.hypot(obtenu.x - attendu.x, obtenu.y - attendu.y)).toBeLessThan(
      2,
    )
  })

  it('renvoie null quand un marqueur manque (coin plié ou page rognée)', () => {
    const image = pageBlanche(LARGEUR, HAUTEUR)
    const h = homographieDeScan(LARGEUR, HAUTEUR)
    for (const repere of REPERES.slice(0, 3)) {
      remplirRect(image, h, {
        x: repere.x - TAILLE.w / 2,
        y: repere.y - TAILLE.h / 2,
        w: TAILLE.w,
        h: TAILLE.h,
      })
    }
    expect(findMarkers(image, otsuThreshold(image), REPERES)).toBeNull()
  })
})

describe('pageToImage', () => {
  it('projette la page théorique sur le scan à moins d’un pixel', () => {
    const options = {
      angleDegres: 1.2,
      decalageX: 10,
      decalageY: -6,
      perspective: 0.015,
    }
    const { image, h } = pageAvecReperes(options)
    const projection = pageToImage(image, otsuThreshold(image), REPERES)
    expect(projection).not.toBeNull()
    // des points quelconques de la page, pas seulement les marqueurs
    for (const p of [
      { x: 0.5, y: 0.5 },
      { x: 0.2, y: 0.8 },
      { x: 0.85, y: 0.35 },
    ]) {
      const attendu = applyHomography(h, p)
      const obtenu = applyHomography(projection as Float64Array, p)
      expect(
        Math.hypot(obtenu.x - attendu.x, obtenu.y - attendu.y),
      ).toBeLessThan(1)
    }
  })
})

describe('markerConfidence', () => {
  it('vaut environ 1 sur des marqueurs francs et 0 sur du papier blanc', () => {
    const { image, h } = pageAvecReperes()
    const centres = REPERES.map((r) => applyHomography(h, r))
    const confiances = markerConfidence(image, otsuThreshold(image), centres)
    for (const c of confiances) expect(c).toBeGreaterThan(0.9)

    const blanche = pageBlanche(LARGEUR, HAUTEUR)
    const surBlanc = markerConfidence(blanche, 128, centres)
    for (const c of surBlanc) expect(c).toBe(0)
  })
})
