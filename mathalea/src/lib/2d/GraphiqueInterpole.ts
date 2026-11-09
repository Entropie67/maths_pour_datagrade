import { Courbe, courbe } from './Courbe'
import type { IRepere } from './Interfaces'
import { cosineInterpolate } from './InterpolationCosinusoidale'
import { ObjetMathalea2D } from './ObjetMathalea2D'

export class GraphiqueInterpole extends ObjetMathalea2D {
  courbes: Courbe[]
  constructor(
    tableau: number[][],
    {
      color = 'black',
      epaisseur = 1,
      repere, // repère par défaut : le laisser...
      step = 0.2,
    }: {
      color?: string
      epaisseur?: number
      repere: IRepere
      step?: number
    },
  ) {
    super()
    this.courbes = []
    const xmin = repere?.xMin ?? tableau[0][0]
    const xmax = repere?.xMax ?? tableau[tableau.length - 1][0]
    const ymin = repere?.yMin ?? Math.min(...tableau.map((el) => el[0]))
    const ymax = repere?.yMax ?? Math.max(...tableau.map((el) => el[1]))
    for (let i = 0; i < tableau.length - 1; i++) {
      const x0 = tableau[i][0]
      const y0 = tableau[i][1]
      const x1 = tableau[i + 1][0]
      const y1 = tableau[i + 1][1]
      const f = (x: number) => cosineInterpolate(y0, y1, (x - x0) / (x1 - x0))
      let depart, fin
      xmin > x0 ? (depart = xmin) : (depart = x0)
      xmax < x1 ? (fin = xmax) : (fin = x1)
      // Le pas est ajusté pour que le dernier point calculé soit exactement
      // à la fin du morceau (sinon les extremums locaux ne sont pas atteints).
      const nbPas = Math.max(1, Math.ceil((fin - depart) / step - 1e-9))
      const pas = fin > depart ? (fin - depart) / nbPas : step
      const c = courbe(f, {
        repere,
        step: pas,
        xMin: depart,
        xMax: fin,
        color,
        epaisseur,
        xUnite: repere.xUnite ?? 1,
        yUnite: repere.yUnite ?? 1,
        yMin: ymin,
        yMax: ymax,
      })
      this.courbes.push(c)
    }
    this.bordures = repere?.bordures as unknown as [
      number,
      number,
      number,
      number,
    ]
  }

  svg(coeff: number) {
    let code = ''
    for (const objet of this.courbes) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    for (const objet of this.courbes) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}
/**
 *
 *
 * @author Rémi Angot
 */

export function graphiqueInterpole(
  tableau: number[][],
  {
    color = 'black',
    epaisseur = 1,
    repere, // repère par défaut : le laisser...
    step = 0.2,
  }: {
    color?: string
    epaisseur?: number
    repere: IRepere
    step?: number
  },
) {
  return new GraphiqueInterpole(tableau, { color, epaisseur, repere, step })
}
