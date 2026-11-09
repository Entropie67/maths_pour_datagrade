import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait, type PointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { getLang } from '../../lib/stores/languagesStore'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'

import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer les composantes de vecteurs dans un repère construit sur un cube'
export const dateDePublication = '29/04/2026'
export const uuid = 'a7f3d'
export const refs = {
  'fr-fr': ['TSG2-17'],
  'fr-ch': ['3G91-10'],
}
export const interactifReady = true

// 8 cube vertices in base frame [x,y,z], all coords in {0,1}
// Correspondence with TSG2-10 labels: V0=A, V1=B, V2=C, V3=D(hidden), V4=E, V5=F, V6=G, V7=H
const V: [number, number, number][] = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1],
]

// Oblique 2D projection (identical to TSG2-10)
function proj(p: [number, number, number]): [number, number] {
  return [p[0] * 4 + p[1] * 2, p[1] * 1.6 + p[2] * 4]
}

function vert2d(idx: number, nom = '', pos = 'above'): PointAbstrait {
  const [px, py] = proj(V[idx])
  return pointAbstrait(px, py, nom, pos)
}

function edgePt2d(
  v1: number,
  v2: number,
  t: number,
  nom: string,
  pos: string,
): PointAbstrait {
  const [px, py] = proj([
    V[v1][0] + t * (V[v2][0] - V[v1][0]),
    V[v1][1] + t * (V[v2][1] - V[v1][1]),
    V[v1][2] + t * (V[v2][2] - V[v1][2]),
  ])
  return pointAbstrait(px, py, nom, pos)
}

function edgeCoords3d(
  v1: number,
  v2: number,
  t: number,
): [number, number, number] {
  return [
    V[v1][0] + t * (V[v2][0] - V[v1][0]),
    V[v1][1] + t * (V[v2][1] - V[v1][1]),
    V[v1][2] + t * (V[v2][2] - V[v1][2]),
  ]
}

// Small perpendicular tick marks on the projected edge at each t-value
function edgeTicks(v1: number, v2: number, ts: number[]) {
  const [px1, py1] = proj(V[v1])
  const [px2, py2] = proj(V[v2])
  const dx = px2 - px1
  const dy = py2 - py1
  const d = Math.sqrt(dx * dx + dy * dy)
  const s = 0.22
  const nx = (-dy / d) * s
  const ny = (dx / d) * s
  return ts.map((t) => {
    const mx = px1 + t * dx
    const my = py1 + t * dy
    return segment(
      pointAbstrait(mx - nx, my - ny),
      pointAbstrait(mx + nx, my + ny),
      'black',
    )
  })
}

// Convert a rational number (denominator ≤ 4) to LaTeX via FractionEtendue
function frac(x: number): string {
  for (const d of [1, 2, 3, 4]) {
    const n = Math.round(x * d)
    if (Math.abs(n / d - x) < 1e-9) return new FractionEtendue(n, d).texFSD
  }
  return String(x)
}

// 4 right-handed orthonormal frames (verified: i×j = k for each)
// unlabeled: the 4 vertices NOT used as O/I/J/K in this frame
const FRAMES = [
  {
    origin: 0,
    iEnd: 1,
    jEnd: 3,
    kEnd: 4,
    unlabeled: [2, 5, 6, 7],
    coords: (x: number, y: number, z: number): [number, number, number] => [
      x,
      y,
      z,
    ],
  },
  {
    origin: 1,
    iEnd: 2,
    jEnd: 0,
    kEnd: 5,
    unlabeled: [3, 4, 6, 7],
    coords: (x: number, y: number, z: number): [number, number, number] => [
      y,
      1 - x,
      z,
    ],
  },
  {
    origin: 4,
    iEnd: 7,
    jEnd: 5,
    kEnd: 0,
    unlabeled: [1, 2, 3, 6],
    coords: (x: number, y: number, z: number): [number, number, number] => [
      y,
      x,
      1 - z,
    ],
  },
  {
    origin: 5,
    iEnd: 4,
    jEnd: 6,
    kEnd: 1,
    unlabeled: [0, 2, 3, 7],
    coords: (x: number, y: number, z: number): [number, number, number] => [
      1 - x,
      y,
      1 - z,
    ],
  },
]

// Visible and hidden edges (vertex index pairs)
const VIS_EDGES: [number, number][] = [
  [0, 1],
  [0, 4],
  [1, 2],
  [1, 5],
  [2, 6],
  [4, 5],
  [4, 7],
  [5, 6],
  [6, 7],
]
const HID_EDGES: [number, number][] = [
  [0, 3],
  [2, 3],
  [3, 7],
]

// Label positions for each vertex in the oblique projection
const VPOS: Record<number, string> = {
  0: 'below left',
  1: 'below',
  2: 'right',
  3: 'above left',
  4: 'left',
  5: 'below right',
  6: 'above right',
  7: 'above left',
}

// Only the 6 silhouette edges whose midpoints lie on the outer boundary of the
// projected figure — labels pushed outward never overlap with interior cube lines.
// Excluded: [1,5] (idx 3), [4,5] (idx 5), [5,6] (idx 7) whose midpoints are interior.
const OUTER_EDGE_INDICES = [0, 1, 2, 4, 6, 8]

// Label positions for task points on the outer silhouette edges (by VIS_EDGES index)
const EPOS: Record<number, string> = {
  0: 'below', // [0,1] bottom front
  1: 'left', // [0,4] left front vertical
  2: 'below right', // [1,2] bottom right diagonal
  4: 'right', // [2,6] right back vertical
  6: 'above left', // [4,7] top left diagonal
  8: 'above', // [6,7] top back
}

// Tick division types: ticks drawn on edge, pts are the candidate task-point positions
const DIVS = [
  { ticks: [1 / 2], pts: [1 / 2] },
  { ticks: [1 / 3, 2 / 3], pts: [1 / 3, 2 / 3] },
  { ticks: [1 / 4, 2 / 4, 3 / 4], pts: [1 / 4, 2 / 4, 3 / 4] },
]

function bareme(ps: number[]): [number, number] {
  // 1 point per vector if all 3 components are correct
  let pts = 0
  for (let v = 0; v < 3; v++) {
    const b = v * 3
    pts += ps[b] * ps[b + 1] * ps[b + 2]
  }
  return [pts, 3]
}

/**
 * Composantes de vecteurs dans un repère orthonormé construit sur un cube unité.
 * Option "sommets" : tous les points sont des sommets du cube (composantes entières).
 * Option par défaut : les points B, C, D sont sur des arêtes (composantes fractionnaires).
 *
 * @author Nathan Scheinmann (d'après TSG2-10 de Stéphane Guyon)
 */
export default class VecteursRepCube extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.besoinFormulaireCaseACocher = ['Seulement des sommets']
    this.sup = false
  }

  nouvelleVersion() {
    const lang = getLang()
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const sommets = this.sup === true
      const fr = FRAMES[randint(0, 3)]

      // Task point A: one of the 4 vertices not used as O/I/J/K (avoids label conflict)
      const vA = choice(fr.unlabeled)
      const cA = fr.coords(...V[vA])

      let cB!: [number, number, number]
      let cC!: [number, number, number]
      let cD!: [number, number, number]
      let pB!: PointAbstrait
      let pC!: PointAbstrait
      let pD!: PointAbstrait
      const tickSegs: ReturnType<typeof segment>[] = []

      if (sommets) {
        // Option 1 : B, C, D at the remaining 3 unlabeled vertices
        const vB = choice(fr.unlabeled, vA)
        const vC = choice(fr.unlabeled, [vA, vB])
        const vD = choice(fr.unlabeled, [vA, vB, vC])
        cB = fr.coords(...V[vB])
        cC = fr.coords(...V[vC])
        cD = fr.coords(...V[vD])
        pB = vert2d(vB, 'B', VPOS[vB])
        pC = vert2d(vC, 'C', VPOS[vC])
        pD = vert2d(vD, 'D', VPOS[vD])
      } else {
        // Option 2 : B, C, D on 3 distinct outer-silhouette edges with tick-mark divisions
        const eA = choice(OUTER_EDGE_INDICES)
        const eB = choice(OUTER_EDGE_INDICES, eA)
        const eC = choice(OUTER_EDGE_INDICES, [eA, eB])

        const mkPt = (
          eIdx: number,
          name: string,
        ): { pt: PointAbstrait; c: [number, number, number] } => {
          const [v1, v2] = VIS_EDGES[eIdx]
          const div = DIVS[randint(0, 2)]
          const t = div.pts[randint(0, div.pts.length - 1)]
          tickSegs.push(...edgeTicks(v1, v2, div.ticks))
          return {
            pt: edgePt2d(v1, v2, t, name, EPOS[eIdx]),
            c: fr.coords(...edgeCoords3d(v1, v2, t)),
          }
        }

        const rB = mkPt(eA, 'B')
        const rC = mkPt(eB, 'C')
        const rD = mkPt(eC, 'D')
        pB = rB.pt
        cB = rB.c
        pC = rC.pt
        cC = rC.c
        pD = rD.pt
        cD = rD.c
      }

      // Vectors AB, AC, AD in the chosen frame
      const AB: [number, number, number] = [
        cB[0] - cA[0],
        cB[1] - cA[1],
        cB[2] - cA[2],
      ]
      const AC: [number, number, number] = [
        cC[0] - cA[0],
        cC[1] - cA[1],
        cC[2] - cA[2],
      ]
      const AD: [number, number, number] = [
        cD[0] - cA[0],
        cD[1] - cA[1],
        cD[2] - cA[2],
      ]

      // Figure: cube outline + tick marks + labeled points O, I, J, K, A, B, C, D
      const pO = vert2d(fr.origin, 'O', VPOS[fr.origin])
      const pI = vert2d(fr.iEnd, 'I', VPOS[fr.iEnd])
      const pJ = vert2d(fr.jEnd, 'J', VPOS[fr.jEnd])
      const pK = vert2d(fr.kEnd, 'K', VPOS[fr.kEnd])
      const pA = vert2d(vA, 'A', VPOS[vA])

      const vPts = V.map((_, idx) => vert2d(idx))
      const visSegs = VIS_EDGES.map(([v1, v2]) =>
        segment(vPts[v1], vPts[v2], 'black'),
      )
      const hidSegs = HID_EDGES.map(([v1, v2]) => {
        const s = segment(vPts[v1], vPts[v2], 'black')
        s.pointilles = 3
        return s
      })

      const objets = [
        ...visSegs,
        ...hidSegs,
        ...tickSegs,
        labelPoint(pO, pI, pJ, pK, pA, pB, pC, pD),
      ]

      const rep =
        '$(O,\\overrightarrow{OI},\\overrightarrow{OJ},\\overrightarrow{OK})$'

      const fig = mathalea2d(
        Object.assign(
          { scale: 0.6, display: 'inline' } as const,
          fixeBordures(objets),
        ),
        objets,
        tracePoint(pO),
        tracePoint(pI),
        tracePoint(pJ),
        tracePoint(pK),
        tracePoint(pA),
        tracePoint(pB),
        tracePoint(pC),
        tracePoint(pD),
      )

      const intro = sommets
        ? 'On considère le cube unité dans un repère orthonormé ' + rep + '.'
        : 'On considère le cube unité dans un repère orthonormé ' +
          rep +
          ', dont les côtés sont partagés régulièrement comme indiqué par les marquages.'

      let texte =
        intro +
        '<br>' +
        fig +
        '<br>' +
        `Déterminer les ${lang === 'fr-CH' ? 'composantes' : 'coordonnées'} des vecteurs $\\overrightarrow{AB}$, $\\overrightarrow{AC}$ et $\\overrightarrow{AD}$.`

      if (this.interactif) {
        texte +=
          '<br>' +
          addMultiMathfield(this, i, {
            dataTemplate:
              `$\\overrightarrow{AB}($%{field0}$~;~$%{field1}$~;~$%{field2}$)$, ` +
              `$\\overrightarrow{AC}($%{field3}$~;~$%{field4}$~;~$%{field5}$)$, ` +
              `$\\overrightarrow{AD}($%{field6}$~;~$%{field7}$~;~$%{field8}$)$`,
            dataOptions: Object.fromEntries(
              [
                'field0',
                'field1',
                'field2',
                'field3',
                'field4',
                'field5',
                'field6',
                'field7',
                'field8',
              ].map((f) => [
                f,
                { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              ]),
            ),
          })

        handleAnswers(
          this,
          i,
          {
            bareme,
            field0: { value: frac(AB[0]) },
            field1: { value: frac(AB[1]) },
            field2: { value: frac(AB[2]) },
            field3: { value: frac(AC[0]) },
            field4: { value: frac(AC[1]) },
            field5: { value: frac(AC[2]) },
            field6: { value: frac(AD[0]) },
            field7: { value: frac(AD[1]) },
            field8: { value: frac(AD[2]) },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      }

      const cv = (name: string, [x, y, z]: [number, number, number]) =>
        `$\\overrightarrow{${name}} = \\begin{pmatrix}${miseEnEvidence(frac(x))}\\\\` +
        `${miseEnEvidence(frac(y))}\\\\${miseEnEvidence(frac(z))}\\end{pmatrix}$`

      const texteCorr =
        `Dans le repère ${rep}, les ${lang === 'fr-CH' ? 'composantes' : 'coordonnées'} sont données par :<br>` +
        cv('AB', AB) +
        ',' +
        sp(2) +
        cv('AC', AC) +
        sp(2) +
        'et' +
        sp(2) +
        cv('AD', AD) +
        '.'

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
