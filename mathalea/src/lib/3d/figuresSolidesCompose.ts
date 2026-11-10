import { pointAbstrait } from '../2d/PointAbstrait'
import { polyline } from '../2d/Polyline'
import { fixeBordures } from '../2d/fixeBordures'
import { segment } from '../2d/segmentsVecteurs'
import { latex2d } from '../2d/textes'
import { codageAngleDroit } from '../2d/CodageAngleDroit'
import { cylindre, ellipse, Ellipse, semiEllipse } from '../2d/projections3d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import { mathalea2d } from '../../modules/mathalea2d'
import { pave3d } from './3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { pyramide3d } from './3dProjectionMathalea2d/Pyramide3dPerspectiveCavaliere'
import {
  type Arete3d,
  point3d,
  polygone3d,
} from './3dProjectionMathalea2d/elementsEtTransformations3d'

type Objets = NestedObjetMathalea2dArray

/** Plus grande dimension (en cm) d'une figure : le dessin est mis à l'échelle. */
const TAILLE = 4.2

/**
 * Outils communs : point 3D à l'échelle du dessin, étiquette de dimension
 * placée près d'un point (décalage en cm) et segment en pointillés.
 */
function outils(plusGrande: number) {
  const k = TAILLE / plusGrande
  const P = (x: number, y: number, z: number) => point3d(k * x, k * y, k * z)
  const etiquette = (
    latex: string,
    x: number,
    y: number,
    z: number,
    dx: number,
    dy: number,
  ) => {
    const M = P(x, y, z)
    return latex2d(`${latex}\\text{ cm}`, M.c2d.x + dx, M.c2d.y + dy, {
      letterSize: 'scriptsize',
    })
  }
  const pointilles = (A: ReturnType<typeof P>, B: ReturnType<typeof P>) => {
    const s = segment(A.c2d, B.c2d, 'black')
    s.pointilles = 2
    return s
  }
  /** Petit angle droit au pied (x, y, z) d'une hauteur verticale. */
  const angleDroit = (x: number, y: number, z: number) => {
    const c = 0.22 / k
    return polyline(
      [P(x + c, y, z).c2d, P(x + c, y, z + c).c2d, P(x, y, z + c).c2d],
      'black',
    )
  }
  return { k, P, etiquette, pointilles, angleDroit }
}

/** Convertit une liste d'objets en figure (HTML, LaTeX ou Typst selon le contexte). */
export function dessine(objets: Objets): string {
  return mathalea2d(
    {
      ...fixeBordures(objets, { rxmin: -1.2, rxmax: 1.2 }),
      pixelsParCm: 30,
      scale: 0.8,
      center: true,
      centerLatex: true,
    },
    objets,
  )
}

/** Pavé droit à base carrée surmonté d'une pyramide de même base. */
export function figurePavePyramide(a: number, h: number, H: number): string {
  const { P, etiquette, pointilles, angleDroit } = outils(Math.max(a, h + H))
  // Hauteur de la pyramide cotée hors du solide, à gauche de son arête avant
  // gauche, au-dessus de l'arête du fond du pavé (même placement que le cône)
  const [S, A, F] = [P(a / 2, a / 2, h + H).c2d, P(0, 0, h).c2d, P(0, a, h).c2d]
  const yH = Math.min(Math.max((A.y + S.y) / 2, F.y + 0.3), S.y - 0.1)
  const xH = A.x + ((S.x - A.x) * (yH - A.y)) / (S.y - A.y) - 0.75
  const haut = polygone3d(
    [P(0, 0, h), P(a, 0, h), P(a, a, h), P(0, a, h)],
    'black',
  )
  return dessine([
    // Les arêtes du dessus du pavé sont celles de la base de la pyramide, qui
    // les dessine en pointillés quand elle les cache.
    ...pave3d(P(0, 0, 0), P(a, 0, 0), P(0, 0, h), P(0, a, 0))
      .aretes.filter(
        (A: Arete3d) => A.extremite1.z === 0 || A.extremite2.z === 0,
      )
      .map((A: Arete3d) => A.c2d),
    ...pyramide3d(haut, P(a / 2, a / 2, h + H)).c2d,
    pointilles(P(a / 2, a / 2, h), P(a / 2, a / 2, h + H)),
    angleDroit(a / 2, a / 2, h),
    etiquette(`${a}`, a / 2, 0, 0, 0, -0.35),
    etiquette(`${h}`, 0, 0, h / 2, -0.7, 0),
    cote(H, xH, yH),
  ] as Objets)
}

/**
 * Cylindre debout de projections3d.ts (celui des figures du brevet), sans son
 * cercle du haut : ce qui le surmonte (cône, demi-boule) en cache le derrière
 * et le redessine.
 */
function cylindreSansHaut(R: number, H: number): Objets {
  const c = cylindre({ centre: pointAbstrait(0, 0), rx: R, hauteur: H })
  return (c.objets ?? []).filter((o) => !(o instanceof Ellipse))
}

/** Texte de dimension « 6 cm » posé à (x ; y), en cm sur le dessin. */
const cote = (valeur: number, x: number, y: number, fond = false) =>
  latex2d(`${valeur}\\text{ cm}`, x, y, {
    letterSize: 'scriptsize',
    ...(fond ? { backgroundColor: 'white' } : {}),
  })

/** Segment en pointillés de (x1 ; y1) à (x2 ; y2), en cm sur le dessin. */
function tirets(x1: number, y1: number, x2: number, y2: number) {
  const s = segment(x1, y1, x2, y2, 'black')
  s.pointilles = 2
  return s
}

/** Cylindre surmonté d'un cône de même base. */
export function figureCylindreCone(r: number, h: number, H: number): string {
  const k = TAILLE / Math.max(2 * r, h + H)
  const [R, Hc, Hk] = [k * r, k * h, k * H]
  const O = pointAbstrait(0, Hc)
  const yH = Math.min(Math.max(Hc + Hk / 2, Hc + R / 3 + 0.3), Hc + Hk - 0.1)
  // cone() relie le sommet aux extrémités de l'ellipse, ce qui n'est juste que
  // pour un cône haut : sur un cône plat, le derrière du cercle dépasse des
  // génératrices. Elles touchent en fait l'ellipse en ses points de tangence,
  // d'angle t (sin t = ry / Hk) ; entre eux, le derrière est caché.
  const ry = R / 3
  const t = Math.asin(ry / Hk)
  const arc = (de: number, a: number) => {
    const points = []
    for (let i = 0; i <= 40; i++) {
      const u = de + ((a - de) * i) / 40
      points.push(pointAbstrait(R * Math.cos(u), Hc + ry * Math.sin(u)))
    }
    return polyline(points, 'black')
  }
  const cache = arc(t, Math.PI - t)
  cache.pointilles = 1
  const [xT, yT] = [R * Math.cos(t), Hc + ry * Math.sin(t)]
  const xH = -xT * (1 - (yH - yT) / (Hc + Hk - yT))
  return dessine([
    ...cylindreSansHaut(R, Hc),
    // Devant : d'un point de tangence à l'autre par le bas
    arc(Math.PI - t, 2 * Math.PI + t),
    cache,
    segment(-xT, yT, 0, Hc + Hk, 'black'),
    segment(xT, yT, 0, Hc + Hk, 'black'),
    tirets(0, Hc, 0, Hc + Hk),
    codageAngleDroit(
      pointAbstrait(R, Hc),
      O,
      pointAbstrait(0, Hc + Hk),
      'black',
      0.3,
    ),
    tirets(0, 0, R, 0),
    cote(r, R / 2, -R / 3 - 0.3),
    cote(h, R + 0.75, Hc / 2),
    // Hauteur du cône à gauche de la génératrice, au-dessus du cercle du haut
    cote(H, xH - 0.85, yH),
  ] as Objets)
}

/** Cylindre surmonté d'une demi-boule de même rayon. */
export function figureCylindreDemiBoule(r: number, h: number): string {
  const k = TAILLE / Math.max(2 * r, h + r)
  const [R, Hc] = [k * r, k * h]
  const centre = pointAbstrait(0, Hc)
  return dessine([
    ...cylindreSansHaut(R, Hc),
    // Cercle du haut, derrière caché par la demi-boule, comme la base de cone()
    semiEllipse({
      centre,
      rx: R,
      ry: R / 3,
      hemisphere: 'nord',
      pointilles: 1,
    }),
    semiEllipse({ centre, rx: R, ry: R / 3, hemisphere: 'sud' }),
    // Contour apparent de la demi-boule : demi-cercle de même rayon
    semiEllipse({ centre, rx: R, ry: R, hemisphere: 'nord' }),
    tirets(0, Hc, R, Hc),
    // Sous le rayon s'il y a la place devant, sinon au-dessus, sur fond blanc
    // (le texte passe alors sur le derrière, en pointillés, du cercle)
    R / 3 > 0.45 ? cote(r, R / 2, Hc - 0.25) : cote(r, R / 2, Hc + 0.3, true),
    cote(h, R + 0.75, Hc / 2),
  ] as Objets)
}

/** Pavé droit traversé de haut en bas par un trou en forme de pavé. */
export function figurePaveCreuxPave(
  L: number,
  l: number,
  h: number,
  b: number,
  a: number,
): string {
  const { P, etiquette, pointilles } = outils(Math.max(L, h + l / 2))
  const x0 = (L - b) / 2
  const y0 = (l - a) / 2
  const coins: [number, number][] = [
    [x0, y0],
    [x0 + b, y0],
    [x0 + b, y0 + a],
    [x0, y0 + a],
  ]
  const trou = polygone3d(
    coins.map(([x, y]) => P(x, y, h)),
    'black',
  )
  // Le trou traverse le pavé : ses arêtes verticales et son contour du bas sont cachés.
  const cachees = coins.flatMap(([x, y], i) => {
    const [xs, ys] = coins[(i + 1) % 4]
    return [
      pointilles(P(x, y, 0), P(x, y, h)),
      pointilles(P(x, y, 0), P(xs, ys, 0)),
    ]
  })
  return dessine([
    ...pave3d(P(0, 0, 0), P(L, 0, 0), P(0, 0, h), P(0, l, 0)).c2d,
    ...cachees,
    ...trou.c2d,
    etiquette(`${L}`, L / 2, 0, 0, 0, -0.35),
    etiquette(`${h}`, 0, 0, h / 2, -0.7, 0),
    etiquette(`${l}`, L, l / 2, 0, 0.8, -0.1),
  ] as Objets)
}

/** Pavé droit percé de haut en bas par un trou cylindrique. */
export function figurePaveCreuxCylindre(
  L: number,
  l: number,
  h: number,
  r: number,
): string {
  const { k, P, etiquette } = outils(Math.max(L, h + l / 2))
  // Ouvertures du trou dessinées comme le cylindre de projections3d.ts :
  // ellipses à plat, d'aplatissement 1/4 pour rester dans la face du dessus.
  const [R, ry] = [k * r, (k * r) / 4]
  const haut = P(L / 2, l / 2, h).c2d
  const bas = P(L / 2, l / 2, 0).c2d
  const ouvertureBas = ellipse(bas, R, ry, 'black')
  ouvertureBas.pointilles = 2
  return dessine([
    ...pave3d(P(0, 0, 0), P(L, 0, 0), P(0, 0, h), P(0, l, 0)).c2d,
    ouvertureBas,
    tirets(haut.x - R, haut.y, bas.x - R, bas.y),
    tirets(haut.x + R, haut.y, bas.x + R, bas.y),
    ellipse(haut, R, ry, 'black'),
    tirets(haut.x, haut.y, haut.x + R, haut.y),
    // Rayon coté dans le trou, sous l'ouverture, s'il est assez large
    R > 0.6
      ? cote(r, haut.x, haut.y - ry - 0.3)
      : cote(r, haut.x + R + 0.6, haut.y),
    etiquette(`${L}`, L / 2, 0, 0, 0, -0.35),
    etiquette(`${h}`, 0, 0, h / 2, -0.7, 0),
    etiquette(`${l}`, L, l / 2, 0, 0.8, -0.1),
  ] as Objets)
}
