import { fixeBordures } from '../../lib/2d/fixeBordures'
import { mathalea2d } from '../../modules/mathalea2d'
import Pyramide from '../../modules/pyramide'
import Exercice from '../Exercice'
export const titre = 'Générer des pyramides'

export const refs = {
  'fr-fr': ['P018'],
  'fr-ch': [],
}
export const uuid = '75f89'
/**
 * @author Jean-claude Lhote
 */
export default class Pyramides extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Type de pyramide',
      2,
      '1 : Pyramide additive\n 2 : Pyramide multiplicative',
    ]
    this.besoinFormulaire2Numerique = ['Valeur minimale de base', 10]
    this.besoinFormulaire3Numerique = ['Valeur maximale de base', 20]

    this.sup3 = 10
    this.sup2 = 1
    this.sup = 1
  }

  nouvelleVersion() {
    let operation: '*' | '+' = '+'
    const taille = this.sup === 1 ? 4 : 3

    switch (this.sup) {
      case 2:
        operation = '*'
        break
      case 1:
      default:
        operation = '+'
        break
    }
    let nbMin = this.sup2
    let nbMax = this.sup3
    if (nbMax < nbMin || isNaN(nbMax) || isNaN(nbMin)) {
      nbMax = 10
      nbMin = 1
    }
    for (let i = 0; i < this.nbQuestions; i++) {
      const Pyr = new Pyramide({
        operation,
        nombreEtages: taille,
        rangeData: [nbMin, nbMax],
        exclusions: [0],
        fractionOn: false,
      })
      Pyr.aleatoirise()
      const mesObjets = Pyr.representeMoi(0, 0)
      for (let y = taille; y > 0; y--) {
        for (let x = 0; x < y; x++) {
          Pyr.isVisible[y - 1][x] = true
        }
      }
      const mesObjetsCorr = Pyr.representeMoi(0, 0)
      // paramètres de la fenêtre Mathalea2d pour l'énoncé normal

      const paramsEnonce = Object.assign({}, fixeBordures(mesObjets), {
        pixelsParCm: 20,
        scale: 1,
        mainlevee: false,
      })
      const paramsCorrection = Object.assign({}, fixeBordures(mesObjetsCorr), {
        pixelsParCm: 20,
        scale: 1,
        mainlevee: false,
      })

      this.listeQuestions.push(mathalea2d(paramsEnonce, mesObjets))
      this.listeCorrections.push(mathalea2d(paramsCorrection, mesObjetsCorr))
    }
  }
}
