import { latex2d } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import Pyramide from '../../../modules/pyramide'
import ExerciceSimple from '../../ExerciceSimple'

import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
export const titre =
  'Calculer dans une pyramide additive inverse de nombres relatifs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '28/03/2026'
/**
 * @author  Jean-claude Lhote
 */
export const uuid = '7a19e'

export const refs = {
  'fr-fr': ['can5C5-06', '5N2I-flash4'],
  'fr-ch': ['NR'],
}
export default class PyramideAdd3EtagesBaseInconnue extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const pyr = new Pyramide({
      operation: '+',
      nombreEtages: 3,
      rangeData: [-10, 10],
      exclusions: [0],
      fractionOn: false,
    })
    pyr.isVisible = [[true], [false, false], [false, true, true]]
    const objets = pyr.representeMoi(0, 0)
    this.question = `Chaque case contient la somme des deux cases sur lesquelles elle repose. Quel est le nombre qui manque à la base de la pyramide ?<br>
    ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objets)), [...objets, latex2d('?', 2, 0.75, { letterSize: 'large' })])}`
    this.reponse = pyr.valeurs[2][0]
    pyr.isVisible = [[true], [true, true], [true, true, true]]
    const objetsCorr = pyr.representeMoi(0, 0)
    this.correction = `Le nombre qui manque à la base de la pyramide est : $${miseEnEvidence(this.reponse)}$.<br>
     ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objetsCorr)), objetsCorr)}`
  }
}
