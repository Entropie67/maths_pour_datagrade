import { bleuMathalea } from '../../lib/colors'
import { estentier } from '../../modules/outils'
import { tousDeMemeSigne } from '../outils/nombres'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from './PointAbstrait'
import { Polygone, polygone } from './polygones'
import { elimineBinomesXYIntermediairesAlignes } from './Polyquad'

/**
 * Trace l'aire entre la courbe d'une fonction et l'axe des abscisses
 * @param {function} f fonction dont on veut tracer l'aire entre sa courbe et l'axe des abscisses comme par exemple : const f = x => a * x ** 2 + b * x + c
 * @param {Object} parametres À saisir entre accolades
 * @param {Repere} [parametres.repere  = {}]  Repère dans lequel le tracé de la fonction se fait
 * @param {number} [parametres.xMin]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.xMax]  Abscisse maximale du tracé de la courbe
 * @param {number} [parametres.pas = 1]  Pas entre deux abscisses pour tracer l'aire
 * @param {boolean} [parametres.sup = false] Si true, l'aire est arrondie par le haut, sinon par le bas
 * @param {string} [parametres.colorPositif = 'red']  Couleur de l'aire positive
 * @param {string} [parametres.colorNegatif = bleuMathalea]  Couleur de l'aire négative
 * @example integraleComptable(g, {repere: r})
 * // Trace l'aire entre la courbe de la fonction g et l'axe des abscisses dans le repère r, tous deux précédemment définis.
 * @example integraleComptable(g, {repere: r, pas: 0.1, sup: true, colorPositif: 'green', colorNegatif: 'orange'})
 * // Trace l'aire entre la courbe de la fonction g et l'axe des abscisses dans le repère r, tous deux précédemment définis. L'aire est arrondie par le haut, le pas entre deux abscisses est de 0.1, l'aire positive est verte et l'aire négative est orange.
 * @author Jean-claude Lhote
 */
export class IntegraleComptable extends ObjetMathalea2D {
  aire: { negative: number; positive: number }
  constructor(
    f: (x: number) => number,
    {
      xMin,
      xMax,
      pas = 1,
      sup = false,
      colorPositif = 'red',
      colorNegatif = bleuMathalea,
    }: {
      xMin: number
      xMax: number
      pas?: number
      sup?: boolean
      colorPositif?: string
      colorNegatif?: string
    },
  ) {
    super()
    this.objets = []
    const rectangles: Polygone[] = []
    const echantillonnage: number[][] = []
    for (let k = 0; k < (xMax - xMin) / pas; k++) {
      echantillonnage[k] = []
      for (let j = 0; j < 5; j++) {
        const x = xMin + k * pas + (j * pas) / 5
        if (estentier(f(x) / pas, 0.05)) {
          echantillonnage[k].push(Math.round(f(x) / pas) * pas)
        } else {
          echantillonnage[k].push(
            sup ? Math.ceil(f(x) / pas) * pas : Math.floor(f(x) / pas) * pas,
          )
        }
      }
    }
    for (let k = 0; k < echantillonnage.length - 1; k++) {
      echantillonnage[k].push(echantillonnage[k + 1][0])
    }
    if (estentier(f(xMax) / pas, 0.05)) {
      echantillonnage[echantillonnage.length - 1].push(
        Math.round(f(xMax) / pas) * pas,
      )
    } else {
      echantillonnage[echantillonnage.length - 1].push(
        sup ? Math.ceil(f(xMax) / pas) * pas : Math.floor(f(xMax) / pas) * pas,
      )
    }

    for (let k = 0; k < echantillonnage.length; k++) {
      const xk = xMin + k * pas
      const yk = sup
        ? Math.max(...echantillonnage[k])
        : Math.min(...echantillonnage[k])
      if (tousDeMemeSigne(echantillonnage[k])) {
        const p = polygone(
          [
            pointAbstrait(xk, 0),
            pointAbstrait(xk, yk),
            pointAbstrait(xk + pas, yk),
            pointAbstrait(xk + pas, 0),
          ],
          yk > 0 ? colorPositif : colorNegatif,
        )
        p.couleurDeRemplissage = colorToLatexOrHTML(
          yk > 0 ? colorPositif : colorNegatif,
        )
        rectangles.push(p)
      } else {
        const couleur = sup ? colorPositif : colorNegatif
        const p = polygone(
          [
            pointAbstrait(xk, 0),
            pointAbstrait(xk, yk),
            pointAbstrait(xk + pas, yk),
            pointAbstrait(xk + pas, 0),
          ],
          couleur,
        )
        p.couleurDeRemplissage = colorToLatexOrHTML(couleur)
        rectangles.push(p)
      }
    }
    // On joint les rectangles adjacents de même couleur
    let color: string[] = []
    let sommetFinal: PointAbstrait = pointAbstrait(0, 0)
    while (rectangles.length > 0) {
      const sommets = [
        rectangles[0].listePoints[0],
        rectangles[0].listePoints[1],
        rectangles[0].listePoints[2],
      ]
      color = rectangles[0].color.slice()
      const pol = rectangles.shift()
      if (pol != null) {
        sommetFinal = pol.listePoints[3]
      }
      while (
        rectangles.length > 0 &&
        rectangles[0].couleurDeRemplissage[0] === color[0]
      ) {
        sommets.push(rectangles[0].listePoints[1], rectangles[0].listePoints[2])
        const pol = rectangles.shift()
        if (pol != null) {
          sommetFinal = pol.listePoints[3]
        }
      }
      // Il n'y a plus de rectangle, on ferme le polygone
      if (rectangles.length === 0) {
        sommets.push(sommetFinal)
        const binomesXY = elimineBinomesXYIntermediairesAlignes(sommets)
        const p = polygone(binomesXY.map((el) => pointAbstrait(el.x, el.y)))
        p.color =
          p.bordures[1] < 0 && p.bordures[3] === 0
            ? colorToLatexOrHTML(colorNegatif)
            : colorToLatexOrHTML(colorPositif)
        p.couleurDeRemplissage = p.color
        this.objets.push(p)
        break
      }
      // on a encore des rectangles, donc on change de couleur et on ferme le précédent polygone
      // s'il reste qu'un seul rectangle alors on le pousse dans la liste des objets
      sommets.push(sommetFinal)
      const binomesXY = elimineBinomesXYIntermediairesAlignes(sommets)
      const p = polygone(binomesXY.map((el) => pointAbstrait(el.x, el.y)))
      p.color =
        p.bordures[1] < 0 && p.bordures[3] === 0
          ? colorToLatexOrHTML(colorNegatif)
          : colorToLatexOrHTML(colorPositif)
      p.couleurDeRemplissage = p.color
      this.objets.push(p)
      if (rectangles.length === 1) {
        this.objets.push(rectangles[0])
        rectangles.length = 0
        break
      } // sinon on contine en initialisant le nouveau polygone au début de la boucle
    }

    const { xmin, xmax, ymin, ymax } = fixeBordures(this.objets, {
      rxmax: 0,
      rxmin: 0,
      rymax: 0,
      rymin: 0,
    })
    this.bordures = [xmin, xmax, ymin, ymax] as unknown as [
      number,
      number,
      number,
      number,
    ]
    this.aire = { negative: 0, positive: 0 }
    for (const objet of this.objets) {
      if (objet instanceof ObjetMathalea2D) {
        if (objet.bordures[1] < 0 && objet.bordures[3] === 0) {
          this.aire.negative += objet.aire
        } else {
          this.aire.positive += objet.aire
        }
      }
    }
  }
}
