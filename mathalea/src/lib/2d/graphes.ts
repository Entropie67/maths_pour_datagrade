import { mathalea2d } from '../../modules/mathalea2d'
import { arc } from './Arc'
import { cercle } from './cercle'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import type { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { polygone } from './polygones'
import { latex2d } from './textes'

/**
 * Figure d'un graphe (orienté ou non) donné par sa matrice d'adjacence.
 * Extrait de TEG1-21.
 *
 * @author Arnaud Meistermann
 */

/** Noms des sommets, dans l'ordre des lignes de la matrice d'adjacence. */
export const sommets = ['A', 'B', 'C', 'D', 'E', 'F']

/** Les sommets atteignables depuis le premier, en suivant les arcs. */
export function estConnexe(adj: number[][]): boolean {
  const vus = new Set([0])
  const pile = [0]
  while (pile.length > 0) {
    const i = pile.pop() as number
    adj[i].forEach((a, j) => {
      if (a === 1 && !vus.has(j)) {
        vus.add(j)
        pile.push(j)
      }
    })
  }
  return vus.size === adj.length
}

/**
 * Trace l'arc de cercle de centre (cx ; cy) et de rayon r partant de l'angle
 * a0 (en degrés) et balayant l'angle balayage (positif dans le sens direct).
 * Si fleche est vrai, l'arc est raccourci et terminé par une pointe pleine
 * dont le bout est exactement à l'extrémité de l'arc.
 */
function lienCourbe(
  objets: ObjetMathalea2D[],
  cx: number,
  cy: number,
  r: number,
  a0: number,
  balayage: number,
  fleche: boolean,
) {
  const longueurPointe = 0.25
  const demiLargeur = 0.1
  const surCercle = (angle: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  })
  const retrait = fleche
    ? Math.sign(balayage) *
      ((2 * Math.asin(longueurPointe / (2 * r)) * 180) / Math.PI)
    : 0
  const debut = surCercle(a0)
  const courbe = arc(
    pointAbstrait(debut.x, debut.y),
    pointAbstrait(cx, cy),
    balayage - retrait,
  )
  courbe.epaisseur = 1.2
  objets.push(courbe)
  if (!fleche) return
  const bout = surCercle(a0 + balayage)
  const base = surCercle(a0 + balayage - retrait)
  const tx = (bout.x - base.x) / longueurPointe
  const ty = (bout.y - base.y) / longueurPointe
  const pointe = polygone(
    pointAbstrait(bout.x, bout.y),
    pointAbstrait(base.x - demiLargeur * ty, base.y + demiLargeur * tx),
    pointAbstrait(base.x + demiLargeur * ty, base.y - demiLargeur * tx),
  )
  pointe.couleurDeRemplissage = colorToLatexOrHTML('black')
  pointe.opaciteDeRemplissage = 1
  objets.push(pointe)
}

/**
 * Sommets répartis sur un cercle, dans le sens des aiguilles d'une montre en
 * partant d'en haut à gauche : aucune arête ne passe par un autre sommet.
 */
export function figureGraphe(adj: number[][], oriente: boolean): string {
  const n = adj.length
  const rayon = 2.6
  const rayonSommet = 0.3
  // Les liens s'arrêtent sur le cercle de rayon marge autour de chaque sommet.
  const marge = rayonSommet + 0.05
  const positions = adj.map((_, i) => {
    const depart = n % 2 === 0 ? 90 + 180 / n : 90
    const angle = ((depart - (360 * i) / n) * Math.PI) / 180
    return { x: rayon * Math.cos(angle), y: rayon * Math.sin(angle) }
  })
  const objets: ObjetMathalea2D[] = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (adj[i][j] === 0 || (!oriente && j < i)) continue
      const P = positions[i]
      if (i === j) {
        // Boucle : cercle de centre C à l'extérieur du sommet, tracé de l'un à
        // l'autre de ses points d'intersection avec le cercle de rayon marge.
        const ux = P.x / rayon
        const uy = P.y / rayon
        const D = 0.6
        const r = 0.42
        const a = (D * D + marge * marge - r * r) / (2 * D)
        const beta =
          (Math.atan2(Math.sqrt(marge * marge - a * a), D - a) * 180) / Math.PI
        const phi = (Math.atan2(uy, ux) * 180) / Math.PI
        lienCourbe(
          objets,
          P.x + D * ux,
          P.y + D * uy,
          r,
          phi + 180 - beta,
          -(360 - 2 * beta),
          oriente,
        )
        continue
      }
      const Q = positions[j]
      const d = Math.hypot(Q.x - P.x, Q.y - P.y)
      const wx = (Q.x - P.x) / d
      const wy = (Q.y - P.y) / d
      // Chaque lien est un arc de cercle d'angle au centre alpha, raccourci de
      // la marge à chaque bout. Deux arcs de sens contraires sont bombés
      // chacun sur sa droite ; un lien seul est bombé vers l'extérieur.
      const mx = (P.x + Q.x) / 2
      const my = (P.y + Q.y) / 2
      const sens =
        oriente && adj[j][i] === 1 ? 1 : wy * mx - wx * my < 0 ? -1 : 1
      const alpha = 40
      const alphaRad = (alpha * Math.PI) / 180
      const R = d / 2 / Math.sin(alphaRad / 2)
      const h = d / 2 / Math.tan(alphaRad / 2)
      const cx = mx - sens * wy * h
      const cy = my + sens * wx * h
      const delta = (2 * Math.asin(marge / (2 * R)) * 180) / Math.PI
      const angleP = (Math.atan2(P.y - cy, P.x - cx) * 180) / Math.PI
      lienCourbe(
        objets,
        cx,
        cy,
        R,
        angleP + sens * delta,
        sens * (alpha - 2 * delta),
        oriente,
      )
    }
  }
  positions.forEach(({ x, y }, i) => {
    objets.push(cercle(pointAbstrait(x, y), rayonSommet, 'black', 'white'))
    objets.push(latex2d(sommets[i], x, y, {}))
  })
  return mathalea2d(
    Object.assign({}, fixeBordures(objets), { pixelsParCm: 40, scale: 0.8 }),
    objets,
  )
}
