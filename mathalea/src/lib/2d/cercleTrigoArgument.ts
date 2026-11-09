import { cercleCentrePoint } from './cercle'
import type { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { latexParPoint } from './textes'
import { tracePoint } from './TracePoint'
import { bleuMathalea } from '../colors'
import { mathalea2d } from '../../modules/mathalea2d'

/** Valeurs exactes de cos(k×π/6) pour k de 0 à 11, écrites n/2 × √rad. */
const COS: { n: number; rad: 1 | 3 }[] = [
  { n: 2, rad: 1 },
  { n: 1, rad: 3 },
  { n: 1, rad: 1 },
  { n: 0, rad: 1 },
  { n: -1, rad: 1 },
  { n: -1, rad: 3 },
  { n: -2, rad: 1 },
  { n: -1, rad: 3 },
  { n: -1, rad: 1 },
  { n: 0, rad: 1 },
  { n: 1, rad: 1 },
  { n: 1, rad: 3 },
]

type Valeur = { n: number; rad: 1 | 3 }

const cosK = (k: number): Valeur => COS[((k % 12) + 12) % 12]
const sinK = (k: number): Valeur => cosK(k - 3)

/** Valeur numérique de n/2 × √rad. */
const nombre = ({ n, rad }: Valeur) => (n / 2) * (rad === 3 ? Math.sqrt(3) : 1)

/** Écriture LaTeX de n/2 × √rad. */
function texValeur({ n, rad }: Valeur): string {
  if (n === 0) return '0'
  const signe = n < 0 ? '-' : ''
  if (Math.abs(n) === 2) return `${signe}1`
  return rad === 1 ? `${signe}\\dfrac{1}{2}` : `${signe}\\dfrac{\\sqrt{3}}{2}`
}

/** Argument kπ/6 ramené dans ]-π ; π], en LaTeX. */
function texArgument(k: number): string {
  const kk = k > 6 ? k - 12 : k
  if (kk === 0) return '0'
  const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b))
  const g = pgcd(Math.abs(kk), 6)
  const p = kk / g
  const q = 6 / g
  const numerateur = Math.abs(p) === 1 ? '\\pi' : `${Math.abs(p)}\\pi`
  const signe = p < 0 ? '-' : ''
  return q === 1
    ? `${signe}${numerateur}`
    : `${signe}\\dfrac{${numerateur}}{${q}}`
}

/** Valeurs remarquables portées sur les axes (hors 0). */
const VALEURS_AXES: Valeur[] = [
  { n: -2, rad: 1 },
  { n: -1, rad: 3 },
  { n: -1, rad: 1 },
  { n: 1, rad: 1 },
  { n: 1, rad: 3 },
  { n: 2, rad: 1 },
]

const memeValeur = (a: Valeur, b: Valeur) =>
  Math.abs(nombre(a) - nombre(b)) < 1e-9

/**
 * Cercle trigonométrique gradué en toutes les valeurs remarquables de
 * ]-π ; π] (sur le cercle et sur les axes). Seuls l'argument kπ/6 de
 * l'exercice, écrit à l'extérieur du cercle, et ses cos et sin, écrits sur les
 * axes, sont étiquetés ; rayon, point et pointillés sont en bleu.
 * @param k Entier tel que l'argument vaut k×π/6 (modulo 12)
 */
export function figureCercleTrigoArgument(k: number): string {
  const r = 5
  const kMod = ((k % 12) + 12) % 12
  const kk = kMod > 6 ? kMod - 12 : kMod
  const cos = cosK(kk)
  const sin = sinK(kk)
  const O = pointAbstrait(0, 0)
  const I = pointAbstrait(r, 0)
  const A = pointAbstrait(r * nombre(cos), r * nombre(sin))
  const objets: ObjetMathalea2D[] = [cercleCentrePoint(O, I)]
  const etiquette = (
    texte: string,
    x: number,
    y: number,
    couleur = 'black',
    largeur = 40,
  ) =>
    latexParPoint(
      texte,
      pointAbstrait(x, y, '', 'center'),
      couleur,
      largeur,
      12,
      'white',
      6,
    )

  // Axes
  objets.push(
    segment(
      pointAbstrait(-r - 1.3, 0),
      pointAbstrait(r + 1.3, 0),
      'black',
      '->',
    ),
    segment(
      pointAbstrait(0, -r - 1.3),
      pointAbstrait(0, r + 1.3),
      'black',
      '->',
    ),
  )

  // Les graduations de chaque axe sont du côté opposé à A pour ne pas gêner les pointillés
  const dessous = A.y >= 0
  const gauche = A.x >= 0
  for (const v of VALEURS_AXES) {
    const x = r * nombre(v)
    const actifCos = memeValeur(v, cos)
    const actifSin = memeValeur(v, sin)
    const couleurCos = actifCos ? bleuMathalea : 'gray'
    const couleurSin = actifSin ? bleuMathalea : 'gray'
    objets.push(
      segment(
        pointAbstrait(x, -0.15),
        pointAbstrait(x, 0.15),
        couleurCos,
      ),
      segment(
        pointAbstrait(-0.15, x),
        pointAbstrait(0.15, x),
        couleurSin,
      ),
    )
    const aLExterieur = Math.abs(v.n) === 2
    if (actifCos) {
      objets.push(
        etiquette(
          texValeur(v),
          aLExterieur ? Math.sign(x) * (r + 0.55) : x,
          (dessous ? -1 : 1) * 0.7,
          couleurCos,
        ),
      )
    }
    if (actifSin) {
      objets.push(
        etiquette(
          texValeur(v),
          (gauche ? -1 : 1) * 0.8,
          aLExterieur ? Math.sign(x) * (r + 0.4) : x,
          couleurSin,
        ),
      )
    }
  }

  // Arguments remarquables à l'extérieur du cercle
  for (let j = -5; j <= 6; j++) {
    const angle = (j * Math.PI) / 6
    const actif = j === kk
    let x = (r + 1.2) * Math.cos(angle)
    let y = (r + 1.2) * Math.sin(angle)
    if (j === 0) {
      x = r + 1.4
      y = 0.6
    } else if (j === 6) {
      x = -r - 1.4
      y = 0.6
    } else if (j % 3 === 0) {
      x = 0.8
      y = Math.sign(y) * (r + 0.9)
    }
    if (actif) {
      objets.push(etiquette(texArgument(j), x, y, bleuMathalea, 50))
    }
    objets.push(
      segment(
        pointAbstrait((r - 0.15) * Math.cos(angle), (r - 0.15) * Math.sin(angle)),
        pointAbstrait((r + 0.15) * Math.cos(angle), (r + 0.15) * Math.sin(angle)),
        actif ? bleuMathalea : 'gray',
      ),
    )
  }

  // Rayon, point et pointillés
  const rayon = segment(O, A, bleuMathalea)
  rayon.epaisseur = 3
  objets.push(rayon)
  if (Math.abs(A.y) > 1e-6) {
    const projection = segment(A, pointAbstrait(A.x, 0), bleuMathalea)
    projection.pointilles = 5
    objets.push(projection)
  }
  if (Math.abs(A.x) > 1e-6) {
    const projection = segment(A, pointAbstrait(0, A.y), bleuMathalea)
    projection.pointilles = 5
    objets.push(projection)
  }
  objets.push(tracePoint(A, bleuMathalea))

  return mathalea2d(
    { xmin: -r - 2.6, xmax: r + 2.6, ymin: -r - 2, ymax: r + 2, scale: 0.7 },
    ...objets,
  )
}
