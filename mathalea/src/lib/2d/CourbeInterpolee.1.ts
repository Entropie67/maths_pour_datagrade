import { Courbe, courbe } from './Courbe'
import type { IRepere } from './Interfaces'
import { cosineInterpolate } from './InterpolationCosinusoidale'
import { ObjetMathalea2D } from './ObjetMathalea2D'

/**
 * Trace la courbe d'une fonction interpolée, linéaire par parties, dans un repère
 * @param {Array.number[]} tableau Ce tableau de tableaux contient les coordonnées des points à rejoindre comme par exemple : [[-5,2],[-1,-7],[2,5],[3,-1]]
 * @param {Object} parametres À saisir entre accolades
 * @param {Repere} [parametres.repere  = { xMin: -1, yMin: 1 }] Repère dans lequel le tracé de la fonction se fait
 * @param {string} [parametres.color = 'black']  Couleur du tracé de la courbe : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.epaisseur = 2]  Epaisseur du tracé de la courbe
 * @param {number} [parametres.xMin = repere.xMin]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.xMax = repere.xMax]  Abscisse maximale du tracé de la courbe
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class CourbeInterpolee extends ObjetMathalea2D {
  courbes: Courbe[]
  constructor(
    tableau: number[][],
    {
      color = 'black',
      epaisseur = 2,
      repere,
      xMin,
      xMax,
      step = 0.2,
    }: {
      color?: string
      epaisseur?: number
      repere?: IRepere
      xMin?: number
      xMax?: number
      step?: number
    } = {},
  ) {
    super()
    this.courbes = []
    const xmin = xMin != null ? xMin : (repere?.xMin ?? -1)
    const xmax = xMax != null ? xMax : (repere?.xMax ?? 1)
    for (let i = 0; i < tableau.length - 1; i++) {
      const x0 = tableau[i][0]
      const y0 = tableau[i][1]
      const x1 = tableau[i + 1][0]
      const y1 = tableau[i + 1][1]
      const f = (x: number) => cosineInterpolate(y0, y1, (x - x0) / (x1 - x0))
      let depart, fin
      xmin > x0 ? (depart = xMin) : (depart = x0)
      xmax < x1 ? (fin = xMax) : (fin = x1)
      const c = courbe(f, {
        repere,
        xMin: depart,
        xMax: fin,
        color,
        epaisseur,
        step,
      })
      this.courbes.push(c)
    }
    const lesY = tableau.map((el) => el[1])
    const lesX = tableau.map((el) => el[0])
    this.bordures = [
      Math.min(...lesX),
      Math.min(...lesY),
      Math.max(...lesX),
      Math.max(...lesY),
    ]
  }

  svg(coeff: number) {
    let code = ''
    if (this.courbes == null) return code
    for (const objet of this.courbes) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.courbes == null) return code
    for (const objet of this.courbes) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}
/**
 * Trace la courbe d'une fonction interpolée, linéaire par parties, dans un repère
 * @param {Array.number[]} tableau Ce tableau de tableaux contient les coordonnées des points à rejoindre comme par exemple : [[-5,2],[-1,-7],[2,5],[3,-1]]
 * @param {Object} parametres À saisir entre accolades
 * @param {Repere} [parametres.repere  = {}]  Repère dans lequel le tracé de la fonction se fait
 * @param {string} [parametres.color = 'black']  Couleur du tracé de la courbe : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.epaisseur = 2]  Epaisseur du tracé de la courbe
 * @param {number} [parametres.xMin = repere.xMin]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.xMax = repere.xMax]  Abscisse maximale du tracé de la courbe
 * @param {number|false} [parametres.step] Le step pour le tracé de la courbe
 * @example courbeInterpolee(tab, {repere: r})
 * // Trace, en noir avec une épaisseur de 2, la courbe de la fonction interpolée sur les intervalles définis dans tab, dans le repère r, tous deux précédemment définis.
 * @example courbeInterpolee(tab, {repere: r, epaisseur: 5, color: bleuMathalea})
 * // Trace la courbe de la fonction interpolée sur les intervalles définis dans tab, dans le repère r, tous deux précédemment définis, en bleu avec une épaisseur de 5.
 * @author Rémi Angot
 * @return {CourbeInterpolee}
 */
// JSDOC Validee par EE Juin 2022

export function courbeInterpolee(
  tableau: number[][],
  {
    color = 'black',
    epaisseur = 1,
    repere,
    xMin = -10,
    xMax = 10,
    step = 0.2,
  }: {
    color?: string
    epaisseur?: number
    repere?: IRepere
    xMin?: number
    xMax?: number
    step?: number
  } = {},
) {
  return new CourbeInterpolee(tableau, {
    color,
    epaisseur,
    repere,
    xMin,
    xMax,
    step,
  })
}
