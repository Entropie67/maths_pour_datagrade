import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait, type PointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Trouver une grandeur en fonction d'une autre"

export const interactifReady = true

export const dateDePublication = '03/01/2026'
export const dateDeModifImportante = '29/05/2026'

export const uuid = '5bc81'

export const refs = {
  'fr-fr': ['3AutoP04-4'],
  'fr-ch': ['PRQPF04C-3'],
}

/**
 * @author Jean-claude Lhote
 */
export default class HauteurValve extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsDeComparaison = { estDansIntervalle: true }
    this.optionsChampTexte = { texteApres: '$\\text{ cm}$' }
  }

  nouvelleVersion(): void {
    const rayonRoue = 45 // randint(5, 9) * 5
    const x = (teta: number) => rayonRoue * (teta - Math.sin(teta))
    const y = (teta: number) => rayonRoue * (1 - Math.cos(teta))
    const dist = randint(10, Math.floor((2 * Math.PI * rayonRoue) / 5)) * 5

    const dots: PointAbstrait[] = []
    for (let teta = 0; teta <= 2 * Math.PI; teta += Math.PI / 20) {
      const pt = pointAbstrait(x(teta) / 10, y(teta) / 10)
      dots.push(pt)
    }
    function tetaDistFinder(dist: number): number {
      let teta = 0
      while (x(teta) < dist) {
        teta += 0.003
      }
      return teta
    }
    const tetaDist = tetaDistFinder(dist)

    const rep = repere({
      xMin: 0,
      xMax: 300,
      yMin: 0,
      yMax: 100,
      xUnite: 0.1,
      yUnite: 0.1,
      yThickDistance: 10,
      yLabelDistance: 10,
      xThickDistance: 20,
      xLabelDistance: 20,
      grilleSecondaireY: true,
      grilleSecondaireYDistance: 0.5,
      grilleSecondaireX: true,
      grilleSecondaireXDistance: 0.5,
      xLegende: 'Distance parcourue (cm)',
      yLegende: 'Hauteur de la valve (cm)',
      yLegendePosition: [0.2, 10.5],
      xLegendePosition: [29, -0.5],
    })
    const cF = polyline(...dots)
    const objets: NestedObjetMathalea2dArray = [rep, cF]
    const graphique = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'inline-block', pixelsParCm: 20 } as const,
        fixeBordures(objets),
      ),
      objets,
    )
    const objetsCorr: NestedObjetMathalea2dArray = [...objets]
    const seg1 = segment(
      pointAbstrait(dist / 10, 0),
      pointAbstrait(dist / 10, y(tetaDist) / 10),
      'red',
    )
    seg1.epaisseur = 3
    const seg2 = segment(
      pointAbstrait(dist / 10, y(tetaDist) / 10),
      pointAbstrait(0, y(tetaDist) / 10),
      'red',
    )
    seg2.epaisseur = 3
    seg1.styleExtremites = '->'
    seg2.styleExtremites = '->'
    seg1.pointilles = 5
    seg2.pointilles = 5
    objetsCorr.push(seg1, seg2)
    const graphiqueCorr = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'inline-block', pixelsParCm: 20 } as const,
        fixeBordures(objetsCorr),
      ),
      objetsCorr,
    )
    this.question = `${graphique}<br><br>
    Sur le graphique ci-dessus, on a représenté la hauteur de la valve d'une roue de vélo en fonction de la distance parcourue en $\\text{cm}$ lors d'un tour complet.<br>`
    this.question += `Quelle est la hauteur de la valve lorsque la distance parcourue est de $${dist}\\text{ cm}$ ?`

    const valeursReponse = [
      texNombre(y(tetaDist) - 2, 0),
      texNombre(y(tetaDist) + 2, 0),
    ]
    this.reponse = `[${valeursReponse[0]}; ${valeursReponse[1]}]`
    this.correction =
      graphiqueCorr +
      `<br><br>Avec la précision du graphique, on peut estimer que la hauteur de la valve, lorsque la distance parcourue est de $${dist}\\text{ cm}$, est une valeur proche de $${miseEnEvidence(texNombre(y(tetaDist), 0))}\\text{ cm}$.`
  }
}
