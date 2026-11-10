import { latex2d } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import Pyramide from '../../../modules/pyramide'
import ExerciceSimple from '../../ExerciceSimple'

import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
export const titre = 'Calculer dans une pyramide additive inverse'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '09/05/2022'
/**
 * @author  Jean-claude Lhote
 */
export const uuid = '7a19d'

export const refs = {
  'fr-fr': ['can6C7-04'],
  'fr-ch': [],
}
export default class PyramideAdd3EtagesBaseInconnue extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const pyr = new Pyramide({
      operation: '+',
      nombreEtages: 3,
      rangeData: [2, 5],
      exclusions: [0],
      fractionOn: false,
    })
    pyr.isVisible = [[true], [false, false], [false, true, true]]
    const objets = [
      ...pyr.representeMoi(0, 0),
      latex2d('?', 2, 0.75, { letterSize: 'large' }),
    ]
    this.question = `Chaque case contient la somme des deux cases sur lesquelles elle repose. Quel est le nombre qui manque à la base de la pyramide ?<br>
    ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objets)), ...objets)}`
    this.reponse = pyr.valeurs[2][0]
    pyr.isVisible = [[true], [true, true], [true, true, true]]
    const objetsCorrection = [...pyr.representeMoi(0, 0)]
    this.correction = `Le nombre qui manque à la base de la pyramide est : $${miseEnEvidence(this.reponse)}$.<br>
     ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objetsCorrection)), ...objetsCorrection)}`
  }
}
