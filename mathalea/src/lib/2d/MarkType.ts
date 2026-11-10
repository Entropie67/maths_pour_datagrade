import { arc } from './Arc'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'
import { homothetie } from './transformations'
import { angleOriente } from './utilitairesGeometriques'
import { pointSurSegment } from './utilitairesPoint'

export type MarkType =
  | 'simple'
  | 'double'
  | 'triple'
  | 'gras'
  | 'double-gras'
  | 'gras-simple-gras'
  | 'simple-gras-simple'
  | 'pointilles'
  | 'double-pointilles'
  | 'mixte-simple-pointilles'
  | 'mixte-gras-pointilles'
export const markTypeArray: MarkType[] = [
  'simple',
  'double',
  'triple',
  'gras',
  'double-gras',
  'gras-simple-gras',
  'simple-gras-simple',
  'pointilles',
  'double-pointilles',
  'mixte-simple-pointilles',
  'mixte-gras-pointilles',
]
export class MarqueAngle extends ObjetMathalea2D {
  constructor(
    start: PointAbstrait,
    sommet: PointAbstrait,
    end: PointAbstrait,
    {
      mark = 'simple',
      color = 'black',
      rayon = 1,
    }: {
      mark: MarkType
      color?: string
      rayon?: number
    },
  ) {
    super()
    this.objets = []
    const a = pointSurSegment(sommet, start, rayon)
    const angle = angleOriente(start, sommet, end)
    switch (mark) {
      case 'double':
        {
          const aPrime = homothetie(a, sommet, 0.9)
          const aSeconde = homothetie(a, sommet, 1.1)
          this.objets.push(
            arc(aPrime, sommet, angle, false, 'none', color),
            arc(aSeconde, sommet, angle, false, 'none', color),
          )
        }
        break
      case 'triple':
        {
          const aPrime = homothetie(a, sommet, 0.9)
          const aSeconde = homothetie(a, sommet, 1.1)
          this.objets.push(
            arc(aPrime, sommet, angle, false, 'none', color),
            arc(a, sommet, angle, false, 'none', color),
            arc(aSeconde, sommet, angle, false, 'none', color),
          )
        }
        break
      case 'gras':
        {
          const marqueGrasse = arc(a, sommet, angle, false, 'none', color)
          marqueGrasse.epaisseur = 4
          this.objets.push(marqueGrasse)
        }
        break
      case 'double-gras':
        {
          const aPrime = homothetie(a, sommet, 0.9)
          const aSeconde = homothetie(a, sommet, 1.1)
          const marqueGrasse1 = arc(aPrime, sommet, angle, false, 'none', color)
          const marqueGrasse2 = arc(
            aSeconde,
            sommet,
            angle,
            false,
            'none',
            color,
          )
          marqueGrasse1.epaisseur = 2
          marqueGrasse2.epaisseur = 2
          this.objets.push(marqueGrasse1, marqueGrasse2)
        }
        break
      case 'gras-simple-gras':
        {
          const aPrime = homothetie(a, sommet, 0.85)
          const aSeconde = homothetie(a, sommet, 1.15)
          const marqueGrasse1 = arc(aPrime, sommet, angle, false, 'none', color)
          const marqueGrasse2 = arc(
            aSeconde,
            sommet,
            angle,
            false,
            'none',
            color,
          )
          marqueGrasse1.epaisseur = 2
          marqueGrasse2.epaisseur = 2
          this.objets.push(
            marqueGrasse1,
            arc(a, sommet, angle, false, 'none', color),
            marqueGrasse2,
          )
        }
        break
      case 'simple-gras-simple':
        {
          const aPrime = homothetie(a, sommet, 0.85)
          const aSeconde = homothetie(a, sommet, 1.15)
          const marqueGrasse = arc(a, sommet, angle, false, 'none', color)
          const marqueSimple1 = arc(aPrime, sommet, angle, false, 'none', color)
          const marqueSimple2 = arc(
            aSeconde,
            sommet,
            angle,
            false,
            'none',
            color,
          )
          marqueGrasse.epaisseur = 2
          this.objets.push(marqueSimple1, marqueGrasse, marqueSimple2)
        }
        break
      case 'pointilles':
        {
          const marque = arc(a, sommet, angle, false, 'none', color)
          marque.pointilles = 3
          marque.epaisseur = 2
          this.objets.push(marque)
        }
        break
      case 'double-pointilles':
        {
          const aPrime = homothetie(a, sommet, 1)
          const aSeconde = homothetie(a, sommet, 1.1)
          const marque1 = arc(aPrime, sommet, angle, false, 'none', color)
          const marque2 = arc(aSeconde, sommet, angle, false, 'none', color)
          marque1.pointilles = 5
          marque2.pointilles = 5
          this.objets.push(marque1, marque2)
        }
        break
      case 'mixte-simple-pointilles':
        {
          const aPrime = homothetie(a, sommet, 0.9)
          const aSeconde = homothetie(a, sommet, 1.1)
          const marque = arc(aSeconde, sommet, angle, false, 'none', color)
          const marque1 = arc(aPrime, sommet, angle, false, 'none', color)
          marque1.pointilles = 3
          marque1.epaisseur = 2
          marque.epaisseur = 2
          this.objets.push(marque, marque1)
        }
        break
      case 'mixte-gras-pointilles':
        {
          const aPrime = homothetie(a, sommet, 0.9)
          const aSeconde = homothetie(a, sommet, 1.1)
          const marque1 = arc(aSeconde, sommet, angle, false, 'none', color)
          const marque = arc(aPrime, sommet, angle, false, 'none', color)
          marque1.pointilles = 3
          marque.epaisseur = 2
          this.objets.push(marque, marque1)
        }
        break
      case 'simple':
      default:
        {
          const marque = arc(a, sommet, angle, false, 'none', color)
          marque.epaisseur = 2
          this.objets.push(marque)
        }
        break
    }
    const bordures = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
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
      code += `\t${objet.tikz()}`
    }
    return code
  }
}

export function marqueAngle(
  start: PointAbstrait,
  sommet: PointAbstrait,
  end: PointAbstrait,
  {
    mark = 'simple',
    color = 'black',
    rayon = 1,
  }: {
    mark: MarkType
    color?: string
    rayon?: number
  },
) {
  return new MarqueAngle(start, sommet, end, { mark, color, rayon })
}
