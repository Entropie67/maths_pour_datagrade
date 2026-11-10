import { latex2d } from '../../../lib/2d/textes'
import Pyramide from '../../../modules/pyramide'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer dans une pyramide additive'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '09/05/2022'
/**
 * @author  Jean-claude Lhote
 */
export const uuid = '109ae'

export const refs = {
  'fr-fr': ['can6C7-02'],
  'fr-ch': ['PR-14'],
}
export default class Pyramide3Etages extends ExerciceSimple {
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
      rangeData: [3, 10],
      exclusions: [0],
      fractionOn: false,
    })
    pyr.isVisible = [[false], [false, false], [true, true, true]]
    const objets = [
      ...pyr.representeMoi(0, 0),
      latex2d('?', 6, 3.75, { letterSize: 'large' }),
    ]
    this.question = `Chaque case contient la somme des deux cases sur lesquelles elle repose. Quel est le nombre qui correspond au sommet de la pyramide ?<br>
    ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objets)), ...objets)}`
    this.reponse = pyr.valeurs[0][0]
    pyr.isVisible = [[true], [true, true], [true, true, true]]
    const objetsCorrection = [...pyr.representeMoi(0, 0)]
    this.correction = `Le nombre qui se trouve au sommet de la pyramide est : $${miseEnEvidence(this.reponse)}$.<br>
    ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objetsCorrection)), ...objetsCorrection)}`
  }
}
