import { describe, expect, it } from 'vitest'
import { buildDarkIntegral, otsuThreshold } from './binarize'
import { pageToImage } from './registration'
import {
  affinerChoixUnique,
  BASE_MAX,
  classifier,
  MARGE_COCHEE,
  MARGE_VIDE,
  niveauDeFond,
  readBoxes,
  seuilsCopie,
} from './readBoxes'
import {
  contourRect,
  homographieDeScan,
  pageBlanche,
  remplirRect,
} from './testHelpers'
import type { OmrBox, OmrBoxReading, Point } from './omrTypes'

const REPERES: Point[] = [
  { x: 12.5 / 210, y: 12.5 / 297 },
  { x: 1 - 12.5 / 210, y: 12.5 / 297 },
  { x: 1 - 12.5 / 210, y: 1 - 12.5 / 297 },
  { x: 12.5 / 210, y: 1 - 12.5 / 297 },
]
const TAILLE_REPERE = { w: 5 / 210, h: 5 / 297 }
const LARGEUR = 1240
const HAUTEUR = 1754

/** Cases de 4 mm, en grille de 5 colonnes sur 4 lignes. */
function grilleDeCases(): OmrBox[] {
  const boxes: OmrBox[] = []
  for (let ligne = 0; ligne < 4; ligne++) {
    for (let colonne = 0; colonne < 5; colonne++) {
      boxes.push({
        id: `q${ligne}p${colonne}`,
        qid: `q${ligne}`,
        page: 1,
        x: 0.15 + colonne * 0.12,
        y: 0.25 + ligne * 0.09,
        w: 4 / 210,
        h: 4 / 297,
        correct: colonne === ligne % 5,
      })
    }
  }
  return boxes
}

/** Marques simulant le geste de l'élève, calibrées sur les mesures du spike. */
type Marque = 'vide' | 'plein' | 'croix' | 'coche' | 'barre'

function dessinerMarque(
  image: ReturnType<typeof pageBlanche>,
  h: Float64Array,
  box: OmrBox,
  marque: Marque,
): void {
  const trait = { x: box.w * 0.12, y: box.h * 0.12 }
  if (marque === 'plein') {
    remplirRect(image, h, {
      x: box.x + box.w * 0.15,
      y: box.y + box.h * 0.15,
      w: box.w * 0.7,
      h: box.h * 0.7,
    })
  } else if (marque === 'croix') {
    // deux bandes obliques approchées par des segments horizontaux empilés
    const pas = 24
    for (let i = 0; i <= pas; i++) {
      const t = i / pas
      remplirRect(image, h, {
        x: box.x + box.w * (0.1 + 0.75 * t),
        y: box.y + box.h * (0.1 + 0.75 * t),
        w: trait.x,
        h: trait.y,
      })
      remplirRect(image, h, {
        x: box.x + box.w * (0.85 - 0.75 * t),
        y: box.y + box.h * (0.1 + 0.75 * t),
        w: trait.x,
        h: trait.y,
      })
    }
  } else if (marque === 'coche') {
    const pas = 16
    for (let i = 0; i <= pas; i++) {
      const t = i / pas
      remplirRect(image, h, {
        x: box.x + box.w * (0.2 + 0.2 * t),
        y: box.y + box.h * (0.5 + 0.35 * t),
        w: trait.x,
        h: trait.y,
      })
      remplirRect(image, h, {
        x: box.x + box.w * (0.4 + 0.5 * t),
        y: box.y + box.h * (0.85 - 0.8 * t),
        w: trait.x,
        h: trait.y,
      })
    }
  } else if (marque === 'barre') {
    remplirRect(image, h, {
      x: box.x + box.w * 0.05,
      y: box.y + box.h * 0.45,
      w: box.w * 0.9,
      h: trait.y,
    })
  }
}

/** Fabrique une page scannée : repères, cadres des cases, et marques. */
function pageScannee(
  boxes: OmrBox[],
  marques: Record<string, Marque>,
  options = {},
) {
  const image = pageBlanche(LARGEUR, HAUTEUR)
  const h = homographieDeScan(LARGEUR, HAUTEUR, options)
  for (const repere of REPERES) {
    remplirRect(image, h, {
      x: repere.x - TAILLE_REPERE.w / 2,
      y: repere.y - TAILLE_REPERE.h / 2,
      w: TAILLE_REPERE.w,
      h: TAILLE_REPERE.h,
    })
  }
  for (const box of boxes) {
    contourRect(image, h, box, box.h * 0.08)
    dessinerMarque(image, h, box, marques[box.id] ?? 'vide')
  }
  return { image, h }
}

function lire(image: ReturnType<typeof pageBlanche>, boxes: OmrBox[]) {
  const seuil = otsuThreshold(image)
  const projection = pageToImage(image, seuil, REPERES)
  expect(projection).not.toBeNull()
  const integral = buildDarkIntegral(image, seuil)
  return readBoxes(
    integral,
    image.width,
    image.height,
    projection as Float64Array,
    boxes,
  )
}

describe('classifier', () => {
  it('range de part et d’autre de la bande d’ambiguïté', () => {
    const seuils = { base: 0.02, vide: 0.1, cochee: 0.18 }
    expect(classifier(0.02, seuils)).toBe('vide')
    expect(classifier(0.09, seuils)).toBe('vide')
    expect(classifier(0.14, seuils)).toBe('ambigue')
    expect(classifier(0.18, seuils)).toBe('cochee')
    expect(classifier(0.9, seuils)).toBe('cochee')
  })

  it('classe « cochée » une case barrée, mesurée à 0,214 au spike', () => {
    // la valeur qui avait mis en défaut la première version des seuils
    expect(classifier(0.214, seuilsCopie([0, 0, 0, 0, 0.214, 0.9]))).toBe(
      'cochee',
    )
  })
})

describe('niveauDeFond', () => {
  it('suit le mode « vide » même quand un tiers des cases est marqué', () => {
    const noirceurs = [0.01, 0.02, 0.01, 0.03, 0.02, 0.9, 0.85, 0.95]
    expect(niveauDeFond(noirceurs)).toBeLessThan(0.05)
  })

  it('remonte avec le voile gris d’un scanner mal réglé', () => {
    const propre = seuilsCopie([0, 0, 0, 0, 0.9])
    const voile = seuilsCopie([0.12, 0.11, 0.13, 0.12, 0.95])
    expect(voile.base).toBeGreaterThan(propre.base)
    // une case vide voilée reste vide, une case marquée reste cochée
    expect(classifier(0.12, voile)).toBe('vide')
    expect(classifier(0.95, voile)).toBe('cochee')
  })

  it('est borné pour ne pas suivre une page entièrement salie', () => {
    const seuils = seuilsCopie([0.8, 0.85, 0.9, 0.95])
    expect(seuils.base).toBe(BASE_MAX)
  })

  it('vaut 0 sur un échantillon vide', () => {
    expect(niveauDeFond([])).toBe(0)
    expect(seuilsCopie([])).toEqual({
      base: 0,
      vide: MARGE_VIDE,
      cochee: MARGE_COCHEE,
    })
  })

  it('n’invente pas de frontière sur une copie sans aucune case cochée', () => {
    const noirceurs = [0, 0.01, 0.02, 0, 0.03, 0.01]
    const seuils = seuilsCopie(noirceurs)
    for (const d of noirceurs) expect(classifier(d, seuils)).toBe('vide')
  })
})

describe('readBoxes de bout en bout', () => {
  it('retrouve exactement les cases noircies sur une page bien alignée', () => {
    const boxes = grilleDeCases()
    const cochees = ['q0p0', 'q1p3', 'q2p2', 'q3p4']
    const marques = Object.fromEntries(
      cochees.map((id) => [id, 'plein' as Marque]),
    )
    const { image } = pageScannee(boxes, marques)
    const lectures = lire(image, boxes)
    const detectees = lectures
      .filter((l) => l.status === 'cochee')
      .map((l) => l.id)
    expect(detectees.sort()).toEqual([...cochees].sort())
    expect(lectures.filter((l) => l.status === 'ambigue')).toHaveLength(0)
  })

  it.each([
    ['décalée', { decalageX: 12, decalageY: -8 }],
    ['tournée de 1,5°', { angleDegres: 1.5 }],
    [
      'tournée en sens inverse et décalée',
      { angleDegres: -1.2, decalageX: -9, decalageY: 7 },
    ],
    ['en légère perspective', { perspective: 0.02, angleDegres: 0.6 }],
  ])('retrouve les mêmes cases sur une page %s', (_nom, options) => {
    const boxes = grilleDeCases()
    const cochees = ['q0p1', 'q1p1', 'q2p4', 'q3p0']
    const marques = Object.fromEntries(
      cochees.map((id) => [id, 'plein' as Marque]),
    )
    const { image } = pageScannee(boxes, marques, options)
    const lectures = lire(image, boxes)
    const detectees = lectures
      .filter((l) => l.status === 'cochee')
      .map((l) => l.id)
    expect(detectees.sort()).toEqual([...cochees].sort())
  })

  it('ne compte aucune case sur une copie rendue blanche', () => {
    const boxes = grilleDeCases()
    const { image } = pageScannee(boxes, {})
    const lectures = lire(image, boxes)
    expect(lectures.every((l) => l.status === 'vide')).toBe(true)
  })

  it('ne déclare jamais « vide » une case portant une marque, même faible', () => {
    // c'est le critère de recevabilité : une croix, une coche ou une barre
    // doivent au pire ressortir comme ambiguës, jamais être perdues en silence
    const boxes = grilleDeCases()
    const marques: Record<string, Marque> = {
      q0p0: 'plein',
      q1p1: 'croix',
      q2p2: 'coche',
      q3p3: 'barre',
    }
    const { image } = pageScannee(boxes, marques)
    const lectures = lire(image, boxes)
    for (const [id, marque] of Object.entries(marques)) {
      const lecture = lectures.find((l) => l.id === id)
      expect(lecture, `case ${id}`).toBeDefined()
      expect(
        lecture?.status,
        `${id} (${marque}) noircie à ${lecture?.darkness.toFixed(3)}`,
      ).not.toBe('vide')
    }
    // et les cases réellement vides le restent
    const marquees = new Set(Object.keys(marques))
    for (const lecture of lectures) {
      if (!marquees.has(lecture.id)) expect(lecture.status).toBe('vide')
    }
  })

  it('ignore une marque qui déborde d’une case voisine sans l’atteindre', () => {
    const boxes = grilleDeCases()
    const { image, h } = pageScannee(boxes, { q0p0: 'plein' })
    // trait passant entre deux cases, mordant le cadre de q0p1 sans entrer
    const voisine = boxes.find((b) => b.id === 'q0p1') as OmrBox
    remplirRect(image, h, {
      x: voisine.x - voisine.w * 0.6,
      y: voisine.y + voisine.h * 0.45,
      w: voisine.w * 0.65,
      h: voisine.h * 0.12,
    })
    const lectures = lire(image, boxes)
    expect(lectures.find((l) => l.id === 'q0p1')?.status).toBe('vide')
    expect(lectures.find((l) => l.id === 'q0p0')?.status).toBe('cochee')
  })
})

describe('affinerChoixUnique', () => {
  /** Construit des lectures à partir de couples id → noirceur, avec seuils. */
  function lectures(
    seuils: ReturnType<typeof seuilsCopie>,
    darknesses: Record<string, number>,
  ): OmrBoxReading[] {
    return Object.entries(darknesses).map(([id, darkness]) => ({
      id,
      darkness,
      status: classifier(darkness, seuils),
    }))
  }

  it('résout un « plusieurs cases » quand une case domine — copie scannée réelle', () => {
    // mesures relevées sur une copie où l'élève n'a coché qu'une case, mais où
    // le débordement de sa coche fait monter la voisine au-dessus du seuil
    const seuils = seuilsCopie([
      0.663, 0.071, 0.143, 0.209, 0.2, 0.444, 0.249, 0.424, 0.324, 0.214, 0,
    ])
    const avant = lectures(seuils, {
      'q.0': 0.424,
      'q.1': 0.324,
      'q.2': 0.214,
      'q.3': 0,
    })
    expect(avant.filter((l) => l.status === 'cochee').map((l) => l.id)).toEqual([
      'q.0',
      'q.1',
    ])

    const apres = affinerChoixUnique(avant, [['q.0', 'q.1', 'q.2', 'q.3']], seuils)
    expect(apres.find((l) => l.id === 'q.0')?.status).toBe('cochee')
    expect(apres.filter((l) => l.id !== 'q.0').every((l) => l.status === 'vide'))
      .toBe(true)
  })

  it('résout un « à vérifier » quand la 2ᵉ case est loin derrière', () => {
    const seuils = seuilsCopie([
      0.357, 0, 0, 0.082, 0.133, 0.505, 0.133, 0.582, 0.152, 0.23, 0.253,
    ])
    const avant = lectures(seuils, {
      'q.0': 0.582,
      'q.1': 0.152,
      'q.2': 0.23,
      'q.3': 0.253,
    })
    expect(avant.some((l) => l.status === 'ambigue')).toBe(true)

    const apres = affinerChoixUnique(avant, [['q.0', 'q.1', 'q.2', 'q.3']], seuils)
    expect(apres.find((l) => l.id === 'q.0')?.status).toBe('cochee')
    expect(apres.filter((l) => l.id !== 'q.0').every((l) => l.status === 'vide'))
      .toBe(true)
  })

  it('ne tranche pas deux cases franchement cochées : la question reste à arbitrer', () => {
    const seuils = seuilsCopie([0, 0, 0.05, 0.55, 0.58, 0.6])
    const avant = lectures(seuils, { 'q.0': 0.58, 'q.1': 0.55, 'q.2': 0.02 })
    const apres = affinerChoixUnique(avant, [['q.0', 'q.1', 'q.2']], seuils)
    expect(apres.filter((l) => l.status === 'cochee').map((l) => l.id).sort())
      .toEqual(['q.0', 'q.1'])
  })

  it('ne coche rien quand la case la plus sombre reste sous le seuil « cochée »', () => {
    const seuils = seuilsCopie([0, 0, 0, 0, 0.9])
    const avant = lectures(seuils, { 'q.0': 0.05, 'q.1': 0.02, 'q.2': 0 })
    const apres = affinerChoixUnique(avant, [['q.0', 'q.1', 'q.2']], seuils)
    expect(apres.every((l) => l.status === 'vide')).toBe(true)
  })

  it('laisse intactes les lectures hors des groupes fournis', () => {
    const seuils = seuilsCopie([0, 0, 0.05, 0.5, 0.55])
    const avant = lectures(seuils, { 'q.0': 0.5, 'q.1': 0.03, autre: 0.5 })
    const apres = affinerChoixUnique(avant, [['q.0', 'q.1']], seuils)
    expect(apres.find((l) => l.id === 'autre')?.status).toBe('cochee')
  })
})
