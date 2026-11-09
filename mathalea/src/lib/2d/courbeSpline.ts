import { inferieurouegal } from '../../modules/outils'
import type { Spline } from '../mathFonctions/Spline'
import type { IRepere } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { polyline } from './Polyline'
import { tracePoint } from './TracePoint'

/**
 * Trace la courbe d'une fonction, précédemment définie comme Spline, dans un repère
 * @param {Spline} f fonction à tracer défine, au préalable, avec splineCatmullRom()
 * @param {Object} parametres À saisir entre accolades
 * @param {Repere} [parametres.repere  = {}] Repère dans lequel le tracé de la fonction se fait
 * @param {string} [parametres.color = 'black']  Couleur du tracé de la courbe : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.epaisseur = 2]  Epaisseur du tracé de la courbe
 * @param {number} [parametres.xMin = repere.xMin]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.xMax = repere.xMax]  Abscisse maximale du tracé de la courbe
 * @param {number} [parametres.yMin = repere.yMin]  Ordonnée minimale du tracé de la courbe
 * @param {number} [parametres.yMax = repere.yMax]  Ordonnée maximale du tracé de la courbe
 * @param {boolean|number} [parametres.step = false] Si false, le pas entre deux abscisses du tracé de la fonction est 0.2/xUnite. Sinon, ce pas vaut la valeur indiquée.
 * @param {number} [parametres.xUnite = 1]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.yUnite = 1]  Abscisse maximale du tracé de la courbe
 * @param {boolean} [parametres.traceNoeuds = true]  Place (ou non) les points définis dans le paramètre f.
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur du tracé de la courbe. À associer obligatoirement à colorToLatexOrHTML().
 * @author Jean-claude Lhote
 * @class
 */
export class CourbeSpline extends ObjetMathalea2D {
  constructor(
    f: Spline,
    {
      repere,
      color = 'black',
      epaisseur = 2,
      step = false,
      xMin,
      xMax,
      yMin,
      yMax,
      xUnite = 1,
      yUnite = 1,
      traceNoeuds = true,
    }: {
      repere?: IRepere
      color?: string
      epaisseur?: number
      step?: boolean | number
      xMin?: number
      xMax?: number
      yMin?: number
      yMax?: number
      xUnite?: number
      yUnite?: number
      traceNoeuds?: boolean
    } = {},
  ) {
    super()
    this.objets = []

    const noeuds = []
    let points = []
    let xunite, yunite // Tout en minuscule pour les différencier des paramètres de la fonction
    xunite = repere?.xUnite ?? 1
    yunite = repere?.yUnite ?? 1
    const xmin = xMin == null ? (xMin = repere?.xMin ?? 0) : xMin
    const xmax = xMax == null ? (xMax = repere?.xMax ?? 0) : xMax
    const ymin = yMin == null ? (yMin = repere?.yMin ?? 0) : yMin
    const ymax = yMax == null ? (yMax = repere?.yMax ?? 0) : yMax

    if (isNaN(xunite)) {
      xunite = xUnite
    }

    if (isNaN(yunite)) {
      yunite = yUnite
    }
    if (f.x == null || f.y == null) {
      window.notify(
        "On ne peut pas tracer la courbe de cette spline : elle n'a pas de noeuds",
        { spline: JSON.stringify(f) },
      )
      return
    }
    if (traceNoeuds) {
      for (let i = 0; i < f.x.length; i++) {
        noeuds[i] = tracePoint(pointAbstrait(f.x[i], f.y[i]), 'black')
        noeuds[i].taille = 3
        noeuds[i].style = '+'
        noeuds[i].epaisseur = 2
        noeuds[i].opacite = 0.5
        this.objets.push(noeuds[i])
      }
    }
    let pas: number
    let p, y
    if (!step) {
      pas = 0.2 / xUnite
    } else {
      pas = Number(step)
    }
    for (let x = xmin; inferieurouegal(x, xmax); x = x + pas) {
      if (x > xmax) x = xmax // normalement x<xMax... mais inférieurouegal ne compare qu'à 0.0000001 près, on peut donc avoir xMax+epsilon qui sort de l'intervalle de déf
      y = f.image(x)
      if (!isNaN(y)) {
        if (y < ymax + 1 && y > ymin - 1) {
          points.push(pointAbstrait(x * xunite, y * yunite))
        } else if (points.length > 0) {
          p = polyline([...points], color)
          p.epaisseur = epaisseur
          p.opacite = 0.7
          this.objets.push(p)
          points = []
        }
      } else {
        x += 0.05
      }
    }
    p = polyline([...points], color)
    p.epaisseur = epaisseur
    p.opacite = 0.7
    this.objets.push(p)
    this.bordures = repere?.bordures as unknown as [
      number,
      number,
      number,
      number,
    ]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}

/**
 * Trace la courbe d'une fonction, précédemment définie comme Spline, dans un repère
 * @param {function} f fonction à tracer défine, au préalable, avec splineCatmullRom()
 * @param {Object} parametres À saisir entre accolades
 * @param {Repere} [parametres.repere  = {}] Repère dans lequel le tracé de la fonction se fait
 * @param {string} [parametres.color = 'black']  Couleur du tracé de la courbe : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.epaisseur = 2]  Epaisseur du tracé de la courbe
 * @param {number} [parametres.xMin = repere.xMin]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.xMax = repere.xMax]  Abscisse maximale du tracé de la courbe
 * @param {number} [parametres.yMin = repere.yMin]  Ordonnée minimale du tracé de la courbe
 * @param {number} [parametres.yMax = repere.yMax]  Ordonnée maximale du tracé de la courbe
 * @param {boolean|number} [parametres.step = false] Si false, le pas entre deux abscisses du tracé de la fonction est 0.2/xUnite. Sinon, ce pas vaut la valeur indiquée.
 * @param {number} [parametres.xUnite = 1]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.yUnite = 1]  Abscisse maximale du tracé de la courbe
 * @param {boolean} [parametres.traceNoeuds = true]  Place (ou non) les points définis dans le paramètre f.
 * @example courbeSpline(g, {repere: r})
 * // Trace, en noir avec une épaisseur de 2, la courbe spline g dans le repère r, tous deux précédemment définis.
 * @example courbeSpline(g, {repere: r, epaisseur: 5, color: bleuMathalea})
 * // Trace la courbe spline g dans le repère r, tous deux précédemment définis, en bleu, avec une épaisseur de 5.
 * @author Jean-claude Lhote
 * @return {CourbeSpline}
 */
// JSDOC Validee par EE Juin 2022

export function courbeSpline(
  f: Spline,
  {
    repere,
    color = 'black',
    epaisseur = 2,
    step = false,
    xMin,
    xMax,
    yMin,
    yMax,
    xUnite = 1,
    yUnite = 1,
    traceNoeuds = true,
  }: {
    repere?: IRepere
    color?: string
    epaisseur?: number
    step?: boolean | number
    xMin?: number
    xMax?: number
    yMin?: number
    yMax?: number
    xUnite?: number
    yUnite?: number
    traceNoeuds?: boolean
  } = {},
) {
  return new CourbeSpline(f, {
    repere,
    color,
    epaisseur,
    step,
    xMin,
    xMax,
    yMin,
    yMax,
    xUnite,
    yUnite,
    traceNoeuds,
  })
}
