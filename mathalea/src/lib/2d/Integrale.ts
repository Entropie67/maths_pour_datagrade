import { bleuMathalea } from '../../lib/colors'
import { inferieurouegal } from '../../modules/outils'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import type { IRepere } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { motifs } from './pattern'
import { pointAbstrait } from './PointAbstrait'
import { polygone } from './polygones'

/**
 * Trace l'aire entre la courbe d'une fonction et l'axe des abscisses
 * @param {function} f fonction dont on veut tracer l'aire entre sa courbe et l'axe des abscisses comme par exemple : const f = x => a * x ** 2 + b * x + c
 * @param {Object} parametres À saisir entre accolades
 * @param {Repere} [parametres.repere  = {}]  Repère dans lequel le tracé de la fonction se fait
 * @param {string} [parametres.color = 'black']  Couleur du contour de l'aire : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.epaisseur = 2]  Epaisseur du contour de l'aire
 * @param {string} [parametres.couleurDeRemplissage = bleuMathalea]  Couleur de l'intérieur de l'aire : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.opacite = 0.5] Taux d'opacité du remplissage entre 0 et 1
 * @param {number} [parametres.hachures = 0] Style des hachures dans cette aire (entier entre 0 et 10).
 * @param {boolean|number} [parametres.step = false] Si false, le pas entre deux abscisses pour tracer l'aire est 0.2/xUnite. Sinon, ce pas vaut la valeur indiquée.
 * @param {number} [parametres.a = 0]  Abscisse minimale du tracé de la courbe avec a < b
 * @param {number} [parametres.b = 1]  Abscisse maximale du tracé de la courbe avec a < b
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur du contour de l'aire. À associer obligatoirement à colorToLatexOrHTML().
 * @property {string} couleurDeRemplissage Couleur de l'intérieur de l'aire. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} xUnite Unité des abscisses du repère
 * @property {number} yUnite Unité des ordonnées du repère
 * @property {number} ymin Ordonnée minimale du repère
 * @property {number} ymax Ordonnée maximale du repère
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class Integrale extends ObjetMathalea2D {
  constructor(
    f: (x: number) => number,
    {
      repere,
      color = 'black',
      couleurDeRemplissage = bleuMathalea,
      epaisseur = 2,
      step = false,
      a = 0,
      b = 1,
      opacite = 0.5,
      hachures = 0,
    }: {
      repere?: IRepere
      color?: string
      epaisseur?: number
      couleurDeRemplissage?: string
      step?: boolean | number
      a?: number
      b?: number
      opacite?: number
      hachures?: number
    } = {},
  ) {
    super()
    this.objets = []
    const ymin = repere?.yMin ?? -10
    const ymax = repere?.yMax ?? 10
    const xunite = repere?.xUnite ?? 1
    const yunite = repere?.yUnite ?? 1

    const objets = []
    const points = []
    let pas: number
    if (!step) {
      pas = 0.2 / xunite
    } else {
      pas = Number(step)
    }
    for (let x = a; inferieurouegal(x, b); x += pas) {
      if (x > b) x = b // normalement x<xMax... mais inférieurouegal ne compare qu'à 0.0000001 près, on peut donc avoir xMax+epsilon qui sort de l'intervalle de déf
      if (isFinite(f(x))) {
        if (f(x) < ymax + 1 && f(x) > ymin - 1) {
          points.push(pointAbstrait(x * xunite, f(x) * yunite))
        } else {
          window.notify(
            "Erreur dans Integrale : Il semble que la fonction ne soit pas continue sur l'intervalle",
            {
              f,
              a,
              b,
            },
          )
        }
      } else {
        x += 0.05
      }
    }
    points.push(
      pointAbstrait(b * xunite, f(b) * yunite),
      pointAbstrait(b * xunite, 0),
      pointAbstrait(a * xunite, 0),
    )
    const p = polygone([...points], color)
    p.epaisseur = epaisseur
    p.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
    p.opaciteDeRemplissage = opacite
    p.hachures = hachures !== -1 ? motifs(hachures) : false
    this.bordures = repere?.bordures as unknown as [
      number,
      number,
      number,
      number,
    ]
    objets.push(p)
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\n\t${objet.svg(coeff)}\n`
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

  svgml(coeff: number, amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.svgml === 'undefined')
        code += `\n\t${objet.svg(coeff)}\n`
      else code += `\n\t${objet.svgml(coeff, amp)}\n`
    }
    return code
  }

  tikzml(amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.tikzml === 'undefined') code += `\t${objet.tikz()}\n`
      else code += `\t${objet.tikzml(amp)}\n`
    }
    return code
  }
}
/**
 * Trace l'aire entre la courbe d'une fonction et l'axe des abscisses
 * @param {function} f fonction dont on veut tracer l'aire entre sa courbe et l'axe des abscisses comme par exemple : const f = x => a * x ** 2 + b * x + c
 * @param {Object} parametres À saisir entre accolades
 * @param {Repere} [parametres.repere  = {}]  Repère dans lequel le tracé de la fonction se fait
 * @param {string} [parametres.color = 'black']  Couleur du contour de l'aire : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.epaisseur = 2]  Epaisseur du contour de l'aire
 * @param {string} [parametres.couleurDeRemplissage = bleuMathalea]  Couleur de l'intérieur de l'aire : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.opacite = 0.5] Taux d'opacité du remplissage entre 0 et 1
 * @param {number} [parametres.hachures = 0] Style des hachures dans cette aire (entier entre 0 et 10).
 * @param {boolean|number} [parametres.step = false] Si false, le pas entre deux abscisses pour tracer l'aire est 0.2/xUnite. Sinon, ce pas vaut la valeur indiquée.
 * @param {number} [parametres.a = 0]  Abscisse minimale du tracé de la courbe avec a < b
 * @param {number} [parametres.b = 1]  Abscisse maximale du tracé de la courbe avec a < b
 * @example integrale(g, {repere: r})
 * // Trace avec une épaisseur de 2, l'aire entre la courbe de la fonction g et l'axe des abscisses dans le repère r, tous deux précédemment définis.
 * @example integrale(g,  {repere: r, epaisseur: 5, color: bleuMathalea, couleurDeRemplissage: 'red'})
 * // Trace avec une épaisseur de 5, l'aire entre la courbe de la fonction g et l'axe des abscisses dans le repère r, tous deux précédemment définis. L'aire est entourée de bleu et remplie de rouge.
 * @author Rémi Angot
 * @return {Integrale}
 */
// JSDOC Validee par EE Juin 2022

export function integrale(
  f: (x: number) => number,
  {
    repere,
    color = 'black',
    couleurDeRemplissage = bleuMathalea,
    epaisseur = 2,
    step = false,
    a = 0,
    b = 1,
    opacite = 0.5,
    hachures = 0,
  }: {
    repere?: IRepere
    color?: string
    epaisseur?: number
    couleurDeRemplissage?: string
    step?: boolean | number
    a?: number
    b?: number
    opacite?: number
    hachures?: number
  } = {},
) {
  return new Integrale(f, {
    repere,
    color,
    couleurDeRemplissage,
    epaisseur,
    step,
    a,
    b,
    opacite,
    hachures,
  })
}
